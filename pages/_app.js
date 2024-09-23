import { ClerkProvider } from "@clerk/nextjs";
import { AlertProvider } from "../contexts/AlertContext.js";
import { useState, useEffect } from 'react';
import { AppLoader } from '../components/AppLoader';
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (remove this in production)
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ClerkProvider {...pageProps}>
      <AlertProvider>
        {isLoading && <AppLoader />}
        <Component {...pageProps} />
      </AlertProvider>
    </ClerkProvider>
  );
}

export default MyApp;