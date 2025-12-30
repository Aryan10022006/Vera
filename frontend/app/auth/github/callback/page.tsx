'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function GitHubCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing GitHub authorization...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`GitHub authorization failed: ${error}`);
        setTimeout(() => window.close(), 3000);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing authorization code or state');
        setTimeout(() => window.close(), 3000);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/github/callback?code=${code}&state=${state}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(`Successfully connected GitHub as @${data.profile?.username}`);
          setTimeout(() => {
            if (window.opener) {
              window.opener.postMessage({ type: 'github-connected', profile: data.profile }, '*');
            }
            window.close();
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to connect GitHub');
          setTimeout(() => window.close(), 3000);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An error occurred');
        setTimeout(() => window.close(), 3000);
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connecting GitHub</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">This window will close automatically...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">This window will close automatically...</p>
          </>
        )}
      </div>
    </div>
  );
}
