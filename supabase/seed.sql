-- APT-LABS v3.0 — seed: 3 demo scenarios
-- Kibera Makerspace · Kemetos AGI1 · Thiba Hydro
-- Apply AFTER schema.sql / migrations/0001_init.sql.
-- All IDs are fixed uuids so cross-table FKs line up deterministically.
-- hash_anchor values are SHA-256 placeholders (64 hex chars).
-- Costs in KES.

-- ============================================================================
-- profiles — one admin for RLS bypass; one institutional profile per scenario
-- ============================================================================
insert into public.profiles (id, role, display_name, avatar_url, organization_name, location, service_area, created_by, updated_by)
values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'APT-LABS Admin', null, 'APT-LABS', 'Nairobi, Kenya',
   array['Nairobi'], null, null),
  ('00000000-0000-0000-0000-000000000002', 'institution', 'Kibera Makerspace', null, 'Kibera Makerspace', 'Kibera, Nairobi',
   array['Kibera', 'Nairobi'], null, null),
  ('00000000-0000-0000-0000-000000000003', 'founder', 'Kemetos AGI1', null, 'Kemetos', 'Nairobi, Kenya',
   array['Nairobi'], null, null),
  ('00000000-0000-0000-0000-000000000004', 'institution', 'Thiba Hydro', null, 'Thiba Hydro', 'Nakuru, Kenya',
   array['Nakuru', 'Rift Valley'], null, null),
  ('00000000-0000-0000-0000-000000000005', 'coordinator', 'Kembera Coordination', null, 'Kembera Labs', 'Nairobi, Kenya',
   array['Nairobi'], null, null);

-- ============================================================================
-- network_nodes — at least 2 per scenario: one institution, one project/work
-- ============================================================================
insert into public.network_nodes (id, type, label, record_basis, data, version)
values
  -- Kibera Makerspace
  ('10000000-0000-0000-0000-000000000001', 'institution', 'Kibera Makerspace', 'local-profile',
   jsonb '{"mission": "Shared fabrication and community workshop space", "focus": "makerspace"}', 1),
  ('10000000-0000-0000-0000-000000000002', 'work', 'Community Workshop Build-out', 'project-reported',
   jsonb '{"discipline": "fabrication", "stage": "in_progress"}', 1),
  -- Kemetos AGI1
  ('10000000-0000-0000-0000-000000000011', 'institution', 'Kemetos AGI1', 'local-profile',
   jsonb '{"mission": "Agentic research and software coordination", "focus": "agi-research"}', 1),
  ('10000000-0000-0000-0000-000000000012', 'work', 'AGI1 Contribution Pipeline', 'project-reported',
   jsonb '{"discipline": "software", "stage": "in_progress"}', 1),
  -- Thiba Hydro
  ('10000000-0000-0000-0000-000000000021', 'institution', 'Thiba Hydro', 'local-profile',
   jsonb '{"mission": "Small-scale hydro fabrication and site work", "focus": "hydro"}', 1),
  ('10000000-0000-0000-0000-000000000022', 'work', 'Turbine Intake Fabrication', 'project-reported',
   jsonb '{"discipline": "fabrication", "stage": "in_progress"}', 1);

-- ============================================================================
-- network_edges — 2–3 per scenario, valid RelationshipKinds
-- ============================================================================
insert into public.network_edges (id, from_id, to_id, kind, props, version)
values
  -- Kibera Makerspace
  ('20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'operates',
   jsonb '{"note": "institutions operate their own undertakings"}', 1),
  ('20000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'stewards',
   jsonb '{}', 1),
  ('20000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'funds',
   jsonb '{"currency": "KES"}', 1),
  -- Kemetos AGI1
  ('20000000-0000-0000-0000-000000000011',
   '10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000012', 'operates',
   jsonb '{}', 1),
  ('20000000-0000-0000-0000-000000000012',
   '10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000012', 'contributes_to',
   jsonb '{}', 1),
  ('20000000-0000-0000-0000-000000000013',
   '10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000012', 'attests',
   jsonb '{}', 1),
  -- Thiba Hydro
  ('20000000-0000-0000-0000-000000000021',
   '10000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000022', 'operates',
   jsonb '{}', 1),
  ('20000000-0000-0000-0000-000000000022',
   '10000000-0000-0000-0000-000000000021', '10000000-0000-0000-000000000022', 'stewards',
   jsonb '{}', 1),
  ('20000000-0000-0000-0000-000000000023',
   '10000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000022', 'funds',
   jsonb '{"currency": "KES"}', 1);

