"use client";

import { useState, useEffect } from "react";
import QuizList from "./QuizList";
import QuizForm from "./QuizForm";

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

interface QuizManagerProps {
  chapter: Chapter;
  selectedQuiz: Quiz | null;
  onSelectQuiz: (quiz: Quiz) => void;
  onRefresh: () => void;
}

export default function QuizManager({
  chapter,
  selectedQuiz,
  onSelectQuiz,
  onRefresh,
}: QuizManagerProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const fetchQuizzes = async () => {
    try {
      const { getAccessToken } = await import("@/lib/auth/storage");
      const token = getAccessToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const response = await fetch(`/api/chapters/${chapter.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.chapter.quizzes || []);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [chapter.id]);

  const handleCreate = () => {
    setEditingQuiz(null);
    setShowForm(true);
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this quiz? This will delete all associated questions."
      )
    ) {
      return;
    }

    try {
      const { getAccessToken } = await import("@/lib/auth/storage");
      const token = getAccessToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchQuizzes();
        if (selectedQuiz?.id === id) {
          onSelectQuiz(null as any);
        }
      } else {
        const error = await response.json();
        alert(error.error?.message || "Failed to delete quiz");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Failed to delete quiz");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingQuiz(null);
    fetchQuizzes();
    onRefresh();
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
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

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <QuizList
            quizzes={quizzes}
            selectedQuiz={selectedQuiz}
            onSelect={onSelectQuiz}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showForm && (
          <QuizForm
            chapterId={chapter.id}
            quiz={editingQuiz}
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        )}
      </div>
    </div>
  );
}
