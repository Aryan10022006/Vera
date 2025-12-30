'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Github, CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface GitHubProfile {
  username: string;
  name: string;
  email: string;
  avatarUrl: string;
  publicRepos: number;
}

interface GitHubRepository {
  name: string;
  fullName: string;
  description: string;
  private: boolean;
  url: string;
  language: string;
  stars: number;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function GitHubConnect() {
  const { address } = useAccount();
  const [isConnected, setIsConnected] = useState(false);
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      checkConnectionStatus();
    }
  }, [address]);

  const checkConnectionStatus = async () => {
    if (!address) return;

    try {
      const response = await fetch(`${API_URL}/api/github/status?address=${address}`);
      const data = await response.json();

      if (data.connected) {
        setIsConnected(true);
        setProfile(data.profile);
      } else {
        setIsConnected(false);
        setProfile(null);
      }
    } catch (err: any) {
      console.error('Error checking GitHub status:', err);
    }
  };

  const connectGitHub = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/github/auth-url?address=${address}`);
      const data = await response.json();

      if (data.authUrl) {
        // Open GitHub OAuth in popup
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          data.authUrl,
          'GitHub OAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Listen for OAuth callback
        const checkPopup = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopup);
            setTimeout(checkConnectionStatus, 1000);
            setLoading(false);
          }
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect GitHub');
      setLoading(false);
    }
  };

  const disconnectGitHub = async () => {
    if (!address) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/github/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (data.success) {
        setIsConnected(false);
        setProfile(null);
        setRepositories([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect GitHub');
    } finally {
      setLoading(false);
    }
  };

  const loadRepositories = async () => {
    if (!address) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/github/repositories?address=${address}`);
      const data = await response.json();

      if (data.success) {
        setRepositories(data.repositories);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Github className="w-8 h-8 text-gray-900" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">GitHub Connection</h3>
            <p className="text-sm text-gray-600">Connect your GitHub for automatic code verification</p>
          </div>
        </div>
        
        {isConnected ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <XCircle className="w-6 h-6 text-gray-400" />
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!isConnected ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Why connect GitHub?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Automatic code quality verification</li>
              <li>✓ Real-time milestone tracking</li>
              <li>✓ Faster payment releases</li>
              <li>✓ Repository integrity checks</li>
            </ul>
          </div>

          <button
            onClick={connectGitHub}
            disabled={loading || !address}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Github className="w-5 h-5" />
            {loading ? 'Connecting...' : 'Connect GitHub'}
          </button>

          {!address && (
            <p className="text-sm text-gray-500 text-center">
              Please connect your wallet first
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Profile Info */}
          {profile && (
            <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                className="w-16 h-16 rounded-full border-2 border-green-500"
              />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{profile.name || profile.username}</h4>
                <p className="text-sm text-gray-600">@{profile.username}</p>
                <p className="text-xs text-gray-500 mt-1">{profile.publicRepos} public repositories</p>
              </div>
              <a
                href={`https://github.com/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={loadRepositories}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {repositories.length > 0 ? 'Refresh Repos' : 'Load Repositories'}
            </button>
            
            <button
              onClick={disconnectGitHub}
              disabled={loading}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>

          {/* Repositories List */}
          {repositories.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">Your Repositories ({repositories.length})</h4>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {repositories.slice(0, 10).map((repo) => (
                  <div key={repo.fullName} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{repo.name}</h5>
                        {repo.description && (
                          <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              {repo.language}
                            </span>
                          )}
                          <span>⭐ {repo.stars}</span>
                          {repo.private && <span className="text-orange-600">🔒 Private</span>}
                        </div>
                      </div>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
