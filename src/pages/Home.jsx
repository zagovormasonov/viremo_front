import React, { useState, useEffect } from "react";
import { supabase } from "../supabase"; // Убедись, что файл и путь правильные
import { useSession } from "@supabase/auth-helpers-react";

function Home() {
  const session = useSession();
  const [situation, setSituation] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [emotions, setEmotions] = useState("");
  const [behavior, setBehavior] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setExercises([]);

    try {
      const formData = new URLSearchParams();
      formData.append("situation", situation);
      formData.append("thoughts", thoughts);
      formData.append("emotions", emotions);
      formData.append("behavior", behavior);

      const response = await fetch("https://viremos.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      const data = await response.json();
      if (data.result && Array.isArray(data.result)) {
        setExercises(data.result);

        // ⬇️ Сохраняем всё в Supabase
        const { error: insertError } = await supabase
          .from("cards")
          .insert({
            user_id: session.user.id,
            situation,
            thoughts,
            emotions,
            behavior,
            exercises: data.result,
          });

        if (insertError) throw insertError;
      } else {
        setError("Некорректный ответ от сервера");
      }
    } catch (err) {
      setError("Ошибка: " + err.message);
      console.error("❌", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Создать упражнение</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Ситуация:</label>
          <textarea value={situation} onChange={(e) => setSituation(e.target.value)} required />
        </div>
        <div>
          <label>Мысли:</label>
          <textarea value={thoughts} onChange={(e) => setThoughts(e.target.value)} required />
        </div>
        <div>
          <label>Эмоции:</label>
          <textarea value={emotions} onChange={(e) => setEmotions(e.target.value)} required />
        </div>
        <div>
          <label>Реакции:</label>
          <textarea value={behavior} onChange={(e) => setBehavior(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Генерация..." : "Сгенерировать упражнение"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {exercises.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Упражнения:</h3>
          {exercises.map((ex, index) => (
            <div key={index} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
              <h4>{ex.title}</h4>
              <p><strong>Длительность:</strong> {ex.duration}</p>
              <p><strong>Описание:</strong> {ex.description}</p>
              <p><strong>Инструкции:</strong> {ex.instructions}</p>
              <h5>Шаги:</h5>
              <ol>
                {ex.steps?.map((step, i) => (
                  <li key={i}>
                    <strong>{step.stepTitle}</strong>: {step.stepDescription}
                    {step.inputRequired && <div><em>⚠️ Требуется ввод</em></div>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
