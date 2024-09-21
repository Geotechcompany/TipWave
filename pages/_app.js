// pages/_app.js
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <DefaultSeo {...SEO} />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

// next-seo.config.js
export default {
  title: 'DJ TipSync',
  description: 'Interactive DJ tipping platform',
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://www.djtipsync.com/',
    site_name: 'DJ TipSync',
  },
  twitter: {
    handle: '@djtipsync',
    site: '@djtipsync',
    cardType: 'summary_large_image',
  },
};

// Example of dynamic imports for performance
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});

// Use Next.js Image component for optimized images
import Image from 'next/image';

const OptimizedImage = () => (
  <Image
    src="/path-to-image.jpg"
    alt="Description"
    width={500}
    height={500}
  />
);