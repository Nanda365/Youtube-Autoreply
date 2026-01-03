// CommentPilot AI Types

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface YouTubeChannel {
  id: string;
  channelId: string;
  channelName: string;
  channelThumbnail: string;
  subscriberCount: number;
  isConnected: boolean;
  connectedAt?: Date;
}

export interface Video {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: Date;
  commentCount: number;
  viewCount: number;
}

export interface Comment {
  id: string;
  videoId: string;
  videoTitle: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  publishedAt: Date;
  likeCount: number;
  status: 'pending' | 'replied' | 'failed' | 'skipped';
  aiReply?: string;
  repliedAt?: Date;
}

export interface AISettings {
  tone: 'friendly' | 'professional' | 'casual';
  autoReplyEnabled: boolean;
  spamFilterEnabled: boolean;
  blacklistWords: string[];
  maxReplyLength: number;
}

export interface DashboardStats {
  totalComments: number;
  repliedComments: number;
  pendingComments: number;
  failedReplies: number;
  successRate: number;
  commentsToday: number;
  commentsThisWeek: number;
}