import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';

const Layout = ({ children, className = '' }) => {
  const { user } = useAuthStore();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${className}`}>
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-purple-900/20"></div>
        
        {/* Animated dots */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 AI Assistant. Your privacy-first companion.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Connected as {user.name || user.email || 'User'}</span>
                </div>
              )}
              <button className="hover:text-white transition-colors">
                Privacy
              </button>
              <button className="hover:text-white transition-colors">
                Settings
              </button>
              <button className="hover:text-white transition-colors">
                Help
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
