enum EventType {
  geofenceArrival,
  boardingVerified,
  manualOverrideBoarding,
  dropOffVerified,
  routeStarted,
  routeEnded,
}

class TransitEvent {
  final String id;
  final String studentId;
  final String busId;
  final EventType type;
  final String title;
  final String description;
  final DateTime timestamp;
  final double? latitude;
  final double? longitude;
  final bool isVerified;
  final String? mfvFactorsPassed;

  TransitEvent({
    required this.id,
    required this.studentId,
    required this.busId,
    required this.type,
    required this.title,
    required this.description,
    required this.timestamp,
    this.latitude,
    this.longitude,
    required this.isVerified,
    this.mfvFactorsPassed,
  });

  factory TransitEvent.fromJson(Map<String, dynamic> json) {
    return TransitEvent(
      id: json['id'] ?? '',
      studentId: json['student_id'] ?? '',
      busId: json['bus_id'] ?? '',
      type: EventType.values.firstWhere(
        (e) => e.toString().split('.').last == json['type'],
        orElse: () => EventType.geofenceArrival,
      ),
      title: json['title'] ?? 'Transit Event',
      description: json['description'] ?? '',
      timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      isVerified: json['is_verified'] ?? true,
      mfvFactorsPassed: json['mfv_factors_passed'],
    );
  }
}
