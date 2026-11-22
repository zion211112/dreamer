/**
 * APT-LABS — Extensibility Layer (Stage 4 — Ecosystem)
 *
 * Stable APIs, schemas, events, integration contracts, partner application
 * framework, sector templates, credential issuer network, integration
 * marketplace, and developer ecosystem.
 */

import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IntegrationStatus = 'draft' | 'active' | 'deprecated' | 'retired';
export type IntegrationType = 'api' | 'webhook' | 'event' | 'schema' | 'connector' | 'marketplace';
export type EventType =
  | 'entity.created' | 'entity.updated' | 'entity.deleted'
  | 'commitment.created' | 'commitment.accepted' | 'commitment.fulfilled' | 'commitment.revoked'
  | 'evidence.created' | 'evidence.verified' | 'evidence.disputed'
  | 'credential.issued' | 'credential.revoked' | 'credential.verified'
  | 'asset.registered' | 'asset.updated' | 'capacity.booked' | 'capacity.utilized'
  | 'opportunity.created' | 'opportunity.matched' | 'opportunity.closed'
  | 'lesson.created' | 'lesson.updated' | 'financing.opportunity.created' | 'financing.opportunity.settled';

export interface IntegrationSpec {
  id: string;
  name: string;
  description: string;
  type: IntegrationType;
  version: string;
  status: IntegrationStatus;
  schemaUrl?: string;           // OpenAPI/JSON Schema URL
  endpointUrl?: string;         // Webhook/API endpoint
  events: EventType[];          // Events this integration subscribes to
  authConfig: IntegrationAuth;  // Auth configuration
  rateLimits: RateLimitConfig;  // Rate limiting
  capabilities: string[];       // Capabilities provided
  documentationUrl?: string;
  supportContact?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface IntegrationAuth {
  type: 'none' | 'api-key' | 'oauth2' | 'jwt' | 'mTLS';
  config: Record<string, unknown>; // Opaque config
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export interface IntegrationInstance {
  id: string;
  specId: string;
  instanceName: string;
  organizationId: string;
  actorId: string;
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  config: Record<string, unknown>; // Instance-specific config
  subscribedEvents: EventType[];
  webhookUrl?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface IntegrationEvent {
  id: string;
  type: EventType;
  source: string;           // Service/module that emitted
  actorId?: string;
  organizationId?: string;
  payload: Record<string, unknown>;
  timestamp: string;
  correlationId?: string;   // For tracing
}

export interface SectorTemplate {
  id: string;
  name: string;
  description: string;
  sector: string;           // e.g., 'agriculture', 'healthcare', 'education', 'infrastructure'
  country?: string;         // Country-specific if applicable
  ontologyMappings: Record<string, string>; // Sector term -> APT ontology term
  entityTemplates: Record<string, any>;     // Pre-defined entity structures
  workflowTemplates: Record<string, any>;   // Pre-defined workflow/commitment templates
  credentialTypes: string[];  // Relevant credential families
  createdAt: string;
  createdBy: string;
  version: string;
}

export interface MarketplaceListing {
  id: string;
  name: string;
  description: string;
  type: 'connector' | 'template' | 'integration' | 'service';
  provider: string;
  providerContact: string;
  version: string;
  compatibility: string[];    // Compatible APT-LABS versions
  price?: number;             // In KES or credits
  priceCurrency?: string;
  documentationUrl: string;
  supportUrl?: string;
  status: 'draft' | 'published' | 'archived';
  downloads: number;
  rating?: number;            // 0-5
  reviewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationMetric {
  id: string;
  integrationId: string;
  timestamp: string;
  metricType: 'calls' | 'errors' | 'latency' | 'events';
  value: number;
  unit: string;
}

export interface IntegrationMetric {
  id: string;
  integrationId: string;
  timestamp: string;
  metricType: 'calls' | 'errors' | 'latency' | 'events';
  value: number;
  unit: string;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const INTEGRATION_SPECS_KEY = 'aptlabs:integration-specs';
const INTEGRATION_INSTANCES_KEY = 'aptlabs:integration-instances';
const INTEGRATION_EVENTS_KEY = 'aptlabs:integration-events';
const SECTOR_TEMPLATES_KEY = 'aptlabs:sector-templates';
const MARKETPLACE_LISTINGS_KEY = 'aptlabs:marketplace-listings';
const INTEGRATION_METRICS_KEY = 'aptlabs:integration-metrics';

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function readIntegrationSpecs(): IntegrationSpec[] {
  return readJson<IntegrationSpec[]>(INTEGRATION_SPECS_KEY, []);
}

function writeIntegrationSpecs(specs: IntegrationSpec[]): void {
  writeJson(INTEGRATION_SPECS_KEY, specs);
}

function readIntegrationInstances(): IntegrationInstance[] {
  return readJson<IntegrationInstance[]>(INTEGRATION_INSTANCES_KEY, []);
}

function writeIntegrationInstances(instances: IntegrationInstance[]): void {
  writeJson(INTEGRATION_INSTANCES_KEY, instances);
}

function readIntegrationEvents(): IntegrationEvent[] {
  return readJson<IntegrationEvent[]>(INTEGRATION_EVENTS_KEY, []);
}

function writeIntegrationEvents(events: IntegrationEvent[]): void {
  writeJson(INTEGRATION_EVENTS_KEY, events);
}

function readSectorTemplates(): SectorTemplate[] {
  return readJson<SectorTemplate[]>(SECTOR_TEMPLATES_KEY, []);
}

function writeSectorTemplates(templates: SectorTemplate[]): void {
  writeJson(SECTOR_TEMPLATES_KEY, templates);
}

function readMarketplaceListings(): MarketplaceListing[] {
  return readJson<MarketplaceListing[]>(MARKETPLACE_LISTINGS_KEY, []);
}

function writeMarketplaceListings(listings: MarketplaceListing[]): void {
  writeJson(MARKETPLACE_LISTINGS_KEY, listings);
}

function readIntegrationMetrics(): IntegrationMetric[] {
  return readJson<IntegrationMetric[]>(INTEGRATION_METRICS_KEY, []);
}

function writeIntegrationMetrics(metrics: IntegrationMetric[]): void {
  writeJson(INTEGRATION_METRICS_KEY, metrics);
}

// ---------------------------------------------------------------------------
// Integration Spec Registry
// ---------------------------------------------------------------------------

export interface RegisterIntegrationSpecInput {
  name: string;
  description: string;
  type: IntegrationType;
  version: string;
  schemaUrl?: string;
  endpointUrl?: string;
  events: EventType[];
  authConfig: IntegrationAuth;
  rateLimits: RateLimitConfig;
  capabilities: string[];
  documentationUrl?: string;
  supportContact?: string;
  createdBy: string;
  authz?: AuthzContext;
}

export function registerIntegrationSpec(input: RegisterIntegrationSpecInput): IntegrationSpec {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const spec: IntegrationSpec = {
    id: createId('spec'),
    name: input.name,
    description: input.description,
    type: input.type,
    version: input.version,
    status: 'draft',
    schemaUrl: input.schemaUrl,
    endpointUrl: input.endpointUrl,
    events: input.events,
    authConfig: input.authConfig,
    rateLimits: input.rateLimits,
    capabilities: input.capabilities,
    documentationUrl: input.documentationUrl,
    supportContact: input.supportContact,
    createdAt: nowIso(),
    createdBy: input.createdBy,
    updatedAt: nowIso(),
    updatedBy: input.createdBy,
  };

  const specs = readIntegrationSpecs();
  specs.push(spec);
  writeIntegrationSpecs(specs);

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.createdBy,
    action: 'record.create',
    resourceType: 'integration-spec',
    resourceId: spec.id,
    details: { name: input.name, type: input.type },
  });

  return spec;
}

export function getIntegrationSpec(specId: string): IntegrationSpec | undefined {
  return readIntegrationSpecs().find((s) => s.id === specId);
}

export function listIntegrationSpecs(filter?: {
  type?: IntegrationType;
  status?: IntegrationStatus;
}): IntegrationSpec[] {
  return readIntegrationSpecs().filter((s) => {
    if (filter?.type && s.type !== filter.type) return false;
    if (filter?.status && s.status !== filter.status) return false;
    return true;
  });
}

export interface UpdateIntegrationSpecInput {
  specId: string;
  name?: string;
  description?: string;
  type?: IntegrationType;
  version?: string;
  schemaUrl?: string;
  endpointUrl?: string;
  events?: EventType[];
  authConfig?: IntegrationAuth;
  rateLimits?: RateLimitConfig;
  capabilities?: string[];
  documentationUrl?: string;
  supportContact?: string;
  status?: IntegrationStatus;
  updatedBy: string;
  authz?: AuthzContext;
}

export function updateIntegrationSpec(input: UpdateIntegrationSpecInput): IntegrationSpec | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const specs = readIntegrationSpecs();
  const idx = specs.findIndex((s) => s.id === input.specId);
  if (idx === -1) return undefined;

  const spec = specs[idx];
  specs[idx] = {
    ...spec,
    name: input.name ?? spec.name,
    description: input.description ?? spec.description,
    type: input.type ?? spec.type,
    version: input.version ?? spec.version,
    schemaUrl: input.schemaUrl ?? spec.schemaUrl,
    endpointUrl: input.endpointUrl ?? spec.endpointUrl,
    events: input.events ?? spec.events,
    authConfig: input.authConfig ?? spec.authConfig,
    rateLimits: input.rateLimits ?? spec.rateLimits,
    capabilities: input.capabilities ?? spec.capabilities,
    documentationUrl: input.documentationUrl ?? spec.documentationUrl,
    supportContact: input.supportContact ?? spec.supportContact,
    status: input.status ?? spec.status,
    updatedAt: nowIso(),
    updatedBy: input.updatedBy,
  };
  writeIntegrationSpecs(specs);

  logAuditEvent({
    accountId: input.updatedBy,
    actorId: input.updatedBy,
    action: 'record.update',
    resourceType: 'integration-spec',
    resourceId: input.specId,
    details: { changes: Object.keys(input).filter((k) => k !== 'specId' && k !== 'updatedBy' && k !== 'authz') },
  });

  return specs[idx];
}

// ---------------------------------------------------------------------------
// Integration Instance Management
// ---------------------------------------------------------------------------

export interface CreateIntegrationInstanceInput {
  specId: string;
  instanceName: string;
  organizationId: string;
  actorId: string;
  config: Record<string, unknown>;
  subscribedEvents: EventType[];
  webhookUrl?: string;
  createdBy: string;
  authz?: AuthzContext;
}

export function createIntegrationInstance(input: CreateIntegrationInstanceInput): IntegrationInstance {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const spec = getIntegrationSpec(input.specId);
  if (!spec) throw new Error(`Integration spec ${input.specId} not found`);

  const instance: IntegrationInstance = {
    id: createId('inst'),
    specId: input.specId,
    instanceName: input.instanceName,
    organizationId: input.organizationId,
    actorId: input.actorId,
    status: 'pending',
    config: input.config,
    subscribedEvents: input.subscribedEvents,
    webhookUrl: input.webhookUrl,
    createdAt: nowIso(),
    createdBy: input.createdBy,
    updatedAt: nowIso(),
    updatedBy: input.createdBy,
  };

  const instances = readIntegrationInstances();
  instances.push(instance);
  writeIntegrationInstances(instances);

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.actorId,
    action: 'record.create',
    resourceType: 'integration-instance',
    resourceId: instance.id,
    details: { specId: input.specId, instanceName: input.instanceName },
  });

