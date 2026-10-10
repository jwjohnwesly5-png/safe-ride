import 'package:flutter/material.dart';
import '../telematics/gps_streamer.dart';
import 'camera_verification_screen.dart';

class RouteExecutionScreen extends StatefulWidget {
  const RouteExecutionScreen({super.key});

  @override
  State<RouteExecutionScreen> createState() => _RouteExecutionScreenState();
}

class _RouteExecutionScreenState extends State<RouteExecutionScreen> {
  late GPSStreamer _telematicsService;
  GPSCoordinate? _latestCoord;
  GeofenceResult? _latestGeofence;
  bool _isRouteActive = false;

  @override
  void initState() {
    super.initState();
    _telematicsService = GPSStreamer(busId: 'bus-05', driverId: 'usr-driver-1');

    _telematicsService.locationStream.listen((coord) {
      setState(() {
        _latestCoord = coord;
      });
    });

    _telematicsService.geofenceStream.listen((result) {
      setState(() {
        _latestGeofence = result;
      });
    });
  }

  void _toggleRouteTracking() {
    setState(() {
      _isRouteActive = !_isRouteActive;
      if (_isRouteActive) {
        _telematicsService.startTracking();
      } else {
        _telematicsService.stopTracking();
      }
    });
  }

  @override
  void dispose() {
    _telematicsService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bus 05 Route Telematics (Agent 3)'),
        backgroundColor: const Color(0xFF0F172A),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _isRouteActive ? Colors.green.withOpacity(0.2) : Colors.amber.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _isRouteActive ? Colors.green : Colors.amber,
              ),
            ),
            child: Text(
              _isRouteActive ? '● STREAMING ACTIVE' : '○ IDLE',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: _isRouteActive ? Colors.greenAccent : Colors.amberAccent,
              ),
            ),
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Start/Stop Route Button
            ElevatedButton.icon(
              onPressed: _toggleRouteTracking,
              icon: Icon(_isRouteActive ? Icons.pause_circle : Icons.play_circle),
              label: Text(_isRouteActive ? 'PAUSE ROUTE STREAMING' : 'START BUS 05 ROUTE'),
              style: ElevatedButton.styleFrom(
                backgroundColor: _isRouteActive ? Colors.redAccent : const Color(0xFF6366F1),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),

            // Live Telematics Metrics Card
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('LIVE GPS TELEMETRY STREAM (5s)', style: TextStyle(color: Colors.indigoAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text('Latitude: ${_latestCoord?.latitude.toStringAsFixed(5) ?? '12.97000'}', style: const TextStyle(fontSize: 14, fontFamily: 'monospace')),
                    Text('Longitude: ${_latestCoord?.longitude.toStringAsFixed(5) ?? '77.59200'}', style: const TextStyle(fontSize: 14, fontFamily: 'monospace')),
                    Text('Speed: ${((_latestCoord?.speedMps ?? 0) * 3.6).toStringAsFixed(1)} km/h', style: const TextStyle(fontSize: 14, color: Colors.greenAccent)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Geofence Intersection Card (<= 50m)
            Card(
              color: (_latestGeofence?.isWithin50m ?? false) ? Colors.indigo.withOpacity(0.3) : const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(
                  color: (_latestGeofence?.isWithin50m ?? false) ? Colors.indigo : Colors.transparent,
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('GEOFENCE DISTANCE CHECK', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.indigo.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text('Radius: 50m', style: TextStyle(color: Colors.indigoAccent, fontSize: 10)),
                        )
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('Target Stop: ${_latestGeofence?.stopName ?? 'Oakridge Residence'}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(
                      'Distance to Stop: ${_latestGeofence?.distanceMeters.toStringAsFixed(1) ?? '18.4'} meters',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: (_latestGeofence?.isWithin50m ?? false) ? Colors.greenAccent : Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (_latestGeofence?.isWithin50m ?? false)
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: Colors.green.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                        child: const Row(
                          children: [
                            Icon(Icons.notifications_active, color: Colors.greenAccent, size: 16),
                            SizedBox(width: 8),
                            Text('PARENT ALERT #1 DISPATCHED (Geofence Arrival)', style: TextStyle(color: Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      )
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => CameraVerificationScreen(
                      isWithinGeofence: _latestGeofence?.isWithin50m ?? false,
                      busId: 'bus-05',
                    ),
                  ),
                );
              },
              icon: const Icon(Icons.camera_alt),
              label: const Text('OPEN AI CAMERA SCANNER'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.indigoAccent,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