-- ============================================================================
-- commons_signals — 1 per scenario, status 'proposed'
-- ============================================================================
insert into public.commons_signals (id, observation, proposed_action, status, steward_id)
values
  ('30000000-0000-0000-0000-000000000001',
   'Neighbours report a shared workshop room with no flexible layout',
   'Commission a flexible workshop build-out', 'proposed',
   '00000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000002',
   'AGI1 research notes a bounded task with no verification evidence',
   'Add a contribution task with test verification', 'proposed',
   '00000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000003',
   'Site intake for turbine assembly lacks a fabrication plan',
   'Draft a fabrication and inspection plan', 'proposed',
   '00000000-0000-0000-0000-000000000004');

-- ============================================================================
-- work_opps — 1 per scenario, KES costs
-- ============================================================================
insert into public.work_opps (id, signal_id, title, scope, status, cost, currency, steward_id)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   'Community Workshop Build-out',
   'Flexible room conversion with equipment plan and orientation checklist',
   'proposed', 180000, 'KES', '00000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002',
   'AGI1 Bounded Research Task',
   'Implement or research note with verification evidence',
   'proposed', 95000, 'KES', '00000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003',
   'Turbine Intake Fabrication',
   'Fabrication plan, delivery evidence, inspection and safety record',
   'proposed', 340000, 'KES', '00000000-0000-0000-0000-000000000004');

-- ============================================================================
-- undertakings — 1 per scenario, status 'in_progress'
-- ============================================================================
insert into public.undertakings
  (id, institution_id, coordinator_id, title, scope, deliverables, status,
   agreed_cost, currency, started_at, created_by, updated_by)
values
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000005',
   'Kibera · Community Workshop Build-out',
   'Convert a shared room into a flexible workshop with a modular layout.',
   array['Layout plan', 'Equipment plan', 'Orientation checklist'], 'in_progress',
   180000, 'KES', now() - interval '30 days', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005'),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000005',
   'Kemetos · AGI1 Research Contribution',
   'Contribute a bounded research task with verification evidence.',
   array['Research note', 'Verification evidence', 'Contribution summary'], 'in_progress',
   95000, 'KES', now() - interval '14 days', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005'),
  ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000005',
   'Thiba · Turbine Intake Fabrication',
   'Fabricate and inspect an intake assembly against a defined scope.',
   array['Fabrication plan', 'Delivery evidence', 'Inspection record'], 'in_progress',
   340000, 'KES', now() - interval '7 days', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005');

-- ============================================================================
-- work_packages — 1 per scenario (anchor role, coordinator person)
-- ============================================================================
insert into public.work_packages
  (id, undertaking_id, role_type, person_id, capability_claims, compensation)
values
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001',
   'anchor', '00000000-0000-0000-0000-000000000005',
   array['workshop-planning', 'fabrication-coordination'],
   jsonb '{"amount": 60000, "currency": "KES", "type": "wage"}'),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002',
   'anchor', '00000000-0000-0000-0000-000000000005',
   array['software-research', 'technical-documentation'],
   jsonb '{"amount": 40000, "currency": "KES", "type": "wage"}'),
  ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003',
   'anchor', '00000000-0000-0000-0000-000000000005',
   array['fabrication', 'site-coordination'],
   jsonb '{"amount": 120000, "currency": "KES", "type": "wage"}');

