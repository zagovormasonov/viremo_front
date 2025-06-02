import React from 'react';
import { supabase } from './supabase';

function AuthPage() {
  const signInWithGoogle = async () => {
    // Всегда запрашивать выбор аккаунта
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h2>Вход в приложение</h2>
      <button onClick={signInWithGoogle}>Войти через Google</button>
    </div>
  );
}

export default AuthPage;
