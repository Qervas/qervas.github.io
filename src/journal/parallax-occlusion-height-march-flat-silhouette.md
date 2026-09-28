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
Building upon our prior analysis of the single-pixel UV ellipse, this note examines the geometric illusion of depth. Rather than introducing a novel sampler, we offset UV coordinates along the **tangent-space view ray** to simulate volumetric depth on a planar two-triangle quad. The integration of interior parallax and an optional height-field self-shadowing routine closely mimics true geometric displacement. This approach, however, faces a strict physical limitation: the mesh outline remains invariant. Ultimately, **the silhouette is still the quad**.

![Same brick wall, raking light, three shaders. Left FLAT: painted card, mortar wells fully visible. Middle BUMP: grooves shade, grout albedo stays in the wells, bricks do not slide. Right POM N=32: interior bricks slide, mortar hides. Photograph only — no UV-error metric.](/assets/journal/parallax-occlusion/05_graze_3up.jpg)

Under identical lighting conditions, we observe three distinct rendering regimes across the same brick geometry. Standard rendering utilizing geometric \(\mathbf{n}\) and base UV \(\mathbf{u}_0\) (**FLAT**) produces a painted-card effect where mortar wells remain persistently visible regardless of the incident vector. Applying height-derived normals at the geometric UV (**BUMP**) yields accurate shading, yet the brick elements lack perspective shift as the view angle changes. Conversely, Parallax Occlusion Mapping (**POM**) employing an \(N=32\) roof-hull march achieves correct perspective translation, naturally occluding the mortar within the wells. Note that this visual comparison relies strictly on photographic evaluation rather than formal UV-error metrics.

![Bump vs POM, harder graze. Grain and grout slide on the right. Caption: not real displacement. Photograph only.](/assets/journal/parallax-occlusion/14_brick_hero.jpg)

At severe grazing angles, POM produces a striking depth illusion; however, we emphasize that it remains unequivocally a texture-space offset rather than true geometric displacement.

![Unique artifact. Left: CPU displaced grid, floor authorship, proud-brick profile. Middle: POM on the roof quad. Right: coverage XOR in red. sil_xor≈0.575, AABB span≈0.1415. The silhouette is still the quad.](/assets/journal/parallax-occlusion/10_silhouette_xor.jpg)

We quantify this structural limitation by comparing a CPU-displaced grid against the POM-mapped quad. The displaced grid physically alters the mesh outline, extending beyond the basal plane. In contrast, the POM quad remains structurally planar. Highlighting this coverage discrepancy yields \(\mathrm{sil} = C_{\mathrm{disp}} \oplus C_{\mathrm{quad}}\), resulting in a fractional difference of \(\approx 0.575\). An Axis-Aligned Bounding Box (AABB) span of \(\approx 0.141\) verifies the true geometric extrusion of the reference grid, proving it left the basal plane. Thus, while interior pixels exhibit highly accurate POM intersections, the screen-space coverage cannot organically expand beyond the underlying triangles.

Our primary evaluation configuration fixes the displacement parameters to establish a strict benchmark. The baseline locks the scale at \(s=0.08\) with a bias of \(0\), utilizing an **R32F** height map evaluated via Mesa 25.0.7 llvmpipe.

| Metric | Configuration | Value |
| --- | --- | --- |
| **MAE (Face-on)** | Bump vs. POM | \(\mathbf{0}\) |
| **Analytic UV Error** | \(N=4\), \(55^\circ\) indent | \(4.31\times 10^{-5}\) |
| **Analytic UV Error** | \(N=32\), \(55^\circ\) indent | \(8.24\times 10^{-7}\) |
| **Coverage XOR** | Displaced floor vs. POM quad | \(\approx 0.575\) |
| **Validation Suite** | Internal regression status | 28 pass / 0 fail |

---

## How it presents

