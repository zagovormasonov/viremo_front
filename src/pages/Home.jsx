import React, { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

const Home = () => {
  const session = useSession();

  const [situation, setSituation] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [emotions, setEmotions] = useState('');
  const [behavior, setBehavior] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('situation', situation);
      formData.append('thoughts', thoughts);
      formData.append('emotions', emotions);
      formData.append('behavior', behavior);

      const response = await fetch('https://viremos.onrender.com/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const exerciseData = data.result;
      setExercises(exerciseData);

      const { error: supabaseError } = await supabase.from('cards').insert([
        {
          user_id: session.user.id,
          situation,
          thoughts,
          emotions,
          behavior,
          exercises: exerciseData,
        },
      ]);

      if (supabaseError) {
        throw supabaseError;
      }

      setSituation('');
      setThoughts('');
      setEmotions('');
      setBehavior('');
      setExercises([]);
      fetchCards();
    } catch (err) {
      console.error('❌ Ошибка:', err);
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
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
      {loading && (
        <div style={styles.loaderOverlay}>
          <div style={styles.spinner}></div>
        </div>
      )}
      <GlobalStyles />

      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Создание CBT-карточки</h2>

        <div style={styles.field}>
          <label>Ситуация</label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            required
            style={styles.textarea}
          />
        </div>

        <div style={styles.field}>
          <label>Мысли</label>
          <textarea
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            required
            style={styles.textarea}
          />
        </div>

        <div style={styles.field}>
          <label>Эмоции</label>
          <textarea
            value={emotions}
            onChange={(e) => setEmotions(e.target.value)}
            required
            style={styles.textarea}
          />
        </div>

        <div style={styles.field}>
          <label>Поведение</label>
          <textarea
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            required
            style={styles.textarea}
          />
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Генерация...' : 'Сгенерировать упражнения'}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>

      {exercises.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Упражнения</h3>
          {exercises.map((ex, index) => (
            <div key={index} style={styles.exerciseCard}>
              <h4>{ex.title}</h4>
              <p><strong>Время:</strong> {ex.duration}</p>
              <p><strong>Описание:</strong> {ex.description}</p>
              <p><strong>Инструкции:</strong> {ex.instructions}</p>
              <ul>
                {ex.steps.map((step, idx) => (
                  <li key={idx}>
                    <strong>{step.stepTitle}</strong>: {step.stepDescription}
                    {step.inputRequired && <em> (требуется ввод)</em>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <h2>Ваши карточки</h2>
        {cards.map((card) => (
          <div key={card.id} style={styles.card}>
            <p><strong>Ситуация:</strong> {card.situation}</p>
            <p><strong>Мысли:</strong> {card.thoughts}</p>
            <p><strong>Эмоции:</strong> {card.emotions}</p>
            <p><strong>Поведение:</strong> {card.behavior}</p>
            <Link to={`/card/${card.id}`}>
              <button style={styles.openButton}>Открыть</button>
            </Link>
            <button
              onClick={() => handleDelete(card.id)}
              style={styles.deleteButton}
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 800,
    margin: '0 auto',
    color: 'white',
  },
  form: {
    padding: 20,
    borderRadius: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  field: {
    marginBottom: 15,
  },
  textarea: {
    width: '95%',
    minHeight: 60,
    padding: 10,
    borderRadius: 5,
    border: '1px solid #ccc',
    fontSize: 16,
    resize: 'vertical',
  },
  button: {
    width: '100%',
    padding: 10,
    backgroundColor: '#4caf50',
    color: 'white',
    fontSize: 16,
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: '#3b3b3b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  card: {
    padding: 20,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: 'rgb(51 50 50)',
  },
  openButton: {
    marginRight: 10,
    padding: '8px 12px',
    borderRadius: 5,
    border: 'none',
    backgroundColor: '#2196f3',
    color: 'white',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '8px 12px',
    borderRadius: 5,
    border: 'none',
    backgroundColor: '#f44336',
    color: 'white',
    cursor: 'pointer',
  },
    loaderOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },

    spinner: {
        width: '48px',
        height: '48px',
        border: '5px solid rgba(255, 255, 255, 0.2)',
        borderTop: '5px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
};

const GlobalStyles = () => (
  <style>{`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}</style>
);

export default Home;