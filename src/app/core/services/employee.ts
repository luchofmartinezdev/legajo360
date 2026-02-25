import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Employee } from '../../shared/models/legajo';

// IMPORTANTE: Todo debe venir de @angular/fire/firestore
import {
  Firestore,
  doc,
  docData,
  setDoc,
  collection,
  query,
  where,
  collectionData
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private firestore = inject(Firestore);

  // core/services/employee.service.ts
  getEmployeeByUid(uid: string | null | undefined): Observable<Employee | null> {
    // 1. Verificación de seguridad para evitar el error de "even number of segments"
    if (!uid || uid.trim() === '') {
      console.warn("UID inválido o vacío. No se realizará la consulta a Firestore.");
      return of(null);
    }

    try {
      // 2. Ahora es seguro crear la referencia porque sabemos que hay 2 segmentos
      const docRef = doc(this.firestore, 'employees', uid.trim());

      return docData(docRef, { idField: 'uid' }).pipe(
        map(data => {
          if (!data) {
            console.log(`Documento no encontrado para el UID: ${uid}`);
            return null;
          }
          return data as Employee;
        }),
        catchError(err => {
          console.error("Error en el stream de la base 'legajo360':", err);
          return of(null);
        })
      );
    } catch (error) {
      console.error("Error al construir la referencia del documento:", error);
      return of(null);
    }
  }

  /**
   * Crea o actualiza un empleado (útil para el setup inicial de Kernel Studio)
   */
  async upsertEmployee(employee: Employee): Promise<void> {
    if (!employee.uid) throw new Error("El empleado debe tener un UID");

    const employeeDoc = doc(this.firestore, 'employees', employee.uid.trim());
    return setDoc(employeeDoc, employee, { merge: true });
  }

  /**
   * Obtiene la lista de empleados activos
   */
  getActiveEmployees(): Observable<Employee[]> {
    const employeesRef = collection(this.firestore, 'employees');
    const q = query(employeesRef, where('isActive', '==', true));

    return collectionData(q, { idField: 'uid' }).pipe(
      map(data => data as Employee[]),
      catchError(err => {
        console.error("Error al listar empleados:", err);
        return of([]);
      })
    );
  }
}