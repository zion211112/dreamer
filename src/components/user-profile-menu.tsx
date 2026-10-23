'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  ChevronDown,
  CircleUserRound,
  Clock3,
  Coins,
  LogOut,
  Settings2,
  Sparkles,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { signOut } from '@/lib/supabase/sign-out';
import type { UserProfileData } from '@/lib/user-profile';
import { formatMoney } from '@/lib/tender-data';

export type ProfileSection = 'overview' | 'capability' | 'activity' | 'wallet' | 'settings';

interface LocalProfile {
  displayName: string;
  capabilities: string[];
  interests: string;
  learningGoals: string;
  shareOnApplications: boolean;
}

interface UserProfileMenuProps {
  userEmail: string;
  localMode?: boolean;
  profileData?: UserProfileData | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialSection?: ProfileSection;
  assetContext?: string | null;
}

const PROFILE_STORAGE_VERSION = 1;
const PROFILE_SECTION_ITEMS: { key: ProfileSection; label: string; icon: typeof UserRound; detail?: string }[] = [
  { key: 'overview', label: 'Profile overview', icon: CircleUserRound },
  { key: 'capability', label: 'Capability & interests', icon: Sparkles, detail: 'Self-described' },
  { key: 'activity', label: 'Activity', icon: Clock3 },
  { key: 'wallet', label: 'Wallet & banks', icon: WalletCards },
  { key: 'settings', label: 'Settings', icon: Settings2 },
];

const EMPTY_PROFILE: LocalProfile = {
  displayName: '',
  capabilities: [],
  interests: '',
  learningGoals: '',
  shareOnApplications: false,
};

function parseLocalProfile(value: unknown): LocalProfile | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const profile = value as Record<string, unknown>;
  if (profile.version !== PROFILE_STORAGE_VERSION
    || typeof profile.displayName !== 'string'
    || !Array.isArray(profile.capabilities)
    || !profile.capabilities.every(item => typeof item === 'string')
    || typeof profile.interests !== 'string'
    || typeof profile.learningGoals !== 'string'
    || typeof profile.shareOnApplications !== 'boolean') return null;
  if (profile.displayName.length > 80
    || profile.capabilities.length > 12
    || profile.capabilities.some(item => item.length > 40)
    || profile.interests.length > 1000
    || profile.learningGoals.length > 1000) return null;
  return {
    displayName: profile.displayName,
    capabilities: profile.capabilities,
    interests: profile.interests,
    learningGoals: profile.learningGoals,
    shareOnApplications: profile.shareOnApplications,
  };
}

function dateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

function intentStatus(status: 'SIGNALED' | 'WITHDRAWN' | 'SETTLED_OFFLINE'): string {
  if (status === 'SETTLED_OFFLINE') return 'Settled offline';
  if (status === 'WITHDRAWN') return 'Withdrawn';
  return 'Signaled · not settled';
}

