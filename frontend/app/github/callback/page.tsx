'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function GitHubCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to GitHub...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`GitHub authorization failed: ${error}`);
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      try {
        // Exchange code for access token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/github/callback?code=${code}`);
        
        if (!response.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const data = await response.json();

        if (data.success) {
          // Store token in localStorage
          localStorage.setItem('github_token', data.token);
          localStorage.setItem('github_user', JSON.stringify(data.user));

          setStatus('success');
          setMessage(`Successfully connected as ${data.user.login}!`);
          
          // Redirect to home after 2 seconds
          setTimeout(() => router.push('/'), 2000);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Failed to connect GitHub account');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20">
        <div className="flex flex-col items-center text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-purple-400 animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Connecting...</h2>
              <p className="text-gray-300">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
              <p className="text-gray-300">{message}</p>
              <p className="text-sm text-gray-400 mt-2">Redirecting to dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Connection Failed</h2>
              <p className="text-gray-300">{message}</p>
              <p className="text-sm text-gray-400 mt-2">Redirecting to home...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
