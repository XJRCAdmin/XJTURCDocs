# CMake

CMake是一个跨平台的编译(Build)工具,可以用简单的语句来描述所有平台的编译过程。

CMake能够输出各种各样的makefile或者project文件，能测试编译器所支持的C++特性,类似UNIX下的automake。

假如我们有一个ROS2框架的部分工程列表，里面有超过40个互相调用的工程共同组成，一些用于生成库文件，一些用于实现逻辑功能。他们之间的调用关系复杂而严格，如果我想在这样复杂的框架下进行二次开发，显然只拥有它的源码是远远不够的，还需要清楚的明白这几十个项目之间的复杂关系，在没有原作者的帮助下进行这项工作几乎是不可能的。像这样的信息被cmake写在了**CMakeLists.txt**中。

CMake通过**CMakeLists.txt** 文件来描述项目的构建过程，用户可以在这个文件中定义源代码、库、头文件、编译选项等信息，从而让CMake自动生成相应的构建文件。
![](images/Pasted%20image%2020250801133829.png)
# install
在ubuntu上：
```bash
$ sudo apt-get install build-essential
$ sudo apt-get install cmake
```
# simple instance
此示例显示如何生成make install目标以在您的系统上安装文件和二进制文件。

```bash
.
├── cmake-examples.conf
├── CMakeLists.txt
├── include
│   └── installing
│       └── Hello.h
├── README.adoc
└── src
    ├── Hello.cpp
    └── main.cpp
```
它的CMakeLists.txt是：
```cmake
cmake_minimum_required(VERSION 3.5)
# 项目名称
project(cmake_examples_install)

############################################################
# Create a library
############################################################

#Generate the shared library from the library sources 创建共享库
add_library(cmake_examples_inst SHARED
    src/Hello.cpp
)
# 共享库的include路径 PUBLIC作用域表示路径被库自身编译使用，同时传递给链接此库的目标，这里的target指的是add_library生成的共享库
target_include_directories(cmake_examples_inst
    PUBLIC 
        ${PROJECT_SOURCE_DIR}/include
)

############################################################
# Create an executable
############################################################

# Add an executable with the above sources
add_executable(cmake_examples_inst_bin
    src/main.cpp
)

# link the new hello_library target with the hello_binary target，target指的是上一句话的exec target
target_link_libraries( cmake_examples_inst_bin
    PRIVATE 
        cmake_examples_inst
)

############################################################
# Install
############################################################

# Binaries
install (TARGETS cmake_examples_inst_bin
    DESTINATION bin)

# Library
# Note: may not work on windows
install (TARGETS cmake_examples_inst
    LIBRARY DESTINATION lib)

# Header files
install(DIRECTORY ${PROJECT_SOURCE_DIR}/include/ 
    DESTINATION include)

# Config
install (FILES cmake-examples.conf
    DESTINATION etc)
```

这里涉及到许多语法，部分的语法列在下面。具体请参考cmake官方教程，这里只是简要写一写。

- `cmake_minimum_required(VERSION 3.12)` 指定cmake的版本，通常在3.12以上。
- `project()`指定cmake的项目名称，赋值后保存在`PROJECT_NAME`中。
- `add_executable()` 使用指定的源文件将可执行文件添加到项目中。通常是关键的一句，在项目中必须是全局的、唯一的。

可执行文件和库在 CMake 中统称为「目标（targets）」。我们将频繁遇到“目标”这个术语。在 CMake 中，目标是传递给 `add_executable` 或 `add_library` 的第一个参数。

- `target_link_libraries(libA PUBLIC zlib)`: `<target>` 是由 `add_executable()` 或 `add_library()` 创建的目标，表示你要为哪个目标设置链接依赖（不能是 ALIAS 目标），这里表示为`libA <- zlib`，将A链接zlib，其中`public`是`scoped`关键字，意思是当前目标链接依赖zlib，之后如果有B链接A，会将A的依赖`zlib`传递给链后的目标B使用。
- `target_include_directories(my_lib PUBLIC my_lib/public_headers)` 用来方便查找target的头文件。


- `message(STATUS "I am here!")`打印消息，没别的。
- `set(MY_VARIABLE "some value")`设置变量。
	- `CMAKE_CURRENT_LIST_DIR`：表示当前正在处理的 CMake 列表文件所在的目录。由于其具有动态作用域，在宏或函数内部，它代表调用栈中最底部入口文件的目录，而非宏或函数定义所在文件的目录。
	- `PROJECT_SOURCE_DIR`：表示当前项目的源代码根目录，也就是最近一次调用 `project()` 的源码位置。
	- `PROJECT_BINARY_DIR`：表示项目的构建目录，是最近一次 `project()` 命令所在的二进制输出路径。
- `find_package(OpenMP 4.5 REQUIRED COMPONENTS CXX)`重要的方法，这里这句话的意思是找到不低于4.5的openmp，未找到立刻失败，采用其组件CXX进行导入，具体语法请查阅官方文档。
- `find_library()`:查找外部库文件的基础命令，优先在 `/usr/local/lib` 和 `/usr/lib` 中搜寻。

还有一些方法暂不举出，大部分时候是查阅官方文档或者直接询问chat老师。
# HomeWork

#  值得阅读的教程与文献
- 一个cmake项目的“标准”结构——[github repository](https://github.com/kigster/cmake-project-template)
- [From sources to executables — CMake Workshop documentation](https://coderefinery.github.io/cmake-workshop/hello-cmake/)的HANDS ON WORKSHOP部分。
- [github上的learning cmake](https://github.com/ttroy50/cmake-examples/blob/master)
- [CMake Tutorial — CMake 4.1.0-rc4 Documentation](https://cmake.org/cmake/help/latest/guide/tutorial/)
- [IPADS新人培训第二讲：CMake_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV14h41187FZ?vd_source=7bd9495d31281f143b7b2db3418d2f17&spm_id_from=333.788.videopod.sections)