import { z } from "zod";

// Centralized Zod schemas used by both API route handlers (server-side,
// authoritative validation) and client forms (fast UX feedback). Server
// validation always runs regardless of what the client sends.

export const courseSchema = z.object({
  nameBn: z.string().min(1, "Bangla name is required"),
  nameEn: z.string().min(1, "English name is required"),
  descriptionBn: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  classGrade: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  primaryTeacherId: z.string().optional().nullable(),
  durationText: z.string().optional().nullable(),
  monthlyFee: z.coerce.number().min(0),
  admissionFee: z.coerce.number().min(0).default(0),
  seatLimit: z.coerce.number().int().positive().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  scheduleText: z.string().optional().nullable(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  subjectIds: z.array(z.string()).optional().default([])
});

export const subjectSchema = z.object({
  nameBn: z.string().min(1),
  nameEn: z.string().min(1),
  code: z.string().optional().nullable()
});

export const batchSchema = z.object({
  name: z.string().min(1),
  courseId: z.string().min(1),
  teacherId: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  maxStudents: z.coerce.number().int().positive().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  daysText: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "COMPLETED"]).default("ACTIVE")
});

export const noticeSchema = z.object({
  titleBn: z.string().min(1),
  titleEn: z.string().min(1),
  bodyBn: z.string().optional().nullable(),
  bodyEn: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  published: z.boolean().default(false),
  pinned: z.boolean().default(false),
  publishDate: z.string().optional()
});

export const routineSchema = z.object({
  day: z.enum(["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  courseId: z.string().min(1),
  subjectId: z.string().optional().nullable(),
  teacherId: z.string().optional().nullable(),
  batchId: z.string().min(1),
  room: z.string().optional().nullable(),
  published: z.boolean().default(false)
});

export const admissionSchema = z.object({
  applicantNameEn: z.string().min(1, "Name is required"),
  applicantNameBn: z.string().optional().nullable(),
  fatherName: z.string().min(1),
  motherName: z.string().min(1),
  dob: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().min(6, "Valid phone number required"),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  address: z.string().min(1),
  institution: z.string().optional().nullable(),
  targetClass: z.string().min(1),
  courseId: z.string().optional().nullable(),
  batchPreferenceId: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  previousResultUrl: z.string().optional().nullable(),
  additionalInfo: z.string().optional().nullable()
});

export const admissionReviewSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  reviewNote: z.string().optional().nullable()
});

export const createStudentFromAdmissionSchema = z.object({
  admissionId: z.string().min(1),
  email: z.string().email(),
  temporaryPassword: z.string().min(6),
  courseId: z.string().min(1),
  batchId: z.string().min(1)
});

export const teacherSchema = z.object({
  name: z.string().min(1),
  nameBn: z.string().optional().nullable(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  temporaryPassword: z.string().min(6).optional(),
  photoUrl: z.string().optional().nullable(),
  qualification: z.string().optional().nullable(),
  experienceYears: z.coerce.number().int().min(0).optional().nullable(),
  subjectSpecialization: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});

export const attendanceMarkSchema = z.object({
  date: z.string().min(1),
  courseId: z.string().min(1),
  batchId: z.string().min(1),
  subjectId: z.string().optional().nullable(),
  records: z
    .array(
      z.object({
        studentId: z.string().min(1),
        status: z.enum(["PRESENT", "ABSENT", "LATE"])
      })
    )
    .min(1)
});

export const examSchema = z.object({
  titleBn: z.string().min(1),
  titleEn: z.string().min(1),
  courseId: z.string().min(1),
  batchId: z.string().min(1),
  subjectId: z.string().min(1),
  examDate: z.string().min(1),
  fullMarks: z.coerce.number().positive(),
  passMarks: z.coerce.number().min(0),
  published: z.boolean().default(false)
});

export const resultEntrySchema = z.object({
  studentId: z.string().min(1),
  marksObtained: z.coerce.number().min(0).optional().nullable(),
  isAbsent: z.boolean().default(false)
});

export const resultBulkSchema = z.object({
  examId: z.string().min(1),
  entries: z.array(resultEntrySchema).min(1)
});

export const feeInvoiceSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.string().optional().nullable(),
  batchId: z.string().optional().nullable(),
  feeType: z.enum(["ADMISSION", "MONTHLY", "OTHER"]),
  periodLabel: z.string().optional().nullable(),
  amount: z.coerce.number().positive()
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive(),
  method: z.enum(["CASH", "BKASH", "NAGAD", "BANK", "OTHER"]),
  referenceNo: z.string().optional().nullable(),
  paidAt: z.string().optional()
});

export const studyMaterialSchema = z.object({
  titleBn: z.string().min(1),
  titleEn: z.string().min(1),
  type: z.enum(["PDF", "DOCUMENT", "IMAGE", "VIDEO_LINK", "NOTE"]),
  fileUrl: z.string().optional().nullable(),
  externalUrl: z.string().optional().nullable(),
  courseId: z.string().optional().nullable(),
  subjectId: z.string().optional().nullable(),
  batchId: z.string().optional().nullable(),
  published: z.boolean().default(true)
});

export const contactMessageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  message: z.string().min(1)
});

export const testimonialSchema = z.object({
  name: z.string().min(1),
  photoUrl: z.string().optional().nullable(),
  message: z.string().min(1),
  courseId: z.string().optional().nullable(),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  published: z.boolean().default(false)
});

export const achievementSchema = z.object({
  studentName: z.string().min(1),
  photoUrl: z.string().optional().nullable(),
  courseOrClass: z.string().optional().nullable(),
  examName: z.string().optional().nullable(),
  resultText: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  published: z.boolean().default(true)
});

export const galleryAlbumSchema = z.object({
  titleBn: z.string().min(1),
  titleEn: z.string().min(1),
  category: z.string().min(1),
  published: z.boolean().default(true)
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6)
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
