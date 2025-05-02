
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
          TypeSprint
        </h1>
        <p className="text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
          Improve your typing speed and accuracy with our modern typing test platform
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 pt-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {currentUser ? (
            <>
              <Button size="lg" onClick={() => navigate('/type')}>
                Start Typing Test
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/stats')}>
                View Statistics
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/auth?mode=signup')}>
                Create Account
              </Button>
            </>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-xl font-bold mb-2">Measure Speed</h3>
            <p className="text-muted-foreground">Track your WPM and see how you improve over time</p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-xl font-bold mb-2">Improve Accuracy</h3>
            <p className="text-muted-foreground">Real-time feedback helps you reduce errors</p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
            <p className="text-muted-foreground">Visualize your improvement with detailed statistics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
