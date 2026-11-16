// Benben-OS — CBC learner & staff sample data (illustrative demo data)

export type Learner = {
  id: string;
  name: string;
  grade: 4 | 5 | 6 | 7 | 8 | 9;
  stream: string;
  admissionNo: string;
  status: 'active' | 'inactive';
};

export type Teacher = {
  id: string;
  name: string;
  subject: string;
  classes: number;
  status: 'active' | 'on-leave';
};

export type Role = 'teacher' | 'principal' | 'coordinator';

export const CURRENT_USER = {
  name: 'Ms. Karimi',
  role: 'teacher' as Role,
  school: 'Benben-OS Academy',
};

export const PRINCIPAL = {
  name: 'Mr. Otieno',
  role: 'principal' as Role,
  school: 'Benben-OS Academy',
};

export const LEARNERS: Learner[] = [
  { id: 'L101', name: 'Amani Juma', grade: 5, stream: 'East', admissionNo: 'BEN-001', status: 'active' },
  { id: 'L102', name: 'Nalia Otieno', grade: 5, stream: 'East', admissionNo: 'BEN-002', status: 'active' },
  { id: 'L103', name: 'Tendai Mwangi', grade: 5, stream: 'West', admissionNo: 'BEN-003', status: 'active' },
  { id: 'L104', name: 'Kato Njeri', grade: 6, stream: 'North', admissionNo: 'BEN-004', status: 'active' },
  { id: 'L105', name: 'Imani Diallo', grade: 6, stream: 'North', admissionNo: 'BEN-005', status: 'active' },
  { id: 'L106', name: 'Zuberi Amos', grade: 7, stream: 'East', admissionNo: 'BEN-006', status: 'active' },
  { id: 'L107', name: 'Sana Hassan', grade: 7, stream: 'West', admissionNo: 'BEN-007', status: 'active' },
  { id: 'L108', name: 'Jomo Wekesa', grade: 8, stream: 'East', admissionNo: 'BEN-008', status: 'active' },
  { id: 'L109', name: 'Neema Chepkoech', grade: 8, stream: 'West', admissionNo: 'BEN-009', status: 'active' },
  { id: 'L110', name: 'Omar Said', grade: 9, stream: 'East', admissionNo: 'BEN-010', status: 'active' },
];

export const TEACHERS: Teacher[] = [
  { id: 'T201', name: 'Ms. Karimi', subject: 'Mathematics', classes: 4, status: 'active' },
  { id: 'T202', name: 'Mr. Okeke', subject: 'Integrated Science', classes: 3, status: 'active' },
  { id: 'T203', name: 'Ms. Nkosi', subject: 'English', classes: 3, status: 'on-leave' },
  { id: 'T204', name: 'Mr. Sow', subject: 'Kiswahili', classes: 4, status: 'active' },
  { id: 'T205', name: 'Ms. Abebe', subject: 'Social Studies', classes: 2, status: 'active' },
];

export const GRADES: (4 | 5 | 6 | 7 | 8 | 9)[] = [4, 5, 6, 7, 8, 9];