-- ============================================================================
-- milestones — 1 per scenario
-- ============================================================================
insert into public.milestones (id, undertaking_id, title, description, due_date, evidence_ids, status)
values
  ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001',
   'Modular layout approved', 'Layout plan signed off by the institution.',
   now() + interval '21 days',
   array['80000000-0000-0000-0000-000000000001'::uuid], 'in_progress'),
  ('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002',
   'Research note verified', 'Verification evidence matches the brief.',
   now() + interval '14 days',
   array['80000000-0000-0000-0000-000000000002'::uuid], 'pending'),
  ('70000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003',
   'Intake assembly inspected', 'Inspection and safety record completed.',
   now() + interval '30 days',
   array['80000000-0000-0000-0000-0000-000000000003'::uuid], 'pending');

-- ============================================================================
-- work_evidence — 1 per scenario, file_urls []
-- ============================================================================
insert into public.work_evidence (id, undertaking_id, submitted_by, title, file_urls, milestone_id)
values
  ('80000000-0000-0000-0000-000000000001', '50000000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000005', 'Workshop layout draft',
   array[]::text[], '70000000-0000-0000-0000-000000000001'),
  ('80000000-0000-0000-0000-000000000002', '50000000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000005', 'Research note draft',
   array[]::text[], '70000000-0000-0000-0000-000000000002'),
  ('80000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000005', 'Fabrication plan draft',
   array[]::text[], '70000000-0000-0000-0000-000000000003');

-- ============================================================================
-- roll_entries — 1 per scenario; digital type for Kemetos, physical for the rest
-- ============================================================================
insert into public.roll_entries
  (id, undertaking_id, type, title, scope, deliverables,
   commissioned_by, participants, evidence, acceptance, maintenance_obligations,
   hash_anchor, version, recorded_by, recorded_at)
