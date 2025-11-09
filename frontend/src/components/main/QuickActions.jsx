import React from 'react';
import { motion } from 'framer-motion';
import { useAIStore } from '../../stores/aiStore';
import { 
  Search, 
  FileText, 
  Mail, 
  Calendar,
  Settings,
  Zap,
  Folder,
  Cpu
} from 'lucide-react';

const QuickActions = () => {
  const { processCommand } = useAIStore();

  const quickActions = [
    {
      icon: Search,
      label: 'Web Search',
      command: 'Search for latest AI developments',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FileText,
      label: 'Find File',
      command: 'Find my recent documents',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Mail,
      label: 'Check Email',
      command: 'Check my new emails',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Calendar,
      label: 'Schedule',
      command: 'What\'s on my calendar today?',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      label: 'System Info',
      command: 'Show system status and resource usage',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: Folder,
      label: 'Open Apps',
      command: 'Open file explorer',
      color: 'from-gray-500 to-slate-500'
    }
  ];

  const handleQuickAction = async (command) => {
    await processCommand(command, {
      source: 'quick_action',
      timestamp: new Date()
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickAction(action.command)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-all duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-1">{action.label}</h3>
            <p className="text-gray-400 text-xs">{action.command}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
