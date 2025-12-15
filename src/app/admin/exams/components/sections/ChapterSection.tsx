"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/hooks/useApi";
import EntityCard from "../cards/EntityCard";
import EntityModal from "../modals/EntityModal";

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

interface ChapterSectionProps {
  subject: Subject;
  selectedChapter: Chapter | null;
  onSelect: (chapter: Chapter | null) => void;
  onRefresh: () => void;
  api: ReturnType<typeof useApi>;
}

export default function ChapterSection({
  subject,
  selectedChapter,
  onSelect,
  onRefresh,
  api,
}: ChapterSectionProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    loadChapters();
  }, [subject.id]);

  const loadChapters = async () => {
    setLoading(true);
    const data = await api.get<{ subject: { chapters: Chapter[] } }>(
      `/api/subjects/${subject.id}`
    );
    if (data?.subject?.chapters) {
      setChapters(data.subject.chapters);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingChapter(null);
    setShowModal(true);
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all quizzes and questions.")) {
      return;
    }

    const result = await api.delete(`/api/admin/chapters/${id}`);
    if (result) {
      loadChapters();
      onRefresh();
      if (selectedChapter?.id === id) {
        onSelect(null);
      }
    }
  };

  const handleSave = async (data: any) => {
    const url = editingChapter
      ? `/api/admin/chapters/${editingChapter.id}`
      : `/api/admin/subjects/${subject.id}/chapters`;
    const method = editingChapter ? "put" : "post";

    const result = await api[method](url, data);
    if (result) {
      setShowModal(false);
      setEditingChapter(null);
      loadChapters();
      onRefresh();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-sm text-gray-600">Loading chapters...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
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

      {chapters.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No chapters yet</p>
          <button
            onClick={handleCreate}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Create your first chapter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((chapter) => (
            <EntityCard
              key={chapter.id}
              title={chapter.name}
              description={chapter.description}
              isActive={chapter.isActive}
              isSelected={selectedChapter?.id === chapter.id}
              onSelect={() => onSelect(chapter)}
              onEdit={() => handleEdit(chapter)}
              onDelete={() => handleDelete(chapter.id)}
              actionLabel="View Quizzes →"
            />
          ))}
        </div>
      )}

      {showModal && (
        <EntityModal
          title={editingChapter ? "Edit Chapter" : "Create Chapter"}
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "order", label: "Order", type: "number" },
            { name: "isActive", label: "Active", type: "checkbox" },
          ]}
          initialData={editingChapter || { name: "", description: "", order: 0, isActive: true }}
          onClose={() => {
            setShowModal(false);
            setEditingChapter(null);
          }}
          onSave={handleSave}
          loading={api.loading}
        />
      )}
    </div>
  );
}

