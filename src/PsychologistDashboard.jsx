import { useEffect, useState } from 'react';
import { supabase } from './supabase';

function PsychologistDashboard() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'client');

      if (data) setClients(data);
    };

    fetchClients();
  }, []);

  return (
    <div>
      <h2>Ваши клиенты:</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {clients.map((client) => (
          <li key={client.id} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={client.avatar_url || 'https://via.placeholder.com/40'}
              alt={client.full_name}
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            />
            <span>{client.full_name || 'Без имени'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PsychologistDashboard;