export function UserProfileMenu({
  userEmail,
  localMode = false,
  profileData = null,
  open: controlledOpen,
  onOpenChange,
  initialSection = 'overview',
  assetContext = null,
}: UserProfileMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [section, setSection] = useState<ProfileSection>(initialSection);
  const [profile, setProfile] = useState<LocalProfile>(EMPTY_PROFILE);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const skipNextPersist = useRef(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = controlledOpen ?? internalOpen;
  const displayName = profile.displayName.trim()
    || profileData?.displayName?.trim()
    || userEmail.split('@')[0]
    || 'Member';
  const avatar = displayName.slice(0, 1).toUpperCase() || 'M';
  const storageKey = `aptlabs:profile:v${PROFILE_STORAGE_VERSION}:${userEmail.toLowerCase() || 'local'}`;

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(storageKey);
      if (stored !== null) {
        const parsed = parseLocalProfile(JSON.parse(stored));
        if (!parsed) {
          setStorageError(true);
        } else {
          setProfile(parsed);
        }
      }
    } catch {
      setStorageError(true);
    }
    setStorageReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!storageReady || storageError) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify({
        version: PROFILE_STORAGE_VERSION,
        ...profile,
      }));
    } catch {
      setStorageError(true);
    }
  }, [profile, storageError, storageKey, storageReady]);

  useEffect(() => {
    if (isOpen) setSection(initialSection);
  }, [initialSection, isOpen]);

  function setOpen(nextOpen: boolean) {
    if (!isControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function clearSessionProfile() {
    try {
      window.sessionStorage.removeItem(storageKey);
      skipNextPersist.current = true;
      setProfile(EMPTY_PROFILE);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  function setCapabilities(value: string) {
    const capabilities = value
      .split(',')
      .map(item => item.trim().slice(0, 40))
      .filter(Boolean)
      .slice(0, 12);
    setProfile(current => ({ ...current, capabilities }));
  }

  const activityItems = useMemo(() => {
    const items = [
      ...(profileData?.roll?.badges ?? []).map(badge => ({
        id: `badge-${badge.id}`,
        title: `${badge.role[0].toUpperCase()}${badge.role.slice(1)} capability badge`,
        detail: dateLabel(badge.issued_at),
        kind: 'verified' as const,
        time: new Date(badge.issued_at).getTime(),
      })),
      ...(profileData?.capitalIntents?.records ?? []).map(record => ({
        id: `capital-${record.id}`,
        title: `Capital intent · ${intentStatus(record.status)}`,
        detail: dateLabel(record.created_at),
        kind: 'capital' as const,
        time: new Date(record.created_at).getTime(),
      })),
    ];
    return items.sort((left, right) => right.time - left.time).slice(0, 5);
  }, [profileData]);

  const roll = profileData?.roll;
  const capitalIntents = profileData?.capitalIntents;

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={`Open profile menu for ${displayName}`}
          className="apt-profile-trigger"
          type="button"
        >
          <span className="apt-profile-avatar" aria-hidden="true">{avatar}</span>
          <span className="apt-profile-trigger-name">{displayName}</span>
          <ChevronDown aria-hidden="true" size={13} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" aria-label="User profile" className="apt-profile-menu" sideOffset={7}>
        <header className="apt-profile-identity">
          <span className="apt-profile-avatar apt-profile-avatar-large" aria-hidden="true">{avatar}</span>
          <span className="apt-profile-identity-copy">
            <strong>{displayName}</strong>
            <small>{localMode ? 'Local session · private' : 'Private profile'}</small>
          </span>
          <span className="apt-profile-rank">{roll?.error ? 'UNAVAILABLE' : roll?.rank ?? 'LOCAL SESSION'}</span>
        </header>
        {profileData?.profileError && <p className="apt-profile-inline-error" role="status">{profileData.profileError}</p>}

        {assetContext && (
          <div className="apt-profile-asset-context">
            <span>WORK INTEREST / ASSET</span>
            <strong>{assetContext}</strong>
            <small>No live role is connected. This does not submit an application.</small>
          </div>
        )}

        <nav className="apt-profile-sections" aria-label="Profile sections">
          {PROFILE_SECTION_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                aria-current={section === item.key ? 'page' : undefined}
                className={section === item.key ? 'is-active' : ''}
                key={item.key}
                onClick={() => setSection(item.key)}
                type="button"
              >
                <Icon aria-hidden="true" size={14} />
                <span>{item.label}</span>
                {item.key === 'capability' && item.detail && <small>{item.detail}</small>}
                {item.key === 'activity' && activityItems.length > 0 && <small>{activityItems.length}</small>}
              </button>
            );
          })}
        </nav>

        <section className="apt-profile-panel" aria-live="polite">
          {section === 'overview' && (
            <>
              <div className="apt-profile-panel-heading"><h2>Your place in the work</h2><span>ROLL RECORD</span></div>
              {roll?.error ? (
                <p className="apt-profile-empty apt-profile-error">{roll.error}</p>
              ) : roll ? (
                <>
                  <div className="apt-profile-metrics">
                    <div><small>Rank</small><strong>{roll.rank}</strong></div>
                    <div><small>Verified builds</small><strong>{roll.deployedAssetCount.toString().padStart(2, '0')}</strong></div>
                    <div><small>Earned badges</small><strong>{roll.capabilityBadgeCount.toString().padStart(2, '0')}</strong></div>
                  </div>
                  <p>{roll.capabilityBadgeCount ? 'Rank and badges reflect verified deployments in the Roll.' : 'No verified builds or earned badges yet. Self-described capability is welcome and does not require a prior badge.'}</p>
                </>
              ) : (
                <p className="apt-profile-empty">{localMode ? 'Verified Roll records are not connected in this local session.' : 'Verified Roll records are unavailable.'}</p>
              )}
            </>
          )}

          {section === 'capability' && (
            <>
              <div className="apt-profile-panel-heading"><h2>Capability &amp; interests</h2><span>SELF-DESCRIBED</span></div>
              <label className="apt-profile-field">Display name
                <input maxLength={80} onChange={event => setProfile(current => ({ ...current, displayName: event.target.value }))} placeholder={profileData?.displayName ?? userEmail.split('@')[0]} value={profile.displayName} />
              </label>
              <label className="apt-profile-field">Capabilities <small>Comma-separated · not verified</small>
                <input onChange={event => setCapabilities(event.target.value)} placeholder="Illustration, repair, field research" value={profile.capabilities.join(', ')} />
              </label>
              <label className="apt-profile-field">Work interests
                <textarea maxLength={1000} onChange={event => setProfile(current => ({ ...current, interests: event.target.value }))} placeholder="Kinds of work you want to join" rows={2} value={profile.interests} />
              </label>
              <label className="apt-profile-field">Learning goals
                <textarea maxLength={1000} onChange={event => setProfile(current => ({ ...current, learningGoals: event.target.value }))} placeholder="Skills or experience you want to develop" rows={2} value={profile.learningGoals} />
              </label>
              <p className="apt-profile-boundary">Private to this browser session. Review and choose what to share when applying for a real role.</p>
            </>
          )}

          {section === 'activity' && (
            <>
              <div className="apt-profile-panel-heading"><h2>Recent account activity</h2><span>RECORDED ONLY</span></div>
              {activityItems.length ? (
                <ul className="apt-profile-activity">
                  {activityItems.map(item => (
                    <li key={item.id}>
                      {item.kind === 'verified' ? <BadgeCheck aria-hidden="true" size={14} /> : <Coins aria-hidden="true" size={14} />}
                      <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="apt-profile-empty">
                  {profileData?.roll?.error || profileData?.capitalIntents?.error
                    ? 'Some account activity is unavailable.'
                    : 'No verified Roll or capital-intent activity is recorded.'}
                </p>
              )}
            </>
          )}

          {section === 'wallet' && (
            <>
              <div className="apt-profile-panel-heading"><h2>Wallet &amp; banks</h2><span>NO BANK CONNECTION</span></div>
              <p className="apt-profile-wallet-note">No bank or payment service is connected. These records are contribution intents, not a bank balance or withdrawable funds.</p>
              {capitalIntents?.error ? (
                <p className="apt-profile-empty apt-profile-error">{capitalIntents.error}</p>
              ) : capitalIntents?.records.length ? (
                <ul className="apt-profile-capital-list">
                  {capitalIntents.records.slice(0, 5).map(record => (
                    <li key={record.id}>
                      <span><strong>{formatMoney(record.amount_minor, record.currency)}</strong><small>{intentStatus(record.status)} · {dateLabel(record.created_at)}</small></span>
                      <small>Tender {record.tender_id.slice(0, 8)}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="apt-profile-empty">{capitalIntents
                  ? 'No capital-intent records.'
                  : localMode ? 'Capital records are not connected in this local session.' : 'Capital-intent records are unavailable.'}</p>
              )}
              {roll?.error
                ? <p className="apt-profile-empty apt-profile-error">{roll.error}</p>
                : <p className="apt-profile-wallet-badges"><BadgeCheck aria-hidden="true" size={13} /> {roll?.capabilityBadgeCount ?? 0} Roll capability badges · not blockchain SBTs</p>}
            </>
          )}

          {section === 'settings' && (
            <>
              <div className="apt-profile-panel-heading"><h2>Settings</h2><span>SESSION ONLY</span></div>
              <p className="apt-profile-wallet-note">Profile edits are kept in this browser session only. They are not encrypted, synced, or shared with other users.</p>
              <label className="apt-profile-consent">
                <input checked={profile.shareOnApplications} onChange={event => setProfile(current => ({ ...current, shareOnApplications: event.target.checked }))} type="checkbox" />
                <span><strong>Remember my application-sharing preference</strong><small>Does not share anything automatically. Review the consent on each real application.</small></span>
              </label>
              {!storageReady && <small className="apt-profile-storage-state">Loading session profile…</small>}
              {storageError && (
                <div className="apt-profile-storage-error" role="alert">
                  <p>Session profile data could not be read or saved.</p>
                  <button onClick={clearSessionProfile} type="button">Clear session profile</button>
                </div>
              )}
              <form action={signOut} className="apt-profile-signout"><button type="submit">Sign out</button><LogOut aria-hidden="true" size={13} /></form>
            </>
          )}
        </section>

        <footer className="apt-profile-footer">
          <span>{localMode ? 'LOCAL DEVELOPMENT IDENTITY' : 'SIGNED-IN IDENTITY'}</span>
          <small>{localMode ? 'No account data loads.' : userEmail}</small>
        </footer>
      </PopoverContent>
    </Popover>
  );
}
