import { fireEvent, render, screen, within } from '@testing-library/react';

import { StudioInspector } from '@/components/studio/studio-inspector';
import { StudioRadar } from '@/components/studio/studio-radar';
import { StudioRelations } from '@/components/studio/studio-relations';
import { StudioSurface } from '@/components/studio/studio-surface';
import { deriveStudio } from '@/lib/workbench/derive';
import { recordKey, recordTitle, sourceStatusText } from '@/lib/workbench/types';
import {
  illustrativeAsset,
  makeDataset,
  openAsset,
} from './workbench-fixture';

// `next/cache` pulls in the server stream helpers, which need a Node
// `TextEncoder` that jsdom does not provide. The Studio surface only calls
// `revalidatePath` from a server action, so a stub is enough here.
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

jest.mock('next/dynamic', () => () => {
  return function MockDynamic() {
    return <div data-testid="mock-graph">graph</div>;
  };
});

function sourceItem(container: HTMLElement, label: string): HTMLElement {
  const items = Array.from(container.querySelectorAll<HTMLElement>('.studio-source-list > li'));
  const found = items.find(item => item.querySelector('strong')?.textContent === label);
  if (!found) throw new Error(`The radar has no source item labelled "${label}".`);
  return found;
}

describe('network studio components', () => {
  it('focus stays coherent across regions', () => {
    const dataset = makeDataset();
    const derivation = deriveStudio(dataset, recordKey('asset', openAsset.id));
    const onFocus = jest.fn();

    const { container } = render(
      <>
        <StudioRadar
          contextKey="crew:asset-open:builder"
          dataset={dataset}
          derivation={derivation}
          onFocus={onFocus}
          view="assets"
        />
        <StudioInspector dataset={dataset} derivation={derivation} onFocus={onFocus} />
      </>,
    );

    const focused = derivation.focusedRecord;
    if (!focused) throw new Error('The derivation must focus a record.');
    const expectedTitle = recordTitle(focused);

    const results = container.querySelector<HTMLElement>('.studio-results');
    if (!results) throw new Error('The radar must render its result list.');
    const activeRow = results.querySelector('button[aria-current="true"]');
    expect(activeRow).not.toBeNull();
    expect(activeRow?.textContent).toContain(expectedTitle);

    const inspectorHead = container.querySelector<HTMLElement>('.studio-inspector-head');
    if (!inspectorHead) throw new Error('The inspector must render its head.');
    const heading = within(inspectorHead).getByRole('heading', { name: expectedTitle });
    expect(heading).toBeInTheDocument();
    expect(activeRow?.textContent).toContain(heading.textContent ?? '');

    const otherRow = within(results).getByRole('button', { name: /School Console/ });
    fireEvent.click(otherRow);

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledWith(recordKey('asset', illustrativeAsset.id));
  });

  it('an empty source renders its own state', () => {
    const rolesError =
      'Open roles are published to the connected project. The local identity has none.';
    const dataset = makeDataset({
      sources: {
        roles: { status: 'unavailable', data: [], error: rolesError, label: 'Open roles' },
      },
    });

    const { container } = render(
      <StudioRadar
        contextKey="crew:asset-open:builder"
        dataset={dataset}
        derivation={deriveStudio(dataset, recordKey('asset', openAsset.id))}
        onFocus={jest.fn()}
        view="assets"
      />,
    );

    const roles = sourceItem(container, 'Open roles');
    expect(within(roles).getByText(sourceStatusText('unavailable'))).toBeInTheDocument();
    expect(screen.getByText(rolesError)).toBeInTheDocument();

    const errors = container.querySelectorAll('.studio-source-errors > li');
    expect(errors).toHaveLength(1);
    expect(errors[0].textContent).toBe(rolesError);

    const empty = sourceItem(container, 'Commons activity');
    expect(within(empty).getByText(sourceStatusText('empty'))).toBeInTheDocument();
    expect(within(empty).queryByText(sourceStatusText('unavailable'))).toBeNull();
    expect(within(empty).queryByText(sourceStatusText('error'))).toBeNull();
    expect(within(empty).queryByText(sourceStatusText('denied'))).toBeNull();
  });

  it('the list view exposes the same relations as the graph', () => {
    const dataset = makeDataset();
    const derivation = deriveStudio(dataset, recordKey('asset', openAsset.id));

    const { container } = render(
      <StudioRelations derivation={derivation} onFocus={jest.fn()} />,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'List' }));

    const items = container.querySelectorAll<HTMLElement>('.studio-relation-list > li');
    expect(items).toHaveLength(derivation.relations.links.length);

    derivation.relations.links.forEach((link, index) => {
      const item = items[index];
      expect(item.textContent).toContain(link.node.title);
      expect(item.textContent).toContain(link.edge.basis);
      expect(within(item).getByText(link.node.title)).toBeInTheDocument();
    });

    expect(screen.getByText(/commons_opportunities\.tender_id/)).toBeInTheDocument();
  });

  it('the local identity states why shared actions are blocked', () => {
    const dataset = makeDataset({ localMode: true });
    const derivation = deriveStudio(dataset, recordKey('asset', openAsset.id));

    render(<StudioSurface dataset={dataset} derivation={derivation} onFocus={jest.fn()} />);

    const blocked = screen.getAllByText(/local development identity/i);
    expect(blocked.length).toBeGreaterThan(0);
    expect(blocked[0].textContent).toMatch(/local development identity/i);
  });
});
