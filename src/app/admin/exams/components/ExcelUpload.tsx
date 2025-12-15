"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/useApi";

interface ExcelUploadProps {
  quizId: string;
  onSuccess: () => void;
  onClose: () => void;
}

interface QuestionRow {
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
  complexity?: string;
  order?: number;
}

export default function ExcelUpload({
  quizId,
  onSuccess,
  onClose,
}: ExcelUploadProps) {
  const api = useApi();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<QuestionRow[]>([]);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      setError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setFile(selectedFile);
    setError("");

    // Read and preview the file
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const XLSX = await import("xlsx");
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        // Map Excel columns to question fields
        const questions: QuestionRow[] = jsonData.map((row, index) => ({
          text:
            row["Question"] ||
            row["question"] ||
            row["Text"] ||
            row["text"] ||
            "",
          optionA: row["Option A"] || row["optionA"] || row["A"] || "",
          optionB: row["Option B"] || row["optionB"] || row["B"] || "",
          optionC: row["Option C"] || row["optionC"] || row["C"] || "",
          optionD: row["Option D"] || row["optionD"] || row["D"] || "",
          correctAnswer: (
            row["Correct Answer"] ||
            row["correctAnswer"] ||
            row["Answer"] ||
            row["answer"] ||
            "A"
          )
            .toString()
            .toUpperCase(),
          explanation: row["Explanation"] || row["explanation"] || "",
          complexity: (row["Complexity"] || row["complexity"] || "MEDIUM")
            .toString()
            .toUpperCase(),
          order: row["Order"] || row["order"] || index + 1,
        }));

        // Validate questions
        const invalidQuestions = questions.filter(
          (q) =>
            !q.text ||
            !q.optionA ||
            !q.optionB ||
            !q.optionC ||
            !q.optionD ||
            !["A", "B", "C", "D"].includes(q.correctAnswer)
        );

        if (invalidQuestions.length > 0) {
          setError(
            `Found ${invalidQuestions.length} invalid questions. Please check your Excel file.`
          );
          setPreview([]);
        } else {
          setPreview(questions);
        }
      } catch (err) {
        setError("Failed to read Excel file. Please check the format.");
        setPreview([]);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || preview.length === 0) {
      setError("Please select a valid Excel file");
      return;
    }

    setError("");

    // Upload questions in batches
    const batchSize = 10;
    try {
      for (let i = 0; i < preview.length; i += batchSize) {
        const batch = preview.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (question) => {
            const result = await api.post(
              `/api/admin/quizzes/${quizId}/questions`,
              {
                text: question.text,
                optionA: question.optionA,
                optionB: question.optionB,
                optionC: question.optionC,
                optionD: question.optionD,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation || null,
                complexity: question.complexity || "MEDIUM",
                order: question.order || 0,
              }
            );

            if (!result) {
              throw new Error("Failed to create question");
            }
          })
        );
      }

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : api.error || "Failed to upload questions"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white my-10">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Upload Questions from Excel
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excel File (.xlsx or .xls)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="mt-2 text-xs text-gray-500">
              Expected columns: Question, Option A, Option B, Option C, Option
              D, Correct Answer, Explanation (optional), Complexity (optional),
              Order (optional)
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {preview.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Preview ({preview.length} questions)
              </h4>
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        #
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Question
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Answer
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Complexity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.slice(0, 10).map((q, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-xs">
                          {q.text}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {q.correctAnswer}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {q.complexity || "MEDIUM"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 10 && (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    ... and {preview.length - 10} more questions
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={api.loading || preview.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {api.loading
                ? "Uploading..."
                : `Upload ${preview.length} Questions`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
