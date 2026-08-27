# ROS教程

## 认识ROS

### 什么是ROS？一个生动的比喻
想象一下，我们要建造一个机器人。这个机器人需要有：

- **眼睛** (摄像头、激光雷达)
- **大脑** (用于决策的电脑，如NUC、树莓派)
- **四肢** (轮子、机械臂)
- **神经系统** (连接以上所有部分的线路和信号)

如果从零开始，我们需要自己编写代码来读取摄像头数据，自己设计一套通信协议把数据发送给大脑，大脑处理完后，再用一套协议把指令发给轮子。如RC果中途换了一个摄像头，或者增加一个机械臂，可能整个通信系统都要重写。这非常复杂且低效。
**ROS (Robot Operating System，机器人操作系统)** 就是来解决这个问题的。
>**核心比喻：**
>如果把构建机器人比作搭乐高，那么 **ROS就是那一套标准尺寸的乐高积木块**。它为你提供了各种基础模块（如通信、驱动、算法库）和一套统一的拼接标准。你不再需要自己制造砖块，只需专注于如何用这些标准积木搭建出你想要的酷炫模型。

**需要澄清的一个误区：** ROS虽然名字里有“操作系统”，但它并不是像Windows或Ubuntu那样的真正意义上的操作系统。它更应该被称为一个“**元操作系统**”（meta-operating system）或者**软件框架**。它运行在Linux（主要是Ubuntu）系统之上，为机器人软件开发提供了一整套强大的工具和库。

### **我们为什么选择ROS？**


在团队项目中，统一的技术栈和开发规范至关重要。ROS为我们提供了以下核心优势：
- **标准化与模块化 (Standardization & Modularity)**
    - **团队协作利器**：负责视觉的同学、负责控制的同学和负责决策的同学可以各自开发自己的模块（ROS里叫“节点”），只要遵守ROS的通信约定，就能无缝集成。你不用关心队友的代码是怎么写的，只需要知道如何订阅他发布的数据即可。
    - **高复用性**：为A项目写的激光雷达驱动，可以几乎不加修改地用到B项目中。
- **强大的工具链 (Powerful Tools)**
    - **rviz**：一个超级强大的3D可视化工具，可以让你“看”到机器人感知到的一切，比如点云、摄像头图像、坐标系、导航路径等。调试必备！
    - **rqt_graph**：可以实时显示整个系统的计算图，各个模块之间的通信关系一目了然。
    - **rosbag**：可以录制和回放ROS系统中所有的数据流。这意味着你可以在现场把传感器数据录下来，然后带回实验室无限次地重放，进行算法调试，极大提高了效率。
- **庞大的开源社区和生态 (Vibrant Community & Ecosystem)**
    - 你不是一个人在战斗！几乎所有你遇到的问题，都有人在网上提问和解答过。
    - 有无数现成的、高质量的功能包（Package）可以直接使用，例如：
        - **Navigation2 (nav2)**: 移动机器人导航领域的行业标准。
        - **MoveIt**: 机械臂运动规划的瑞士军刀。
        - **Gazebo**: 一个功能强大的物理仿真环境，可以让你在软件里测试机器人。

|              |            |                    |                                                              |
| :----------: | :--------: | :----------------: | :----------------------------------------------------------: |
|   ROS概念    |    中文    |      人体类比      |                             解释                             |
|  **Nodes**   |  **节点**  |  大脑功能区/器官   | 一个个独立的、可执行的程序。例如，camera_node负责发布图像，motor_control_node负责控制电机。 |
|  **Topics**  |  **话题**  |      广播频道      | 节点之间异步通信的“管道”。一个节点往某个话题上发布（Publish）数据，其他感兴趣的节点可以从这个话题订阅（Subscribe）数据。这是一种**一对多**的广播模式。 |
| **Messages** |  **消息**  |     语言/信号      | 在话题上传输的数据。消息有严格的、预先定义好的数据类型。例如，/cmd_vel话题上传输的就是速度指令消息。 |
| **Services** |  **服务**  |     问答/请求      | 一种**一对一**的、同步的请求-响应（Request-Response）通信模式。一个节点（Client）发起请求，另一个节点（Server）处理后返回结果。适合用于执行那些需要确认结果的短暂任务（例如“重置里程计”）。 |
| **Actions**  |  **动作**  | 布置任务并汇报进度 | 一种带有连续反馈的、异步的通信模式。用于执行长时间任务（例如“导航到20米外的A点”）。客户端发送一个目标，服务器在执行过程中会周期性地发回**反馈**（Feedback），任务完成后再发送最终**结果**（Result）。 |
|  **Master**  | **主节点** |  “通信录”/“总机”   | 整个ROS系统的“注册中心”。它不处理具体数据，只负责帮助各个节点找到彼此。启动任何ROS系统前，必须先启动Master。(仅ROS1) |

### ROS1 and ROS2
在你开始学习和搜索资料时，很快会发现一个重要事实：ROS有两个主要的版本——ROS 1和ROS 2。它们之间有显著的差异，而**我们团队将主要使用ROS 2，并将现有的程序从ROS1迁移到ROS2**。

**为什么会有ROS 2？**

ROS 1是一个里程碑式的项目，但它诞生于十多年前，主要为学术界的单机机器人研究设计。随着技术发展，它的一些底层设计暴露了局限性，例如：

- **单点故障**：ROS 1依赖于一个中心“主节点”（Master）。如果Master崩溃，整个系统的通信就会瘫痪。
- **网络不稳定**：在不稳定的网络（如Wi-Fi）下，通信质量不佳。
- **缺乏实时性**：不适合需要严格实时控制的场景。
- **非“生产级”**：从设计上更偏向于原型验证而非商业产品部署。

为了解决这些问题，ROS 2应运而生。它不是在ROS 1基础上打补丁，而是一次**彻底的重写**，旨在成为一个更强大、更可靠、更适用于商业产品的框架。
**主要区别速览：**

|                                 |                             |                             |                                   |
| :-----------------------------: | :-------------------------: | :-------------------------: | :-------------------------------: |
|              特性               |            ROS 1            |            ROS 2            |           我们的关注点            |
|          **核心架构**           | **中心化** (依赖Master节点) | **去中心化** (节点自动发现) |    **ROS 2更稳定，无单点故障**    |
|          **通信协议**           |        自定义TCPROS         |    基于DDS标准 (工业级)     | **ROS 2通信更可靠，支持复杂网络** |
|        **多机器人系统**         |          实现复杂           |        **原生支持**         |         目前而言无关紧要          |
|          **实时控制**           |          支持有限           |      **设计时已考虑**       |  **可以胜任对时序要求高的任务**   |
|          **平台支持**           |           仅Linux           |    Linux, Windows, macOS    |         更灵活的开发环境          |
|          **生态系统**           |     非常成熟，包罗万象      |  **快速发展，成为新标准**   |      我们要站在技术的最前沿 

**给新手的实用提醒：**
由于ROS 1历史更悠久，网上仍有海量的教程和代码是基于ROS 1的。在查找资料时，请注意区分！

- **关键词**：搜索时，明确加入“**ROS 2**”或你的发行版名称（如“**Humble**”、“**Foxy**”）。
- **编译命令**：看到 catkin_make 或 catkin build，这是ROS 1；看到 colcon build，这是ROS 2。
- **代码**：看到 import rospy (Python) 或 #include "ros/ros.h" (C++)，这是ROS 1；看到 import rclpy 或 #include "rclcpp/rclcpp.hpp"，这是ROS 2。

虽然核心概念（节点、话题等）是相通的，但具体的实现和命令行工具完全不同。如果遇到疑问，请随时在团队内提问！

----

## ROS和其他工具的安装

### ROS的安装和环境变量的配置

推荐使用 **小鱼的一键安装**喵！
我们需要安装ros2-humble (in ubuntu22.04)

在 `bash` 里面直接运行这一段代码即可：

```shell
wget http://fishros.com/install -O fishros && . fishros
```

在大部分情况下，拿到一台新的机器的时候都可以使用这个命令安装 ROS。该脚本支持安装多个版本（如 ROS Noetic、ROS2 Foxy/Humble 等），并会自动设置一些基本依赖。

#### 安装完成后的环境变量配置

安装完成后，建议确认以下几个环境变量是否已经配置好（一般一键安装脚本会自动配置，但建议检查）：

1. **ROS的环境设置脚本**
    确保在你的 `~/.bashrc`（或 `~/.zshrc`，视你使用的终端而定）中添加了如下内容：

```shell
source /opt/ros/noetic/setup.bash   # 如果是安装的是noetic
```

对于 ROS2，可能是：

```shell
source /opt/ros/humble/setup.bash     # 或者 humble、iron 等版本
```

2. **工作空间环境加载**
    如果你已经创建了自己的工作空间（如 `~/catkin_ws` 或 `~/ros2_ws`），还应在 `.bashrc` 中添加：

