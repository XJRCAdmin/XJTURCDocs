---
title: 程序的启动与调试
date: 2026-08-14
description: 使用 launch.json、Batch、Bash、CMake Presets 和配置文件建立可重复的启动、调试、构建与自启动流程。
---

# 程序的启动与调试

一个项目不应该依赖成员从聊天记录中复制长命令，也不应该要求每个人重新输入相同的启动参数。项目完成基本调试后，应把稳定的编译选项、运行参数和启动顺序保存下来，让其他成员能够通过一条命令或一个 VS Code 配置得到相同结果。

本章把程序从源码到运行的过程分为四层：

| 层级 | 推荐方式 | 负责的内容 |
| --- | --- | --- |
| 调试启动 | `.vscode/tasks.json`、`.vscode/launch.json` | 调试前构建、可执行文件、参数、环境和 GDB |
| 重复命令 | Batch 或 Bash 脚本 | 配置、编译、测试和一键运行 |
| 构建配置 | `CMakePresets.json` | 编译类型、生成器、构建目录和 CMake 变量 |
| 部署启动 | `systemd`、Windows 任务计划程序或 ROS 2 launch | 开机自启动、多进程编排和故障重启 |

它们互相配合，但不能互相替代。例如，`launch.json` 可以启动调试器，却不能代替正式部署时的服务管理。

!!! note "修改 JSON 后是否需要重新编译？"
    修改 `launch.json` 中的 `args`、`cwd`、环境变量或调试器设置，通常不需要重新编译，因为这些设置在程序启动时才生效。

    修改源码、`CMakeLists.txt`、编译宏、编译器选项、链接库或 `CMakePresets.json` 中的构建变量后，仍然需要重新配置或编译。JSON 负责保存配置，但不会代替编译过程。

## 1. 统一规范

视觉组项目应尽量满足以下要求：

1. 新成员不需要手动输入一长串编译或启动参数；
2. 公共构建配置和启动方式应提交到 Git；
3. 从项目根目录执行一条命令即可构建或启动；
4. VS Code 中按 `F5` 可以构建并调试指定程序；
5. 稳定参数写入配置文件，临时覆盖参数才放在命令行；
6. 密钥、个人路径和设备凭据不得提交；
7. README 应说明构建入口、启动入口、配置文件和验证方法；
8. CI、终端和 VS Code 应尽量复用同一套底层命令；
9. 自启动应由操作系统的服务管理工具负责，并保留日志和停止方法。

推荐目录结构：

```text
project/
├── .vscode/
│   ├── launch.json
│   └── tasks.json
├── scripts/
│   ├── build.bat               # Windows 构建
│   ├── run.bat                 # Windows 启动
│   ├── build.sh                # Linux 构建
│   └── run.sh                  # Linux 启动
├── CMakeLists.txt
├── CMakePresets.json
├── CMakeUserPresets.json       # 个人配置，不提交
├── config/
│   ├── default.json            # 普通程序配置示例
│   └── vision.yaml             # ROS 2 参数示例
├── launch/
│   └── vision.launch.py        # ROS 2 多节点启动
└── README.md
```

并非每个项目都需要所有文件。普通 C++ 程序可以没有 `launch/`，只运行在 Ubuntu 的项目也不需要 Batch 脚本。

## 2. 先分清三类参数

判断参数应该写在哪里时，先确认它在什么时候生效。

### 2.1 运行参数

运行参数在程序启动时读取，例如：

- 相机编号、配置文件和模型路径；
- 日志等级；
- 输入视频、网络地址和端口；
- 是否启用某个运行时功能。

调试时可以把少量参数写入 `launch.json` 的 `args`。数量较多且长期稳定的参数应写入 `config/*.json`、`*.yaml` 或 `*.toml`，再由调试配置或脚本传入配置文件路径。只修改运行参数通常不需要重新编译。

### 2.2 调试器参数

断点、GDB、停止入口、附加进程和调试控制台属于调试器配置，应写入 `.vscode/launch.json`。它们不应该成为程序本身的业务逻辑。

### 2.3 构建参数

构建参数决定程序如何被编译，例如：

- 使用 `Debug` 还是 `Release`；
- 使用 GCC 还是 Clang；
- 是否启用测试、日志或某个可选模块；
- 头文件、库、SDK 和工具链的位置。

这些内容应写入 `CMakePresets.json` 或 `CMakeLists.txt`。修改后通常需要重新配置或编译。

