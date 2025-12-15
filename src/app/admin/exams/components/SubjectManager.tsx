"use client";

import { useState, useEffect } from "react";
import SubjectList from "./SubjectList";
import SubjectForm from "./SubjectForm";

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

interface SubjectManagerProps {
  exam: Exam;
  selectedSubject: Subject | null;
  onSelectSubject: (subject: Subject) => void;
  onRefresh: () => void;
}

export default function SubjectManager({
  exam,
  selectedSubject,
  onSelectSubject,
  onRefresh,
}: SubjectManagerProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const fetchSubjects = async () => {
    try {
      const { getAccessToken } = await import("@/lib/auth/storage");
      const token = getAccessToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const response = await fetch(`/api/exams/${exam.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data.exam.subjects || []);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [exam.id]);

  const handleCreate = () => {
    setEditingSubject(null);
    setShowForm(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this subject? This will delete all associated chapters, quizzes, and questions."
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
      const response = await fetch(`/api/admin/subjects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchSubjects();
        if (selectedSubject?.id === id) {
          onSelectSubject(null as any);
        }
      } else {
        const error = await response.json();
        alert(error.error?.message || "Failed to delete subject");
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Failed to delete subject");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSubject(null);
    fetchSubjects();
    onRefresh();
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
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

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <SubjectList
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSelect={onSelectSubject}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showForm && (
          <SubjectForm
            examId={exam.id}
            subject={editingSubject}
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        )}
      </div>
    </div>
  );
}
