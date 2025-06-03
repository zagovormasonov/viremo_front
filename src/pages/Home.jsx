import React, { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

const Home = () => {
  const session = useSession();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (session) fetchCards();
  }, [session]);

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка загрузки карточек:', error.message);
    } else {
      setCards(data);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) {
      console.error('Ошибка при удалении карточки:', error.message);
    } else {
      fetchCards();
    }
  };

  if (!session) {
    return <div>Пожалуйста, войдите в аккаунт</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Сегодня</h1>
      <h2 style={styles.header}>Упражнения</h2>

      <div style={{ marginTop: 20 }}>
        {cards.map((card) => (
          <div key={card.id} style={styles.card}>
            <p><strong>Ситуация:</strong> {card.situation}</p>
            <p><strong>Мысли:</strong> {card.thoughts}</p>
            <p><strong>Эмоции:</strong> {card.emotions}</p>
            <p><strong>Поведение:</strong> {card.behavior}</p>
            <Link to={`/card/${card.id}`}>
              <button style={{ marginRight: 10 }}>Открыть</button>
            </Link>
            <button
              onClick={() => handleDelete(card.id)}
              style={{ backgroundColor: '#f44336', color: 'white' }}
            >
              Удалить
            </button>
          </div>
        ))}
      </div>

      <Link to="/create">
        <button style={styles.generateButton}>Сгенерировать упражнения</button>
      </Link>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    padding: 20,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: 'rgb(51 50 50)',
    color: 'white',
  },
  generateButton: {
    bottom: 20,
    padding: '14px 28px',
    fontSize: '16px',
    borderRadius: '12px',
    backgroundColor: 'rgb(45 124 242)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    zIndex: 1000,
  },
};

export default Home;
