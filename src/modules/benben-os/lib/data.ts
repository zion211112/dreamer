// Benben-OS sample data — illustrative demo data, labelled as such
export const BENBEN_SCHOOL = {
  name: 'Benben-OS',
  tagline: 'School operations console',
};

export type Student = {
  id: string;
  name: string;
  grade: string;
  stream: string;
  attendance: number;
  status: 'active' | 'inactive';
};

export type Teacher = {
  id: string;
  name: string;
  subject: string;
  classes: number;
  status: 'active' | 'on-leave';
};

export type Course = {
  id: string;
  name: string;
  code: string;
  teacher: string;
  students: number;
};

export type FeeRecord = {
  id: string;
  student: string;
  amount: number;
  paid: number;
  status: 'paid' | 'partial' | 'unpaid';
};

export const STUDENTS: Student[] = [
  { id: 'S101', name: 'Amani Juma', grade: '9', stream: 'East', attendance: 96, status: 'active' },
  { id: 'S102', name: 'Nalia Otieno', grade: '9', stream: 'West', attendance: 89, status: 'active' },
  { id: 'S103', name: 'Tendai Mwangi', grade: '10', stream: 'North', attendance: 92, status: 'active' },
  { id: 'S104', name: 'Kato Njeri', grade: '10', stream: 'South', attendance: 78, status: 'active' },
  { id: 'S105', name: 'Imani Diallo', grade: '11', stream: 'East', attendance: 94, status: 'active' },
  { id: 'S106', name: 'Zuberi Amos', grade: '11', stream: 'West', attendance: 85, status: 'inactive' },
];

export const TEACHERS: Teacher[] = [
  { id: 'T201', name: 'Ms. Karimi', subject: 'Mathematics', classes: 4, status: 'active' },
  { id: 'T202', name: 'Mr. Okeke', subject: 'Physics', classes: 3, status: 'active' },
  { id: 'T203', name: 'Ms. Nkosi', subject: 'Biology', classes: 3, status: 'on-leave' },
  { id: 'T204', name: 'Mr. Sow', subject: 'English', classes: 4, status: 'active' },
  { id: 'T205', name: 'Ms. Abebe', subject: 'History', classes: 2, status: 'active' },
];

export const COURSES: Course[] = [
  { id: 'C301', name: 'Mathematics', code: 'MATH-9', teacher: 'Ms. Karimi', students: 42 },
  { id: 'C302', name: 'Physics', code: 'PHY-10', teacher: 'Mr. Okeke', students: 38 },
  { id: 'C303', name: 'Biology', code: 'BIO-11', teacher: 'Ms. Nkosi', students: 35 },
  { id: 'C304', name: 'English Literature', code: 'ENG-9', teacher: 'Mr. Sow', students: 44 },
  { id: 'C305', name: 'History', code: 'HIS-11', teacher: 'Ms. Abebe', students: 30 },
];

export const FEES: FeeRecord[] = [
  { id: 'F401', student: 'Amani Juma', amount: 12000, paid: 12000, status: 'paid' },
  { id: 'F402', student: 'Nalia Otieno', amount: 12000, paid: 8000, status: 'partial' },
  { id: 'F403', student: 'Tendai Mwangi', amount: 15000, paid: 15000, status: 'paid' },
  { id: 'F404', student: 'Kato Njeri', amount: 15000, paid: 4000, status: 'partial' },
  { id: 'F405', student: 'Imani Diallo', amount: 18000, paid: 0, status: 'unpaid' },
  { id: 'F406', student: 'Zuberi Amos', amount: 18000, paid: 18000, status: 'paid' },
];

export const ATTENDANCE_RATE = 89;
export const FEES_COLLECTED = 57000;
export const FEES_TOTAL = 90000;
