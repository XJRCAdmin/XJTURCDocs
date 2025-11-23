---
title: Blender 自动化数据集生成指南
date: 2025-11-22
---

# Blender 数据集生成完整指南（完善版）

本指南面向 **熟悉编程但不熟悉 Blender** 的用户，帮助你在 Windows / Ubuntu 环境下，使用 Blender + Python 自动化生成数据集。文档已经对你提供的内容进行了补全、标准化，同时修复了逻辑不严谨的地方，并补全了 Blender API 中常用对象的属性、数据格式说明。

---

# 目录

1. 环境配置
2. 构建模型

   - 2.1 创建基础模型
   - 2.2 UV 贴图（含 Python 实现）

3. 录制 Blender 动画
   - 3.1 进入相机视角
   - 3.2 录制关键帧
4. 光照与背景
   - 4.1 环境光 HDRI（含 Python 自动导入）
   - 4.2 发光物体（用于 mask 渲染）
5. Python 自动化 Blender

   - 5.0 调用 blender 的方式
   - 5.1 初始化 Scene
   - 5.2 遍历动画帧
   - 5.3 物体姿态、矩阵与坐标转换
   - 5.4 渲染 Mask（自动遮挡其他物体）
   - 5.5 更换纹理
   - 5.6 渲染图片 + 写标签

6. 常见 Blender API 数据格式说明
7. 修改项总结

---

# 1 环境配置

这是我的操作系统与 Blender 版本：

- Windows 11 / Ubuntu 22.04
- Blender 4.5
- GPU：RTX 5080 Laptop

确保可通过命令行运行 blender：

```bash
blender -v
```

---

# 构建模型

## 2.0 blender 的可视化界面的使用

推荐观看 up 主 KurTips 的视频以进行深入了解建模
![[初始状态.png]]

## 2.1 创建基础模型

- Blender 默认文件中会包含一个立方体。
- 若你删除了，可通过：
  - GUI 菜单：`Add → Mesh → Cube`
  - 或快捷键：**Shift + A → Mesh → Cube**

### 位置 / 旋转 / 缩放调整

在右侧 **Object Properties（蓝色图标）**：

- **Location**: 物体在世界坐标的位置
- **Rotation**: 欧拉角（默认 XYZ）
- **Scale**: 缩放

![[方块位置调整.png]]
或使用 Python：

```python
obj.location = (1.0, 2.0, 3.0)
obj.rotation_mode = 'XYZ'
obj.rotation_euler = (math.radians(45), 0, math.radians(90))
obj.scale = (1.0, 2.0, 1.0)
```

---

## 2.2 UV 贴图

这一个操作是用于进行方块表面的纹理（平面）进行处理。这里的操作有些复杂，在 blender 的图形界面里面的实现可以参照 KurTips 的视频里材质篇有关 UV 纹理绘制的部分。
![[纹理信息的节点展示.png]]
使用 API 打开时，Blender 中材质一般使用以下节点：

- **Image Texture** → **BSDF（Principled BSDF）** → **Material Output**

Python 示例：

```python
mat = obj.active_material
nodes = mat.node_tree.nodes
tex = nodes.new("ShaderNodeTexImage")
tex.image = bpy.data.images.load("path/to/texture.png")
```

若已经存在 Image Texture 节点，修改图像：

```python
tex_node.image = bpy.data.images.load(tex_path)
```

---

# 录制 Blender 动画

## 3.1 进入相机视角

- 选中相机 → 小键盘 0
- 没有小键盘：`View → Cameras → Active Camera`（左上角菜单）

进入“飞行模式”：**Shift + ~**（波浪线）

## 3.2 录制关键帧

- 打开底部的 **Timeline**
- 点击红色圆点启用自动关键帧
- 在飞行模式下移动相机会自动记录位置和旋转

![[录制关键帧.png]]

---

# 光照与背景

## 4.1 环境光 HDRI

GUI/图形化界面操作：

1. 右上角 viewport 的“圆球按钮”进入材质预览
2. 取消勾选 **Use Scene World**
3. World 节点中添加 **Environment Texture**
   ![[在图形化界面打开HDRI的效果.png]]

Python 自动导入 HDRI：

```python
def enable_hdri(hdri_path):
    world = bpy.data.worlds["World"]
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links

    # 清除已有环境贴图
    for n in nodes:
        if n.type == "ENVIRONMENT_TEXTURE":
            nodes.remove(n)

    env = nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(hdri_path)

    links.new(env.outputs["Color"], nodes["Background"].inputs["Color"])
```

---

## 4.2 发光物体

