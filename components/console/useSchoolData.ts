"use client";

// One source of truth for the console's data: students and scores in
// IndexedDB, mirrored in React state, with commit helpers that write
// through and refresh. Every workspace reads this — no tool keeps its
// own copy.

import { useCallback, useEffect, useState } from "react";
import {
  Assessment,
  Student,
  dumpSchool,
  loadAssessments,
  loadStudents,
  replaceSchool
} from "../../lib/school";
import { idbBulkPut, idbDelete, idbPut } from "../../lib/db";

export type DumpData = { students: Student[]; assessments: Assessment[] };

export interface SchoolData {
  loading: boolean;
  students: Student[];
  assessments: Assessment[];
  school: string;
  addStudents: (s: Student[]) => Promise<void>;
  upsertStudent: (s: Student) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  putScore: (a: Assessment) => Promise<void>;
  removeScore: (key: string) => Promise<void>;
  clearScores: (exam: string) => Promise<void>;
  importDump: (d: DumpData) => Promise<void>;
  exportDump: () => string;
}

export function useSchoolData(): SchoolData {
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState("");

  useEffect(() => {
    (async () => {
      const [s, a] = await Promise.all([loadStudents(), loadAssessments()]);
      setStudents(s);
      setAssessments(a);
      try {
        const raw = window.localStorage.getItem("aptlabs.console.session");
        if (raw) setSchool(((JSON.parse(raw) as { school?: string }).school || "Your school").slice(0, 40));
      } catch {
        setSchool("Your school");
      }
      setLoading(false);
    })();
  }, []);

  const addStudents = useCallback(async (rows: Student[]) => {
    await idbBulkPut("students", rows);
    setStudents((prev) => {
      const next = new Map(prev.map((s) => [s.id, s]));
      for (const r of rows) next.set(r.id, r);
      return [...next.values()].sort((a, b) => (a.className + a.name).localeCompare(b.className + b.name));
    });
  }, []);

  const upsertStudent = useCallback(async (s: Student) => {
    await idbPut("students", s);
    setStudents((prev) => {
      const next = new Map(prev.map((x) => [x.id, x]));
      next.set(s.id, s);
      return [...next.values()];
    });
  }, []);

  const removeStudent = useCallback(async (id: string) => {
    await idbDelete("students", id);
    const orphanKeys: string[] = [];
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setAssessments((prev) => {
      const kept = prev.filter((a) => a.studentId !== id);
      orphanKeys.push(...prev.filter((a) => a.studentId === id).map((a) => a.key));
      void (async () => {
        for (const k of orphanKeys) await idbDelete("assessments", k);
      })();
      return kept;
    });
  }, []);

  const putScore = useCallback(async (a: Assessment) => {
    await idbPut("assessments", a);
    setAssessments((prev) => [...prev.filter((x) => x.key !== a.key), a]);
  }, []);

  const removeScore = useCallback(async (key: string) => {
    await idbDelete("assessments", key);
    setAssessments((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const clearScores = useCallback(async (exam: string) => {
    const gone = assessments.filter((a) => a.exam === exam).map((a) => a.key);
    setAssessments((prev) => prev.filter((a) => a.exam !== exam));
    for (const k of gone) await idbDelete("assessments", k);
  }, [assessments]);

  const importDump = useCallback(async (dump: { students: Student[]; assessments: Assessment[] }) => {
    await replaceSchool(dump.students, dump.assessments);
    setStudents(dump.students);
    setAssessments(dump.assessments);
  }, []);

  const exportDump = useCallback(
    () => dumpSchool(school, students, assessments),
    [school, students, assessments]
  );

  return {
    loading,
    students,
    assessments,
    school,
    addStudents,
    upsertStudent,
    removeStudent,
    putScore,
    removeScore,
    clearScores,
    importDump,
    exportDump
  };
}
