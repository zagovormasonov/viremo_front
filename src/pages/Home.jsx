import React, { useState } from 'react';

function Home() {
  const [situation, setSituation] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [emotions, setEmotions] = useState('');
  const [reactions, setReactions] = useState('');
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setGenerated(null);

    const formData = new FormData();
    formData.append('situation', situation);
    formData.append('thoughts', thoughts);
    formData.append('emotions', emotions);
    formData.append('behavior', reactions);

    try {
      const response = await fetch('https://viremos.onrender.com/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.result) {
        setGenerated(data.result);
      } else {
        setError('Ошибка при получении упражнения.');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу.');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Создание упражнения</h2>

      <label>Ситуация:</label>
      <textarea
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        rows={2}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <label>Мысли:</label>
      <textarea
        value={thoughts}
        onChange={(e) => setThoughts(e.target.value)}
        rows={2}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <label>Эмоции:</label>
      <textarea
        value={emotions}
        onChange={(e) => setEmotions(e.target.value)}
        rows={2}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <label>Реакции:</label>
      <textarea
        value={reactions}
        onChange={(e) => setReactions(e.target.value)}
        rows={2}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Генерация...' : 'Сгенерировать упражнение'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {generated && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Сгенерированные упражнения:</h3>
          {generated.map((ex, i) => (
            <div key={i} style={{ padding: '1rem', border: '1px solid #ccc', marginBottom: '1rem' }}>
              <h4>{ex.title}</h4>
              <p><strong>Время:</strong> {ex.duration}</p>
              <p><strong>Описание:</strong> {ex.description}</p>
              <p><strong>Инструкции:</strong> {ex.instructions}</p>
              <h5>Шаги:</h5>
              <ul>
                {ex.steps.map((step, idx) => (
                  <li key={idx}>
                    <strong>{step.stepTitle}:</strong> {step.stepDescription}
                    {step.inputRequired && <span> (требуется ввод)</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
