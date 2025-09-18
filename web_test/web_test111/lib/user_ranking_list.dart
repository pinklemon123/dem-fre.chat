import 'package:flutter/material.dart';

class UserRankingList extends StatelessWidget {
  const UserRankingList({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> users = [
      {'name': 'Alice', 'score': 1200},
      {'name': 'Bob', 'score': 1100},
      {'name': 'Carol', 'score': 950},
    ];
    return Column(
      children: users.asMap().entries.map((entry) {
        int rank = entry.key + 1;
        var user = entry.value;
        return ListTile(
          leading: CircleAvatar(child: Text('$rank')),
          title: Text(user['name']),
          trailing: Text('积分：${user['score']}'),
        );
      }).toList(),
    );
  }
}
