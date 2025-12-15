"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/useApi";
import ExamCard from "../cards/ExamCard";
import ExamModal from "../modals/ExamModal";

interface Exam {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
}

interface ExamSectionProps {
  exams: Exam[];
  selectedExam: Exam | null;
  onSelect: (exam: Exam | null) => void;
  onRefresh: () => void;
  api: ReturnType<typeof useApi>;
}

export default function ExamSection({
  exams,
  selectedExam,
  onSelect,
  onRefresh,
  api,
}: ExamSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const handleCreate = () => {
    setEditingExam(null);
    setShowModal(true);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure? This will delete all subjects, chapters, quizzes, and questions."
      )
    ) {
      return;
    }

    const result = await api.delete(`/api/admin/exams/${id}`);
    if (result) {
      onRefresh();
      if (selectedExam?.id === id) {
        onSelect(null);
      }
    }
  };

  const handleSave = async (data: any) => {
    const url = editingExam
      ? `/api/admin/exams/${editingExam.id}`
      : "/api/admin/exams";
    const method = editingExam ? "put" : "post";

    const result = await api[method](url, data);
    if (result) {
      setShowModal(false);
      setEditingExam(null);
      onRefresh();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Exams</h3>
          <p className="text-sm text-gray-500 mt-1">
            {exams.length} {exams.length === 1 ? "exam" : "exams"}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Add Exam
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No exams yet</p>
          <button
            onClick={handleCreate}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Create your first exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              isSelected={selectedExam?.id === exam.id}
              onSelect={() => onSelect(exam)}
              onEdit={() => handleEdit(exam)}
              onDelete={() => handleDelete(exam.id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ExamModal
          exam={editingExam}
          onClose={() => {
            setShowModal(false);
            setEditingExam(null);
          }}
          onSave={handleSave}
          loading={api.loading}
        />
      )}
    </div>
  );
}

