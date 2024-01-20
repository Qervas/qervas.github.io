---
layout: post
title:  OpenGL Perspective Matrix
date: 2023-01-20 22:01:00
description: perspective matrix
tags: computer graphics
categories: Tech
thumbnail: assets/img/Jan20_perspective_matrix.png
---
On the learning 3D compute graphics for initial lab. I come into a problem. It's about near/far plane. When I adding more planets into the 3D solar system, some of them were culling for out of the perspective world.

Thus, I want to make some changes on the given perspective matrix $P$, which represents a matrix with d=4, near=3, far=7 and aspect=1.

```c++
  GLfloat P[16] = {4.0f, 0.0f, 0.0f,  0.0f,
		   0.0f, 4.0f, 0.0f,   0.0f,
                   0.0f, 0.0f, -2.5f, -1.0f,
		   0.0f, 0.0f, -10.5f, 0.0f};

```

I don't know the meaning of each digits. From **[this passage](https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/opengl-perspective-projection-matrix.html)**, it demonstrates the maths principles behind it. Took me minutes reading it, And now I could construct a matrix with some variables which make it easier to control the whole perspective projection.

```c++
	GLfloat fov = 60.f * M_PI / 180.0f;  // Convert to radians
	GLfloat f = 1.0f / tan(fov / 2.0f);
	GLfloat aspect = 1.0f;  // Assuming a square viewport
	GLfloat near = 0.01f;
	GLfloat far = 15.0f;

	GLfloat P[16] = {
	    f / aspect, 0.0f, 0.0f,                            0.0f,
	    0.0f,       f,    0.0f,                            0.0f,
	    0.0f,       0.0f, (far + near) / (near - far),    -1.0f ,
	    0.0f,       0.0f, (2 * far * near) / (near - far), 0.0f
	};
```

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/date/Jan_20_2024/solar.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>