The primary stimulus for these tests is a CPU-authored running-bond brick texture (\(1024^2\) POT, `REPEAT` wrapping). It follows the roof convention, where a normalized height \(h=1\) is flush with the bounding mesh and \(h=0\) defines the maximum carved recess. For precise analytic validation, we employ a spherical indent (`CLAMP_TO_EDGE`) alongside a 1-D cosine ridge. The physical material is characterized as procedural clay, featuring per-brick variations, grog, and striae. This ensures the UV sliding behavior contains sufficient high-frequency detail for observational analysis, deliberately avoiding the inherent noise of standard photogrammetry scans.

![FLAT | BUMP | POM at a moderate angle (ang≈22°). Interior parallax already slides before the graze hero. Photograph only.](/assets/journal/parallax-occlusion/04_moderate_3up.jpg)

As observed above, interior parallax establishes the illusion of sliding geometry well before reaching extreme grazing angles. This remains a photograph-only assessment.

The rendering behavior operates across two distinct angular regimes that must remain strictly isolated:

1. **Face-on** (\(\hat{v}_z \approx 1\), \(\mathbf{v}_{xy} \approx \mathbf{0}\)): The computed UV offset approaches \(\sim 0\). In this orientation, standard bump mapping, offset mapping, steep parallax, and POM must converge perfectly, utilizing identical normals and UV coordinates. Our baseline confirms \(\mathrm{MAE}(\text{bump}, \text{POM}) = \mathbf{0}\). Any implementation presenting depth disparity at a face-on angle typically suffers from an inverted TBN matrix or an erroneous residual offset.
2. **Graze** (\(\hat{v}_z \to 0^+\)): At this extreme, interior parallax delivers robust volumetric occlusion, yet the discrepancy between the planar silhouette and the mathematically displaced mesh exposes the fundamental limitation of the technique. Undersampling the height field (\(N\) too low) in this regime directly induces texture swimming.

Crucially, a software rasterizer does not require animation to expose sampling flaws. Texture swimming in a static, locked pose manifests as spatial banding and skipped mortar wells. Furthermore, the silhouette failure becomes starkly evident when a perfectly linear polygonal edge bounds a seemingly complex, displaced interior profile.

Fundamentally, standard height maps cannot represent overhangs, as they are restricted to 2D functions \(h(u,v)\). Any perceived self-occlusion strictly indicates that a given ridge blocks a corresponding recess along the active view ray, rather than representing a volumetric cave or true geometric undercut.

## Why: TBN, \(\boldsymbol{\delta}_{uv}\), POM lerp

### TBN and tangent-space view

To correctly warp the UV coordinates, we require an orthonormal tangent frame evaluated at the fragment, with columns defined in world space. We enforce a strictly right-handed coordinate system, ensuring \(\mathbf{n}=\mathbf{t}\times\mathbf{b}\).

\[T=\bigl[\mathbf{t}\ \mathbf{b}\ \mathbf{n}\bigr], \qquad \mathbf{v}_w=\mathbf{e}-\mathbf{p}, \qquad \mathbf{v}=T^\top\mathbf{v}_w, \qquad \hat{\mathbf{v}}=\mathbf{v}/\lVert\mathbf{v}\rVert.\]

The TBN matrix employed in this analysis is rigorously generated on the **CPU**, derived either directly from the quad or the displaced-grid vertex. This guarantees it matches the exact matrix supplied to the shader as vertex attributes. We must **not** rely on an llvmpipe `dFdx` calculation of the world position to construct a precision tangent frame.

For front-face evaluation, the condition \(\hat{v}_z=\hat{\mathbf{v}}\cdot\mathbf{n}>0\) must hold. If \(\hat{v}_z\le 0\), the view ray points away from the surface, and the march is immediately discarded.

### Height convention (roof default)

By default, the geometric quad serves as the **outer hull**, positioned at a normalized height of \(1\). The sampled texture \(h_{\mathrm{tex}}\in[0,1]\) defines the structural elevation: \(1\) denotes a surface flush with the hull, while \(0\) indicates the deepest recess.

\[h=\mathrm{clamp}(h_{\mathrm{tex}}+\beta,\,0,\,1).\]

