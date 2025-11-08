import { useState, useCallback } from 'react';
import { useConfigStore } from '../stores/configStore';

export const useAIModels = () => {
  const { aiModel, setAIModel } = useConfigStore();
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const testModelConnection = useCallback(async (modelConfig) => {
    setIsTesting(true);
    setTestResults(null);

    try {
      const result = await window.electronAPI?.testAIConnection(modelConfig);
      setTestResults(result);
      return result.success;
    } catch (error) {
      setTestResults({
        success: false,
        error: error.message
      });
      return false;
    } finally {
      setIsTesting(false);
    }
  }, []);

  const configureModel = useCallback(async (modelConfig) => {
    const success = await testModelConnection(modelConfig);
    if (success) {
      await setAIModel(modelConfig);
    }
    return success;
  }, [testModelConnection, setAIModel]);

  const processCommand = useCallback(async (command, context = {}) => {
    if (!aiModel) {
      throw new Error('No AI model configured');
    }

    try {
      const result = await window.electronAPI?.processCommand(command, context);
      return result;
    } catch (error) {
      console.error('Error processing command:', error);
      throw error;
    }
  }, [aiModel]);

  const switchModel = useCallback(async (newModelConfig) => {
    return await configureModel(newModelConfig);
  }, [configureModel]);

  const getModelInfo = useCallback(() => {
    if (!aiModel) return null;

    return {
      type: aiModel.model,
      isLocal: aiModel.model === 'llama',
      supports: {
        coding: aiModel.model === 'deepseek',
        creative: aiModel.model === 'openai',
        privacy: aiModel.model === 'llama',
        business: aiModel.model === 'anthropic'
      }
    };
  }, [aiModel]);

  return {
    currentModel: aiModel,
    isTesting,
    testResults,
    testModelConnection,
    configureModel,
    processCommand,
    switchModel,
    getModelInfo
  };
};
