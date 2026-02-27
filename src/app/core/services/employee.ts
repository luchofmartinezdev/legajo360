import { Injectable, inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Employee } from '../../shared/models/legajo';

// IMPORTANTE: Todo debe venir de @angular/fire/firestore
import {
  Firestore,
  doc,
  docData,
  setDoc,
  collection,
  collectionData,
  getDoc,
  getDocs,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private firestore = inject(Firestore);

  getEmployeeByUid(uid: string | null | undefined): Observable<Employee | null> {
    if (!uid || uid.trim() === '') {
      console.warn("⚠️ UID inválido recibido en el servicio.");
      return of(null);
    }

    try {
      const docRef = doc(this.firestore, 'employees', uid.trim());

      return from(getDoc(docRef)).pipe(
        map(docSnap => {
          if (docSnap.exists()) {
            // Aquí extraemos los datos y le inyectamos el UID manualmente
            return { ...docSnap.data(), uid: docSnap.id } as Employee;
          }
          console.log(`Documento no encontrado: ${uid}`);
          return null;
        }),
        catchError(err => {
          console.error("Error al traer el empleado:", err);
          return of(null);
        })
      );
    } catch (error) {
      console.error("❌ Error al construir referencia de documento:", error);
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

    // Convertimos la promesa de getDocs en un Observable
    return from(getDocs(employeesRef)).pipe(
      map(querySnapshot => {
        // Mapeamos los documentos a objetos Employee inyectando el ID
        const employees = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          uid: doc.id
        })) as Employee[];

        // Filtramos por los activos (isActive)
        return employees.filter(emp => emp.isActive === true);
      }),
      catchError(err => {
        console.error("❌ Error al traer la nómina de Kernel:", err);
        return of([]);
      })
    );
  }

  // Obtiene el uid del empleado mas reciente
  getLastEmployeeId(): Observable<string> {
    const employeesRef = collection(this.firestore, 'employees');
    
    return from(getDocs(employeesRef)).pipe(
      map(querySnapshot => { 
        const employees = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          uid: doc.id
        })) as Employee[];
        return employees[employees.length - 1].uid;
      }),
      catchError(err => {
        console.error("❌ Error al traer la nómina de Kernel:", err);
        return of('');
      })
    );
  }
}