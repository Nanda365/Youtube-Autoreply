print("Running latest version of main.py")
from fastapi import FastAPI, Request, Response, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import RedirectResponse, JSONResponse
from dotenv import load_dotenv
import os
from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional
from enum import Enum
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from database import db
from bson import ObjectId
import json
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import google.auth.transport.requests
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from fastapi.concurrency import run_in_threadpool
import asyncio

# Background auto-reply task and startup event are defined later after `app` is created.


import google.generativeai as genai
from google.oauth2 import id_token

# Load environment variables
load_dotenv()
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Environment variables
SESSION_SECRET = os.getenv("SESSION_SECRET")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not all([SESSION_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_API_KEY]):
    raise Exception("Missing required environment variables")

genai.configure(api_key=GOOGLE_API_KEY)

# --- App Initialization ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080", "http://[::1]:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET)

# --- Google OAuth Config ---
SCOPES = [
    "https://www.googleapis.com/auth/youtube.force-ssl",
    "openid",  # OpenID scope
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]
REDIRECT_URI = "http://localhost:8000/auth/google/callback"

client_config = {
    "web": {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [REDIRECT_URI],
        "javascript_origins": ["http://localhost:8080"]
    }
}

# --- Background Task ---
async def auto_reply_task():
    while True:
        print("Running auto-reply background task...")
        all_existing_comments = await db.comments.find().to_list(length=None)
        print(f"DEBUG: All existing comments in DB before processing: {len(all_existing_comments)} documents. Sample: {all_existing_comments[:2]}")

        users = await db.users.find().to_list(length=None)
        if not users:
            print("No users found to process in auto-reply task.")
        for user in users:
            user_id = str(user["_id"])
            print(f"Processing user: {user['email']} (ID: {user_id})")
            creds_json = user.get("google_credentials")
            if not creds_json:
                print(f"User {user['email']} has no Google credentials.")
                continue

            try:
                credentials = Credentials.from_authorized_user_info(info=creds_json)
                youtube = build("youtube", "v3", credentials=credentials)

                print(f"Fetching channel info for user {user['email']}")
                channel_request = youtube.channels().list(part="contentDetails,snippet", mine=True)
                channel_response = await run_in_threadpool(channel_request.execute)
                print(f"Finished fetching channel info for user {user['email']}. Response items: {len(channel_response.get('items', []))}")

                if not channel_response.get("items"):
                    print(f"No channel found for user {user['email']}")
                    continue

                channel_id = channel_response["items"][0]["id"]
                channel_name = channel_response["items"][0]["snippet"]["title"]
                uploads_playlist_id = channel_response["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
                print(f"Channel ID: {channel_id}, Channel Name: {channel_name}, Uploads Playlist ID: {uploads_playlist_id}")

                print(f"Fetching videos for uploads playlist {uploads_playlist_id}")
                videos = []
                next_page_token = None
                while True:
                    playlist_request = youtube.playlistItems().list(
                        part="contentDetails,snippet",
                        playlistId=uploads_playlist_id,
                        maxResults=50,
                        pageToken=next_page_token
                    )
                    playlist_response = await run_in_threadpool(playlist_request.execute)
                    print(f"Fetched {len(playlist_response.get('items', []))} videos. Next page token: {next_page_token}")
                    videos.extend(playlist_response.get("items", []))
                    next_page_token = playlist_response.get("nextPageToken")
                    if not next_page_token:
                        break
                print(f"Finished fetching {len(videos)} videos in total.")

                print(f"Finished fetching {len(videos)} videos in total. Starting to process comments for each video.")
                for video in videos:
                    video_id = video["contentDetails"]["videoId"]
                    video_title = video["snippet"]["title"]
                    print(f"Processing video: {video_title} (ID: {video_id})")

                    comment_threads_request = youtube.commentThreads().list(
                        part="snippet,replies",
                        videoId=video_id,
                        maxResults=10
                    )
                    comment_threads_response = await run_in_threadpool(comment_threads_request.execute)
                    print(f"Fetched {len(comment_threads_response.get('items', []))} comment threads for video {video_id}.")
                    
                    if not comment_threads_response.get("items"):
                        print(f"No comment threads found for video {video_id}.")
                        continue

                    for item in comment_threads_response.get("items", []):
                        print(f"DEBUG: Processing item: {item}")
                        try:
                            top_level_comment = item["snippet"]["topLevelComment"]
                            comment_id = top_level_comment["id"]
                            print(f"Processing comment ID: {comment_id} for video: {video_id}")
                            
                            comment_text = top_level_comment["snippet"]["textDisplay"]
                            author_name = top_level_comment["snippet"]["authorDisplayName"]
                            author_avatar = top_level_comment["snippet"].get("authorProfileImageUrl")
                            published_at_str = top_level_comment["snippet"]["publishedAt"]
                            published_at = datetime.fromisoformat(published_at_str.replace('Z', '+00:00'))
                            like_count = top_level_comment["snippet"]["likeCount"]

                            has_replies_from_youtube = item["snippet"]["totalReplyCount"] > 0
                            is_self_comment = top_level_comment["snippet"].get("authorChannelId", {}).get("value") == channel_id

                            top_level_comment = item["snippet"]["topLevelComment"]
                            comment_id = top_level_comment["id"]
                            print(f"Processing comment ID: {comment_id} for video: {video_id}")
                            
                            comment_text = top_level_comment["snippet"]["textDisplay"]
                            author_name = top_level_comment["snippet"]["authorDisplayName"]
                            author_avatar = top_level_comment["snippet"].get("authorProfileImageUrl")
                            published_at_str = top_level_comment["snippet"]["publishedAt"]
                            published_at = datetime.fromisoformat(published_at_str.replace('Z', '+00:00'))
                            like_count = top_level_comment["snippet"]["likeCount"]

                            has_replies_from_youtube = item["snippet"]["totalReplyCount"] > 0
                            is_self_comment = top_level_comment["snippet"].get("authorChannelId", {}).get("value") == channel_id

                            if is_self_comment:
                                print(f"Skipping self-comment {comment_id} for video {video_id}.")
                                continue

                            # Define the filter for the upsert operation
                            filter_query = {
                                "_id": comment_id,
                                "user_id": user_id,
                                "channel_id": channel_id,
                            }

                            # Fetch existing document to determine current status and whether an AI reply already exists
                            existing_comment_doc = await db.comments.find_one(filter_query)

                            # Determine initial status for new comments or status to update
                            initial_status_for_new = CommentStatus.REPLIED if has_replies_from_youtube else CommentStatus.PENDING
                            
                            # Prepare fields for the $set operation in upsert
                            set_fields = {
                                "video_id": video_id,
                                "video_title": video_title,
                                "author_name": author_name,
                                "author_avatar": author_avatar,
                                "text": comment_text,
                                "published_at": published_at,
                                "like_count": like_count,
                            }
                            
                            # Logic for status and replied_at
                            current_db_status = existing_comment_doc["status"] if existing_comment_doc else None
                            
                            # If existing, and was PENDING, but now has YouTube replies -> update to REPLIED
                            if current_db_status == CommentStatus.PENDING.value and has_replies_from_youtube:
                                set_fields["status"] = CommentStatus.REPLIED.value
                                set_fields["replied_at"] = datetime.utcnow()
                                print(f"Comment {comment_id} for user {user_id} was manually replied to on YouTube. Setting status to REPLIED.")
                            elif current_db_status is None: # Newly inserted comment
                                set_fields["status"] = initial_status_for_new.value
                                if initial_status_for_new == CommentStatus.REPLIED:
                                    set_fields["replied_at"] = datetime.utcnow()
                                print(f"New comment {comment_id} for user {user_id}. Initial status: {set_fields['status']}.")
                            else: # Keep existing status for other cases (e.g., already REPLIED by AI, FAILED, or still PENDING without YouTube replies)
                                set_fields["status"] = current_db_status

                            # Perform the upsert operation
                            update_result = await db.comments.update_one(
                                filter_query,
                                {"$set": set_fields},
                                upsert=True
                            )
                            
                            # If a new document was actually inserted (upserted) and it's pending, trigger AI reply
                            # Or if an existing document's status changed to PENDING (shouldn't happen with current logic, but for robustness)
                            if update_result.upserted_id or (existing_comment_doc and set_fields["status"] == CommentStatus.PENDING.value and current_db_status != CommentStatus.PENDING.value):
                                print(f"Comment {comment_id} was {'inserted' if update_result.upserted_id else 'updated'} to {set_fields['status']} status.")
                                
                                # Only attempt AI reply if the comment is now PENDING and has no replies from YouTube
                                if set_fields["status"] == CommentStatus.PENDING.value and not has_replies_from_youtube:
                                    comment_status_to_update = CommentStatus.FAILED
                                    try:
                                        ai_response = await ai_generate_reply(AIRequest(comment_text=comment_text))
                                        reply_text = ai_response.get("reply", "Thanks for your comment!")

                                        reply_request_body = {
                                            "snippet": {
                                                "parentId": comment_id,
                                                "textOriginal": reply_text
                                            }
                                        }
                                        reply_insert_request = youtube.comments().insert(part="snippet", body=reply_request_body)
                                        await run_in_threadpool(reply_insert_request.execute)
                                        
                                        comment_status_to_update = CommentStatus.REPLIED
                                        print(f"Attempting to update comment {comment_id} to status: {comment_status_to_update.value}")
                                        update_result = await db.comments.update_one(
                                            filter_query,
                                            {"$set": {"status": comment_status_to_update.value, "ai_reply": reply_text, "replied_at": datetime.utcnow()}}
                                        )
                                        print(f"Update result for replied comment {comment_id}: Matched={update_result.matched_count}, Modified={update_result.modified_count}")

                                    except Exception as e:
                                        print(f"Failed to reply to comment {comment_id}: {e}")
                                        print(f"Attempting to update comment {comment_id} to status: {CommentStatus.FAILED.value}")
                                        update_result = await db.comments.update_one(
                                            filter_query,
                                            {"$set": {"status": CommentStatus.FAILED.value}}
                                        )
                                        print(f"Update result for failed comment {comment_id}: Matched={update_result.matched_count}, Modified={update_result.modified_count}")
                            else:
                                print(f"Comment {comment_id} already exists with status {set_fields['status']} and no action needed.")
                        except Exception as e:
                            print(f"An error occurred while processing comment item in video {video_id}: {e}") # Removed comment_id from print as it might not be available
                            continue

            except HttpError as e:
                print(f"HttpError for user {user['email']}: {e}")
            except Exception as e:
                print(f"An error occurred for user {user['email']}: {e}")

        await asyncio.sleep(10)

@app.on_event("startup")
async def startup_event():
    # Create MongoDB indexes for performance
    print("Creating MongoDB indexes...")
    await db.comments.create_index([("user_id", 1), ("channel_id", 1), ("status", 1)], name="user_channel_status_idx")
    await db.comments.create_index([("user_id", 1), ("channel_id", 1), ("published_at", 1), ("status", 1)], name="user_channel_published_status_idx")
    print("MongoDB indexes created.")

    asyncio.create_task(auto_reply_task())



# --- Pydantic Models ---

class ReplyRequest(BaseModel):
    commentId: str
    replyText: str

class RateRequest(BaseModel):
    commentId: str
    rating: Literal['like', 'none', 'dislike']

class AIRequest(BaseModel):
    comment_text: str

class DeleteRequest(BaseModel):
    commentId: str

class CommentStatus(str, Enum):
    PENDING = "pending"
    REPLIED = "replied"
    FAILED = "failed"

class Comment(BaseModel):
    _id: str
    user_id: str
    channel_id: str
    video_id: str
    video_title: Optional[str] = None
    author_name: str
    author_avatar: Optional[str] = None
    text: str
    published_at: datetime
    like_count: int = 0
    status: CommentStatus = CommentStatus.PENDING
    ai_reply: Optional[str] = None
    replied_at: Optional[datetime] = None



# --- Helper Dependencies ---
async def get_current_user_db(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

async def get_current_user_credentials(user: dict = Depends(get_current_user_db)):
    creds_json = user.get("google_credentials")
    if not creds_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="YouTube account not connected. Please connect your account in settings."
        )
    return Credentials.from_authorized_user_info(info=creds_json)

async def get_current_channel_id(credentials: Credentials = Depends(get_current_user_credentials)):
    try:
        def fetch_channel_id():
            youtube = build("youtube", "v3", credentials=credentials)
            channel_request = youtube.channels().list(part="id", mine=True)
            channel_response = channel_request.execute()
            if channel_response.get("items"):
                return channel_response["items"][0]["id"]
            return None
        
        channel_id = await run_in_threadpool(fetch_channel_id)
        if not channel_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="YouTube channel ID not found for the authenticated user."
            )
        return channel_id
    except HttpError as e:
        try:
            error_details = json.loads(e.content.decode('utf-8'))['error']
        except Exception:
            error_details = {"message": str(e)}
        print(f"Google API HttpError (get_current_channel_id): status={getattr(e.resp, 'status', 'unknown')} details={error_details}")
        raise HTTPException(status_code=getattr(e.resp, 'status', 500), detail=f"Google API Error: {error_details.get('message')}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch channel ID: {e}")


