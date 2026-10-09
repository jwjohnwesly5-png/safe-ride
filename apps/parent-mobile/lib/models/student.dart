import 'pickup_location.dart';

enum TransitStatus {
  notStarted,
  busApproaching,
  atPickupPoint,
  boardedVerified,
  inTransit,
  droppedOffVerified,
  absent,
}

class Student {
  final String id;
  final String fullName;
  final String grade;
  final String studentCode;
  final String assignedBusNumber;
  final String driverName;
  final String driverPhone;
  final PickupLocation pickupLocation;
  final TransitStatus status;
  final String? profilePhotoUrl;
  final bool consentVerified;

  Student({
    required this.id,
    required this.fullName,
    required this.grade,
    required this.studentCode,
    required this.assignedBusNumber,
    required this.driverName,
    required this.driverPhone,
    required this.pickupLocation,
    required this.status,
    this.profilePhotoUrl,
    required this.consentVerified,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['id'] ?? '',
      fullName: json['full_name'] ?? '',
      grade: json['grade'] ?? '',
      studentCode: json['student_code'] ?? '',
      assignedBusNumber: json['assigned_bus_number'] ?? 'Bus-01',
      driverName: json['driver_name'] ?? 'Driver John',
      driverPhone: json['driver_phone'] ?? '+1 (555) 019-2831',
      pickupLocation: PickupLocation.fromJson(json['pickup_location'] ?? {}),
      status: TransitStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => TransitStatus.notStarted,
      ),
      profilePhotoUrl: json['profile_photo_url'],
      consentVerified: json['consent_verified'] ?? true,
    );
  }

  String get statusDisplay {
    switch (status) {
      case TransitStatus.notStarted:
        return 'Route Not Started';
      case TransitStatus.busApproaching:
        return 'Bus Approaching Stop (50m)';
      case TransitStatus.atPickupPoint:
        return 'Bus at Pickup Point';
      case TransitStatus.boardedVerified:
        return 'Boarded & Verified (MFV Pass)';
      case TransitStatus.inTransit:
        return 'In Transit to School';
      case TransitStatus.droppedOffVerified:
        return 'Dropped Off & Verified';
      case TransitStatus.absent:
        return 'Marked Absent';
    }
  }
}