## 3. 用 launch.json 保存调试启动方式

安装 VS Code 的 C/C++ 扩展后，在项目根目录创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug vision_app",
      "type": "cppdbg",
      "request": "launch",
      "program": "${workspaceFolder}/build/debug/bin/vision_app",
      "args": [
        "--config",
        "${workspaceFolder}/config/default.json",
        "--log-level",
        "debug"
      ],
      "cwd": "${workspaceFolder}",
      "environment": [
        {
          "name": "RC_LOG_COLOR",
          "value": "1"
        }
      ],
      "stopAtEntry": false,
      "externalConsole": false,
      "MIMode": "gdb",
      "miDebuggerPath": "/usr/bin/gdb",
      "setupCommands": [
        {
          "description": "Enable GDB pretty-printing",
          "text": "-enable-pretty-printing",
          "ignoreFailures": true
        }
      ],
      "preLaunchTask": "cmake: build debug"
    }
  ]
}
```

需要按项目实际情况修改的主要字段：

| 字段 | 含义 | 修改后是否需要重新编译 |
| --- | --- | --- |
| `program` | 要调试的可执行文件 | 否，但目标必须已经存在 |
| `args` | 传给程序的命令行参数 | 通常不需要 |
| `cwd` | 程序工作目录 | 不需要 |
| `environment` | 本次运行的环境变量 | 通常不需要 |
| `preLaunchTask` | 调试前执行的任务 | 取决于任务内容 |
| `MIMode` | 使用 GDB 或 LLDB | 不需要 |

在 VS Code 左侧打开“运行和调试”，选择 `Debug vision_app` 后按 `F5`。VS Code 会依次配置、构建并启动 GDB。

!!! tip "launch.json 不是部署入口"
    `launch.json` 只有 VS Code 能直接使用。项目还应提供脚本或 ROS 2 launch，供 SSH 终端、机器人主机和自动化环境调用。

## 4. 用 Batch 和 Bash 保存重复命令

脚本适合固化每天都会执行的命令，例如配置、编译、测试、设置环境和启动程序。它解决的是“如何重复执行同一套操作”，而配置文件解决的是“程序使用哪些参数”。

### 4.1 Windows：Batch 脚本

Windows 下可以使用 `.bat` 或 `.cmd` 文件保存重复命令。创建 `scripts\build.bat`：

```bat
@echo off
setlocal

set "PROJECT_DIR=%~dp0.."
pushd "%PROJECT_DIR%" || exit /b 1

cmake --preset release || goto :error
cmake --build --preset release || goto :error
ctest --preset release || goto :error

popd
exit /b 0

:error
set "EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %EXIT_CODE%
```

创建 `scripts\run.bat`：

```bat
@echo off
setlocal

set "PROJECT_DIR=%~dp0.."

"%PROJECT_DIR%\build\release\bin\vision_app.exe" ^
  --config "%PROJECT_DIR%\config\default.json" ^
  %*

exit /b %ERRORLEVEL%
```

运行：

```bat
scripts\build.bat
scripts\run.bat
scripts\run.bat --log-level debug
```

其中：

- `%~dp0` 表示当前 Batch 脚本所在目录；
- `setlocal` 避免脚本修改调用者的环境变量；
- `pushd` 和 `popd` 用于安全切换并恢复工作目录；
- `|| goto :error` 在某一步失败后立即停止；
- `%*` 把额外参数继续传给最终程序；
- `^` 表示命令在下一行继续。

不要在 Batch 脚本中写死某位成员的用户目录，也不要把密码或密钥写入脚本。

### 4.2 Linux：Bash 脚本

创建 `scripts/build.sh`：

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd -- "${script_dir}/.." && pwd)"

cd "${project_dir}"
cmake --preset release
cmake --build --preset release
ctest --preset release
```

创建 `scripts/run.sh`：

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd -- "${script_dir}/.." && pwd)"

exec "${project_dir}/build/release/bin/vision_app" \
  --config "${project_dir}/config/default.json" \
  "$@"
