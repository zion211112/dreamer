import type { PeopleView } from '../People';

interface PeopleViewTabsProps {
  activeView: PeopleView;
  setActiveView: (view: PeopleView) => void;
}

export function PeopleViewTabs({ activeView, setActiveView }: PeopleViewTabsProps) {
  const views: PeopleView[] = ['people', 'crews', 'network'];
  const labelFor = (view: PeopleView) => (view === 'people' ? 'People' : view === 'crews' ? 'Crews' : 'Network');

  return (
    <nav className="people-view-tabs" aria-label="People views" role="tablist">
      {views.map(view => (
        <button
          key={view}
          id={`people-tab-${view}`}
          type="button"
          role="tab"
          aria-selected={activeView === view}
          aria-controls={`people-panel-${view}`}
          tabIndex={activeView === view ? 0 : -1}
          className={activeView === view ? 'is-active' : ''}
          onClick={() => setActiveView(view)}
          onKeyDown={event => {
            const currentIndex = views.indexOf(view);
            const nextIndex =
              event.key === 'ArrowRight' ? (currentIndex + 1) % views.length
              : event.key === 'ArrowLeft' ? (currentIndex + views.length - 1) % views.length
                : event.key === 'Home' ? 0
                  : event.key === 'End' ? views.length - 1
                    : -1;
            if (nextIndex < 0) return;
            event.preventDefault();
            const nextView = views[nextIndex];
            setActiveView(nextView);
            document.getElementById(`people-tab-${nextView}`)?.focus();
          }}
        >
          {labelFor(view)}
        </button>
      ))}
    </nav>
  );
}
