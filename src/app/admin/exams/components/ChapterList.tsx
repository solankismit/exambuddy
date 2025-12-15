"use client";

interface Chapter {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
}

interface ChapterListProps {
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  onSelect: (chapter: Chapter) => void;
  onEdit: (chapter: Chapter) => void;
  onDelete: (id: string) => void;
}

export default function ChapterList({
  chapters,
  selectedChapter,
  onSelect,
  onEdit,
  onDelete,
}: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No chapters found. Create your first chapter.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chapters.map((chapter) => (
        <div
          key={chapter.id}
          className={`border-2 rounded-lg p-3 cursor-pointer transition-all shadow-sm hover:shadow ${
            selectedChapter?.id === chapter.id
              ? "border-indigo-500 bg-indigo-50 shadow-md"
              : "border-gray-200 hover:border-indigo-300 bg-white"
          }`}
          onClick={() => onSelect(chapter)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{chapter.name}</h4>
                {chapter.isActive ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </div>
              {chapter.description && (
                <p className="mt-1 text-sm text-gray-500">
                  {chapter.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(chapter);
                }}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chapter.id);
                }}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
