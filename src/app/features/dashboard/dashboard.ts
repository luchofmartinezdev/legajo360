import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, Subscription } from 'rxjs';

// Servicios y Modelos
import { EmployeeService } from '../../core/services/employee';
import { AuthService } from '../../core/services/auth';
import { Employee } from '../../shared/models/legajo';

// Componentes
import { EmployeeFormDialogComponent } from './components/employee-form-dialog/employee-form-dialog';
import { EmployeeProfileComponent } from "../employee-profile/employee-profile";
import { collection, collectionData, Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    EmployeeProfileComponent,
    EmployeeFormDialogComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})

export class DashboardComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);

  currentUser: any | null = null;
  allEmployees$: Observable<Employee[]> | undefined;
  filteredEmployees: Employee[] = [];
  searchControl = new FormControl('');

  selectedEmployee: Employee | null = null;
  isModalOpen = false;
  isFormModalOpen = false;

  ngOnInit() {
    this.allEmployees$ = this.employeeService.getActiveEmployees().pipe(
      map((employees: Employee[]) => this.filteredEmployees = employees)
    );
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      console.log("Usuario:", this.currentUser.displayName);
      console.log("Email:", this.currentUser.email);
      if (!user) return; 
      this.employeeService.getEmployeeByUid(user.uid).pipe(
        map((employee: Employee | null) => { 
          if (employee) {
            this.currentUser = employee;
          }
        })
      ).subscribe();
    });
  }

  get isAdminOrRRHH(): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.role === 'rrhh';
  }


  // Acciones de Modal
  verDetalle(employee: Employee) {
    this.selectedEmployee = employee;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.selectedEmployee = null;
    document.body.style.overflow = 'auto';
  }

  abrirNuevoIngreso() {
    this.isFormModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarFormModal() {
    this.isFormModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  async guardarNuevoEmpleado(formData: any) {
    try {
      const nuevo: Employee = {
        ...formData,
        uid: `user-${Date.now()}`,
        isActive: true,
        paystubs: [],
        joinDate: new Date(formData.joinDate + 'T00:00:00').toISOString()
      };
      await this.employeeService.upsertEmployee(nuevo);
      this.cerrarFormModal();
    } catch (e) {
      alert("Error al guardar");
    }
  }
}