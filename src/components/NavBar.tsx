
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '../hooks/useauth';

const NavBar: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "text-primary" : "text-muted-foreground hover:text-foreground";
  };

  return (
    <nav className="w-full px-6 py-4 border-b border-border">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link to="/" className="mr-6">
            <span className="text-2xl font-bold text-primary">TypeSprint</span>
          </Link>
          {currentUser && (
            <div className="space-x-4">
              <Link to="/" className={`${isActive('/')} transition-colors`}>
                Home
              </Link>
              <Link to="/type" className={`${isActive('/type')} transition-colors`}>
                Test
              </Link>
              <Link to="/stats" className={`${isActive('/stats')} transition-colors`}>
                Stats
              </Link>
            </div>
          )}
        </div>
        
        <div>
          {currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {currentUser.email}
              </span>
              <Button 
                variant="outline" 
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="default">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
