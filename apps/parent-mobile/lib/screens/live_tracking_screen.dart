import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../services/parent_api_service.dart';
import '../models/student.dart';
import 'sos_modal.dart';

class LiveTrackingScreen extends StatefulWidget {
  const LiveTrackingScreen({Key? key}) : super(key: key);

  @override
  State<LiveTrackingScreen> createState() => _LiveTrackingScreenState();
}

class _LiveTrackingScreenState extends State<LiveTrackingScreen> {
  final ParentApiService _apiService = ParentApiService();
  final MapController _mapController = MapController();
  StreamSubscription<Student>? _studentSubscription;

  @override
  void initState() {
    super.initState();
    _studentSubscription = _apiService.studentStream.listen((student) {
      if (mounted) {
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    _studentSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final student = _apiService.currentStudent;
    final busPos = _apiService.busLocation;
    final pickupPos = LatLng(student.pickupLocation.latitude, student.pickupLocation.longitude);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              student.fullName,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(
              'Assigned: ${student.assignedBusNumber}',
              style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 12),
            ),
          ],
        ),
        actions: [
          // Emergency SOS Action Button
          Container(
            margin: const EdgeInsets.only(right: 12),
            child: ElevatedButton.icon(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => const SosModal(),
                );
              },
              icon: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 18),
              label: const Text('SOS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Live Status Header Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: student.status == TransitStatus.boardedVerified
                  ? const Color(0xFF10B981).withOpacity(0.15)
                  : const Color(0xFF0284C7).withOpacity(0.15),
              border: Border(
                bottom: BorderSide(
                  color: student.status == TransitStatus.boardedVerified
                      ? const Color(0xFF10B981).withOpacity(0.3)
                      : const Color(0xFF38BDF8).withOpacity(0.3),
                ),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  student.status == TransitStatus.boardedVerified
                      ? Icons.verified_user
                      : Icons.directions_bus,
                  color: student.status == TransitStatus.boardedVerified
                      ? const Color(0xFF10B981)
                      : const Color(0xFF38BDF8),
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        student.statusDisplay,
                        style: TextStyle(
                          color: student.status == TransitStatus.boardedVerified
                              ? const Color(0xFF34D399)
                              : Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Pickup Point: ${student.pickupLocation.addressLabel}',
                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Column(
                    children: [
                      const Text('ETA', style: TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                      Text(
                        '${_apiService.etaMinutes} min',
                        style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Map View with Live Markers
          Expanded(
            child: Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: pickupPos,
                    initialZoom: 15.5,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.saferide.parent',
                    ),

                    // Geofence Circle around Student Stop (50m)
                    CircleLayer(
                      circles: [
                        CircleMarker(
                          point: pickupPos,
                          radius: 50.0,
                          useRadiusInMeter: true,
                          color: const Color(0xFF10B981).withOpacity(0.2),
                          borderColor: const Color(0xFF10B981),
                          borderStrokeWidth: 2,
                        ),
                      ],
                    ),

                    // Polyline route connection
                    PolylineLayer(
                      polylines: [
                        Polyline(
                          points: [busPos, pickupPos],
                          color: const Color(0xFF38BDF8),
                          strokeWidth: 3.5,
                        ),
                      ],
                    ),

                    // Bus & Student Stop Markers
                    MarkerLayer(
                      markers: [
                        // Student Pickup Marker
                        Marker(
                          point: pickupPos,
                          width: 50,
                          height: 50,
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF10B981).withOpacity(0.5),
                                  blurRadius: 10,
                                ),
                              ],
                            ),
                            child: const Icon(Icons.person_pin_circle, color: Colors.white, size: 28),
                          ),
                        ),

                        // Moving Bus Marker
                        Marker(
                          point: busPos,
                          width: 60,
                          height: 60,
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF0284C7),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF0284C7).withOpacity(0.6),
                                  blurRadius: 12,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: const Icon(Icons.directions_bus, color: Colors.white, size: 30),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                // Recenter Controls
                Positioned(
                  bottom: 20,
                  right: 16,
                  child: FloatingActionButton.small(
                    backgroundColor: const Color(0xFF1E293B),
                    child: const Icon(Icons.center_focus_strong, color: Color(0xFF38BDF8)),
                    onPressed: () {
                      _mapController.move(busPos, 16.0);
                    },
                  ),
                ),
              ],
            ),
          ),

          // Driver Telematics & Info Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFF1E293B),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: const Color(0xFF3B82F6).withOpacity(0.2),
                      child: const Icon(Icons.person, color: Color(0xFF38BDF8)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            student.driverName,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          Text(
                            'Bus Speed: ${_apiService.busSpeedKmH} km/h • GPS Active',
                            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.phone, color: Color(0xFF10B981)),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Calling Driver ${student.driverName} at ${student.driverPhone}...'),
                            backgroundColor: const Color(0xFF0284C7),
                          ),
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                
                // Simulation Trigger for Demo
                if (student.status != TransitStatus.boardedVerified)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        setState(() {
                          _apiService.simulateBoardingVerification();
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('🔔 Alert #2 Triggered: Boarding Confirmed via Multi-Factor Verification!'),
                            backgroundColor: Color(0xFF10B981),
                          ),
                        );
                      },
                      icon: const Icon(Icons.verified, color: Color(0xFF34D399), size: 18),
                      label: const Text(
                        'Simulate Facial MFV Boarding Event (Alert #2)',
                        style: TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF059669)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
