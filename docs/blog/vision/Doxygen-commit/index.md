---
title: Doxygen与commit规范
date: 2024-10-15
description: >
resources:
  - src: "**.{png,jpg}"
    title: "Image #:counter"
    params:
      byline: ""
---

<div style="text-align: right;">  
    <div>author : lbx   </div>  
</div>

!!! info "提示"
    本文写作的时候脑子有一些混乱，写的不是很好，希望读者可以进行调整和补充。

# 开始之前
在开始之前，你可以在vscode中下载插件**通灵译码**、**GitHub copilot**、**Trae**等插件，也可以使用`cursor`、`windsurf`这些Code编辑器，能极大~~偷懒~~提升效率。
示例：

![](1.png)
# 什么是Doxygen

Doxygen 是一种**文档生成工具**，常用于整个项目的Doxyfile的生成，主要用于从源代码中提取注释，并生成技术文档。它广泛用于 C++、C、Java、Python 等多种编程语言中，帮助开发者自动生成文档，从而提高代码的可读性和维护性。
### 具体功能：

1. **从代码注释中生成文档**：Doxygen 通过解析源代码中的特殊注释格式，将其转换成 HTML、LaTeX、XML 等多种格式的文档。
    
2. **支持多种编程语言**：除了 C 和 C++，Doxygen 还支持 Java、Python、PHP 等许多其他语言。
    
3. **交叉引用代码和文档**：Doxygen 可以生成类结构、函数调用图等内容，使得文档与代码紧密结合，便于开发者理解代码的架构。
    
4. **可生成不同格式的输出**：例如 HTML 文档可以方便地作为在线帮助系统，LaTeX 格式可以用于打印高质量的 PDF 文档。
# 下载与使用
## vscode插件
在扩展商店里搜索并安装如下扩展
- Doxygen Documentation Generator
![](2.png)

接着按下`ctrl+shift+p`，输入`settings.json`，打开工作区设置，可以设置快捷键和默认样式
```json
{
  // 触发快捷键
  "doxdocgen.c.triggerSequence": "///"   //在方法名前插入 `///`+回车，触发方法注释
}
```
进一步也可以：
```json
{
  // 起始行样式
  "doxdocgen.c.firstLine": "/*!",
  // 模版文件样式
  "doxdocgen.cpp.tparamTemplate": "@tparam{indent:15}{param}",
  // 文件头注释样式
  "doxdocgen.file.fileTemplate": "@file{indent:15}{name}",
  // 方法注释样式
  "doxdocgen.generic.useGitUserName": true,
  "doxdocgen.generic.authorTag": "@author{indent:15}{author}",
  "doxdocgen.generic.briefTemplate": "@brief{indent:15}{text}",
  "doxdocgen.generic.dateTemplate": "@date{indent:15}{date}",
  "doxdocgen.generic.paramTemplate": "@param{indent:15}{param}",
  "doxdocgen.generic.returnTemplate": "@return{indent:15}{type}",
  // 自定义标签、顺序
  "doxdocgen.file.fileOrder": ["file", "author", "date"],
  "doxdocgen.generic.customTags": ["@attention"]
}
```
## Windows下载doxygen
 - 打开开始菜单，查找“Doxygen”。如果未找到，说明你需要下载并安装 Doxygen。
 - 访问 [Doxygen 官方下载页面](http://www.doxygen.nl/download.html)，下载适用于 Windows 的 Doxygen 安装包。
 - 安装完成后，重新打开 VSCode 尝试运行 `doxygen`。
## Ubuntu / Linux
```bash
	sudo apt-get install doxygen
```
打开终端，编辑 `.bashrc` 文件:
```bash
	vim ~/.bashrc  # 对于 Bash Shell
```
添加以下内容：
```
	export PATH="/usr/local/bin:$PATH"
```
保存文件并刷新终端配置：
```bash
	 source ~/.bashrc  # 使用 Bash
```
## 使用
### 文件头
这部分包括`license`、版权声明注释、文件描述注释。
![](3.png)
## 方法
接着在函数名前、`#include`前输入`/***/`或者`///`并且分行，便可以使用`Doxygen`。
![](4.png)
将鼠标`hover`在函数上会出现如下信息：
![](5.png)
## 生成Doxyfile

