import { z } from "zod";
import { UserRole } from "@/generated/prisma/enums";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});

export const createExamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  order: z.number().int().default(0),
});

export const updateExamSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  order: z.number().int().default(0),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const createChapterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  order: z.number().int().default(0),
});

export const updateChapterSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  order: z.number().int().default(0),
});

export const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const createQuestionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().optional(),
  complexity: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  order: z.number().int().default(0),
});

export const updateQuestionSchema = z.object({
  text: z.string().min(1).optional(),
  optionA: z.string().min(1).optional(),
  optionB: z.string().min(1).optional(),
  optionC: z.string().min(1).optional(),
  optionD: z.string().min(1).optional(),
  correctAnswer: z.enum(["A", "B", "C", "D"]).optional(),
  explanation: z.string().optional(),
  complexity: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const submitQuizAttemptSchema = z.object({
  responses: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedAnswer: z.enum(["A", "B", "C", "D"]),
    })
  ),
});

export const reorderSchema = z.object({
  order: z.number().int(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type SubmitQuizAttemptInput = z.infer<typeof submitQuizAttemptSchema>;
export type ReorderInput = z.infer<typeof reorderSchema>;