```

赋予执行权限：

```bash
chmod +x scripts/build.sh scripts/run.sh
```

之后只需要：

```bash
./scripts/build.sh
./scripts/run.sh
```

需要临时覆盖的参数仍可追加在脚本后面：

```bash
./scripts/run.sh --log-level debug
```

脚本根据自身位置寻找项目根目录，因此不依赖当前终端所在目录。`exec` 让最终程序直接接收终端信号，便于使用 `Ctrl+C` 正常停止。

### 4.3 Batch 和 Bash 的使用边界

| 需求 | 推荐方案 |
| --- | --- |
| Ubuntu、NUC、机器人主机 | Bash `*.sh` |
| Windows 本地开发 | Batch `*.bat` 或 PowerShell `*.ps1` |
| 同时支持 Windows 和 Linux | 分别提供 `build.bat`、`build.sh`，底层共同调用 CMake Preset |
| 需要复杂数据结构 | JSON、YAML 或 TOML 配置文件 |
| 需要开机运行和失败重启 | systemd 或 Windows 任务计划程序调用脚本 |

脚本不应复制两套独立的构建逻辑。Windows 和 Linux 脚本都调用相同名字的 CMake Preset，避免两边行为逐渐不同。

## 5. 用 CMake Presets 保存构建方式

过去常见的做法是每次输入：

```bash
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Debug -DBUILD_TESTING=ON
cmake --build build --parallel
ctest --test-dir build --output-on-failure
```

参数较多时容易漏写。CMake 官方提供 `CMakePresets.json`，用于保存团队共享的配置、构建和测试预设。

在项目根目录创建：

```json
{
  "version": 4,
  "cmakeMinimumRequired": {
    "major": 3,
    "minor": 23,
    "patch": 0
  },
  "configurePresets": [
    {
      "name": "debug",
      "displayName": "Debug",
      "generator": "Ninja",
      "binaryDir": "${sourceDir}/build/debug",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "Debug",
        "CMAKE_EXPORT_COMPILE_COMMANDS": "ON",
        "BUILD_TESTING": "ON"
      }
    },
    {
      "name": "release",
      "displayName": "Release",
      "generator": "Ninja",
      "binaryDir": "${sourceDir}/build/release",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "Release",
        "CMAKE_EXPORT_COMPILE_COMMANDS": "ON",
        "BUILD_TESTING": "ON"
      }
    }
  ],
  "buildPresets": [
    {
      "name": "debug",
      "configurePreset": "debug",
      "jobs": 0
    },
    {
      "name": "release",
      "configurePreset": "release",
      "jobs": 0
    }
  ],
  "testPresets": [
    {
      "name": "debug",
      "configurePreset": "debug",
      "output": {
        "outputOnFailure": true
      }
    },
    {
      "name": "release",
      "configurePreset": "release",
      "output": {
        "outputOnFailure": true
      }
    }
  ]
}
```

之后统一使用：

```bash
cmake --preset debug
cmake --build --preset debug
ctest --preset debug
```

`CMakePresets.json` 保存团队公共配置，应提交到 Git。个人编译器路径、本机 SDK 路径等配置放在 `CMakeUserPresets.json`，并将它加入 `.gitignore`：

```gitignore
CMakeUserPresets.json
```

!!! warning "不要把运行参数编译进程序"
    相机曝光、输入文件、日志等级等运行时数据不应通过 CMake `-D` 选项编译进程序。否则每次调整现场参数都要重新编译，也难以确认实际使用了哪套配置。

如果项目需要执行“配置、构建、测试、打包”的完整流水线，可以进一步使用 CMake Workflow Preset。初学者先统一配置、构建和测试预设即可。

## 6. 用 tasks.json 连接构建和调试

VS Code 的 `tasks.json` 用来描述构建、测试等任务。下面的任务先配置 CMake，再构建 Debug 版本。

创建 `.vscode/tasks.json`：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "cmake: configure debug",
      "type": "shell",
      "command": "cmake",
      "args": ["--preset", "debug"],
      "options": {
        "cwd": "${workspaceFolder}"
      },
      "problemMatcher": []
    },
    {
      "label": "cmake: build debug",
      "type": "shell",
      "command": "cmake",
      "args": ["--build", "--preset", "debug"],
      "options": {
        "cwd": "${workspaceFolder}"
      },
      "dependsOn": "cmake: configure debug",
      "dependsOrder": "sequence",
      "problemMatcher": ["$gcc"],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "ctest: debug",
      "type": "shell",
      "command": "ctest",
      "args": ["--preset", "debug"],
      "options": {
        "cwd": "${workspaceFolder}"
      },
      "problemMatcher": []
    }
  ]
}
```

按 `Ctrl+Shift+B` 即可运行默认构建任务。`launch.json` 还可以通过 `preLaunchTask` 在调试前调用同一个任务。

