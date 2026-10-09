import 'package:flutter/material.dart';
import '../services/parent_api_service.dart';

class SosModal extends StatefulWidget {
  const SosModal({Key? key}) : super(key: key);

  @override
  State<SosModal> createState() => _SosModalState();
}

class _SosModalState extends State<SosModal> {
  final TextEditingController _reasonController = TextEditingController();
  bool _isSending = false;
  String _selectedQuickReason = 'Bus delayed without update';

  final List<String> _quickReasons = [
    'Bus delayed without update',
    'Wrong route taken',
    'Child missing from stop',
    'Medical emergency alert',
    'Driver unreachable',
  ];

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _triggerSos() async {
    setState(() {
      _isSending = true;
    });

    final reason = _reasonController.text.trim().isNotEmpty
        ? _reasonController.text.trim()
        : _selectedQuickReason;

    await ParentApiService().sendEmergencySOS(reason);

    setState(() {
      _isSending = false;
    });

    if (mounted) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🚨 PRIORITY SOS DISPATCHED to School Safety Hub & Bus Supervisor!'),
          backgroundColor: Color(0xFFEF4444),
          duration: Duration(seconds: 4),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444), size: 28),
                SizedBox(width: 10),
                Text(
                  'Emergency SOS Dispatch',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Text(
              'This will instantly trigger a high-priority alert to the School Safety Desk and Driver dispatch console.',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
            ),
            const SizedBox(height: 16),
            const Text(
              'Select Quick Reason:',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
            ),
            const SizedBox(height: 8),

            // Quick Reasons Wrap
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: _quickReasons.map((reason) {
                final isSelected = _selectedQuickReason == reason;
                return ChoiceChip(
                  label: Text(
                    reason,
                    style: TextStyle(
                      color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                      fontSize: 11,
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: const Color(0xFFDC2626),
                  backgroundColor: const Color(0xFF0F172A),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _selectedQuickReason = reason;
                      });
                    }
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 12),
            TextField(
              controller: _reasonController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Additional details (optional)...',
                hintStyle: const TextStyle(color: Color(0xFF64748B)),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
              ),
            ),
            const SizedBox(height: 20),

            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Cancel', style: TextStyle(color: Color(0xFF94A3B8))),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isSending ? null : _triggerSos,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFDC2626),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _isSending
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Text(
                            'DISPATCH SOS',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
