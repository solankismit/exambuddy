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
  isActive: boolean;
  order: number;
}

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

export default function QuestionList({
  questions,
  onEdit,
  onDelete,
}: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No questions found. Create your first question.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div
          key={question.id}
          className="border-2 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-medium text-gray-900">{question.text}</p>
                {question.isActive ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Correct: {question.correctAnswer}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    (question as any).complexity === "EASY"
                      ? "bg-green-100 text-green-800"
                      : (question as any).complexity === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {(question as any).complexity || "MEDIUM"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-sm">
                  <span className="font-medium">A:</span> {question.optionA}
                </div>
                <div className="text-sm">
                  <span className="font-medium">B:</span> {question.optionB}
                </div>
                <div className="text-sm">
                  <span className="font-medium">C:</span> {question.optionC}
                </div>
                <div className="text-sm">
                  <span className="font-medium">D:</span> {question.optionD}
                </div>
              </div>
              {question.explanation && (
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Explanation:</span>{" "}
                  {question.explanation}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onEdit(question)}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(question.id)}
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
