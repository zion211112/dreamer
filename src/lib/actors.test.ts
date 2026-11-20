/**
 * APT-LABS — Actor model tests (Gate 1 — Foundations)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createActor,
  listActors,
  getActor,
  addMember,
  listMembershipsForAccount,
  listMembershipsForActor,
  getMembership,
  removeMember,
  updateMemberRole,
  getActorsForAccount,
  getPrimaryActorForAccount,
  setPrimaryActor,
  getDemoAccountId,
  type ActorType,
} from './actors';
import { clearAllStore, setItem, removeItem } from './storage';

describe('Actor model', () => {
  beforeEach(() => {
    // Reset the active store (in-memory under tests) between tests
    clearAllStore();
  });

  describe('createActor', () => {
    it('creates an actor with the given input and owner', () => {
      const actor = createActor(
        { type: 'institution', name: 'Kibera Makerspace', description: 'Community workshop' },
        'account-01'
      );

      expect(actor.id).toMatch(/^actor-/);
      expect(actor.type).toBe('institution');
      expect(actor.name).toBe('Kibera Makerspace');
      expect(actor.description).toBe('Community workshop');
      expect(actor.ownerId).toBe('account-01');
      expect(actor.visibility).toBe('shared');
      expect(actor.version).toBe(1);
      expect(actor.createdAt).toBeDefined();
      expect(actor.updatedAt).toBeDefined();
    });

    it('defaults visibility to shared', () => {
      const actor = createActor({ type: 'crew', name: 'Build Crew' }, 'account-01');
      expect(actor.visibility).toBe('shared');
    });

    it('persists the actor so listActors returns it', () => {
      createActor({ type: 'company', name: 'Acme Ltd' }, 'account-01');
      const actors = listActors();
      expect(actors).toHaveLength(1);
      expect(actors[0].name).toBe('Acme Ltd');
    });

    it('supports all actor types', () => {
      const types: ActorType[] = [
        'individual', 'company', 'enterprise', 'startup', 'institution',
        'governmentUnit', 'university', 'school', 'researchLab', 'cooperative',
        'communityOrganisation', 'ngo', 'crew', 'consortium', 'other',
      ];
      types.forEach((t, i) => {
        createActor({ type: t, name: `Actor ${i}` }, 'account-01');
      });
      expect(listActors()).toHaveLength(types.length);
    });
  });

  describe('getActor', () => {
    it('returns the actor by id', () => {
      const created = createActor({ type: 'school', name: 'Nyeri Primary' }, 'account-01');
      const found = getActor(created.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe('Nyeri Primary');
    });

    it('returns undefined for unknown id', () => {
      expect(getActor('actor-unknown')).toBeUndefined();
    });
  });

  describe('addMember / memberships', () => {
    it('adds a member and returns the membership', () => {
      const actor = createActor({ type: 'crew', name: 'Build Crew' }, 'account-01');
      const membership = addMember({
        actorId: actor.id,
        accountId: 'account-02',
        role: 'member',
        invitedBy: 'account-01',
      });

      expect(membership.accountId).toBe('account-02');
      expect(membership.actorId).toBe(actor.id);
      expect(membership.role).toBe('member');
      expect(membership.invitedBy).toBe('account-01');
      expect(membership.isPrimary).toBe(true); // first membership for account-02
    });

    it('prevents duplicate membership', () => {
      const actor = createActor({ type: 'crew', name: 'Crew' }, 'account-01');
      addMember({ actorId: actor.id, accountId: 'account-02', role: 'member', invitedBy: null });
      const duplicate = addMember({ actorId: actor.id, accountId: 'account-02', role: 'member', invitedBy: null });
      expect(duplicate.id).toBe(addMember({ actorId: actor.id, accountId: 'account-02', role: 'member', invitedBy: null }).id);
      expect(listMembershipsForAccount('account-02')).toHaveLength(1);
    });

    it('lists memberships for an account', () => {
      const actor1 = createActor({ type: 'company', name: 'Co A' }, 'account-01');
      const actor2 = createActor({ type: 'institution', name: 'Inst B' }, 'account-01');
      addMember({ actorId: actor1.id, accountId: 'account-01', role: 'owner', invitedBy: null });
      addMember({ actorId: actor2.id, accountId: 'account-01', role: 'member', invitedBy: null });

      const memberships = listMembershipsForAccount('account-01');
      expect(memberships).toHaveLength(2);
    });

    it('lists memberships for an actor', () => {
      const actor = createActor({ type: 'crew', name: 'Crew' }, 'account-01');
      addMember({ actorId: actor.id, accountId: 'account-01', role: 'owner', invitedBy: null });
      addMember({ actorId: actor.id, accountId: 'account-02', role: 'member', invitedBy: 'account-01' });

      const members = listMembershipsForActor(actor.id);
      expect(members).toHaveLength(2);
    });

    it('getMembership returns the specific membership', () => {
      const actor = createActor({ type: 'crew', name: 'Crew' }, 'account-01');
      addMember({ actorId: actor.id, accountId: 'account-01', role: 'owner', invitedBy: null });
      const m = getMembership('account-01', actor.id);
      expect(m).toBeDefined();
      expect(m?.role).toBe('owner');
    });

    it('getMembership returns undefined for non-existent membership', () => {
      expect(getMembership('account-01', 'actor-unknown')).toBeUndefined();
    });
  });

  describe('removeMember', () => {
    it('removes a membership', () => {
      const actor = createActor({ type: 'crew', name: 'Crew' }, 'account-01');
      addMember({ actorId: actor.id, accountId: 'account-01', role: 'owner', invitedBy: null });
      addMember({ actorId: actor.id, accountId: 'account-02', role: 'member', invitedBy: 'account-01' });

      const removed = removeMember('account-02', actor.id);
      expect(removed).toBe(true);
      expect(listMembershipsForAccount('account-02')).toHaveLength(0);
      expect(listMembershipsForActor(actor.id)).toHaveLength(1);
    });

    it('returns false for non-existent membership', () => {
      expect(removeMember('account-01', 'actor-unknown')).toBe(false);
    });

    it('promotes another membership to primary when primary is removed', () => {
      // Two distinct actors for the same account: the first is primary, the second is not.
      createActor({ type: 'crew', name: 'Crew A' }, 'account-01');
      createActor({ type: 'crew', name: 'Crew B' }, 'account-01');

      const memberships = listMembershipsForAccount('account-01');
      const primary = memberships.find((m) => m.isPrimary);
      const nonPrimary = memberships.find((m) => !m.isPrimary);
      expect(primary).toBeDefined();
      expect(nonPrimary).toBeDefined();

      // Remove the primary membership; the remaining one should be promoted.
      removeMember('account-01', primary!.actorId);
      const remaining = listMembershipsForAccount('account-01');
      expect(remaining).toHaveLength(1);
      expect(remaining[0].isPrimary).toBe(true);
    });
  });

  describe('updateMemberRole', () => {
    it('updates a member role', () => {
      const actor = createActor({ type: 'crew', name: 'Crew' }, 'account-01');
      addMember({ actorId: actor.id, accountId: 'account-02', role: 'member', invitedBy: null });

      const updated = updateMemberRole('account-02', actor.id, 'manager');
      expect(updated).toBeDefined();
      expect(updated?.role).toBe('manager');

      const m = getMembership('account-02', actor.id);
      expect(m?.role).toBe('manager');
    });

    it('returns undefined for non-existent membership', () => {
      expect(updateMemberRole('account-01', 'actor-unknown', 'admin')).toBeUndefined();
    });
  });

  describe('getActorsForAccount', () => {
    it('returns actors the account is a member of', () => {
      const actor1 = createActor({ type: 'company', name: 'Co A' }, 'account-01');
      const actor2 = createActor({ type: 'institution', name: 'Inst B' }, 'account-01');
      addMember({ actorId: actor1.id, accountId: 'account-01', role: 'owner', invitedBy: null });
      addMember({ actorId: actor2.id, accountId: 'account-01', role: 'member', invitedBy: null });

      const actors = getActorsForAccount('account-01');
      expect(actors).toHaveLength(2);
    });

    it('returns empty array for account with no actors', () => {
      expect(getActorsForAccount('account-empty')).toHaveLength(0);
    });
  });

  describe('primary actor', () => {
    it('sets and gets the primary actor for an account', () => {
      const actor1 = createActor({ type: 'company', name: 'Co A' }, 'account-01');
      const actor2 = createActor({ type: 'institution', name: 'Inst B' }, 'account-01');
      addMember({ actorId: actor1.id, accountId: 'account-01', role: 'owner', invitedBy: null });
      addMember({ actorId: actor2.id, accountId: 'account-01', role: 'member', invitedBy: null });

      const primary = getPrimaryActorForAccount('account-01');
      expect(primary).toBeDefined();
      expect(primary?.isPrimary === undefined).toBe(true); // Actor type doesn't have isPrimary

      // Switch primary to actor2
      const switched = setPrimaryActor('account-01', actor2.id);
      expect(switched).toBe(true);
    });

    it('returns false for setPrimaryActor with unknown actor', () => {
      expect(setPrimaryActor('account-01', 'actor-unknown')).toBe(false);
    });
  });

  describe('getDemoAccountId', () => {
    it('returns null when no auth user in store', () => {
      removeItem('authUser');
      expect(getDemoAccountId()).toBeNull();
    });

    it('returns email from authUser when present', () => {
      setItem('authUser', JSON.stringify({ email: 'user@example.org' }));
      expect(getDemoAccountId()).toBe('user@example.org');
    });
  });
});
