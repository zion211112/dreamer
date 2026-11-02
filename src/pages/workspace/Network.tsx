import { WorkspaceLayout } from './WorkspaceLayout';
import { CapabilityDirectory } from '../../components/CapabilityDirectory';

export function Network() {
  return (
    <WorkspaceLayout currentContext="institutions">
      <main className="net-page">
        <header className="net-page-header">
          <div className="net-page-heading">
            <p className="net-page-eyebrow">APT—LABS <span aria-hidden="true">/</span> NETWORK</p>
            <h1>Capability Directory</h1>
            <p className="net-page-intro">
              Find people by what they can prove they do. Every capability is tied to evidence —
              work samples, credentials, or counterparty confirmation — so you can compose teams
              from verified substance, not self-declared tags.
            </p>
          </div>
        </header>

        <CapabilityDirectory />
      </main>
    </WorkspaceLayout>
  );
}