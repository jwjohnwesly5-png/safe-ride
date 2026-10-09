import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../services/parent_api_service.dart';

class LocationPickerScreen extends StatefulWidget {
  const LocationPickerScreen({Key? key}) : super(key: key);

  @override
  State<LocationPickerScreen> createState() => _LocationPickerScreenState();
}

class _LocationPickerScreenState extends State<LocationPickerScreen> {
  final MapController _mapController = MapController();
  final ParentApiService _apiService = ParentApiService();
  
  late LatLng _selectedPin;
  late TextEditingController _addressController;
  bool _isSaving = false;
  double _geofenceRadiusMeters = 50.0;

  @override
  void initState() {
    super.initState();
    final pickup = _apiService.currentStudent.pickupLocation;
    _selectedPin = LatLng(pickup.latitude, pickup.longitude);
    _addressController = TextEditingController(text: pickup.addressLabel);
    _geofenceRadiusMeters = pickup.geofenceRadiusMeters;
  }

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _handleSaveLocation() async {
    setState(() {
      _isSaving = true;
    });

    final success = await _apiService.updatePickupCoordinates(
      latitude: _selectedPin.latitude,
      longitude: _selectedPin.longitude,
      addressLabel: _addressController.text.trim(),
    );

    setState(() {
      _isSaving = false;
    });

    if (mounted && success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ Pickup location updated & PostGIS geofence synchronized!'),
          backgroundColor: Color(0xFF10B981),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Register Pickup Coordinates',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location, color: Color(0xFF38BDF8)),
            onPressed: () {
              _mapController.move(_selectedPin, 17.0);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Banner Info
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: const Color(0xFF0284C7).withOpacity(0.15),
            child: Row(
              children: const [
                Icon(Icons.info_outline, color: Color(0xFF38BDF8), size: 20),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Drag the marker or tap the map to set your child\'s exact pickup/drop pin. A 50m auto-alert radius will be registered.',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                  ),
                ),
              ],
            ),
          ),

          // Interactive Flutter Map
          Expanded(
            child: Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: _selectedPin,
                    initialZoom: 16.5,
                    onTap: (tapPosition, point) {
                      setState(() {
                        _selectedPin = point;
                      });
                    },
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.saferide.parent',
                    ),
                    // Geofence Visualizer Circle (50m radius)
                    CircleLayer(
                      circles: [
                        CircleMarker(
                          point: _selectedPin,
                          radius: _geofenceRadiusMeters,
                          useRadiusInMeter: true,
                          color: const Color(0xFF3B82F6).withOpacity(0.25),
                          borderColor: const Color(0xFF3B82F6),
                          borderStrokeWidth: 2,
                        ),
                      ],
                    ),
                    // Location Marker Pin
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: _selectedPin,
                          width: 60,
                          height: 60,
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEF4444),
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFFEF4444).withOpacity(0.5),
                                      blurRadius: 10,
                                      spreadRadius: 2,
                                    ),
                                  ],
                                ),
                                child: const Icon(Icons.child_care, color: Colors.white, size: 24),
                              ),
                              const Icon(Icons.arrow_drop_down, color: Color(0xFFEF4444), size: 16),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                // Floating Geofence Radius Badge
                Positioned(
                  top: 16,
                  right: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withOpacity(0.9),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.5)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.radar, color: Color(0xFF38BDF8), size: 16),
                        const SizedBox(width: 6),
                        Text(
                          'Geofence: ${_geofenceRadiusMeters.toInt()}m Radius',
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Bottom Control Panel
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFF1E293B),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
              boxShadow: [
                BoxShadow(color: Colors.black45, blurRadius: 15, offset: Offset(0, -5)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Pickup Address & Coordinates',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    Text(
                      '${_selectedPin.latitude.toStringAsFixed(4)}, ${_selectedPin.longitude.toStringAsFixed(4)}',
                      style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 12, fontFamily: 'monospace'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Address Input Field
                TextField(
                  controller: _addressController,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Enter street address or landmark...',
                    hintStyle: const TextStyle(color: Color(0xFF64748B)),
                    prefixIcon: const Icon(Icons.location_on, color: Color(0xFF38BDF8)),
                    filled: true,
                    fillColor: const Color(0xFF0F172A),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF334155)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF334155)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF38BDF8)),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Save Action Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : _handleSaveLocation,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 4,
                    ),
                    child: _isSaving
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.save, color: Colors.white),
                              SizedBox(width: 8),
                              Text(
                                'Save Pickup Location to System',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                            ],
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