## 7. 用配置文件保存大量运行参数

`launch.json` 适合保存“使用哪套配置”以及少量临时参数，不适合堆放几十个算法参数。普通程序可以使用 JSON，例如 `config/default.json`：

```json
{
  "camera": {
    "device": "/dev/video0",
    "width": 1280,
    "height": 1024,
    "exposure_us": 3000
  },
  "detector": {
    "model": "models/armor.onnx",
    "confidence_threshold": 0.6
  },
  "logging": {
    "level": "info"
  }
}
```

程序只接收配置文件路径：

```bash
./build/release/bin/vision_app --config config/default.json
```

配置文件应遵循以下要求：

- 仓库保存一份能够运行的默认配置；
- 不同设备使用有意义的文件名，例如 `nuc.json`、`m4.json`；
- 程序启动时校验必填字段、数据类型、范围和文件路径；
- 启动日志打印实际读取的配置文件和关键参数；
- 遇到未知字段应报错，避免拼写错误被静默忽略；
- API Key、密码和 VPN 订阅不得写入公共配置。

如果需要临时调整一个参数，应先明确参数覆盖顺序，例如：

```text
程序内默认值 < 配置文件 < 命令行参数
```

这样既能使用稳定配置，又能在调试时快速覆盖某个值。

## 8. ROS 2 项目的启动与调试

ROS 2 项目不要用 VS Code 的 `launch.json` 代替 ROS 2 launch 文件。两者名字相似，但用途不同：

- `.vscode/launch.json`：让 VS Code 和 GDB 调试一个进程；
- `launch/*.launch.py`：启动和编排多个 ROS 2 节点；
- `config/*.yaml`：保存 ROS 2 节点参数。

推荐结构：

```text
vision_bringup/
├── launch/
│   └── vision.launch.py
└── config/
    ├── nuc.yaml
    └── m4.yaml
```

正式启动只保留一条短命令：

```bash
ros2 launch vision_bringup vision.launch.py params_file:=config/nuc.yaml
```

如果需要在 VS Code 中调试某个 ROS 2 C++ 节点，再单独配置 `.vscode/launch.json`，让 `program` 指向：

```text
${workspaceFolder}/install/<package>/lib/<package>/<executable>
```

调试前的 `tasks.json` 可以执行：

```bash
colcon build --symlink-install \
  --packages-select <package> \
  --cmake-args -DCMAKE_BUILD_TYPE=Debug
```

不要在公共配置中写死 `/opt/ros/foxy` 或某位成员的绝对路径。ROS 2 发行版和工作空间环境应由启动终端、Dev Container 或项目脚本统一准备。

## 9. 开机自启动

开机自启动不是在脚本中加入死循环，也不是把终端窗口一直开着。脚本只描述“如何运行”，操作系统的服务管理工具负责“何时运行、失败后怎么办、日志去哪里”。

### 9.1 Ubuntu 和机器人主机：systemd

先确保 `scripts/run.sh` 能在普通终端独立运行，再创建服务单元：

