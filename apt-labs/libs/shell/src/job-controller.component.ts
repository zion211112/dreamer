/**
 * @apt-labs/shell — JobControllerComponent
 *
 * Workplace boundary: where people take jobs. Tracks job assignments,
 * statuses, and handoffs across modules.
 */

import { Component, signal } from '@angular/core';

export interface Job {
  id: string;
  module: string;
  title: string;
  status: 'open' | 'in-progress' | 'completed' | 'blocked';
  assignee?: string;
}

@Component({
  selector: 'app-job-controller',
  imports: [],
  template: `
    <div class="job-controller" aria-label="Job controller">
      <div class="job-head">
        <div class="job-title">Job Controller</div>
        <div class="job-count">{{ jobs().length }} jobs</div>
      </div>

      <div class="job-list">
        @for (job of jobs(); track job.id) {
          <div class="job-row">
            <span class="job-id">{{ job.id }}</span>
            <span class="job-module">{{ job.module }}</span>
            <span class="job-title">{{ job.title }}</span>
            <span class="job-badge {{ job.status }}">{{ job.status }}</span>
            @if (job.assignee) { <span class="job-assignee">{{ job.assignee }}</span> }
          </div>
        }
        @if (jobs().length === 0) {
          <div class="jobs-empty">No jobs assigned.</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .job-controller { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); padding: var(--apt-spacing-s6); }
    .job-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--apt-spacing-s5); }
    .job-title { font-weight: var(--apt-font-weight-semibold); font-size: var(--apt-font-size-body-sm); color: var(--apt-text-strong); }
    .job-count { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
    .job-list { display: flex; flex-direction: column; gap: var(--apt-spacing-s3); }
    .job-row { display: flex; align-items: center; gap: var(--apt-spacing-s3); padding: var(--apt-spacing-s3); border-radius: var(--apt-radius-r1); background: var(--apt-surface-raised); font-size: var(--apt-font-size-micro); }
    .job-id { font-family: var(--apt-font-mono); min-width: 48px; }
    .job-module { width: 96px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .job-title { flex: 1; color: var(--apt-text-strong); }
    .job-badge { font-size: var(--apt-font-size-micro); padding: var(--apt-spacing-s1) var(--apt-spacing-s3); border-radius: 999px; font-weight: var(--apt-font-weight-semibold); }
    .job-badge.open { background: var(--apt-surface-info); color: var(--apt-text-info); }
    .job-badge.in-progress { background: var(--apt-surface-info); color: var(--apt-module-accent); }
    .job-badge.completed { background: var(--apt-surface-success); color: var(--apt-text-success); }
    .job-badge.blocked { background: var(--apt-surface-danger); color: var(--apt-text-danger); }
    .job-assignee { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
    .jobs-empty { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); font-style: italic; padding: var(--apt-spacing-s6); }
  `],
})
export class JobControllerComponent {
  readonly jobs = signal<Job[]>([
    { id: 'job-001', module: 'workbench', title: 'Scope pilot deployment', status: 'in-progress', assignee: 'developer' },
    { id: 'job-002', module: 'records', title: 'Verify canon entries', status: 'open' },
    { id: 'job-003', module: 'intelligence', title: 'Run matching forecast', status: 'blocked', assignee: 'ai-agent' },
  ]);
}
