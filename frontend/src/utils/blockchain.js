// Blockchain and Web3 utilities
export class BlockchainUtils {
  static async connectWallet(walletType) {
    try {
      const result = await window.electronAPI?.connectWallet(walletType);
      return result;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return { success: false, error: error.message };
    }
  }

  static async createDID(options = {}) {
    try {
      const result = await window.electronAPI?.createDID(options);
      return result;
    } catch (error) {
      console.error('Error creating DID:', error);
      return { success: false, error: error.message };
    }
  }

  static validateEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  static shortenAddress(address, chars = 4) {
    if (!address) return '';
    return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
  }

  static async signMessage(message, walletType) {
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
      return { success: false, error: error.message };
    }
  }

  static async verifySignature(message, signature, address) {
    try {
      // This would verify the signature against the address
      // For now, simulate verification
      return { success: true, verified: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// DID (Decentralized Identifier) utilities
export class DIDManager {
  static methods = {
    ethr: 'did:ethr',
    web: 'did:web',
    key: 'did:key'
  };

  static async resolveDID(did) {
    try {
      // This would resolve the DID to a DID Document
      // For now, return mock data
      return {
        success: true,
        document: {
          '@context': 'https://www.w3.org/ns/did/v1',
          id: did,
          verificationMethod: [{
            id: `${did}#keys-1`,
            type: 'EcdsaSecp256k1VerificationKey2019',
            controller: did,
            publicKeyHex: '02...'
          }]
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async createVerifiableCredential(issuer, subject, claims) {
    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      id: `urn:uuid:${crypto.randomUUID()}`,
      type: ['VerifiableCredential', 'AIAssistantIdentity'],
      issuer: issuer,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: subject,
        ...claims
      }
    };

    return credential;
  }
}
