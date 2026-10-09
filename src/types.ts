export type UserRole = 'ADMIN' | 'DRIVER' | 'PARENT';

export type TransitStatus = 'PENDING' | 'GEOFENCE_ARRIVED' | 'BOARDED' | 'DROPPED_OFF' | 'MISMATCHED' | 'ABSENT';

export type EventType = 
  | 'GEOFENCE_ARRIVAL' 
  | 'BOARDING_VERIFIED' 
  | 'BOARDING_MANUAL_OVERRIDE' 
  | 'DROP_OFF_VERIFIED' 
  | 'MISMATCH_FLAGGED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  fcmToken?: string;
}

export interface RouteStop {
  id: string;
  routeName: string;
  stopName: string;
  lat: number;
  lng: number;
  geofenceRadiusMeters: number;
  stopSequence: number;
  estimatedArrival: string;
}

export interface Bus {
  id: string;
  busNumber: string;
  licensePlate: string;
  capacity: number;
  driverId: string;
  driverName: string;
  isActive: boolean;
  currentLat: number;
  currentLng: number;
  lastUpdate: string;
}

export interface Student {
  id: string;
  studentIdCode: string;
  firstName: string;
  lastName: string;
  classGrade: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  assignedBusId: string;
  assignedBusNumber: string;
  assignedStopId: string;
  assignedStopName: string;
  faceEmbeddingVector: number[]; // 512-d float array
  parentConsentGiven: boolean;
  currentStatus: TransitStatus;
}

export interface TransitEvent {
  id: string;
  studentId?: string;
  studentName?: string;
  busId: string;
  busNumber: string;
  driverId: string;
  stopId: string;
  stopName: string;
  eventType: EventType;
  confidence?: number;
  lat: number;
  lng: number;
  overrideReason?: string;
  timestamp: string;
}

export interface MFVFactorCheck {
  faceMatch: boolean;
  faceConfidence: number;
  busMatch: boolean;
  geofenceMatch: boolean;
  geofenceDistanceMeters: number;
  stopRosterMatch: boolean;
  routeTimeMatch: boolean;
  overallPassed: boolean;
}