  return instance;
}

export function getIntegrationInstance(instanceId: string): IntegrationInstance | undefined {
  return readIntegrationInstances().find((i) => i.id === instanceId);
}

export function listIntegrationInstances(filter?: {
  specId?: string;
  organizationId?: string;
  actorId?: string;
  status?: IntegrationInstance['status'];
}): IntegrationInstance[] {
  return readIntegrationInstances().filter((i) => {
    if (filter?.specId && i.specId !== filter.specId) return false;
    if (filter?.organizationId && i.organizationId !== filter.organizationId) return false;
    if (filter?.actorId && i.actorId !== filter.actorId) return false;
    if (filter?.status && i.status !== filter.status) return false;
    return true;
  });
}

export interface UpdateIntegrationInstanceInput {
  instanceId: string;
  instanceName?: string;
  config?: Record<string, unknown>;
  subscribedEvents?: EventType[];
  webhookUrl?: string;
  status?: IntegrationInstance['status'];
  updatedBy: string;
  authz?: AuthzContext;
}

export function updateIntegrationInstance(input: UpdateIntegrationInstanceInput): IntegrationInstance | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const instances = readIntegrationInstances();
  const idx = instances.findIndex((i) => i.id === input.instanceId);
  if (idx === -1) return undefined;

  const instance = instances[idx];
  instances[idx] = {
    ...instance,
    instanceName: input.instanceName ?? instance.instanceName,
    config: input.config ?? instance.config,
    subscribedEvents: input.subscribedEvents ?? instance.subscribedEvents,
    webhookUrl: input.webhookUrl ?? instance.webhookUrl,
    status: input.status ?? instance.status,
    updatedAt: nowIso(),
    updatedBy: input.updatedBy,
  };
  writeIntegrationInstances(instances);

  logAuditEvent({
    accountId: input.updatedBy,
    actorId: input.updatedBy,
    action: 'record.update',
    resourceType: 'integration-instance',
    resourceId: input.instanceId,
    details: { changes: Object.keys(input).filter((k) => k !== 'instanceId' && k !== 'updatedBy' && k !== 'authz') },
  });

  return instances[idx];
}

