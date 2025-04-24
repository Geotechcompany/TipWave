import { CurrencyProvider } from '@/context/CurrencyContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
} 