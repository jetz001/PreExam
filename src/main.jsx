import './suppressWarnings';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { TourProvider } from './context/TourContext';

const queryClient = new QueryClient();

const fallbackClientId = '344062096565-4lrdvepsa1hsp75863jiorll6qp4q78a.apps.googleusercontent.com';
let googleClientId = fallbackClientId;

try {
  if (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_VITE_GOOGLE_CLIENT_ID) {
    googleClientId = process.env.NEXT_PUBLIC_VITE_GOOGLE_CLIENT_ID;
  } else if (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  } else if (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env.NEXT_PUBLIC_VITE_GOOGLE_CLIENT_ID) {
    googleClientId = import.meta.env.NEXT_PUBLIC_VITE_GOOGLE_CLIENT_ID;
  }
} catch (e) {
  // Ignore
}

// Clean any potential whitespace or newlines
googleClientId = googleClientId?.trim() || fallbackClientId;

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <TourProvider>
            <BrowserRouter>
              <HelmetProvider>
                <App />
              </HelmetProvider>
            </BrowserRouter>
          </TourProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>,
);