```ini
[Unit]
Description=RC Vision Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=vision
WorkingDirectory=/opt/rc-vision
ExecStart=/opt/rc-vision/scripts/run.sh
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

将其保存为 `/etc/systemd/system/rc-vision.service`。确认用户名和绝对路径后再启用：

```bash
sudo systemd-analyze verify /etc/systemd/system/rc-vision.service
sudo systemctl daemon-reload
sudo systemctl enable --now rc-vision.service
```

检查状态和日志：

```bash
systemctl status rc-vision.service
journalctl -u rc-vision.service -e
```

停止并取消自启动：

```bash
sudo systemctl disable --now rc-vision.service
```

服务应使用专用普通用户运行，不要因为方便就设置为 `root`。涉及相机、串口或 CAN 设备时，应正确配置用户组和设备权限。

### 9.2 Windows：任务计划程序

Windows 下可以让“任务计划程序”在开机或用户登录时调用 `run.bat`：

1. 打开“任务计划程序”，选择“创建任务”；
2. 触发器选择“启动时”或“登录时”；
3. 操作选择“启动程序”；
4. 程序填写 `C:\Windows\System32\cmd.exe`；
5. 参数填写 `/d /c ""C:\rc-vision\scripts\run.bat""`；
6. “起始于”填写项目目录，例如 `C:\rc-vision`；
7. 根据需要设置失败后重试、延迟启动和最长运行时间；
8. 手动运行一次任务，检查退出码和日志后再依赖自启动。

不建议只把 Batch 文件放进“启动”文件夹：任务计划程序更容易管理触发条件、运行账户、延迟和失败重试。

## 10. 哪些文件应该提交到 Git

| 文件 | 是否提交 | 原因 |
| --- | --- | --- |
| `.vscode/launch.json` | 通常是 | 团队统一调试入口 |
| `.vscode/tasks.json` | 通常是 | 团队统一构建和测试任务 |
| `scripts/*.bat` | 是 | Windows 一键入口 |
| `scripts/*.sh` | 是 | Linux 一键入口 |
| `CMakePresets.json` | 是 | 团队统一构建方式 |
| `CMakeUserPresets.json` | 否 | 个人编译器和本机路径 |
| `config/default.json` | 是 | 可运行的默认参数 |
| `config/*-local.json` | 否 | 本机设备或敏感信息 |
| `.env` | 否 | 可能包含密钥 |
| `.env.example` | 是 | 只列变量名和非敏感示例 |

仓库可以加入：

```gitignore
CMakeUserPresets.json
.env
config/*-local.json
```

## 11. 推荐工作流程

### 第一次打开项目

先在命令行验证底层工具：

```bash
cmake --preset debug
cmake --build --preset debug
ctest --preset debug
```

确认命令行构建正常后再使用 VS Code。这样可以区分“项目本身无法构建”和“IDE 配置错误”。

### 日常调试

1. 在 VS Code 中选择正确的 `launch.json` 配置；
2. 设置断点；
3. 按 `F5`，由 `preLaunchTask` 自动构建；
4. 检查变量、调用栈、线程和程序输出；
5. 修复源码后重新构建并运行测试；
6. 只调整运行参数时，修改 JSON 或配置文件后直接重启程序。

### 提交代码前

```bash
./scripts/build.sh
./scripts/run.sh
```

同时检查：

- 新成员是否能根据 README 找到唯一推荐入口；
- `launch.json` 和脚本是否引用了真实存在的目标；
- 是否误提交绝对路径、密钥或个人配置；
- Debug 与 Release 是否使用不同构建目录；
- 修改运行参数后是否确实不需要重新编译；
- 修改构建参数后是否执行了重新配置和编译；
- 自启动服务是否有停止方式、日志和失败恢复策略。

## 12. 常见问题

### 修改 launch.json 后没有生效

先确认当前选择的是刚才修改的调试配置，然后完全停止旧进程再启动。如果程序从配置文件、ROS 2 参数或环境变量中再次覆盖参数，还需要检查参数优先级。

### program does not exist

`launch.json` 的 `program` 必须指向已经生成的可执行文件。检查目标是否成功构建，以及 CMake 输出目录是否与路径一致：

```bash
find build -type f -executable
```

### 修改 CMakePresets.json 后程序行为没有变化

Preset 属于构建配置，需要重新运行配置和构建：

```bash
cmake --preset debug
cmake --build --preset debug
```

必要时使用新的构建目录，避免旧 CMake Cache 影响判断。

### 可以只提供 launch.json，不写脚本吗

不建议。`launch.json` 适合开发调试，Batch、Bash 或 ROS 2 launch 才能用于普通终端、机器人主机、自动化测试和部署。

### 可以把所有参数都写进 run.sh 或 run.bat 吗

少量稳定参数可以。参数较多、存在多套设备配置或需要程序校验时，应放入 JSON、YAML 等配置文件，脚本只负责选择配置并启动程序。

## 参考资料

- [Configure C/C++ debugging - Visual Studio Code](https://code.visualstudio.com/docs/cpp/launch-json-reference)
- [Debug C++ in Visual Studio Code](https://code.visualstudio.com/docs/cpp/cpp-debug)
- [setlocal - Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/setlocal)
- [Starting an Executable on System Boot - Microsoft Learn](https://learn.microsoft.com/en-us/windows/win32/taskschd/starting-an-executable-on-system-boot)
- [CMake Presets](https://cmake.org/cmake/help/latest/manual/cmake-presets.7.html)
- [CMake User Interaction Guide](https://cmake.org/cmake/help/latest/guide/user-interaction/index.html)
- [Using XML, YAML, and Python for ROS 2 Launch Files](https://docs.ros.org/en/ros2_documentation/humble/How-To-Guides/Launch-file-different-formats.html)
