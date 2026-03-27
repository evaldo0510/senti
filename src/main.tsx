import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './components/AuthProvider';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker
registerSW({ immediate: true });

console.log("SENTI App starting...");

try {
  console.log("Runtime ENV check:", {
    hasProcess: typeof process !== 'undefined',
    hasEnv: typeof process !== 'undefined' && !!process.env,
    hasGeminiKey: typeof process !== 'undefined' && process.env && !!process.env.GEMINI_API_KEY
  });
} catch (e) {
  console.error("Error checking runtime ENV:", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
