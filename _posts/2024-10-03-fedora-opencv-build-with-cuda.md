---
layout: post
title: Successfully Built OpenCV with CUDA on Fedora
date: 2024-10-13 08:32
description: A step-by-step guide to building OpenCV from source with advanced features
tags: OpenCV CUDA cuDNN GAPI Fedora
categories: Tech
thumbnail: assets/img/date/Oct_13_2024/theme.png
---

> Building OpenCV from source with CUDA, cuDNN, and GAPI support on Fedora

### Problem Overview

Building OpenCV from source can be challenging, especially when integrating additional modules like CUDA, cuDNN, and G-API. This process involves navigating through various dependencies, configuration options, and potential pitfalls.

### Initial Analysis

Initially, I considered using pre-built OpenCV binaries, which offer:

- **Ease of Installation**: Simple package manager commands for quick setup.
- **Stability**: Tested versions that work out of the box.
- **Limited Features**: Often lack support for advanced capabilities like GPU acceleration.

While pre-built binaries seemed promising due to their simplicity, the lack of advanced features and customization options led me to explore building from source.

### Transition to Building from Source

Recognizing the limitations of pre-built binaries, I shifted to a more comprehensive approach of building OpenCV from source. This method allows for:

- Full control over included modules and features
- Integration of CUDA and cuDNN for GPU acceleration
- Inclusion of specialized modules like G-API

### Detailed Solution

1. **System Setup**:
   ```bash
   sudo dnf update
   sudo dnf install cmake gcc gcc-c++ git libpng-devel libtiff-devel libjpeg-devel ffmpeg-devel gtk3-devel qt5-qtbase-devel python3-devel python3-numpy
   ```

   Install CUDA and cuDNN:
   cuda link: https://developer.nvidia.com/cuda-downloads
   cudnn link: https://developer.nvidia.com/cudnn

  Then copy the `*.h` files to `/usr/local/cuda/include` and `*.so` files to `/usr/local/cuda/lib64`.(**With symbolic links**)

2. **Clone Repositories**:
   ```bash
   mkdir -p ~/Library/opencv_build
   cd ~/Library/opencv_build
   git clone https://github.com/opencv/opencv.git
   git clone https://github.com/opencv/opencv_contrib.git
   ```

3. **Clone ade for G-API**:
   ```bash
   cd ~/Library/opencv_build/opencv
   git clone https://github.com/opencv/ade.git 3rdparty/ade
   ```

