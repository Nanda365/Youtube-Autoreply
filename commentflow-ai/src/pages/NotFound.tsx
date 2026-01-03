import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <p className="text-2xl font-medium mb-4">Page Not Found</p>
      <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/">
        <Button>Go to Homepage</Button>
      </Link>
    </div>
  );
}