Here, \(\beta\) represents a height bias, which is fixed at \(0\) for the duration of this analysis. The scale factor \(s>0\) governs the physical extrusion range, measured relative to the quad’s \(u\)-edge world length. Our baseline metric configuration requires \(s=0.08\). The required lateral UV translation necessary to account for a unit change in normalized height is defined as:

\[\boldsymbol{\delta}_{uv} = \frac{\hat{\mathbf{v}}_{xy}}{\hat{v}_z}\cdot s.\]

**Proud-brick silhouette control:** We define a secondary reference mesh stationed at the **floor** (height \(0\)), with individual bricks geometrically extruded outward to \(1\), utilizing the identical scale \(s\). This geometry establishes the true, physical silhouette that **should** organically emerge under POM, but mathematically **does not**.

When handling ray misses: if the cast ray traverses the entire internal volume without intersecting the height field, we fallback gracefully and sample the **floor** plane at \(t=1\).

### Ray in the height volume

The ray origin is situated at the geometric hit location on the roof (\(H=1\)), corresponding to the initial UV coordinate \(\mathbf{u}_0\). The parameter \(t\in[0,1]\) defines the normalized depth driven into the volume, directly mapping to the drop in height:

\[\mathbf{r}(t)=\bigl(\mathbf{u}_0 - t\,\boldsymbol{\delta}_{uv},\; 1-t\bigr).\]

A confirmed intersection occurs at the smallest value of \(t\in[0,1]\) satisfying the inequality \(1-t \le h(\mathbf{u}_0-t\boldsymbol{\delta}_{uv})\).

### Offset mapping — named knife, not hero

In true parallax mapping (Kaneko-style), which evaluates a single sample, the UV perturbation is formulated as:

