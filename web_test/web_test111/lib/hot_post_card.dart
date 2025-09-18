import 'package:flutter/material.dart';

class HotPostCard extends StatelessWidget {
  final int index;
  const HotPostCard({super.key, required this.index});

  @override
  Widget build(BuildContext context) {
    final List<String> images = [
      'assets/images/thumbnail280.jpg',
      'assets/images/thumbnail_1758096686346.jpg',
      'assets/images/thumbnail_1758096686398.jpg',
    ];
    final List<String> titles = ['App 聊天墙', '论坛热帖', '后台总管'];
    return Card(
      elevation: 4,
      margin: const EdgeInsets.only(right: 16),
      child: SizedBox(
        width: 180,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(8),
                ),
                child: Image.asset(
                  images[index % images.length],
                  fit: BoxFit.cover,
                  width: double.infinity,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                titles[index % titles.length],
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8.0),
              child: Text('用户手机端上传的热帖内容', style: TextStyle(fontSize: 12)),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
