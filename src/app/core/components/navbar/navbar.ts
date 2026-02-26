import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

// Material 
import { AuthService } from '../../services/auth';
import { Observable } from 'rxjs';

// Servicios

@Component({
  selector: 'app-navbar',
  standalone: true, imports: [AsyncPipe, RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})

export class NavbarComponent {
  private router = inject(Router);

  // Observable que nos dirá si el usuario está logueado
  user$: Observable<any>;
  isMenuOpen = false;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.user$;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.isMenuOpen = false;
    this.authService.logout();
  }
}