# --- Core Endpoints ---
@app.get("/")
async def read_root():
    return {"message": "Welcome to the CommentFlow AI Backend!"}

# --- Manual Auth Endpoints ---
@app.post("/logout")
async def logout_user(request: Request):
    request.session.clear()
    return {"message": "Logout successful"}

@app.get("/me")
async def get_me(user: dict = Depends(get_current_user_db), credentials: Credentials = Depends(get_current_user_credentials)):
    channel_name = None
    channel_picture = None

    if credentials:
        try:
            def get_channel_info():
                youtube = build("youtube", "v3", credentials=credentials)
                channel_request = youtube.channels().list(part="snippet", mine=True)
                channel_response = channel_request.execute()
                if channel_response.get("items"):
                    snippet = channel_response["items"][0]["snippet"]
                    return {
                        "name": snippet.get("title"),
                        "picture": snippet.get("thumbnails", {}).get("default", {}).get("url")
                    }
                return None
            
            channel_info = await run_in_threadpool(get_channel_info)
            if channel_info:
                channel_name = channel_info["name"]
                channel_picture = channel_info["picture"]

        except HttpError as e:
            print(f"Error fetching channel info for user {user['email']}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred while fetching channel info: {e}")

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "is_google_connected": True,
        "name": channel_name,
        "picture": channel_picture
    }

