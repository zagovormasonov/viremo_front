import React, { useState } from "react";
import { supabase } from "./supabase";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";
import { Loader2 } from "lucide-react";

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
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Создание новой карточки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ситуация</label>
            <Textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Опишите ситуацию..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Мысли</label>
            <Textarea
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              placeholder="Какие мысли у вас возникли?"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Эмоции</label>
            <Textarea
              value={emotions}
              onChange={(e) => setEmotions(e.target.value)}
              placeholder="Что вы чувствовали?"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Поведение</label>
            <Textarea
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
              placeholder="Как вы себя вели?"
              required
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 w-4 h-4" />
                Генерация...
              </>
            ) : (
              "Сгенерировать упражнения"
            )}
          </Button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
      </Card>

      {exercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Сгенерированные упражнения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exercises.map((ex, i) => (
              <div key={i} className="p-4 border rounded-md bg-muted">
                <h4 className="text-base font-semibold">{ex.title}</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Время:</strong> {ex.duration}
                </p>
                <p className="text-sm">{ex.description}</p>
                <p className="text-xs italic text-muted-foreground mt-1">{ex.instructions}</p>
              </div>
            ))}

            <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
              Сохранить карточку
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateCard;