使用发光材质，让物体变成纯白，背景变成纯黑，目前可以用于生成 mask。

---

# Python 自动化 Blender

## 5.0 调用 blender 的方式

Windows:

```bash
E:blender/blender.exe -b scene.blend -P script.py
```

Ubuntu 相似形式。

---

# 5.1 初始化 Scene

```python
scene = bpy.context.scene
camera = scene.camera
W = scene.render.resolution_x
H = scene.render.resolution_y
```

设置渲染参数：

```python
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
```

---

# 5.2 遍历动画帧

```python
frame_start = scene.frame_start
frame_end = scene.frame_end

for frame in range(frame_start, frame_end + 1):
    scene.frame_set(frame)
    bpy.context.view_layer.update()
```

---

# 5.3 物体姿态、矩阵、坐标转换

## 获取物体：

```python
obj = bpy.data.objects[name]
```

## 常见属性

| 属性                      | 数据类型        | 说明                      |
| ------------------------- | --------------- | ------------------------- |
| `obj.location`            | Vector((x,y,z)) | 世界坐标                  |
| `obj.rotation_euler`      | Euler           | 角度制：弧度              |
| `obj.rotation_quaternion` | Quaternion      | 四元数姿态                |
| `obj.matrix_world`        | Matrix(4x4)     | 世界变换矩阵              |
| `obj.data.vertices`       | 顶点数组        | 每个 vertex.co 是局部坐标 |
| `camera.matrix_world`     | Matrix          | 相机姿态矩阵              |

## 顶点 → 世界坐标

```python
coords_world = [(obj.matrix_world @ v.co) for v in obj.data.vertices]
```

## 世界坐标 → 相机空间

```python
coords_cam = [camera.matrix_world.inverted() @ p for p in coords_world]
```

## 相机空间 → 图像平面

```python
uv = world_to_camera_view(scene, camera, world_point)
```

返回：`Vector((x, y, z))`：

- x: 0..1 左到右
- y: 0..1 下到上
- z: 深度（z < 0 通常视为在相机前方）

注意：Blender 相机朝向 **-Z 轴**。

---

# 5.4 Mask 渲染（遮挡其他物体）

1.可以通过之前获得的顶点数据进行计算得到

2.通过给方块赋予发光属性对其进行渲染得到轮廓，在后期通过边缘检测函数得到 mask 边界，以下是其步骤：

1. 创建白色发光材质
2. 创建黑色 World
3. 隐藏非目标物体
4. 渲染
5. 恢复所有设置

```python
# 创建白色发光材质
mask_mat = bpy.data.materials.new(name="MaskMat")
mask_mat.use_nodes = True
nodes_mask = mask_mat.node_tree.nodes
links_mask = mask_mat.node_tree.links
nodes_mask.clear()
emission = nodes_mask.new(type='ShaderNodeEmission')
emission.inputs['Color'].default_value = (1,1,1,1)
output_node = nodes_mask.new(type='ShaderNodeOutputMaterial')
links_mask.new(emission.outputs['Emission'], output_node.inputs['Surface'])

# 创建黑色背景 World
original_world = bpy.context.scene.world
mask_world = bpy.data.worlds.new("MaskWorld")
mask_world.use_nodes = True
nodes = mask_world.node_tree.nodes
links = mask_world.node_tree.links
nodes.clear()
bg = nodes.new(type='ShaderNodeBackground')
bg.inputs['Color'].default_value = (0,0,0,1)  # 黑色
bg.inputs['Strength'].default_value = 0.0
output_node_world = nodes.new(type='ShaderNodeOutputWorld')
links.new(bg.outputs['Background'], output_node_world.inputs['Surface'])

```

应用这个 world：

```python
# 保存原始 World
original_world = bpy.context.scene.world
# 应用临时 World
bpy.context.scene.world = mask_world
old_mats = cube.data.materials[:]
cube.data.materials.clear()
cube.data.materials.append(mask_mat)

# 隐藏其他对象
hidden_objs = []
for ob in bpy.data.objects:
	if ob.name != cube_name:
		hidden_objs.append(ob)
		ob.hide_render = True

mask_path = os.path.join(mask_dir, f"{img_id:04d}_mask.png")
bpy.context.scene.render.filepath = mask_path
bpy.ops.render.render(write_still=True)

# 恢复材质和隐藏状态
cube.data.materials.clear()
for m in old_mats:
	cube.data.materials.append(m)
for ob in hidden_objs:
	ob.hide_render = False

# ------------------ 恢复原始 World ------------------

bpy.context.scene.world = original_world
```

这是我的个人比较生草（即不优美，不高效，但能跑）的代码，仅供借鉴。
![[0000_mask.png]]

