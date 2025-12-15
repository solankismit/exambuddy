"use client";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
}

interface SubjectListProps {
  subjects: Subject[];
  selectedSubject: Subject | null;
  onSelect: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

export default function SubjectList({
  subjects,
  selectedSubject,
  onSelect,
  onEdit,
  onDelete,
}: SubjectListProps) {
  if (subjects.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No subjects found. Create your first subject.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {subjects.map((subject) => (
        <div
          key={subject.id}
          className={`border-2 rounded-lg p-3 cursor-pointer transition-all shadow-sm hover:shadow ${
            selectedSubject?.id === subject.id
              ? "border-indigo-500 bg-indigo-50 shadow-md"
              : "border-gray-200 hover:border-indigo-300 bg-white"
          }`}
          onClick={() => onSelect(subject)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{subject.name}</h4>
                {subject.isActive ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </div>
              {subject.description && (
                <p className="mt-1 text-sm text-gray-500">
                  {subject.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(subject);
                }}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(subject.id);
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
