// Authentication utilities
export class AuthManager {
  static async validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static async validatePassword(password) {
    return password.length >= 8;
  }

  static generateDID(walletAddress) {
    return `did:ethr:${walletAddress}`;
  }

  static async hashPassword(password) {
    // In a real implementation, this would use a proper hashing algorithm
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

export const socialLoginProviders = {
  google: {
    name: 'Google',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['openid', 'email', 'profile']
  },
  github: {
    name: 'GitHub',
    authUrl: 'https://github.com/login/oauth/authorize',
    scopes: ['user:email']
  },
  apple: {
    name: 'Apple',
    authUrl: 'https://appleid.apple.com/auth/authorize',
    scopes: ['email', 'name']
  }
};

export const walletProviders = {
  metamask: {
    name: 'MetaMask',
    chain: 'ethereum',
    supported: true
  },
  walletconnect: {
    name: 'WalletConnect',
    chain: 'multi',
    supported: true
  },
  phantom: {
    name: 'Phantom',
    chain: 'solana',
    supported: true
  },
  coinbase: {
    name: 'Coinbase Wallet',
    chain: 'ethereum',
    supported: true
  }
};
