"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/hooks/useApi";
import QuestionCard from "../cards/QuestionCard";
import QuestionModal from "../modals/QuestionModal";
import ExcelUpload from "../ExcelUpload";

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
  complexity: "EASY" | "MEDIUM" | "HARD";
  isActive: boolean;
  order: number;
}

interface QuestionSectionProps {
  quiz: Quiz;
  onRefresh: () => void;
  api: ReturnType<typeof useApi>;
}

export default function QuestionSection({
  quiz,
  onRefresh,
  api,
}: QuestionSectionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [quiz.id]);

  const loadQuestions = async () => {
    setLoading(true);
    const data = await api.get<{ quiz: { questions: Question[] } }>(
      `/api/quizzes/${quiz.id}/questions`
    );
    if (data?.quiz?.questions) {
      setQuestions(data.quiz.questions);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setShowModal(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    const result = await api.delete(`/api/admin/questions/${id}`);
    if (result) {
      loadQuestions();
      onRefresh();
    }
  };

  const handleSave = async (data: any) => {
    const url = editingQuestion
      ? `/api/admin/questions/${editingQuestion.id}`
      : `/api/admin/quizzes/${quiz.id}/questions`;
    const method = editingQuestion ? "put" : "post";

    const result = await api[method](url, data);
    if (result) {
      setShowModal(false);
      setEditingQuestion(null);
      loadQuestions();
      onRefresh();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-sm text-gray-600">Loading questions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Questions - {quiz.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {questions.length} {questions.length === 1 ? "question" : "questions"}
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

      {questions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No questions yet</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShowExcelUpload(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Upload from Excel
            </button>
            <span className="text-gray-400">or</span>
            <button
              onClick={handleCreate}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Create manually
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onEdit={() => handleEdit(question)}
              onDelete={() => handleDelete(question.id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <QuestionModal
          question={editingQuestion}
          onClose={() => {
            setShowModal(false);
            setEditingQuestion(null);
          }}
          onSave={handleSave}
          loading={api.loading}
        />
      )}

      {showExcelUpload && (
        <ExcelUpload
          quizId={quiz.id}
          onSuccess={() => {
            setShowExcelUpload(false);
            loadQuestions();
            onRefresh();
          }}
          onClose={() => setShowExcelUpload(false)}
        />
      )}
    </div>
  );
}

