---
title: "Parallax Occlusion Mapping: Height March, Flat Silhouette"
description: "The silhouette is still the quad. FLAT | BUMP | POM graze, then the XOR lie — sil_xor≈0.575, MAE=0 face-on."
date: 2026-09-14
tags:
  - graphics
  - engine
  - sampling
math: true
cover: /assets/journal/parallax-occlusion/05_graze_3up.jpg
---

The last note owned the UV ellipse a pixel covers. This one does not pick a new sampler. A height field offsets UVs along the **tangent-space view ray** so a 2-triangle quad reads as carved brick. Interior parallax and (optional) height-field self-shadow can look like depth. The outline of the mesh does not. **The silhouette is still the quad.**

![Same brick wall, raking light, three shaders. Left FLAT: painted card, mortar wells fully visible. Middle BUMP: grooves shade, grout albedo stays in the wells, bricks do not slide. Right POM N=32: interior bricks slide, mortar hides. Photograph only — no UV-error metric.](/assets/journal/parallax-occlusion/05_graze_3up.jpg)

Same wall, same light, three shaders. Left **FLAT**: geometric \(\mathbf{n}\), UV \(\mathbf{u}_0\) — a painted card. Middle **BUMP**: height-derived normals at the geometric UV; grooves shade, bricks do not walk with view. Right **POM**: \(N=32\) roof-hull march; interior bricks slide, mortar hides in the wells it should hide in. Do not hang a UV-error number on this photograph.

![Bump vs POM, harder graze. Grain and grout slide on the right. Caption: not real displacement. Photograph only.](/assets/journal/parallax-occlusion/14_brick_hero.jpg)

Same sentence as a poster: bump vs POM, raking graze, **not real displacement**.

![Unique artifact. Left: CPU displaced grid, floor authorship, proud-brick profile. Middle: POM on the roof quad. Right: coverage XOR in red. sil_xor≈0.575, AABB span≈0.1415. The silhouette is still the quad.](/assets/journal/parallax-occlusion/10_silhouette_xor.jpg)

That is the lie, measured. Proud bricks extend the outline on the left; the POM quad is a straight card. Red is \(\mathrm{sil}=C_{\mathrm{disp}}\ \mathrm{xor}\ C_{\mathrm{quad}}\). That fraction is **\(\approx 0.575\)**. AABB span **\(\approx 0.141\)** is the extrusion proof: the grid actually left the plane. Interior pixels can still be a good POM hit. Coverage cannot grow.

Hero: scale \(s=0.08\), bias \(0\), \(N=32\) fixed, height **R32F**, Mesa 25.0.7 llvmpipe. Face-on MAE(bump, POM) \(=\mathbf{0}\). Analytic UV error on a spherical indent interior at \(55^\circ\): \(N=4\) **\(4.31\times 10^{-5}\)** \(\to\) \(N=32\) **\(8.24\times 10^{-7}\)**. Graze silhouette XOR (floor displaced vs roof quad) **\(\approx 0.575\)**. Assertions on this run: **28 pass / 0 fail**.

---

## How it presents

Stimulus is a CPU-authored running-bond brick, \(1024^2\) POT, `REPEAT`, roof convention (\(h=1\) flush with the mesh, \(h=0\) carved). Science instruments use a spherical indent (`CLAMP_TO_EDGE`) and a 1-D cosine ridge. The wall is procedural clay — per-brick families, grog, stria — so UV slide has frequency to show. It is not a photo scan and not a PBR brick.

![FLAT | BUMP | POM at a moderate angle (ang≈22°). Interior parallax already slides before the graze hero. Photograph only.](/assets/journal/parallax-occlusion/04_moderate_3up.jpg)

Interior parallax is visible before the graze hero. Still photo-only.

Two regimes, never mixed:

1. **Face-on** (\(\hat{v}_z \approx 1\), \(\mathbf{v}_{xy}\approx\mathbf{0}\)): offset is \(\sim 0\). Bump, offset, steep, POM **must match** (same normals, same UV). Science MAE(bump, POM) \(=\mathbf{0}\). If “POM” looks more 3-D here, the TBN sign or the residual offset is wrong.
2. **Graze** (\(\hat{v}_z\to 0^+\)): this is the article. Interior parallax is the wow. Silhouette disagreement with the displaced mesh is the lie. Too few layers is the swim.

Software raster does not have to animate. Swim at a locked pose is banding / missed wells. Silhouette failure at a locked pose is a straight edge next to a brick profile.

