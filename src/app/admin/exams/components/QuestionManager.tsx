"use client";

import { useState, useEffect } from "react";
import QuestionList from "./QuestionList";
import QuestionForm from "./QuestionForm";
import ExcelUpload from "./ExcelUpload";

interface Quiz {
  id: string;
  title: string;
}

interface Question {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  isActive: boolean;
  order: number;
}

interface QuestionManagerProps {
  quiz: Quiz;
  onRefresh: () => void;
}

export default function QuestionManager({
  quiz,
  onRefresh,
}: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const fetchQuestions = async () => {
    try {
      const { getAccessToken } = await import("@/lib/auth/storage");
      const token = getAccessToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const response = await fetch(`/api/quizzes/${quiz.id}/questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.quiz.questions || []);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [quiz.id]);

  const handleCreate = () => {
    setEditingQuestion(null);
    setShowForm(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const { getAccessToken } = await import("@/lib/auth/storage");
      const token = getAccessToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchQuestions();
      } else {
        const error = await response.json();
        alert(error.error?.message || "Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingQuestion(null);
    fetchQuestions();
    onRefresh();
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Questions - {quiz.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {questions.length}{" "}
              {questions.length === 1 ? "question" : "questions"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExcelUpload(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              📊 Upload Excel
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              + Add Question
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <QuestionList
            questions={questions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showForm && (
          <QuestionForm
            quizId={quiz.id}
            question={editingQuestion}
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        )}

        {showExcelUpload && (
          <ExcelUpload
            quizId={quiz.id}
            onSuccess={() => {
              setShowExcelUpload(false);
              fetchQuestions();
              onRefresh();
            }}
            onClose={() => setShowExcelUpload(false)}
          />
        )}
      </div>
    </div>
  );
}