```shell
source ~/catkin_ws/devel/setup.bash   # ROS1 工作空间
# 或
source ~/ros2_ws/install/setup.bash   # ROS2 工作空间
```

3. **ROS环境配置常用变量**

```shell
export ROS_MASTER_URI=http://localhost:11311
export ROS_HOSTNAME=localhost
```

如果使用多机通信，`ROS_MASTER_URI` 和 `ROS_HOSTNAME` 需要设置为主机的 IP 地址或主机名。

### 小贴士：

- 如果你使用的是 `zsh`，记得把上述的 `source` 命令放在 `~/.zshrc` 中，并`source setup.zsh`!
- 修改 `.bashrc` 或 `.zshrc` 后记得执行 `source ~/.bashrc` 或 `source ~/.zshrc` 使配置生效。
- 你可以用 `printenv | grep ROS` 来查看当前是否正确加载了 ROS 的环境变量。


### ZSH的安装和使用

对于ROS这种每次启动终端都要敲一大堆 source 命令，并且指令本身又长又复杂的工具来说，配置一个强大的命令行环境是回报率极高的一项投资。默认的Bash Shell功能比较基础，我们将通过安装 **ZSH** 和 **Oh My Zsh** 来全面提升你的终端体验。

Zsh 是一款功能强大的 Shell，而 Oh My Zsh 是一个 Zsh 的开源配置管理框架。它简化了 Zsh 的配置过程，并捆绑了数千个有用的函数、助手、插件和主题，能极大地提升你的终端使用体验。

安装过程主要分为以下几个部分：

1.  **前置准备**：安装 Oh My Zsh 所需的依赖。
2.  **安装 Oh My Zsh**：核心框架的安装。
3.  **安装核心插件**：安装 `zsh-autosuggestions` 和 `zsh-syntax-highlighting`。
4.  **安装 ROS 2 开发插件**：为 ROS 2 开发者量身定制的插件。
5.  **最终配置**：汇总所有配置。

---

### 步骤一：前置准备 (安装 Zsh, Git, Curl)

在安装 Oh My Zsh 之前，你需要确保系统上已经安装了 `zsh`、`git` 和 `curl`。

打开你的终端 (Ctrl+Alt+T)，执行以下命令来更新软件包列表并安装这些依赖：

```bash
sudo apt update
sudo apt install zsh git curl -y
```

*   **zsh**: 我们要安装的主角，一个比 Bash 更强大的 Shell。
*   **git**: Oh My Zsh 和其插件通过 Git 进行安装和更新。
*   **curl**: 用于从网络上下载 Oh My Zsh 的安装脚本。

安装完成后，可以通过 `zsh --version` 来验证 Zsh 是否安装成功。

---

### 步骤二：安装 Oh My Zsh

有了前置依赖，我们现在可以一键安装 Oh My Zsh。官方提供了非常方便的安装脚本。

在终端中执行以下命令：

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

在安装过程中，脚本会：

1.  备份你现有的 `~/.zshrc` 文件（如果存在）。
2.  创建一个新的 `~/.zshrc` 配置文件。
3.  **询问你是否希望将 Zsh 设置为默认 Shell**。强烈建议你输入 `Y` 并按回车。


安装完成后，你需要重新启动计算机，或者注销当前用户并重新登录，以使默认 Shell 的更改生效。当你再次打开终端时，你应该会看到一个全新的、漂亮的 Oh My Zsh 提示符。

---

### 步骤三：安装核心插件

Oh My Zsh 的强大之处在于其插件生态。下面我们来安装两个最受欢迎、也最实用的插件。

#### 1. zsh-autosuggestions (命令自动建议)

这个插件会根据你的历史命令，在你输入时以灰色提示形式给出可能的补全建议。按下 `→` (右方向键) 或 `End` 键即可采纳建议。

**安装方法：**
使用 `git` 将插件克隆到 Oh My Zsh 的自定义插件目录：

```bash
git clone https://github.com/zsh-users/zsh-autosuggestions.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

#### 2. zsh-syntax-highlighting (命令语法高亮)

这个插件可以高亮你正在输入的命令。正确的命令会以绿色显示，错误的命令会以红色显示，路径和文件名也会有不同的颜色，可以有效防止输入错误。

**安装方法：**
同样，使用 `git` 克隆到自定义插件目录：

```bash
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

#### 启用插件

插件下载后，还需要在配置文件中启用它们。

1.  使用你喜欢的文本编辑器打开 `~/.zshrc` 文件。这里我们使用 `nano`：

```bash
nano ~/.zshrc
```

2.  找到 `plugins=(...)` 这一行。默认情况下，它可能只有 `plugins=(git)`。
3.  在括号内，用**空格**隔开，添加我们刚刚安装的两个插件的名字：
**修改前:**
```shell
plugins=(git)
```
**修改后:**
```shell
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
```
   > **注意**：插件名称之间用空格分隔，不要用逗号！
4.  保存文件并退出 (`Ctrl+X` -> `Y` -> `Enter`)。
5.  让配置立即生效，执行：

```bash
source ~/.zshrc #或者 exec zsh
```
现在，当你输入命令时，你应该能看到语法高亮和自动建议的效果了！

---

~~### 步骤四：ROS 2 开发实用插件推荐与安装(未经验证)~~

~~对于 ROS 2 开发者来说，配置好终端环境可以极大提升开发效率。~~

~~#### 1. `ros2` 插件 (Oh My Zsh 内置)~~

~~Oh My Zsh 自带了一个 `ros2` 插件，它的核心功能是**自动 source ROS 2 的环境**。你不再需要每次打开新终端都手动执行 `source /opt/ros/humble/setup.zsh`。~~

**安装方法：**
~~这个插件是内置的，所以你只需要在 `~/.zshrc` 中启用它，并告诉它你的 ROS 2 安装路径。~~

1.  打开配置文件 `nano ~/.zshrc`。
2.  在文件的**任意位置**（推荐在 `plugins` 行的上方）添加你的 ROS 2 安装路径变量。例如，如果你安装的是 Humble：

```zsh
# ROS 2 Oh My Zsh Plugin Configuration
export ZSH_ROS2_INSTALL_PATH=/opt/ros/humble
```

    请根据你的 ROS 2 版本（如 `foxy`, `galactic`, `iron`）修改路径。

3.  将 `ros2` 添加到 `plugins` 列表中：

```zsh
plugins=(
    git
    zsh-autosuggestions
    zsh-syntax-highlighting
    ros2
)
```


~~#### 2. `ros2-completion` (官方自动补全脚本)~~

这是**最重要的 ROS 2 终端工具**。它为 `ros2` 的所有子命令、参数、节点名、话题名等提供了强大的 Tab 自动补全功能。

**安装方法：**
它通过 `argcomplete` 实现，需要先安装对应的包。

```
sudo apt install python3-argcomplete
```

**启用方法：**
在 `~/.zshrc` 文件的末尾添加以下激活脚本的命令：
1.  打开 `nano ~/.zshrc`。
2.  滚动到文件末尾，添加下面这行：
```zsh
# ROS 2 Command-line Completion
eval "$(register-python-argcomplete ros2)"
```

~~#### 3. `colcon` 插件 (社区提供)~~

如果你经常使用 `colcon build` 编译 ROS 2 工作区，这个插件会为 `colcon` 的命令和参数提供自动补全。

**安装方法：**
和之前一样，使用 `git` 克隆插件：

```bash
git clone https://github.com/colcon/colcon-zsh-completion.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/colcon
```

**启用方法：**
将 `colcon` 添加到 `~/.zshrc` 的 `plugins` 列表中：

```zsh
plugins=(
    git
    zsh-autosuggestions
    zsh-syntax-highlighting
    ros2
    colcon
)
```

---

### 步骤五：最终配置与验证

完成以上所有步骤后，你的 `~/.zshrc` 文件应该包含以下关键配置：

```bash
# ... (其他 Oh My Zsh 配置)

# Example of ROS 2 Oh My Zsh Plugin Configuration
export ZSH_ROS2_INSTALL_PATH=/opt/ros/humble

# 插件列表
plugins=(
    git
    zsh-autosuggestions
    zsh-syntax-highlighting
    ros2
    colcon
)

source $ZSH/oh-my-zsh.sh

# ... (其他用户自定义配置)

# ROS 2 Command-line Completion
eval "$(register-python-argcomplete ros2)"
```

最后，再次执行 `source ~/.zshrc` 或重启终端使所有配置生效。

**验证一下效果：**