// ---------------------------------------------------------------------------
// Event Emission
// ---------------------------------------------------------------------------

export interface EmitIntegrationEventInput {
  type: EventType;
  actorId?: string;
  organizationId?: string;
  payload: Record<string, unknown>;
  correlationId?: string;
  emittedBy: string;
  authz?: AuthzContext;
}

export function emitIntegrationEvent(input: EmitIntegrationEventInput): IntegrationEvent {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const event: IntegrationEvent = {
    id: createId('event'),
    type: input.type,
    source: input.emittedBy,
    actorId: input.actorId,
    organizationId: input.organizationId,
    payload: input.payload,
    timestamp: nowIso(),
    correlationId: input.correlationId,
  };

  const events = readIntegrationEvents();
  events.push(event);
  writeIntegrationEvents(events);

  // Deliver to subscribed instances
  const instances = readIntegrationInstances();
  for (const instance of instances) {
    if (instance.status === 'active' && instance.subscribedEvents.includes(input.type)) {
      logAuditEvent({
        accountId: input.emittedBy,
        actorId: input.emittedBy,
        action: 'record.create',
        resourceType: 'integration-event-delivery',
        resourceId: event.id,
        details: { instanceId: instance.id, eventType: input.type },
      });
    }
  }

  return event;
}

export function getIntegrationEvents(filter?: {
  type?: EventType;
  source?: string;
  actorId?: string;
  organizationId?: string;
  correlationId?: string;
  limit?: number;
}): IntegrationEvent[] {
  return readIntegrationEvents().filter((e) => {
    if (filter?.type && e.type !== filter.type) return false;
    if (filter?.source && e.source !== filter.source) return false;
    if (filter?.actorId && e.actorId !== filter.actorId) return false;
    if (filter?.organizationId && e.organizationId !== filter.organizationId) return false;
    if (filter?.correlationId && e.correlationId !== filter.correlationId) return false;
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, filter?.limit ?? 50);
}

// ---------------------------------------------------------------------------
// Sector Templates
// ---------------------------------------------------------------------------

export interface CreateSectorTemplateInput {
  name: string;
  description: string;
  sector: string;
  country?: string;
  ontologyMappings: Record<string, string>;
  entityTemplates: Record<string, any>;
  workflowTemplates: Record<string, any>;
  credentialTypes: string[];
  createdBy: string;
  authz?: AuthzContext;
}

export function createSectorTemplate(input: CreateSectorTemplateInput): SectorTemplate {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const template: SectorTemplate = {
    id: createId('template'),
    name: input.name,
    description: input.description,
    sector: input.sector,
    country: input.country,
    ontologyMappings: input.ontologyMappings,
    entityTemplates: input.entityTemplates,
    workflowTemplates: input.workflowTemplates,
    credentialTypes: input.credentialTypes,
    createdAt: nowIso(),
    createdBy: input.createdBy,
    version: '1.0.0',
  };

  const templates = readSectorTemplates();
  templates.push(template);
  writeSectorTemplates(templates);

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.createdBy,
    action: 'record.create',
    resourceType: 'sector-template',
    resourceId: template.id,
    details: { name: input.name, sector: input.sector },
  });

  return template;
}

