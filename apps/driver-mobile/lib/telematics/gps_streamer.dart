import 'dart:async';
import 'dart:math';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';

/// GPS Coordinate model for Agent 3 Driver App
class GPSCoordinate {
  final double latitude;
  final double longitude;
  final double speedMps;
  final double heading;
  final String timestamp;

  GPSCoordinate({
    required this.latitude,
    required this.longitude,
    required this.speedMps,
    required this.heading,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
        'latitude': latitude,
        'longitude': longitude,
        'speedMps': speedMps,
        'heading': heading,
        'timestamp': timestamp,
      };
}

/// Geofence Result model
class GeofenceResult {
  final String stopId;
  final String stopName;
  final double distanceMeters;
  final bool isWithin50m;
  final bool triggeredArrival;

  GeofenceResult({
    required this.stopId,
    required this.stopName,
    required this.distanceMeters,
    required this.isWithin50m,
    required this.triggeredArrival,
  });
}

/// Agent 3: Flutter Background GPS Streamer & Telematics Service
class GPSStreamer {
  final String busId;
  final String driverId;
  bool isTracking = false;
  Timer? _timer;
  final List<GPSCoordinate> _offlineQueue = [];
  
  final StreamController<GPSCoordinate> _locationController = StreamController.broadcast();
  final StreamController<GeofenceResult> _geofenceController = StreamController.broadcast();

  StreamSubscription<Position>? _positionStream;

  Stream<GPSCoordinate> get locationStream => _locationController.stream;
  Stream<GeofenceResult> get geofenceStream => _geofenceController.stream;

  GPSStreamer({required this.busId, required this.driverId});

  Future<void> startTracking() async {
    if (isTracking) return;
    
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
        print('[Agent 3 GPSStreamer] Location permissions denied.');
        return;
      }
    }

    isTracking = true;
    print('[Agent 3 GPSStreamer] Background GPS tracking started for Bus $busId.');

    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 5, // minimum change of 5 meters
    );

    _positionStream = Geolocator.getPositionStream(locationSettings: locationSettings).listen(
      (Position? position) {
        if (position != null && isTracking) {
          final coord = GPSCoordinate(
            latitude: position.latitude,
            longitude: position.longitude,
            speedMps: position.speed,
            heading: position.heading,
            timestamp: DateTime.now().toIso8601String(),
          );

          _locationController.add(coord);
          _evaluateGeofence(coord);
          _sendTelemetry(coord);
        }
      }
    );
  }

  void stopTracking() {
    isTracking = false;
    _positionStream?.cancel();
    _positionStream = null;
    print('[Agent 3 GPSStreamer] Background GPS tracking stopped.');
  }

  Future<void> _sendTelemetry(GPSCoordinate coord) async {
    try {
      // Offline queue logic
      _offlineQueue.add(coord);

      // We'll post the whole queue so we sync properly
      final payload = {
        'busId': busId,
        'driverId': driverId,
        'coordinates': _offlineQueue.map((c) => c.toJson()).toList(),
      };

      // Assuming localhost works for the emulator/device, adjust if running on Android Emulator (10.0.2.2)
      final response = await http.post(
        Uri.parse('http://10.0.2.2:3003/api/telemetry'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        _offlineQueue.clear();
      }
    } catch (e) {
      print('[Agent 3 Telematics] Sync failed, keeping ${coord.timestamp} in offline queue. Error: $e');
    }
  }

  /// PostGIS Haversine Distance Calculation (Meter precision)
  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const r = 6371000.0;
    final dLat = (lat2 - lat1) * (pi / 180.0);
    final dLon = (lon2 - lon1) * (pi / 180.0);

    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1 * (pi / 180.0)) * cos(lat2 * (pi / 180.0)) * sin(dLon / 2) * sin(dLon / 2);

    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return r * c;
  }

  void _evaluateGeofence(GPSCoordinate coord) {
    // Registered Stop 1: Oakridge Residence (12.9720, 77.5950)
    const stopLat = 12.9720;
    const stopLng = 77.5950;

    final dist = _calculateDistance(coord.latitude, coord.longitude, stopLat, stopLng);
    final isWithin = dist <= 50.0;

    final result = GeofenceResult(
      stopId: 'stop-1',
      stopName: 'Oakridge Residence (Alex Pickup Point)',
      distanceMeters: dist,
      isWithin50m: isWithin,
      triggeredArrival: isWithin,
    );

    _geofenceController.add(result);
  }

  void dispose() {
    _positionStream?.cancel();
    _locationController.close();
    _geofenceController.close();
  }
}