打开当前工作目录，在终端中输入:
```bash
	doxygen -g // g是generate，用于生成默认的 `Doxyfile` 配置文件。
```
此时你的项目下会多一个`Doxyfile`。
![](6.png)如果你想进一步，可以：
```bash
	doxygen
```
你的项目下会生成`html`和`latex`文件夹。

# 语法
## 文件
- @file： 文件名
- @brief：文件一句话介绍
- @author：文件作者
- @date：修改日期
- @see：额外的一些参考信息，比如有用过的链接
- @addtogroup ：创建方法分组 ，`@{` 和 `@}` 表示分组的开始和结束

## 变量前的注释

```c
/**
 * @brief Use brief, otherwise the index won't have a brief explanation.
 * Detailed explanation.
 */
typedef struct BoxStruct
{
    int a;    /**< Some documentation for the member BoxStruct#a. */
    int b;    /**< Some documentation for the member BoxStruct#b. */
    double c; /**< Etc. */
} tBoxStruct;
```
## API 方法注释样例
```c
/* GLOBAL FUNCTIONS */
/**
 * @brief Example showing how to document a function with Doxygen.
 *
 * Description of what the function does. This part may refer to the parameters
 * of the function, like @p param1 or @p param2. A word of code can also be
 * inserted like @c this which is equivalent to <tt>this</tt> and can be useful
 * to say that the function returns a @c void or an @c int. If you want to have
 * more than one word in typewriter font, then just use @<tt@>.
 * @param [in] param1 Description of the first parameter of the function.
 * @param [out] param2 The second one, which follows @p param1, and represents output. //变量
 *
 * @return Describe what the function returns.
 * @retval XXX_OK if successful.
 * @see doxygen_theSecondFunction
 * @see Box_The_Last_One
 * @see <http://website/>
 * @note Something to note.
 * @warning Warning.
 */
int doxygen_theFirstFunction(int param1, int param2);

这里应该用到@addtogroup 和 @{ ... @}，表示这个组的定义从这里开始，直到 `@}` 结束。

```c
/** @addtogroup DOXYGEN_API
 * @brief Doxygen api example.
 *
 * Detailed api description.
 *
 * @{
 */

/**
 * @brief A sample function in the API group.
 * 
 * This function demonstrates a typical API function.
 * 
 * @param a Input parameter.
 * @return Result of some computation.
 */
int sample_function(int a) {
    return a * 2;
}

/** @} */

```
结果在doxygen Doxyfile中：
```c
API Groups:
- DOXYGEN_API
    - sample_function (A sample function in the API group)
```


- @param：标记变量 [in] [out]表示输入输出方向
- @return：返回值描述
- @retval：具体返回值及其含义
- @see：link信息
- @note：备注信息
- @warning：需要方法使用者注意的信息，比如：功能未经完全验证

# commit规范

## 1.示例
![](example.png)
## 2. 提交标题(Subject Line)
- **动词时态**：使用 **祈使句**（动词原型），描述这次提交所做的工作。比如：
    
    - `Add login feature`（添加登录功能）
    - `Fix button alignment issue`（修复按钮对齐问题）
    - `Update README for installation instructions`（更新 README，添加安装说明）

## 3. 常见的提交类型
为了规范化提交标题中的描述，项目或团队会使用特定的前缀来标记提交的类型。这些前缀可以帮助人们快速了解提交的目的。例如：
- **feat**：引入新功能（feature）。
    - `feat: add user login functionality`
- **fix**：修复 bug。
    - `fix: resolve password hashing issue`
- **docs**：仅更新文档。
    - `docs: update API documentation`
- **style**：代码风格的调整（不涉及功能或逻辑变化），如格式化、空格调整等。
    - `style: reformat code with prettier`
- **refactor**：重构代码，通常是改善代码结构，但没有新功能或 bug 修复。
    - `refactor: optimize login function`
- **test**：添加或修改测试。
    - `test: add tests for user authentication`
- **chore**：不影响源代码的其他更改，如构建过程、依赖管理等。
    - `chore: update npm dependencies`
- **perf**：性能优化。
    - `perf: improve database query performance`

## 4.参考资料

具体可以[参考这篇文档](https://zhuanlan.zhihu.com/p/684354477)
[如何规范你的Git commit？ - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/182553920)

