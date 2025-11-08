import { useState, useCallback } from 'react';
import { useConfigStore } from '../stores/configStore';

export const useSystemIntegration = () => {
  const { features } = useConfigStore();
  const [systemInfo, setSystemInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const openApplication = useCallback(async (appName) => {
    if (!features.includes('apps')) {
      throw new Error('Application control feature not enabled');
    }

    try {
      const result = await window.electronAPI?.openApplication(appName);
      return result;
    } catch (error) {
      console.error('Error opening application:', error);
      throw error;
    }
  }, [features]);

  const searchFiles = useCallback(async (query, directory = '.') => {
    if (!features.includes('filesystem')) {
      throw new Error('File system access feature not enabled');
    }

    try {
      const result = await window.electronAPI?.searchFiles(query, directory);
      return result;
    } catch (error) {
      console.error('Error searching files:', error);
      throw error;
    }
  }, [features]);

  const getSystemInfo = useCallback(async () => {
    if (!features.includes('monitoring')) {
      throw new Error('System monitoring feature not enabled');
    }

    setIsLoading(true);
    try {
      const result = await window.electronAPI?.getSystemInfo();
      setSystemInfo(result);
      return result;
    } catch (error) {
      console.error('Error getting system info:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [features]);

  const executeCommand = useCallback(async (command) => {
    if (!features.includes('automation')) {
      throw new Error('Task automation feature not enabled');
    }

    try {
      const result = await window.electronAPI?.executeSystemCommand(command);
      return result;
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }
  }, [features]);

  const checkFeatureAccess = useCallback((feature) => {
    return features.includes(feature);
  }, [features]);

  const getAvailableFeatures = useCallback(() => {
    return features;
  }, [features]);

  return {
    systemInfo,
    isLoading,
    openApplication,
    searchFiles,
    getSystemInfo,
    executeCommand,
    checkFeatureAccess,
    getAvailableFeatures,
    hasAppControl: features.includes('apps'),
    hasFileAccess: features.includes('filesystem'),
    hasWebSearch: features.includes('websearch'),
    hasEmailAccess: features.includes('email'),
    hasAutomation: features.includes('automation'),
    hasMonitoring: features.includes('monitoring')
  };
};
