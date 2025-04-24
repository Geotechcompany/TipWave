import { CurrencyProvider } from '@/context/CurrencyContext';
import { SessionProvider } from "next-auth/react";
import { AlertProvider } from "../contexts/AlertContext.js";
import { useState, useEffect } from 'react';
import { AppLoader } from '../components/AppLoader';
import "../styles/globals.css";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (remove this in production)
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SessionProvider session={session}>
      <CurrencyProvider>
        <AlertProvider>
          {isLoading && <AppLoader />}
          <Component {...pageProps} />
        </AlertProvider>
      </CurrencyProvider>
    </SessionProvider>
  );
}

export default MyApp;