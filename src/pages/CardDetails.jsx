import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";

const CardDetails = () => {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("cards")
          .select("id, situation, thoughts, emotions, behavior, exercises")
          .eq("id", id)
          .single();

        if (error) throw error;

        // Преобразование поля exercises, если оно строка
        let parsedExercises = null;
        if (typeof data.exercises === "string") {
          try {
            parsedExercises = JSON.parse(data.exercises);
          } catch (e) {
            console.error("Ошибка парсинга exercises:", e);
          }
        } else {
          parsedExercises = data.exercises;
        }

        setCard({ ...data, exercises: parsedExercises });
      } catch (err) {
        console.error("Ошибка загрузки карточки:", err);
        setError("Ошибка загрузки карточки");
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!card) return <p>Карточка не найдена</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Карточка #{card.id}</h2>
      <p><strong>Ситуация:</strong> {card.situation}</p>
      <p><strong>Мысли:</strong> {card.thoughts}</p>
      <p><strong>Эмоции:</strong> {card.emotions}</p>
      <p><strong>Поведение:</strong> {card.behavior}</p>

      <h3>Упражнения</h3>
      {Array.isArray(card.exercises) && card.exercises.length > 0 ? (
        card.exercises.map((exercise, index) => (
          <div
            key={index}
            style={{
              padding: "20px",
              marginBottom: "10px",
              borderRadius: "20px",
              background: "rgb(239 245 255)"
            }}
          >
            <h4>{exercise.title}</h4>
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
        ))
      ) : (
        <p>Упражнения отсутствуют</p>
      )}
    </div>
  );
};

export default CardDetails;
