'use client';
import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../../App';
import { SocketProvider } from '../../context/SocketContext';
import { AuthProvider } from '../../context/AuthContext';
import { TourProvider } from '../../context/TourContext';

const queryClient = new QueryClient();

export default function ClientApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by rendering only on the client
  if (!mounted) return null;

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
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
    </GoogleOAuthProvider>
  );
}
