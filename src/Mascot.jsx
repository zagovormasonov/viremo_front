import { useEffect, useState } from 'react';

const messages = [
  'Ты хорошо справляешься!',
  'Так держать!',
  'Ты молодец!',
  'Продолжай в том же духе!',
  'Горжусь тобой!',
];

function Mascot() {
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    let messageTimeout;
    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * messages.length);
      setCurrentMessage(messages[random]);

      messageTimeout = setTimeout(() => {
        setCurrentMessage('');
      }, 5000);
    }, 20000);

    return () => {
      clearInterval(interval);
      clearTimeout(messageTimeout);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 90, right: 10, zIndex: 1000 }}>
      {currentMessage && (
        <div style={{
          background: 'white',
          color: 'black',
          borderRadius: '10px',
          padding: '8px 12px',
          marginBottom: 8,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          maxWidth: 60,
          fontSize: 14,
          position: 'absolute',
          bottom: 110,
          right: 0,
          animation: 'fadeInOut 3s ease-in-out',
        }}>
          {currentMessage}
        </div>
      )}
      <img
        src="/mascot.png"
        loading="lazy"
        alt="Маскот"
        style={{
          width: 50,
          height: 'auto',
        }}
      />

      {/* Добавим анимацию через встроенные стили */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

export default Mascot;
