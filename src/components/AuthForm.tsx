
import React, { useState } from 'react';
import { useAuth } from '../hooks/useauth';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

// Email and password validation schema
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [showResetPassword, setShowResetPassword] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.email = error.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.password = error.errors[0].message;
      }
    }
    
    if (mode === 'signup' && password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        toast({
          title: "Success",
          description: "You have signed in successfully",
        });
        navigate('/');
      } else {
        await signUp(email, password, displayName || undefined);
        toast({
          title: "Account Created",
          description: "Your account has been created successfully. Please verify your email.",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      let errorMessage = "Authentication failed. Please try again.";
      
      if (error instanceof Error) {
        // Firebase error codes typically contain a slash, we extract the error type
        const errorCode = error.message.includes('/') 
          ? error.message.split('/')[1].replace(')', '') 
          : error.message;
        
        switch (errorCode) {
          case 'email-already-in-use':
            errorMessage = "This email is already registered. Please sign in instead.";
            break;
          case 'user-not-found':
            errorMessage = "No account found with this email address.";
            break;
          case 'wrong-password':
            errorMessage = "Incorrect password. Please try again.";
            break;
          case 'too-many-requests':
            errorMessage = "Too many failed attempts. Please try again later.";
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setFormError("Please enter your email address to reset your password");
      return;
    }

    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors({ email: error.errors[0].message });
        return;
      }
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for instructions to reset your password.",
      });
      setShowResetPassword(false);
    } catch (error) {
      console.error('Password reset error:', error);
      setFormError("Failed to send reset email. Please check your email address.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    navigate(`/auth?mode=${mode === 'signin' ? 'signup' : 'signin'}`);
  };

  if (showResetPassword) {
    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-lg bg-card border border-border animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="reset-email" className="block text-sm font-medium mb-1">
              Email
            </Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              className={validationErrors.email ? "border-destructive" : ""}
            />
            {validationErrors.email && (
              <p className="text-destructive text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>
          
          <Button 
            onClick={handleResetPassword}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => setShowResetPassword(false)}
            disabled={isLoading}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg bg-card border border-border animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === 'signin' ? 'Sign In' : 'Create Account'}
      </h2>
      
      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <Label htmlFor="displayName" className="block text-sm font-medium mb-1">
              Display Name (Optional)
            </Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              disabled={isLoading}
            />
          </div>
        )}
        
        <div>
          <Label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={isLoading}
            className={validationErrors.email ? "border-destructive" : ""}
            required
          />
          {validationErrors.email && (
            <p className="text-destructive text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            className={validationErrors.password ? "border-destructive" : ""}
            required
          />
          {validationErrors.password && (
            <p className="text-destructive text-sm mt-1">{validationErrors.password}</p>
          )}
        </div>
        
        {mode === 'signup' && (
          <div>
            <Label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className={validationErrors.confirmPassword ? "border-destructive" : ""}
              required
            />
            {validationErrors.confirmPassword && (
              <p className="text-destructive text-sm mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
            </>
          ) : (
            mode === 'signin' ? 'Sign In' : 'Sign Up'
          )}
        </Button>
      </form>
      
      {mode === 'signin' && (
        <div className="mt-4 text-center">
          <button 
            onClick={() => setShowResetPassword(true)}
            className="text-sm text-primary hover:underline focus:outline-none"
            disabled={isLoading}
            type="button"
          >
            Forgot Password?
          </button>
        </div>
      )}
      
      <div className="mt-4 text-sm text-center">
        {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
        <button 
          onClick={toggleMode}
          className="ml-1 text-primary hover:underline focus:outline-none"
          disabled={isLoading}
          type="button"
        >
          {mode === 'signin' ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