1.  **自动 Sourcing**: 打开一个新终端，输入 `ros2` 并按回车。如果能看到 `ros2` 的帮助信息，说明 `ros2` 插件已成功自动 source 环境。
2.  **ROS 2 补全**: 输入 `ros2 topic list -` 然后按 `Tab` 键，你应该能看到 `-t`, `--show-type` 等参数提示。
3.  **Colcon 补全**: 在你的工作区目录，输入 `colcon build --` 然后按 `Tab` 键，你应该能看到 `--packages-select` 等补全选项。

至此，你已经拥有了一个为 ROS 2 开发高度优化的 Zsh 终端环境！

---

## 构建ROS程序

这里仅包含ROS2的教程，~~ROS1老登会就行了~~

### 构建你的第一个ROS 2程序

在第一部分中，我们了解了ROS的宏观概念。现在，是时候卷起袖子，让理论变为现实了！本部分将手把手带你完成从创建工作空间到运行一个简单“发布者”节点的完整流程。

**学习目标：**
1.  理解ROS 2的工作空间（Workspace）结构。
2.  学会使用`ros2`和`colcon`等核心命令行工具。
3.  亲手编写、编译并运行一个ROS 2节点。
4.  学会使用`ros2 topic`等工具来验证程序的运行。

---

#### **1. 准备你的工作空间 (Workspace)**

在ROS中，我们不把代码随意乱放。所有的项目代码都组织在一个特定的文件夹里，这个文件夹就叫做**工作空间**。

> **比喻时间：**
> 如果说你的整个Ubuntu系统是一个大书房，那么工作空间（Workspace）就是你为“机器人项目”专门准备的一个大书架。这个书架有固定的分区（`src`, `build`, `install`等），用来存放不同类型的东西。

让我们来创建第一个工作空间。打开你的终端（Terminal），然后依次输入以下命令：

```bash
# 1. 创建一个名为 ros2_ws 的文件夹(这个名字是随意的)，
# 以及一个名为 src 的子文件夹(这个是"关键字")
#    -p 选项可以确保父目录不存在时也会被创建
mkdir -p ~/ros2_ws/src

# 2. 进入我们刚创建的工作空间目录
cd ~/ros2_ws
```


*   `~/ros2_ws`: 这是我们工作空间的根目录。`~`代表你的用户主目录。
*   `src`: 这是“source”的缩写，也就是**源代码目录**。我们将来创建的所有功能包（Packages）都会放在这里。

现在你的书架已经建好了，并且有了放“原料”（源代码）的地方。

#### **2. 创建你的第一个功能包 (Package)**

功能包是ROS中组织代码的基本单元。一个功能包通常包含节点、配置文件、启动文件等，用于完成一项具体的功能（比如“雷达驱动”或“图像识别”）。

我们将创建一个名为 `my_first_package` 的Python功能包。

确保你当前在工作空间的根目录 (`~/ros2_ws`)下，然后运行以下命令：

```bash
# 在 src 目录下创建一个新的功能包
cd src
ros2 pkg create --build-type ament_python --node-name simple_publisher my_first_package
```
让我们分解一下这个命令：

*   `ros2 pkg create`: 这是创建功能包的命令。
*   `--build-type ament_python`: 指定我们要创建一个Python包。ROS 2的构建系统叫做`ament`。如果是C++包，这里会是`ament_cmake`。
*   `--node-name simple_publisher`: 这是一个非常方便的选项，它会自动为我们生成一个名为 `simple_publisher.py` 的基础节点文件，省去了我们手动创建的麻烦。
*   `my_first_package`: 这是我们功能包的名字。

执行完毕后，`src`目录下会多出一个`my_first_package`文件夹。它的结构大致如下：

```shell
src/my_first_package/
├── my_first_package/
│   ├── __init__.py
│   └── simple_publisher.py  <-- 我们的节点代码在这里！
├── package.xml
├── setup.cfg
├── setup.py
└── resource/
    └── my_first_package
```

* `src/my_first_package/` (功能包根目录)
    这是功能包的最外层目录，它包含了所有与该包相关的代码和配置文件，通常位于 ROS 2 工作空间的 `src` 文件夹下。

* `my_first_package/` (Python 包目录)
    这是实际的 Python 包目录，你的所有 Python 模块（.py 文件）都应放在这里。遵循这种嵌套结构是 Python 的标准实践，便于代码的导入和管理。

* `__init__.py`
    这是一个空文件，但它的存在至关重要，因为它告诉 Python 解释器 `my_first_package/` 这个目录应该被视为一个可导入的 Python 包。

* `simple_publisher.py`
    这是你的 ROS 2 节点实现文件，其中包含了具体的业务逻辑，例如创建发布者、订阅者，以及处理数据等。

* `package.xml`
    这是功能包的清单文件，它以 XML 格式定义了包的元信息，如包名、版本、作者、许可证以及最重要的——构建和运行时所依赖的其他功能包。

* `setup.cfg`
    这是一个构建配置文件，在 ROS 2 Python 包中，它通常用于指定可执行脚本（即你的节点）应该被安装到的目标路径。

* `setup.py`
    这是核心的安装脚本，它告诉 `colcon` 构建工具如何处理你的 Python 包，并通过设置 `entry_points` (入口点) 将你的 `.py` 脚本注册为 ROS 2 系统可以识别和运行的可执行节点。

* `resource/`
    这个目录存放着用于让 ROS 2 工具链发现本功能包的资源索引文件。

* `my_first_package` (在 `resource/` 目录下)
    这是一个空的标记文件，它的存在本身就是一种“注册”，告诉 ROS 2 系统“`my_first_package`”是一个已经安装并可用的功能包。这个文件非常重要！

#### **3. 编写节点代码：一个简单的话题发布者**

我们的目标是编写一个节点，它会以固定的频率（比如每秒1次）向一个话题（Topic）发布一条 "Hello, World" 消息。

用你喜欢的文本编辑器（如VS Code, Gedit）打开 `~/ros2_ws/src/my_first_package/my_first_package/simple_publisher.py` 文件。你会看到一些模板代码。现在，让我们用下面的代码替换它：

