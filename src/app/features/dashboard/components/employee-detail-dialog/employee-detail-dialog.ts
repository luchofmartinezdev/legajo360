import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Employee } from '../../../../shared/models/legajo'; // Ajustá la ruta según tu carpeta

@Component({
  selector: 'app-employee-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './employee-detail-dialog.html',
  styleUrl: './employee-detail-dialog.scss'
})
export class EmployeeDetailDialogComponent {
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Employee,
    private dialogRef: MatDialogRef<EmployeeDetailDialogComponent>
  ) {}

  subirRecibo() {
    console.log('Abriendo selector de archivos para:', this.data.displayName);
    // Aquí llamaremos luego al servicio de Firebase Storage
  }
}