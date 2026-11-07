import { describe, expect, it } from 'vitest';
import { getRollEmptyStateMessage } from './records-view';

describe('getRollEmptyStateMessage', () => {
  it('identifies browser-local demo storage', () => {
    expect(getRollEmptyStateMessage(true)).toBe('No Roll entries in this browser.');
  });

  it('identifies the configured Records source', () => {
    expect(getRollEmptyStateMessage(false))
      .toBe('No Roll entries were returned by the configured Records source.');
  });
});
