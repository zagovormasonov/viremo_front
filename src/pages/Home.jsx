import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

const Home = () => {
  const session = useSession();
  const [cards, setCards] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    if (session) fetchCards();
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      {/* Заголовок + Меню */}
      <div style={styles.headerRow}>
        <h2 style={styles.subheader}>Упражнения</h2>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={styles.menuButton}
          >
            ⋮
          </button>
          {menuOpen && (
            <div style={styles.dropdownMenu}>
              <div style={styles.dropdownItem} onClick={() => alert('Добавлено в избранное')}>
                В избранное
              </div>
              <div style={styles.dropdownItem} onClick={() => alert('Отправлено психологу')}>
                Отправить психологу
              </div>
            </div>
          )}
        </div>
      </div>

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
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subheader: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
  menuButton: {
    fontSize: '24px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 30,
    right: 0,
    background: '#2d2d2d',
    color: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    zIndex: 999,
    width: 180,
  },
  dropdownItem: {
    padding: '10px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #444',
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
    width: '100%',
    borderRadius: '12px',
    backgroundColor: 'rgb(45 124 242)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    zIndex: 1000,
  },
};

export default Home;
