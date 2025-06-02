import React from 'react';
import { supabase } from './supabase';

function RoleSelection({ userId, onSelect }) {
  const selectRole = async (role) => {
    // сохраняем роль в Supabase
    await supabase.from('profiles').upsert({ id: userId, role });
    onSelect(role);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h2>Выберите роль</h2>
      <button onClick={() => selectRole('client')} style={{ margin: '1rem' }}>
        Войти как Клиент
      </button>
      <button onClick={() => selectRole('psychologist')} style={{ margin: '1rem' }}>
        Войти как Психолог
      </button>
    </div>
  );
}

export default RoleSelection;
