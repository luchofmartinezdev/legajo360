import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { EmployeeService } from '../services/employee';
import { switchMap, map, of, take } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const employeeService = inject(EmployeeService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    switchMap(user => {
      if (!user) return of(null);
      // Buscamos el legajo en Firestore para ver el rol
      return employeeService.getEmployeeByUid(user.uid);
    }),
    map(employee => {
      
      if (employee && employee.role === 'admin' ) {
        return true; // Es admin de Kernel Studio, puede pasar
      }

      console.error('Acceso denegado: Se requiere rol de Administrador');
      router.navigate(['/dashboard']); // Si no es admin, lo mandamos al dashboard
      return false;
    })
  );
};