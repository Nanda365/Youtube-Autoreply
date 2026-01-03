// Mock data for CommentPilot AI

import { Comment, DashboardStats, Video, YouTubeChannel, AISettings } from '@/types';

export const mockChannel: YouTubeChannel = {
  id: '1',
  channelId: 'UC123456789',
  channelName: 'Tech Reviews Pro',
  channelThumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop',
  subscriberCount: 125000,
  isConnected: true,
  connectedAt: new Date('2024-01-15'),
};

export const mockVideos: Video[] = [
  {
    id: '1',
    videoId: 'abc123',
    title: 'iPhone 15 Pro Max - Complete Review After 6 Months',
    thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=320&h=180&fit=crop',
    publishedAt: new Date('2024-02-10'),
    commentCount: 458,
    viewCount: 125000,
  },
  {
    id: '2',
    videoId: 'def456',
    title: 'Best Budget Laptops 2024 - Top 5 Picks',
    thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=320&h=180&fit=crop',
    publishedAt: new Date('2024-02-08'),
    commentCount: 234,
    viewCount: 89000,
  },
  {
    id: '3',
    videoId: 'ghi789',
    title: 'Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max',
    thumbnail: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=320&h=180&fit=crop',
    publishedAt: new Date('2024-02-05'),
    commentCount: 567,
    viewCount: 234000,
  },
  {
    id: '4',
    videoId: 'jkl012',
    title: 'MacBook Pro M3 Max - The Ultimate Power User Review',
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=320&h=180&fit=crop',
    publishedAt: new Date('2024-02-01'),
    commentCount: 189,
    viewCount: 67000,
  },
];

export const mockComments: Comment[] = [
  {
    id: '1',
    videoId: 'abc123',
    videoTitle: 'iPhone 15 Pro Max - Complete Review After 6 Months',
    authorName: 'TechEnthusiast42',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop',
    text: 'Great review! Does the battery life really last all day with heavy usage?',
    publishedAt: new Date('2024-02-11T10:30:00'),
    likeCount: 24,
    status: 'replied',
    aiReply: 'Thanks for watching! Yes, the battery easily lasts a full day even with heavy usage. In my testing, I got around 8-9 hours of screen-on time with gaming and video streaming. Hope that helps!',
    repliedAt: new Date('2024-02-11T10:35:00'),
  },
  {
    id: '2',
    videoId: 'abc123',
    videoTitle: 'iPhone 15 Pro Max - Complete Review After 6 Months',
    authorName: 'MobileGamer2024',
    authorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=40&h=40&fit=crop',
    text: 'How is the heating issue during gaming? My old iPhone gets really hot.',
    publishedAt: new Date('2024-02-11T11:15:00'),
    likeCount: 18,
    status: 'pending',
  },
  {
    id: '3',
    videoId: 'def456',
    videoTitle: 'Best Budget Laptops 2024 - Top 5 Picks',
    authorName: 'StudentLife',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop',
    text: 'Which one would you recommend for a college student studying computer science?',
    publishedAt: new Date('2024-02-09T14:20:00'),
    likeCount: 45,
    status: 'replied',
    aiReply: "For computer science, I'd recommend the Lenovo IdeaPad 3 or the ASUS VivoBook 15. Both have great keyboards, sufficient RAM for coding, and solid build quality. The Lenovo is slightly better for longer coding sessions due to its keyboard!",
    repliedAt: new Date('2024-02-09T14:25:00'),
  },
  {
    id: '4',
    videoId: 'ghi789',
    videoTitle: 'Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max',
    authorName: 'AndroidFan',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
    text: 'Finally an unbiased comparison! Can you do one with the Pixel 8 Pro?',
    publishedAt: new Date('2024-02-06T09:45:00'),
    likeCount: 32,
    status: 'pending',
  },
  {
    id: '5',
    videoId: 'ghi789',
    videoTitle: 'Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max',
    authorName: 'PhotoPro',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop',
    text: 'The camera comparison was amazing! Which one is better for night photography?',
    publishedAt: new Date('2024-02-06T12:00:00'),
    likeCount: 28,
    status: 'replied',
    aiReply: 'Thank you! For night photography, both are excellent but the S24 Ultra has a slight edge with its larger sensor and better low-light processing. However, the iPhone 15 Pro Max produces more natural-looking colors in low light situations.',
    repliedAt: new Date('2024-02-06T12:10:00'),
  },
  {
    id: '6',
    videoId: 'jkl012',
    videoTitle: 'MacBook Pro M3 Max - The Ultimate Power User Review',
    authorName: 'VideoEditor',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
    text: 'How does it handle 8K video editing in DaVinci Resolve?',
    publishedAt: new Date('2024-02-02T16:30:00'),
    likeCount: 56,
    status: 'failed',
  },
  {
    id: '7',
    videoId: 'abc123',
    videoTitle: 'iPhone 15 Pro Max - Complete Review After 6 Months',
    authorName: 'AppleFanboy99',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
    text: 'Best iPhone review on YouTube! Subscribed immediately! 🔥',
    publishedAt: new Date('2024-02-12T08:00:00'),
    likeCount: 12,
    status: 'pending',
  },
];

export const mockStats: DashboardStats = {
  totalComments: 1448,
  repliedComments: 1124,
  pendingComments: 289,
  failedReplies: 35,
  successRate: 77.6,
  commentsToday: 47,
  commentsThisWeek: 312,
};

export const mockAISettings: AISettings = {
  tone: 'friendly',
  autoReplyEnabled: true,
  spamFilterEnabled: true,
  blacklistWords: ['spam', 'scam', 'fake', 'click here'],
  maxReplyLength: 500,
};

export const weeklyChartData = [
  { day: 'Mon', comments: 42, replies: 38 },
  { day: 'Tue', comments: 56, replies: 52 },
  { day: 'Wed', comments: 38, replies: 35 },
  { day: 'Thu', comments: 65, replies: 58 },
  { day: 'Fri', comments: 48, replies: 44 },
  { day: 'Sat', comments: 32, replies: 28 },
  { day: 'Sun', comments: 28, replies: 25 },
];

export const videoChartData = mockVideos.map(v => ({
  name: v.title.length > 25 ? v.title.substring(0, 25) + '...' : v.title,
  comments: v.commentCount,
}));