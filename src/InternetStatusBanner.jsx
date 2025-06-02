import { useEffect, useState } from 'react';

function InternetStatusBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      backgroundColor: '#ffdddd',
      color: '#a00',
      padding: '0.5rem',
      textAlign: 'center',
      position: 'fixed',
      top: 40,
      left: 0,
      right: 0,
      zIndex: 2000,
    }}>
      🔌 Проверьте ваше подключение к сети Интернет
    </div>
  );
}

export default InternetStatusBanner;
