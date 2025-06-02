import React, { useState } from 'react';

function Home() {
  const [situation, setSituation] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [emotions, setEmotions] = useState('');
  const [reactions, setReactions] = useState('');
  const [generated, setGenerated] = useState('');

  const handleGenerate = () => {
    const result = `Упражнение:
    
- Ситуация: ${situation}
- Мысли: ${thoughts}
- Эмоции: ${emotions}
- Реакции: ${reactions}

Попробуй проанализировать, какие автоматические мысли возникли и как можно было бы отреагировать иначе.`;

    setGenerated(result);
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

      <button onClick={handleGenerate}>Сгенерировать упражнение</button>

      {generated && (
        <div style={{ marginTop: '2rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
          <pre>{generated}</pre>
        </div>
      )}
    </div>
  );
}

export default Home;
