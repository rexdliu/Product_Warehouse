import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:warehouse_mobile/core/di/injection.dart';
import 'package:warehouse_mobile/presentation/blocs/auth/auth_bloc.dart';
import 'package:warehouse_mobile/presentation/blocs/product/product_bloc.dart';
import 'package:warehouse_mobile/routes/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 初始化依赖注入
  await configureDependencies();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => getIt<AuthBloc>(),
        ),
        BlocProvider(
          create: (context) => getIt<ProductBloc>(),
        ),
        // 添加其他 BLoC
      ],
      child: MaterialApp.router(
        title: 'Product Warehouse',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),
        routerConfig: AppRouter.router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
