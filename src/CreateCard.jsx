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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          situation,
          thoughts,
          emotions,
          behavior,
        }),
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
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

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
        exercises, // Можно оставить как есть, Supabase сам сериализует JSON
        user_id: user.id, // 🟢 Передаём ID текущего пользователя
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
    <div>
      <h2>Создание новой карточки</h2>
      <label>Ситуация:</label>
      <input required value={situation} onChange={(e) => setSituation(e.target.value)} />
      <br />

      <label>Мысли:</label>
      <input required value={thoughts} onChange={(e) => setThoughts(e.target.value)} />
      <br />

      <label>Эмоции:</label>
      <input required value={emotions} onChange={(e) => setEmotions(e.target.value)} />
      <br />

      <label>Поведение:</label>
      <input required value={behavior} onChange={(e) => setBehavior(e.target.value)} />
      <br />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Генерация..." : "Сгенерировать упражнения"}
      </button>

      {exercises.length > 0 && (
        <>
          <h3>Сгенерированные упражнения</h3>
          {exercises.map((ex, i) => (
            <div style={{padding: 20, background: 'rgb(51, 50, 50)'}} key={i}>
              <h4>{ex.title}</h4>
              <p><strong>Время:</strong> {ex.duration}</p>
              <p>{ex.description}</p>
              <p><em>{ex.instructions}</em></p>
            </div>
          ))}

          <button onClick={handleSave}>Сохранить карточку</button>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CreateCard;
