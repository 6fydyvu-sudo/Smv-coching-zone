/**
 * Basic Bangladesh-style grading scale (out of 100, converted to a
 * percentage of full marks for exams with a different total). Admin can
 * adjust these bands later without touching calculation call sites by
 * editing this single table.
 */
const GRADE_BANDS: Array<{ min: number; grade: string; gpa: number }> = [
  { min: 80, grade: "A+", gpa: 5.0 },
  { min: 70, grade: "A", gpa: 4.0 },
  { min: 60, grade: "A-", gpa: 3.5 },
  { min: 50, grade: "B", gpa: 3.0 },
  { min: 40, grade: "C", gpa: 2.0 },
  { min: 33, grade: "D", gpa: 1.0 },
  { min: 0, grade: "F", gpa: 0.0 }
];

export function calculateGrade(marksObtained: number, fullMarks: number): { grade: string; gpa: number } {
  const percentage = fullMarks > 0 ? (marksObtained / fullMarks) * 100 : 0;
  const band = GRADE_BANDS.find((b) => percentage >= b.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
  return { grade: band.grade, gpa: band.gpa };
}

export function isPassing(marksObtained: number, passMarks: number) {
  return marksObtained >= passMarks;
}
