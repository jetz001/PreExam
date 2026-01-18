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

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
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
