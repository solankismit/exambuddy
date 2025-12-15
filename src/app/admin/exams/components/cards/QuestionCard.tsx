"use client";

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

interface QuestionCardProps {
  question: Question;
  onEdit: () => void;
  onDelete: () => void;
}

export default function QuestionCard({
  question,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  const complexityColors = {
    EASY: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HARD: "bg-red-100 text-red-800",
  };

  return (
    <div className="border-2 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <p className="font-medium text-gray-900 flex-1">{question.text}</p>
            {question.isActive ? (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                Inactive
              </span>
            )}
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${complexityColors[question.complexity]}`}>
              {question.complexity}
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              ✓ {question.correctAnswer}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-sm">
              <span className="font-medium text-gray-700">A:</span>{" "}
              <span className="text-gray-900">{question.optionA}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">B:</span>{" "}
              <span className="text-gray-900">{question.optionB}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">C:</span>{" "}
              <span className="text-gray-900">{question.optionC}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">D:</span>{" "}
              <span className="text-gray-900">{question.optionD}</span>
            </div>
          </div>
          {question.explanation && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-xs font-medium text-gray-700 mb-1">
                Explanation:
              </p>
              <p className="text-sm text-gray-600">{question.explanation}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

