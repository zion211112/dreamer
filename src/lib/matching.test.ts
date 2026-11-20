/**
 * APT-LABS — Coordination matching tests (Gate 3 → Gate 4 bridge)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  matchNeeds,
  matchOpenNeeds,
  findMissingNeeds,
  providersFromProfiles,
} from './matching';
import { postNeed, acceptCommitment } from './commitment-journey';
import { onboardActor, getProductiveProfile } from './onboarding-journey';
import { clearRecords } from './record-envelope';
import { clearRelationships } from './relationship-store';
import { clearAuditEvents } from './audit';
import { clearAllStore } from './storage';

beforeEach(() => {
  clearAllStore();
  clearRecords();
  clearRelationships();
  clearAuditEvents();
});

describe('Coordination matching', () => {
  it('matches a need to the providers that offer what it requires', () => {
    const welder = onboardActor({
      type: 'individual',
      name: 'Sam Welds',
      ownerId: 'account-01',
      createdBy: 'account-01',
      capabilities: [{ name: 'Welding', type: 'Skill' }],
    });

    const need = postNeed({
      need: 'Fence repair',
      actorId: 'demand-01',
      postedBy: 'account-02',
      requires: ['Skill'],
    });

    const providers = providersFromProfiles([getProductiveProfile(welder.actor.id)]);
    const [result] = matchNeeds([need.id], providers);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].providerActorId).toBe(welder.actor.id);
    expect(result.matches[0].matchedOn).toContain('Skill');
    expect(result.isMissing).toBe(false);
  });

  it('flags a need as missing when no provider offers what it requires', () => {
    const welder = onboardActor({
      type: 'individual',
      name: 'Sam Welds',
      ownerId: 'account-01',
      createdBy: 'account-01',
      capabilities: [{ name: 'Welding', type: 'Skill' }],
    });

    const need = postNeed({
      need: 'We need an accountant',
      actorId: 'demand-01',
      postedBy: 'account-02',
      requires: ['Qualification'], // no provider offers this category
    });

    const providers = providersFromProfiles([getProductiveProfile(welder.actor.id)]);
    const [result] = matchNeeds([need.id], providers);
    expect(result.matches).toHaveLength(0);
    expect(result.isMissing).toBe(true);
  });

  it('reveals the missing needs from the open set', () => {
    const welder = onboardActor({
      type: 'individual',
      name: 'Sam Welds',
      ownerId: 'account-01',
      createdBy: 'account-01',
      capabilities: [{ name: 'Welding', type: 'Skill' }],
    });
    const covered = postNeed({
      need: 'Fence repair',
      actorId: 'demand-01',
      postedBy: 'a',
      requires: ['Skill'],
    });
    const gap = postNeed({
      need: 'Bookkeeping',
      actorId: 'demand-01',
      postedBy: 'a',
      requires: ['Qualification'],
    });

    const providers = providersFromProfiles([getProductiveProfile(welder.actor.id)]);
    const matchings = matchOpenNeeds(providers);
    const ids = matchings.map((m) => m.needId);
    expect(matchings).toHaveLength(2);
    expect(ids).toContain(covered.id);
    expect(ids).toContain(gap.id);

    const missing = findMissingNeeds(matchings);
    expect(missing).toHaveLength(1);
    expect(missing[0].needId).toBe(gap.id);
  });

  it('excludes needs that are no longer open from the open set', () => {
    const welder = onboardActor({
      type: 'individual',
      name: 'Sam',
      ownerId: 'account-01',
      createdBy: 'account-01',
      capabilities: [{ name: 'Welding', type: 'Skill' }],
    });

    const openNeed = postNeed({ need: 'Still open', actorId: 'd', postedBy: 'a', requires: ['Skill'] });
    const committedNeed = postNeed({ need: 'Committed one', actorId: 'd', postedBy: 'a', requires: ['Skill'] });
    // Commit the second need so it is no longer open.
    acceptCommitment({ needId: committedNeed.id, providerActorId: welder.actor.id, acceptedBy: 'a' });

    const providers = providersFromProfiles([getProductiveProfile(welder.actor.id)]);
    const matchings = matchOpenNeeds(providers);
    // Only the still-open need is in the open set.
    expect(matchings.map((m) => m.needId)).toEqual([openNeed.id]);
    expect(matchings[0].isMissing).toBe(false);
  });

  it('a need with no declared requirements matches nothing (strict)', () => {
    const welder = onboardActor({
      type: 'individual',
      name: 'Sam',
      ownerId: 'account-01',
      createdBy: 'account-01',
      capabilities: [{ name: 'Welding', type: 'Skill' }],
    });
    const need = postNeed({ need: 'Vague need', actorId: 'd', postedBy: 'a' }); // no requires
    const providers = providersFromProfiles([getProductiveProfile(welder.actor.id)]);
    const [result] = matchNeeds([need.id], providers);
    expect(result.requires).toEqual([]);
    expect(result.matches).toHaveLength(0);
    expect(result.isMissing).toBe(true);
  });
});
