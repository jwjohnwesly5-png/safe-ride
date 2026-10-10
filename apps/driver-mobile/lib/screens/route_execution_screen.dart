import 'package:flutter/material.dart';
import '../telematics/gps_streamer.dart';

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
  bool _isScanning = false;
  Map<String, dynamic>? _lastScanResult;
  bool _showOverrideModal = false;
  final TextEditingController _pinController = TextEditingController();
  String _overrideReason = 'Direct Sunlight / Glare';

  @override
  void initState() {
    super.initState();
    _telematicsService = GPSStreamer(
      busId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      driverId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    );

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

  void _performBiometricScan({bool testWrongBus = false}) {
    setState(() {
      _isScanning = true;
      _lastScanResult = null;
    });

    Future.delayed(const Duration(milliseconds: 900), () {
      if (!mounted) return;
      final dist = _latestGeofence?.distanceMeters ?? 18.4;
      final isGeofencePass = dist <= 50.0;
      final isBusMatch = !testWrongBus;

      setState(() {
        _isScanning = false;
        if (isBusMatch && isGeofencePass) {
          _lastScanResult = {
            'status': 'VERIFIED',
            'studentName': 'Alex Morgan',
            'confidence': 0.92,
            'busMatch': true,
            'geofenceMatch': true,
            'distance': dist,
            'rosterMatch': true,
          };
        } else {
          _lastScanResult = {
            'status': 'MISMATCH',
            'studentName': testWrongBus ? 'Jordan Lee (Bus 02)' : 'Alex Morgan',
            'confidence': 0.41,
            'busMatch': isBusMatch,
            'geofenceMatch': isGeofencePass,
            'distance': dist,
            'rosterMatch': false,
            'reason': testWrongBus ? 'Student assigned to Bus 02! (Wrong Bus)' : 'Bus outside 50m geofence radius!',
          };
        }
      });
    });
  }

  void _submitManualOverride() {
    if (_pinController.text != '1234') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid Driver PIN! Use 1234 for demo.')),
      );
      return;
    }

    setState(() {
      _showOverrideModal = false;
      _lastScanResult = {
        'status': 'VERIFIED_OVERRIDE',
        'studentName': 'Alex Morgan',
        'confidence': 1.0,
        'busMatch': true,
        'geofenceMatch': true,
        'distance': 18.4,
        'reason': _overrideReason,
      };
      _pinController.clear();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Manual Override Logged: Alex Morgan ($overrideReason)')),
    );
  }

  @override
  void dispose() {
    _telematicsService.dispose();
    _pinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agent 4: Driver Telematics & Vision'),
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
              _isRouteActive ? '● STREAMING (5s)' : '○ IDLE',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: _isRouteActive ? Colors.greenAccent : Colors.amberAccent,
              ),
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Route Control Button
            ElevatedButton.icon(
              onPressed: _toggleRouteTracking,
              icon: Icon(_isRouteActive ? Icons.pause_circle : Icons.play_circle),
              label: Text(_isRouteActive ? 'PAUSE ROUTE TELEMATICS' : 'START BUS 05 ROUTE'),
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
                    const Text('LIVE GPS TELEMETRY STREAM', style: TextStyle(color: Colors.indigoAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Lat: ${_latestCoord?.latitude.toStringAsFixed(5) ?? '12.97000'}', style: const TextStyle(fontSize: 13, fontFamily: 'monospace')),
                        Text('Lng: ${_latestCoord?.longitude.toStringAsFixed(5) ?? '77.59200'}', style: const TextStyle(fontSize: 13, fontFamily: 'monospace')),
                        Text('${((_latestCoord?.speedMps ?? 0) * 3.6).toStringAsFixed(1)} km/h', style: const TextStyle(fontSize: 13, color: Colors.greenAccent, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Geofence Distance Card
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
                        const Text('50m STOP GEOFENCE EVALUATION', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                          child: const Text('Radius: 50m', style: TextStyle(color: Colors.indigoAccent, fontSize: 10)),
                        )
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text('Target Stop: ${_latestGeofence?.stopName ?? 'Oakridge Residence'}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    Text(
                      'Distance to Stop: ${_latestGeofence?.distanceMeters.toStringAsFixed(1) ?? '18.4'} meters',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: (_latestGeofence?.isWithin50m ?? false) ? Colors.greenAccent : Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Biometric Camera Scanner HUD Card
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('BIOMETRIC SCANNER (MobileFaceNet 512-d)', style: TextStyle(color: Colors.indigoAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                        Icon(Icons.camera_alt, color: Colors.indigoAccent, size: 18),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Camera Viewfinder Simulation
                    Container(
                      height: 140,
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _lastScanResult?['status'] == 'VERIFIED' ? Colors.green :
                                 _lastScanResult?['status'] == 'MISMATCH' ? Colors.red : Colors.indigo.withOpacity(0.5),
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: _isScanning
                            ? const Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  CircularProgressIndicator(color: Colors.indigoAccent),
                                  SizedBox(height: 8),
                                  Text('Extracting 512-d Vector...', style: TextStyle(color: Colors.indigoAccent, fontSize: 11, fontFamily: 'monospace')),
                                ],
                              )
                            : Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    _lastScanResult?['status'] == 'VERIFIED' ? Icons.check_circle :
                                    _lastScanResult?['status'] == 'MISMATCH' ? Icons.error : Icons.face,
                                    size: 40,
                                    color: _lastScanResult?['status'] == 'VERIFIED' ? Colors.greenAccent :
                                           _lastScanResult?['status'] == 'MISMATCH' ? Colors.redAccent : Colors.indigoAccent,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _lastScanResult?['status'] == 'VERIFIED' ? 'VERIFIED BOARDING (Alex Morgan)' :
                                    _lastScanResult?['status'] == 'MISMATCH' ? 'MISMATCH FLAGGED' :
                                    'Point Camera at Student',
                                    style: TextStyle(
                                      color: _lastScanResult?['status'] == 'VERIFIED' ? Colors.greenAccent :
                                             _lastScanResult?['status'] == 'MISMATCH' ? Colors.redAccent : Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // 5-Factor MFV Checklist HUD Matrix
                    if (_lastScanResult != null)
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: _lastScanResult!['status'] == 'MISMATCH' ? Colors.red.withOpacity(0.15) : Colors.green.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'MFV SCORE: ${((_lastScanResult!['confidence'] ?? 0) * 100).toStringAsFixed(0)}%',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.white),
                                ),
                                Text(
                                  _lastScanResult!['status'] == 'MISMATCH' ? 'FAIL' : 'PASS (>= 82%)',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 11,
                                    color: _lastScanResult!['status'] == 'MISMATCH' ? Colors.redAccent : Colors.greenAccent,
                                  ),
                                ),
                              ],
                            ),
                            const Divider(color: Colors.white24),
                            Text(
                              _lastScanResult!['status'] == 'MISMATCH'
                                  ? _lastScanResult!['reason'] ?? 'Mismatch'
                                  : '5/5 Factors Passed: Face + Bus ID + Geofence + Roster + Time',
                              style: const TextStyle(fontSize: 10, color: Colors.white70),
                            )
                          ],
                        ),
                      ),
                    const SizedBox(height: 12),

                    // Scan Actions
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _isScanning ? null : () => _performBiometricScan(testWrongBus: false),
                            icon: const Icon(Icons.qr_code_scanner, size: 16),
                            label: const Text('Scan Face', style: TextStyle(fontSize: 11)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _isScanning ? null : () => _performBiometricScan(testWrongBus: true),
                            icon: const Icon(Icons.warning, size: 16, color: Colors.orangeAccent),
                            label: const Text('Wrong Bus Test', style: TextStyle(fontSize: 11, color: Colors.orangeAccent)),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Colors.orangeAccent),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Manual Driver Override Button
                    OutlinedButton.icon(
                      onPressed: () => setState(() => _showOverrideModal = true),
                      icon: const Icon(Icons.shield, size: 16, color: Colors.amberAccent),
                      label: const Text('Driver Manual Override (PIN Fallback)', style: TextStyle(fontSize: 11, color: Colors.amberAccent)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.amberAccent),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),

      // Manual Override Modal Dialog
      bottomSheet: _showOverrideModal
          ? Container(
              color: const Color(0xFF0F172A),
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Driver Manual Boarding Override', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.amberAccent)),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white54),
                        onPressed: () => setState(() => _showOverrideModal = false),
                      ),
                    ],
                  ),
                  const Text('Select mandatory reason and enter Driver PIN (Demo: 1234):', style: TextStyle(fontSize: 11, color: Colors.white70)),
                  const SizedBox(height: 12),
                  DropdownButton<String>(
                    value: _overrideReason,
                    isExpanded: true,
                    dropdownColor: const Color(0xFF1E293B),
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    items: [
                      'Direct Sunlight / Glare',
                      'Face Mask / Glasses Occlusion',
                      'Driver Visually Confirmed Student',
                      'Authorized Emergency Bus Swap',
                    ].map((reason) => DropdownMenuItem(value: reason, child: Text(reason))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _overrideReason = val);
                    },
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _pinController,
                    obscureText: true,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: Colors.amberAccent, letterSpacing: 4, fontWeight: FontWeight.bold),
                    decoration: const InputDecoration(
                      labelText: 'Driver PIN (1234)',
                      labelStyle: TextStyle(color: Colors.white54),
                      enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                      focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.amberAccent)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _submitManualOverride,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, padding: const EdgeInsets.symmetric(vertical: 14)),
                    child: const Text('Authorize & Audit Log Override', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                  )
                ],
              ),
            )
          : null,
    );
  }
}

