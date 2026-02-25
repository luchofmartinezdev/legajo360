import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Angular Material
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-employee-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule 
  ],
  providers: [ provideNativeDateAdapter() ],
  templateUrl: './employee-form-dialog.html',
  styleUrl: './employee-form-dialog.scss'
})
export class EmployeeFormDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EmployeeFormDialogComponent>);

  employeeForm: FormGroup = this.fb.group({
    legajoNumber: ['', [Validators.required, Validators.minLength(3)]],
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    dni: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    cuil: ['', Validators.required],
    position: ['', Validators.required],
    sector: ['', Validators.required],
    role: ['employee', Validators.required],
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
      joinDate: new Date()
    });
  }

  guardar() {
    if (this.employeeForm.valid) {
      // Devolvemos el valor del form al dashboard para que lo guarde en Firebase
      this.dialogRef.close(this.employeeForm.value);
    } else {
      this.employeeForm.markAllAsTouched();
    }
  }
}