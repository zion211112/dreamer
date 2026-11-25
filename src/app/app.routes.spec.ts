import { routes } from './app.routes';

describe('workspace route protection', () => {
  it('requires the authenticated session guard before loading the workspace shell', () => {
    const workspace = routes.find((route) => route.path === 'workspace');
    expect(workspace?.canActivate).toBeDefined();
    expect(workspace?.canActivate?.length).toBeGreaterThan(0);
  });
});
