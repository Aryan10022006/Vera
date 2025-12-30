/**
 * GitHub OAuth Handler for Vera Protocol
 * Allows users to authorize the app to access their repositories
 */

import { Octokit } from '@octokit/rest';

interface GitHubOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface UserGitHubToken {
  address: string;
  accessToken: string;
  scope: string;
  tokenType: string;
  expiresAt?: Date;
}

export class GitHubOAuthHandler {
  private config: GitHubOAuthConfig;
  private userTokens: Map<string, UserGitHubToken>;

  constructor(config: GitHubOAuthConfig) {
    this.config = config;
    this.userTokens = new Map();
  }

  /**
   * Generate authorization URL for user to connect GitHub
   */
  getAuthorizationUrl(walletAddress: string, state?: string): string {
    const stateParam = state || this.generateState(walletAddress);
    const scopes = ['repo', 'read:user', 'user:email'];

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: scopes.join(' '),
      state: stateParam,
      allow_signup: 'true',
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, walletAddress: string): Promise<UserGitHubToken> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
    }

    const userToken: UserGitHubToken = {
      address: walletAddress,
      accessToken: data.access_token,
      scope: data.scope,
      tokenType: data.token_type,
    };

    // Store token for this user
    this.userTokens.set(walletAddress.toLowerCase(), userToken);

    return userToken;
  }

  /**
   * Get stored token for a user
   */
  getUserToken(walletAddress: string): UserGitHubToken | undefined {
    return this.userTokens.get(walletAddress.toLowerCase());
  }

  /**
   * Check if user has connected GitHub
   */
  isUserConnected(walletAddress: string): boolean {
    return this.userTokens.has(walletAddress.toLowerCase());
  }

  /**
   * Get Octokit instance for a specific user
   */
  getUserOctokit(walletAddress: string): Octokit | null {
    const token = this.getUserToken(walletAddress);
    if (!token) {
      return null;
    }

    return new Octokit({
      auth: token.accessToken,
    });
  }

  /**
   * Verify user's GitHub token is still valid
   */
  async verifyUserToken(walletAddress: string): Promise<boolean> {
    const octokit = this.getUserOctokit(walletAddress);
    if (!octokit) {
      return false;
    }

    try {
      await octokit.users.getAuthenticated();
      return true;
    } catch (error) {
      // Token is invalid or expired, remove it
      this.userTokens.delete(walletAddress.toLowerCase());
      return false;
    }
  }

  /**
   * Disconnect GitHub for a user
   */
  disconnectUser(walletAddress: string): void {
    this.userTokens.delete(walletAddress.toLowerCase());
  }

  /**
   * Get user's GitHub profile information
   */
  async getUserProfile(walletAddress: string): Promise<any> {
    const octokit = this.getUserOctokit(walletAddress);
    if (!octokit) {
      throw new Error('User has not connected GitHub');
    }

    const { data } = await octokit.users.getAuthenticated();
    return {
      username: data.login,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      publicRepos: data.public_repos,
    };
  }

  /**
   * List user's accessible repositories
   */
  async getUserRepositories(walletAddress: string): Promise<any[]> {
    const octokit = this.getUserOctokit(walletAddress);
    if (!octokit) {
      throw new Error('User has not connected GitHub');
    }

    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    return data.map(repo => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
    }));
  }

  /**
   * Generate secure state parameter for OAuth flow
   */
  private generateState(walletAddress: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return Buffer.from(`${walletAddress}:${timestamp}:${random}`).toString('base64');
  }

  /**
   * Verify state parameter from OAuth callback
   */
  verifyState(state: string, expectedAddress: string): boolean {
    try {
      const decoded = Buffer.from(state, 'base64').toString('utf-8');
      const [address, timestamp] = decoded.split(':');
      
      // Check if state is less than 10 minutes old
      const age = Date.now() - parseInt(timestamp);
      if (age > 10 * 60 * 1000) {
        return false;
      }

      return address.toLowerCase() === expectedAddress.toLowerCase();
    } catch {
      return false;
    }
  }
}
