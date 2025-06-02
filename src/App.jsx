import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import AuthPage from './AuthPage';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CardDetails from './pages/CardDetails';

function TabBar() {
  const location = useLocation();
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-around',
      padding: '1rem',
      backgroundColor: '#f0f0f0',
      borderTop: '1px solid #ccc',
      zIndex: 1000,
    }}>
      <Link to="/" style={{ color: location.pathname === '/' ? 'blue' : 'black' }}>🏠 Главная</Link>
      <Link to="/profile" style={{ color: location.pathname === '/profile' ? 'blue' : 'black' }}>👤 Профиль</Link>
      <Link to="/settings" style={{ color: location.pathname === '/settings' ? 'blue' : 'black' }}>⚙️ Настройки</Link>
    </div>
  );
}

function FixedHeader() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 40,
      backgroundColor: 'rgb(36 36 36)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <img src="/logo.png" alt="Логотип" style={{ height: 20 }} />
    </div>
  );
}

function ClientApp({ user, onSignOut }) {
  const location = useLocation();

  const renderUserHeader = () => (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: '80px', marginBottom: '1rem', padding: '0 1rem' }}>
      <img
        src={user.user_metadata?.avatar_url}
        alt="Аватар"
        style={{ width: 50, height: 50, borderRadius: '50%', marginRight: 12 }}
      />
      <p>{user.email}</p>
    </div>
  );

  return (
    <div style={{ paddingBottom: '80px' }}>
      <FixedHeader />
      {renderUserHeader()}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/card/:id" element={<CardDetails />} />
      </Routes>
      <TabBar />
      <div style={{ padding: '1rem' }}>
        <button onClick={onSignOut}>Выйти</button>
      </div>
    </div>
  );
}

function PsychologistApp({ user, onSignOut }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Личный кабинет психолога</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <img
          src={user.user_metadata?.avatar_url}
          alt="Аватар"
          style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '1rem' }}
        />
        <p>{user.email}</p>
      </div>
      <h4>Тестовые клиенты:</h4>
      <ul>
        <li>Иван Иванов</li>
        <li>Мария Петрова</li>
        <li>Алексей Смирнов</li>
      </ul>
      <button onClick={onSignOut}>Выйти</button>
    </div>
  );
}

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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user?.id) {
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
        setRole(data.role);
      } else {
        const email = user.email;
        const newRole = email.endsWith('@viremo.com') ? 'psychologist' : 'client';

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email,
            role: newRole,
          });

        if (upsertError) {
          console.error("Ошибка при сохранении роли:", upsertError.message);
          setLoading(false);
          return;
        }

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
  };

  if (loading) return <p>Загрузка...</p>;
  if (!session) return <AuthPage />;

  if (role === 'psychologist') {
    return <PsychologistApp user={user} onSignOut={handleSignOut} />;
  }

  if (role === 'client') {
    return <ClientApp user={user} onSignOut={handleSignOut} />;
  }

  return <p>Определение роли...</p>;
}

export default App;
