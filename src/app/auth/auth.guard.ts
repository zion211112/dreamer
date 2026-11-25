import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const requireSession: CanActivateFn = async () => {
  const router = inject(Router);
  try {
    const result = await inject(AuthService).getSession();
    return result.data?.session ? true : router.createUrlTree(['/sign-in']);
  } catch {
    return router.createUrlTree(['/sign-in'], { queryParams: { unavailable: '1' } });
  }
};
