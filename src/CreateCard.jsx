import React, { useEffect, useState } from "react";
import { supabase } from "./supabase"; // Убедись, что путь к supabase правильный

function CreateCard() {
  const [userId, setUserId] = useState(null);
  const [situation, setSituation] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [emotions, setEmotions] = useState("");
  const [behavior, setBehavior] = useState("");
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      } else {
        console.error("Ошибка получения пользователя:", error);
        setError("Ошибка авторизации. Попробуйте перезайти.");
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("Пользователь не авторизован.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId); 
    formData.append("situation", situation);
    formData.append("thoughts", thoughts);
    formData.append("emotions", emotions);
    formData.append("behavior", behavior);

    try {
      const res = await fetch("https://viremos.onrender.com/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setExercises(data.result); // массив упражнений
        setError("");
      } else {
        setError(data.error || "Ошибка генерации упражнений");
      }
    } catch (err) {
      console.error("Ошибка запроса:", err);
      setError("Ошибка соединения с сервером");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Создание карточки</h2>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Ситуация"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          required
        />
        <textarea
          placeholder="Мысли"
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          required
        />
        <textarea
          placeholder="Эмоции"
          value={emotions}
          onChange={(e) => setEmotions(e.target.value)}
          required
        />
        <textarea
          placeholder="Поведение"
          value={behavior}
          onChange={(e) => setBehavior(e.target.value)}
          required
        />
        <button type="submit">Сгенерировать упражнения</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {exercises.length > 0 && (
        <div>
          <h3>Упражнения:</h3>
          {exercises.map((ex, idx) => (
            <div key={idx} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
              <h4>{ex.title}</h4>
              <p><strong>Длительность:</strong> {ex.duration}</p>
              <p><strong>Описание:</strong> {ex.description}</p>
              <p><strong>Инструкции:</strong> {ex.instructions}</p>
              <ul>
                {ex.steps.map((step, i) => (
                  <li key={i}>
                    <strong>{step.stepTitle}</strong>: {step.stepDescription}
                    {step.inputRequired && <em> (Требуется ввод)</em>}
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

export default CreateCard;
