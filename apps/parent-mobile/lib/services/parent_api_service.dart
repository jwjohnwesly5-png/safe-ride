import 'dart:async';
import 'package:latlong2/latlong.dart';
import '../models/student.dart';
import '../models/pickup_location.dart';
import '../models/transit_event.dart';

class ParentApiService {
  static final ParentApiService _instance = ParentApiService._internal();
  factory ParentApiService() => _instance;
  ParentApiService._internal();

  // Mock Student Data
  Student _currentStudent = Student(
    id: 'std_1001',
    fullName: 'Alex Johnson',
    grade: 'Grade 5 - Section B',
    studentCode: 'SR-2026-904',
    assignedBusNumber: 'SafeRide Bus 05',
    driverName: 'Robert Martinez',
    driverPhone: '+1 (555) 019-2831',
    pickupLocation: PickupLocation(
      id: 'pick_101',
      studentId: 'std_1001',
      latitude: 12.9716,
      longitude: 77.5946,
      addressLabel: 'Main Gate, Residency Rd, Sector 4',
      pickupTimeWindow: '07:35 AM',
      geofenceRadiusMeters: 50.0,
      lastUpdated: DateTime.now(),
    ),
    status: TransitStatus.busApproaching,
    consentVerified: true,
  );

  // Live Bus Location Stream
  LatLng _busLocation = const LatLng(12.9720, 77.5940);
  double _busSpeedKmH = 28.5;
  int _etaMinutes = 3;

  List<TransitEvent> _events = [
    TransitEvent(
      id: 'evt_01',
      studentId: 'std_1001',
      busId: 'bus_05',
      type: EventType.routeStarted,
      title: 'Morning Route Started',
      description: 'Bus 05 left central garage at 07:15 AM',
      timestamp: DateTime.now().subtract(const Duration(minutes: 25)),
      isVerified: true,
    ),
    TransitEvent(
      id: 'evt_02',
      studentId: 'std_1001',
      busId: 'bus_05',
      type: EventType.geofenceArrival,
      title: 'Geofence Radius Trigger (Alert #1)',
      description: 'Bus 05 entered 50m radius of Alex\'s pickup point',
      timestamp: DateTime.now().subtract(const Duration(minutes: 3)),
      latitude: 12.9718,
      longitude: 77.5944,
      isVerified: true,
    ),
  ];

  Student get currentStudent => _currentStudent;
  LatLng get busLocation => _busLocation;
  double get busSpeedKmH => _busSpeedKmH;
  int get etaMinutes => _etaMinutes;
  List<TransitEvent> get events => List.unmodifiable(_events);

  // Update Pickup Coordinates
  Future<bool> updatePickupCoordinates({
    required double latitude,
    required double longitude,
    required String addressLabel,
  }) async {
    await Future.delayed(const Duration(milliseconds: 600));
    final updatedLocation = PickupLocation(
      id: _currentStudent.pickupLocation.id,
      studentId: _currentStudent.id,
      latitude: latitude,
      longitude: longitude,
      addressLabel: addressLabel,
      pickupTimeWindow: _currentStudent.pickupLocation.pickupTimeWindow,
      geofenceRadiusMeters: 50.0,
      lastUpdated: DateTime.now(),
    );

    _currentStudent = Student(
      id: _currentStudent.id,
      fullName: _currentStudent.fullName,
      grade: _currentStudent.grade,
      studentCode: _currentStudent.studentCode,
      assignedBusNumber: _currentStudent.assignedBusNumber,
      driverName: _currentStudent.driverName,
      driverPhone: _currentStudent.driverPhone,
      pickupLocation: updatedLocation,
      status: _currentStudent.status,
      consentVerified: _currentStudent.consentVerified,
    );

    return true;
  }

  // Simulate Boarding Verification Event (Alert #2)
  void simulateBoardingVerification() {
    _currentStudent = Student(
      id: _currentStudent.id,
      fullName: _currentStudent.fullName,
      grade: _currentStudent.grade,
      studentCode: _currentStudent.studentCode,
      assignedBusNumber: _currentStudent.assignedBusNumber,
      driverName: _currentStudent.driverName,
      driverPhone: _currentStudent.driverPhone,
      pickupLocation: _currentStudent.pickupLocation,
      status: TransitStatus.boardedVerified,
      consentVerified: true,
    );

    _events.insert(
      0,
      TransitEvent(
        id: 'evt_${DateTime.now().millisecondsSinceEpoch}',
        studentId: _currentStudent.id,
        busId: 'bus_05',
        type: EventType.boardingVerified,
        title: 'Boarding Confirmed (Alert #2)',
        description: 'Multi-Factor Verification Passed: Face (0.94) + Geofence (12m) + Bus05 Roster',
        timestamp: DateTime.now(),
        latitude: _currentStudent.pickupLocation.latitude,
        longitude: _currentStudent.pickupLocation.longitude,
        isVerified: true,
        mfvFactorsPassed: '5/5 Factors Verified',
      ),
    );
  }

  // Trigger Emergency SOS Alert
  Future<bool> sendEmergencySOS(String reason) async {
    await Future.delayed(const Duration(milliseconds: 400));
    _events.insert(
      0,
      TransitEvent(
        id: 'sos_${DateTime.now().millisecondsSinceEpoch}',
        studentId: _currentStudent.id,
        busId: 'bus_05',
        type: EventType.routeStarted,
        title: 'EMERGENCY SOS SENT BY PARENT',
        description: 'Priority dispatch alert sent to School Safety Desk: "$reason"',
        timestamp: DateTime.now(),
        isVerified: false,
      ),
    );
    return true;
  }
}
