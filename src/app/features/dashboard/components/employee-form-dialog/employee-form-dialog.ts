import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Angular Material 
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-employee-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './employee-form-dialog.html',
  styleUrl: './employee-form-dialog.scss'
})
export class EmployeeFormDialogComponent {
  private fb = inject(FormBuilder);

  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();

  employeeForm: FormGroup = this.fb.group({
    legajoNumber: ['', [Validators.required, Validators.minLength(3)]],
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    dni: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    cuil: ['', Validators.required],
    position: ['', Validators.required],
    sector: ['', Validators.required],
    role: ['employee', Validators.required],
    // FORMATO DE FECHA DD/MM/YYYY
    joinDate: [new Date(), Validators.required]
  });

  // BOTÓN MÁGICO PARA DESARROLLO
  autocompletarDatos() {
    const randomId = Math.floor(Math.random() * 9000) + 1000;
    this.employeeForm.patchValue({
      legajoNumber: randomId.toString(),
      displayName: 'Micaela Gómez',
      email: `micaela.gomez${randomId}@kernelstudio.com`,
      dni: '38123456',
      cuil: '27-38123456-4',
      position: 'UX/UI Designer',
      sector: 'Design',
      role: 'employee',
      // formato de fecha: MM/DD/YYYY
      joinDate: new Date().toISOString().split('T')[0]
    });
  }

  cerrarFormModal() {
    // Simplemente avisamos al padre que queremos cerrar
    this.onCancel.emit();
  }

  guardar() {
    if (this.employeeForm.valid) {
      // Emitimos el valor del formulario al Dashboard
      this.onSave.emit(this.employeeForm.value);
    } else {
      // Marcamos errores visuales si falta algo
      this.employeeForm.markAllAsTouched();
    }
  }
}