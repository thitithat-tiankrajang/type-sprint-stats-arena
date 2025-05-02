
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Pages
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import TypingPage from "./pages/TypingPage";
import StatsPage from "./pages/StatsPage";
import NotFound from "./pages/NotFound";

// Components
import NavBar from "./components/NavBar";

// Context
import AuthProvider from "./contexts/AuthProvider";
import { useAuth } from "./hooks/useauth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Enhanced protected route component with redirect preservation
const ProtectedRoute = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to auth page but save the location they tried to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Route for already authenticated users (redirect away from auth pages)
const PublicOnlyRoute = ({
  children
}: {
  children: React.ReactNode
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route 
          path="/auth" 
          element={
            <PublicOnlyRoute>
              <AuthPage />
            </PublicOnlyRoute>
          } 
        />
        <Route 
          path="/type" 
          element={
            <ProtectedRoute>
              <TypingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stats" 
          element={
            <ProtectedRoute>
              <StatsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