# --- Google OAuth Endpoints ---
@app.get("/auth/google")
async def google_auth_redirect(request: Request):
    flow = Flow.from_client_config(client_config, scopes=SCOPES, redirect_uri=REDIRECT_URI)
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    request.session['oauth_state'] = state
    return RedirectResponse(authorization_url)

@app.get("/auth/google/callback")
async def google_callback(request: Request, state: str, code: str, error: str | None = None):
    session_state = request.session.get('oauth_state')
    if error or not state or state != session_state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state or session during auth callback")

    flow = Flow.from_client_config(client_config, scopes=SCOPES, redirect_uri=REDIRECT_URI)
    
    try:
        flow.fetch_token(code=code)
        credentials = flow.credentials
        id_info = id_token.verify_oauth2_token(
            credentials.id_token, google.auth.transport.requests.Request(), GOOGLE_CLIENT_ID
        )

        email = id_info.get("email")
        if not email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not found in token")

        user = await db.users.find_one({"email": email})
        if not user:
            # Create a new user
            new_user = {
                "email": email,
                "google_credentials": json.loads(credentials.to_json())
            }
            result = await db.users.insert_one(new_user)
            user_id = result.inserted_id
        else:
            # Update existing user's credentials
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"google_credentials": json.loads(credentials.to_json())}}
            )
            user_id = user["_id"]

        request.session["user_id"] = str(user_id)
        
        # Cleanup session
        request.session.pop('oauth_state', None)
        
        return RedirectResponse(url="http://localhost:8080/dashboard")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to process auth callback: {e}")

