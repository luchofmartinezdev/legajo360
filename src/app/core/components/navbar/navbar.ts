import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { EmployeeService } from '../../services/employee';
import { Employee } from '../../../shared/models/legajo';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private sub = new Subscription();

  // Guardamos el objeto completo del empleado
  currentUser: Employee | null = null;
  isMenuOpen = false;

  ngOnInit() {
    // Escuchamos el auth y buscamos el perfil en Firestore inmediatamente
    this.sub.add(
      this.authService.user$.pipe(
        filter(user => !!user),
        switchMap(user => this.employeeService.getEmployeeByUid(user!.uid))
      ).subscribe(employee => {
        this.currentUser = employee;
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // Getter para facilitar la lógica de roles en el HTML
  get isAdminOrRRHH(): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.role === 'rrhh';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.isMenuOpen = false;
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}