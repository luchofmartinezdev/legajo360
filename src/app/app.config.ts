import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Imports de Firebase (Aseguramos que todos vengan de @angular/fire)
import { FirebaseApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // 1. Inicializamos la App base (Única vez)
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // 2. Auth y Storage (Se conectan automáticamente a la App de arriba)
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),

    // 3. Firestore (Forma correcta de pasar la base 'legajo360')
    provideFirestore(() => {
      // Usamos el inyector de Angular para obtener la App ya inicializada
      const app = inject(FirebaseApp); 
      
      // Inicializamos la base de datos específica
      return getFirestore(app, 'legajo360');
    }),
  ]
};