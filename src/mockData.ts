import { User, Bus, RouteStop, Student, TransitEvent } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    fullName: 'Principal Sarah Jenkins',
    email: 'admin@school.edu',
    phoneNumber: '+1 (555) 019-2834',
    role: 'ADMIN',
  },
  {
    id: 'usr-driver-1',
    fullName: 'Robert Taylor',
    email: 'robert.driver@school.edu',
    phoneNumber: '+1 (555) 019-2835',
    role: 'DRIVER',
  },
  {
    id: 'usr-parent-1',
    fullName: 'David Smith',
    email: 'david.smith@gmail.com',
    phoneNumber: '+1 (555) 019-2836',
    role: 'PARENT',
  },
];

export const INITIAL_STOPS: RouteStop[] = [
  {
    id: 'stop-1',
    routeName: 'Route A - Morning Express',
    stopName: 'Oakridge Residence (Alex Pickup Point)',
    lat: 12.9720,
    lng: 77.5950,
    geofenceRadiusMeters: 50,
    stopSequence: 1,
    estimatedArrival: '07:35 AM',
  },
  {
    id: 'stop-2',
    routeName: 'Route A - Morning Express',
    stopName: 'Greenwood Apartments',
    lat: 12.9780,
    lng: 77.5990,
    geofenceRadiusMeters: 50,
    stopSequence: 2,
    estimatedArrival: '07:45 AM',
  },
];

export const INITIAL_BUSES: Bus[] = [
  {
    id: 'bus-05',
    busNumber: 'Bus 05',
    licensePlate: 'KA-01-EQ-9988',
    capacity: 40,
    driverId: 'usr-driver-1',
    driverName: 'Robert Taylor',
    isActive: true,
    currentLat: 12.9700,
    currentLng: 77.5920,
    lastUpdate: 'Just now',
  },
  {
    id: 'bus-08',
    busNumber: 'Bus 08 (Different Bus)',
    licensePlate: 'KA-01-EQ-1122',
    capacity: 35,
    driverId: 'usr-driver-2',
    driverName: 'Michael Brown',
    isActive: true,
    currentLat: 12.9800,
    currentLng: 77.6000,
    lastUpdate: '5 mins ago',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    studentIdCode: 'STU-2026-001',
    firstName: 'Alex',
    lastName: 'Smith',
    classGrade: 'Grade 5-B',
    parentId: 'usr-parent-1',
    parentName: 'David Smith',
    parentPhone: '+1 (555) 019-2836',
    assignedBusId: 'bus-05',
    assignedBusNumber: 'Bus 05',
    assignedStopId: 'stop-1',
    assignedStopName: 'Oakridge Residence (Alex Pickup Point)',
    faceEmbeddingVector: Array.from({ length: 512 }, () => Math.random() * 2 - 1),
    parentConsentGiven: true,
    currentStatus: 'PENDING',
  },
  {
    id: 'stu-2',
    studentIdCode: 'STU-2026-002',
    firstName: 'Sophia',
    lastName: 'Johnson',
    classGrade: 'Grade 6-A',
    parentId: 'usr-parent-2',
    parentName: 'Emma Johnson',
    parentPhone: '+1 (555) 019-9900',
    assignedBusId: 'bus-05',
    assignedBusNumber: 'Bus 05',
    assignedStopId: 'stop-2',
    assignedStopName: 'Greenwood Apartments',
    faceEmbeddingVector: Array.from({ length: 512 }, () => Math.random() * 2 - 1),
    parentConsentGiven: true,
    currentStatus: 'PENDING',
  }
];

export const INITIAL_EVENTS: TransitEvent[] = [];
