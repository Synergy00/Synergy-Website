import { z } from "zod";

export const ProfileCompletionSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  regNo: z.string().min(3, "Registration number must be valid").max(50),
  college: z.string().min(2, "College name is required").max(120),
  yearOfStudy: z.string().min(1, "Year of study is required (e.g. 1, 2)"),
  branch: z.string().min(2, "Branch is required (e.g. CSE, ECE)").max(50),
  department: z.string().min(2, "Department is required").max(50),
  section: z.string().min(1, "Section is required (e.g. A, B, 1)").max(20),
  contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Contact must be a valid 10-digit Indian phone number (starting with 6-9)"),
  email: z.string().email("Invalid email address"),
});

export const CreateTeamSchema = z.object({
  teamName: z
    .string()
    .min(3, "Team name must be at least 3 characters")
    .max(30, "Team name cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9 ]+$/, "Team name can only contain letters, numbers and spaces"),
  memberIds: z.array(z.string().uuid()).max(2, "Maximum 2 additional members allowed"),
});

export const JoinTeamSchema = z.object({
  code: z
    .string()
    .min(4, "Team code is too short")
    .max(12, "Team code is too long")
    .regex(/^[A-Z0-9-]+$/, "Invalid team code format"),
});

export const AdminLoginSchema = z.object({
  adminId: z.string().min(1, "Admin ID is required"),
  password: z.string().min(1, "Password is required"),
});

export const EventSettingsSchema = z.object({
  countdownLabel: z.string().min(1).max(50).optional(),
  countdownTarget: z.string().datetime().optional().nullable(),
  round1Unlocked: z.boolean(),
  round2Open: z.boolean(),
});
