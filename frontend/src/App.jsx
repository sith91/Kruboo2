import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useConfigStore } from './stores/configStore';
import LoadingScreen from './components/shared/LoadingScreen';
import WelcomeScreen from './components/auth/WelcomeScreen';
import LoginScreen from './components/auth/LoginScreen';
import LanguageSetup from './components/setup/LanguageSetup';
import VoiceConfiguration from './components/setup/VoiceConfiguration';
import ModelConfiguration from './components/setup/ModelConfiguration';
import MicrophoneSetup from './components/setup/MicrophoneSetup';
import FeatureSelection from './components/setup/FeatureSelection';
import Dashboard from './components/main/Dashboard';
import './styles/globals.css';

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { setupComplete } = useConfigStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/welcome" 
            element={!isAuthenticated ? <WelcomeScreen /> : <Navigate to="/setup" />} 
          />
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginScreen /> : <Navigate to="/setup" />} 
          />
          
          {/* Setup Routes */}
          <Route 
            path="/setup/language" 
            element={isAuthenticated && !setupComplete ? <LanguageSetup /> : <Navigate to="/" />} 
          />
          <Route 
            path="/setup/voice" 
            element={isAuthenticated && !setupComplete ? <VoiceConfiguration /> : <Navigate to="/" />} 
          />
          <Route 
            path="/setup/model" 
            element={isAuthenticated && !setupComplete ? <ModelConfiguration /> : <Navigate to="/" />} 
          />
          <Route 
            path="/setup/microphone" 
            element={isAuthenticated && !setupComplete ? <MicrophoneSetup /> : <Navigate to="/" />} 
          />
          <Route 
            path="/setup/features" 
            element={isAuthenticated && !setupComplete ? <FeatureSelection /> : <Navigate to="/" />} 
          />
          
          {/* Main App */}
          <Route 
            path="/" 
            element={isAuthenticated && setupComplete ? <Dashboard /> : <Navigate to="/welcome" />} 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
