'use client';

import { useActionState, useId, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CommonsActionState, CommonsFormAction } from '@/lib/commons-action-types';
import { reportCommonsContent } from '../../app/commons/actions';

const initialState: CommonsActionState = {};

export function CommonsActionForm({
  action,
  children,
  submitLabel,
  className = '',
}: {
  action: CommonsFormAction;
  children?: ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  return (
    <form action={formAction} className={`commons-form ${className}`}>
      {children}
      {submitLabel && <Button disabled={pending} type="submit">{pending ? 'Saving…' : submitLabel}</Button>}
      {state.error && <p className="commons-form-message error" role="alert">{state.error}</p>}
      {state.success && <p className="commons-form-message success" role="status">{state.success}</p>}
    </form>
  );
}

export function CommonsReportForm({
  targetKind,
  targetId,
}: {
  targetKind: 'resource' | 'post' | 'comment';
  targetId: string;
}) {
  const [state, formAction, pending] = useActionState(reportCommonsContent, initialState);
  return (
    <form action={formAction} className="commons-report-form">
      <input name="target_kind" type="hidden" value={targetKind} />
      <input name="target_id" type="hidden" value={targetId} />
      <Label className="sr-only" htmlFor={`report-${targetId}`}>Report reason</Label>
      <select id={`report-${targetId}`} name="reason" defaultValue="" required>
        <option disabled value="">Report this item</option>
        <option value="spam">Spam</option>
        <option value="unsafe">Unsafe or misleading</option>
        <option value="rights">Rights or attribution</option>
        <option value="privacy">Privacy</option>
        <option value="other">Other</option>
      </select>
      <Button disabled={pending} size="sm" type="submit" variant="outline">{pending ? 'Sending…' : 'Report'}</Button>
      {state.error && <span className="commons-form-message error" role="alert">{state.error}</span>}
      {state.success && <span className="commons-form-message success" role="status">{state.success}</span>}
    </form>
  );
}

export function CommonsModerationForm({
  action,
  fields,
  decisions,
  labels,
}: {
  action: CommonsFormAction;
  fields: Record<string, string>;
  decisions: string[];
  labels: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  return (
    <form action={formAction} className="commons-moderation-form">
      {Object.entries(fields).map(([name, value]) => <input key={name} name={name} type="hidden" value={value} />)}
      <Label className="sr-only" htmlFor={`moderation-note-${fields.request_id ?? fields.target_id ?? fields.report_id ?? fields.user_id}`}>Moderator note (optional)</Label>
      <Input className="commons-note-input" id={`moderation-note-${fields.request_id ?? fields.target_id ?? fields.report_id ?? fields.user_id}`} maxLength={500} name="note" placeholder="Optional moderation note" />
      <div className="commons-moderation-buttons">
        {decisions.map(decision => (
          <Button disabled={pending} key={decision} name="decision" size="sm" type="submit" value={decision} variant={decision === 'reject' || decision === 'decline' || decision === 'dismiss' || decision === 'false' ? 'outline' : 'default'}>
            {pending ? 'Saving…' : labels[decision] ?? decision}
          </Button>
        ))}
      </div>
      {state.error && <p className="commons-form-message error" role="alert">{state.error}</p>}
      {state.success && <p className="commons-form-message success" role="status">{state.success}</p>}
    </form>
  );
}

export function CommonsProfileForm({
  action,
  displayName,
  publicNameConsent,
}: {
  action: CommonsFormAction;
  displayName: string;
  publicNameConsent: boolean;
}) {
  return (
    <CommonsActionForm action={action} className="commons-profile-form" submitLabel="Save profile">
      <div className="commons-field">
        <Label htmlFor="commons-display-name">Display name</Label>
        <Input autoComplete="nickname" defaultValue={displayName} id="commons-display-name" maxLength={80} name="display_name" placeholder="Maker" />
      </div>
      <label className="commons-consent">
        <input defaultChecked={publicNameConsent} name="public_name_consent" type="checkbox" />
        <span>Show this name beside my public Commons posts and comments.</span>
      </label>
      <p className="commons-form-hint">When unchecked, public activity uses “Commons member”. Your email is never shown.</p>
    </CommonsActionForm>
  );
}

export function CommonsTextField({
  label,
  name,
  maxLength,
  required = true,
  multiline = false,
  rows = 4,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  maxLength: number;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  defaultValue?: string;
  placeholder?: string;
}) {
  const id = `commons-field-${name}-${useId()}`;
  return (
    <div className="commons-field">
      <Label htmlFor={id}>{label}</Label>
      {multiline
        ? <Textarea defaultValue={defaultValue} id={id} maxLength={maxLength} name={name} placeholder={placeholder} required={required} rows={rows} />
        : <Input defaultValue={defaultValue} id={id} maxLength={maxLength} name={name} placeholder={placeholder} required={required} />}
    </div>
  );
}
