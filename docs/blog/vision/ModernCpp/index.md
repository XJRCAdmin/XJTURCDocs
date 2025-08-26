# Modern C++

> 本文开篇将快速过一遍C++的基础语法，从类与对象开始逐渐深入，最后涉及现代C++（C++17之后）的语法特性。

当然，C++的书大几百万字，您也无法在本教程中完全掌握C++，因而本教程只能尽可能的带您遍览一遍C++的语法特性。

# C++ 基础
- 数据类型 `bool` `char` `int` `float` `double` `void`（无类型）
- 修饰符 `signed` unsigned short(2 byte) long(8 byte) const。volatile(表示变量可能被意外修改，禁止编译器优化，确保每次从内存中去读取) `mutable`(表示类成员可以在 `const` 对象中修改,但有些变量只是辅助用途，并不是对象核心状态,所以可以修改。)

数组 指针 引用 函数 结构体 类等请详见 [C++ 类 & 对象 | 菜鸟教程](https://www.runoob.com/cplusplus/cpp-classes-objects.html)
## 函数
函数中值得一提的是lambda 表达式：
	Lambda 表达式把函数看作对象。Lambda 表达式可以像对象一样使用，比如可以将它们赋给变量和作为参数传递，还可以像函数一样对其求值。

```cpp
[capture](parameters)->return-type{body}
```
- `[capture]` 是捕获列表，指定了lambda的传入值的方式，有引用传值，常见的有`[&]`和`[=]` ，分别代表这按值捕获和按引用捕获外部变量。

- `[parameter]` 是参数列表，用于表示 Lambda表达式的参数，可以为空，表示没有参数，也可以和普通函数一样指定参数的类型和名称，还可以在 c++14 中使用 `auto` 关键字来实现泛型参数。
- `[return type]` 是返回值类型，用于指定 Lambda表达式的返回值类型，可以省略，表示由编译器根据函数体推导，也可以使用 -> 符号显式指定，还可以在 c++14 中使用 auto 关键字来实现泛型返回值。
-  `[body]` 是函数体，用于表示 Lambda表达式的具体逻辑，可以是一条语句，也可以是多条语句，还可以在 c++14 中使用 constexpr 来实现编译期计算。

```cpp
auto lambdaTest() -> void {
  int x = 10;
  auto lambda = [&](int a) -> int { int z = x + a; x++ ;return z + x;};
  std::cout << lambda(1) << std::endl;
  std::cout << "lambda Test End" << std::endl; // 输出22
}

auto modern_main() -> void {
  lambdaTest();
}
```

想要学习lambda，上述内容仍远不及，参考：
- [深入浅出 C++ Lambda表达式：语法、特点和应用_lamda表达式-CSDN博客](https://blog.csdn.net/m0_60134435/article/details/136151698)
- 
# 移动语义
一个应用场景是锁，当对象A和B都有机会获得对于C的写入/读取锁时，A获得锁后，B若已经有锁，则A需要从B中拿锁，B的锁将销毁。
- [一文入魂：妈妈再也不担心我不懂C++移动语义了 - 知乎](https://zhuanlan.zhihu.com/p/455848360)
- [ c++ 左值引用与右值引用 - 知乎](https://zhuanlan.zhihu.com/p/97128024)
# RAII