\[\mathbf{u}'=\mathbf{u}_0-\boldsymbol{\delta}_{uv}\,(1-h(\mathbf{u}_0)).\]

Traditional offset limiting (often associated with Welsh) intentionally omits the \(1/\hat{v}_z\) term, yielding a modified offset vector where \(\boldsymbol{\delta}_{uv}\propto\hat{\mathbf{v}}_{xy}\,s\). At severe grazing angles, the true single-sample offset **explodes** into visual incoherence, whereas the limited offset systematically **under-walks** the surface profile. While both historical methods warrant inclusion in the comparative family strip for context, neither represents the modern standard technique.

### Steep parallax — even layers, first crossing

Steep parallax mapping discretizes the bounding volume into uniform strata:

\[\Delta t=\frac{1}{N},\qquad \mathbf{u}_i=\mathbf{u}_0-i\Delta t\,\boldsymbol{\delta}_{uv},\qquad H_i=1-i\Delta t,\qquad i=0,\ldots,N.\]

An intersection is identified at the smallest layer index \(i\ge 1\) where the ray plane descends below the height surface: \(H_i\le h(\mathbf{u}_i)\). This process inherently produces a mathematical staircase artifact in \(t\). Our primary testing configuration employs a fixed step count of \(N=32\), while enforcing a strict compile-time upper bound of \(N_{\mathrm{cap}}=64\).

### POM — linear search + secant lerp (hero)

After isolating the first height-field crossing between layers \(i-1\) and \(i\), POM refines the intersection precision by interpolating the exact root of \(H-h\). This derivation assumes both functions exhibit linearity with respect to \(t\) across the sampled interval:

\[t^\star = \mathrm{mix}\bigl(t_{i-1},\,t_i,\, \tfrac{(H_{i-1}-h_{i-1})}{(H_{i-1}-h_{i-1})-(H_i-h_i)}\bigr), \qquad \mathbf{u}_{\mathrm{hit}}=\mathbf{u}_0-t^\star\boldsymbol{\delta}_{uv}.\]

We emphasize that this is exclusively a secant step executed on the bounding samples; it is **not** an analytically exact ray–height intersection unless the underlying height map \(h\) is strictly linear between those UV coordinates. Relief mapping (which executes \(K=5\) binary bisections after isolating the initial crossing) is supported within our backend architecture but is intentionally excluded from the primary family strip comparison. Conversely, the coarse \(N=4\) ladder clearly illustrates how an insufficient linear search can erroneously step over narrow geometric features, such as a mortar well.

### Sampling the height inside the march

When implementing the marching loop, one must **not** rely on standard `texture()` fetches. Because the iteration count diverges significantly across adjacent fragments, computing implicit derivatives within the loop is fundamentally illegal. Instead, the LOD must be provided explicitly:

\[h_i=\mathrm{textureLod}(H,\,\mathbf{u}_i,\,\lambda) \quad\text{or CPU bilinear on the float pyramid.}\]

We enforce two strictly controlled \(\lambda\) values for our analyses:

* \(\lambda=0\): This maintains distinct, sharp mortar wells but induces aggressive aliasing when the texture is minified at a distance.
* \(\lambda=\lambda_{\mathrm{iso}}=\log_2\rho\): This is derived precisely from the **geometric** UV Jacobian (CPU \(J\), employing the exact formulation standard mipmaps or anisotropic filtering utilize). Under this specific LOD, structural relief visibly degrades, and fine self-occlusion details are lost.

Do not assert that this method calculates an accurate along-ray cone LOD. Upon determining \(\mathbf{u}_{\mathrm{hit}}\), we sample the albedo at \(\mathbf{u}_{\mathrm{hit}}\) and compute the local normal by evaluating the central differences of the height map \(h\) precisely at the intersection coordinate.

### Self-shadow (second march, not a shadow map)

To simulate self-shadowing, we launch a secondary ray marching from \(\mathbf{u}_{\mathrm{hit}}\) directly toward the incoming light vector in tangent space, constrained by the identical roof/floor bounding volume. If any subsequent sample along this trajectory evaluates **below** the height field before exiting the volume, the fragment is classified as occluded. A simple binary evaluation (any intersection equals shadow) serves as our default mechanism. This technique is strictly **in-family** to parallax mapping; it must not be conflated with shadow-map bias, PCF filtering, or standard `glPolygonOffset` implementations.

### Silhouette predicate (the lie, as a formula)

To mathematically formalize the visual discrepancy inherent in POM, let \(C_{\mathrm{quad}}(\mathbf{x})\) denote the absolute screen-space coverage of the base 2-triangle geometric wall. POM can only evaluate and shade fragments where \(C_{\mathrm{quad}}=1\). Conversely, let \(C_{\mathrm{disp}}(\mathbf{x})\) represent the true rasterized coverage of a highly tessellated, physically displaced mesh utilizing identical height data.

\[C_{\mathrm{POM}}=C_{\mathrm{quad}}, \qquad \mathrm{sil}(\mathbf{x}) = C_{\mathrm{disp}}(\mathbf{x})\ \mathrm{xor}\ C_{\mathrm{quad}}(\mathbf{x}).\]

While modulating `gl_FragDepth` based on the derived intersection distance can correctly handle **interior** depth compositing for subsequent post-processing, it fundamentally **cannot** expand the rasterized outline of the underlying mesh. Our operational policy is rigid: **do not** write `gl_FragDepth`, and the current validation run strictly adheres to this constraint.

## Unique artifacts: the slice, then the XOR

![Unique artifact. 1-D cosine ridge, view ray, layer planes. N=32 first ridge nested (steep / POM / dense-1D agree). Inset: N=8 skipped well — intentional. CPU science.](/assets/journal/parallax-occlusion/01_march_slice.jpg)

The preceding diagram illustrates the precise geometric artifact this investigation targets. Evaluated via a rigorous CPU-side model, independent of the OpenGL rasterization pipeline, we map a 1-D cosine ridge against the incident view ray intersecting discrete layer planes.

* **Primary Validation:** At \(N=32\), the steep parallax first-hit approximation, the POM secant interpolation, and the dense-1D true intersection strictly converge on the **same first ridge** (denoted by the nested intersection rings). The dense-1D root isolation resolves at \(t=0.258\), POM converges closely at \(t=0.260\), while the steep step approximation lands at \(t=0.282\).
* **Inset Failure:** The \(N=8\) inset demonstrates a deliberately induced skipped well. Analytically, the true intersection remains on ridge 1; however, both the steep and POM evaluations cross the bounding strata without triggering a hit, erroneously skipping to ridge 2. This aliasing at low layer counts is not indicative of a fundamentally flawed algorithm; rather, it is the exact mathematical mechanism driving the texture swimming artifact observed at lower rungs of the \(N\)-ladder.

![‖Δu‖ turbo on the graze quad. Wells walk farther than brick faces. CPU march.](/assets/journal/parallax-occlusion/02_offset_uv.jpg)

![First-hit layer index, N=32, same pose as the offset field. Mean first-hit layer ≈9.06.](/assets/journal/parallax-occlusion/03_layer_heatmap.jpg)

![Sphere indent UV-error heatmap, indent interior only. N=4 → 4.31e-5; N=32 → 8.24e-7. Analytic instrument.](/assets/journal/parallax-occlusion/06_analytic_uv_err.jpg)

To rigorously quantify UV error, we evaluate against a spherical indent instrument parameterized with radius \(R=0.40\), centered at \((0.5, 0.5, 1)\), enforcing wrap clamp rules, and restricting analysis **strictly to the indent interior**. The resulting heatmap visualizes the deviation vector magnitude: \(\lVert\mathbf{u}_{\mathrm{hit}}-\mathbf{u}_{\mathrm{analytic}}\rVert\). Regions outside the defined rim constitute the planar roof (\(t=0\)); consequently, a raw quadratic sphere formula miss does not correspond to a valid height-field intersection and is explicitly excluded from the mean error calculation.

---

## Quote the numbers. Do not quote the brick photographs as UV error.

Operating under a locked scale of \(s=0.08\), zero bias \(\beta=0\), and rendered via the Mesa llvmpipe driver, we observe the following measurements:

| Metric | Context | Value |
| --- | --- | --- |
| Mean UV Error | POM indent interior, \(N=4\), \(55^\circ\) | **\(4.31\times 10^{-5}\)** |
| Mean UV Error | POM indent interior, \(N=32\), \(55^\circ\) | **\(8.24\times 10^{-7}\)** |
| 95th Percentile UV Error | POM indent interior, \(N=32\), \(55^\circ\) | \(2.27\times 10^{-6}\) |
| \(\mathrm{sil}\) Fraction | sil-xor floor vs roof, \(N=32\), profile | **0.575** |
| MAE (Bump, POM) | Face-on, \(N=32\), \(0^\circ\) | **0** |
| Silhouette XOR | Face-on, \(N=32\), \(0^\circ\) | 0.029 |
| Mean First-Hit Layer | POM field, \(N=32\), \(50.7^\circ\) | 9.06 |
| Shadow Agreement | vs \(N=64\), \(72^\circ\), same field | 0.993 |

The error reduction from \(N=4\) (**\(4.31\times 10^{-5}\)**) to \(N=32\) (**\(8.24\times 10^{-7}\)**) demonstrates strong convergence. The silhouette discrepancy remains significant at grazing angles (\(\mathrm{sil\_xor}\approx\mathbf{0.575}\)), corroborated by the AABB span confirming an extrusion of \(\approx\mathbf{0.141}\). We formally assert that at \(s=0\), \(\Delta\mathbf{u}=0\). It is critical to emphasize that these analytic error metrics are derived solely from the mathematical **sphere indent** instrument. They must **not** be conflated with the qualitative brick texture renderings. Do not attempt to synthesize a general GL UV error metric or a subjective quality score from the provided photographic plates.

---

## Family, then the ladders

![Offset (explodes at graze) | steep (first layer) | POM secant lerp. Family rungs. Relief K=5 omitted.](/assets/journal/parallax-occlusion/07_family_rungs.jpg)

![N∈{4,8,16,32}. N=4 is the swim / missed-well hero; N=32 cleans the same pose.](/assets/journal/parallax-occlusion/08_n_ladder.jpg)

![s∈{0, 0.02, 0.08, 0.25}. s=0 matches bump; s=0.25 swims.](/assets/journal/parallax-occlusion/09_scale_ladder.jpg)

---

## Controls

### Face-on: POM must not invent depth

![bump | POM | offset at v̂_z=1. MAE(bump, POM)=0. Must match.](/assets/journal/parallax-occlusion/13_faceon_control.jpg)

When the incident view vector aligns precisely with the surface normal (\(\hat{v}_z=1\)) across the exact same bounding roof hull, the theoretical UV deviation is zero. The rigorous analytical validation for this is an orthographic UV-grid calculation yielding the Mean Absolute Error (MAE), independent of any perspective projection artifacts. This control confirms \(\mathrm{MAE}(\text{bump}, \text{POM}) = \mathbf{0}\). The included photograph inevitably captures microscopic edge parallax due to standard perspective projection; it is provided as a visual corroboration of the control environment, not as a source for secondary quantitative metrics. If a POM implementation exhibits spurious depth or distortion under face-on orthographic evaluation, validating the TBN matrix handedness should be the immediate priority.

### Scale / bias

A scale factor of \(s=0\) is mathematically equivalent to standard bump mapping, as it dictates zero UV translation. Our designated baseline scale of \(s=0.08\) strikes an optimal balance, providing robust, readable interior parallax across the target brick asset. Increasing the scale to \(s=0.25\) forces the view ray to intersect too many repeating tiles per unit of parametric depth \(t\): the initial ray crossing erroneously intersects adjacent architectural features, rays prematurely terminate on the volume floor, and the entire surface exhibits severe texture swimming. The bias parameter \(\beta\) remains strictly locked at \(0\).

### Too few steps

Executing the height march with only \(N=4\) layers critically undersamples deep structural wells, inducing massive staircasing artifacts that serve as a highly visible spatial proxy for dynamic texture swimming. Increasing the sample density to \(N=32\) completely resolves these artifacts under the identical pose. The previously discussed 1-D march-slice featuring the \(N=8\) inset is a direct mathematical formalization of this exact undersampling failure; it is explicitly documented as an intentional failure mode, ensuring it is not misinterpreted as a flaw in the baseline POM algorithm.

### Self-occlusion is a second height march

![POM | POM + light-march | displaced. Caption: not a shadow map / not bias. Wall panels photograph-only.](/assets/journal/parallax-occlusion/11_self_shadow.jpg)

The image sequence above delineates the boundaries of self-shadowing evaluation. In the left frame, utilizing only the primary view-march, physically occluded structural wells erroneously receive full unshadowed shading because the view intersection is successful while the incident light vector is ignored. The middle frame introduces the secondary tangent-space light-march, which correctly occludes contact points and deep recesses. The right frame provides the displaced-mesh ground truth, utilizing true triangulated geometry mapped to the identical height field. As emphasized in the caption: this technique is **not a shadow map**. The reported shadow agreement metric of \(0.993\) is derived explicitly by comparing an \(N=32\) march against a denser \(N=64\) march operating on the **same** continuous height field; it is not a comparison against ray-traced geometric triangles. This agreement metric must not be quoted as a validation of true geometric matching.

### Height LOD — one sentence of Jacobian

![λ=0 aliases vs λ_iso melts. ρ≈3.15, λ_iso≈1.66 from CPU geometric UV Jacobian. Continuity with mipmaps / anisotropic — not a new theorem.](/assets/journal/parallax-occlusion/12_height_lod.jpg)

When the surface is minified under perspective projection, the CPU calculates the geometric UV Jacobian as \(\rho = N \cdot \max(\partial u/\partial x, \partial u/\partial y) \approx 3.15\), which dictates an isotropic Level of Detail (LOD) of \(\lambda_{\mathrm{iso}} = \log_2\rho \approx 1.66\). On the left, clamping to \(\lambda=0\) preserves the high-frequency structural definition of the mortar wells but introduces severe sub-pixel aliasing. On the right, applying \(\lambda_{\mathrm{iso}}\) causes the high-frequency relief to visibly soften and melt. This methodology guarantees perfect continuity with standard hardware mipmapping and anisotropic filtering: it applies an isotropic LOD derived entirely from the **geometric** UV footprint, deliberately ignoring complex along-ray cone expansion calculations. This represents standard industry practice, not a novel rendering theorem, and we intentionally omit extensive Anisotropic Filtering quality analyses.

### Offset leaves the tile

![REPEAT vs CLAMP vs absdiff at N=4. Periodic brick should walk to the next tile; clamp flattens a rim. Photograph only.](/assets/journal/parallax-occlusion/15_edge_walk.jpg)

When a view ray extends beyond the primary \([0,1]\) texture boundary, a periodic material **should** organically walk into the adjacent repeating tile; enforcing a strict coordinate clamp instead flattens the boundary into an unnatural rim artifact. This remains an observation supported strictly by visual photographic evidence.

![CPU brick L0 we own: turbo height + bump-lit preview; sphere indent inset. Authorship, not the theorem.](/assets/journal/parallax-occlusion/00_height_l0.jpg)

---

## What this box actually measured

To ensure stringent experimental reproducibility, the host environment for these evaluations was OSMesa, executing Mesa 25.0.7-2+deb13u1, utilizing the llvmpipe software driver (LLVM 19.1.7, 256-bit vectors). The framebuffer target was strictly configured as **RGBA32F**, with height map textures constrained to **R32F**. The 8-bit fallback path was **not hit** during any phase of testing, and both sRGB conversion and MSAA were deliberately disabled. The depth buffer (`gl_FragDepth`) was **not written**. The primary brick texture utilized `REPEAT` wrapping, whereas the spherical indent instrument employed `CLAMP_TO_EDGE`. Our automated regression suite confirmed **28 pass / 0 fail**, mathematically validating that the TBN matrix remained perfectly orthonormal and right-handed. The suite verified that \(s=0 \Rightarrow \Delta\mathbf{u}=0\), confirmed that the displaced mesh AABB span was correctly \(>0\) (measured at **0.1415**), proved the analytic UV error monotonically decreased as \(N\) increased (\(N=32 < N=4\)), established the face-on MAE precisely at \(\mathbf{0}\), and confirmed the grazing profile \(\mathrm{sil\_xor} > 0.01\) (measured at **0.575**).

We formalize the following claims: operating within this specific OSMesa / llvmpipe environment, a rigorous **CPU** tangent-space height march evaluated against an authored field successfully offsets UV coordinates along a precisely known vector \(\boldsymbol{\delta}_{uv}\). This technique systematically reduces measurable UV error compared to an analytic sphere as the layer count \(N\) increases, up to the inherent saturation point of the linear-search \(\Delta t\) / secant interpolation model. Implementing a GLSL 330 fragment march, bounded by a fixed step cap and relying on explicit `textureLod` fetches, yields what is fundamentally a **photograph of this specific software rasterizer**. It must not be misconstrued as an evaluation of a discrete GPU’s dedicated POM hardware unit (as no such specialized fixed-function hardware exists). Under perfectly face-on orthographic projection, bump mapping and POM exhibit flawless parity along our scientific evaluation path (\(\mathrm{MAE} = 0\)). At severe grazing angles, the true screen-space **coverage** of the physically displaced grid fiercely contradicts the visual output of the planar 2-triangle POM quad; this resulting XOR delta completely quantifies the silhouette lie. Finally, implementing a secondary tangent-space height-field light-march convincingly occludes structural wells that the primary view ray fails to hide, but this methodology remains strictly a ray march, not a true hardware shadow map.

We explicitly disclaim any evaluation of NVIDIA, AMD, or Intel hardware POM implementations, nor do we attempt to quantify hardware tessellation efficiency or assert that "AAA games execute exactly this many taps." We make no claims regarding the performance parity of our specific llvmpipe loop against modern GPU architectures, justifying the omission of millisecond frame timings. We cannot assert that a shader utilizing `dFdx`/`dFdy` to construct a TBN matrix, or relying on implicit LOD calculations within a dynamic loop, will precisely match dedicated hardware behavior. We do not claim that the standard POM secant interpolation **is** a perfect analytic ray–height intersection. We reject the notion that writing `gl_FragDepth` from the fragment shader magically "fixes" the absence of true geometric displacement—the absolute screen-space coverage is, and always will be, bottlenecked by the base primitive quad. Most critically, we reiterate that a height field is not actual geometry.

Honesty, short:

1. **Metrics are CPU** evaluated exclusively on high-precision float height data. The presented grazing shots, brick-hero panels, and self-shadow wall comparisons serve as high-fidelity photographs of this specific software rasterizer. Do not irresponsibly cite these qualitative images as quantitative UV error or \(\mathrm{sil\_xor}\) metrics.
2. **Face-on MAE** is exclusively derived from the \(\mathbf{v}_{xy}=0\) orthographic UV-grid control. The accompanying perspective face-on photograph is simply a visual representation of that isolated control environment, absolutely not a secondary measurable metric.
3. **Analytic UV error** is strictly scored within the spherical **indent interior** only. The POM secant lerp is fundamentally an approximation, not a perfect ray–height intersection; thus, the residual error against the true analytic solution remains fully in scope for this evaluation.
4. **March-slice “analytic”** data represents a dense 1-D mathematical first-crossing of our precisely authored cosine ridge, not a perfectly closed-form sphere.
5. **Silhouette XOR** inherently requires a **profile** camera orientation to be measured accurately. The minor face-on XOR of \(\approx 0.029\) is attributable to edge noise and is not the architectural discrepancy under examination. The AABB span being mathematically \(>0\) serves as our definitive proof of true geometric extrusion.
6. **Self-shadow agree** pits an \(N=32\) march against a denser \(N=64\) march evaluating the exact same underlying height field; it is not a geometric comparison against a physically displaced mesh, nor is it a hardware shadow map.
7. **Height LOD.** Evaluated at \(\rho\approx 3.15\), yielding \(\lambda_{\mathrm{iso}}\approx 1.66\). The resulting structural softening is visually apparent but functionally modest, relying entirely on the geometric Jacobian.
8. **Scale \(s=0.08\)** is rigorously locked to guarantee readable interior parallax across this specific architectural asset. Increasing the scale to \(s=0.25\) intentionally triggers the swim/miss failure mode for educational demonstration.
9. **No `gl_FragDepth`, no cone-step, no tessellation.** The absolute physical coverage of the POM rendering path strictly remains bounded by the flat 2-triangle quad.
10. **Brick is CPU procedural**, explicitly not a high-fidelity photogrammetry scan. Analytic error was measured purely on the mathematical sphere instrument, not on the noisy procedural brick asset.

Bump mapping strictly perturbs the normal vector \(\mathbf{n}\) at the existing geometric UV coordinate. Offset mapping applies a single, naive coordinate translation. POM continuously marches a ray through a bounded mathematical volume. True displacement physically translates the geometric vertices. Only the final technique is physically capable of expanding the mesh's silhouette.

Pin the grazing 3-up comparison as the definitive presentation. Pin the bump-vs-POM analysis as the primary lighting evaluation. Pin the silhouette XOR comparison as the stark, mathematical quantification of the technique's fundamental lie. Pin the 1-D march slice accompanied by the analytic UV-error heatmap as our rigorous scientific theorem. The foundational formula operates as the caption, and the XOR fraction perfectly encapsulates exactly why the mesh's outline remains a planar quad.
