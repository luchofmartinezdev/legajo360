import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Observable con el estado del usuario
  user$ = user(this.auth);

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const email = result.user.email;

      // Validación de dominio de Kernel Studio
      if (email?.endsWith('@gmail.com')) {
        this.router.navigate(['/dashboard']);
      } else {
        // Si no es el dominio correcto, lo deslogueamos
        await this.logout();
        alert('Acceso restringido a correos corporativos.');
      }
    } catch (error) {
      console.error('Error en login:', error);
    }
  }

  logout() {
    return signOut(this.auth).then(() => this.router.navigate(['/login']));
  }

  getCurrentUserId(): string | null {
    const currentUser = this.auth.currentUser;
    return currentUser ? currentUser.uid : null;
  }
}