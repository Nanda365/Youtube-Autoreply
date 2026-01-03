import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Zap, BarChart3, Shield, Youtube, ArrowRight, Check, Star } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI-Powered Replies',
    description: 'Generate human-like, contextual responses that match your brand voice and engage your audience.',
  },
  {
    icon: Zap,
    title: 'Instant Automation',
    description: 'Automatically detect and reply to new comments within seconds, 24/7 without manual intervention.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track engagement metrics, reply success rates, and identify your most engaging content.',
  },
  {
    icon: Shield,
    title: 'Spam Protection',
    description: 'Built-in spam filtering and blacklist management to keep your channel clean and professional.',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$19',
    period: '/month',
    description: 'Perfect for small creators',
    features: ['1 YouTube Channel', 'Up to 500 AI Replies/month', 'Basic Analytics', 'Email Support'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For growing channels',
    features: ['3 YouTube Channels', 'Unlimited AI Replies', 'Advanced Analytics', 'Custom Reply Tones', 'Priority Support'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$149',
    period: '/month',
    description: 'For agencies & networks',
    features: ['Unlimited Channels', 'Unlimited AI Replies', 'White-label Dashboard', 'API Access', 'Dedicated Account Manager'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Tech YouTuber, 250K Subscribers',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop',
    content: 'CommentPilot saved me hours every week. The AI replies sound just like me, and my engagement has never been higher!',
    rating: 5,
  },
  {
    name: 'Marcus Chen',
    role: 'Gaming Creator, 500K Subscribers',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    content: 'Finally, a tool that understands context! My viewers think I reply to every comment personally.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Lifestyle Vlogger, 100K Subscribers',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
    content: 'The spam filter alone is worth it. Plus, the analytics help me understand what content my audience loves.',
    rating: 5,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CommentPilot</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Log In</Button>
            </Link>
            <Link to="/register">
              <Button className="gradient-primary hover:opacity-90 transition-opacity">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-fade-in">
              <Youtube className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in leading-tight">
              Never Miss a YouTube Comment
              <span className="text-gradient block mt-2">Again</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              CommentPilot AI automatically generates thoughtful, personalized replies to your YouTube comments. Boost engagement while saving hours every week.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/register">
                <Button size="lg" className="gradient-primary hover:opacity-90 transition-opacity text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  See How It Works
                </Button>
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 14-day free trial
            </p>
          </div>
          
          {/* Dashboard Preview */}
          <div className="mt-16 relative animate-fade-in">
            <div className="glass rounded-2xl p-2 shadow-2xl max-w-5xl mx-auto">
              <div className="bg-secondary rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop"
                  alt="CommentPilot Dashboard Preview"
                  className="rounded-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Engage
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for YouTube creators who want to scale their engagement without sacrificing authenticity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card rounded-xl p-6 border border-border hover:border-accent/50 transition-all hover:shadow-lg group"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How CommentPilot Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step setup process.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Connect Your Channel', desc: 'Link your YouTube channel securely via Google OAuth in just one click.' },
              { step: '02', title: 'Configure Your Tone', desc: 'Choose between friendly, professional, or casual AI responses.' },
              { step: '03', title: 'Watch Engagement Grow', desc: 'Sit back as CommentPilot automatically replies to your comments.' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your channel. All plans include a 14-day free trial.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-card rounded-2xl p-6 border transition-all hover:shadow-xl ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border hover:border-accent/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 gradient-primary rounded-full text-sm font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </div>
                
                <Link to="/register">
                  <Button 
                    className={`w-full ${plan.popular ? 'gradient-primary hover:opacity-90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by Creators
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of YouTube creators who are saving time and boosting engagement.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your YouTube Engagement?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your free 14-day trial today. No credit card required.
          </p>
          <Link to="/register">
            <Button size="lg" className="gradient-primary hover:opacity-90 transition-opacity text-lg px-8">
              Get Started for Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">CommentPilot</span>
              </Link>
              <p className="text-secondary-foreground/70 text-sm">
                AI-powered YouTube comment management for creators who want to scale.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-secondary-foreground/70">
                <li><a href="#features" className="hover:text-secondary-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-secondary-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-secondary-foreground/70">
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-secondary-foreground/70">
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-secondary-foreground/20 pt-8 text-center text-sm text-secondary-foreground/70">
            © 2024 CommentPilot AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
