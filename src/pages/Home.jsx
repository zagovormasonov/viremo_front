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
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h2>Создание CBT-карточки</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Ситуация</label>
          <textarea value={situation} onChange={(e) => setSituation(e.target.value)} required />
        </div>
        <div>
          <label>Мысли</label>
          <textarea value={thoughts} onChange={(e) => setThoughts(e.target.value)} required />
        </div>
        <div>
          <label>Эмоции</label>
          <textarea value={emotions} onChange={(e) => setEmotions(e.target.value)} required />
        </div>
        <div>
          <label>Поведение</label>
          <textarea value={behavior} onChange={(e) => setBehavior(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Генерация...' : 'Сгенерировать упражнения'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {exercises.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Упражнения</h3>
          {exercises.map((ex, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
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
          <div key={card.id} style={{ padding: 40, marginBottom: 10, borderRadius: 20, backgroundColor: 'rgb(51 50 50)' }}>
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
    </div>
  );
};

export default Home;
