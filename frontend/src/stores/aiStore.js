import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAIStore = create(
  persist(
    (set, get) => ({
      // State
      currentModel: null,
      availableModels: [],
      modelConfigurations: {},
      isProcessing: false,
      lastResponse: null,
      responseHistory: [],
      modelPerformance: {},
      isConnected: false,
      connectionError: null,
      
      // Actions
      setCurrentModel: async (modelConfig) => {
        set({ isProcessing: true, connectionError: null });
        
        try {
          // Test connection to the new model
          const testResult = await window.electronAPI?.testAIConnection(modelConfig);
          
          if (testResult.success) {
            set({
              currentModel: {
                ...modelConfig,
                info: testResult.modelInfo,
                lastTested: new Date().toISOString()
              },
              isConnected: true,
              isProcessing: false,
              connectionError: null
            });
            
            // Save model configuration
            await get().saveModelConfiguration(modelConfig);
            
            return { success: true, modelInfo: testResult.modelInfo };
          } else {
            set({
              isProcessing: false,
              connectionError: testResult.error,
              isConnected: false
            });
            
            return { success: false, error: testResult.error };
          }
        } catch (error) {
          set({
            isProcessing: false,
            connectionError: error.message,
            isConnected: false
          });
          
          return { success: false, error: error.message };
        }
      },
      
      processCommand: async (command, context = {}) => {
        const { currentModel, isConnected } = get();
        
        if (!currentModel || !isConnected) {
          return {
            success: false,
            error: 'No AI model configured or connected'
          };
        }
        
        set({ isProcessing: true });
        
        try {
          const startTime = Date.now();
          const result = await window.electronAPI?.processCommand(command, context);
          const processingTime = Date.now() - startTime;
          
          if (result.success) {
            const response = {
              id: Date.now().toString(),
              command,
              response: result.response,
              timestamp: new Date().toISOString(),
              processingTime,
              modelUsed: currentModel.type,
              confidence: result.response.confidence || 0.8
            };
            
            // Update store state
            set((state) => ({
              isProcessing: false,
              lastResponse: response,
              responseHistory: [response, ...state.responseHistory.slice(0, 99)], // Keep last 100
              modelPerformance: {
                ...state.modelPerformance,
                [currentModel.type]: {
                  lastResponseTime: processingTime,
                  totalRequests: (state.modelPerformance[currentModel.type]?.totalRequests || 0) + 1,
                  averageResponseTime: calculateAverage(
                    state.modelPerformance[currentModel.type]?.averageResponseTime,
                    processingTime,
                    state.modelPerformance[currentModel.type]?.totalRequests || 0
                  )
                }
              }
            }));
            
            return {
              success: true,
              response: result.response,
              processingTime
            };
          } else {
            set({
              isProcessing: false,
              connectionError: result.error
            });
            
            return {
              success: false,
              error: result.error
            };
          }
        } catch (error) {
          set({
            isProcessing: false,
            connectionError: error.message
          });
          
          return {
            success: false,
            error: error.message
          };
        }
      },
      
      loadAvailableModels: async () => {
        try {
          const result = await window.electronAPI?.getModels();
          
          if (result.success) {
            set({ availableModels: result.models });
            return { success: true, models: result.models };
          } else {
            return { success: false, error: result.error };
          }
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      
      saveModelConfiguration: async (modelConfig) => {
        set((state) => ({
          modelConfigurations: {
            ...state.modelConfigurations,
            [modelConfig.type]: {
              ...modelConfig,
              lastUsed: new Date().toISOString()
            }
          }
        }));
      },
      
      switchModel: async (newModelType) => {
        const { modelConfigurations, availableModels } = get();
        const modelConfig = modelConfigurations[newModelType];
        
        if (!modelConfig) {
          // Create default configuration for this model type
          const modelInfo = availableModels.find(m => m.type === newModelType);
          const defaultConfig = {
            type: newModelType,
            name: modelInfo?.name || newModelType,
            config: {} // Will be filled during setup
          };
          
          return await get().setCurrentModel(defaultConfig);
        }
        
        return await get().setCurrentModel(modelConfig);
      },
      
      testModelConnection: async (modelConfig) => {
        set({ isProcessing: true, connectionError: null });
        
        try {
          const result = await window.electronAPI?.testAIConnection(modelConfig);
          
          set({
            isProcessing: false,
            connectionError: result.success ? null : result.error
          });
          
          return result;
        } catch (error) {
          set({
            isProcessing: false,
            connectionError: error.message
          });
          
          return { success: false, error: error.message };
        }
      },
      
      clearResponseHistory: () => {
        set({ responseHistory: [], lastResponse: null });
      },
      
      getResponseById: (responseId) => {
        const { responseHistory } = get();
        return responseHistory.find(response => response.id === responseId);
      },
      
      getModelPerformance: (modelType) => {
        const { modelPerformance } = get();
        return modelPerformance[modelType] || {
          lastResponseTime: 0,
          totalRequests: 0,
          averageResponseTime: 0
        };
      },
      
      getRecentCommands: (limit = 10) => {
        const { responseHistory } = get();
        return responseHistory.slice(0, limit).map(item => ({
          command: item.command,
          response: item.response.text,
          timestamp: item.timestamp,
          model: item.modelUsed
        }));
      },
      
      getUsageStatistics: () => {
        const { responseHistory, modelPerformance, currentModel } = get();
        
        const today = new Date().toDateString();
        const todayCommands = responseHistory.filter(
          item => new Date(item.timestamp).toDateString() === today
        );
        
        const totalCommands = responseHistory.length;
        const averageConfidence = responseHistory.length > 0 
          ? responseHistory.reduce((sum, item) => sum + item.confidence, 0) / responseHistory.length
          : 0;
        
        return {
          totalCommands,
          todayCommands: todayCommands.length,
          averageConfidence: Math.round(averageConfidence * 100) / 100,
          currentModel: currentModel?.type || 'None',
          modelPerformance
        };
      },
      
      exportConversationHistory: (format = 'json') => {
        const { responseHistory } = get();
        
        if (format === 'json') {
          return JSON.stringify(responseHistory, null, 2);
        } else if (format === 'csv') {
          // Convert to CSV format
          const headers = ['Timestamp', 'Command', 'Response', 'Model', 'Processing Time', 'Confidence'];
          const csvRows = responseHistory.map(item => [
            item.timestamp,
            `"${item.command.replace(/"/g, '""')}"`,
            `"${item.response.text.replace(/"/g, '""')}"`,
            item.modelUsed,
            item.processingTime,
            item.confidence
          ]);
          
          return [headers, ...csvRows].map(row => row.join(',')).join('\n');
        }
        
        return null;
      },
      
      resetAIStore: () => {
        set({
          currentModel: null,
          isProcessing: false,
          lastResponse: null,
          responseHistory: [],
          modelPerformance: {},
          isConnected: false,
          connectionError: null
        });
      }
    }),
    {
      name: 'ai-storage',
      partialize: (state) => ({
        currentModel: state.currentModel,
        modelConfigurations: state.modelConfigurations,
        responseHistory: state.responseHistory.slice(0, 50), // Only persist last 50
        modelPerformance: state.modelPerformance
      })
    }
  )
);

// Helper function to calculate running average
function calculateAverage(currentAverage, newValue, count) {
  return (currentAverage * count + newValue) / (count + 1);
}

// Additional utility functions for the AI store
export const AIStoreUtils = {
  getModelDisplayName: (modelType) => {
    const modelNames = {
      'deepseek': 'DeepSeek AI',
      'openai': 'OpenAI GPT-4',
      'llama': 'Local Llama 2',
      'anthropic': 'Anthropic Claude'
    };
    
    return modelNames[modelType] || modelType;
  },
  
  getModelCapabilities: (modelType) => {
    const capabilities = {
      'deepseek': ['Advanced reasoning', 'Coding assistance', 'Mathematical problem solving'],
      'openai': ['Creative writing', 'Complex analysis', 'Conversational AI'],
      'llama': ['Complete privacy', 'Offline operation', 'General purpose'],
      'anthropic': ['Enterprise focus', 'Safe responses', 'Business applications']
    };
    
    return capabilities[modelType] || ['General AI capabilities'];
  },
  
  getModelRequirements: (modelType) => {
    const requirements = {
      'deepseek': 'API key required',
      'openai': 'API key required, pay-per-use',
      'llama': '8GB+ RAM, 4GB storage',
      'anthropic': 'API key required, business pricing'
    };
    
    return requirements[modelType] || 'No special requirements';
  },
  
  formatResponseTime: (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  },
  
  calculateConfidenceLevel: (confidence) => {
    if (confidence >= 0.9) return { level: 'high', color: 'text-green-400' };
    if (confidence >= 0.7) return { level: 'medium', color: 'text-yellow-400' };
    return { level: 'low', color: 'text-red-400' };
  }
};
