---
title: intelrealsense 摄像头的python使用
date: 2024-11-6
description: >
resources:
  - src: "**.{png,jpg}"
---

## Intelrealsense是什么？
是一个深度摄像头的品牌。我们用的摄像头的产品型号是Intelrealsense D435i。

支持双目和深度。

我们使用intelrealsense主要是使用它来检测深度信息，和后续视觉slam需要的点云图。
我们深知从零开始写这个代码是有一定难度的，所以下面给出了完整的使用intelrealsense的代码.

```python

import pyrealsense2 as rs
import numpy as np
import cv2

W = 640
H = 480

pc = rs.pointcloud()
points = rs.points()

pipeline = rs.pipeline()  # 创建一个管道
config = rs.config()  # Create a config并配置要流​​式传输的管道。
config.enable_stream(rs.stream.depth, W, H, rs.format.z16, 15)
config.enable_stream(rs.stream.color, W, H, rs.format.bgr8, 15)
'''
self: pyrealsense2.pyrealsense2.config, 
stream_type: pyrealsense2.pyrealsense2.stream, 
stream_index: int, width: int, height: int, 
format: pyrealsense2.pyrealsense2.format=format.any, 
framerate: int=0
'''
# 使用选定的流参数显式启用设备流

# Start streaming 开启流
pipe_profile = pipeline.start(config)
'''      流水线循环从设备捕获样本，然后根据每个模块的要求和线程模型，将它们传递到连接的计算机视觉模块和处理模块。
         在循环执行期间，应用程序可以通过调用wait_for_frames（）或poll_for_frames（）来访问摄像机流。
         流循环一直运行到管道停止为止。
'''
# Create an align object 创建对其流对象
# "rs.align" allows us to perform alignment of depth frames to others frames
# The "align_to" is the stream type to which we plan to align depth frames.
# (对其流)
align_to = rs.stream.color
align = rs.align(align_to)  # 设置为其他类型的流,意思是我们允许深度流与其他流对齐
# print(type(align))
cap = cv2.VideoCapture(0)

"the parameter is the monitoring position"
def led_practice(x_axis,y_axis):

    while True:

        frames = pipeline.wait_for_frames()  # 等待开启通道,等到新的一组帧集可用为止
        aligned_frames = align.process(frames)  # 将深度框和颜色框对齐
        depth_frame = aligned_frames.get_depth_frame()  # ?获得对齐后的帧数深度数据(图)
        color_frame = aligned_frames.get_color_frame()  # ?获得对齐后的帧数颜色数据(图)
        img_color = np.asanyarray(color_frame.get_data())  # 把图像像素转化为数组
        img_depth = np.asanyarray(depth_frame.get_data())  # 把图像像素转化为数组

        # self: pyrealsense2.pyrealsense2.stream_profile -> rs2::video_stream_profile
        # intrinsics 获取流配置文件的内在属性。
        depth_intrin = depth_frame.profile.as_video_stream_profile().intrinsics
        color_intrin = color_frame.profile.as_video_stream_profile().intrinsics
        #get_extrinsics_to 获取两个配置文件之间的外部转换（代表物理传感器）
        depth_to_color_extrin = depth_frame.profile.get_extrinsics_to(color_frame.profile)

        # 获取深度传感器的深度标尺
        depth_sensor = pipe_profile.get_device().first_depth_sensor()
        depth_scale = depth_sensor.get_depth_scale() # 深度比例系数为： 0.0010000000474974513
        print("scale:", depth_scale)


        # 由深度到颜色
        depth_pixel = [x_axis,y_axis]  # specified pixel
        # rs2_deproject_pixel_to_point获取实际空间坐标 specified point
        depth_point = rs.rs2_deproject_pixel_to_point(depth_intrin, depth_pixel, depth_scale)
        print(depth_point)
        # perspective conversion
        color_point = rs.rs2_transform_point_to_point(depth_to_color_extrin, depth_point)
        # 3D space to XY pixels
        color_pixel = rs.rs2_project_point_to_pixel(color_intrin, color_point)

        pc.map_to(color_frame) # 将点云映射到给定的颜色帧
        points = pc.calculate(depth_frame)  # 生成深度图的点云和纹理映射
        "points.get_vertices() 检索点云的顶点, asanyarray is similar with array"
        vtx = np.asanyarray(points.get_vertices())  # transfor into XYZ
        # tex = np.asanyarray(points.get_texture_coordinates()) # texture map

        # ??????? coordinate transform
        # line by line
        i = W * y_axis + x_axis

        # column by column
        # i = H * x_axis + y_axis


        cv2.circle(img_color, (x_axis, y_axis), 8, [255, 0, 255], thickness=-1)

        cv2.putText(img_color, "Distance/cm:"+str(img_depth[x_axis, y_axis]), (40, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, [255, 0, 255])
        cv2.putText(img_color, "X:"+str(np.float64(vtx[i][0])), (80, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, [255, 0, 255])
        cv2.putText(img_color, "Y:"+str(np.float64(vtx[i][1])), (80, 120), cv2.FONT_HERSHEY_SIMPLEX, 1, [255, 0, 255])
        cv2.putText(img_color, "Z:"+str(np.float64(vtx[i][2])), (80, 160), cv2.FONT_HERSHEY_SIMPLEX, 1, [255, 0, 255])
        print('Distance: ',img_depth[x_axis, y_axis]/10)

        cv2.imshow('depth_frame', img_color)
        cv2.imshow("dasdsadsa", img_depth)

        key = cv2.waitKey(1)
        if key == 27:
            cv2.destroyAllWindows()
            break

led_practice(int(W/2), int(H/2))

cv2.waitKey(0)
cv2.destroyAllWindows()
pipeline.stop()

```


