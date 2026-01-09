import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const GitHubCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGitHub, isAuthenticated } = useAuth();
  const loginAttempted = useRef(false);

  useEffect(() => {
    // If already authenticated, just go to dashboard
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (loginAttempted.current) return;
    
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('GitHub OAuth error:', error);
      navigate('/login', { replace: true });
      return;
    }

    if (code) {
      loginAttempted.current = true;
      loginWithGitHub(code).then((result) => {
        if (result.success) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, loginWithGitHub, navigate, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-lg text-muted-foreground">Processing GitHub login...</p>
      </div>
    </div>
  );
};

export default GitHubCallback;
