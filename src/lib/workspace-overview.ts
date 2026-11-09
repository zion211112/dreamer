import { STUDIO_FLOW_MODULES, type StudioModuleId } from './studio-navigation';

export interface WorkspaceOverviewItem {
  moduleId: StudioModuleId;
  label: string;
  href: string;
  summary: string;
}

const moduleSummaries: Record<StudioModuleId, string> = {
  commons: 'Surface needs, offers, resources, opportunities, and problems for shared stewardship.',
  network: 'Understand people, crews, institutions, assets, capabilities, and relationships.',
  workbench: 'Scope, assemble, coordinate, and manage productive work.',
  records: 'Inspect structural records, event history, provenance, and supporting evidence.',
  intelligence: 'Explore the research surface; analytic tools are not connected in this workspace yet.',
};

export const WORKSPACE_OVERVIEW_ITEMS: readonly WorkspaceOverviewItem[] = STUDIO_FLOW_MODULES.map(module => ({
  moduleId: module.id,
  label: module.label,
  href: module.href,
  summary: moduleSummaries[module.id],
}));
