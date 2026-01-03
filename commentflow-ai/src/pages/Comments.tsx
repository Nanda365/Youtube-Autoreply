import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Edit,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Comments() {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComment, setSelectedComment] = useState<any | null>(null);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('videoId');

  const fetchComments = async () => {
    if (!videoId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/youtube/comments/${videoId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }
      const data = await response.json();
      setComments(data.items || []);
      toast({
        title: 'Comments synced!',
        description: 'Successfully fetched the latest comments.',
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to sync comments: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const filteredComments = comments.filter(comment => {
    const topLevelComment = comment.snippet.topLevelComment.snippet;
    const matchesSearch = 
      topLevelComment.textDisplay.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topLevelComment.authorDisplayName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReplySubmit = async () => {
    if (!selectedComment || !replyText.trim()) return;

    setIsReplying(true);
    try {
      const response = await fetch(`http://localhost:8000/youtube/comments/reply`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: selectedComment.snippet.topLevelComment.id,
          replyText: replyText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to post reply.');
      }

      toast({
        title: 'Reply posted!',
        description: 'Your reply has been successfully posted to YouTube.',
      });

      // Reset state and close dialog
      setReplyText('');
      setSelectedComment(null);
      // Refresh comments to show the new reply
      fetchComments();

    } catch (err: any) {
      toast({
        title: 'Error',
        description: `Failed to post reply: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsReplying(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!selectedComment) return;
    const top = selectedComment.snippet.topLevelComment.snippet;
    const original = top.textDisplay.replace(/<[^>]+>/g, '');
    setIsGenerating(true);

    const pickTone = (text: string) => {
      const t = text.toLowerCase();
      if (/\b(thanks|thank you|love|great|awesome|nice)\b/.test(t)) return 'thankful';
      if (/\b(how|what|why|when|where|do|does|can|could|help)\b/.test(t)) return 'informative';
      if (/\b(not working|issue|problem|error|help|bug|complain)\b/.test(t)) return 'apologetic_helpful';
      return 'friendly';
    };

    const templates = [
      'Reply briefly and helpfully to this comment: "{{comment}}" — mention the author by name and be {{tone}}.',
      'Write a concise, natural-sounding reply to "{{comment}}" from the channel owner. Tone: {{tone}}. Keep it varied and human.',
      'Respond to the user comment "{{comment}}". Use a {{tone}} tone, include a short follow-up question if appropriate.',
      'Produce a friendly reply to "{{comment}}" that sounds human and unique. Tone hint: {{tone}}.'
    ];

    try {
      const tone = pickTone(original);
      const template = templates[Math.floor(Math.random() * templates.length)];
      const prompt = template.replace('{{comment}}', original).replace('{{author}}', top.authorDisplayName).replace('{{tone}}', tone);

      const payload = {
        comment_text: original,
        author: top.authorDisplayName,
        like_count: top.likeCount || 0,
        published_at: top.publishedAt,
        tone,
        seed: Math.floor(Math.random() * 100000),
        prompt,
      };

      const res = await fetch('http://localhost:8000/ai/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'AI generation failed');
      }

      const data = await res.json();
      setReplyText(data.reply || data.text || '');
      toast({ title: 'AI suggestion ready', description: 'A varied, context-aware suggestion was generated.' });
    } catch (e: any) {
      toast({ title: 'AI error', description: e.message || 'Failed to generate suggestion', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!replyId) return;
    setIsDeleting(true);
    try {
      const res = await fetch('http://localhost:8000/youtube/comments/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ commentId: replyId })
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Failed to delete reply');
      }
      toast({ title: 'Reply deleted', description: 'The reply was removed.' });
      fetchComments();
    } catch (e: any) {
      toast({ title: 'Delete error', description: e.message || 'Failed to delete reply', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Comments for Video</h2>
          <p className="text-muted-foreground">{videoId}</p>
        </div>
        <Button className="gradient-primary hover:opacity-90" onClick={fetchComments} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Syncing...' : 'Sync Comments'}
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search comments or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="w-[500px]">Comment</TableHead>
                <TableHead>Replied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <p className="text-muted-foreground">Loading comments...</p>
                  </TableCell>
                </TableRow>
              )}
              {error && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-destructive">
                    <p>{error}</p>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !error && filteredComments.map((comment) => {
                const snippet = comment.snippet.topLevelComment.snippet;
                const hasReplies = comment.replies?.comments?.length > 0;
                const firstReply = hasReplies ? comment.replies.comments[0] : null;
                return (
                  <TableRow key={comment.id} className="border-border">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <img 
                          src={snippet.authorProfileImageUrl} 
                          alt={snippet.authorDisplayName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground text-sm">
                              {snippet.authorDisplayName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(snippet.publishedAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: snippet.textDisplay }} />
                          <div className="flex items-center gap-2 mt-1">
                            <ThumbsUp className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{snippet.likeCount}</span>
                          </div>

                          {comment.replies?.comments?.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {comment.replies.comments.map((r: any) => (
                                <div key={r.id} className="flex items-start justify-between gap-3 p-2 bg-muted/40 rounded">
                                  <div>
                                    <p className="text-xs font-medium text-foreground">{r.snippet.authorDisplayName}</p>
                                    <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: r.snippet.textDisplay }} />
                                  </div>
                                  <div className="flex-shrink-0">
                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteReply(r.id)} disabled={isDeleting}>
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {hasReplies && firstReply ? (
                        <div className="max-w-[240px]">
                          <div className="flex items-center gap-2">
                            <Badge>Replied</Badge>
                            <span className="text-xs text-muted-foreground truncate">{firstReply.snippet.authorDisplayName}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1" dangerouslySetInnerHTML={{ __html: firstReply.snippet.textDisplay }} />
                        </div>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setReplyText('');
                          setSelectedComment(comment);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedComment} onOpenChange={() => setSelectedComment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comment Details</DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Original Comment</h4>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <img 
                    src={selectedComment.snippet.topLevelComment.snippet.authorProfileImageUrl} 
                    alt={selectedComment.snippet.topLevelComment.snippet.authorDisplayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">
                        {selectedComment.snippet.topLevelComment.snippet.authorDisplayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(selectedComment.snippet.topLevelComment.snippet.publishedAt)}
                      </span>
                    </div>
                    <p className="text-foreground" dangerouslySetInnerHTML={{ __html: selectedComment.snippet.topLevelComment.snippet.textDisplay }} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Your Reply</h4>
                <Textarea
                  placeholder="Type your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">Tip: click "AI Suggest" to generate a suggested reply — it will not be posted until you click "Submit Reply".</p>
              </div>

              {selectedComment.replies?.comments?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Existing Replies</h4>
                  <div className="space-y-2 mt-2">
                    {selectedComment.replies.comments.map((r: any) => (
                      <div key={r.id} className="flex items-start justify-between gap-3 p-2 bg-muted/40 rounded">
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.snippet.authorDisplayName}</p>
                          <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: r.snippet.textDisplay }} />
                        </div>
                        <div className="flex-shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteReply(r.id)} disabled={isDeleting}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedComment(null)}>
                    Close
                  </Button>
                  <Button onClick={handleReplySubmit} disabled={isReplying || !replyText.trim()}>
                    {isReplying ? 'Posting...' : 'Submit Reply'}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAIGenerate} disabled={isGenerating || !selectedComment}>
                    {isGenerating ? 'Generating...' : 'AI Suggest'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  );
}