import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const CreateCard = () => {
  const navigate = useNavigate();

  const [situation, setSituation] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [emotions, setEmotions] = useState('');
  const [behavior, setBehavior] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Отправка данных на FastAPI сервер для генерации упражнений
      const response = await fetch('https://viremos.onrender.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        situation: situation.trim(),
        thoughts: thoughts.trim(),
        emotions: emotions.trim(),
        behavior: behavior.trim(),
      }),
    });


      if (!response.ok) {
        throw new Error('Ошибка генерации упражнений');
      }

      const data = await response.json();
      console.log('Ответ от сервера:', data);

      // Сохраняем в Supabase
      const { error } = await supabase.from('cards').insert([
        {
          situation,
          thoughts,
          emotions,
          behavior,
          exercises: data.exercises, // ← должен быть массивом!
        },
      ]);

      if (error) throw error;

      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Создать новую карточку</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Ситуация:
          <textarea value={situation} onChange={(e) => setSituation(e.target.value)} required />
        </label>
        <label>
          Мысли:
          <textarea value={thoughts} onChange={(e) => setThoughts(e.target.value)} required />
        </label>
        <label>
          Эмоции:
          <textarea value={emotions} onChange={(e) => setEmotions(e.target.value)} required />
        </label>
        <label>
          Поведение:
          <textarea value={behavior} onChange={(e) => setBehavior(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Создание...' : 'Создать карточку'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CreateCard;
