import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceDataService } from '@apt-labs/shared/state';
import { OverviewComponent } from './features/workspace/overview.component';
import { CommonsComponent } from './features/commons/commons.component';
import { NetworkComponent } from './features/network/network.component';
import { CapabilitiesComponent } from './features/network/capabilities.component';
import { PeopleComponent } from './features/network/people.component';
import { InstitutionsComponent } from './features/network/institutions.component';
import { RecordsComponent } from './features/records/records.component';
import { AnnalsComponent } from './features/records/annals.component';
import { RollComponent } from './features/records/roll.component';

const work = {
  id: 'work-1', organizationId: 'org-1', organizationName: 'Common Ground Cooperative', organizationStanding: 'provisional',
  title: 'Repair the community hall', scope: 'Roof repair and materials inventory.', status: 'open' as const, createdAt: '2026-11-25T10:00:00Z',
};
const member = { id: 'person-2', name: 'Amina Okafor', organizationId: 'org-1', organizationName: 'Common Ground Cooperative', role: 'member' };
const event = {
  id: 'event-1', organizationId: 'org-1', organizationName: 'Common Ground Cooperative', actorName: 'Amina Okafor',
  action: 'undertaking.created', subjectType: 'undertaking', subjectId: 'work-1', occurredAt: '2026-11-25T11:00:00Z',
};

function workspaceData() {
  return {
    organizationsState: signal([{ id: 'org-1', name: 'Common Ground Cooperative', standing: 'provisional', role: 'member' }]),
    undertakingsState: signal([work]),
    networkState: signal({ organizations: [{ id: 'org-1', name: 'Common Ground Cooperative', standing: 'provisional', role: 'member' }], members: [member] }),
    recordsState: signal({ undertakings: [work], events: [event] }),
    loading: signal(false),
    error: signal(''),
    refresh: vi.fn().mockResolvedValue(undefined),
    organizations: vi.fn(), undertakings: vi.fn(), network: vi.fn(), records: vi.fn(), get: vi.fn(),
    undertaking: vi.fn().mockReturnValue(new Promise(() => {})),
  } as unknown as WorkspaceDataService;
}

describe('shared workspace surfaces', () => {
  let data: WorkspaceDataService;
  beforeEach(async () => {
    data = workspaceData();
    await TestBed.configureTestingModule({
      imports: [OverviewComponent, CommonsComponent, NetworkComponent, CapabilitiesComponent, PeopleComponent, InstitutionsComponent, RecordsComponent, AnnalsComponent, RollComponent],
      providers: [provideRouter([]), { provide: WorkspaceDataService, useValue: data }],
    }).compileComponents();
  });
  afterEach(() => TestBed.resetTestingModule());

  it('renders Home from shared records without turning capability into a score', async () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Repair the community hall');
    expect(text).toContain('Common Ground Cooperative');
    expect(text).toContain('Capability is not a score');
    expect(data.refresh).toHaveBeenCalledOnce();
  });

  it('filters Commons results by the recorded scope', async () => {
    const fixture = TestBed.createComponent(CommonsComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#commons-search')!;
    input.value = 'inventory'; input.dispatchEvent(new Event('input')); fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Repair the community hall');
    input.value = 'unmatched'; input.dispatchEvent(new Event('input')); fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No open work matches');
  });

  it('shows a loading state in People instead of an empty Network result while records are pending', async () => {
    data.loading.set(true);
    data.networkState.set({ organizations: [], members: [] });
    expect(data.networkState().members).toHaveLength(0);
    const fixture = TestBed.createComponent(PeopleComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Loading authorized memberships');
    expect(text).not.toContain('No other active members are visible yet');
  });

  it('shows only connected organization members in People', async () => {
    const fixture = TestBed.createComponent(PeopleComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Amina Okafor');
    expect(text).toContain('Common Ground Cooperative');
    expect(text).toContain('member');
  });

  it('does not present the disconnected capability projection as shared records', () => {
    const fixture = TestBed.createComponent(CapabilitiesComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('not yet connected to shared network records');
    expect(text).toContain('No capability claims are shown here');
  });

  it('renders member and organization subviews from the same scoped records', async () => {
    const people = TestBed.createComponent(PeopleComponent);
    people.detectChanges(); await people.whenStable(); people.detectChanges();
    expect((people.nativeElement as HTMLElement).textContent).toContain('Amina Okafor');
    const organizations = TestBed.createComponent(InstitutionsComponent);
    organizations.detectChanges(); await organizations.whenStable(); organizations.detectChanges();
    expect((organizations.nativeElement as HTMLElement).textContent).toContain('Common Ground Cooperative');
    expect((organizations.nativeElement as HTMLElement).textContent).toContain('provisional');
  });

  it('keeps Records as a lens shell and states its record limits once', async () => {
    const fixture = TestBed.createComponent(RecordsComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Canon');
    expect(text).toContain('Annals');
    expect(text).toContain('Roll');
    expect(text).toContain('It does not verify that work was done or that an outcome was achieved');
  });

  it('shows Annals as a dated account of recorded actions', async () => {
    const fixture = TestBed.createComponent(AnnalsComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Recorded events');
    expect(text).toContain('Amina Okafor');
    expect(text).toContain('Undertaking created');
  });

  it('loads a Roll chain only when its undertaking is opened', async () => {
    const undertaking = vi.spyOn(data, 'undertaking');
    const fixture = TestBed.createComponent(RollComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(undertaking).not.toHaveBeenCalled();
    const details = (fixture.nativeElement as HTMLElement).querySelector('details')!;
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    expect(undertaking).toHaveBeenCalledWith('work-1');
  });
});
