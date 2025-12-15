"use client";

import { useState, useEffect } from "react";

interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox";
  required?: boolean;
}

interface EntityModalProps {
  title: string;
  fields: Field[];
  initialData: Record<string, any>;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  loading: boolean;
}

export default function EntityModal({
  title,
  fields,
  initialData,
  onClose,
  onSave,
  loading,
}: EntityModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                {field.type === "checkbox" ? (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData[field.name] || false}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {field.label}
                    </span>
                  </label>
                ) : field.type === "textarea" ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && "*"}
                    </label>
                    <textarea
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      disabled={loading}
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && "*"}
                    </label>
                    <input
                      type={field.type}
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleChange(
                          field.name,
                          field.type === "number"
                            ? parseInt(e.target.value) || 0
                            : e.target.value
                        )
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      disabled={loading}
                    />
                  </>
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

