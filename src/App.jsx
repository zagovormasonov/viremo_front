import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import AuthPage from './AuthPage';

function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Отслеживание изменений сессии
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    // Проверка текущей сессии при первом запуске
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Определение роли
  useEffect(() => {
    const fetchRole = async () => {
      if (!user?.id) {
        console.log("Нет user.id — выход");
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Ошибка при получении роли:", error.message);
        setLoading(false);
        return;
      }

      if (data?.role) {
        console.log("Роль найдена:", data.role);
        setRole(data.role);
      } else {
        const email = user.email;
        const newRole = email.endsWith('@viremo.com') ? 'psychologist' : 'client';

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({ id: user.id, email, role: newRole });

        if (upsertError) {
          console.error("Ошибка при upsert:", upsertError.message);
          setLoading(false);
          return;
        }

        console.log("Роль сохранена:", newRole);
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
