import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase'; // или '../supabase' в зависимости от структуры

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
        console.error('Ошибка при загрузке карточки:', error);
      } else {
        setCard(data);
      }
    };

    fetchCard();
  }, [id]);

  if (!card) return <p>Загрузка...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Карточка</h2>
      <p><strong>Ситуация:</strong> {card.situation}</p>
      <p><strong>Мысли:</strong> {card.thoughts}</p>
      <p><strong>Эмоции:</strong> {card.emotions}</p>
      <p><strong>Поведение:</strong> {card.behavior}</p>

      {Array.isArray(card.exercises) && card.exercises.length > 0 && (
        <div>
          <h3>Упражнения</h3>
          {card.exercises.map((ex, index) => (
            <div key={index} style={{ border: '1px solid #ccc', marginBottom: 10, padding: 10 }}>
              <h4>{ex.title}</h4>
              <p><strong>Время:</strong> {ex.duration}</p>
              <p><strong>Описание:</strong> {ex.description}</p>
              <p><strong>Инструкции:</strong> {ex.instructions}</p>
              <ul>
                {ex.steps.map((step, i) => (
                  <li key={i}>
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
