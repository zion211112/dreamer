import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const requireSession: CanActivateFn = async (_route, state: RouterStateSnapshot) => {
  const router = inject(Router);
  try {
    const result = await inject(AuthService).getSession();
    return result.data?.session
      ? true
      : router.createUrlTree(['/sign-in'], { queryParams: { redirect: state.url } });
  } catch {
    return router.createUrlTree(['/sign-in'], { queryParams: { unavailable: '1', redirect: state.url } });
  }
};