Height maps **cannot represent overhangs** (they are functions \(h(u,v)\)). Self-occlusion here is “this ridge hides that well from this ray,” not a cave.

---

## Why: TBN, \(\boldsymbol{\delta}_{uv}\), POM lerp

### TBN and tangent-space view

Orthonormal tangent frame at the fragment, columns in world space. Locked handedness: \(\mathbf{n}=\mathbf{t}\times\mathbf{b}\), right-handed.

\[
T=\bigl[\mathbf{t}\ \mathbf{b}\ \mathbf{n}\bigr],
\qquad
\mathbf{v}_w=\mathbf{e}-\mathbf{p},
\qquad
\mathbf{v}=T^\top\mathbf{v}_w,
\qquad
\hat{\mathbf{v}}=\mathbf{v}/\lVert\mathbf{v}\rVert.
\]

Science TBN is **CPU**, from the quad (or the displaced-grid vertex) — the same matrix the shader is given as attributes. Do **not** trust llvmpipe `dFdx` of world position as the science TBN.

Front face: \(\hat{v}_z=\hat{\mathbf{v}}\cdot\mathbf{n}>0\). If \(\hat{v}_z\le 0\), skip the march.

### Height convention (roof default)

The geometric quad is the **outer hull** at normalized height \(1\). Texture \(h_{\mathrm{tex}}\in[0,1]\) is elevation of the real surface: \(1=\) flush, \(0=\) carved in.

\[
h=\mathrm{clamp}(h_{\mathrm{tex}}+\beta,\,0,\,1).
\]

\(\beta\) is bias (locked \(0\) on this run). Scale \(s>0\) is the physical height range in units of the quad’s \(u\)-edge world length. Locked hero \(s=0.08\). Lateral UV travel for a unit drop in normalized height:

\[
\boldsymbol{\delta}_{uv}
=
\frac{\hat{\mathbf{v}}_{xy}}{\hat{v}_z}\cdot s.
\]

**Proud-brick silhouette control:** a second authorship with the mesh at the **floor** (height \(0\)) and bricks extruding to \(1\). Same \(s\). That is the outline that **should** grow and **does not** under POM.

Misses: if the ray never meets the height field inside the volume, sample the **floor** \(t=1\).

### Ray in the height volume

Origin at the geometric hit, roof \(H=1\), UV \(\mathbf{u}_0\). Parameter \(t\in[0,1]\) is normalized depth into the volume (drop in height):

\[
\mathbf{r}(t)=\bigl(\mathbf{u}_0 - t\,\boldsymbol{\delta}_{uv},\; 1-t\bigr).
\]

Hit is the smallest \(t\in[0,1]\) with \(1-t \le h(\mathbf{u}_0-t\boldsymbol{\delta}_{uv})\).

### Offset mapping — named knife, not hero

True parallax (Kaneko-style), one sample:

\[
\mathbf{u}'=\mathbf{u}_0-\boldsymbol{\delta}_{uv}\,(1-h(\mathbf{u}_0)).
\]

Offset limiting (Welsh) drops the \(1/\hat{v}_z\) so \(\boldsymbol{\delta}_{uv}\propto\hat{\mathbf{v}}_{xy}\,s\). At graze, true offset **explodes**; limited offset **under-walks**. Both belong on the family strip. Neither is the hero.

### Steep parallax — even layers, first crossing

\[
\Delta t=\frac{1}{N},\qquad
\mathbf{u}_i=\mathbf{u}_0-i\Delta t\,\boldsymbol{\delta}_{uv},\qquad
H_i=1-i\Delta t,\qquad i=0,\ldots,N.
\]

Steep hit: smallest \(i\ge 1\) with \(H_i\le h(\mathbf{u}_i)\). Staircase in \(t\). Hero \(N=32\) fixed; compile-time cap \(N_{\mathrm{cap}}=64\).

### POM — linear search + secant lerp (hero)

After the first crossing between layers \(i-1\) and \(i\), interpolate the zero of \(H-h\) assuming both are linear in \(t\):

\[
t^\star
=
\mathrm{mix}\bigl(t_{i-1},\,t_i,\,
\tfrac{(H_{i-1}-h_{i-1})}{(H_{i-1}-h_{i-1})-(H_i-h_i)}\bigr),
\qquad
\mathbf{u}_{\mathrm{hit}}=\mathbf{u}_0-t^\star\boldsymbol{\delta}_{uv}.
\]

