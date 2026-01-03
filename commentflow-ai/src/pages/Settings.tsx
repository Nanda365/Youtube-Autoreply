import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Youtube, 
  Unlink, 
  Settings2, 
  Shield, 
  Sparkles,
  Save,
  Plus,
  X,
  CheckCircle2
} from 'lucide-react';
import { mockChannel, mockAISettings } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [isConnected, setIsConnected] = useState(mockChannel.isConnected);
  const [aiSettings, setAiSettings] = useState(mockAISettings);
  const [newBlacklistWord, setNewBlacklistWord] = useState('');
  const { toast } = useToast();

  const handleConnectYouTube = () => {
    // Simulate OAuth flow
    toast({
      title: 'Connecting to YouTube...',
      description: 'Redirecting to Google OAuth...',
    });
    
    setTimeout(() => {
      setIsConnected(true);
      toast({
        title: 'Connected!',
        description: 'Your YouTube channel has been connected successfully.',
      });
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: 'Disconnected',
      description: 'Your YouTube channel has been disconnected.',
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: 'Settings saved!',
      description: 'Your AI settings have been updated successfully.',
    });
  };

  const addBlacklistWord = () => {
    if (newBlacklistWord.trim() && !aiSettings.blacklistWords.includes(newBlacklistWord.trim())) {
      setAiSettings({
        ...aiSettings,
        blacklistWords: [...aiSettings.blacklistWords, newBlacklistWord.trim()],
      });
      setNewBlacklistWord('');
    }
  };

  const removeBlacklistWord = (word: string) => {
    setAiSettings({
      ...aiSettings,
      blacklistWords: aiSettings.blacklistWords.filter(w => w !== word),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">Manage your YouTube connection and AI preferences</p>
        </div>

        {/* YouTube Connection */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-primary" />
              YouTube Connection
            </CardTitle>
            <CardDescription>
              Connect your YouTube channel to enable automatic comment replies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-4">
                    <img 
                      src={mockChannel.channelThumbnail} 
                      alt={mockChannel.channelName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{mockChannel.channelName}</h4>
                        <Badge className="bg-success/20 text-success border-success/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(mockChannel.subscriberCount / 1000).toFixed(0)}K subscribers • Connected on {mockChannel.connectedAt?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleDisconnect} className="text-destructive hover:text-destructive">
                    <Unlink className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">Permissions granted:</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Read comments on your videos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Post replies to comments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Access channel analytics
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Youtube className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Connect Your Channel</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Link your YouTube channel to start automatically replying to comments with AI
                </p>
                <Button onClick={handleConnectYouTube} className="gradient-primary hover:opacity-90">
                  <Youtube className="w-4 h-4 mr-2" />
                  Connect with Google
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              AI Reply Settings
            </CardTitle>
            <CardDescription>
              Configure how the AI generates replies to your comments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto Reply Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-reply" className="text-base">Auto Reply</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically reply to new comments
                </p>
              </div>
              <Switch
                id="auto-reply"
                checked={aiSettings.autoReplyEnabled}
                onCheckedChange={(checked) => 
                  setAiSettings({ ...aiSettings, autoReplyEnabled: checked })
                }
              />
            </div>

            {/* Reply Tone */}
            <div className="space-y-2">
              <Label htmlFor="tone">Reply Tone</Label>
              <Select 
                value={aiSettings.tone} 
                onValueChange={(value: 'friendly' | 'professional' | 'casual') => 
                  setAiSettings({ ...aiSettings, tone: value })
                }
              >
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">
                    <div>
                      <span className="font-medium">Friendly</span>
                      <p className="text-xs text-muted-foreground">Warm, approachable, uses emojis occasionally</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="professional">
                    <div>
                      <span className="font-medium">Professional</span>
                      <p className="text-xs text-muted-foreground">Formal, informative, business-appropriate</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="casual">
                    <div>
                      <span className="font-medium">Casual</span>
                      <p className="text-xs text-muted-foreground">Relaxed, conversational, fun</p>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Reply Length */}
            <div className="space-y-2">
              <Label htmlFor="max-length">Max Reply Length</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="max-length"
                  type="number"
                  value={aiSettings.maxReplyLength}
                  onChange={(e) => 
                    setAiSettings({ ...aiSettings, maxReplyLength: parseInt(e.target.value) || 500 })
                  }
                  className="w-32"
                  min={100}
                  max={1000}
                />
                <span className="text-sm text-muted-foreground">characters</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spam Protection */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-warning" />
              Spam Protection
            </CardTitle>
            <CardDescription>
              Filter out spam comments and manage your blacklist
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Spam Filter Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="spam-filter" className="text-base">Spam Filter</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically skip replies to spam comments
                </p>
              </div>
              <Switch
                id="spam-filter"
                checked={aiSettings.spamFilterEnabled}
                onCheckedChange={(checked) => 
                  setAiSettings({ ...aiSettings, spamFilterEnabled: checked })
                }
              />
            </div>

            {/* Blacklist Words */}
            <div className="space-y-3">
              <Label>Blacklist Words</Label>
              <p className="text-sm text-muted-foreground">
                Comments containing these words will be skipped
              </p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add a word..."
                  value={newBlacklistWord}
                  onChange={(e) => setNewBlacklistWord(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBlacklistWord()}
                />
                <Button onClick={addBlacklistWord} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {aiSettings.blacklistWords.map((word) => (
                  <Badge key={word} variant="secondary" className="px-3 py-1">
                    {word}
                    <button 
                      onClick={() => removeBlacklistWord(word)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="gradient-primary hover:opacity-90">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}