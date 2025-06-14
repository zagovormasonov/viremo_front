import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, Button, FloatButton } from 'antd';
import { Plus } from 'lucide-react';

const Home = () => {
  const session = useSession();
  const [cards, setCards] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showArchiveMessage, setShowArchiveMessage] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    if (session && session.user) {
      fetchCards(activeTab);
    }
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

  const fetchCards = async (tab) => {
    if (!session || !session.user) return;

    let query = supabase
      .from('cards')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (tab === 'archived') {
      query = query.eq('archived', true);
    } else {
      query = query.eq('archived', false);
      if (tab === 'new') query = query.eq('viewed', false);
      if (tab === 'completed') query = query.eq('viewed', true);
    }

    const { data, error } = await query;
    if (error) console.error('Ошибка загрузки карточек:', error.message);
    else setCards(data);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) console.error('Ошибка при удалении карточки:', error.message);
    else fetchCards(activeTab);
  };

  const handleOpenCard = async (id) => {
    const { error } = await supabase
      .from('cards')
      .update({ viewed: true })
      .eq('id', id);
    if (error) console.error('Ошибка при обновлении карточки:', error.message);
    else fetchCards(activeTab);
  };

  const handleArchiveCard = async (id) => {
    const { error } = await supabase
      .from('cards')
      .update({ archived: true })
      .eq('id', id);
    if (error) console.error('Ошибка при архивации:', error.message);
    else {
      fetchCards(activeTab);
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
    else fetchCards(activeTab);
  };

  if (!session) return <div>Пожалуйста, войдите в аккаунт</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Сегодня</h1>

      <div style={styles.headerRow}>
        <h2 style={styles.subheader}>Ситуации</h2>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={styles.menuButton}>
            ⋮
          </button>
          {menuOpen && (
            <div style={styles.dropdownMenu}>
              <div style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                Показать все
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
                    <Button
                      type="primary"
                      onClick={() => handleOpenCard(card.id)}
                    >
                      Открыть
                    </Button>
                  </Link>

                  {activeTab === 'archived' ? (
                    <Button
                      type="default"
                      onClick={() => handleUnarchiveCard(card.id)}
                    >
                      Вернуть
                    </Button>
                  ) : (
                    <Button
                      danger
                      onClick={() => handleDelete(card.id)}
                    >
                      Удалить
                    </Button>
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
        <FloatButton icon={<Plus />} type="default" style={{ insetInlineEnd: 15 }} />
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
    color: 'black',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subheader: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: 'black',
  },
  menuButton: {
    fontSize: '24px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#1677ff',
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
    backgroundColor: 'rgb(239 245 255)',
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
    backgroundColor: 'rgb(239 245 255)',
    color: 'black',
    zIndex: 2,
    position: 'relative',
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
