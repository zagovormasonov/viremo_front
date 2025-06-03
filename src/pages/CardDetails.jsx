import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const CardDetail = () => {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCard = async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Ошибка загрузки карточки");
        console.error(error);
      } else {
        // Преобразуем поле exercises из строки в объект, если нужно
        const parsedExercises =
          typeof data.exercises === "string"
            ? JSON.parse(data.exercises)
            : data.exercises;

        setCard({ ...data, exercises: parsedExercises });
      }
    };

    fetchCard();
  }, [id]);

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!card) {
    return <p>Загрузка...</p>;
  }

  return (
    <div>
      <h2>Карточка #{card.id}</h2>
      <p><strong>Ситуация:</strong> {card.situation}</p>
      <p><strong>Мысли:</strong> {card.thoughts}</p>
      <p><strong>Эмоции:</strong> {card.emotions}</p>
      <p><strong>Поведение:</strong> {card.behavior}</p>

      <h3>Упражнения</h3>
      {card.exercises && card.exercises.length > 0 ? (
        card.exercises.map((exercise, index) => (
          <div key={index}>
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

export default CardDetail;
