import { Component, Input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './employee-profile.html'
})
export class EmployeeProfileComponent {
  @Input({ required: true }) user: any; // Aquí podés usar tu interfaz Employee
}