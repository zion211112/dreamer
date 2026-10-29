alter type public.tender_status
  add value if not exists 'capitalized_pending_settlement';
