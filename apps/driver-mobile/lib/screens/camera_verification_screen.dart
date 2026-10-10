import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'dart:async';

class CameraVerificationScreen extends StatefulWidget {
  final bool isWithinGeofence;
  final String busId;

  const CameraVerificationScreen({
    super.key,
    required this.isWithinGeofence,
    required this.busId,
  });

  @override
  State<CameraVerificationScreen> createState() => _CameraVerificationScreenState();
}

class _CameraVerificationScreenState extends State<CameraVerificationScreen> {
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  bool _isProcessing = false;
  
  // HUD Status
  Color _hudColor = Colors.transparent;
  String _hudMessage = "SCANNING...";

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras != null && _cameras!.isNotEmpty) {
        // Prefer front camera for student scanning as they board
        final camera = _cameras!.firstWhere(
          (c) => c.lensDirection == CameraLensDirection.front,
          orElse: () => _cameras!.first,
        );

        _cameraController = CameraController(
          camera,
          ResolutionPreset.medium,
          enableAudio: false,
        );

        await _cameraController!.initialize();
        if (mounted) {
          setState(() {});
        }
      }
    } catch (e) {
      debugPrint("Camera initialization error: $e");
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  // --- 5-Factor Verification Engine (Agent 4) ---
  Future<void> _run5FactorVerification(bool isFaceMatch) async {
    if (_isProcessing) return;

    setState(() {
      _isProcessing = true;
      _hudMessage = "EXTRACTING 512-D VECTOR (MobileFaceNet)...";
      _hudColor = Colors.blue.withOpacity(0.3);
    });

    // Simulate 300ms TFLite extraction latency
    await Future.delayed(const Duration(milliseconds: 300));

    // Factor 1: Face Vector Cosine Similarity
    bool factor1Face = isFaceMatch;
    // Factor 2: Bus ID match (Supports both bus-05 identifier and database UUID)
    bool factor2Bus = widget.busId == 'bus-05' || 
                      widget.busId == 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44' || 
                      widget.busId.toLowerCase().contains('bus');
    // Factor 3: Driver GPS within Stop Geofence
    bool factor3Geofence = widget.isWithinGeofence;
    // Factor 4: Student on current Stop Roster (Simulated True)
    bool factor4Roster = true;
    // Factor 5: Active Route Schedule Window (Simulated True)
    bool factor5Time = true;

    bool isVerified = factor1Face && factor2Bus && factor3Geofence && factor4Roster && factor5Time;

    setState(() {
      if (isVerified) {
        _hudColor = Colors.green.withOpacity(0.6);
        _hudMessage = "BOARDING VERIFIED ✓";
        // Here we would emit the BOARDING_VERIFIED event to DB/Agent 5
      } else {
        _hudColor = Colors.red.withOpacity(0.6);
        String reason = "";
        if (!factor1Face) reason = "Face Mismatch";
        else if (!factor3Geofence) reason = "Not at Registered Stop";
        else reason = "Verification Failed";
        
        _hudMessage = "MISMATCH / WRONG BUS ✕\n($reason)";
      }
    });

    await Future.delayed(const Duration(seconds: 3));

    if (mounted) {
      setState(() {
        _isProcessing = false;
        _hudColor = Colors.transparent;
        _hudMessage = "SCANNING...";
      });
    }
  }

  // --- Manual Override Fallback ---
  void _triggerManualOverride() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        String pin = "";
        String reason = "Lighting condition";
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF1E293B),
              title: const Text("MANUAL OVERRIDE", style: TextStyle(color: Colors.amberAccent)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text("Enter Driver PIN to override verification:", style: TextStyle(color: Colors.white70)),
                  const SizedBox(height: 10),
                  TextField(
                    obscureText: true,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      filled: true,
                      fillColor: Colors.black26,
                      hintText: "****",
                      hintStyle: TextStyle(color: Colors.white30),
                    ),
                    onChanged: (val) => pin = val,
                  ),
                  const SizedBox(height: 16),
                  const Text("Mandatory Audit Reason:", style: TextStyle(color: Colors.white70)),
                  DropdownButton<String>(
                    value: reason,
                    dropdownColor: const Color(0xFF0F172A),
                    isExpanded: true,
                    items: ["Lighting condition", "Face covered", "System error", "Guest student"]
                        .map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(color: Colors.white))))
                        .toList(),
                    onChanged: (val) => setDialogState(() => reason = val!),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text("CANCEL", style: TextStyle(color: Colors.white54)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.amber.shade700),
                  onPressed: () {
                    // Log the override audit event here
                    Navigator.pop(context);
                    setState(() {
                      _hudColor = Colors.amber.withOpacity(0.6);
                      _hudMessage = "OVERRIDE AUTHORIZED ✓\nReason: $reason";
                    });
                    Future.delayed(const Duration(seconds: 3), () {
                      if (mounted) {
                        setState(() {
                          _hudColor = Colors.transparent;
                          _hudMessage = "SCANNING...";
                        });
                      }
                    });
                  },
                  child: const Text("AUTHORIZE"),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Camera Preview or Simulation Viewfinder Fallback
          if (_cameraController != null && _cameraController!.value.isInitialized)
            CameraPreview(_cameraController!)
          else
            Container(
              color: const Color(0xFF0F172A),
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.camera_front, size: 64, color: Colors.indigoAccent),
                    SizedBox(height: 12),
                    Text(
                      "AI Vision Viewfinder (Simulation Active)",
                      style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),

          // 2. HUD Overlay
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            color: _hudColor,
          ),

          // 3. UI Elements
          SafeArea(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Top Bar
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.white, size: 30),
                        onPressed: () => Navigator.pop(context),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: widget.isWithinGeofence ? Colors.green : Colors.red),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              widget.isWithinGeofence ? Icons.location_on : Icons.location_off,
                              color: widget.isWithinGeofence ? Colors.greenAccent : Colors.redAccent,
                              size: 16,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              widget.isWithinGeofence ? "GEOFENCE ACTIVE" : "OUTSIDE STOP",
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Center Message
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.black87,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _hudMessage,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),

                // Bottom Controls
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.green.shade700),
                            onPressed: _isProcessing ? null : () => _run5FactorVerification(true),
                            child: const Text("Simulate Face MATCH"),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade700),
                            onPressed: _isProcessing ? null : () => _run5FactorVerification(false),
                            child: const Text("Simulate NO MATCH"),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      TextButton.icon(
                        icon: const Icon(Icons.admin_panel_settings, color: Colors.amberAccent),
                        label: const Text("DRIVER MANUAL OVERRIDE", style: TextStyle(color: Colors.amberAccent)),
                        onPressed: _triggerManualOverride,
                      )
                    ],
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
