import React, { useState } from "react";
import { supabase } from "./supabase";

const CreateCard = () => {
  const [situation, setSituation] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [emotions, setEmotions] = useState("");
  const [behavior, setBehavior] = useState("");
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://viremos.onrender.com/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, thoughts, emotions, behavior }),
      });

      const result = await response.json();

      if (result.error) {
        setError("Ошибка генерации упражнений");
        console.error(result.error);
      } else {
        setExercises(result.result);
      }
    } catch (e) {
      console.error("Ошибка при запросе:", e);
      setError("Ошибка подключения к серверу");
    }

    setLoading(false);
  };

  const handleSave = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Не удалось получить текущего пользователя");
      return;
    }

    const { error: insertError } = await supabase.from("cards").insert([
      {
        situation,
        thoughts,
        emotions,
        behavior,
        exercises,
        user_id: user.id,
      },
    ]);

    if (insertError) {
      console.error("Ошибка при сохранении карточки:", insertError);
      setError("Ошибка при сохранении карточки");
    } else {
      alert("Карточка успешно сохранена!");
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Создание новой карточки</h2>

        <div className="space-y-4">
          <Input label="Ситуация" value={situation} onChange={setSituation} />
          <Input label="Мысли" value={thoughts} onChange={setThoughts} />
          <Input label="Эмоции" value={emotions} onChange={setEmotions} />
          <Input label="Поведение" value={behavior} onChange={setBehavior} />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Генерация..." : "Сгенерировать упражнения"}
        </button>

        {exercises.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Сгенерированные упражнения</h3>
            {exercises.map((ex, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-800">{ex.title}</h4>
                <p className="text-sm text-gray-500 mb-1"><strong>Время:</strong> {ex.duration}</p>
                <p className="text-gray-700">{ex.description}</p>
                <p className="text-sm italic text-gray-600 mt-1">{ex.instructions}</p>
              </div>
            ))}
            <button
              onClick={handleSave}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              Сохранить карточку
            </button>
          </div>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      rows={3}
      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
    />
  </div>
);

export default CreateCard;
