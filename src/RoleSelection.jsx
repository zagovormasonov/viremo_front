import { supabase } from './supabaseClient';

export default function RoleSelection({ onSelect }) {
  const selectRole = async (role) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').upsert({ id: user.id, role });
    onSelect(role);
  };

  return (
    <div>
      <h2>Выберите роль:</h2>
      <button onClick={() => selectRole('client')}>Клиент</button>
      <button onClick={() => selectRole('psychologist')}>Психолог</button>
    </div>
  );
}
