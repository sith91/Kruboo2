import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Clock, User, Bot, Copy, Play, Trash2 } from 'lucide-react';

const CommandHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, voice, text, system
  const [selectedCommand, setSelectedCommand] = useState(null);

  // Mock command history - replace with actual data from store
  const commandHistory = useMemo(() => [
    {
      id: 1,
      type: 'voice',
      command: 'Open Chrome browser',
      response: "I'll open Chrome for you right away.",
      timestamp: new Date(Date.now() - 300000),
      success: true,
      actions: ['open_app:chrome']
    },
    {
      id: 2,
      type: 'text',
      command: 'What is the weather today?',
      response: "I don't have access to real-time weather data yet, but I can help you search for it online.",
      timestamp: new Date(Date.now() - 600000),
      success: true,
      actions: []
    },
    {
      id: 3,
      type: 'voice',
      command: 'Create a new document called project plan',
      response: "I've created a new document called 'project plan' in your Documents folder.",
      timestamp: new Date(Date.now() - 900000),
      success: true,
      actions: ['create_file:project_plan']
    },
    {
      id: 4,
      type: 'system',
      command: 'Check system resources',
      response: "Your system is running well. CPU: 45%, Memory: 60%, Disk: 75% free.",
      timestamp: new Date(Date.now() - 1200000),
      success: true,
      actions: ['system_info']
    }
  ], []);

  const filteredHistory = useMemo(() => {
    return commandHistory.filter(item => {
      const matchesSearch = item.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.response.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || item.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [commandHistory, searchTerm, filter]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const replayCommand = (command) => {
    // This would re-execute the command
    console.log('Replaying command:', command);
  };

  const deleteCommand = (id) => {
    // This would remove the command from history
    console.log('Deleting command:', id);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search commands and responses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">All Types</option>
            <option value="voice">Voice</option>
            <option value="text">Text</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Command List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedCommand === item.id
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => setSelectedCommand(selectedCommand === item.id ? null : item.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.type === 'voice' ? 'bg-purple-500' :
                    item.type === 'text' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}>
                    {item.type === 'voice' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : item.type === 'text' ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <Clock className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {item.command}
                    </div>
                    <div className="flex items-center text-gray-400 text-xs mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(item.timestamp)}
                      <span className="mx-2">•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        item.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      replayCommand(item.command);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Replay command"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.command);
                    }}
                    className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                    title="Copy command"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCommand(item.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {selectedCommand === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 border-t border-white/10">
                      {/* Response */}
                      <div className="mb-3">
                        <div className="text-gray-400 text-sm font-medium mb-2">Response</div>
                        <div className="bg-black/30 rounded-lg p-3">
                          <p className="text-white text-sm">{item.response}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      {item.actions && item.actions.length > 0 && (
                        <div>
                          <div className="text-gray-400 text-sm font-medium mb-2">Actions Performed</div>
                          <div className="flex flex-wrap gap-2">
                            {item.actions.map((action, actionIndex) => (
                              <span
                                key={actionIndex}
                                className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                              >
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No commands found</p>
            {searchTerm && (
              <p className="text-sm mt-2">Try adjusting your search terms</p>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <div className="text-gray-400 text-sm">
          Showing {filteredHistory.length} of {commandHistory.length} commands
        </div>
        <button
          onClick={() => {
            setSearchTerm('');
            setFilter('all');
          }}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
};

export default CommandHistory;
