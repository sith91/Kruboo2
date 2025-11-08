import { useState, useCallback } from 'react';
import { useConfigStore } from '../stores/configStore';

export const useBlockchain = () => {
  const { features } = useConfigStore();
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentWallet, setCurrentWallet] = useState(null);
  const [did, setDid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = useCallback(async (walletType) => {
    if (!features.includes('blockchain')) {
      throw new Error('Blockchain features not enabled');
    }

    setIsLoading(true);
    try {
      const result = await window.electronAPI?.connectWallet(walletType);
      
      if (result.success) {
        setWalletConnected(true);
        setCurrentWallet({
          type: walletType,
          address: result.address,
          chainId: result.chainId
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [features]);

  const disconnectWallet = useCallback(() => {
    setWalletConnected(false);
    setCurrentWallet(null);
    setDid(null);
  }, []);

  const createDID = useCallback(async (options = {}) => {
    if (!walletConnected) {
      throw new Error('Wallet must be connected to create DID');
    }

    setIsLoading(true);
    try {
      const result = await window.electronAPI?.createDID(options);
      
      if (result.success) {
        setDid(result.did);
      }
      
      return result;
    } catch (error) {
      console.error('Error creating DID:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [walletConnected]);

  const signMessage = useCallback(async (message) => {
    if (!walletConnected) {
      throw new Error('Wallet must be connected to sign messages');
    }

    try {
      // This would use the appropriate wallet SDK
      // For now, simulate signing
      return {
        success: true,
        signature: '0x' + Array.from({ length: 130 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        message
      };
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }, [walletConnected]);

  const verifySignature = useCallback(async (message, signature, address) => {
    try {
      const result = await window.electronAPI?.verifySignature(message, signature, address);
      return result;
    } catch (error) {
      console.error('Error verifying signature:', error);
      throw error;
    }
  }, []);

  const getWalletInfo = useCallback(() => {
    if (!walletConnected) return null;

    return {
      ...currentWallet,
      did,
      isConnected: walletConnected
    };
  }, [walletConnected, currentWallet, did]);

  return {
    // State
    walletConnected,
    currentWallet,
    did,
    isLoading,
    
    // Actions
    connectWallet,
    disconnectWallet,
    createDID,
    signMessage,
    verifySignature,
    getWalletInfo,
    
    // Feature checks
    hasBlockchainAccess: features.includes('blockchain'),
    isWalletConnected: walletConnected,
    hasDID: !!did
  };
};
