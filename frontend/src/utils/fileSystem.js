// File system utilities for Electron
export class FileSystemUtils {
  static async openFileDialog(options = {}) {
    try {
      const result = await window.electronAPI?.openFileDialog(options);
      return result;
    } catch (error) {
      console.error('Error opening file dialog:', error);
      return { success: false, error: error.message };
    }
  }

  static async saveFile(content, options = {}) {
    try {
      // This would use electron's dialog and fs modules
      const result = await window.electronAPI?.saveFile(content, options);
      return result;
    } catch (error) {
      console.error('Error saving file:', error);
      return { success: false, error: error.message };
    }
  }

  static async readFile(filePath) {
    try {
      const result = await window.electronAPI?.readFile(filePath);
      return result;
    } catch (error) {
      console.error('Error reading file:', error);
      return { success: false, error: error.message };
    }
  }

  static getFileIcon(extension) {
    const iconMap = {
      // Documents
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📄',
      // Code
      js: '📜',
      jsx: '⚛️',
      ts: '📘',
      tsx: '⚛️',
      py: '🐍',
      java: '☕',
      cpp: '⚙️',
      // Images
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      svg: '🖼️',
      // Audio
      mp3: '🎵',
      wav: '🎵',
      // Video
      mp4: '🎬',
      mov: '🎬',
      // Archives
      zip: '📦',
      rar: '📦',
      // Default
      default: '📁'
    };

    return iconMap[extension.toLowerCase()] || iconMap.default;
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static sanitizeFileName(name) {
    return name.replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, '_');
  }
}
