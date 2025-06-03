// src/pages/ArchivedCards.jsx
import React, { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

const ArchivedCards = () => {
  const session = useSession();
  const [archivedCards, setArchivedCards] = useState([]);

  useEffect(() => {
    if (session?.user) fetchArchivedCards();
  }, [session]);

  const fetchArchivedCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('archived', true)
      .order('created_at', { ascending: false });

    if (error) console.error('Ошибка при загрузке архивных карточек:', error.message);
    else setArchivedCards(data);
  };

  if (!session) return <div>Пожалуйста, войдите в аккаунт</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Архив</h2>
      <Link to="/" style={styles.backButton}>← Назад</Link>

      {archivedCards.length === 0 ? (
        <p style={{ color: 'white' }}>Архив пуст</p>
      ) : (
        archivedCards.map((card) => (
          <div key={card.id} style={styles.card}>
            <p><strong>Ситуация:</strong> {card.situation}</p>
            <p><strong>Мысли:</strong> {card.thoughts}</p>
            <p><strong>Эмоции:</strong> {card.emotions}</p>
            <p><strong>Поведение:</strong> {card.behavior}</p>
            <Link to={`/card/${card.id}`}>
              <button style={{ marginTop: 10 }}>Открыть</button>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    color: 'white',
    maxWidth: 800,
    margin: '0 auto',
  },
  title: {
    fontSize: 26,
    marginBottom: 10,
  },
  backButton: {
    color: '#90caf9',
    display: 'inline-block',
    marginBottom: 20,
    textDecoration: 'none',
  },
  card: {
    backgroundColor: 'rgb(51 50 50)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
};

export default ArchivedCards;
