// Initial mock database state for SafeRide AI demonstration

export const INITIAL_BUSES = [
  {
    id: 'bus-01',
    bus_number: 'Bus 01',
    license_plate: 'KA-01-EQ-9921',
    capacity: 40,
    driver_name: 'David Miller',
    driver_phone: '+1 (555) 234-5678',
    is_active: true,
    current_latitude: 12.9716,
    current_longitude: 77.5946,
    assigned_route: 'Route A - North Suburbs'
  },
  {
    id: 'bus-02',
    bus_number: 'Bus 02',
    license_plate: 'KA-05-SR-4412',
    capacity: 35,
    driver_name: 'Robert Vance',
    driver_phone: '+1 (555) 876-5432',
    is_active: true,
    current_latitude: 12.9650,
    current_longitude: 77.5890,
    assigned_route: 'Route B - East District'
  }
];

export const INITIAL_STOPS = [
  {
    id: 'stop-01',
    route_id: 'route-a',
    stop_name: 'Sunrise Boulevard (Stop #1)',
    latitude: 12.9720,
    longitude: 77.5950,
    geofence_radius_meters: 50.0,
    stop_sequence: 1
  },
  {
    id: 'stop-02',
    route_id: 'route-a',
    stop_name: 'Greenwood Apartments (Stop #2)',
    latitude: 12.9760,
    longitude: 77.5990,
    geofence_radius_meters: 50.0,
    stop_sequence: 2
  },
  {
    id: 'stop-03',
    route_id: 'route-a',
    stop_name: 'St. Jude International Academy (School Campus)',
    latitude: 12.9810,
    longitude: 77.6050,
    geofence_radius_meters: 50.0,
    stop_sequence: 3
  }
];

export const INITIAL_STUDENTS = [
  {
    id: 'student-01',
    student_id_code: 'STD-8841',
    first_name: 'Alex',
    last_name: 'Smith',
    class_grade: 'Grade 5-B',
    parent_name: 'Sarah Smith',
    parent_phone: '+1 (555) 998-1122',
    assigned_bus_id: 'bus-01',
    assigned_stop_id: 'stop-01',
    pickup_latitude: 12.9720,
    pickup_longitude: 77.5950,
    parent_consent_given: true,
    current_status: 'PENDING', // PENDING | GEOFENCE_NOTIFIED | BOARDED | DROPPED_OFF | MISMATCHED
    face_embedding_registered: true,
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student-02',
    student_id_code: 'STD-9902',
    first_name: 'Emma',
    last_name: 'Johnson',
    class_grade: 'Grade 4-A',
    parent_name: 'Michael Johnson',
    parent_phone: '+1 (555) 443-8899',
    assigned_bus_id: 'bus-01',
    assigned_stop_id: 'stop-02',
    pickup_latitude: 12.9760,
    pickup_longitude: 77.5990,
    parent_consent_given: true,
    current_status: 'PENDING',
    face_embedding_registered: true,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student-03',
    student_id_code: 'STD-7714',
    first_name: 'Lucas',
    last_name: 'Brown',
    class_grade: 'Grade 6-C',
    parent_name: 'Jessica Brown',
    parent_phone: '+1 (555) 332-9900',
    assigned_bus_id: 'bus-02', // Assigned to Bus 02 (Used for Mismatch Testing)
    assigned_stop_id: 'stop-01',
    pickup_latitude: 12.9720,
    pickup_longitude: 77.5950,
    parent_consent_given: true,
    current_status: 'PENDING',
    face_embedding_registered: true,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_TRANSIT_EVENTS = [
  {
    id: 'evt-001',
    timestamp: '07:30:15 AM',
    student_name: 'Alex Smith',
    event_type: 'SYSTEM_INIT',
    bus_number: 'Bus 01',
    details: 'Route A initialized by Driver David Miller.',
    confidence: null
  }
];
