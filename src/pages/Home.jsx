import { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [situation, setSituation] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [emotions, setEmotions] = useState('');
  const [reactions, setReactions] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const navigate = useNavigate();

  const user = supabase.auth.getUser().then(res => res.data.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGenerated(null);

    try {
      const formData = new FormData();
      formData.append('situation', situation);
      formData.append('thoughts', thoughts);
      formData.append('emotions', emotions);
      formData.append('behavior', reactions);

      const response = await fetch('https://viremos.onrender.com/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.result) {
        setGenerated(data.result);

        const userResult = await supabase.auth.getUser();
        const currentUser = userResult.data.user;

        if (currentUser) {
          const { error } = await supabase.from('cards').insert([
            {
              user_id: currentUser.id,
              situation,
              thoughts,
              emotions,
              behavior: reactions,
              exercises: data.result,
            },
          ]);
          if (error) {
            console.error('❌ Ошибка сохранения в Supabase:', error);
          }
        }
      } else {
        alert('Ошибка генерации упражнения');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при отправке данных');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Создание CBT-карточки</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Ситуация"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          required
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Мысли"
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          required
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Эмоции"
          value={emotions}
          onChange={(e) => setEmotions(e.target.value)}
          required
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Поведение / Реакции"
          value={reactions}
          onChange={(e) => setReactions(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Генерация...' : 'Сгенерировать упражнение'}
        </button>
      </form>

      {generated && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Сгенерированные упражнения</h2>
          <div className="space-y-4">
            {generated.map((exercise, i) => (
              <div key={i} className="border p-4 rounded bg-gray-100">
                <h3 className="font-bold">{exercise.title}</h3>
                <p className="text-sm italic">{exercise.duration}</p>
                <p>{exercise.description}</p>
                <p className="mt-2 font-semibold">Инструкции:</p>
                <p>{exercise.instructions}</p>
                <ul className="list-disc ml-5 mt-2">
                  {exercise.steps.map((step, j) => (
                    <li key={j}>
                      <strong>{step.stepTitle}</strong>: {step.stepDescription}{" "}
                      {step.inputRequired && <em>(требуется ввод)</em>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
