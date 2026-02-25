import { Timestamp } from "@angular/fire/firestore"; 
/**
 * Representa los roles dentro de Legajo360
 */
export type UserRole = 'admin' | 'employee' | 'rrhh';

/**
 * Estados posibles de un recibo de sueldo en el flujo de firma
 */
export type PaystubStatus =
    | 'pending_company'  // Cargado por RRHH, falta firma del representante
    | 'pending_employee' // Listo para que el empleado lo revise y firme
    | 'signed'           // Proceso completado por ambas partes
    | 'disputed';        // El empleado rechazó el recibo por alguna disconformidad

/**
 * Información personal y laboral del empleado
 */
export interface Employee {
  uid: string;
  legajoNumber: string;
  displayName: string;
  email: string;
  dni: string;
  cuil: string;
  birthDate?: string;
  joinDate: string;
  position: string;
  sector: string;
  isActive: boolean;
  
  // --- NUEVOS CAMPOS DE ROL Y CONTROL ---
  role: UserRole; // Solo permite estos dos valores
  permissions?: string[];      // Por si querés dar permisos específicos más adelante
  
  paystubs?: Paystub[];
}

export interface Paystub {
  id?: string;
  period: string;
  uploadDate: any;
  fileUrl: string;
  status: 'pending' | 'signed' | 'viewed';
  amount?: number;
}
/**
 * Modelo para los recibos de sueldo (Nóminas)
 */
export interface PayrollReceipt {
    id?: string;              // ID autogenerado por Firestore
    employeeUid: string;      // Relación con el empleado
    period: string;           // Formato "YYYY-MM" (ej: "2026-02")
    totalNet: number;         // Monto neto a cobrar
    status: PaystubStatus;

    // Ubicación de los archivos en Firebase Storage
    originalPdfUrl: string;   // PDF original subido por la empresa
    signedPdfUrl?: string;    // PDF final con las firmas digitales estampadas

    // Lógica de Firma y Conformidad
    isEmployeeConforming: boolean;
    disputeReason?: string;    // Solo si isEmployeeConforming es false

    // Auditoría (Esencial para validez legal básica)
    signatures: {
        company?: {
            signedAt: Timestamp;
            ip: string;
            hash: string;         // Hash SHA-256 del documento al momento de firmar
        };
        employee?: {
            signedAt: Timestamp;
            ip: string;
            hash: string;
            userAgent: string;    // Datos del navegador/dispositivo
        };
    };

    createdAt: Timestamp;
}

/**
 * Modelo para las comunicaciones oficiales/correos
 */
export interface CorporateNotification {
    id: string;
    to: string;
    subject: string;
    type: 'NEW_PAYSTUB' | 'REMINDER' | 'SIGNATURE_SUCCESS';
    sentAt: Timestamp;
    read: boolean;
}