export function getSectorTemplate(templateId: string): SectorTemplate | undefined {
  return readSectorTemplates().find((t) => t.id === templateId);
}

export function listSectorTemplates(filter?: {
  sector?: string;
  country?: string;
}): SectorTemplate[] {
  return readSectorTemplates().filter((t) => {
    if (filter?.sector && t.sector !== filter.sector) return false;
    if (filter?.country && t.country !== filter.country) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Marketplace Listings
// ---------------------------------------------------------------------------

export interface CreateMarketplaceListingInput {
  name: string;
  description: string;
  type: MarketplaceListing['type'];
  provider: string;
  providerContact: string;
  version: string;
  compatibility: string[];
  price?: number;
  priceCurrency?: string;
  documentationUrl: string;
  supportUrl?: string;
  tags?: string[];
  createdBy: string;
  authz?: AuthzContext;
}

export function createMarketplaceListing(input: CreateMarketplaceListingInput): MarketplaceListing {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const listing: MarketplaceListing = {
    id: createId('listing'),
    name: input.name,
    description: input.description,
    type: input.type,
    provider: input.provider,
    providerContact: input.providerContact,
    version: input.version,
    compatibility: input.compatibility,
    price: input.price,
    priceCurrency: input.priceCurrency,
    documentationUrl: input.documentationUrl,
    supportUrl: input.supportUrl,
    status: 'draft',
    downloads: 0,
    rating: undefined,
    reviewCount: 0,
    tags: input.tags ?? [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const listings = readMarketplaceListings();
  listings.push(listing);
  writeMarketplaceListings(listings);

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.createdBy,
    action: 'record.create',
    resourceType: 'marketplace-listing',
    resourceId: listing.id,
    details: { name: input.name, type: input.type },
  });

  return listing;
}

export function getMarketplaceListing(listingId: string): MarketplaceListing | undefined {
  return readMarketplaceListings().find((l) => l.id === listingId);
}

export function listMarketplaceListings(filter?: {
  type?: MarketplaceListing['type'];
  status?: MarketplaceListing['status'];
  provider?: string;
}): MarketplaceListing[] {
  return readMarketplaceListings().filter((l) => {
    if (filter?.type && l.type !== filter.type) return false;
    if (filter?.status && l.status !== filter.status) return false;
    if (filter?.provider && l.provider !== filter.provider) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Integration Metrics
// ---------------------------------------------------------------------------

export interface RecordIntegrationMetricInput {
  integrationId: string;
  metricType: IntegrationMetric['metricType'];
  value: number;
  unit: string;
  recordedBy: string;
  authz?: AuthzContext;
}

export function recordIntegrationMetric(input: RecordIntegrationMetricInput): IntegrationMetric {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const metric: IntegrationMetric = {
    id: createId('metric'),
    integrationId: input.integrationId,
    timestamp: nowIso(),
    metricType: input.metricType,
    value: input.value,
    unit: input.unit,
  };

  const metrics = readIntegrationMetrics();
  metrics.push(metric);
  writeIntegrationMetrics(metrics);

  return metric;
}

export function getIntegrationMetrics(filter?: {
  integrationId?: string;
  metricType?: IntegrationMetric['metricType'];
  periodFrom?: string;
  periodTo?: string;
}): IntegrationMetric[] {
  return readIntegrationMetrics().filter((m) => {
    if (filter?.integrationId && m.integrationId !== filter.integrationId) return false;
    if (filter?.metricType && m.metricType !== filter.metricType) return false;
    if (filter?.periodFrom && m.timestamp < filter.periodFrom) return false;
    if (filter?.periodTo && m.timestamp > filter.periodTo) return false;
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ---------------------------------------------------------------------------
// Integration Health Check
// ---------------------------------------------------------------------------

export interface IntegrationHealth {
  integrationId: string;
  instanceId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  metrics: {
    totalEvents: number;
    totalErrors: number;
    avgLatencyMs: number;
  };
}

export function getIntegrationHealth(instanceId: string): IntegrationHealth | undefined {
  const instance = getIntegrationInstance(instanceId);
  if (!instance) return undefined;

  const metrics = readIntegrationMetrics().filter((m) => m.integrationId === instance.specId);
  const totalEvents = metrics.filter((m) => m.metricType === 'calls').reduce((sum, m) => sum + m.value, 0);
  const totalErrors = metrics.filter((m) => m.metricType === 'errors').reduce((sum, m) => sum + m.value, 0);
  const latencyMetrics = metrics.filter((m) => m.metricType === 'latency');
  const avgLatencyMs = latencyMetrics.length > 0
    ? latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length
    : 0;

  const status: IntegrationHealth['status'] = totalErrors > totalEvents * 0.1 ? 'unhealthy' :
    totalErrors > totalEvents * 0.05 ? 'degraded' : 'healthy';

  return {
    integrationId: instance.specId,
    instanceId,
    status,
    lastCheck: nowIso(),
    metrics: {
      totalEvents,
      totalErrors,
      avgLatencyMs,
    },
  };
}