@app.get("/youtube/videos")
async def get_youtube_videos(
    credentials: Credentials = Depends(get_current_user_credentials),
    max_results: int = 10 # Default to 10 videos for dashboard
):
    try:
        def get_videos():
            youtube = build("youtube", "v3", credentials=credentials)
            
            # Get the user's channel
            channel_request = youtube.channels().list(part="contentDetails", mine=True)
            channel_response = channel_request.execute()
            
            if not channel_response.get("items"):
                raise HTTPException(status_code=404, detail="YouTube channel not found.")
                
            uploads_playlist_id = channel_response["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
            
            videos = []
            
            # Fetch only the first batch of videos, up to the requested max_results,
            # respecting YouTube API's maxResults limit of 50.
            playlist_request = youtube.playlistItems().list(
                part="snippet,contentDetails",
                playlistId=uploads_playlist_id,
                maxResults=min(50, max_results),
            )
            playlist_response = playlist_request.execute()
            
            videos.extend(playlist_response.get("items", []))
            
            return {"items": videos}

        response = await run_in_threadpool(get_videos)
        return response
    except HttpError as e:
        try:
            error_details = json.loads(e.content.decode('utf-8'))['error']
        except Exception:
            error_details = {"message": str(e)}
        print(f"Google API HttpError (videos): status={getattr(e.resp, 'status', 'unknown')} details={error_details}")
        raise HTTPException(status_code=getattr(e.resp, 'status', 500), detail=f"Google API Error: {error_details.get('message')}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

# --- YouTube Data Endpoints ---
@app.get("/youtube/comments/{video_id}")
async def get_youtube_comments(video_id: str, credentials: Credentials = Depends(get_current_user_credentials)):
    try:
        def get_comments():
            youtube = build("youtube", "v3", credentials=credentials)
            request = youtube.commentThreads().list(part="snippet,replies", videoId=video_id, maxResults=100)
            return request.execute()
        response = await run_in_threadpool(get_comments)
        return response
    except HttpError as e:
        try:
            error_details = json.loads(e.content.decode('utf-8'))['error']
        except Exception:
            error_details = {"message": str(e), "errors": []}

        print(f"Google API HttpError (comments): status={getattr(e.resp, 'status', 'unknown')} details={error_details}")

        # If comments are disabled for the video, return an explicit, non-error response
        errors_list = error_details.get('errors', []) if isinstance(error_details.get('errors', []), list) else []
        reasons = [err.get('reason') for err in errors_list if isinstance(err, dict) and 'reason' in err]
        if 'commentsDisabled' in reasons:
            return {"items": [], "commentsDisabled": True}

        raise HTTPException(status_code=getattr(e.resp, 'status', 500), detail=f"Google API Error: {error_details.get('message')}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.post("/youtube/comments/reply")
async def reply_to_youtube_comment(request: ReplyRequest, credentials: Credentials = Depends(get_current_user_credentials)):
    try:
        def post_reply():
            youtube = build("youtube", "v3", credentials=credentials)
            youtube_request = youtube.comments().insert(
                part="snippet",
                body={"snippet": {"parentId": request.commentId, "textOriginal": request.replyText}}
            )
            return youtube_request.execute()
        response = await run_in_threadpool(post_reply)
        return response
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to post reply: {e}")


@app.post("/youtube/comments/delete")
async def delete_youtube_comment(request: DeleteRequest, credentials: Credentials = Depends(get_current_user_credentials)):
    try:
        def do_delete():
            youtube = build("youtube", "v3", credentials=credentials)
            youtube.comments().delete(id=request.commentId).execute()
            return {"status": "deleted", "commentId": request.commentId}

        response = await run_in_threadpool(do_delete)
        return response
    except HttpError as e:
        try:
            error_details = json.loads(e.content.decode('utf-8'))['error']
        except Exception:
            error_details = {"message": str(e)}
        print(f"Google API HttpError (delete): status={getattr(e.resp, 'status', 'unknown')} details={error_details}")
        raise HTTPException(status_code=getattr(e.resp, 'status', 500), detail=f"Google API Error: {error_details.get('message')}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete comment: {e}")


@app.post("/ai/generate-reply")
async def ai_generate_reply(request: AIRequest):
    # Try a list of models (prefer flash/latest variants which are commonly available).
    candidates = [
        'models/gemini-flash-latest',
        'models/gemini-2.5-flash',
        'models/gemini-2.5-pro',
        'models/gemini-pro-latest',
    ]

    prompt = f"""
    As a friendly and appreciative YouTube creator, please generate a short and engaging reply to the following comment.
    Your reply should be based on the content and sentiment of the comment.

    **IMPORTANT INSTRUCTIONS:**
    1.  IMPORTANT: First, detect the language of the comment (e.g., English, Telugu, Hindi). Your reply MUST be in the same language as the comment.
    2.  **No Commitments:** Do NOT make any promises or commitments about future videos or content. If a user asks about the next video, give a friendly, non-committal answer like "I'm working on it, stay tuned!" or "Thanks for the suggestion, I'll keep it in mind!".

    Comment: "{request.comment_text}"

    - If the comment is positive (e.g., "Great video!", "I learned so much"), express gratitude and acknowledge the compliment.
    - If the comment is a question, provide a helpful and concise answer, but without making promises.
    - If the comment is negative or critical, respond politely and professionally.
    - Keep the reply authentic and avoid generic phrases.

    Generate the reply text only.
    """

    last_exc = None
    for model_name in candidates:
        try:
            model = genai.GenerativeModel(model_name)
            response = await run_in_threadpool(model.generate_content, prompt)
            # response typically exposes `.text` on success
            reply_text = getattr(response, 'text', None)
            if not reply_text:
                # try common response shapes
                if hasattr(response, 'candidates') and response.candidates:
                    try:
                        reply_text = response.candidates[0].get('content') or response.candidates[0].get('text')
                    except Exception:
                        reply_text = str(response)
                else:
                    reply_text = str(response)

            print(f"AI generated reply using model {model_name}")
            return {"reply": reply_text.strip(), "model": model_name}
        except Exception as e:
            # keep last exception for reporting and try next model
            last_exc = e
            print(f"Model {model_name} failed: {e}")

    # If we get here, none of the candidates worked
    raise HTTPException(status_code=500, detail=f"AI generation failed: {last_exc}")

@app.post("/youtube/comments/rate")
async def rate_youtube_comment(request: RateRequest, credentials: Credentials = Depends(get_current_user_credentials)):
    try:
        def do_rate():
            youtube = build("youtube", "v3", credentials=credentials)
            youtube.comments().rate(id=request.commentId, rating=request.rating).execute()
            # The rate call does not return a body, so we return our own success message
            return {"status": "success", "commentId": request.commentId, "rating": request.rating}
        
        response = await run_in_threadpool(do_rate)
        return response
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to rate comment: {e}")


@app.get("/youtube/video-stats/{video_id}")
async def get_video_stats(video_id: str, credentials: Credentials = Depends(get_current_user_credentials)):
    try:
        def fetch_stats():
            youtube = build("youtube", "v3", credentials=credentials)
            request = youtube.videos().list(part="statistics,snippet", id=video_id)
            return request.execute()

        response = await run_in_threadpool(fetch_stats)
        items = response.get("items", [])
        if not items:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")

        stats = items[0].get("statistics", {})
        # Application-level metrics (replied/pending/failed) are app-specific; return placeholders
        total_comments = int(stats.get("commentCount", 0))

        result = {
            "totalComments": total_comments,
            "repliedComments": 0,
            "pendingComments": total_comments,
            "failedReplies": 0,
            "successRate": 0,
        }
        return result
    except HttpError as e:
        try:
            error_details = json.loads(e.content.decode("utf-8"))["error"]
        except Exception:
            error_details = {"message": str(e)}
        print(f"Google API HttpError (video-stats): status={getattr(e.resp, 'status', 'unknown')} details={error_details}")
        raise HTTPException(status_code=getattr(e.resp, 'status', 500), detail=f"Google API Error: {error_details.get('message')}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


@app.get("/youtube/stats")
async def get_youtube_stats(
    user: dict = Depends(get_current_user_db),
    channel_id: str = Depends(get_current_channel_id)
):
    try:
        user_id = str(user["_id"])

        total_comments = await db.comments.count_documents(
            {"user_id": user_id, "channel_id": channel_id}
        )
        replied_comments = await db.comments.count_documents(
            {"user_id": user_id, "channel_id": channel_id, "status": CommentStatus.REPLIED.value}
        )
        pending_comments = await db.comments.count_documents(
            {"user_id": user_id, "channel_id": channel_id, "status": CommentStatus.PENDING.value}
        )
        failed_replies = await db.comments.count_documents(
            {"user_id": user_id, "channel_id": channel_id, "status": CommentStatus.FAILED.value}
        )

        success_rate = (replied_comments / total_comments * 100) if total_comments > 0 else 0

        return {
            "totalComments": total_comments,
            "repliedComments": replied_comments,
            "pendingComments": pending_comments,
            "failedReplies": failed_replies,
            "successRate": round(success_rate, 2),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while fetching YouTube stats: {e}")

@app.get("/youtube/weekly-stats")
async def get_youtube_weekly_stats(
    user: dict = Depends(get_current_user_db),
    channel_id: str = Depends(get_current_channel_id)
):
    try:
        user_id = str(user["_id"])
        
        # Define the last 7 days (including today)
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        pipeline = [
            {"$match": {
                "user_id": user_id,
                "channel_id": channel_id,
                "published_at": {"$gte": datetime.combine(today - timedelta(days=6), datetime.min.time())} # Last 7 days, start of day
            }},
            {"$group": {
                "_id": { "$dayOfWeek": "$published_at" },
                "total_comments": { "$sum": 1 },
                "replied_comments": {
                    "$sum": { "$cond": [{ "$eq": ["$status", CommentStatus.REPLIED.value] }, 1, 0] }
                }
            }},
            {"$sort": { "_id": 1 }} # Sort by day of week (1=Sunday, 7=Saturday)
        ]

        weekly_data = await db.comments.aggregate(pipeline).to_list(length=None)

        # Map MongoDB dayOfWeek to desired day names and fill missing days
        day_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        
        # Create a dictionary for easier lookup
        # MongoDB's $dayOfWeek returns 1 for Sunday, 2 for Monday, ..., 7 for Saturday
        result_map = {item["_id"]: {"comments": item["total_comments"], "replies": item["replied_comments"]} for item in weekly_data}
        
        final_result = []
        for i in range(7):
            # Calculate the current day of the week, starting from today and going back 6 days
            # Python's weekday() returns 0 for Monday, 6 for Sunday
            # Adjust to match MongoDB's $dayOfWeek (Sunday=1, Monday=2, ...)
            current_date = today - timedelta(days=6 - i)
            mongo_day_of_week = (current_date.weekday() + 2) % 7 # +1 to make Monday=1, ..., +1 for Sunday=1 offset, then modulo 7. Sunday is 0 after this.
            if mongo_day_of_week == 0:
                mongo_day_of_week = 7 # Adjust Sunday from 0 to 7
            
            day_name = day_names[mongo_day_of_week - 1] # -1 to map 1-7 to 0-6 index for day_names

            final_result.append({
                "day": day_name,
                "comments": result_map.get(mongo_day_of_week, {}).get("comments", 0),
                "replies": result_map.get(mongo_day_of_week, {}).get("replies", 0),
            })
        
        return final_result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while fetching weekly stats: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)