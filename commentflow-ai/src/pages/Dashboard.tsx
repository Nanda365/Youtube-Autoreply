import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { DashboardStats } from '@/types';
import { DashboardStats } from '@/types'; // Import DashboardStats
const generateStatCards = (stats: DashboardStats | null) => {
  const loading = !stats;
  return [
    {
      title: 'Total Comments',
      value: loading ? '...' : (stats.totalComments?.toLocaleString() || '0'),
      icon: MessageSquare,
      change: '+0%', // Placeholder
      changeType: 'positive' as const,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Replied',
      value: loading ? '...' : (stats.repliedComments?.toLocaleString() || '0'),
      icon: CheckCircle2,
      change: loading ? '' : `${Math.round(stats.successRate || 0)}%`,
      changeType: 'positive' as const,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Pending',
      value: loading ? '...' : (stats.pendingComments?.toLocaleString() || '0'),
      icon: Clock,
      change: '-0%', // Placeholder
      changeType: 'positive' as const,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Failed',
      value: loading ? '...' : (stats.failedReplies?.toLocaleString() || '0'),
      icon: AlertCircle,
      change: '0%', // Placeholder
      changeType: 'positive' as const,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];
};

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Extracted so handlers can refresh after actions
  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoadingData(true);
    try {
      // Fetch videos, stats and weekly chart data in parallel
      const [videosRes, statsRes, weeklyChartRes] = await Promise.all([
        fetch(`http://localhost:8000/youtube/videos?max_results=8`, { credentials: 'include' }),
        fetch(`http://localhost:8000/youtube/stats`, { credentials: 'include' }),
        fetch(`http://localhost:8000/youtube/weekly-stats`, { credentials: 'include' })
      ]);

      if (videosRes.ok) {
        const videosData = await videosRes.json();
        setVideos(videosData.items || []);
      } else {
        console.error("Failed to fetch videos:", videosRes.statusText);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        console.error("Failed to fetch stats:", statsRes.statusText);
      }

      if (weeklyChartRes.ok) {
        const weeklyChartData = await weeklyChartRes.json();
        setWeeklyChartData(weeklyChartData);
      } else {
        console.error("Failed to fetch weekly chart data:", weeklyChartRes.statusText);
      }
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const statCards = generateStatCards(stats);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back, {user ? user.name : ''}!</h2>
            <p className="text-muted-foreground">Here's what's happening with your channel</p>
          </div>
          {user ? (
             user.picture && <img src={user.picture} alt="User Avatar" className="w-12 h-12 rounded-full" />
          ) : (
            <Skeleton className="w-12 h-12 rounded-full" />
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-border hover:border-accent/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4">
                  {stats ? (
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  ) : (
                    <Skeleton className="h-8 w-24" />
                  )}
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar 
                    dataKey="comments" 
                    fill="hsl(var(--accent))" 
                    radius={[4, 4, 0, 0]}
                    name="Comments"
                  />
                  <Bar 
                    dataKey="replies" 
                    fill="hsl(var(--success))" 
                    radius={[4, 4, 0, 0]}
                    name="Replies"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Reply Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="replies" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name="Replies"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Your Videos Section */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Your Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isLoadingData ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : videos.length > 0 ? (
                videos.map((video) => (
                  <Link to={`/comments?videoId=${video.contentDetails.videoId}`} key={video.id} className="group">
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <img 
                        src={video.snippet.thumbnails.medium.url} 
                        alt={video.snippet.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mt-2 font-medium text-foreground truncate">{video.snippet.title}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
                  </Link>
                ))
              ) : (
                <p className="col-span-full text-center text-muted-foreground">No videos found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}