This is a secant step on the samples, **not** an analytic ray–height intersection unless \(h\) is linear between those UVs. Relief (\(K=5\) bisections after the crossing) is implemented and omitted from the family strip; the \(N=4\) ladder already shows a linear search skipping a thin well.

### Sampling the height inside the march

Do **not** `texture()` inside the loop. Non-uniform iteration count \(\Rightarrow\) implicit derivatives are illegal.

\[
h_i=\mathrm{textureLod}(H,\,\mathbf{u}_i,\,\lambda)
\quad\text{or CPU bilinear on the float pyramid.}
\]

Two locked \(\lambda\) values:

- \(\lambda=0\): sharp wells, aliases when the wall minifies.
- \(\lambda=\lambda_{\mathrm{iso}}=\log_2\rho\) from the **geometric** UV Jacobian (CPU \(J\), same formula as mipmaps / anisotropic): relief melts, self-occlusion fades.

Do not claim an along-ray cone LOD. After \(\mathbf{u}_{\mathrm{hit}}\), albedo at \(\mathbf{u}_{\mathrm{hit}}\); normal from central differences of \(h\) at the hit.

### Self-shadow (second march, not a shadow map)

From \(\mathbf{u}_{\mathrm{hit}}\) toward the light in tangent space, same roof/floor volume. If any sample along that ray lies **below** the height field before exiting, the point is in height-field shadow. Binary (any hit) is the default. This is **in-family**. It is not shadow-map bias, not PCF, not `glPolygonOffset`.

### Silhouette predicate (the lie, as a formula)

Let \(C_{\mathrm{quad}}(\mathbf{x})\) be coverage of the 2-triangle wall. POM shades only where \(C_{\mathrm{quad}}=1\). Let \(C_{\mathrm{disp}}(\mathbf{x})\) be coverage of the displaced grid of the same height.

\[
C_{\mathrm{POM}}=C_{\mathrm{quad}},
\qquad
\mathrm{sil}(\mathbf{x})
=
C_{\mathrm{disp}}(\mathbf{x})\ \mathrm{xor}\ C_{\mathrm{quad}}(\mathbf{x}).
\]

`gl_FragDepth` from the hit can correct **interior** depth for later compositing; it **cannot** grow coverage. Default: **do not** write `gl_FragDepth`. This run does not.

---

## Unique artifacts: the slice, then the XOR

![Unique artifact. 1-D cosine ridge, view ray, layer planes. N=32 first ridge nested (steep / POM / dense-1D agree). Inset: N=8 skipped well — intentional. CPU science.](/assets/journal/parallax-occlusion/01_march_slice.jpg)

This is the thing the article exists to draw. CPU science, not a GL photo. 1-D cosine ridge, view ray, layer planes.

- **Primary:** \(N=32\). Steep first-hit, POM secant, and dense-1D true hit agree on the **same first ridge** (nested rings). Dense-1D \(t=0.258\), POM \(t=0.260\), steep \(t=0.282\).
- **Inset:** \(N=8\) skipped well — intentional. True hit still on ridge 1; steep/POM skip to ridge 2. Too few layers is not “POM is broken”; it is the swim hero on the \(N\)-ladder.

![‖Δu‖ turbo on the graze quad. Wells walk farther than brick faces. CPU march.](/assets/journal/parallax-occlusion/02_offset_uv.jpg)

![First-hit layer index, N=32, same pose as the offset field. Mean first-hit layer ≈9.06.](/assets/journal/parallax-occlusion/03_layer_heatmap.jpg)

![Sphere indent UV-error heatmap, indent interior only. N=4 → 4.31e-5; N=32 → 8.24e-7. Analytic instrument.](/assets/journal/parallax-occlusion/06_analytic_uv_err.jpg)

Spherical indent, \(R=0.40\), center \((0.5,0.5,1)\), wrap clamp, **indent interior only**. Heat is \(\lVert\mathbf{u}_{\mathrm{hit}}-\mathbf{u}_{\mathrm{analytic}}\rVert\). Outside the rim the height field is the roof (\(t=0\)); a raw sphere quadratic “miss” is not the height-field hit and is not averaged in.

---

## Quote the numbers. Do not quote the brick photographs as UV error.

Scale \(s=0.08\), bias \(\beta=0\), Mesa llvmpipe:

