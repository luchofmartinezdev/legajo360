import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EmployeeService } from '../../../core/services/employee';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, 
    MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './employee-management.html'
})
export class EmployeeManagementComponent {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);

  employeeForm = this.fb.group({
    uid: ['', Validators.required], // El UID lo sacás de la consola de Firebase Auth
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    dni: ['', Validators.required],
    cuil: ['', Validators.required],
    healthInsurance: ['OSDE 210', Validators.required],
    startDate: [new Date(), Validators.required],
    position: ['Desarrollador Flutter', Validators.required],
    department: ['IT', Validators.required]
  });

  // async saveEmployee() {
  //   if (this.employeeForm.valid) {
  //     const formValue = this.employeeForm.value;
  //     const newEmployee: any = {
  //       ...formValue,
  //       startDate: Timestamp.fromDate(formValue.startDate as Date),
  //       isActive: true,
  //       isFilesComplete: false,
  //       role: 'employee'
  //     };

  //     try {
  //       await this.employeeService.upsertEmployee(newEmployee);
  //       alert('Empleado creado con éxito en Legajo360');
  //       this.employeeForm.reset();
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   }
  // }
}