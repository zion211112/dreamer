export function getRollEmptyStateMessage(isDemoMode: boolean): string {
  return isDemoMode
    ? 'No Roll entries in this browser.'
    : 'No Roll entries were returned by the configured Records source.';
}
