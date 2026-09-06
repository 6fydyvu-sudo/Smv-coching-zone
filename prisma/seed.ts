/**
 * Development seed data for S.M.V Coaching Zone.
 *
 * This creates a Super Admin, Admin, Teacher, Student, a sample Course,
 * Batch, Notice, and Result so the app is immediately explorable after
 * a fresh database setup.
 *
 * IMPORTANT — DEMO DATA WARNING:
 * The accounts below use simple, publicly-known passwords for local
 * development convenience ONLY. Before deploying to production:
 *   1. Delete or disable these demo accounts, OR
 *   2. Change their passwords immediately after first login.
 * Never leave demo credentials active on a production deployment.
 *
 * Run with: npm run seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // --- Users -----------------------------------------------------------
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@smvcoaching.test" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@smvcoaching.test",
      passwordHash,
      role: "SUPER_ADMIN"
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@smvcoaching.test" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@smvcoaching.test",
      passwordHash,
      role: "ADMIN"
    }
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@smvcoaching.test" },
    update: {},
    create: {
      name: "Rahim Ahmed",
      email: "teacher@smvcoaching.test",
      passwordHash,
      role: "TEACHER",
      teacherProfile: {
        create: {
          nameBn: "রহিম আহমেদ",
          qualification: "M.Sc in Mathematics",
          experienceYears: 8,
          subjectSpecialization: "Mathematics",
          bio: "Passionate about helping students build strong fundamentals in mathematics.",
          isActive: true
        }
      }
    },
    include: { teacherProfile: true }
  });

  const teacherProfile =
    teacherUser.teacherProfile ??
    (await prisma.teacherProfile.findUnique({ where: { userId: teacherUser.id } }));

  // --- Subjects ----------------------------------------------------------
  const mathSubject = await prisma.subject.upsert({
    where: { code: "MATH" },
    update: {},
    create: { nameBn: "গণিত", nameEn: "Mathematics", code: "MATH" }
  });
  await prisma.subject.upsert({
    where: { code: "ENG" },
    update: {},
    create: { nameBn: "ইংরেজি", nameEn: "English", code: "ENG" }
  });

  // --- Course & Batch ------------------------------------------------------
  const existingCourse = await prisma.course.findFirst({ where: { nameEn: "SSC Science Batch" } });
  const course =
    existingCourse ??
    (await prisma.course.create({
      data: {
        nameBn: "এসএসসি বিজ্ঞান ব্যাচ",
        nameEn: "SSC Science Batch",
        descriptionBn: "এসএসসি পরীক্ষার্থীদের জন্য বিজ্ঞান বিভাগের সম্পূর্ণ প্রস্তুতি কোর্স।",
        descriptionEn: "A complete preparation course for SSC Science students.",
        classGrade: "Class 10",
        primaryTeacherId: teacherProfile?.id,
        durationText: "6 months",
        monthlyFee: 1500,
        admissionFee: 500,
        seatLimit: 40,
        published: true,
        featured: true,
        subjectLinks: { create: [{ subjectId: mathSubject.id, teacherId: teacherProfile?.id }] }
      }
    }));

  const existingBatch = await prisma.batch.findFirst({ where: { name: "Morning Batch A", courseId: course.id } });
  const batch =
    existingBatch ??
    (await prisma.batch.create({
      data: {
        name: "Morning Batch A",
        courseId: course.id,
        teacherId: teacherProfile?.id,
        room: "Room 101",
        maxStudents: 30,
        startTime: "08:00",
        endTime: "10:00",
        daysText: "Sat, Mon, Wed",
        status: "ACTIVE"
      }
    }));

  // --- Student -------------------------------------------------------------
  const studentUser = await prisma.user.upsert({
    where: { email: "student@smvcoaching.test" },
    update: {},
    create: {
      name: "Karim Hossain",
      email: "student@smvcoaching.test",
      passwordHash,
      role: "STUDENT",
      studentProfile: {
        create: {
          studentCode: "SMV-2026-00001",
          fatherName: "Abdul Karim",
          motherName: "Fatema Begum",
          dob: new Date("2009-05-14"),
          gender: "MALE",
          address: "Dhaka, Bangladesh",
          institution: "ABC High School",
          courseId: course.id,
          batchId: batch.id,
          status: "ACTIVE"
        }
      }
    },
    include: { studentProfile: true }
  });

  const studentProfile =
    studentUser.studentProfile ??
    (await prisma.studentProfile.findUnique({ where: { userId: studentUser.id } }));

  if (studentProfile) {
    await prisma.enrollment.upsert({
      where: { studentId_batchId: { studentId: studentProfile.id, batchId: batch.id } },
      update: {},
      create: { studentId: studentProfile.id, courseId: course.id, batchId: batch.id }
    });
  }

  // --- Notice ----------------------------------------------------------------
  await prisma.notice.upsert({
    where: { id: "seed-notice-1" },
    update: {},
    create: {
      id: "seed-notice-1",
      titleBn: "নতুন শিক্ষাবর্ষ শুরু",
      titleEn: "New Academic Year Begins",
      bodyBn: "আগামী মাস থেকে নতুন শিক্ষাবর্ষের ক্লাস শুরু হবে।",
      bodyEn: "Classes for the new academic year begin next month. Please check your batch schedule.",
      category: "General",
      priority: "MEDIUM",
      published: true,
      pinned: true,
      createdById: superAdmin.id
    }
  });

  // --- Exam & Result -------------------------------------------------------
  if (studentProfile) {
    const exam = await prisma.exam.create({
      data: {
        titleBn: "প্রথম সাময়িক পরীক্ষা",
        titleEn: "First Term Exam",
        courseId: course.id,
        batchId: batch.id,
        subjectId: mathSubject.id,
        examDate: new Date(),
        fullMarks: 100,
        passMarks: 33,
        published: true,
        createdById: teacherProfile?.id
      }
    });

    await prisma.resultEntry.create({
      data: {
        examId: exam.id,
        studentId: studentProfile.id,
        marksObtained: 78,
        isAbsent: false,
        grade: "A",
        gpa: 4.0
      }
    });
  }

  console.log("Seed complete!");
  console.log("----------------------------------------------------");
  console.log("Demo login credentials (password for all: Password123!)");
  console.log("  Super Admin: superadmin@smvcoaching.test");
  console.log("  Admin:       admin@smvcoaching.test");
  console.log("  Teacher:     teacher@smvcoaching.test");
  console.log("  Student:     student@smvcoaching.test");
  console.log("----------------------------------------------------");
  console.log("CHANGE OR REMOVE THESE ACCOUNTS BEFORE PRODUCTION USE.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
