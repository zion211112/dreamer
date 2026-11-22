/**
 * APT-LABS — Institutional Memory Engine (Stage 4 — Ecosystem)
 *
 * Every completed undertaking contributes reusable methods, cost histories,
 * lessons, standards, verified actors and asset histories. The intelligence
 * is cumulative, discoverable, and permission-aware.
 */

import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LessonType =
  | 'method' | 'protocol' | 'standard' | 'dataset' | 'model'
  | 'finding' | 'design' | 'curriculum' | 'lesson' | 'research'
  | 'labour' | 'ownership' | 'capital' | 'expertise' | 'risk'
  | 'contractual-entitlement';

export type VerificationStanding =
  | 'unassessed' | 'reported' | 'supported' | 'verified' | 'disputed' | 'rejected' | 'expired';

export interface LessonRecord {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  sourceActivityId: string;       // Roll entry this lesson derives from
  sourceUndertakingId: string;    // Commitment/Work unit it came from
  actorId: string;                // Who distilled the lesson
  organizationId?: string;
  tags: string[];
  evidenceIds: string[];          // Supporting evidence
  verificationStatus: VerificationStanding;
  applicability: string[];        // Tags/sectors where this applies
  reuseCount: number;             // How many times this lesson has been reused
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface InstitutionalMemoryQuery {
  query: string;
  tags?: string[];
  type?: LessonType;
  minVerificationStatus?: VerificationStanding;
  organizationId?: string;
  limit?: number;
}

export interface MemorySearchResult {
  lesson: LessonRecord;
  relevanceScore: number; // 0-100
  matchReasons: string[];
}

export interface MemoryInsight {
  id: string;
  title: string;
  description: string;
  type: 'pattern' | 'trend' | 'anomaly' | 'recommendation';
  sourceLessons: string[]; // Lesson IDs
  confidence: number; // 0-1
  createdAt: string;
  organizationId?: string; // Added for filtering
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const LESSONS_KEY = 'aptlabs:institutional-memory-lessons';
const INSIGHTS_KEY = 'aptlabs:institutional-memory-insights';

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function readLessons(): LessonRecord[] {
  return readJson<LessonRecord[]>(LESSONS_KEY, []);
}

function writeLessons(lessons: LessonRecord[]): void {
  writeJson(LESSONS_KEY, lessons);
}

function readInsights(): MemoryInsight[] {
  return readJson<MemoryInsight[]>(INSIGHTS_KEY, []);
}

function writeInsights(insights: MemoryInsight[]): void {
  writeJson(INSIGHTS_KEY, insights);
}

// ---------------------------------------------------------------------------
// Lesson Management
// ---------------------------------------------------------------------------

export interface CreateLessonInput {
  title: string;
  description: string;
  type: LessonType;
  sourceActivityId: string;
  sourceUndertakingId: string;
  actorId: string;
  organizationId?: string;
  tags?: string[];
  evidenceIds?: string[];
  verificationStatus?: VerificationStanding;
  applicability?: string[];
  authz?: AuthzContext;
}

/**
 * Distill an accepted outcome into a lesson record.
 */
export function createLesson(input: CreateLessonInput): LessonRecord {
  if (input.authz) {
    requirePermission(input.authz, 'knowledge:write');
  }

  const lesson: LessonRecord = {
    id: createId('lesson'),
    title: input.title,
    description: input.description,
    type: input.type,
    sourceActivityId: input.sourceActivityId,
    sourceUndertakingId: input.sourceUndertakingId,
    actorId: input.actorId,
    organizationId: input.organizationId,
    tags: input.tags ?? [],
    evidenceIds: input.evidenceIds ?? [],
    verificationStatus: input.verificationStatus ?? 'reported',
    applicability: input.applicability ?? [],
    reuseCount: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    version: 1,
  };

  const lessons = readLessons();
  lessons.push(lesson);
  writeLessons(lessons);

  logAuditEvent({
    accountId: input.actorId,
    actorId: input.actorId,
    action: 'knowledge.create',
    resourceType: 'lesson',
    resourceId: lesson.id,
    details: { title: input.title, type: input.type, sourceActivityId: input.sourceActivityId },
  });

  return lesson;
}

export function getLesson(lessonId: string): LessonRecord | undefined {
  return readLessons().find((l) => l.id === lessonId);
}

export function listLessons(filter?: {
  actorId?: string;
  organizationId?: string;
  type?: LessonType;
  verificationStatus?: VerificationStanding;
  tag?: string;
}): LessonRecord[] {
  return readLessons().filter((l) => {
    if (filter?.actorId && l.actorId !== filter.actorId) return false;
    if (filter?.organizationId && l.organizationId !== filter.organizationId) return false;
    if (filter?.type && l.type !== filter.type) return false;
    if (filter?.verificationStatus && l.verificationStatus !== filter.verificationStatus) return false;
    if (filter?.tag && !l.tags.includes(filter.tag)) return false;
    return true;
  });
}

export interface UpdateLessonInput {
  lessonId: string;
  title?: string;
  description?: string;
  type?: LessonType;
  tags?: string[];
  evidenceIds?: string[];
  verificationStatus?: VerificationStanding;
  applicability?: string[];
  updatedBy: string;
  authz?: AuthzContext;
}

export function updateLesson(input: UpdateLessonInput): LessonRecord | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'knowledge:write');
  }

  const lessons = readLessons();
  const idx = lessons.findIndex((l) => l.id === input.lessonId);
  if (idx === -1) return undefined;

  const lesson = lessons[idx];
  lessons[idx] = {
    ...lesson,
    title: input.title ?? lesson.title,
    description: input.description ?? lesson.description,
    type: input.type ?? lesson.type,
    tags: input.tags ?? lesson.tags,
    evidenceIds: input.evidenceIds ?? lesson.evidenceIds,
    verificationStatus: input.verificationStatus ?? lesson.verificationStatus,
    applicability: input.applicability ?? lesson.applicability,
    updatedAt: nowIso(),
    version: lesson.version + 1,
  };
  writeLessons(lessons);

  logAuditEvent({
    accountId: input.updatedBy,
    actorId: lesson.actorId,
    action: 'record.update',
    resourceType: 'lesson',
    resourceId: input.lessonId,
    details: { changes: Object.keys(input).filter((k) => k !== 'lessonId' && k !== 'updatedBy' && k !== 'authz') },
  });

  return lessons[idx];
}

