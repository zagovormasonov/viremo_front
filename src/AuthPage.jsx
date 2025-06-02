import { supabase } from './supabase';

export default function AuthPage() {
  const handleSignInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#121212',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <img
        src="/psychology-illustration.png"
        alt="Иллюстрация психологического сервиса"
        style={{
          width: '300px',
          maxWidth: '100%',
          marginBottom: '2rem',
          borderRadius: '16px',
        }}
      />
      <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
        Добро пожаловать в Viremo
      </h1>
      <p style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Ваш путь к осознанности и психологическому благополучию начинается здесь.
      </p>
      <button
        onClick={handleSignInWithGoogle}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#007AFF',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Войти через Google
      </button>
    </div>
  );
}
