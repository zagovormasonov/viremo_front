import React, { useState } from "react";
import { supabase } from "../supabase"; // путь может отличаться

const CreateCard = () => {
  const [situation, setSituation] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [emotions, setEmotions] = useState("");
  const [behavior, setBehavior] = useState("");
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

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

      if (!response.ok) {
        throw new Error(data.error || "Ошибка генерации упражнений");
      }

      const generatedExercises = data.result;

      // Сохраняем карточку в Supabase
      const { data: savedCard, error: saveError } = await supabase
        .from("cards")
        .insert([
          {
            situation,
            thoughts,
            emotions,
            behavior,
            exercises: generatedExercises, // если тип поля exercises = json
            // если тип text, то JSON.stringify(generatedExercises)
          },
        ]);

      if (saveError) {
        console.error("Ошибка при сохранении карточки:", saveError);
        setError("Ошибка при сохранении карточки");
        return;
      }

      setExercises(generatedExercises);
      setSuccessMessage("Карточка успешно создана!");
    } catch (err) {
      console.error("Ошибка:", err);
      setError(err.message || "Сервер недоступен или возникла ошибка.");
    }
  };

  return (
    <div>
      <h2>Создать карточку</h2>
      <form onSubmit={handleSubmit}>
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
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <div>
        {exercises.map((exercise, index) => (
          <div key={index}>
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
