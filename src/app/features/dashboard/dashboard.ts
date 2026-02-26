import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';


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
import { EmployeeProfileComponent } from "../employee-profile/employee-profile";

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
  // Inyecciones
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);

  // Observables y Controles
  employeeData$!: Observable<Employee | null>;
  allEmployees$!: Observable<Employee[]>;
  searchControl = new FormControl('');
  currentUid: string | null = null;

  activeTab: 'nomina' | 'perfil' = 'nomina';
  selectedEmployee: Employee | null = null;
  isModalOpen = false;
  isFormModalOpen = false;

  setTab(tab: 'nomina' | 'perfil') {
    this.activeTab = tab;
  }

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

  verDetalle(employee: Employee) {
    this.selectedEmployee = employee;
    this.isModalOpen = true;
    // Bloqueamos el scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.selectedEmployee = null;
    document.body.style.overflow = 'auto';
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
    this.isFormModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarFormModal() {
    this.isFormModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  // Este método lo llamará el componente de formulario (o el HTML) al emitir los datos
  async guardarNuevoEmpleado(formData: any) {
    if (!formData) return;

    try {
      const nuevoEmpleado: Employee = {
        ...formData,
        uid: `user-${new Date().getTime()}`,
        isActive: true,
        paystubs: [],
        // Manejo de fecha compatible con el input nativo type="date"
        joinDate: new Date(formData.joinDate + 'T00:00:00').toISOString()
      };

      await this.employeeService.upsertEmployee(nuevoEmpleado);
      console.log("✅ Nuevo ingreso registrado en Kernel Studio");
      this.cerrarFormModal();

    } catch (error) {
      console.error("❌ Error al guardar empleado", error);
      alert("Hubo un error al guardar los datos.");
    }
  }
}