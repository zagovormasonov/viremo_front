import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';

const CardDetails = () => {
  const { id } = useParams();
  const [card, setCard] = useState(null);

  useEffect(() => {
    const fetchCard = async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Ошибка при загрузке карточки:', error.message);
      } else {
        setCard(data);
      }
    };

    fetchCard();
  }, [id]);

  if (!card) return <p>Загрузка...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <Link to="/">← Назад</Link>
      <h2>Детали карточки</h2>
      <p><strong>Ситуация:</strong> {card.situation}</p>
      <p><strong>Мысли:</strong> {card.thoughts}</p>
      <p><strong>Эмоции:</strong> {card.emotions}</p>
      <p><strong>Поведение:</strong> {card.behavior}</p>

      {card.exercises?.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Упражнения</h3>
          {card.exercises.map((ex, index) => (
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
    </div>
  );
};

export default CardDetails;
