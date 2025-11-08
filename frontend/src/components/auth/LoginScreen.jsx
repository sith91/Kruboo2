import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { 
  Wallet, 
  Mail, 
  Github, 
  Chrome, 
  Apple,
  Shield,
  ArrowLeft
} from 'lucide-react';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { loginWithWallet, loginWithSocial, loginWithEmail, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeMethod, setActiveMethod] = useState(null);

  const walletOptions = [
    { id: 'metamask', name: 'MetaMask', icon: Chrome, color: 'bg-orange-500' },
    { id: 'walletconnect', name: 'WalletConnect', icon: Shield, color: 'bg-blue-500' },
    { id: 'phantom', name: 'Phantom', icon: '🔮', color: 'bg-purple-500' },
    { id: 'coinbase', name: 'Coinbase', icon: Wallet, color: 'bg-blue-600' }
  ];

  const socialOptions = [
    { id: 'google', name: 'Google', icon: Chrome, color: 'bg-red-500' },
    { id: 'github', name: 'GitHub', icon: Github, color: 'bg-gray-800' },
    { id: 'apple', name: 'Apple', icon: Apple, color: 'bg-black' }
  ];

  const handleWalletLogin = async (walletType) => {
    try {
      await loginWithWallet(walletType);
      navigate('/setup/language');
    } catch (error) {
      console.error('Wallet login failed:', error);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      await loginWithSocial(provider);
      navigate('/setup/language');
    } catch (error) {
      console.error('Social login failed:', error);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      navigate('/setup/language');
    } catch (error) {
      console.error('Email login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/welcome')}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Choose Login Method
          </h1>
          <p className="text-gray-400">
            Select your preferred authentication method
          </p>
        </motion.div>

        {/* Login Methods */}
        <div className="space-y-4">
          {/* Wallet Login */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <button
              onClick={() => setActiveMethod(activeMethod === 'wallet' ? null : 'wallet')}
              className="w-full flex items-center justify-between text-white font-semibold"
            >
              <div className="flex items-center">
                <Wallet className="w-5 h-5 mr-3" />
                Wallet Login
              </div>
              <div className={`transform transition-transform ${activeMethod === 'wallet' ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>
            
            {activeMethod === 'wallet' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-3"
              >
                <p className="text-sm text-gray-400 mb-4">
                  Connect your wallet to create decentralized identity
                </p>
                {walletOptions.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletLogin(wallet.id)}
                    disabled={isLoading}
                    className="w-full flex items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 disabled:opacity-50"
                  >
                    <div className={`w-8 h-8 ${wallet.color} rounded-lg flex items-center justify-center mr-3`}>
                      {typeof wallet.icon === 'string' ? (
                        <span>{wallet.icon}</span>
                      ) : (
                        <wallet.icon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-white font-medium">{wallet.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Social Login */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <button
              onClick={() => setActiveMethod(activeMethod === 'social' ? null : 'social')}
              className="w-full flex items-center justify-between text-white font-semibold"
            >
              <div className="flex items-center">
                <Chrome className="w-5 h-5 mr-3" />
                Social Login
              </div>
              <div className={`transform transition-transform ${activeMethod === 'social' ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>
            
            {activeMethod === 'social' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-3"
              >
                <p className="text-sm text-gray-400 mb-4">
                  Enhanced privacy available with blockchain identity
                </p>
                {socialOptions.map((social) => (
                  <button
                    key={social.id}
                    onClick={() => handleSocialLogin(social.id)}
                    disabled={isLoading}
                    className="w-full flex items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 disabled:opacity-50"
                  >
                    <div className={`w-8 h-8 ${social.color} rounded-lg flex items-center justify-center mr-3`}>
                      <social.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">Continue with {social.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Email Login */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <button
              onClick={() => setActiveMethod(activeMethod === 'email' ? null : 'email')}
              className="w-full flex items-center justify-between text-white font-semibold"
            >
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3" />
                Email & Password
              </div>
              <div className={`transform transition-transform ${activeMethod === 'email' ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>
            
            {activeMethod === 'email' && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleEmailLogin}
                className="mt-4 space-y-4"
              >
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
