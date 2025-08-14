# XJTURC 文档仓库
欢迎访问https://xjturc.vercel.app！
## 项目简介
XJTURC（西安交通大学Robocon机器人队）文档仓库是一个为Robocon竞赛团队提供完整技术文档和教程的知识库。本项目旨在为视觉组、电控组、机械组和硬件组等不同技术方向的队员提供系统化的学习资源，帮助新人快速上手并掌握相关技术。

文档内容涵盖：

- 电控组：STM32开发环境搭建、Keil MDK使用、传感器应用、控制算法等
- 机械组：SolidWorks建模、机械设计、加工制造等
- 硬件组：硬件选型、电路设计、开源硬件平台等
- 视觉组：C++开发、Linux基础、Git使用、Docker容器、CMake构建、ROS2定位导航等

## 技术栈
- 文档框架: MkDocs + Material主题
- 部署平台: Vercel（自动部署） + GitHub Actions（CI/CD）
- 版本控制: Git + GitHub
-开发环境: VSCode + Dev Containers
- 构建工具: Python + MkDocs插件生态
## 主要依赖

```yaml
Apply
mkdocs: 静态站点生成器
mkdocs-material: 现代化文档主题
mkdocs-git-authors-plugin: Git作者信息
mkdocs-git-revision-date-localized-plugin: 修订日期本地化
mkdocs-glightbox: 图片灯箱效果
```
## 项目结构
```
XJTURC/
├── docs/                          # 文档源文件
│   ├── blog/                      # 技术博客
│   │   ├── 视觉组/                # 视觉组文档
│   │   │   ├── index.md          # 视觉组主页
│   │   │   ├── GitIntro/         # Git教程
│   │   │   ├── linux/            # Linux基础
│   │   │   ├── CMake/            # CMake教程
│   │   │   ├── docker/           # Docker容器
│   │   │   └── ...
│   │   ├── 电控组/                 # 电控组文档
│   │   │   ├── freshman/         # 新人指南
│   │   │   └── ssh&remotessh/    # SSH远程开发
│   │   ├── 机械组/                 # 机械组文档
│   │   ├── 硬件组/                # 硬件组文档
│   │   ├── 运营组/                # 运营组文档
│   │   └── 四足组/                # 四足机器人组
│   ├── static/                    # 静态资源
│   └── stylesheets/              # 自定义样式
|   |—— javascript/
├── material/                      # Material主题自定义
├── mkdocs.yml                    # MkDocs配置文件
├── requirements.txt              # Python依赖
├── vercel.json                   # Vercel部署配置
└── README.md                     # 项目说明
```
# 快速开始
## 本地开发
### 克隆仓库
```bash
git clone https://github.com/XJRCAdmin/XJTURCDocs.git
cd XJTURCDocs
```
### 安装依赖
#### 项目依赖
```bash
pip install mkdocs
pip install mkdocs-material
```
接着安装依赖
```bash
pip install -r requirements.txt
```
#### 安装vercel依赖
```bash
npm install -g vercel
vercel login
```
### 启动本地服务器
```bash
mkdocs serve
```
访问 http://localhost:8000 查看文档

## 如何贡献
- Fork本仓库
- 创建特性分支
#### 提交你的修改
- 提交你的修改
- 创建Pull Request
#### 文档规范
- 使用Markdown格式编写
- 遵循项目已有的文档结构
- 添加适当的图片和代码示例
- 保持语言简洁明了


## 联系方式
- 目前Admin的QQ: 853889865
- GitHub Issues: 提交问题
- 邮箱: 通过QQ群联系管理员
## 许可证
本项目采用MIT许可证，详见LICENSE文件。

# 致谢
感谢所有为XJTURC文档项目做出贡献的队员和校友！
网站首页的队伍成就展示前端仓库链接:https://github.com/hykself/for-the-rc
****
XJTURC - 西安交通大学Robocon机器人队

让技术传承，让经验共享  
