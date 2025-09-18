import 'package:flutter/material.dart';

class FactionChip extends StatelessWidget {
  final int index;
  const FactionChip({super.key, required this.index});

  @override
  Widget build(BuildContext context) {
    final List<String> factions = ['技术派', '娱乐派', '学习派', '美食派', '运动派'];
    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: Chip(
        label: Text(factions[index % factions.length]),
        backgroundColor: Colors.blue.shade100,
      ),
    );
  }
}
