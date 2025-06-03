import React, { useState } from "react";
import { supabase } from "./supabase";
import { Input, Button, Form, Typography, Alert } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;

const CreateCard = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async (values) => {
    setLoading(true);
    setError("");

    try {
      // Генерация упражнений
      const response = await fetch("https://viremos.onrender.com/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.error || !result.result || result.result.length === 0) {
        setError("Ошибка генерации упражнений");
        setLoading(false);
        return;
      }

      // Получение текущего пользователя
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Не удалось получить текущего пользователя");
        setLoading(false);
        return;
      }

      // Сохранение карточки в Supabase
      const { data, error: insertError } = await supabase
        .from("cards")
        .insert([{
          ...values,
          exercises: result.result,
          user_id: user.id,
        }])
        .select()
        .single(); // Получить вставленную карточку

      if (insertError || !data) {
        setError("Ошибка при сохранении карточки");
        setLoading(false);
        return;
      }

      // Переход к странице просмотра карточки
      navigate(`/card/${data.id}`);

    } catch (e) {
      console.error("Ошибка:", e);
      setError("Ошибка при подключении к серверу");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <Title level={2}>Создание новой карточки</Title>

      <Form layout="vertical" form={form} onFinish={handleGenerate}>
        <Form.Item label="Ситуация" name="situation" rules={[{ required: true, message: "Введите ситуацию" }]}>
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Мысли" name="thoughts" rules={[{ required: true, message: "Введите мысли" }]}>
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Эмоции" name="emotions" rules={[{ required: true, message: "Введите эмоции" }]}>
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Поведение" name="behavior" rules={[{ required: true, message: "Введите поведение" }]}>
          <TextArea rows={3} />
        </Form.Item>

        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Сгенерировать упражнения
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateCard;
