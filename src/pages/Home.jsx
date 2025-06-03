import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [cards, setCards] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase.from("cards").select("*");
      if (!error) {
        setCards(data);
      }
    };

    fetchCards();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGenerate = () => {
    navigate("/new-card");
  };

  return (
    <div style={{ padding: "1rem", position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2>Упражнения</h2>
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              fontSize: "24px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            ⋮
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "30px",
                right: 0,
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <ul style={{ listStyle: "none", margin: 0, padding: "8px 0" }}>
                <li
                  style={{ padding: "8px 16px", cursor: "pointer" }}
                  onClick={() => alert("Добавлено в избранное")}
                >
                  В избранное
                </li>
                <li
                  style={{ padding: "8px 16px", cursor: "pointer" }}
                  onClick={() => alert("Отправлено психологу")}
                >
                  Отправить психологу
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Список карточек */}
      {cards.length > 0 ? (
        cards.map((card) => (
          <div
            key={card.id}
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/card/${card.id}`)}
          >
            <p><strong>Ситуация:</strong> {card.situation}</p>
            <p><strong>Эмоции:</strong> {card.emotions}</p>
          </div>
        ))
      ) : (
        <p>У вас пока нет карточек</p>
      )}

      {/* Кнопка "+" снизу справа */}
      <button
        onClick={handleGenerate}
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#1976d2",
          color: "white",
          fontSize: "32px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        +
      </button>
    </div>
  );
};

export default Home;
