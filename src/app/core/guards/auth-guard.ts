import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router'; 
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedDomain = 'gmail.com'; // Puedes cambiarlo por el dominio que desees, por ejemplo 'kernelstudio.com';

  return authService.user$.pipe(
    take(1), // Tomamos la última emisión y cerramos la suscripción
    map(user => {
      // 1. Verificar si está logueado
      const isLogged = !!user;
      
      // 2. Verificar si el dominio es el corporativo
      const isCorporateEmail = user?.email?.endsWith(`@${allowedDomain}`);

      if (isLogged && isCorporateEmail) {
        return true; // Acceso permitido
      }

      // Si falla cualquiera, redirigimos al login
      console.warn('Acceso denegado: Usuario no autenticado o dominio inválido.');
      router.navigate(['/login']);
      return false;
    })
  );
};