import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom, of } from 'rxjs';

export const isAdminGuard: CanMatchFn = async (route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await firstValueFrom(authService.checkStatus());

  const isAdmin = authService.isAdmin();

  if (!isAdmin) {
    router.navigateByUrl('/');
    return false;
  }

  return true;
};
