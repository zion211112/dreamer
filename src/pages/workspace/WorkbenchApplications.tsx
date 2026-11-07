import { PageHead } from '../../components/PageHead';
import { WorkspaceLayout } from './WorkspaceLayout';
import { WorkbenchOpportunityFlow } from './WorkbenchOpportunityFlow';

export type WorkbenchApplicationsView = 'opportunities' | 'review' | 'delivery';

const viewDetails: Record<WorkbenchApplicationsView, {
  context: 'workbench:applications' | 'workbench:review' | 'workbench:delivery';
  eyebrow: string;
  title: string;
  subtitle: string;
}> = {
  opportunities: {
    context: 'workbench:applications',
    eyebrow: 'WORKBENCH / OPPORTUNITIES',
    title: 'Opportunities',
    subtitle: 'Inspect scope and terms, then save an application locally. Nothing is sent to an institution.',
  },
  review: {
    context: 'workbench:review',
    eyebrow: 'WORKBENCH / LOCAL REVIEW',
    title: 'Review & authorize',
    subtitle: 'Record review decisions explicitly. Selection remains separate from local authorization.',
  },
  delivery: {
    context: 'workbench:delivery',
    eyebrow: 'WORKBENCH / DELIVERY',
    title: 'Track delivery',
    subtitle: 'Review submitted evidence and record acceptance or requested changes in this browser.',
  },
};

export function WorkbenchApplications({ view }: { view: WorkbenchApplicationsView }) {
  const details = viewDetails[view];

  return (
    <WorkspaceLayout currentContext={details.context}>
      <div className="workbench-applications-page">
        <PageHead eyebrow={details.eyebrow} title={details.title} subtitle={details.subtitle} />
        <WorkbenchOpportunityFlow
          phase={view === 'opportunities' ? undefined : view}
          view={view === 'opportunities' ? 'opportunities' : 'my-work'}
        />
      </div>
    </WorkspaceLayout>
  );
}