```python
# 导入rclpy库，这是ROS 2的Python客户端库
import rclpy
# 导入Node类，我们的节点将继承自这个类
from rclpy.node import Node
# 导入我们将要发布的消息类型String
from std_msgs.msg import String

class MinimalPublisher(Node):

    def __init__(self):
        # 调用父类的构造函数，并给节点命名为'minimal_publisher'
        super().__init__('minimal_publisher')
        
        # 创建一个发布者。它将发布String类型的消息到名为'topic'的话题上
        # 队列大小(queue size)为10，这是服务质量(QoS)的一个基本设置
        self.publisher_ = self.create_publisher(String, 'talker_topic', 10)
        
        # 创建一个定时器，每隔0.5秒调用一次timer_callback函数
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        
        # 初始化一个计数器
        self.i = 0

    def timer_callback(self):
        # 创建一个String类型的消息对象
        msg = String()
        # 填充消息内容
        msg.data = 'Hello World: %d' % self.i
        
        # 发布消息
        self.publisher_.publish(msg)
        
        # 在控制台打印日志，确认消息已发出
        self.get_logger().info('Publishing: "%s"' % msg.data)
        
        # 计数器自增
        self.i += 1

def main(args=None):
    # 初始化rclpy库
    rclpy.init(args=args)

    # 创建我们的发布者节点
    minimal_publisher = MinimalPublisher()

    # rclpy.spin()会保持节点的运行，并处理所有回调（比如定时器回调）
    # 直到程序被中断（例如按下Ctrl+C）
    rclpy.spin(minimal_publisher)

    # 节点关闭时，销毁节点并关闭rclpy
    minimal_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**代码解释:**
*   **`MinimalPublisher(Node)`**: 我们定义了一个类，它继承自`rclpy.node.Node`，这就是一个标准的ROS 2节点。
*   **`create_publisher(...)`**: 创建一个发布者对象，指定了消息类型 (`String`)、话题名称 (`talker_topic`) 和队列大小。
*   **`create_timer(...)`**: 创建一个定时器，这是ROS 2中实现周期性任务的常用方法。它会定期触发`timer_callback`函数。
*   **`timer_callback()`**: 这是核心逻辑。每次被定时器调用时，它就构建一条消息，然后用`publish()`方法把它发出去。
*   **`main()`函数**: 这是程序的入口。它负责初始化ROS 2客户端库，创建并“旋转”(`spin`)节点，使其保持活动状态。

#### **4. 让系统知道你的节点：配置`setup.py`**

我们写好了代码，但还需要告诉ROS 2的构建系统，我们的`simple_publisher.py`文件是一个可执行的节点。这需要在`setup.py`文件中配置。

打开 `~/ros2_ws/src/my_first_package/setup.py` 文件，找到 `entry_points` 部分，修改成如下内容：

```python
entry_points={
    'console_scripts': [
        'talker = my_first_package.simple_publisher:main',
    ],
},
```

这行代码的意思是：
创建一个名为 `talker` 的可执行脚本。当你运行它时，它实际会去执行 `my_first_package` 包里的 `simple_publisher` 模块中的 `main` 函数。

#### **5. 编译、激活、运行！**

万事俱备，只欠东风！现在让我们来编译并运行它。

**Step 1: 编译 (Build)**
回到你的工作空间根目录 `~/ros2_ws`，运行编译命令：

```bash
cd ~/ros2_ws
colcon build
```

`colcon`是ROS 2的构建工具。它会检查`src`目录下的所有功能包，并根据配置进行编译。成功后，你会在`ros2_ws`下看到新增的`build`、`install`和`log`文件夹。

**Step 2: 激活环境 (Source)**

**【极其重要的一步！】**
编译完成后，你需要告诉当前的终端，让它知道你刚刚安装好的新程序在哪里。这个过程叫做“Sourcing”或者“激活环境”。

```bash
# 在 ros2_ws 目录下
source install/setup.bash
```
> 如果你正在使用 zsh，请改为输入：
> ```zsh
> source install/setup.zsh
> ```

**注意：** 每当你打开一个新的终端并想使用这个工作空间里的程序时，都必须先执行一次这条`source`命令！
> 这个时候可能会有人想问:
> 那我把这个命令添加到`.bashrc`或者`.zshrc`里不就可以了
> **注意！我个人不推荐这种做法！**
> 可以在`.bashrc`放置全局的`setup.bash`,但是绝对不要将你个人工作空间(workspace)的`setup.bash`放进去。因为这会导致你的ROS环境被“写死”在这一个工作空间上，当你需要编译或运行其他工作空间的项目时，就会出现各种环境变量冲突和找不到包的问题。

**Step 3: 运行节点 (Run)**
终于可以运行了！在**同一个已经激活环境的终端**里，使用`ros2 run`命令：

```bash
# 格式: ros2 run <包名> <你在setup.py里定义的脚本名>
ros2 run my_first_package talker
```

如果一切顺利，你将看到控制台开始疯狂刷屏：

```
[INFO] [minimal_publisher]: Publishing: "Hello World: 0"
[INFO] [minimal_publisher]: Publishing: "Hello World: 1"
[INFO] [minimal_publisher]: Publishing: "Hello World: 2"
...
```

干得漂亮！你的第一个ROS 2节点已经在运行了！按 `Ctrl+C` 可以停止它。

#### **6. 验证：眼见为实**

节点在运行，但我们怎么知道它真的在ROS网络中发布话题呢？这时就需要用到ROS 2的命令行工具了。

**打开一个【新终端】**，并**【务必】**先激活环境：

```bash
cd ~/ros2_ws
source install/setup.bash
```

现在，在这个新终端里，我们可以像一个侦探一样调查ROS系统：

*   **查看当前所有话题：**

```bash
ros2 topic list
```

你应该能看到 `/talker_topic` 和其他一些默认话题。

*   **监听话题内容：**

```bash
# 格式: ros2 topic echo <话题名>
ros2 topic echo /talker_topic
```

你会实时看到从`talker`节点发布出来的消息内容，这证明了我们的通信是成功的！

*   **可视化系统（可选，但强烈推荐）：**

```bash
rqt_graph
```

这会弹出一个图形化界面，清晰地展示出当前的系统结构：一个名为 `/minimal_publisher` 的节点，正在向 `/talker_topic` 话题发布数据。

---

#### **小结与下一步**

恭喜！你已经走完了成为一名ROS开发者的最关键一步。你已经掌握了以下核心流程：
**创建 -> 编码 -> 配置 -> 编译 -> 激活 -> 运行 -> 验证**

这个流程将贯穿你未来所有的ROS开发工作。

在下一部分教程中，我们将创建另一个节点——**订阅者（Subscriber）**，让它来接收我们今天创建的`talker`所发布的消息，从而完成一个最基础的ROS通信闭环。

好的，我们来一步步创建一个名为 `my_first_sub` 的 ROS2 ament_cmake 功能包，并编写一个订阅 `/talker_topic` 话题的 C++ 节点。

### Subscriber

#### 1\. 创建功能包

在这一小节中，我们来了解真正的多节点通信——Publisher和Subscriber，以及如何构建和配置一个`ament_cmake`的功能包

```bash
# 假如你的工作空间是 ~/ros2_ws
cd ~/ros2_ws/src
```

然后，使用以下命令创建一个名为 `my_first_sub` 的 C++ 功能包：

```bash
ros2 pkg create --build-type ament_cmake my_first_sub --dependencies rclcpp std_msgs
```
**这个会**:

  - 创建一个 `my_first_sub` 目录。
  - `--build-type ament_cmake` 指定了构建系统。
  - `--dependencies rclcpp std_msgs` 为我们添加了两个核心依赖：
      - `rclcpp`: ROS2 C++ 客户端库。
      - `std_msgs`: 包含标准消息类型，我们将使用 `String` 消息。

创建好的目录结构如下
```shell
./my_first_sub
├── CMakeLists.txt
├── include
│   └── my_first_sub
├── package.xml
└── src
```

#### 2\. 编写 Subscriber 节点代码

进入功能包的 `src` 目录，并创建一个 C++ 文件，例如 `subscriber_node.cpp`。

```bash
touch my_first_sub/src/subscriber_node.cpp
```

然后，用你喜欢的编辑器打开 `subscriber_node.cpp` 文件，并粘贴以下代码：

```cpp
#include <memory>
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

// 使用 std::placeholders 来绑定成员函数作为回调
using std::placeholders::_1;

// 定义一个继承自 rclcpp::Node 的类
class MinimalSubscriber : public rclcpp::Node
{
public:
  // 构造函数
  MinimalSubscriber()
  : Node("minimal_subscriber") // 节点名称为 "minimal_subscriber"
  {
    // 创建一个订阅者，订阅 "talker_topic" 话题
    // 消息类型为 std_msgs::msg::String
    // 队列大小(QoS)为 10
    // 回调函数为 topic_callback
    subscription_ = this->create_subscription<std_msgs::msg::String>(
      "talker_topic", 10, std::bind(&MinimalSubscriber::topic_callback, this, _1));
  }

private:
  // 收到消息时被调用的回调函数
  void topic_callback(const std_msgs::msg::String & msg) const
  {
    // 使用日志宏打印接收到的消息
    RCLCPP_INFO(this->get_logger(), "I heard: '%s'", msg.data.c_str());
  }

  // 声明订阅者指针
  rclcpp::Subscription<std_msgs::msg::String>::SharedPtr subscription_;
};

int main(int argc, char * argv[])
{
  // 初始化 ROS2 C++ 客户端库
  rclcpp::init(argc, argv);
  // 创建 MinimalSubscriber 节点并开始自旋 (spin)，等待消息
  rclcpp::spin(std::make_shared<MinimalSubscriber>());
  // 关闭 ROS2
  rclcpp::shutdown();
  return 0;
}
```

**代码解析:**

  - `MinimalSubscriber` 类继承自 `rclcpp::Node`。
  - 构造函数中，我们调用 `create_subscription` 方法来创建一个订阅者。
  - 它订阅了 `/talker_topic` 话题，期望接收 `std_msgs::msg::String` 类型的消息。
  - `std::bind(&MinimalSubscriber::topic_callback, this, _1)` 将成员函数 `topic_callback` 绑定为回调。每当有新消息到达时，这个函数就会被调用。
  - `topic_callback` 函数通过 `RCLCPP_INFO` 宏将接收到的消息内容打印到控制台。
  - `main` 函数负责初始化 ROS2，创建节点实例，并调用 `rclcpp::spin` 使节点保持运行状态以接收消息。

#### 3\. 配置 `package.xml`

打开功能包根目录下的 `package.xml` 文件。之前创建包时添加的依赖项应该已经存在了。请确保它至少包含以下内容（你可以按需填写 `description`, `maintainer`, `license` 标签）：

```xml
<?xml version="1.0"?>
<package format="3">
  <name>my_first_sub</name>
  <version>0.0.0</version>
  <description>A simple ROS2 subscriber package</description>
  <maintainer email="user@example.com">Your Name</maintainer>
  <license>Apache-2.0</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

  <depend>rclcpp</depend>
  <depend>std_msgs</depend>

  <test_depend>ament_lint_auto</test_depend>
  <test_depend>ament_lint_common</test_depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>
```

#### 4\. 配置 `CMakeLists.txt`

现在，打开功能包根目录下的 `CMakeLists.txt` 文件。你需要添加几行来告诉 `cmake`如何编译你的 C++ 代码并创建一个可执行文件。

在 `find_package(ament_cmake REQUIRED)` 下面，找到并取消注释或添加以下行：

```cmake
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
```

然后在文件的底部，`ament_package()` 之前，添加以下内容：

```cmake
add_executable(subscriber_node src/subscriber_node.cpp)
ament_target_dependencies(
  subscriber_node
  rclcpp
  std_msgs
)

