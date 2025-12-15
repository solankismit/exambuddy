"use client";

interface EntityCardProps {
  title: string;
  description: string | null;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  actionLabel?: string;
}

export default function EntityCard({
  title,
  description,
  isActive,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  actionLabel = "View →",
}: EntityCardProps) {
  return (
    <div
      className={`border-2 rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg ${
        isSelected
          ? "border-indigo-500 bg-indigo-50 shadow-md"
          : "border-gray-200 bg-white hover:border-indigo-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h4>
            {isActive ? (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 whitespace-nowrap">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 whitespace-nowrap">
                Inactive
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {description}
            </p>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {actionLabel}
          </button>
        </div>
        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
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

