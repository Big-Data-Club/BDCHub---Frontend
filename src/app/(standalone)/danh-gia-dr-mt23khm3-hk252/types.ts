export interface FormData {
  // Personal Info
  fullName: string;
  lastName: string;
  firstName: string;
  studentId: string;
  email: string;

  // Criteria Scores (numbers as strings for raw input binding, then parsed/validated)
  score1: string; // Ý thức học tập (0-20)
  score2: string; // Chấp hành nội quy (0-25)
  score3: string; // Hoạt động chính trị, văn hóa... (0-20)
  score4: string; // Ý thức công dân, cộng đồng (0-25)
  score5: string; // Cán bộ lớp, đoàn thể... (0-10)
  score6: string; // Điểm thưởng đặc biệt (Tự do)

  // Evidence Files / Uploaded URLs
  evidenceUrl1: string;
  evidenceUrl2: string;
  evidenceUrl3: string;
  evidenceUrl4: string;
  evidenceUrl5: string;
  evidenceUrl6: string;

  evidenceName1: string;
  evidenceName2: string;
  evidenceName3: string;
  evidenceName4: string;
  evidenceName5: string;
  evidenceName6: string;

  // Additional info
  inquiry: string; // Thắc mắc của sinh viên
  agreeTruth: boolean; // Cam đoan thông tin đúng sự thật
  password: string; // Mật khẩu submission (8-12 ký tự)
}

export interface Errors {
  [key: string]: string;
}

export const MAX_SCORES = {
  score1: 20,
  score2: 25,
  score3: 20,
  score4: 25,
  score5: 10,
};

export const THRESHOLDS = {
  score1: 18, // 90% of 20
  score2: 22.5, // 90% of 25 → we can trigger upload if score >= 23
  score3: 18, // 90% of 20
  score4: 22.5, // 90% of 25 → trigger if >= 23
  score5: 9, // 90% of 10 → trigger if >= 9
};

export interface Translation {
  title: string;
  subtitle: string;
  studentInfoTitle: string;
  studentInfoDesc: string;
  fullName: string;
  lastName: string;
  firstName: string;
  studentId: string;
  email: string;
  steps: string[];
  back: string;
  next: string;
  submit: string;
  submitting: string;
  // Criteria strings
  criteriaTitle: string;
  criteriaDesc: string;
  crit1Label: string;
  crit2Label: string;
  crit3Label: string;
  crit4Label: string;
  crit5Label: string;
  crit6Label: string;
  crit4Hint: string;
  crit5Hint: string;
  crit6Hint: string;
  // Upload strings
  evidenceLabel: string;
  uploadDrag: string;
  uploadClick: string;
  uploadHint: string;
  uploading: string;
  uploadSuccess: string;
}
