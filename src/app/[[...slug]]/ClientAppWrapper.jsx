"use client";

import dynamic from 'next/dynamic';

// Dynamically import the ClientApp with ssr: false so it only renders on the client.
// This is critical to avoid hydration mismatches with React Router.
const ClientApp = dynamic(() => import('./ClientApp'), { ssr: false });

export default function ClientAppWrapper() {
  return <ClientApp />;
}