values
  ('90000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001',
   'physical',
   'Kibera · Community Workshop Build-out',
   'Convert a shared room into a flexible workshop with a modular layout.',
   array['Layout plan', 'Equipment plan', 'Orientation checklist'],
   jsonb '{"institution_id":"00000000-0000-0000-0000-000000000002","name":"Kibera Makerspace","coordinator_id":"00000000-0000-0000-0000-000000000005"}',
   jsonb array[
     jsonb '{"role_type":"anchor","person_id":"00000000-0000-0000-0000-000000000005","name":"Kembera Anchor","capability_claims":["workshop-planning"],"evidence_ids":["80000000-0000-0000-0000-000000000001"]}',
     jsonb '{"role_type":"builder","person_id":"00000000-0000-0000-0000-000000000005","name":"Kibera Builder","capability_claims":["assembly"],"evidence_ids":[]}'
   ],
   jsonb array[ jsonb '{"id":"80000000-0000-0000-0000-000000000001","layer":"public","title":"Layout draft","file_url":null,"description":"Modular layout plan"}' ],
   jsonb '{"accepted_by":"00000000-0000-0000-0000-000000000005","accepted_at":"2026-10-01T00:00:00Z","inspection_report_id":null,"cost_disclosed":{"amount":180000,"currency":"KES"}}',
   jsonb '{"maintenance":"quarterly-equipment-checks"}',
   'a3f5c9e1d7b8402f6c1e9a4d2b7f8c3e5d0a6b9f1c2e4d7a8b0f6e3c5a9d1b4f', 1,
   '00000000-0000-0000-0000-000000000005', now() - interval '20 days'),

  ('90000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002',
   'digital',
   'Kemetos · AGI1 Research Contribution',
   'Contribute a bounded research task with verification evidence.',
   array['Research note', 'Verification evidence', 'Contribution summary'],
   jsonb '{"institution_id":"00000000-0000-0000-0000-000000000003","name":"Kemetos AGI1","coordinator_id":"00000000-0000-0000-0000-000000000005"}',
   jsonb array[
     jsonb '{"role_type":"anchor","person_id":"00000000-0000-0000-0000-000000000005","name":"Kemetos Anchor","capability_claims":["research"],"evidence_ids":["80000000-0000-0000-0000-000000000002"]}',
     jsonb '{"role_type":"builder","person_id":"00000000-0000-0000-0000-000000000005","name":"AGI1 Builder","capability_claims":["software-development"],"evidence_ids":[]}'
   ],
   jsonb array[ jsonb '{"id":"80000000-0000-0000-0000-000000000002","layer":"participant","title":"Research note","file_url":null,"description":"Bounded research contribution"}' ],
   jsonb '{"accepted_by":"00000000-0000-0000-0000-000000000005","accepted_at":"2026-10-10T00:00:00Z","inspection_report_id":null,"cost_disclosed":{"amount":95000,"currency":"KES"}}',
   null,
   'b7d2e4f8a1c6593b8d0f7e2a4c9b6f1d3e8a5c2b7f4d0e9a1c6b8f3d2e5a4c7b', 1,
   '00000000-0000-0000-0000-000000000005', now() - interval '12 days'),

  ('90000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003',
   'physical',
   'Thiba · Turbine Intake Fabrication',
   'Fabricate and inspect an intake assembly against a defined scope.',
   array['Fabrication plan', 'Delivery evidence', 'Inspection record'],
   jsonb '{"institution_id":"00000000-0000-0000-0000-000000000004","name":"Thiba Hydro","coordinator_id":"00000000-0000-0000-000000000005"}',
   jsonb array[
     jsonb '{"role_type":"anchor","person_id":"00000000-0000-0000-0000-000000000005","name":"Thiba Anchor","capability_claims":["fabrication"],"evidence_ids":["80000000-0000-0000-0000-000000000003"]}',
     jsonb '{"role_type":"builder","person_id":"00000000-0000-0000-0000-000000000005","name":"Thiba Builder","capability_claims":["site-coordination"],"evidence_ids":[]}'
   ],
   jsonb array[ jsonb '{"id":"80000000-0000-0000-0000-000000000003","layer":"public","title":"Fabrication plan","file_url":null,"description":"Intake assembly plan"}' ],
   jsonb '{"accepted_by":"00000000-0000-0000-0000-000000000005","accepted_at":"2026-10-15T00:00:00Z","inspection_report_id":null,"cost_disclosed":{"amount":340000,"currency":"KES"}}',
   jsonb '{"maintenance":"annual-inspection"}',
   'c4e7a1d3f9b5628c0e4d7a2b6f1c9e8d5a3f7b0c4d2e9a6f1b8d3c5e7a0f4b9d', 1,
   '00000000-0000-0000-0000-000000000005', now() - interval '5 days');

-- ============================================================================
-- roll_revisions — 1 per scenario, chained from the entry hash_anchor
-- ============================================================================
insert into public.roll_revisions
  (id, entry_id, revised_by, previous_hash, new_hash, change_type, change_summary, revised_at)
values
  ('a0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'a3f5c9e1d7b8402f6c1e9a4d2b7f8c3e5d0a6b9f1c2e4d7a8b0f6e3c5a9d1b4f',
   'd8f2a4c6e1b3957d0a2e8f4c6b1d9e7a3f5c0d2b8e4a6f1c3d7b9e5a0f2c4d8b',
   'correction', 'Evidence layer corrected from restricted to public.', now() - interval '18 days'),
  ('a0000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'b7d2e4f8a1c6593b8d0f7e2a4c9b6f1d3e8a5c2b7f4d0e9a1c6b8f3d2e5a4c7b',
   'e1b4d7f2a9c8365e0b3d6f9a2c5e8b1d4f7a0c3e6b9d2f5a8c1d4e7b0f3a6c9d',
   'evidence_added', 'Verification evidence attached to research note.', now() - interval '10 days'),
  ('a0000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'c4e7a1d3f9b5628c0e4d7a2b6f1c9e8d5a3f7b0c4d2e9a6f1b8d3c5e7a0f4b9d',
   'f6c8a2e4b1d9753f0a5c7e9b2d4f6a8c1e3b5d7f0a2c4e6b8d1f3a5c7e9b0d2f',
   'restriction_change', 'Restricted-layer inspection notes marked participant-visible.', now() - interval '3 days');

