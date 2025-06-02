import React, { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../supabase';

const Home = () => {
  const session = useSession();

  const [situation, setSituation] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [emotions, setEmotions] = useState('');
  const [behavior, setBehavior] = useState('');
  const [exercises, setExercises] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔄 Загрузка карточек при монтировании
  useEffect(() => {
    if (session) {
      fetchCards();
    }
  }, [session]);

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка при загрузке карточек:', error.message);
    } else {
      setCards(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setExercises([]);

    try {
      // Отправка на FastAPI
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
      if (data.error) throw new Error(data.error);

      const exerciseData = data.result;
      setExercises(exerciseData);

      // Сохраняем в Supabase
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
      if (supabaseError) throw supabaseError;

      // Обновить список
      fetchCards();

      // Очистить форму
      setSituation('');
      setThoughts('');
      setEmotions('');
      setBehavior('');
    } catch (err) {
      console.error('❌ Ошибка:', err);
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Удалить эту карточку?");
    if (!confirm) return;

    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) {
      console.error('Ошибка при удалении:', error.message);
    } else {
      setCards(cards.filter((card) => card.id !== id));
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
          <label>Ситуация</label><br />
          <textarea value={situation} onChange={(e) => setSituation(e.target.value)} required />
        </div>
        <div>
          <label>Мысли</label><br />
          <textarea value={thoughts} onChange={(e) => setThoughts(e.target.value)} required />
        </div>
        <div>
          <label>Эмоции</label><br />
          <textarea value={emotions} onChange={(e) => setEmotions(e.target.value)} required />
        </div>
        <div>
          <label>Поведение</label><br />
          <textarea value={behavior} onChange={(e) => setBehavior(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? 'Генерация...' : 'Сгенерировать упражнения'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {exercises.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Сгенерированные упражнения</h3>
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

      <h2 style={{ marginTop: 40 }}>Мои карточки</h2>
      {cards.length === 0 && <p>Нет сохранённых карточек.</p>}
      {cards.map((card) => (
        <div key={card.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 20 }}>
          <p><strong>Ситуация:</strong> {card.situation}</p>
          <p><strong>Мысли:</strong> {card.thoughts}</p>
          <p><strong>Эмоции:</strong> {card.emotions}</p>
          <p><strong>Поведение:</strong> {card.behavior}</p>
          {card.exercises?.length > 0 && (
            <div>
              <h4>Упражнения:</h4>
              {card.exercises.map((ex, i) => (
                <div key={i}>
                  <p><strong>{ex.title}</strong> — {ex.duration}</p>
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize: '0.8rem', color: '#777' }}>{new Date(card.created_at).toLocaleString()}</p>
          <button
            onClick={() => handleDelete(card.id)}
            style={{ backgroundColor: '#f44336', color: 'white', marginTop: '0.5rem' }}
          >
            Удалить
          </button>
        </div>
      ))}
    </div>
  );
};

export default Home;
