'use client';

import { useActionState } from 'react';
import { saveInstitutionProfile, type InstitutionProfileActionState } from '../../app/tenders/institution-actions';

const initialState: InstitutionProfileActionState = {};

export function InstitutionProfileForm({
  organizationId,
  organizationName,
  summary,
  published,
}: {
  organizationId: string;
  organizationName: string;
  summary: string;
  published: boolean;
}) {
  const action = saveInstitutionProfile.bind(null, organizationId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <details className="institution-profile-editor">
      <summary>Manage {organizationName} profile</summary>
      <form action={formAction}>
        <label htmlFor={`institution-summary-${organizationId}`}>Public summary</label>
        <textarea
          defaultValue={summary}
          id={`institution-summary-${organizationId}`}
          maxLength={320}
          name="summary"
          placeholder="A short, institution-approved description."
          rows={3}
        />
        <label className="institution-publish-toggle">
          <input defaultChecked={published} name="published" type="checkbox" />
          <span>List this institution publicly</span>
        </label>
        {state.error && <p className="institution-form-message" role="alert">{state.error}</p>}
        {state.saved && <p className="institution-form-message" role="status">Profile saved.</p>}
        <button className="button button-outline button-small" disabled={pending} type="submit">
          {pending ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </details>
  );
}