-- ============================================================================
-- attestations — 1 per scenario, consent true, portable true, status active
-- ============================================================================
insert into public.attestations
  (id, subject, issuer, claim, scope, evidence, consent, status, portable, issued_at, expires_at, revocation_reason)
values
  ('b0000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002',
   'Delivered workshop build-out layout', 'Kibera workshop build-out',
   array['80000000-0000-0000-0000-000000000001'], true, 'active', true,
   now() - interval '19 days', now() + interval '365 days', null),
  ('b0000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003',
   'Contributed verified research note', 'Kemetos AGI1 research',
   array['80000000-0000-0000-0000-000000000002'], true, 'active', true,
   now() - interval '11 days', now() + interval '365 days', null),
  ('b0000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004',
   'Delivered turbine intake fabrication', 'Thiba Hydro fabrication',
   array['80000000-0000-0000-0000-000000000003'], true, 'active', true,
   now() - interval '4 days', now() + interval '365 days', null);

-- ============================================================================
-- instruments — 1 per scenario, lifecycle 'active' (research-only)
-- ============================================================================
insert into public.instruments
  (id, purpose, issuer, terms, lifecycle, participants, settlement_rules)
values
  ('c0000000-0000-0000-0000-000000000001',
   'Wage settlement for workshop build-out', '00000000-0000-0000-0000-000000000002',
   'Paid on milestone acceptance; KES; single settlement',
   'active', array['00000000-0000-0000-0000-000000000005'],
   'Settle 60% at layout acceptance, 40% at handover'),
  ('c0000000-0000-0000-0000-000000000002',
   'Research contribution settlement', '00000000-0000-0000-0000-000000000003',
   'Paid on note verification; KES',
   'active', array['00000000-0000-0000-0000-000000000005'],
   'Settle full amount on verification evidence accepted'),
  ('c0000000-0000-0000-0000-000000000003',
   'Fabrication delivery settlement', '00000000-0000-0000-0000-000000000004',
   'Paid on inspection pass; KES',
   'active', array['00000000-0000-0000-0000-000000000005'],
   'Settle on completed inspection and safety record');

-- ============================================================================
-- findings — 1 per scenario, status 'issued' (research-only)
-- ============================================================================
insert into public.findings
  (id, subject, scope, evidence_base, assessment, limitations, authorized_decision_maker, status, issued_at)
values
  ('d0000000-0000-0000-0000-000000000001',
   'Kibera Makerspace', 'Workshop build-out delivery',
   array['80000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'],
   'Delivery evidence and attestation are consistent; layout meets the brief.',
   array['Single-milestone assessment; no post-handover maintenance data'],
   '00000000-0000-0000-0000-000000000002', 'issued', now() - interval '18 days'),
  ('d0000000-0000-0000-0000-000000000002',
   'Kemetos AGI1', 'Research contribution delivery',
   array['80000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'],
   'Verification evidence matches the bounded task; contribution is portable.',
   array['Research-only; no production integration performed'],
   '00000000-0000-0000-0000-000000000003', 'issued', now() - interval '10 days'),
  ('d0000000-0000-0000-0000-000000000003',
   'Thiba Hydro', 'Turbine intake fabrication',
   array['80000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003'],
   'Fabrication plan and inspection record are complete; safety controls met.',
   array['Fabrication-only; no hydro performance measurement'],
   '00000000-0000-0000-0000-000000000004', 'issued', now() - interval '3 days');
