import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';
import { Workspace } from './workspace';
import { LandingPage, SignInPage, SignUpPage } from './auth-pages';
import { AuthProvider, RequireSession } from './session';
import { AppShell } from './shell';
import { NotFoundPage } from './shared';
import './styles.css';

function ProtectedApp() {
  return <RequireSession><AppShell><Workspace /></AppShell></RequireSession>;
}

function App() {
  return <AuthProvider><LocationProvider><Router>
    <Route path="/" component={LandingPage} />
    <Route path="/landing" component={LandingPage} />
    <Route path="/sign-in" component={SignInPage} />
    <Route path="/sign-up" component={SignUpPage} />
    <Route path="/workspace" component={ProtectedApp} />
    <Route path="/workspace/*" component={ProtectedApp} />
    <Route default component={NotFoundPage} />
  </Router></LocationProvider></AuthProvider>;
}

render(<App />, document.getElementById('app')!);
