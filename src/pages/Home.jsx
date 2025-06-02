import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function Home() {
  const [form, setForm] = useState({
    situation: '',
    thoughts: '',
    emotions: '',
    behavior: '',
  });

  const [cards, setCards] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setCards(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase.from('cards').insert([
      {
        user_id: user.id,
        ...form,
      },
    ]);

    if (error) {
      console.error('Ошибка сохранения:', error);
    } else {
      setForm({ situation: '', thoughts: '', emotions: '', behavior: '' });
      fetchCards();
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Новая карточка</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          name="situation"
          placeholder="Ситуация"
          value={form.situation}
          onChange={handleChange}
          required
          rows={2}
        />
        <textarea
          name="thoughts"
          placeholder="Мысли"
          value={form.thoughts}
          onChange={handleChange}
          required
          rows={2}
        />
        <textarea
          name="emotions"
          placeholder="Эмоции"
          value={form.emotions}
          onChange={handleChange}
          required
          rows={2}
        />
        <textarea
          name="behavior"
          placeholder="Поведение"
          value={form.behavior}
          onChange={handleChange}
          required
          rows={2}
        />
        <button type="submit">Сохранить</button>
      </form>

      <h2 style={{ marginTop: '2rem' }}>Ваши карточки</h2>
      {cards.map((card) => (
        <div key={card.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <p><strong>Ситуация:</strong> {card.situation}</p>
          <p><strong>Мысли:</strong> {card.thoughts}</p>
          <p><strong>Эмоции:</strong> {card.emotions}</p>
          <p><strong>Поведение:</strong> {card.behavior}</p>
          <p style={{ fontSize: '0.8rem', color: '#777' }}>{new Date(card.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