4. **Configure with CMake**:
   ```bash
   cd ~/Library/opencv_build/opencv
   mkdir build && cd build
   cmake -DOPENCV_EXTRA_MODULES_PATH=~/Library/opencv_build/opencv_contrib/modules \
         -DWITH_CUDA=ON \
         -DWITH_CUDNN=ON \
         -DCUDA_ARCH_BIN=9.0 \
         -DWITH_TBB=ON \
         -DBUILD_opencv_world=ON \
         -DBUILD_opencv_python3=ON \
         -DWITH_QT=ON \
         -DWITH_GSTREAMER=ON ..
         # example configuration, adjust as needed
   ```
  A more recommended way is to use CMake GUI to configure the build options.
  * Tick all options with "cuda"
  * Set `CUDA_ARCH_BIN` to the appropriate value for your GPU. You can find the supported values [here](https://developer.nvidia.com/cuda-gpus). For me it's 9.0 with cuda 12.6.
  * Cancel those options that you don't need. For example, I don't need with `java`, `js`.
  * Highly recommend to read all configuration options and adjust them according to your needs.
  *  `BUILD_opencv_world=ON` to build all modules in one library.
  * `sudo dnf install openblas-devel` if you want to use openblas instead of MKL.
  * set module path to `~/Library/opencv_build/opencv_contrib/modules` to include all modules from the contrib repository.
  * Download Nvidia Video Codec SDK from [here](https://developer.nvidia.com/nvidia-video-codec-sdk). Extract `*.h` files to `/usr/local/cuda/include` and `*.so` files(depends on the arch) to `/usr/local/cuda/lib64`.



5. **Build and Install**:
   ```bash
   make -j$(nproc)
   sudo make install
   sudo ldconfig
   ```



This approach effectively builds OpenCV with CUDA, cuDNN on Fedora. The process involves careful management of dependencies and configuration options, resulting in a customized OpenCV installation with advanced features. The default `dnf` package manager may not provide all the necessary components, say Cuda support, necessitating manual installation and configuration. However, the flexibility and performance gains achieved through this method make it a worthwhile endeavor for developers seeking optimized OpenCV builds.


( ͡❛ ͜ʖ ͡❛)

### Appendix

Python code to test OpenCV with CUDA:

```python
import cv2
print(cv2.getBuildInformation())
```
> ```

General configuration for OpenCV 4.10.0-dev =====================================
  Version control:               4.10.0-318-g08f7f13dfa

  Extra modules:
    Location (extra):            /home/frankyin/opencv_build/opencv_contrib/modules
    Version control (extra):     4.10.0-24-g80f1ca24

  Platform:
    Timestamp:                   2024-10-13T14:42:07Z
    Host:                        Linux 6.10.12-100.fc39.x86_64 x86_64
    CMake:                       3.27.7
    CMake generator:             Unix Makefiles
    CMake build tool:            /usr/bin/gmake
    Configuration:               Release
    Algorithm Hint:              ALGO_HINT_ACCURATE

  CPU/HW features:
    Baseline:                    SSE SSE2 SSE3
      requested:                 SSE3
    Dispatched code generation:  SSE4_1 SSE4_2 AVX FP16 AVX2 AVX512_SKX
      SSE4_1 (18 files):         + SSSE3 SSE4_1
      SSE4_2 (2 files):          + SSSE3 SSE4_1 POPCNT SSE4_2
      AVX (9 files):             + SSSE3 SSE4_1 POPCNT SSE4_2 AVX
      FP16 (1 files):            + SSSE3 SSE4_1 POPCNT SSE4_2 AVX FP16
      AVX2 (38 files):           + SSSE3 SSE4_1 POPCNT SSE4_2 AVX FP16 AVX2 FMA3
      AVX512_SKX (8 files):      + SSSE3 SSE4_1 POPCNT SSE4_2 AVX FP16 AVX2 FMA3 AVX_512F AVX512_COMMON AVX512_SKX

  C/C++:
    Built as dynamic libs?:      YES
    C++ standard:                11
    C++ Compiler:                /usr/lib64/ccache/c++  (ver 13.3.1)
    C++ flags (Release):         -fsigned-char -W -Wall -Wreturn-type -Wnon-virtual-dtor -Waddress -Wsequence-point -Wformat -Wformat-security -Wmissing-declarations -Wundef -Winit-self -Wpointer-arith -Wshadow -Wsign-promo -Wuninitialized -Wsuggest-override -Wno-delete-non-virtual-dtor -Wno-comment -Wimplicit-fallthrough=3 -Wno-strict-overflow -fdiagnostics-show-option -Wno-long-long -pthread -fomit-frame-pointer -ffunction-sections -fdata-sections  -msse3 -fvisibility=hidden -fvisibility-inlines-hidden -O3 -DNDEBUG  -DNDEBUG
    C++ flags (Debug):           -fsigned-char -W -Wall -Wreturn-type -Wnon-virtual-dtor -Waddress -Wsequence-point -Wformat -Wformat-security -Wmissing-declarations -Wundef -Winit-self -Wpointer-arith -Wshadow -Wsign-promo -Wuninitialized -Wsuggest-override -Wno-delete-non-virtual-dtor -Wno-comment -Wimplicit-fallthrough=3 -Wno-strict-overflow -fdiagnostics-show-option -Wno-long-long -pthread -fomit-frame-pointer -ffunction-sections -fdata-sections  -msse3 -fvisibility=hidden -fvisibility-inlines-hidden -g  -O0 -DDEBUG -D_DEBUG
    C Compiler:                  /usr/lib64/ccache/cc
    C flags (Release):           -fsigned-char -W -Wall -Wreturn-type -Waddress -Wsequence-point -Wformat -Wformat-security -Wmissing-declarations -Wmissing-prototypes -Wstrict-prototypes -Wundef -Winit-self -Wpointer-arith -Wshadow -Wuninitialized -Wno-comment -Wimplicit-fallthrough=3 -Wno-strict-overflow -fdiagnostics-show-option -Wno-long-long -pthread -fomit-frame-pointer -ffunction-sections -fdata-sections  -msse3 -fvisibility=hidden -O3 -DNDEBUG  -DNDEBUG
    C flags (Debug):             -fsigned-char -W -Wall -Wreturn-type -Waddress -Wsequence-point -Wformat -Wformat-security -Wmissing-declarations -Wmissing-prototypes -Wstrict-prototypes -Wundef -Winit-self -Wpointer-arith -Wshadow -Wuninitialized -Wno-comment -Wimplicit-fallthrough=3 -Wno-strict-overflow -fdiagnostics-show-option -Wno-long-long -pthread -fomit-frame-pointer -ffunction-sections -fdata-sections  -msse3 -fvisibility=hidden -g  -O0 -DDEBUG -D_DEBUG
    Linker flags (Release):      -Wl,--exclude-libs,libippicv.a -Wl,--exclude-libs,libippiw.a   -Wl,--gc-sections -Wl,--as-needed -Wl,--no-undefined
    Linker flags (Debug):        -Wl,--exclude-libs,libippicv.a -Wl,--exclude-libs,libippiw.a   -Wl,--gc-sections -Wl,--as-needed -Wl,--no-undefined
    ccache:                      YES
    Precompiled headers:         NO
    Extra dependencies:          /usr/local/cuda/lib64/libcudart_static.a /usr/local/cuda/lib64/libnppial.so /usr/local/cuda/lib64/libnppc.so /usr/local/cuda/lib64/libnppitc.so /usr/local/cuda/lib64/libnppig.so /usr/local/cuda/lib64/libnppist.so /usr/local/cuda/lib64/libnppidei.so /usr/local/cuda/lib64/libcublas.so /usr/local/cuda-12.6/targets/x86_64-linux/lib/libcublasLt.so /usr/local/cuda/lib64/libcufft.so /usr/local/cuda/lib64/libnppif.so /usr/local/cuda/lib64/libnppim.so /usr/local/cuda/lib64/libnppicc.so dl m pthread rt
    3rdparty dependencies:

  OpenCV modules:
    To be built:                 alphamat aruco bgsegm bioinspired calib3d ccalib core cudaarithm cudabgsegm cudacodec cudafeatures2d cudafilters cudaimgproc cudalegacy cudaobjdetect cudaoptflow cudastereo cudawarping cudev datasets dnn dnn_objdetect dnn_superres dpm face features2d flann freetype fuzzy gapi hfs highgui img_hash imgcodecs imgproc intensity_transform line_descriptor mcc ml objdetect optflow phase_unwrapping photo plot python3 quality rapid reg rgbd saliency sfm shape signal stereo stitching structured_light superres surface_matching text tracking ts video videoio videostab wechat_qrcode world xfeatures2d ximgproc xobjdetect xphoto
    Disabled:                    java_bindings_generator js_bindings_generator
    Disabled by dependency:      -
    Unavailable:                 cannops cvv hdf java julia matlab ovis python2 python2 viz
    Applications:                tests perf_tests apps
    Documentation:               NO
    Non-free algorithms:         NO

  GUI:
    GTK+:                        YES (ver 3.24.43)
    OpenGL support:              YES (/usr/lib64/libGL.so /usr/lib64/libGLU.so)
    VTK support:                 NO

  Media I/O:
    ZLib:                        build (ver 1.3.1)
    JPEG:                        build-libjpeg-turbo (ver 3.0.3-70)
      SIMD Support Request:      YES
      SIMD Support:              YES
    WEBP:                        build (ver encoder: 0x020f)
    PNG:                         build (ver 1.6.43)
      SIMD Support Request:      YES
      SIMD Support:              YES (Intel SSE)
    TIFF:                        build (ver 42 - 4.6.0)
    JPEG 2000:                   build (ver 2.5.0)
    OpenEXR:                     build (ver 2.3.0)
    HDR:                         YES
    SUNRASTER:                   YES
    PXM:                         YES
    PFM:                         YES

  Video I/O:
    FFMPEG:                      YES
      avcodec:                   YES (60.31.102)
      avformat:                  YES (60.16.100)
      avutil:                    YES (58.29.100)
      swscale:                   YES (7.5.100)
      avresample:                NO
    GStreamer:                   NO
    v4l/v4l2:                    YES (linux/videodev2.h)

  Parallel framework:            pthreads

  Trace:                         YES (with Intel ITT)

  Other third-party libraries:
    Intel IPP:                   2021.12.0 [2021.12.0]
           at:                   /home/frankyin/opencv_build/opencv/build/3rdparty/ippicv/ippicv_lnx/icv
    Intel IPP IW:                sources (2021.12.0)
              at:                /home/frankyin/opencv_build/opencv/build/3rdparty/ippicv/ippicv_lnx/iw
    VA:                          NO
    Lapack:                      YES (/lib64/libopenblas.so)
    Eigen:                       YES (ver 3.4.0)
    Custom HAL:                  NO
    Protobuf:                    build (3.19.1)
    Flatbuffers:                 builtin/3rdparty (23.5.9)

  NVIDIA CUDA:                   YES (ver 12.6.77, CUFFT CUBLAS NVCUVID NVCUVENC)
    NVIDIA GPU arch:             90
    NVIDIA PTX archs:

  cuDNN:                         YES (ver 9.5.0)

  Vulkan:                        YES
    Include path:                /home/frankyin/opencv_build/opencv/3rdparty/include
    Link libraries:              Dynamic load

  OpenCL:                        YES (no extra features)
    Include path:                /home/frankyin/opencv_build/opencv/3rdparty/include/opencl/1.2
    Link libraries:              Dynamic load

  Python 3:
    Interpreter:                 /usr/bin/python3 (ver 3.12.6)
    Libraries:                   /usr/lib64/libpython3.12.so (ver 3.12.6)
    Limited API:                 NO
    numpy:                       /home/frankyin/.local/lib/python3.12/site-packages/numpy/_core/include (ver 2.1.2)
    install path:                lib/python3.12/site-packages/cv2/python-3.12

  Python (for build):            /usr/bin/python3

  Install to:                    /usr/local
-----------------------------------------------------------------
```
