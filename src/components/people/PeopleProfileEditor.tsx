import { useEffect, useRef, useState } from 'preact/hooks';
import { createLocalId } from '../../lib/local-workflows';
import {
  canEditPeopleProfile,
  createUserProfileRevision,
  isPeopleAvailability,
  updateUserProfileRevision,
  type PeopleAvailability,
  type PeopleContactMethod,
  type PeopleContactMethodType,
  type PeopleProfileRecord,
} from '../../lib/people-profiles';

interface PeopleProfileEditorProps {
  baseline: PeopleProfileRecord;
  profile?: PeopleProfileRecord;
  ownerId: string;
  onSave: (profile: PeopleProfileRecord) => void;
}

interface ProfileDraft {
  availability: PeopleAvailability;
  contactMethods: PeopleContactMethod[];
}

const availabilityOptions: Array<{ value: PeopleAvailability; label: string }> = [
  { value: 'not-stated', label: 'Not stated' },
  { value: 'open-to-enquiries', label: 'Open to enquiries' },
  { value: 'limited-availability', label: 'Limited availability' },
  { value: 'not-taking-work', label: 'Not currently taking work' },
];

const contactTypes: Array<{ value: PeopleContactMethodType; label: string }> = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'website', label: 'Website' },
  { value: 'other', label: 'Other' },
];

function isContactMethodType(value: string): value is PeopleContactMethodType {
  return contactTypes.some(option => option.value === value);
}

function contactInputType(type: PeopleContactMethodType): string {
  if (type === 'email') return 'email';
  if (type === 'phone') return 'tel';
  if (type === 'website') return 'url';
  return 'text';
}

function createDraft(profile: PeopleProfileRecord): ProfileDraft {
  return {
    availability: profile.availability,
    contactMethods: profile.contactMethods.map(method => ({ ...method })),
  };
}

export function PeopleProfileEditor({
  baseline,
  profile,
  ownerId,
  onSave,
}: PeopleProfileEditorProps) {
  const ownedRevision = profile
    && profile.sourceRecordId === baseline.id
    && canEditPeopleProfile(profile, ownerId)
    ? profile
    : undefined;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [editingProfile, setEditingProfile] = useState<PeopleProfileRecord | null>(null);
  const [error, setError] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const availabilityRef = useRef<HTMLSelectElement>(null);
  const wasEditingRef = useRef(false);

  useEffect(() => {
    if (editing && !wasEditingRef.current) availabilityRef.current?.focus();
    if (!editing && wasEditingRef.current) triggerRef.current?.focus();
    wasEditingRef.current = editing;
  }, [editing]);

  const startEditing = () => {
    const source = ownedRevision ?? createUserProfileRevision(baseline, ownerId);
    setEditingProfile(source);
    setDraft(createDraft(source));
    setError('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setDraft(null);
    setEditingProfile(null);
    setError('');
  };

  const updateContact = (index: number, changes: Partial<PeopleContactMethod>) => {
    setDraft(current => current ? {
      ...current,
      contactMethods: current.contactMethods.map((method, methodIndex) => (
        methodIndex === index ? { ...method, ...changes } : changes.preferred
          ? { ...method, preferred: false }
          : method
      )),
    } : current);
  };

  const addContact = () => {
    setDraft(current => current ? {
      ...current,
      contactMethods: [
        ...current.contactMethods,
        {
          id: createLocalId('people-contact'),
          type: 'email',
          value: '',
          display: false,
          preferred: false,
        },
      ],
    } : current);
  };

  const removeContact = (id: string) => {
    setDraft(current => current ? {
      ...current,
      contactMethods: current.contactMethods.filter(method => method.id !== id),
    } : current);
  };

  const save = (event: Event) => {
    event.preventDefault();
    if (!draft || !editingProfile) return;
    try {
      const updated = updateUserProfileRevision(editingProfile, ownerId, {
        availability: draft.availability,
        availabilityUpdatedAt: draft.availability !== editingProfile.availability
          ? new Date().toISOString()
          : editingProfile.availabilityUpdatedAt,
        contactMethods: draft.contactMethods,
      });
      onSave(updated);
      setEditing(false);
      setDraft(null);
      setEditingProfile(null);
      setError('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Local profile revision could not be saved.');
    }
  };

  if (!editing || !draft) {
    return (
      <div className="people-profile-editor">
        <p className="people-profile-editor-note">
          Browser-local only. Changes are not published or sent, and do not alter the imported record.
        </p>
        <button ref={triggerRef} className="people-profile-editor-trigger" onClick={startEditing} type="button">
          {ownedRevision ? 'Edit local preferences' : 'Create local revision'}
        </button>
      </div>
    );
  }

  return (
    <form className="people-profile-editor" onSubmit={save}>
      <p className="people-profile-editor-note">
        Browser-local only. The imported identity, capabilities, work, and relationships remain unchanged.
      </p>
      {error && <p className="people-profile-editor-error" role="alert">{error}</p>}
      <label className="people-profile-editor-field">
        <span>Availability</span>
        <select
          ref={availabilityRef}
          value={draft.availability}
          onChange={event => {
            const availability = event.currentTarget.value;
            if (isPeopleAvailability(availability)) {
              setDraft(current => current ? { ...current, availability } : current);
            }
          }}
        >
          {availabilityOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <fieldset className="people-profile-editor-contacts">
        <legend>Contact methods</legend>
        {draft.contactMethods.map((method, index) => (
          <div className="people-profile-editor-contact" key={method.id}>
            <label>
              <span>Type</span>
              <select
                value={method.type}
                onChange={event => {
                  const type = event.currentTarget.value;
                  if (isContactMethodType(type)) updateContact(index, { type });
                }}
              >
                {contactTypes.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Contact value</span>
              <input
                autoComplete="off"
                required
                type={contactInputType(method.type)}
                value={method.value}
                onInput={event => updateContact(index, { value: event.currentTarget.value })}
              />
            </label>
            <label className="people-profile-editor-check">
              <input
                checked={method.display}
                type="checkbox"
                onChange={event => updateContact(index, { display: event.currentTarget.checked })}
              />
              <span>Show in this profile</span>
            </label>
            <label className="people-profile-editor-check">
              <input
                checked={method.preferred}
                type="checkbox"
                onChange={event => updateContact(index, { preferred: event.currentTarget.checked })}
              />
              <span>Preferred method</span>
            </label>
            <button
              aria-label={`Remove ${method.type} contact method`}
              className="people-profile-editor-remove"
              onClick={() => removeContact(method.id)}
              type="button"
            >
              Remove
            </button>
          </div>
        ))}
        <button className="people-profile-editor-add" onClick={addContact} type="button">
          Add contact method
        </button>
      </fieldset>

      <div className="people-profile-editor-actions">
        <button className="people-profile-editor-cancel" onClick={cancelEditing} type="button">Cancel</button>
        <button className="people-profile-editor-save" type="submit">Save local revision</button>
      </div>
    </form>
  );
}
