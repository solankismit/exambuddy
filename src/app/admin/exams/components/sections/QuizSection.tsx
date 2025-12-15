"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/hooks/useApi";
import EntityCard from "../cards/EntityCard";
import EntityModal from "../modals/EntityModal";

interface Chapter {
  id: string;
  name: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  order: number;
}

interface QuizSectionProps {
  chapter: Chapter;
  selectedQuiz: Quiz | null;
  onSelect: (quiz: Quiz | null) => void;
  onRefresh: () => void;
  api: ReturnType<typeof useApi>;
}

export default function QuizSection({
  chapter,
  selectedQuiz,
  onSelect,
  onRefresh,
  api,
}: QuizSectionProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, [chapter.id]);

  const loadQuizzes = async () => {
    setLoading(true);
    const data = await api.get<{ chapter: { quizzes: Quiz[] } }>(
      `/api/chapters/${chapter.id}`
    );
    if (data?.chapter?.quizzes) {
      setQuizzes(data.chapter.quizzes);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingQuiz(null);
    setShowModal(true);
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all questions.")) {
      return;
    }

    const result = await api.delete(`/api/admin/quizzes/${id}`);
    if (result) {
      loadQuizzes();
      onRefresh();
      if (selectedQuiz?.id === id) {
        onSelect(null);
      }
    }
  };

  const handleSave = async (data: any) => {
    const url = editingQuiz
      ? `/api/admin/quizzes/${editingQuiz.id}`
      : `/api/admin/chapters/${chapter.id}/quizzes`;
    const method = editingQuiz ? "put" : "post";

    const result = await api[method](url, data);
    if (result) {
      setShowModal(false);
      setEditingQuiz(null);
      loadQuizzes();
      onRefresh();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-sm text-gray-600">Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Quizzes - {chapter.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          + Add Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No quizzes yet</p>
          <button
            onClick={handleCreate}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Create your first quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <EntityCard
              key={quiz.id}
              title={quiz.title}
              description={quiz.description}
              isActive={quiz.isActive}
              isSelected={selectedQuiz?.id === quiz.id}
              onSelect={() => onSelect(quiz)}
              onEdit={() => handleEdit(quiz)}
              onDelete={() => handleDelete(quiz.id)}
              actionLabel="View Questions →"
            />
          ))}
        </div>
      )}

      {showModal && (
        <EntityModal
          title={editingQuiz ? "Edit Quiz" : "Create Quiz"}
          fields={[
            { name: "title", label: "Title", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "order", label: "Order", type: "number" },
            { name: "isActive", label: "Active", type: "checkbox" },
          ]}
          initialData={editingQuiz || { title: "", description: "", order: 0, isActive: true }}
          onClose={() => {
            setShowModal(false);
            setEditingQuiz(null);
          }}
          onSave={handleSave}
          loading={api.loading}
        />
      )}
    </div>
  );
}

