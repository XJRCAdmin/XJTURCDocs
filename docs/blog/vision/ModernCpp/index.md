---
title: "C++ 一些现代语法"
---
# 一些现代C++语法
!!! info "提示"
    推荐阅读c++官方文档

# C++ 基础
## 函数
函数中值得一提的是lambda 表达式：
	Lambda 表达式把函数看作对象。Lambda 表达式可以像对象一样使用，比如可以将它们赋给变量和作为参数传递，还可以像函数一样对其求值。

```cpp
[capture](parameters)->return-type{body}
```
[capture]指定了lambda的传入值的方式，有引用传值，常见的有`[&]`和`[=]` ，分别代表这按值捕获和按引用捕获外部变量。
```cpp
int x = 10
cout<<x<<endl;
[&](int x, int y) -> int { int z = x + y; x++;return z + x;} 
// x加了1
cout<<x<<endl; //x = 11
```
# 类与对象
