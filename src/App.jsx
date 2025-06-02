import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import AuthPage from './AuthPage';
import RoleSelection from './RoleSelection';
import PsychologistDashboard from './PsychologistDashboard';

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // для ожидания fetch-а

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setUser(session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setUser(session.user);
      else {
        setUser(null);
        setRole(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data?.role) {
        setRole(data.role);
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

  if (!session) return <AuthPage />;
  if (loading) return <p>Загрузка...</p>;
  if (!role) return <RoleSelection userId={user.id} onSelect={setRole} />;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user?.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Аватар"
              style={{ width: '50px', height: '50px', borderRadius: '50%' }}
            />
          )}
          <span>Привет, {user?.user_metadata?.full_name || 'пользователь'}!</span>
        </div>
        <div>
          <button onClick={() => setRole(null)} style={{ marginRight: '1rem' }}>Сменить роль</button>
          <button onClick={handleSignOut}>Выйти</button>
        </div>
      </div>

      <hr style={{ margin: '1rem 0' }} />

      {role === 'client' && <h2>Вы вошли как <strong>Клиент</strong></h2>}
      {role === 'psychologist' && <PsychologistDashboard />}
    </div>
  );
}

export default App;
