class PickupLocation {
  final String id;
  final String studentId;
  final double latitude;
  final double longitude;
  final String addressLabel;
  final String pickupTimeWindow;
  final double geofenceRadiusMeters;
  final DateTime lastUpdated;

  PickupLocation({
    required this.id,
    required this.studentId,
    required this.latitude,
    required this.longitude,
    required this.addressLabel,
    required this.pickupTimeWindow,
    this.geofenceRadiusMeters = 50.0,
    required this.lastUpdated,
  });

  factory PickupLocation.fromJson(Map<String, dynamic> json) {
    return PickupLocation(
      id: json['id'] ?? '',
      studentId: json['student_id'] ?? '',
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      addressLabel: json['address_label'] ?? 'Home Stop',
      pickupTimeWindow: json['pickup_time_window'] ?? '07:30 AM',
      geofenceRadiusMeters: (json['geofence_radius_meters'] as num?)?.toDouble() ?? 50.0,
      lastUpdated: DateTime.tryParse(json['last_updated'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'student_id': studentId,
      'latitude': latitude,
      'longitude': longitude,
      'address_label': addressLabel,
      'pickup_time_window': pickupTimeWindow,
      'geofence_radius_meters': geofenceRadiusMeters,
      'last_updated': lastUpdated.toIso8601String(),
    };
  }
}
