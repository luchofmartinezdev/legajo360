import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router'; 
import { Footer } from "./core/components/footer/footer";
import { filter } from 'rxjs';
import { NavbarComponent } from './core/components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('legajo360');

  private router = inject(Router);
  showLayout = false;

  constructor() {
    // Escuchamos los cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Si la ruta NO es 'login', mostramos el layout
      this.showLayout = !event.urlAfterRedirects.includes('login');
    });
  }
}
