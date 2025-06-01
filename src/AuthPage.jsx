import { supabase } from './supabaseClient';

export default function AuthPage() {
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <div>
      <h2>Вход через Google</h2>
      <button onClick={handleSignIn}>Войти</button>
    </div>
  );
}
