import 'package:flutter/material.dart';
import 'screens/route_execution_screen.dart';

void main() {
  runApp(const SafeRideDriverApp());
}

class SafeRideDriverApp extends StatelessWidget {
  const SafeRideDriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SafeRide Driver Telematics (Agent 3)',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF090D16),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6366F1),
          secondary: Color(0xFF10B981),
        ),
      ),
      home: const RouteExecutionScreen(),
    );
  }
}
