"use client";

import { useState, useEffect } from "react";
import ChapterList from "./ChapterList";
import ChapterForm from "./ChapterForm";

interface Subject {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
}

interface ChapterManagerProps {
  subject: Subject;
  selectedChapter: Chapter | null;
  onSelectChapter: (chapter: Chapter) => void;
  onRefresh: () => void;
}

export default function ChapterManager({
  subject,
  selectedChapter,
  onSelectChapter,
  onRefresh,
}: ChapterManagerProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  const fetchChapters = async () => {
    try {
      const { getAccessToken } = await import("@/lib/auth/storage");
      const token = getAccessToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const response = await fetch(`/api/subjects/${subject.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChapters(data.subject.chapters || []);
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [subject.id]);

  const handleCreate = () => {
    setEditingChapter(null);
    setShowForm(true);
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this chapter? This will delete all associated quizzes and questions."
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
      const response = await fetch(`/api/admin/chapters/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchChapters();
        if (selectedChapter?.id === id) {
          onSelectChapter(null as any);
        }
      } else {
        const error = await response.json();
        alert(error.error?.message || "Failed to delete chapter");
      }
    } catch (error) {
      console.error("Error deleting chapter:", error);
      alert("Failed to delete chapter");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingChapter(null);
    fetchChapters();
    onRefresh();
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Chapters - {subject.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            + Add Chapter
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <ChapterList
            chapters={chapters}
            selectedChapter={selectedChapter}
            onSelect={onSelectChapter}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showForm && (
          <ChapterForm
            subjectId={subject.id}
            chapter={editingChapter}
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        )}
      </div>
    </div>
  );
}