| row | \(N\) | angle | metric | value |
|---|---|---|---|---|
| POM indent interior | 4 | \(55^\circ\) | mean UV err | **\(4.31\times 10^{-5}\)** |
| POM indent interior | 32 | \(55^\circ\) | mean UV err | **\(8.24\times 10^{-7}\)** |
| same | 32 | \(55^\circ\) | p95 UV err | \(2.27\times 10^{-6}\) |
| sil-xor floor vs roof | 32 | profile | \(\mathrm{sil}\) fraction | **0.575** |
| face-on | 32 | \(0^\circ\) | MAE(bump, POM) | **0** |
| face-on | 32 | \(0^\circ\) | sil XOR (not the lie) | 0.029 |
| POM field | 32 | \(50.7^\circ\) | mean first-hit layer | 9.06 |
| shadow | 32 | \(72^\circ\) | agree vs \(N=64\), same field | 0.993 |

Hero rounding: \(N=4\) **\(4.31\times 10^{-5}\)** \(\to\) \(N=32\) **\(8.24\times 10^{-7}\)**; \(\mathrm{sil\_xor}\approx\mathbf{0.575}\); AABB span \(\approx\mathbf{0.141}\). \(s=0\Rightarrow\Delta\mathbf{u}=0\) (asserted). Analytic error is the **sphere indent**, not the brick. Do **not** invent a GL UV error for the graze / brick-hero photographs. Those frames are photo-only.

Do not invent a “POM quality score.”

---

## Family, then the ladders

![Offset (explodes at graze) | steep (first layer) | POM secant lerp. Family rungs. Relief K=5 omitted.](/assets/journal/parallax-occlusion/07_family_rungs.jpg)

![N∈{4,8,16,32}. N=4 is the swim / missed-well hero; N=32 cleans the same pose.](/assets/journal/parallax-occlusion/08_n_ladder.jpg)

![s∈{0, 0.02, 0.08, 0.25}. s=0 matches bump; s=0.25 swims.](/assets/journal/parallax-occlusion/09_scale_ladder.jpg)

---

## Controls

### Face-on: POM must not invent depth

![bump | POM | offset at v̂_z=1. MAE(bump, POM)=0. Must match.](/assets/journal/parallax-occlusion/13_faceon_control.jpg)

\(\hat v_z=1\), same roof hull. Science path is an ortho UV-grid MAE, not the perspective photograph: MAE(bump, POM) \(=\mathbf{0}\). The photograph still has a few degrees of edge parallax; it is a picture of the control, not a second metric. If POM looked more 3-D here, TBN handedness would be the first suspect.

### Scale / bias

\(s=0\) is bump (no UV walk). Locked hero \(s=0.08\) is readable interior parallax on this wall. \(s=0.25\) spans too many tiles per unit \(t\): first crossing is the wrong brick, rays hit the volume floor, the wall swims. Bias locked \(0\).

### Too few steps

\(N=4\) misses wells and staircases — spatial proxy for swim. \(N=32\) cleans the same pose. The march-slice \(N=8\) inset is the same failure in 1-D, labeled so it cannot be read as a broken hero.

### Self-occlusion is a second height march

![POM | POM + light-march | displaced. Caption: not a shadow map / not bias. Wall panels photograph-only.](/assets/journal/parallax-occlusion/11_self_shadow.jpg)

Left: view-march only; hidden wells can still shade if the view hit is right and the light is ignored. Middle: light-march darkens contact. Right: displaced-mesh truth (real triangles, same height). Caption is the claim: **not a shadow map**. Shadow agree \(0.993\) is \(N=32\) vs \(N=64\) on the **same** height field, not vs ray-traced triangles. Do not quote it as a geometry match.

### Height LOD — one sentence of Jacobian

![λ=0 aliases vs λ_iso melts. ρ≈3.15, λ_iso≈1.66 from CPU geometric UV Jacobian. Continuity with mipmaps / anisotropic — not a new theorem.](/assets/journal/parallax-occlusion/12_height_lod.jpg)

Minified wall, CPU geometric UV Jacobian, \(\rho=N\cdot\max(\partial u/\partial x,\partial u/\partial y)\approx 3.15\), \(\lambda_{\mathrm{iso}}=\log_2\rho\approx 1.66\). Left \(\lambda=0\): sharp wells, aliases. Right \(\lambda_{\mathrm{iso}}\): relief melts. Continuity with mipmaps / anisotropic: isotropic LOD of the **geometric** UV, not an along-ray cone. Not a new theorem. No AF quality table.

