
import React from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const from = location.state?.from?.pathname;

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6">
      {from && (
        <div className="w-full max-w-md mx-auto mb-4 text-center text-muted-foreground">
          Please sign in to access {from}
        </div>
      )}
      <AuthForm mode={mode} />
    </div>
  );
};

export default AuthPage;
