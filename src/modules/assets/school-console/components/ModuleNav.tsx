// src/modules/assets/school-console/components/ModuleNav.tsx
// Compact module navigation rail: My Day, Auto-Marking, Tender Drafts.
// Role-aware: teacher sees My Day + Auto-Marking; principal sees Tender Drafts.
import {
  roleModules,
  type ConsoleRole,
  type ConsoleModule,
} from '../constants';

interface ModuleNavProps {
  role: ConsoleRole;
  activeModule: ConsoleModule;
  onSelect: (moduleId: ConsoleModule) => void;
}

export function ModuleNav({ role, activeModule, onSelect }: ModuleNavProps) {
  const visibleModules = roleModules[role];

  return (
    <>
      <p className="sc-rail-title">
        {role === 'teacher' ? 'Teacher tools' : 'School operations'}
      </p>
      <nav className="sc-nav-list" aria-label="Console tools">
        {visibleModules.map((module) => (
          <button
            className={`sc-nav-item${activeModule === module.id ? ' is-active' : ''}`}
            aria-current={activeModule === module.id ? 'page' : undefined}
            onClick={() => onSelect(module.id)}
            type="button"
          >
            <span>{module.label}</span>
          </button>
        ))}
      </nav>
      <p className="sc-rail-foot">
        Private workspace<br />
        <span style={{ fontSize: '0.625rem', opacity: 0.6 }}>Local to this browser</span>
      </p>
    </>
  );
}
