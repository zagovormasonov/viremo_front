import React, { useState } from "react";
import { supabase } from "./supabase";
import { Input, Button, Form, Typography, Spin, Alert } from "antd";

const { Title, Text } = Typography;
const { TextArea } = Input;

const CreateCard = () => {
  const [form] = Form.useForm();
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (values) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://viremos.onrender.com/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
    const values = form.getFieldsValue();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Не удалось получить текущего пользователя");
      return;
    }

    const { error: insertError } = await supabase.from("cards").insert([{
      ...values,
      exercises,
      user_id: user.id,
    }]);

    if (insertError) {
      console.error("Ошибка при сохранении карточки:", insertError);
      setError("Ошибка при сохранении карточки");
    } else {
      alert("Карточка успешно сохранена!");
      setError("");
      form.resetFields();
      setExercises([]);
    }
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

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Сгенерировать упражнения
          </Button>
        </Form.Item>
      </Form>

      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}

      {exercises.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={4}>Сгенерированные упражнения</Title>
          {exercises.map((ex, i) => (
            <div key={i} style={{ marginBottom: 16, padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
              <Text strong>{ex.title}</Text>
              <p><strong>Время:</strong> {ex.duration}</p>
              <p>{ex.description}</p>
              <Text type="secondary">{ex.instructions}</Text>
            </div>
          ))}
          <Button type="primary" onClick={handleSave} block>
            Сохранить карточку
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateCard;
