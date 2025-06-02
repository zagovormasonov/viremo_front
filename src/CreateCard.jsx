import React, { useState } from "react";
import { supabase } from "./supabase";
import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";

const CreateCard = () => {
  const session = useSession();
  const navigate = useNavigate();

  const [situation, setSituation] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [emotions, setEmotions] = useState("");
  const [behavior, setBehavior] = useState("");
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      const data = await response.json();

      if (response.ok) {
        setExercises(data.result);
        setError("");

        // Сохраняем карточку в Supabase
       const { error: insertError } = await supabase.from("cards").insert([
          {
            user_id: session.user.id,
            situation,
            thoughts,
            emotions,
            behavior,
          },
        ]);


        if (insertError) {
          console.error("Ошибка при сохранении карточки:", insertError.message);
        } else {
          console.log("✅ Карточка успешно сохранена в Supabase");
        }

      } else {
        setError(data.error || "Ошибка генерации упражнений");
      }
    } catch (err) {
      console.error("Ошибка:", err);
      setError("Сервер недоступен или возникла ошибка.");
    }
  };

  if (!session) {
    return <p>Пожалуйста, войдите в аккаунт</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Создать карточку</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <textarea
          placeholder="Ситуация"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
        />
        <textarea
          placeholder="Мысли"
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
        />
        <textarea
          placeholder="Эмоции"
          value={emotions}
          onChange={(e) => setEmotions(e.target.value)}
        />
        <textarea
          placeholder="Поведение"
          value={behavior}
          onChange={(e) => setBehavior(e.target.value)}
        />
        <button type="submit">Сгенерировать упражнения</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: "20px" }}>
        {exercises.map((exercise, index) => (
          <div key={index} style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
            <h3>{exercise.title}</h3>
            <p><strong>Время:</strong> {exercise.duration}</p>
            <p>{exercise.description}</p>
            <p><em>{exercise.instructions}</em></p>
            <ul>
              {exercise.steps.map((step, idx) => (
                <li key={idx}>
                  <strong>{step.stepTitle}:</strong> {step.stepDescription}
                  {step.inputRequired && <em> (нужно ввести текст)</em>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateCard;
