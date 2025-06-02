import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Пример с маскотом в виде изображения
import mascot from '../../assets/mascot.png';
import Mascot from '../Mascot';

const CardPage = () => {
  const { id } = useParams();
  const [card, setCard] = useState(null);

  useEffect(() => {
    // Загрузка данных карточки
    const fetchCard = async () => {
      const res = await fetch(`https://viremos.onrender.com/card/${id}`);
      const data = await res.json();
      setCard(data);
    };
    fetchCard();
  }, [id]);

  if (!card) return <div>Загрузка...</div>;

  return (
    <div style={styles.container}>
      {/* 🎉 Маскот-персонаж */}
      <div style={styles.mascotContainer}>
        <img src={mascot} alt="Mascot" style={styles.mascot} />
      </div>

      {/* Данные карточки */}
      <h2>Карточка</h2>
      <p><strong>Ситуация:</strong> {card.situation}</p>
      <p><strong>Мысли:</strong> {card.thoughts}</p>
      <p><strong>Эмоции:</strong> {card.emotions}</p>
      <p><strong>Поведение:</strong> {card.behavior}</p>

      {card.exercises?.map((ex, index) => (
        <div key={index} style={styles.exerciseCard}>
          <h4>{ex.title}</h4>
          <p><strong>Время:</strong> {ex.duration}</p>
          <p><strong>Описание:</strong> {ex.description}</p>
          <ul>
            {ex.steps.map((step, idx) => (
              <li key={idx}>
                <strong>{step.stepTitle}</strong>: {step.stepDescription}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 800,
    margin: '0 auto',
  },
  mascotContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mascot: {
    width: '120px',
    height: 'auto',
    animation: 'float 3s ease-in-out infinite',
  },
  exerciseCard: {
    padding: 15,
    border: '1px solid #ccc',
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    marginBottom: 15,
  },
};

// CSS анимация (можно также вынести в CSS-файл)
const style = document.createElement('style');
style.innerHTML = `
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}
`;
document.head.appendChild(style);

export default CardPage;
