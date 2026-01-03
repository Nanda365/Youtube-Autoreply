import os
import motor.motor_asyncio
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise Exception("MONGODB_URL environment variable not set")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client.get_database("Youtubereview") # You can change this to your desired db name

# You can add helper functions here to interact with your collections, e.g.:
# async def get_user(user_id: str):
#     return await db.users.find_one({"_id": user_id})