install(
  TARGETS subscriber_node
  DESTINATION lib/${PROJECT_NAME}
)
```

**CMakeLists.txt 解析:**

  - `add_executable(subscriber_node src/subscriber_node.cpp)`: 定义了一个名为 `subscriber_node` 的可执行文件，它由 `src/subscriber_node.cpp` 编译而来。
  - `ament_target_dependencies(...)`: 链接 `subscriber_node` 所需的库，这里是 `rclcpp` 和 `std_msgs`。
  - `install(...)`: 将生成的可执行文件安装到 `install/my_first_sub/lib` 目录下，这样 `ros2 run` 命令才能找到它。

一个完整的`CMakeLists.txt`示例:
```cmake
cmake_minimum_required(VERSION 3.8)
project(my_first_sub)

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)

add_executable(subscriber_node src/subscriber_node.cpp)

ament_target_dependencies(subscriber_node
  "rclcpp"
  "sensor_msgs"
)
install(TARGETS subscriber_node
  DESTINATION lib/${PROJECT_NAME}
)
if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  ament_lint_auto_find_test_dependencies()
endif()
ament_package()
```
#### 5\. 构建和运行

现在你的功能包已经配置完成，可以进行构建了。

1.  **回到工作空间的根目录**：

```bash
cd ~/ros2_ws
```

2.  **使用 colcon 构建功能包**：

```bash
colcon build --packages-select my_first_sub
```
如果一切顺利，你应该会看到构建成功的消息。

3.  **Source 工作空间**：
    在运行节点之前，你需要先 source 你的工作空间，让 ROS2 环境能够找到你刚刚构建好的功能包。

```bash
source install/setup.bash
```

**注意**: 每次打开新的终端都需要执行此步骤。

4.  **运行 Subscriber 节点**：
    现在，你可以运行你的订阅者节点了。

```bash
ros2 run my_first_sub subscriber_node
```

运行后，终端会停在这里，等待来自 `/talker_topic` 的消息。

5.  **发布消息进行测试**：
    打开**一个新的终端**，并确保也 source 了工作空间 (`source ~/ros2_ws/install/setup.bash`)。然后使用 `ros2 topic pub` 命令向 `/talker_topic` 发布一条消息：

```bash
ros2 topic pub --once /talker_topic std_msgs/msg/String "data: 'Hello, world'"
```

此时，你应该能在运行 `subscriber_node` 的那个终端里看到如下输出：

```
[INFO] [1664500000.123456789] [minimal_subscriber]: I heard: 'Hello, world'
```

至此，你已成功创建、构建并运行了一个订阅 `/talker_topic` 话题的 ROS2 subscriber 节点。

### 多节点通信与QOS

#### 1. 多节点通信

ROS 2的强大之处在于其分布式特性。你可以轻松地让多个节点通过话题进行通信，构建复杂的系统。
**通信模式：**

- **一对一 (One-to-One)**: 如上例所示，一个发布者和一个订阅者。
- **一对多 (One-to-Many)**: 一个发布者，多个订阅者。这是非常常见的模式。例如，一个相机节点发布 `/image_raw` 话题，一个图像处理节点、一个录制节点和一个显示节点可以同时订阅该话题，并行处理任务。
- **多对一 (Many-to-One)**: 多个发布者，一个订阅者。例如，多个机器人上的传感器节点可以向同一个 `/diagnostics`（诊断）话题发布状态信息，由一个中央监控节点统一接收处理。
- **多对多 (Many-to-Many)**: 多个发布者和多个订阅者在同一个话题上交互。

工作机制：
ROS 2的DDS（Data Distribution Service）中间件负责底层的节点发现和数据路由。只要一个发布者和一个订阅者使用了相同的话题名称和兼容的消息类型，并且它们的QoS设置兼容，DDS就会自动为它们建立连接，无需任何手动配置。
示例场景：
假设我们有一个机器人系统：
- **`camera_node`**: 发布原始图像到 `/image_raw`。
- **`image_processor_node`**: 订阅 `/image_raw`，进行人脸识别，然后将结果发布到 `/face_detections`。
- **`image_display_node`**: 订阅 `/image_raw`，在屏幕上显示实时视频流。
- **`security_alert_node`**: 订阅 `/face_detections`，如果检测到未授权人员，则发出警报。

在这个场景中，`camera_node` 是一个一对多的发布者。`image_processor_node` 同时扮演了订阅者和发布者的角色。所有这些节点可以独立开发、测试和运行，通过话题有机地组合在一起，形成一个完整的应用。你可以使用 `ros2 launch` 文件一次性启动所有这些节点，构建出强大的系统。

#### 2. QoS (Quality of Service) 服务质量

在理想的网络环境下，数据总能瞬时、可靠地送达。但在现实世界，尤其是在无线通信的机器人上，网络会发生丢包、延迟和抖动。QoS就是ROS 2提供的一套强大的工具，让你能够根据不同数据的特性，精细地控制通信的可靠性和实时性。
当发布者和订阅者连接时，它们会协商QoS策略。只有当策略兼容时，连接才能建立。
**核心QoS策略：**

1. **History (历史记录)**:

    - `KEEP_LAST`: 只保留最新的N条数据。N由`Depth`选项指定。适用于状态类数据，如传感器读数，你只关心最新的值。
    - `KEEP_ALL`: 保留所有历史数据，直到资源耗尽。适用于需要确保不丢失任何一条消息的场景，如录制数据。
2. **Depth (深度)**:

    - 与 `KEEP_LAST` 结合使用，指定队列的大小。例如 `Depth=10` 表示最多保留最近的10条消息。
3. **Reliability (可靠性)**:

    - `BEST_EFFORT` (尽力而为): 传输速度快，但不保证送达，可能会丢包。适用于高频率、可容忍丢失的数据，如视频流、激光雷达数据。
    - `RELIABLE` (可靠): 保证送达，会进行重传尝试。适用于绝对不能丢失的指令，如机器人移动的`cmd_vel`指令、重要的服务调用。可靠传输会增加一些延迟和网络开销。
4. **Durability (持久性)**:

    - `VOLATILE` (易失): 只将消息发送给当前已经连接的订阅者。如果订阅者在消息发布后才启动，它将收不到这条消息。
    - `TRANSIENT_LOCAL` (瞬态本地): 发布者会“保留”最新发布的消息。当一个新的订阅者连接上时，发布者会立刻将这些“陈旧”的消息发送给它。非常适用于配置信息或地图数据，这样后启动的节点也能立即获取到最新的配置或地图。

**如何在代码中设置QoS？**
你可以创建一个QoS配置文件（Profile），并在创建发布者或订阅者时应用它。

**Python QoS 示例**:


```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy, DurabilityPolicy

# 创建一个用于传感器数据的QoS配置
qos_profile_sensor_data = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    history=HistoryPolicy.KEEP_LAST,
    depth=1
)

# 创建一个用于关键指令的QoS配置
qos_profile_system_status = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,
    history=HistoryPolicy.KEEP_LAST,
    depth=10,
    durability=DurabilityPolicy.TRANSIENT_LOCAL
)

# 在创建发布者或订阅者时应用
# self.publisher_ = self.create_publisher(String, 'topic', qos_profile=qos_profile_system_status)
# self.subscription = self.create_subscription(String, 'topic', self.callback, qos_profile=qos_profile_sensor_data)
```

**C++ QoS 示例**:


```C++
// C++的语法稍有不同，但理念一致
#include "rclcpp/rclcpp.hpp"

// 创建一个用于传感器数据的QoS配置
auto qos_sensor_data = rclcpp::QoS(rclcpp::KeepLast(1)).best_effort();

// 创建一个用于关键指令的QoS配置
auto qos_system_status = rclcpp::QoS(rclcpp::KeepLast(10)).transient_local().reliable();

