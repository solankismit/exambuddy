"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/hooks/useApi";
import EntityCard from "../cards/EntityCard";
import EntityModal from "../modals/EntityModal";

interface Exam {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
}

interface SubjectSectionProps {
  exam: Exam;
  selectedSubject: Subject | null;
  onSelect: (subject: Subject | null) => void;
  onRefresh: () => void;
  api: ReturnType<typeof useApi>;
}

export default function SubjectSection({
  exam,
  selectedSubject,
  onSelect,
  onRefresh,
  api,
}: SubjectSectionProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    loadSubjects();
  }, [exam.id]);

  const loadSubjects = async () => {
    setLoading(true);
    const data = await api.get<{ exam: { subjects: Subject[] } }>(
      `/api/exams/${exam.id}`
    );
    if (data?.exam?.subjects) {
      setSubjects(data.exam.subjects);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setShowModal(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all chapters, quizzes, and questions.")) {
      return;
    }

    const result = await api.delete(`/api/admin/subjects/${id}`);
    if (result) {
      loadSubjects();
      onRefresh();
      if (selectedSubject?.id === id) {
        onSelect(null);
      }
    }
  };

  const handleSave = async (data: any) => {
    const url = editingSubject
      ? `/api/admin/subjects/${editingSubject.id}`
      : `/api/admin/exams/${exam.id}/subjects`;
    const method = editingSubject ? "put" : "post";

    const result = await api[method](url, data);
    if (result) {
      setShowModal(false);
      setEditingSubject(null);
      loadSubjects();
      onRefresh();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-sm text-gray-600">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Subjects - {exam.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          + Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No subjects yet</p>
          <button
            onClick={handleCreate}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Create your first subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <EntityCard
              key={subject.id}
              title={subject.name}
              description={subject.description}
              isActive={subject.isActive}
              isSelected={selectedSubject?.id === subject.id}
              onSelect={() => onSelect(subject)}
              onEdit={() => handleEdit(subject)}
              onDelete={() => handleDelete(subject.id)}
              actionLabel="View Chapters →"
            />
          ))}
        </div>
      )}

      {showModal && (
        <EntityModal
          title={editingSubject ? "Edit Subject" : "Create Subject"}
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "order", label: "Order", type: "number" },
            { name: "isActive", label: "Active", type: "checkbox" },
          ]}
          initialData={editingSubject || { name: "", description: "", order: 0, isActive: true }}
          onClose={() => {
            setShowModal(false);
            setEditingSubject(null);
          }}
          onSave={handleSave}
          loading={api.loading}
        />
      )}
    </div>
  );
}

