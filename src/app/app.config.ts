import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Imports de Firebase (Aseguramos que todos vengan de @angular/fire)
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore, initializeFirestore, memoryLocalCache } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // 1. Inicializamos la App base
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // 2. Auth y Storage estándar
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),

    // 3. Firestore con configuración de compatibilidad
    // Usamos initializeFirestore para evitar conflictos de "different SDK instance"
    provideFirestore(() => {
      const app = initializeApp(environment.firebase);
      // USAMOS getFirestore para que AngularFire lo reconozca como la instancia oficial
      const firestore = getFirestore(app, 'legajo360');

      // Si el error persiste con getFirestore, volvemos a initializeFirestore 
      // pero asegurándonos de NO llamar a initializeApp dos veces.
      return firestore;
    }),
  ]
};