// 在创建时应用
// publisher_ = this->create_publisher<std_msgs::msg::String>("topic", qos_system_status);
// subscription_ = this->create_subscription<std_msgs::msg::String>("topic", qos_sensor_data, callback);
```

检查QoS：
你可以使用命令行工具来查看一个活动话题的QoS设置：

```
ros2 topic info /talker_topic -v
```

这个命令会列出该话题的所有发布者和订阅者以及它们各自的QoS配置，这对于调试连接问题非常有用。
通过合理地组合使用Publisher、Subscriber以及精细地调整QoS策略，你可以构建出既健壮又高效的复杂机器人系统。

### 功能包结构与代码结构

在ROS 2中，功能包（Package）是组织代码和资源的基本单位。一个良好、清晰的结构不仅能让你的项目更易于维护和理解，也能方便他人复用你的工作。本节将详细介绍一个典型的ROS 2功能包应该如何组织，以及功能包内部代码的常见结构。

#### 一、 ROS 2 功能包标准结构

一个ROS 2功能包本质上是一个包含特定文件的目录。这些文件描述了功能包的元信息、依赖项以及如何构建和安装它。下面是一个理想化的、功能齐全的C++和Python混合功能包的目录结构示例：

```
my_awesome_package/
├── CMakeLists.txt                 # C++构建规则 (Ament ament_cmake)
├── package.xml                    # 功能包清单文件 (核心)
├── src/                           # C++ 源代码
│   ├── my_node.cpp
│   └── another_node.cpp
├── my_awesome_package/            # Python 模块目录
│   ├── __init__.py
│   ├── my_node.py
│   └── another_node.py
├── include/my_awesome_package/    # C++ 头文件
│   └── my_class.hpp
├── launch/                        # 启动文件
│   └── my_launch_file.launch.py
├── config/                        # 配置文件
│   └── my_params.yaml
├── resource/						 # Ament 资源索引
│   └── my_awesome_package
├── msg/                           # 自定义消息定义
│   └── MyMessage.msg
├── srv/                           # 自定义服务定义
│   └── MyService.srv
├── action/                        # 自定义动作定义
│   └── MyAction.action
├── rviz/                          # RViz 配置文件
│   └── my_config.rviz
├── urdf/                          # URDF (机器人描述) 文件
│   └── my_robot.urdf
├── test/                          # 测试文件
│   ├── test_cpp_node.cpp
│   └── test_python_node.py
└── setup.py                       # Python 构建规则 (Ament ament_python)
```

**各目录和文件详解：**

- **`package.xml` (必需)**: 这是功能包的“身份证”。它定义了功能包的名称、版本、作者、许可证、构建类型以及最重要的——依赖项。无论是C++还是Python功能包，此文件都是必不可少的。构建系统（如`colcon`）会读取此文件来确定功能包之间的依赖关系。
- **`CMakeLists.txt` (C++功能包必需)**: 如果你的功能包包含C++代码，就需要这个文件。它遵循CMake语法，并使用`ament_cmake`提供的宏来查找依赖、定义可执行文件（节点）、库，并指定安装规则。
- **`setup.py` (Python功能包必需)**: 对于包含Python代码的功能包，此文件是必需的。它遵循Python `setuptools`的格式，用于指定如何打包和安装Python模块、脚本和数据文件。
- **`src/` (C++源代码)**: 存放所有C++源文件（`.cpp`）。构建系统会根据`CMakeLists.txt`中的规则来编译这里的文件。
- **`<功能包名>/` (Python源代码)**: 这是存放Python代码的标准位置。目录名通常与功能包名相同，使其可以作为一个Python模块被导入。`__init__.py`文件是必需的，以表示这是一个Python包。
- **`include/`**: 存放C++头文件（`.hpp`或`.h`）。通常会在`include`下再创建一个与功能包同名的子目录，以避免头文件名称冲突。
- **`launch/`**: 存放启动文件。ROS 2推荐使用Python来编写启动文件（`.launch.py`），这提供了极大的灵活性。启动文件用于一次性运行一个或多个节点，并配置它们的参数。
- **`config/`**: 存放参数配置文件（通常是YAML格式，`.yaml`）。节点可以在启动时加载这些文件来配置其内部参数，实现了代码与配置的分离。
- **`resource /`**:`resource` 目录通过存放一个标记文件来向ROS 2系统注册该功能包，从而让 `ros2 run` 等命令能够发现并定位它，在`ament_python`功能包中是至关重要的！
- **`msg/`, `srv/`, `action/`**: 如果你需要定义自己的消息、服务或动作接口，就将它们的定义文件（`.msg`, `.srv`, `.action`）分别放在这些目录中。构建系统会自动为这些接口文件生成C++和Python代码。
- **`urdf/`, `rviz/`**: 这些不是严格必需的，但却是普遍采用的最佳实践。`urdf`目录存放机器人模型描述文件，而`rviz`目录存放Rviz2的可视化配置文件。
- **`test/`**: 存放单元测试和集成测试代码。保持代码的可测试性是大型项目成功的关键。

**注意**：一个纯C++的功能包不会有`setup.py`和Python模块目录，而一个纯Python功能包则不一定需要`CMakeLists.txt`和`src/`、`include/`目录。

#### 二、 代码结构

功能包的内部代码，特别是节点（Node）的实现，也遵循一些常见的模式。

##### C++ 节点代码结构 (面向对象)

在C++中，最佳实践是将节点封装成一个类。这个类继承自`rclcpp::Node`。这样做的好处是代码结构清晰，易于管理状态和资源。

**示例 (`my_node.cpp`):**

```C++
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"
#include "my_pkg_cpp/my_class.hpp" // 引入头文件

// 继承自 rclcpp::Node
class MyNode : public rclcpp::Node
{
public:
    // 构造函数，初始化节点名，并进行成员初始化
    MyNode() : Node("my_cpp_node")
    {
        // 声明参数
        this->declare_parameter<std::string>("my_parameter", "default_value");

        // 创建发布者
        publisher_ = this->create_publisher<std_msgs::msg::String>("topic", 10);

        // 创建订阅者，回调函数使用 lambda 或 bind
        subscription_ = this->create_subscription<std_msgs::msg::String>(
            "input_topic", 10, std::bind(&MyNode::topic_callback, this, std::placeholders::_1));

        // 创建定时器，周期性执行任务
        timer_ = this->create_wall_timer(
            std::chrono::milliseconds(500), std::bind(&MyNode::timer_callback, this));

        RCLCPP_INFO(this->get_logger(), "C++ 节点已启动.");
    }

private:
    // 回调函数
    void topic_callback(const std::msgs::msg::String::SharedPtr msg) const
    {
        RCLCPP_INFO(this->get_logger(), "我听到了: '%s'", msg->data.c_str());
    }

    void timer_callback()
    {
        std_msgs::msg::String message;
        message.data = "你好，世界! " + std::to_string(count_++);
        RCLCPP_INFO(this->get_logger(), "正在发布: '%s'", message.data.c_str());
        publisher_->publish(message);
    }

    // 成员变量 (ROS句柄、私有变量等)
    rclcpp::Publisher<std_msgs::msg::String>::SharedPtr publisher_;
    rclcpp::Subscription<std_msgs::msg::String>::SharedPtr subscription_;
    rclcpp::TimerBase::SharedPtr timer_;
    size_t count_ = 0;
};

// main 函数：ROS 2 程序的入口
int main(int argc, char * argv[])
{
    // 1. 初始化 ROS 2 C++ 客户端库
    rclcpp::init(argc, argv);
    // 2. 创建节点对象并进入事件循环
    rclcpp::spin(std::make_shared<MyNode>());
    // 3. 关闭 ROS 2
    rclcpp::shutdown();
    return 0;
}
```


##### Python 节点代码结构

Python节点的结构与C++类似，同样推荐使用面向对象的方式，创建一个继承自`rclpy.node.Node`的类。
**示例 (`my_node.py`):**
Python

```
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MyNode(Node):
    def __init__(self):
        super().__init__('my_python_node')

        # 声明参数
        self.declare_parameter('my_parameter', 'default_value')

        # 创建发布者
        self.publisher_ = self.create_publisher(String, 'topic', 10)

        # 创建订阅者
        self.subscription = self.create_subscription(
            String,
            'input_topic',
            self.listener_callback,
            10)

        # 创建定时器
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

        self.get_logger().info('Python 节点已启动.')

    def listener_callback(self, msg):
        self.get_logger().info('我听到了: "%s"' % msg.data)

    def timer_callback(self):
        msg = String()
        msg.data = '你好，世界! %d' % self.i
        self.publisher_.publish(msg)
        self.get_logger().info('正在发布: "%s"' % msg.data)
        self.i += 1

def main(args=None):
    # 初始化 rclpy 库
    rclpy.init(args=args)

    # 创建节点实例
    my_node = MyNode()

    # 进入循环，处理回调
    rclpy.spin(my_node)

    # 销毁节点，关闭 rclpy
    my_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

这种将`main`函数和节点类分离的结构，使得节点可以被其他Python脚本导入和复用，是ROS 2中非常标准的写法。
通过遵循上述的功能包和代码结构，你的ROS 2项目将会更加标准化、模块化，并易于团队协作和长期维护。

## 核心配置文件概述

在ROS2中，一个功能包（Package）是一个包含代码、数据和文档的独立单元。每个功能包都包含以下一个或多个配置文件：

- **`package.xml`**: 功能包的“清单”文件。它定义了功能包的名称、版本、作者、依赖项等元数据。**所有功能包都必须有这个文件**。
- **`CMakeLists.txt`**: 用于C++功能包的构建配置文件。它告诉`colcon`这样的构建工具如何编译你的C++代码。
- **`setup.py`**: 用于Python功能包的构建和安装配置文件。它告诉`colcon`如何安装你的Python代码和脚本。