---

# 5.5 更换纹理

使用 Image Texture 节点替换纹理即可。
其中，texture_dir 是指放置纹理图案的文件位置

```python
texture_files = sorted([f for f in os.listdir(texture_dir) if f.lower().endswith(('.png','.jpg','.jpeg'))])
# 获取材质中的 Image Texture 节点
    mat = cube.active_material
    nodes = mat.node_tree.nodes
    tex_node = None
    for node in nodes:
        if node.type == 'TEX_IMAGE':
            tex_node = node
            break
    if tex_node is None:
        raise ValueError("没有找到 Image Texture 节点！")
    for tex in texture_files:
        tex_path = os.path.join(texture_dir, tex)
            # 替换纹理
            tex_node.image = bpy.data.images.load(tex_path)
```

---

# 5.6 渲染图片 + 写标签

```python
# ========= 渲染 =========

img_path = os.path.join(image_dir, f"{img_id:06d}.jpg")
scene.render.filepath = img_path
bpy.ops.render.render(write_still=True)
# ========= 写标注 =========
label_path = os.path.join(label_dir, f"{img_id:06d}.txt")
with open(label_path, "w") as f:
	for obj in cube_all:
		bbox = compute_yolo_bbox(obj)
		if bbox is None:
			continue
		cls_id = cube_to_class[obj.name]
		x, y, w, h = bbox
		f.write(f"{cls_id} {x:.6f} {y:.6f} {w:.6f} {h:.6f}\n")

img_id += 1
```

需要强调：

- 渲染前必须 `bpy.context.view_layer.update()`
- compute_yolo_bbox()是我自己写的一个函数，输入对象，输出其在相机视野内的 bbox 同时用于检查顶点是否全部在相机后方。

---

## 7. Blender 常用 API 说明

### 7.1 Object（物体）API

- `obj.location`: Vector，物体在世界坐标的位置
- `obj.rotation_euler`: Euler 角（弧度制）
- `obj.rotation_quaternion`: Quaternion 四元数旋转
- `obj.scale`: 缩放
- `obj.matrix_world`: 4×4 世界变换矩阵
- `obj.data.vertices`: mesh 顶点（局部坐标）
- `obj.bound_box`: 局部包围盒顶点
- `obj.to_mesh()`: 获取用于计算的 mesh 数据

### 7.2 Camera（相机）API

- `camera.location`: 相机位置
- `camera.rotation_euler`: 欧拉角旋转
- `camera.matrix_world`: 世界矩阵
- `camera.data.lens`: 焦距（mm）
- `camera.data.sensor_width/height`: 传感器尺寸
- `camera.data.type`: 相机类型 PERSP / ORTHO
- `camera.data.ortho_scale`: 正交相机大小

如果大家使用的是 D435I 相机的话，那么焦距是 4.16mm，底片大小是 5.76mm。不过，大家也可进行更准确的标定。

世界 → 相机矩阵转换：

```python
p_cam = camera.matrix_world.inverted() @ p_world
```

### 7.3 world_to_camera_view API

将世界坐标映射到相机 UV：

```python
uv = world_to_camera_view(scene, camera, p_world)
```

返回：

- `uv.x`: 0~1 水平映射
- `uv.y`: 0~1 垂直映射
- `uv.z`: 深度（near→far 0~1）

### 7.4 Matrix（矩阵）API

- `M @ v`: 矩阵乘点
- `M.inverted()`: 求逆矩阵
- `M.to_3x3()`: 取旋转部分

矩阵结构：

```
| R R R Tx |
| R R R Ty |
| R R R Tz |
| 0 0 0  1 |
```

### 7.5 Euler（欧拉角）API

```python
Euler((x, y, z), order='XYZ')
euler.to_quaternion()
euler.to_matrix()
```

### 7.6 Quaternion（四元数）API

```python
Quaternion((w, x, y, z))
q.to_euler()
q.to_matrix()
q1 @ q2  # 组合旋转
```

### 7.7 Mesh 顶点与法线 API

- `v.co`: 顶点坐标（局部）
- `v.normal`: 顶点法线

世界法线：

```python
normal_world = obj.matrix_world.to_3x3() @ v.normal
```

### 7.8 Scene API

- `scene.render.resolution_x/y`: 分辨率
- `scene.camera`: 当前相机
- `scene.frame_set(f)`: 设置帧

## 写在最后的话

这是我对 blender 的一点小开发，还有很多引擎以及软件可以使用（如 unity 之类的游戏引擎），blender 也可以用于开发更加复杂的场景。希望大家多多学习。
