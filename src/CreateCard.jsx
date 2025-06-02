import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateCard = () => {
  const navigate = useNavigate();
  const [situation, setSituation] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [emotions, setEmotions] = useState('');
  const [behavior, setBehavior] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // логика отправки
    console.log({ situation, thoughts, emotions, behavior });
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>← Назад</button>
      <h2>Создание CBT-карточки</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          placeholder="Ситуация"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          required
          style={styles.textarea}
        />
        <textarea
          placeholder="Мысли"
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          required
          style={styles.textarea}
        />
        <textarea
          placeholder="Эмоции"
          value={emotions}
          onChange={(e) => setEmotions(e.target.value)}
          required
          style={styles.textarea}
        />
        <textarea
          placeholder="Поведение"
          value={behavior}
          onChange={(e) => setBehavior(e.target.value)}
          required
          style={styles.textarea}
        />
        <button type="submit" style={styles.submitButton}>
          Отправить
        </button>
      </form>
    </div>
  );
};

const styles = {
  backButton: {
    background: 'none',
    border: 'none',
    color: '#4caf50',
    fontSize: '16px',
    marginBottom: '10px',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
    resize: 'vertical',
    minHeight: '80px',
  },
  submitButton: {
    padding: '12px 20px',
    fontSize: '16px',
    borderRadius: '8px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
};

export default CreateCard;