一个功能包可以是纯C++的、纯Python的，或者是混合语言的。

- **C++ 功能包**: 包含 `package.xml` 和 `CMakeLists.txt`。
- **Python 功能包**: 包含 `package.xml` 和 `setup.py`。
- **混合功能包**: 包含 `package.xml`, `CMakeLists.txt` 和 `setup.py`。

----

### 1. `package.xml` 的配置详解

`package.xml`文件描述了功能包的基本信息和依赖关系。这是 `colcon` 构建和ROS环境正确识别你的包所必需的。

#### 1.1 文件结构与常用标签

以下是一个典型的 `package.xml` 文件示例，包含了最常用的标签：

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>my_robot_controller</name>
  <version>0.1.0</version>
  <description>A package to control my awesome robot.</description>
  
  <maintainer email="user@example.com">Your Name</maintainer>
  <license>Apache-2.0</license>

  <buildtool_depend>ament_cmake</buildtool_depend>
  <depend>rclcpp</depend>
  <depend>std_msgs</depend>
  <depend>sensor_msgs</depend>

  <test_depend>ament_lint_auto</test_depend>
  <test_depend>ament_lint_common</test_depend>

  <export>
    <build_type>ament_cmake</build_type>
    </export>
</package>
```

#### 1.2 标签详解

- `<name>`: **必需**。功能包的名称，必须唯一，且只能包含小写字母、数字和下划线。
- `<version>`: **必需**。功能包的版本号，遵循  规范 (如 `主版本.次版本.修订号`)。
- `<description>`: **必需**。对功能包的简短描述。
- `<maintainer>`: **必需**。维护者的姓名和电子邮件地址。
- `<license>`: **必需**。软件许可证，例如 `Apache-2.0`, `MIT`, `BSD-3-Clause` 等。
- `<buildtool_depend>`: **必需**。指定构建工具。
    - 对于C++包，通常是 `ament_cmake`。
    - 对于Python包，通常是 `ament_python`。
- `<depend>`: **非常重要**。声明此功能包在构建和运行时都依赖的其他包。这是最常用的依赖项标签。例如，如果你的代码中 `#include <rclcpp/rclcpp.hpp>`，你就需要添加 `<depend>rclcpp</depend>`。
- `<build_depend>`: 仅在构建时依赖的包。
- `<exec_depend>`: 仅在运行时依赖的包。
- `<test_depend>`: 仅在运行测试时依赖的包。
- `<export>`: **必需**。向ROS系统声明功能包的信息。
    - `<build_type>`: 在这里再次声明构建类型，与 `<buildtool_depend>` 对应。

**最佳实践**:

- 对于一个依赖项，如果你不确定它是构建时依赖还是运行时依赖，直接使用 `<depend>` 是最安全的选择。
- 保持 `package.xml` 的信息准确，`rosdep` 等工具会使用这些信息来自动安装依赖。
- 在ROS1中，CMakeLists中的功能包必须在 `package.xml` 中声明，否则会编译报错。而在ROS2中似乎没有这样的限制。

----

### 2. `CMakeLists.txt` 的配置详解 (C++)

这个文件负责指导如何编译和链接你的C++节点。

#### 2.1 文件结构与常用命令

以下是一个C++节点的 `CMakeLists.txt` 示例：

```CMake
cmake_minimum_required(VERSION 3.8)
project(my_first_package)

# 1. 查找依赖的ROS2包
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
find_package(sensor_msgs REQUIRED)

# 2. 添加可执行文件
add_executable(my_node src/simple_publisher.cpp)

# 3. 链接依赖项到可执行文件
ament_target_dependencies(my_node
  "rclcpp"
  "std_msgs"
  "sensor_msgs"
)

# 4. 安装可执行文件
install(TARGETS my_node
  DESTINATION lib/${PROJECT_NAME}
)

# 5. 安装其他文件（例如launch文件）
install(DIRECTORY launch
  DESTINATION share/${PROJECT_NAME}
)

# 6. 设置测试 (可选)
if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()
```

#### 2.2 命令详解

1. **`find_package(...)`**:

    - 这是配置的第一步，用于查找所有在 `package.xml` 中声明的、且在C++代码中需要用到的依赖包。
    - 每个 `find_package` 都应该对应 `package.xml` 中的一个 `<depend>` 或 `<build_depend>`。
    - `ament_cmake` 是构建ROS2 C++包所必需的，必须首先找到它。
2. **`add_executable(可执行文件名 源文件...)`**:

    - 为你的C++源文件创建一个可执行文件。
    - 第一个参数 `my_node` 是生成的可执行文件的名称。
    - 后续参数是用于编译这个可执行文件的源文件路径，例如 `src/my_node.cpp`。
3. **`ament_target_dependencies(可执行文件名 依赖包...)`**:

    - **至关重要的一步**。将 `find_package` 找到的包链接到你用 `add_executable` 创建的目标上。
    - 如果缺少这一步，编译时会报 “undefined reference to...” 的链接错误。
    - 引用的依赖包名称必须与 `find_package` 中的名称一致（用引号括起来）。
4. **`install(TARGETS ...)`**:

    - 将编译生成的可执行文件安装到ROS2环境能够找到它的地方（`install/my_robot_controller/lib/my_robot_controller/`）。
    - `DESTINATION lib/${PROJECT_NAME}` 是ROS2 C++节点的标准安装路径。
5. **`install(DIRECTORY ...)`**:

    - 安装(直接复制文件或软链接的方式)非代码文件，如 `launch` 文件、`urdf` 文件、`rviz` 配置文件等。
    - `DESTINATION share/${PROJECT_NAME}` 是这些文件的标准安装路径。
6. **`ament_package()`**:

    - 文件末尾的必需命令，用于处理所有 `install()` 命令并完成打包。

----

### 3. `setup.py` 的配置详解 (Python)

这个文件使用Python的 `setuptools` 库来描述如何安装你的Python包和脚本。

#### 3.1 文件结构与常用配置

以下是一个Python功能包的 `setup.py` 示例：

```Python
from setuptools import find_packages, setup
import os
from glob import glob

package_name = 'my_python_pkg'

setup(
    name=package_name,
    version='0.1.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        (os.path.join('share', package_name, 'launch'), glob('launch/*launch.py')),
        (os.path.join('share', package_name, 'config'), glob('config/*.yaml')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Your Name',
    maintainer_email='user@example.com',
    description='A simple Python ROS2 package.',
    license='Apache-2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'my_py_node = my_python_pkg.my_node:main',
            'another_node = my_python_pkg.another_node:main',
        ],
    },
)
```

#### 3.2 配置项详解

- `name`: 包名，应与 `package.xml` 中的 `<name>` 一致。
- `version`: 版本号，应与 `package.xml` 中的 `<version>` 一致。
- `packages`: 指定要安装的Python模块。`find_packages(exclude=['test'])` 会自动查找当前目录下所有的Python包（包含 `__init__.py` 文件的目录），并排除 `test` 目录。
- `data_files`: **非常重要**。用于安装非Python代码文件。它是一个元组列表 `(目标目录, [源文件列表])`。
    - `('share/ament_index/resource_index/packages', ['resource/' + package_name])`: 让ROS2系统能够找到这个功能包，**必需**。
    - `('share/' + package_name, ['package.xml'])`: 将 `package.xml` 文件安装到标准位置，**必需**。
    - `(os.path.join('share', package_name, 'launch'), glob('launch/*launch.py'))`: 安装 `launch` 目录下的所有 `launch.py` 文件。
    - `(os.path.join('share', package_name, 'config'), glob('config/*.yaml'))`: 安装 `config` 目录下的所有 `.yaml` 配置文件。
- `install_requires`: 列出此Python包的运行时依赖。这些依赖项会通过 `pip` 自动安装。注意：这里的依赖是Python库（如 `numpy`），而不是ROS包。ROS包的依赖在 `package.xml` 中声明。
- `zip_safe=True`: 通常保持为 `True` 即可。
- `maintainer`, `maintainer_email`, `description`, `license`: 与 `package.xml` 中的信息保持一致。
- `entry_points`: **至关重要**。定义了可执行脚本的“入口点”，即 `ros2 run` 命令可以调用的节点。
    - `'console_scripts'`: 是一个列表，定义了所有控制台脚本。
    - `'my_py_node = my_python_pkg.my_node:main'`:
        - `my_py_node`: 是你希望在命令行中使用的可执行文件名 (`ros2 run my_python_pkg my_py_node`)。
        - `my_python_pkg.my_node`: 指向 `my_python_pkg` 目录下的 `my_node.py` 文件。
        - `:main`: 指向该文件中的 `main` 函数。ROS2节点通常以调用 `main` 函数作为启动。

#### 总结与工作流程