// ---------------------------------------------------------------------------
// Memory Search & Discovery
// ---------------------------------------------------------------------------

export interface SearchMemoryInput {
  query: string;
  tags?: string[];
  type?: LessonType;
  minVerificationStatus?: VerificationStanding;
  organizationId?: string;
  limit?: number;
  authz?: AuthzContext;
}

/**
 * Search institutional memory with relevance scoring.
 */
export function searchMemory(input: SearchMemoryInput): MemorySearchResult[] {
  if (input.authz) {
    requirePermission(input.authz, 'knowledge:read');
  }

  const lessons = readLessons();
  const queryTokens = input.query.toLowerCase().split(/\s+/).filter(Boolean);

  const results: MemorySearchResult[] = lessons.map((lesson) => {
    let score = 0;
    const reasons: string[] = [];

    // Title match
    if (queryTokens.some((t) => lesson.title.toLowerCase().includes(t))) {
      score += 30;
      reasons.push('Title match');
    }

    // Description match
    if (queryTokens.some((t) => lesson.description.toLowerCase().includes(t))) {
      score += 20;
      reasons.push('Description match');
    }

    // Tag match
    const tagMatches = input.tags?.filter((t) => lesson.tags.includes(t)) ?? [];
    if (tagMatches.length > 0) {
      score += tagMatches.length * 10;
      reasons.push(`Tag match: ${tagMatches.join(', ')}`);
    }

    // Type match
    if (input.type && lesson.type === input.type) {
      score += 15;
      reasons.push(`Type: ${lesson.type}`);
    }

    // Verification status boost
    if (lesson.verificationStatus === 'verified') score += 10;
    else if (lesson.verificationStatus === 'supported') score += 5;

    // Organization match
    if (input.organizationId && lesson.organizationId === input.organizationId) {
      score += 5;
      reasons.push('Same organization');
    }

    // Reuse boost
    if (lesson.reuseCount > 0) {
      score += Math.min(lesson.reuseCount * 2, 20);
      reasons.push(`Reused ${lesson.reuseCount} times`);
    }

    return { lesson, relevanceScore: Math.min(score, 100), matchReasons: reasons };
  }).filter((r) => r.relevanceScore > 0).sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results.slice(0, input.limit ?? 20);
}

// ---------------------------------------------------------------------------
// Memory Insights
// ---------------------------------------------------------------------------

export interface GenerateInsightsInput {
  organizationId?: string;
  periodFrom?: string;
  periodTo?: string;
  generatedBy: string;
  authz?: AuthzContext;
}

/**
 * Generate insights from institutional memory (patterns, trends, anomalies).
 */
