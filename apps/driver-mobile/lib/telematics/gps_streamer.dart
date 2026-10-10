import 'dart:async';
import 'dart:math';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';

/// GPS Coordinate model for Agent 4 Driver App & Telematics Engine
class GPSCoordinate {
  final double latitude;
  final double longitude;
  final double speedMps;
  final double heading;
  final double accuracyMeters;
  final String timestamp;
  final bool isMock;

  GPSCoordinate({
    required this.latitude,
    required this.longitude,
    required this.speedMps,
    required this.heading,
    this.accuracyMeters = 3.5,
    required this.timestamp,
    this.isMock = false,
  });

  Map<String, dynamic> toJson() => {
        'latitude': latitude,
        'longitude': longitude,
        'speedMps': speedMps,
        'heading': heading,
        'accuracyMeters': accuracyMeters,
        'timestamp': timestamp,
        'isMock': isMock,
      };
}

/// Geofence Result model for 50m PostGIS Geofence Evaluation
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

  Map<String, dynamic> toJson() => {
        'stopId': stopId,
        'stopName': stopName,
        'distanceMeters': distanceMeters,
        'isWithin50m': isWithin50m,
        'triggeredArrival': triggeredArrival,
      };
}

/// Agent 4: Flutter Background GPS Streamer & Telematics Engine
class GPSStreamer {
  final String busId;
  final String driverId;
  bool isTracking = false;
  bool useRealHardwareGps = false;
  Timer? _timer;
  StreamSubscription<Position>? _positionSubscription;
  final List<GPSCoordinate> _offlineQueue = [];
  
  final StreamController<GPSCoordinate> _locationController = StreamController.broadcast();
  final StreamController<GeofenceResult> _geofenceController = StreamController.broadcast();

  Stream<GPSCoordinate> get locationStream => _locationController.stream;
  Stream<GeofenceResult> get geofenceStream => _geofenceController.stream;

  GPSStreamer({required this.busId, required this.driverId});

  /// Request hardware GPS permissions and start 5s location streaming
  Future<void> startTracking({bool preferHardwareGps = true}) async {
    if (isTracking) return;
    isTracking = true;

    if (preferHardwareGps) {
      try {
        bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (serviceEnabled) {
          LocationPermission permission = await Geolocator.checkPermission();
          if (permission == LocationPermission.denied) {
            permission = await Geolocator.requestPermission();
          }

          if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
            useRealHardwareGps = true;
            print('[Agent 4 GPSStreamer] Hardware GPS Sensor active for Bus $busId.');

            const locationSettings = LocationSettings(
              accuracy: LocationAccuracy.high,
              distanceFilter: 5,
            );

            _positionSubscription = Geolocator.getPositionStream(locationSettings: locationSettings).listen((position) {
              if (!isTracking) return;

              final coord = GPSCoordinate(
                latitude: position.latitude,
                longitude: position.longitude,
                speedMps: position.speed,
                heading: position.heading,
                accuracyMeters: position.accuracy,
                timestamp: DateTime.now().toIso8601String(),
                isMock: false,
              );

              _locationController.add(coord);
              _evaluateGeofence(coord);
              _sendTelemetry(coord);
            });

            return;
          }
        }
      } catch (e) {
        print('[Agent 4 GPSStreamer] Hardware GPS unavailable. Falling back to high-precision telematics simulator: $e');
      }
    }

    // Fallback: Telematics Path Simulator (5s interval)
    useRealHardwareGps = false;
    print('[Agent 4 GPSStreamer] Simulated 5s Telematics Stream started for Bus $busId.');

    double currentLat = 12.9700;
    double currentLng = 77.5920;

    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (!isTracking) return;

      currentLat += 0.0004;
      currentLng += 0.0006;

      final coord = GPSCoordinate(
        latitude: currentLat,
        longitude: currentLng,
        speedMps: 8.3,
        heading: 45.0,
        accuracyMeters: 2.5,
        timestamp: DateTime.now().toIso8601String(),
        isMock: true,
      );

      _locationController.add(coord);
      _evaluateGeofence(coord);
      _sendTelemetry(coord);
    });
  }

  void stopTracking() {
    isTracking = false;
    _timer?.cancel();
    _positionSubscription?.cancel();
    print('[Agent 4 GPSStreamer] Background GPS tracking stopped.');
  }

  Future<void> _sendTelemetry(GPSCoordinate coord) async {
    _offlineQueue.add(coord);

    final payload = {
      'busId': busId,
      'driverId': driverId,
      'coordinates': _offlineQueue.map((c) => c.toJson()).toList(),
    };

    // Try primary Android emulator host (10.0.2.2) and fallback to localhost/127.0.0.1 for Web/Desktop
    final hosts = [
      'http://10.0.2.2:3003/api/telemetry',
      'http://127.0.0.1:3003/api/telemetry',
      'http://localhost:3003/api/telemetry',
    ];

    for (final endpoint in hosts) {
      try {
        final response = await http.post(
          Uri.parse(endpoint),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(payload),
        ).timeout(const Duration(seconds: 2));

        if (response.statusCode == 200) {
          _offlineQueue.clear();
          break;
        }
      } catch (_) {
        // Try next endpoint
      }
    }
  }

  /// PostGIS Spherical Distance Calculation (Meter precision)
  double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const r = 6371000.0;
    final dLat = (lat2 - lat1) * (pi / 180.0);
    final dLon = (lon2 - lon1) * (pi / 180.0);

    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1 * (pi / 180.0)) * cos(lat2 * (pi / 180.0)) * sin(dLon / 2) * sin(dLon / 2);

    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return r * c;
  }

  void _evaluateGeofence(GPSCoordinate coord) {
    const stopLat = 12.9720;
    const stopLng = 77.5950;

    final dist = calculateDistance(coord.latitude, coord.longitude, stopLat, stopLng);
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

  int getOfflineQueueLength() => _offlineQueue.length;

  void dispose() {
    stopTracking();
    _locationController.close();
    _geofenceController.close();
  }
}
