import { useEffect, useState } from 'react';

export const useMidtrans = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMidtrans = async () => {
      try {
        const res = await fetch('/api/payment/config');
        const data = await res.json();

        if (!data.clientKey) {
          setError('Payment Gateway not configured');
          return;
        }

        // If script already exists, do not add again
        if (document.getElementById('midtrans-script')) {
          setIsLoaded(true);
          return;
        }

        const script = document.createElement('script');
        script.id = 'midtrans-script';
        script.type = 'text/javascript';
        script.src = data.isProduction
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', data.clientKey);
        
        script.onload = () => {
          setIsLoaded(true);
        };
        script.onerror = () => {
          setError('Failed to load Midtrans script');
        };

        document.body.appendChild(script);
      } catch (err: any) {
        setError(err.message);
      }
    };

    loadMidtrans();
  }, []);

  return { isLoaded, error };
};
