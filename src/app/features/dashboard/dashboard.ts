import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Servicios y Modelos
import { EmployeeService } from '../../core/services/employee';
import { AuthService } from '../../core/services/auth';
import { Employee } from '../../shared/models/legajo';

// Componentes
import { EmployeeDetailDialogComponent } from './components/employee-detail-dialog/employee-detail-dialog';

// RxJS
import { Observable, of, combineLatest } from 'rxjs';
import { filter, switchMap, map, tap, catchError, startWith, debounceTime, distinctUntilChanged, delay, shareReplay } from 'rxjs/operators';
import { EmployeeFormDialogComponent } from './components/employee-form-dialog/employee-form-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  // Inyecciones
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  // Observables y Controles
  employeeData$!: Observable<Employee | null>;
  allEmployees$!: Observable<Employee[]>;
  searchControl = new FormControl('');
  currentUid: string | null = null;

  ngOnInit() {
    console.log("🚀 Iniciando Dashboard de Legajo360");

    // 1. CARGA DEL PERFIL DEL USUARIO LOGUEADO
    this.employeeData$ = this.authService.user$.pipe(
      filter(user => !!user),
      tap(user => this.currentUid = user!.uid),
      switchMap(user => this.employeeService.getEmployeeByUid(user!.uid)),
      map(employee => {
        // Fallback: Si no hay datos en Firebase, usamos el mock de administrador
        if (!employee) {
          console.warn("⚠️ No se encontró el perfil en DB. Cargando Mock Admin.");
          return this.getMockEmployees().find(e => e.role === 'admin') || null;
        }
        return employee;
      }),
      tap(employee => {
        // 2. REGLA DE NEGOCIO: Solo cargamos la nómina si es Admin o RRHH
        if (employee && (employee.role === 'admin' || employee.role === 'rrhh')) {
          this.initPayrollStream();
        }
      }),
      shareReplay(1) // Evita múltiples llamadas a la DB si usamos el async pipe varias veces
    );
  }

  /**
   * Inicializa el flujo de la nómina y el buscador reactivo
   */
  private initPayrollStream() {
    // A. Flujo de datos desde Firebase (con delay para lucir el Skeleton)
    const rawEmployees$ = this.employeeService.getActiveEmployees().pipe(
      delay(800),
      map(emps => (emps && emps.length > 0) ? emps : this.getMockEmployees()),
      catchError(err => {
        console.error("❌ Error conectando a la base de datos:", err);
        return of(this.getMockEmployees());
      }),
      startWith([]) // Estado inicial para que combineLatest no se trabe
    );

    // B. Flujo del buscador (Input del usuario)
    const filter$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(350),      // Espera 350ms después de que el usuario deja de tipear
      distinctUntilChanged()  // Solo emite si el texto realmente cambió
    );

    // C. Combinación: Filtramos la nómina según lo que se escriba
    this.allEmployees$ = combineLatest([rawEmployees$, filter$]).pipe(
      map(([employees, searchTerm]) => {
        const term = searchTerm?.toLowerCase().trim() || '';

        // Si tiene menos de 3 caracteres, mostramos todos
        if (term.length < 3) return employees;

        // Si tiene 3 o más, filtramos por nombre o legajo
        return employees.filter(emp => 
          emp.displayName.toLowerCase().includes(term) || 
          emp.legajoNumber.includes(term)
        );
      })
    );
  }

  /**
   * Abre el modal con el detalle del empleado
   */
  verDetalle(employee: Employee) {
    this.dialog.open(EmployeeDetailDialogComponent, {
      width: '600px',
      data: employee,
      panelClass: 'custom-dialog-container',
      autoFocus: false
    });
  }

  /**
   * Realiza una baja lógica (soft delete) del empleado
   */
  async darDeBaja(employee: Employee) {
    const confirmar = confirm(`¿Estás seguro que querés dar de baja a ${employee.displayName}? \n(Perderá el acceso al sistema pero su historial se mantendrá)`);
    
    if (confirmar) {
      try {
        const empleadoInactivo: Employee = {
          ...employee,
          isActive: false
        };
        
        await this.employeeService.upsertEmployee(empleadoInactivo);
        console.log(`✅ Baja exitosa: ${employee.displayName}`);
        // No hace falta recargar, Firebase actualizará la grilla automáticamente
      } catch (error) {
        console.error(`❌ Error al dar de baja a ${employee.displayName}:`, error);
        alert('Hubo un error al procesar la baja. Por favor, reintentá.');
      }
    }
  }

  /**
   * Genera datos de prueba en caso de que la base de datos esté vacía
   */
  private getMockEmployees(): Employee[] {
    const names = ['Enzo', 'Julián', 'Alexis', 'Lionel', 'Rodrigo', 'Lautaro', 'Ángel', 'Nicolás', 'Cristian', 'Nahuel'];
    const lastnames = ['Fernández', 'Álvarez', 'Mac Allister', 'Messi', 'De Paul', 'Martínez', 'Di María', 'Otamendi', 'Romero', 'Molina'];
    const positions = ['Frontend Dev', 'Backend Dev', 'QA Engineer', 'UI/UX Designer', 'DevOps'];

    return names.map((name, i) => ({
      uid: i === 3 ? (this.currentUid || 'admin-id') : `mock-user-${i}`,
      legajoNumber: (1000 + i).toString(),
      // Aprovechamos para meterte a vos como el Admin principal en el mock (Kernel Studio)
      displayName: i === 3 ? 'Luciano (Kernel)' : `${name} ${lastnames[i]}`,
      email: i === 3 ? 'lucho@kernelstudio.com' : `${name.toLowerCase()}@kernelstudio.com`,
      dni: `3${i}456789`,
      cuil: `20-3${i}456789-2`,
      joinDate: '2024-05-10',
      position: i === 3 ? 'Tech Lead' : positions[i % positions.length],
      sector: 'Development',
      isActive: true,
      role: i === 3 ? 'admin' : 'employee',
      paystubs: i === 3 ? [
        { id: '1', period: 'Enero 2026', uploadDate: new Date(), fileUrl: '#', status: 'signed', amount: 1500000 }
      ] : []
    }));
  }

  abrirNuevoIngreso() {
  const dialogRef = this.dialog.open(EmployeeFormDialogComponent, {
    width: '700px',
    panelClass: 'custom-dialog-container',
    disableClose: true // Evita que se cierre haciendo click afuera accidentalmente
  });

  dialogRef.afterClosed().subscribe(async (formData) => {
    if (formData) {
      try {
        // En una app real, el UID lo genera Firebase Auth cuando creás el usuario.
        // Como estamos guardando directo en la base legajo360 para el MVP, inventamos uno:
        const nuevoEmpleado: Employee = {
          ...formData,
          uid: `user-${new Date().getTime()}`, 
          isActive: true,
          paystubs: [] // Arranca sin recibos
        };
        
        // Convertimos la fecha del datepicker a ISO string
        nuevoEmpleado.joinDate = formData.joinDate.toISOString();

        await this.employeeService.upsertEmployee(nuevoEmpleado);
        console.log("✅ Nuevo ingreso registrado en Kernel Studio");
        
      } catch (error) {
        console.error("❌ Error al guardar empleado", error);
        alert("Hubo un error al guardar los datos.");
      }
    }
  });
}
}