import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import AuthPage from './AuthPage';

function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    // Проверка текущей сессии
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data?.role) {
        setRole(data.role);
      } else {
        const email = user.email;
        const newRole = email.endsWith('@viremo.com') ? 'psychologist' : 'client';

        await supabase
          .from('profiles')
          .upsert({ id: user.id, email, role: newRole });

        setRole(newRole);
      }

      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
  };

  if (loading) return <p>Загрузка...</p>;

  if (!session) return <AuthPage />;

  if (role === 'psychologist') {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Личный кабинет психолога</h2>
        <p>Добро пожаловать, {user.email}</p>
        <h4>Тестовые клиенты:</h4>
        <ul>
          <li>Иван Иванов</li>
          <li>Мария Петрова</li>
          <li>Алексей Смирнов</li>
        </ul>
        <button onClick={handleSignOut}>Выйти</button>
      </div>
    );
  }

  if (role === 'client') {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Главная клиента</h2>
        <p>Здравствуйте, {user.email}</p>
        <button onClick={handleSignOut}>Выйти</button>
      </div>
    );
  }

  return <p>Определение роли...</p>;
}

export default App;
