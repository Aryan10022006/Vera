import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, X } from 'lucide-react';

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        setStatus('error');
        setMessage(`GitHub authentication failed: ${error}`);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        // Exchange code for access token via backend
        const response = await fetch('/api/github/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        if (!response.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const data = await response.json();
        
        // Store access token in localStorage
        localStorage.setItem('github_token', data.access_token);
        localStorage.setItem('github_user', JSON.stringify(data.user));

        setStatus('success');
        setMessage('Successfully connected to GitHub!');
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        console.error('GitHub callback error:', err);
        setStatus('error');
        setMessage('Failed to complete GitHub authentication');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Connecting to GitHub
            </h2>
            <p className="text-slate-400">
              Please wait while we complete the authentication...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Success!
            </h2>
            <p className="text-slate-400">
              {message}
            </p>
            <p className="text-sm text-slate-500 mt-4">
              Redirecting you back...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-slate-400">
              {message}
            </p>
            <p className="text-sm text-slate-500 mt-4">
              Redirecting you back...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