### Offset leaves the tile

![REPEAT vs CLAMP vs absdiff at N=4. Periodic brick should walk to the next tile; clamp flattens a rim. Photograph only.](/assets/journal/parallax-occlusion/15_edge_walk.jpg)

Periodic brick **should** walk to the next tile; clamp flattens a rim. Photo only.

![CPU brick L0 we own: turbo height + bump-lit preview; sphere indent inset. Authorship, not the theorem.](/assets/journal/parallax-occlusion/00_height_l0.jpg)

---

## What this box actually measured

Host: OSMesa, Mesa 25.0.7-2+deb13u1, llvmpipe (LLVM 19.1.7, 256 bits). FBO **RGBA32F**, height upload **R32F**, 8-bit fallback **not hit**, no sRGB, no MSAA. `gl_FragDepth` **not written**. Brick wrap `REPEAT`; sphere indent `CLAMP_TO_EDGE`. Assertions: **28 pass / 0 fail**, including TBN orthonormal / right-handed, \(s=0\Rightarrow\Delta\mathbf{u}=0\), displaced AABB span \(>0\) (**0.1415**), analytic UV err \(N=32 < N=4\), face-on MAE \(=\mathbf{0}\), and profile \(\mathrm{sil\_xor}>0.01\) (**0.575**).

Can claim: on this OSMesa / llvmpipe build, a **CPU** tangent-space height march on an authored field offsets UV along a known \(\boldsymbol{\delta}_{uv}\) and reduces UV error vs a sphere as \(N\) grows (until the linear-search \(\Delta t\) / lerp model saturates). A GLSL 330 fragment march with a fixed cap and `textureLod` is a **photograph of this software rasterizer**, not of a discrete GPU’s POM unit (there isn’t one). Face-on, bump and POM match on the science path (MAE \(=0\)). At graze, the displaced-grid **coverage** disagrees with the 2-triangle POM quad; the XOR is the silhouette lie. Height-field light-march darkens wells the view ray does not hide. That is not a hardware shadow map.

Cannot claim: NVIDIA / AMD / Intel hardware POM, tessellation quality, or “games do this many taps.” That llvmpipe loop performance matches a GPU. No milliseconds. That `dFdx`/`dFdy` TBN or implicit LOD inside the march equal hardware. That POM lerp **is** the ray–height intersection. That writing `gl_FragDepth` “fixes” displacement — coverage is still the quad. That a height field is geometry.

Honesty, short:

1. **Metrics are CPU** on float height. Graze / brick-hero / self-shadow wall panels are photographs of this software rasterizer. Do not quote them as UV error or \(\mathrm{sil\_xor}\).
2. **Face-on MAE** is the \(\mathbf{v}_{xy}=0\) UV-grid control. The perspective face-on photograph is a picture of that control, not a second metric.
3. **Analytic UV error** is scored on the spherical **indent interior** only. POM lerp is not the ray–height intersection; residual vs analytic is in scope.
4. **March-slice “analytic”** is a dense 1-D first-crossing of the authored cosine ridge, not a closed-form sphere.
5. **Silhouette XOR** uses a **profile** camera. Face-on XOR \(\approx 0.029\) is not the lie. AABB span \(>0\) is the extrusion proof.
6. **Self-shadow agree** is \(N=32\) vs \(N=64\) on the same field, not vs the displaced mesh and not a hardware shadow map.
7. **Height LOD.** \(\rho\approx 3.15\), \(\lambda_{\mathrm{iso}}\approx 1.66\). Relief softening is visible but modest. Geometric Jacobian only.
8. **Scale \(s=0.08\)** is locked for readable interior parallax on this wall. \(s=0.25\) is the swim/miss rung.
9. **No `gl_FragDepth`, no cone-step, no tessellation.** Coverage of the POM path is still the 2-triangle quad.
10. **Brick is CPU procedural**, not a photo scan. Analytic error is on the sphere, not the brick.

Bump perturbs \(\mathbf{n}\) at the geometric UV. Offset is one push. POM marches. Displacement moves vertices. Only the last one grows the silhouette.

Pin the graze 3-up as the presentation. Pin bump-vs-POM as the lighting hero. Pin the silhouette XOR as the lie. Pin the march slice plus the analytic UV-error heatmap as the science theorem. The formula is the caption. The XOR is why the outline stayed a quad.
