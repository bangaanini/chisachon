import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { useEffect } from 'react';

import { config } from '../wagmi';

// Extend the Window interface to include chatwootSDK
declare global {
  interface Window {
    chatwootSDK: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
  }
}

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Membuat elemen script untuk SDK Chatwoot
    const script = document.createElement('script');
    script.src = 'http://chat.chisachon.cloud/packs/js/sdk.js';  // Ganti dengan URL Chatwoot Anda
    script.defer = true;
    script.async = true;
    script.onload = () => {
      // Menjalankan SDK setelah script dimuat
      window.chatwootSDK.run({
        websiteToken: 'LS4Q2okJNEPJx5E81rFFH8Cj',  // Ganti dengan token yang sesuai
        baseUrl: 'http://chat.chisachon.cloud',  // Ganti dengan URL Chatwoot Anda
      });
    };
    document.body.appendChild(script);  // Menambahkan script ke body

    // Cleanup: Menghapus script ketika komponen di-unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <Component {...pageProps} />
          <ToastContainer 
  position="bottom-right"
  autoClose={5000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="dark"
/>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;

