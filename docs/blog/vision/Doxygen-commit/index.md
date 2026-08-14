---
title: Codex 使用与 DeepSeek API 接入
date: 2026-08-14
description: 在 VS Code 和终端中使用 Codex，并通过 Responses API 接入 DeepSeek 模型。
---

# Codex 使用与 DeepSeek API 接入

Codex 是面向软件开发工作的智能编程助手。它可以在获得授权后读取项目文件、解释代码、修改文件、运行命令、执行测试并检查修改结果。

本文主要介绍：

1. 在 VS Code 中安装和使用 Codex；
2. 使用 Codex 完成“分析、修改、测试、审查”的开发流程；
3. 使用 `AGENTS.md` 告诉 Codex 项目约定；
4. 通过 DeepSeek Responses API 为 Codex 配置 DeepSeek 模型；
5. 避免泄露 API Key、SSH 私钥和其他敏感信息。

!!! info "资料更新时间"
    本文依据 2026-08-14 可访问的 [OpenAI Codex IDE 文档](https://learn.chatgpt.com/docs/codex/ide)、[Codex CLI 文档](https://learn.chatgpt.com/docs/codex/cli)和 [DeepSeek Codex 接入文档](https://api-docs.deepseek.com/quick_start/agent_integrations/codex)编写。

    Codex、模型名称和 API 兼容性会继续变化。实际配置时应同时检查本文日期和官方文档。

## Codex 能做什么

适合交给 Codex 的工作包括：

- 解释陌生项目的目录结构和数据流；
- 查找某个类、函数、ROS 2 节点或 CMake target 的使用位置；
- 根据明确要求修改代码和文档；
- 运行格式化、编译和测试命令；
- 分析编译错误、链接错误和运行日志；
- 检查未提交的修改，指出潜在缺陷；
- 为重复的开发流程编写脚本；
- 自主配置环境，下载各种驱动，检查电脑的各种问题等。


## 在 VS Code 中安装 Codex

### 安装扩展

在 VS Code 扩展商店中搜索并安装 OpenAI 发布的 Codex 扩展，也可以在终端中执行：

```bash
code --install-extension openai.chatgpt
```

安装完成后：

1. 打开一个项目目录；
2. 点击侧边栏中的 Codex 图标；
3. 如果没有看到图标，按 `Ctrl+Shift+P` 打开命令面板；
4. 运行 `Codex: Open Codex Sidebar`；
5. 按照界面提示登录。

Codex 可以使用当前打开的文件、选中的代码和编辑器上下文。提问时仍应明确指出任务范围、限制条件和验收方式。

### 可选：安装 Codex CLI

如果需要从终端使用 Codex，可以通过 npm 安装：

```bash
npm install -g @openai/codex
codex --version
```

进入项目目录后启动：

```bash
cd <项目目录>
codex
```

第一次启动时，根据提示选择登录方式。VS Code 扩展和 CLI 都使用用户目录中的 Codex 配置。

值得一提的是，由于codex本质上和vscode不是同一个软件，所以有时候vpn在只开启代理的情况下可能会让codex无法联网。通常情况下，开启tun模式能够解决这个问题。

## 推荐的使用流程

### 1. 开始前检查 Git 状态

```bash
git status --short --branch
```

重要修改应在独立分支中完成，并确保已经了解当前未提交的修改属于谁。不要让 Codex 覆盖尚未保存或尚未提交的工作。如果没有git进行保存，当ai犯傻的时候非常难纠正。

### 2. 先让 Codex 分析

对于不熟悉的代码，先要求只读分析：

```text
先不要修改文件。请阅读 src、include 和 CMakeLists.txt，说明这个项目的入口、主要模块、数据流和构建方式，并列出你仍不确定的地方。
```

排查故障时可以这样写：

```text
先诊断，不要修改。下面是完整报错。请结合当前仓库找出最可能的原因，给出证据、验证命令和最小修复方案。
```
推荐在真正实际让ai来改代码之前，先使用他的planmode来给出一个计划，然后在审查之后再继续进行。

### 3. 给出明确的修改边界

```text
只修改 camera_driver/ 目录，修复相机断线后无法重新连接的问题。

要求：
- 不修改公开接口；
- 不增加新的第三方依赖；
- 保留现有日志格式；
- 修改后运行对应单元测试；
- 最后总结修改文件和测试结果。
```

一个好的任务描述通常包含：

- **目标**：最终要解决什么问题；
- **范围**：允许读取和修改哪些文件；
- **限制**：不能改变什么；
- **验证**：需要运行哪些编译或测试命令；
- **交付**：最后需要给出什么结果。

### 4. 审查修改

Codex 完成修改后，必须检查 Git diff：

```bash
git diff --check
git diff --stat
git diff
```

也可以要求 Codex 再做一次只读审查：

```text
请审查当前未提交修改，不要继续编辑。重点检查：
1. 内存生命周期与空指针；
2. 多线程数据竞争；
3. ROS 2 回调和 QoS 是否合理；
4. 错误处理是否完整；
5. 是否存在未运行的测试。
```

### 5. 实际验证

根据项目运行相应命令，例如：

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build --parallel
ctest --test-dir build --output-on-failure
```

ROS 2 项目可能使用：

```bash
colcon build --symlink-install
colcon test
colcon test-result --verbose
```

编译通过不代表可以直接控制机器人。涉及电机、执行机构和真实场地时，还需要限速、急停、架空测试和现场人员确认。

## 权限与安全

Codex 的“沙箱”和“批准策略”是两层不同的控制：

- 沙箱决定 Codex 在技术上能够读取、写入和访问哪些位置；
- 批准策略决定 Codex 在执行某些操作前是否需要询问。

对于受 Git 管理的普通项目，建议使用工作区写入和按需批准：

```toml
# ~/.codex/config.toml
sandbox_mode = "workspace-write"
approval_policy = "on-request"
```

只想让 Codex 阅读和解释时，可以在 Codex 中通过 `/permissions` 切换到只读模式，或从命令行启动：

```bash
codex --sandbox read-only --ask-for-approval on-request
```

!!! danger "谨慎使用完全访问"
    `danger-full-access`、`--yolo` 或跳过所有批准会显著扩大误操作范围。不要在包含重要数据、私人目录、生产凭据或未备份代码的电脑上随意使用。

更多细节见 [OpenAI 的沙箱与批准说明](https://learn.chatgpt.com/docs/agent-approvals-security)。

## 使用 AGENTS.md 固定项目约定

Codex 会在开始工作前读取项目中的 `AGENTS.md`。可以在仓库根目录创建：

```md
# AGENTS.md

## 项目约定

- C++ 标准为 C++20。
- 使用 clang-format，不手动重新排版无关代码。
- 修改 C++ 后运行对应的 CMake 构建和测试。
- ROS 2 发行版为 Humble，Ubuntu 版本为 22.04。
- 不修改相机标定文件、模型权重和现场参数，除非用户明确要求。
- 不提交 API Key、密码、SSH 私钥或 VPN 订阅地址。
- 涉及电机或执行机构时，只提供代码修改，不自动运行实机命令。
```

适合写进 `AGENTS.md` 的内容包括：

- 编译、测试和格式化命令；
- 语言版本、ROS 2 发行版和依赖管理方式；
- 禁止修改的目录或生成文件；
- 代码风格和审查重点；
- 硬件安全边界。

不要把密码和 API Key 写入 `AGENTS.md`。完整规则见 [OpenAI AGENTS.md 文档](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。

## 接入 DeepSeek API

### 工作原理

Codex 客户端可以配置自定义模型提供商。根据 [OpenAI 配置参考](https://learn.chatgpt.com/docs/config-file/config-reference)，自定义提供商使用 Responses API；DeepSeek 官方目前提供了兼容的 Responses API，并给出了 Codex 接入方法。

接入之后：

- 编辑器界面和文件操作能力仍由 Codex 客户端提供；
- 推理模型和 API 费用由 DeepSeek 账户提供；
- Codex CLI、VS Code 扩展和桌面端会读取同一份用户配置；
- 第三方模型与 OpenAI 模型的工具、输入类型和行为不一定完全相同。

### 1. 准备 API Key

在 DeepSeek 平台创建 API Key。不要把 Key 写入教程、截图、Git 仓库或终端命令历史。

可以仅为当前终端会话读取并导出密钥：

```bash
read -rsp "DeepSeek API Key: " DEEPSEEK_API_KEY && echo
export DEEPSEEK_API_KEY
```

关闭终端后，这个环境变量会消失。如果希望 VS Code 扩展读取它，可以在同一个终端中启动 VS Code：

```bash
code .
```

直接从桌面图标启动的 VS Code 不一定继承终端环境变量。长期保存密钥时应使用系统密钥管理方案；简单写入 `.bashrc` 仍然是明文存储。

### 2. 备份 Codex 配置

```bash
mkdir -p ~/.codex
cp ~/.codex/config.toml ~/.codex/config.toml.before-deepseek 2>/dev/null || true
```

### 3. 创建模型目录文件

DeepSeek 当前的 Codex 配置需要 `~/.codex/models.json` 描述可用模型、上下文窗口、推理等级和工具格式。这部分内容较长，而且会随模型更新变化，因此本文不复制一份容易过期的版本。

请打开 [DeepSeek Codex 接入文档](https://api-docs.deepseek.com/quick_start/agent_integrations/codex)，找到“Edit the Configuration File Manually”，展开官方 `models.json`，将完整内容保存为：

```text
~/.codex/models.json
```

保存后验证 JSON：

```bash
python3 -m json.tool ~/.codex/models.json >/dev/null
```

### 4. 编辑 config.toml

编辑 `~/.codex/config.toml`。下面使用 `deepseek-v4-flash` 作为截至本文日期的示例；如果 DeepSeek 官方文档已经更换模型名称，应同时更新 `model` 和 `models.json`。

```toml
model = "deepseek-v4-flash"
model_provider = "deepseek"
preferred_auth_method = "apikey"
forced_login_method = "api"
model_reasoning_effort = "high"
model_catalog_json = "~/.codex/models.json"

sandbox_mode = "workspace-write"
approval_policy = "on-request"

[model_providers.deepseek]
name = "DeepSeek"
base_url = "https://api.deepseek.com/"
wire_api = "responses"
env_key = "DEEPSEEK_API_KEY"
```

这里使用 `env_key` 从环境变量读取密钥。不要把真实密钥替换到这份配置中。

限制配置文件权限：

```bash
chmod 600 ~/.codex/config.toml ~/.codex/models.json
```

### 5. 验证配置

确保当前终端已经设置 `DEEPSEEK_API_KEY`，然后在测试仓库中启动：

```bash
cd <测试项目目录>
codex
```

先执行只读任务：

```text
只读取当前仓库，说明项目类型、入口文件和构建命令，不要修改任何文件。
```

检查以下内容：

- 启动界面显示的模型是否为所选 DeepSeek 模型；
- 是否能读取项目文件；
- 是否能正常返回中文；
- 是否能够完成一次受限的小修改和本地测试；
- 关闭并重新打开 VS Code 后，环境变量是否仍然可见。

### 6. 切回原配置

如果之前存在配置备份，可以恢复：

```bash
cp ~/.codex/config.toml.before-deepseek ~/.codex/config.toml
```

恢复后重新启动 Codex CLI 或 VS Code。不同登录方式和模型提供商的历史会话可能分组显示；切回原配置后，之前的会话通常会重新出现。

## DeepSeek 接入的已知差异

根据 [DeepSeek Responses API 兼容说明](https://api-docs.deepseek.com/guides/responses_api)，第三方兼容并不表示所有 OpenAI Responses API 功能都完全实现。需要特别注意：

- 当前主要支持文本输入，图片和文件输入可能不可用；
- 部分内置工具或参数可能被忽略；
- 工具调用、上下文压缩和推理输出可能与 OpenAI 模型不同；
- 模型名称、上下文长度和支持的推理等级可能变化；
- API 余额、限流和网络问题会直接影响 Codex。

因此，DeepSeek 配置适合用于代码解释、普通编辑和成本敏感的任务；涉及复杂工具链、图片输入或关键修改时，应先用小任务验证兼容性。

## 常见问题

### 提示找不到 API Key

```bash
test -n "$DEEPSEEK_API_KEY" && echo "API Key 已加载" || echo "API Key 未加载"
```

不要使用 `echo $DEEPSEEK_API_KEY`，这会把完整密钥显示在终端和录屏中。

### CLI 可用，但 VS Code 不可用

通常是 VS Code 没有继承环境变量。关闭所有 VS Code 窗口，在已经导出 `DEEPSEEK_API_KEY` 的终端中运行：

```bash
code .
```

### 提示模型不存在

确认以下两处模型名称完全一致：

- `~/.codex/config.toml` 中的 `model`；
- `~/.codex/models.json` 中对应模型的 `slug`。

同时检查 DeepSeek 官方文档是否已经更新模型名称。

### 返回 401 或认证失败

重新创建当前终端的环境变量，检查 API Key 是否有效、账户是否有余额，然后重新启动 Codex。不要把 API Key 发送到群聊或提交到 Issue。

### 配置后 Codex 无法启动

先恢复备份，再逐项检查 TOML 和 JSON：

```bash
python3 -m json.tool ~/.codex/models.json >/dev/null
cp ~/.codex/config.toml.before-deepseek ~/.codex/config.toml
```

## 队内使用原则

- AI 修改必须能够通过 Git diff 审查；
- AI 生成的代码必须经过编译、测试和必要的实机验证；
- 不允许向模型提供服务器密码、SSH 私钥、VPN 订阅和未脱敏数据；
- 不允许让 AI 在无人值守时直接控制机器人执行机构；
- 使用第三方 API 前，应确认代码和数据是否允许发送给该服务；
- 将可复用的项目约定写进 `AGENTS.md`，将确定的知识补充到正式文档。

## 官方资料

- [OpenAI：Codex IDE extension](https://learn.chatgpt.com/docs/codex/ide)
- [OpenAI：Codex CLI](https://learn.chatgpt.com/docs/codex/cli)
- [OpenAI：Codex 配置参考](https://learn.chatgpt.com/docs/config-file/config-reference)
- [OpenAI：沙箱与批准](https://learn.chatgpt.com/docs/agent-approvals-security)
- [OpenAI：AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [DeepSeek：Integrate with Codex](https://api-docs.deepseek.com/quick_start/agent_integrations/codex)
- [DeepSeek：Responses API 兼容说明](https://api-docs.deepseek.com/guides/responses_api)