export function generateInsights(input: GenerateInsightsInput): MemoryInsight[] {
  if (input.authz) {
    requirePermission(input.authz, 'intelligence:read');
  }

  const lessons = readLessons().filter((l) =>
    (!input.organizationId || l.organizationId === input.organizationId) &&
    (!input.periodFrom || l.createdAt >= input.periodFrom) &&
    (!input.periodTo || l.createdAt <= input.periodTo)
  );

  const insights: MemoryInsight[] = [];

  // Insight 1: Most reused lesson type
  const typeCounts = lessons.reduce((acc, l) => {
    acc[l.type] = (acc[l.type] || 0) + 1;
    return acc;
  }, {} as Record<LessonType, number>);

  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  if (topType) {
    insights.push({
      id: createId('insight'),
      title: `Most common lesson type: ${topType[0]}`,
      description: `${topType[1]} lessons of type "${topType[0]}" recorded`,
      type: 'pattern',
      sourceLessons: lessons.filter((l) => l.type === topType[0] as LessonType).map((l) => l.id),
      confidence: Math.min(topType[1] / lessons.length, 1),
      createdAt: nowIso(),
      organizationId: input.organizationId,
    });
  }

  // Insight 2: Low verification rate
  const unverifiedCount = lessons.filter((l) => l.verificationStatus === 'unassessed' || l.verificationStatus === 'reported').length;
  if (lessons.length > 0 && unverifiedCount / lessons.length > 0.5) {
    insights.push({
      id: createId('insight'),
      title: 'High unverified lesson rate',
      description: `${Math.round((unverifiedCount / lessons.length) * 100)}% of lessons lack verification`,
      type: 'anomaly',
      sourceLessons: lessons.filter((l) => l.verificationStatus === 'unassessed' || l.verificationStatus === 'reported').map((l) => l.id),
      confidence: 0.8,
      createdAt: nowIso(),
      organizationId: input.organizationId,
    });
  }

  // Insight 3: Most reused lessons
  const topLessons = lessons.sort((a, b) => b.reuseCount - a.reuseCount).slice(0, 3);
  if (topLessons.length > 0 && topLessons[0].reuseCount > 0) {
    insights.push({
      id: createId('insight'),
      title: 'Most reusable lessons',
      description: `Top lesson "${topLessons[0].title}" reused ${topLessons[0].reuseCount} times`,
      type: 'recommendation',
      sourceLessons: topLessons.map((l) => l.id),
      confidence: 0.7,
      createdAt: nowIso(),
      organizationId: input.organizationId,
    });
  }

  const insightsList = readInsights();
  insightsList.push(...insights);
  writeInsights(insightsList);

  logAuditEvent({
    accountId: input.generatedBy,
    actorId: input.generatedBy,
    action: 'record.create',
    resourceType: 'memory-insight',
    resourceId: 'insights-batch',
    details: { organizationId: input.organizationId, insightsCount: insights.length },
  });

  return insights;
}

export function getInsights(filter?: {
  organizationId?: string;
  type?: MemoryInsight['type'];
}): MemoryInsight[] {
  return readInsights().filter((i) => {
    if (filter?.organizationId && i.organizationId !== filter.organizationId) return false;
    if (filter?.type && i.type !== filter.type) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Memory Statistics
// ---------------------------------------------------------------------------

export interface MemoryStats {
  totalLessons: number;
  lessonsByType: Record<LessonType, number>;
  lessonsByVerification: Record<string, number>;
  totalReuse: number;
  topLessons: Array<{ id: string; title: string; reuseCount: number }>;
  organizationsUsing: number;
}

export function getMemoryStats(organizationId?: string): MemoryStats {
  const lessons = readLessons().filter((l) =>
    !organizationId || l.organizationId === organizationId
  );

  const lessonsByType: Record<LessonType, number> = {} as Record<LessonType, number>;

  let totalReuse = 0;
  for (const l of lessons) {
    lessonsByType[l.type] = (lessonsByType[l.type] || 0) + 1;
    totalReuse += l.reuseCount;
  }

  const lessonsByVerification: Record<string, number> = {};
  for (const l of lessons) {
    lessonsByVerification[l.verificationStatus] = (lessonsByVerification[l.verificationStatus] || 0) + 1;
  }

  const topLessons = lessons
    .sort((a, b) => b.reuseCount - a.reuseCount)
    .slice(0, 5)
    .map((l) => ({ id: l.id, title: l.title, reuseCount: l.reuseCount }));

  const organizationsUsing = new Set(lessons.map((l) => l.organizationId).filter(Boolean)).size;

  return {
    totalLessons: lessons.length,
    lessonsByType,
    lessonsByVerification,
    totalReuse,
    topLessons,
    organizationsUsing,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

