import 'package:flutter/material.dart';
import 'forum_home_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  String _emailOrPhone = '';
  String _password = '';
  bool _isLoading = false;
  String? _error;

  void _submit() {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
      // TODO: 调用后端API进行登录，此处为演示
      Future.delayed(const Duration(seconds: 1), () {
        setState(() {
          _isLoading = false;
        });
        if (_emailOrPhone == 'demo' && _password == '123456') {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const ForumHomePage()),
          );
        } else {
          setState(() {
            _error = '账号或密码错误';
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('用户登录')),
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    decoration: const InputDecoration(
                      labelText: '邮箱或手机号',
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (v) => _emailOrPhone = v,
                    validator: (v) =>
                        v == null || v.isEmpty ? '请输入邮箱或手机号' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    decoration: const InputDecoration(
                      labelText: '密码',
                      border: OutlineInputBorder(),
                    ),
                    obscureText: true,
                    onChanged: (v) => _password = v,
                    validator: (v) => v == null || v.isEmpty ? '请输入密码' : null,
                  ),
                  const SizedBox(height: 24),
                  if (_error != null)
                    Text(_error!, style: const TextStyle(color: Colors.red)),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      child: _isLoading
                          ? const CircularProgressIndicator()
                          : const Text('登录'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
