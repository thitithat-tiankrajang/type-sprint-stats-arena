
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6">
      <AuthForm mode={mode} />
    </div>
  );
};

export default AuthPage;
