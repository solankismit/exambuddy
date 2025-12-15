"use client";

interface Exam {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ExamListProps {
  exams: Exam[];
  selectedExam: Exam | null;
  onSelect: (exam: Exam) => void;
  onEdit: (exam: Exam) => void;
  onDelete: (id: string) => void;
}

export default function ExamList({
  exams,
  selectedExam,
  onSelect,
  onEdit,
  onDelete,
}: ExamListProps) {
  if (exams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No exams found. Create your first exam to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exams.map((exam) => (
        <div
          key={exam.id}
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all shadow-sm hover:shadow-md ${
            selectedExam?.id === exam.id
              ? "border-indigo-500 bg-indigo-50 shadow-md"
              : "border-gray-200 hover:border-indigo-300 bg-white"
          }`}
          onClick={() => onSelect(exam)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-medium text-gray-900">
                  {exam.name}
                </h4>
                {exam.isActive ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </div>
              {exam.description && (
                <p className="mt-1 text-sm text-gray-500">{exam.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(exam);
                }}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(exam.id);
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