1. **创建功能包**:

    - 使用 `ros2 pkg create --build-type ament_cmake my_cpp_pkg --dependencies rclcpp std_msgs` 创建C++包。
    - 使用 `ros2 pkg create --build-type ament_python my_py_pkg --dependencies rclpy std_msgs` 创建Python包。
    - 这些命令会自动生成模板化的配置文件。
2. **编辑 `package.xml`**:

    - 首先填写描述、作者、许可证信息。
    - 在你添加新的依赖（如 `sensor_msgs`）时，记得在这里添加 `<depend>sensor_msgs</depend>`。
3. **编写代码并配置构建文件**:

    - **对于C++包**:
        - 在 `src` 目录下编写 `.cpp` 文件。
        - 在 `CMakeLists.txt` 中，使用 `find_package` 查找新依赖，`add_executable` 添加新节点，并用 `ament_target_dependencies` 链接它们。
    - **对于Python包**:

        - 在与 `setup.py` 同级的包目录（如 `my_py_pkg`）下编写 `.py` 文件。
        - 在 `setup.py` 的 `entry_points` 中为你的新节点添加一个入口点。
4. **安装附加文件**:

    - 将 `launch` 文件、配置文件等放入功能包的相应目录（如 `launch/`, `config/`）。
    - 在 `CMakeLists.txt` (使用 `install(DIRECTORY ...)` ) 或 `setup.py` (在 `data_files` 中添加条目) 中配置安装规则。
5. **构建和测试**:

    - 回到工作区的根目录，运行 `colcon build --packages-select <你的包名>`。
    - `source install/setup.bash`。
    - 使用 `ros2 run <你的包名> <你的节点名>` 运行你的节点，检查是否一切正常。

一般来说，我们使用直接复制已有功能包的文件夹然后修改功能包名字的方法来创建新的功能包。(笑)

好的，我们来补充关于ROS2中Launch文件的配置教程。

----

### 4. Launch文件配置详解

在ROS2中，Launch文件是一个强大的工具，用于同时启动和配置一个或多个节点。想象一下一个复杂的机器人系统，可能需要同时运行十几个节点（感知、定位、规划、控制等），手动一个一个地用 `ros2 run` 启动会非常繁琐且容易出错。Launch文件就是为了解决这个问题而生的。
**Launch文件的核心功能：**

- **同时启动多个节点**：一次性运行整个应用程序。
- **自动配置节点**：为节点设置参数（parameters）、重映射话题（remapping topics/services/actions）、设置命名空间（namespaces）等。
- **启动其他Launch文件**：模块化地组织和复用启动配置。
- **控制执行流程**：可以设置节点的启动顺序、条件启动等。

ROS2主要支持两种格式的Launch文件：
1. **Python Launch文件 (`.launch.py`)**: 这是**推荐**的、功能最强大的格式。你可以利用Python的全部编程能力（如循环、条件、函数）来创建动态和复杂的启动配置。
2. **XML Launch文件 (`.launch.xml`)**: 语法更简单、更声明式，类似于ROS1的 `.launch` 文件。适合简单的启动场景。

下面我们分别详细介绍这两种格式的配置。

----

#### 4.1 Python Launch文件 (`.launch.py`)

Python launch文件通常存放在功能包的 `launch/` 目录下。

##### 4.1.1 基本结构

一个基本的Python launch文件看起来像这样：

```Python
# 导入所需的库
from launch import LaunchDescription
from launch_ros.actions import Node

# 所有launch文件都必须包含一个名为 generate_launch_description 的函数
def generate_launch_description():
    
    # 创建一个LaunchDescription对象
    ld = LaunchDescription()

    # 定义要启动的节点
    talker_node = Node(
        package='demo_nodes_cpp',
        executable='talker',
        name='my_talker'  # 可选：为节点设置一个自定义名称
    )

    listener_node = Node(
        package='demo_nodes_cpp',
        executable='listener'
    )

    # 将节点添加到LaunchDescription中
    ld.add_action(talker_node)
    ld.add_action(listener_node)

    # 返回LaunchDescription对象
    return ld
```

**核心概念**:

- **`generate_launch_description()` 函数**: 这是launch系统的入口点。当你用 `ros2 launch` 运行此文件时，ROS2会执行这个函数并获取它返回的 `LaunchDescription` 对象。

- **`LaunchDescription` 对象**: 这是一个容器，用于存放所有要执行的“动作”（Actions）。

- **动作（Action）**: 最常见的动作就是 `Node`，它代表启动一个ROS节点。

##### 4.1.2 常用配置与`Node`动作的参数

`Node` 动作提供了丰富的参数来配置节点：

```Python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='turtlesim',          # 节点所在的功能包名
            executable='turtlesim_node',  # 节点的可执行文件名
            name='sim',                   # 运行时的节点名
            namespace='turtlesim1',       # 节点的命名空间
            output='screen',              # 将节点的输出打印到终端
            remappings=[                  # 重映射列表
                ('/input/pose', '/turtlesim1/turtle1/pose'),
                ('/output/cmd_vel', '/turtlesim1/turtle1/cmd_vel')
            ],
            parameters=[                  # 参数列表
                {'background_r': 255},
                {'background_g': 0},
                {'background_b': 0}
            ]
        )
    ])
```

- **`package`**: 功能包名 (必需)。
- **`executable`**: 可执行文件名 (必需)。
- **`name`**: 覆盖节点在代码中设置的默认名称。
- **`namespace`**: 为节点下的所有话题、服务等添加一个命名空间前缀。这对于在同一个系统里运行多个相同机器人实例非常有用。
- **`output='screen'`**: 将节点的 `stdout` 和 `stderr` 直接输出到当前终端，方便调试。默认是输出到日志文件。
- **`remappings`**: 重映射。它是一个元组列表 `[('from', 'to')]`。上面的例子将节点内部使用的 `/input/pose` 话题映射到全局的 `/turtlesim1/turtle1/pose` 话题。
- **`parameters`**: 为节点设置参数。它可以是一个字典列表，或者是一个YAML文件的路径。


##### 4.1.3 包含其他Launch文件
模块化是良好设计的关键。你可以一个launch文件里包含另一个。

```Python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource

def generate_launch_description():

    # 获取另一个功能包的share目录路径
    turtlesim_pkg_share = get_package_share_directory('turtlesim_bringup')
    
    # 定义要包含的launch文件的完整路径
    turtlesim_launch_file = os.path.join(
        turtlesim_pkg_share, 'launch', 'turtlesim_bringup.launch.py'
    )

    turtlesim_bringup = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(turtlesim_launch_file)
    )

    return LaunchDescription([
        turtlesim_bringup
    ])
```

##### 4.1.4 使用启动参数 (Launch Arguments)

Launch参数允许你在运行 `ros2 launch` 命令时动态地传入值，使launch文件更加灵活和可复用。

```Python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    
    # 1. 声明一个启动参数 'turtle_name'
    turtle_name_arg = DeclareLaunchArgument(
        'turtle_name',
        default_value='my_turtle',
        description='Name of the turtle to be spawned'
    )

    # 2. 使用 LaunchConfiguration 获取参数的值
    turtle_name = LaunchConfiguration('turtle_name')

    # 3. 在Node定义中使用该值
    # 注意这里使用的是 turtle_name 变量，而不是字符串
    turtle_spawner_node = Node(
        package='turtlesim',
        executable='spawn',
        arguments=[
            '--name', turtle_name, 
            '--x', '4', 
            '--y', '2',
            '--theta', '0.2'
        ]
    )

    return LaunchDescription([
        turtle_name_arg,
        turtle_spawner_node
    ])
```

##### **如何运行带参数的launch文件:**

```
# 使用默认值 'my_turtle'
ros2 launch my_pkg my_launch_file.launch.py

# 传递自定义值 'tina'
ros2 launch my_pkg my_launch_file.launch.py turtle_name:=tina
```
----
#### Launch文件的安装

最后，别忘了安装你的Launch文件！
无论你使用哪种格式，都需要在 CMakeLists.txt (对于C++包) 或 setup.py (对于Python包) 中添加安装规则，将 launch/ 目录安装到 share/<你的包名>/ 目录下，这样 ros2 launch 命令才能找到它们。

**CMakeLists.txt (C++)**:

```CMake
install(DIRECTORY launch
  DESTINATION share/${PROJECT_NAME}
)
```

**setup.py (Python)**:

```Python
import os
from glob import glob
# ...
setup(
    # ...
    data_files=[
        # ... 其他条目
        (os.path.join('share', package_name, 'launch'), glob('launch/*launch.[pxy][yma]*')),
    ],
    # ...
)
```

这个 `glob` 表达式 `*launch.[pxy][yma]*` 可以匹配 `.launch.py`, `.launch.xml`, `.launch.yaml` 等所有类型的launch文件。


