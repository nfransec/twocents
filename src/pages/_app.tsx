import { AppProps } from 'next/app';
import { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Only redirect if it's not a Gmail-related endpoint
          const isGmailEndpoint = error.config.url?.includes('/api/gmail') || 
                                 error.config.url?.includes('/api/auth/gmail')
          if (!isGmailEndpoint) {
            localStorage.removeItem('auth_token');
            router.push('/login');
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;
