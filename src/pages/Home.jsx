import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs } from 'antd'; // в начале файла

const Home = () => {
  const session = useSession();
  const [cards, setCards] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showArchiveMessage, setShowArchiveMessage] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    if (session?.user) fetchCards();
  }, [session, activeTab]);

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
    let query = supabase
      .from('cards')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (activeTab === 'archived') {
      query = query.eq('archived', true);
    } else {
      query = query.eq('archived', false);
      if (activeTab === 'new') query = query.eq('viewed', false);
      if (activeTab === 'completed') query = query.eq('viewed', true);
    }

    const { data, error } = await query;
    if (error) console.error('Ошибка загрузки карточек:', error.message);
    else setCards(data);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) console.error('Ошибка при удалении карточки:', error.message);
    else fetchCards();
  };

  const handleOpenCard = async (id) => {
    const { error } = await supabase
      .from('cards')
      .update({ viewed: true })
      .eq('id', id);
    if (error) console.error('Ошибка при обновлении карточки:', error.message);
    else fetchCards();
  };

  const handleArchiveCard = async (id) => {
    const { error } = await supabase
      .from('cards')
      .update({ archived: true })
      .eq('id', id);
    if (error) console.error('Ошибка при архивации:', error.message);
    else {
      fetchCards();
      setShowArchiveMessage(true);
      setTimeout(() => setShowArchiveMessage(false), 2000);
    }
  };

  const handleUnarchiveCard = async (id) => {
    const { error } = await supabase
      .from('cards')
      .update({ archived: false })
      .eq('id', id);
    if (error) console.error('Ошибка при восстановлении:', error.message);
    else fetchCards();
  };

  if (!session) return <div>Пожалуйста, войдите в аккаунт</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Сегодня</h1>

      <div style={styles.headerRow}>
        <h2 style={styles.subheader}>Упражнения</h2>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={styles.menuButton}>
            ⋮
          </button>
          {menuOpen && (
            <div style={styles.dropdownMenu}>
              <div style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                Опции (скоро)
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs
        defaultActiveKey="new"
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          { key: 'new', label: 'Новые' },
          { key: 'completed', label: 'Завершённые' },
          { key: 'archived', label: 'Архив' },
        ]}
      />

      <div style={{ marginTop: 20 }}>
        {cards.length === 0 ? (
          <p style={{ color: 'white' }}>Нет карточек</p>
        ) : (
          cards.map((card) => (
            <motion.div
              key={card.id}
              style={styles.cardWrapper}
              drag={activeTab !== 'archived' ? 'x' : false}
              dragConstraints={{ left: -100, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80 && activeTab !== 'archived') {
                  handleArchiveCard(card.id);
                }
              }}
            >
              {activeTab !== 'archived' && (
                <div style={styles.archiveBackground}>
                  <span style={styles.archiveButton}>← Архивировать</span>
                </div>
              )}

              <div style={styles.card}>
                <p><strong>Ситуация:</strong> {card.situation}</p>
                <p><strong>Мысли:</strong> {card.thoughts}</p>
                <p><strong>Эмоции:</strong> {card.emotions}</p>
                <p><strong>Поведение:</strong> {card.behavior}</p>

                <div style={{ marginTop: 10 }}>
                  <Link to={`/card/${card.id}`}>
                    <button
                      style={{ marginRight: 10 }}
                      onClick={() => handleOpenCard(card.id)}
                    >
                      Открыть
                    </button>
                  </Link>

                  {activeTab === 'archived' ? (
                    <button
                      onClick={() => handleUnarchiveCard(card.id)}
                      style={{ backgroundColor: '#4caf50', color: 'white' }}
                    >
                      Вернуть
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(card.id)}
                      style={{ backgroundColor: '#f44336', color: 'white' }}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showArchiveMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            style={styles.archiveMessage}
          >
            Карточка перемещена в раздел Архив
          </motion.div>
        )}
      </AnimatePresence>

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
    padding: '0 16px',
  },
  header: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subheader: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: 'white',
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
    width: 200,
  },
  dropdownItem: {
    padding: '10px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #444',
  },
  tabs: {
    display: 'flex',
    marginTop: 10,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    border: 'none',
    borderRadius: 10,
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cardWrapper: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 10,
  },
  archiveBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: '20px',
    width: 120,
    backgroundColor: '#ffa500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  archiveButton: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgb(51 50 50)',
    color: 'white',
    zIndex: 2,
    position: 'relative',
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
    marginTop: 20,
  },
  archiveMessage: {
    position: 'fixed',
    bottom: 100,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#444',
    color: 'white',
    padding: '12px 24px',
    borderRadius: 12,
    zIndex: 2000,
    fontWeight: 'bold',
  },
};

export default Home;
