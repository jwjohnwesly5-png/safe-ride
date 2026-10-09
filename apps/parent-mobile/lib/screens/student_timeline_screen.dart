import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/parent_api_service.dart';
import '../models/transit_event.dart';

class StudentTimelineScreen extends StatelessWidget {
  const StudentTimelineScreen({Key? key}) : super(key: key);

  Color _getEventColor(EventType type) {
    switch (type) {
      case EventType.geofenceArrival:
        return const Color(0xFF38BDF8);
      case EventType.boardingVerified:
        return const Color(0xFF10B981);
      case EventType.manualOverrideBoarding:
        return const Color(0xFFF59E0B);
      case EventType.dropOffVerified:
        return const Color(0xFF6366F1);
      case EventType.routeStarted:
        return const Color(0xFF94A3B8);
      case EventType.routeEnded:
        return const Color(0xFF64748B);
    }
  }

  IconData _getEventIcon(EventType type) {
    switch (type) {
      case EventType.geofenceArrival:
        return Icons.radar;
      case EventType.boardingVerified:
        return Icons.face;
      case EventType.manualOverrideBoarding:
        return Icons.edit_note;
      case EventType.dropOffVerified:
        return Icons.check_circle;
      case EventType.routeStarted:
        return Icons.play_circle_fill;
      case EventType.routeEnded:
        return Icons.flag;
    }
  }

  @override
  Widget build(BuildContext context) {
    final apiService = ParentApiService();
    final events = apiService.events;
    final timeFormat = DateFormat('hh:mm a');

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Child Transit History & Alerts',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0284C7).withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.history_toggle_off, color: Color(0xFF38BDF8), size: 28),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        apiService.currentStudent.fullName,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Verified Multi-Factor Timeline Log',
                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'Realtime Sync',
                    style: TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.w600, fontSize: 11),
                  ),
                ),
              ],
            ),
          ),

          // Timeline Feed
          Expanded(
            child: events.isEmpty
                ? const Center(
                    child: Text(
                      'No transit events recorded today',
                      style: TextStyle(color: Color(0xFF64748B)),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: events.length,
                    itemBuilder: (context, index) {
                      final event = events[index];
                      final color = _getEventColor(event.type);
                      final icon = _getEventIcon(event.type);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: color.withOpacity(0.3)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: color.withOpacity(0.15),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(icon, color: color, size: 22),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          event.title,
                                          style: TextStyle(
                                            color: color,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                          ),
                                        ),
                                      ),
                                      Text(
                                        timeFormat.format(event.timestamp),
                                        style: const TextStyle(
                                          color: Color(0xFF64748B),
                                          fontSize: 11,
                                          fontFamily: 'monospace',
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    event.description,
                                    style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12),
                                  ),
                                  if (event.mfvFactorsPassed != null) ...[
                                    const SizedBox(height: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF10B981).withOpacity(0.2),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        '✓ ${event.mfvFactorsPassed}',
                                        style: const TextStyle(
                                          color: Color(0xFF34D399),
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
