import 'package:flutter/material.dart';
import 'live_tracking_screen.dart';
import 'location_picker_screen.dart';
import 'student_timeline_screen.dart';

class ParentHomeScreen extends StatefulWidget {
  const ParentHomeScreen({Key? key}) : super(key: key);

  @override
  State<ParentHomeScreen> createState() => _ParentHomeScreenState();
}

class _ParentHomeScreenState extends State<ParentHomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    LiveTrackingScreen(),
    LocationPickerScreen(),
    StudentTimelineScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          border: Border(top: BorderSide(color: Color(0xFF334155), width: 0.5)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          backgroundColor: const Color(0xFF1E293B),
          selectedItemColor: const Color(0xFF38BDF8),
          unselectedItemColor: const Color(0xFF64748B),
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          unselectedLabelStyle: const TextStyle(fontSize: 11),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.map),
              activeIcon: Icon(Icons.map, color: Color(0xFF38BDF8)),
              label: 'Live Tracking',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.edit_location_alt),
              activeIcon: Icon(Icons.edit_location_alt, color: Color(0xFF38BDF8)),
              label: 'Set Pickup Pin',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.history),
              activeIcon: Icon(Icons.history, color: Color(0xFF38BDF8)),
              label: 'Transit History',
            ),
          ],
        ),
      ),
    );
  }
}