## C++ API

### 利用config初始化摄像头

```cpp

int main(){
  rs2::config cfg;
  std::string serialNumber = "xxxxxxxx"; // 设备序列号，指的是设备在出厂时的生产编号，是单个设备的唯一标记，用来区分指定设备
  cfg.enable_device(serialNumber); // 选择开启该设备
  // 启动颜色视频流，分辨率为frame_width*frame_height, 帧率为frame_rate
  config.enable_stream(rs2_stream::RS2_STREAM_COLOR, frame_width, frame_height, rs2_format::RS2_FORMAT_BGR8, frame_rate);
  // 启动深度视频流，分辨率为frame_width*frame_height, 帧率为frame_rate
  config.enable_stream(rs2_stream::RS2_STREAM_DEPTH, frame_width, frame_height, rs2_format::RS2_FORMAT_Z16, frame_rate);

  // 对齐器，指定向颜色帧对齐
	rs2::align aligned(rs2_stream::RS2_STREAM_COLOR);

  rs2::pipeline pipe;
  rs2::pipeline_profile pipe_profile = pipe.start(config);

  // 图像中心点在像素坐标系下的坐标
  int pixel_point[2] = {frame_width / 2, frame_height / 2};
  while(true)
  {
    // 得到一个图像的集合
    rs2::frameset data = pipe.wait_for_frames();
    // 对齐，得到一个对齐的图像的集合
    rs2::frameset aligned_frames = aligned.process(data);
    // 取出颜色图
		rs2::frame color = aligned_frames.get_color_frame();
    // 取出深度图
    rs2::depth_frame depth_frame.get_depth_frame()
    // 获取该点处的深度
    float distance = depth_frame.get_distance(pixel_point[0], pixel_point[1]);
    // 获取depth 内参
    rs2_intrinsics depth_intrin = depth_frame.get_profile().as<rs2::video_stream_profile>().get_intrinsics();
    // 转换坐标系，从像素(pixel)坐标转换到摄像头空间三维坐标系中的点(point)，本质上是一个逆透视变换(透视变换的英文：projection transform)。
    rs2_deproject_pixel_to_point(cam_coord, &depth_intrin, pixel_point, distance);
  }
}

```


