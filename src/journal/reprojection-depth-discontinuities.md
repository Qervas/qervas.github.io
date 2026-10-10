---
title: "Reprojection and Depth Discontinuities"
description: "Color clamp asks chromatic plausibility; depth reject asks same-surface. Same VP warp — A/B/C on identical current buffers."
hook: "Why a character moving in front of a wall can leave a smeared trail behind them in games."
date: 2026-09-17
tags:
  - graphics
  - engine
  - temporal
math: true
cover: /assets/journal/reprojection-depth-discontinuities/00_hero.jpg
---

Our previous analysis of frame reuse modeled temporal integration as an exponential moving average (EMA) constrained by a \(3\times 3\) RGB minmax clamp. The persistent ghosting observed at textured occlusion boundaries demonstrated that a color clamp is insufficient for resolving visibility. Depth-based rejection, the corresponding geometric control, was disabled for those prior evaluations and tested only coarsely at \(\tau=0.25\) in world-\(z\). This article focuses strictly on depth discontinuity detection. Fundamentally, a color clamp evaluates whether historical data is chromatically plausible, whereas a depth reject determines if the sample originates from the identical geometric surface. Along high-frequency depth edges—such as a structural pillar—these heuristics yield contradictory results.

This discussion isolates the history weight formulation, defining it either as a static acceptance factor (\(w_0\)) or strictly zero. We explicitly exclude sub-pixel jitter sequences, \(\alpha\) integration ladders, and YCoCg variance clipping from the present scope.

![Underground metro platform colonnade: square concrete pillars, tubular railing, tiled floor, yellow safety line, far track void. Current color after a camera truck in +X. Khronos PBR Neutral e=1.00. Photograph only — no residual RMS.](/assets/journal/reprojection-depth-discontinuities/00_hero.jpg)

We introduce a novel static environment for evaluation: an underground metro platform colonnade, superseding the previous loft scene. The architectural geometry includes square concrete pillars, a thin tubular railing, large-format tiled flooring with distinct grout lines, a yellow safety strip, a distant track void, and recessed ceiling coffers. The camera undergoes pure translation strictly in the \(+X\) direction with a locked look-at offset. The diagnostic overlay confirms `CURRENT COLOR  METRO COLONNADE`, `STATIC WORLD  CAMERA TRUCK +X`, and `PHOTO-ONLY`. As this rendering operates in a purely photographic mode, no residual Root Mean Square (RMS) error should be ascribed to this baseline.

![Teaching pin. Identical current color and current depth. Left: no temporal. Middle: reproject + RGB 3×3 clamp, no depth test — wrong-surface history that still sits in the box. Right: reproject + τ depth reject — that sample is killed. Wedge crops under each column. Photograph only.](/assets/journal/reprojection-depth-discontinuities/10_3up.jpg)

**Pin this as the core reference.** The current color and depth buffers remain perfectly identical across all tested pipelines; variance stems exclusively from the temporal history policy. Configuration **A** (left) bypasses temporal filtering entirely. Configuration **B** (middle) applies backward reprojection with an RGB \(3\times 3\) bounding box clamp, omitting depth validation. This permits wrong-surface history to persist provided its chromaticity falls within the localized spatial neighborhood. Configuration **C** (right) augments reprojection with a \(\tau\) relative-depth reject threshold, effectively discarding the invalid temporal sample. To summarize: B retains disparate-surface history within the \(3\times 3\) gamut constraint; C enforces \(w=0\) when \(d>\tau\). While macro-scale visual differences may appear subtle, the isolated wedge crops reveal severe artifacting in the clamped approach.

Testing was executed on Mesa 25.0.7 (llvmpipe) operating in linear Rec. 709 color space. The resolve pass utilizes Khronos PBR Neutral tone mapping at an exposure of \(e=1.00\). The rejection threshold is locked at \(\tau=0.020\). Under a lateral camera velocity of \(\approx 14.51\) px/frame at the foreground pillar, the system records a rejection fraction of \(\approx 0.0249\).

The depth-edge Region of Interest (ROI) residual RMS values (\(n=128952\)) are as follows:

| Policy | Control Mechanism | Residual RMS |
| --- | --- | --- |
| **A** (No Temporal) | N/A | 0 |
| **B** (Clamp Only) | None | 0.140465 |
| **C** (Depth Reject) | \(\tau=0.020\) | 0.053736 |

Integration employs a frozen acceptance weight of \(w_0=0.90\). With mask dilation disabled, static-camera rejections identically evaluate to 0. The composite formulation is defined as \(C = w\,H + (1-w)\,S\). Our internal verification suite confirms 37 pass / 0 fail across all invariant assertions.


## Scene
This experimental setup captures the scene utilizing a unified reprojection warp, derived from the previous and current view-projection matrices alongside the current linearized view-Z. We evaluate the three history policies against perfectly identical current-frame buffers. The display pipeline is fully inherited: the engine resolves lighting in linear space, passes through the Khronos PBR Neutral operator, and applies the standard IEC 61966-2-1 sRGB Opto-Electronic Transfer Function (OETF). A tone curve cannot synthesize unrendered lighting, nor can reprojection invent samples absent from the shading pass.

**Presentation hook.** We sample the current color buffer at frame 8, extracted from an offline integration strip of length \(N=9\). The composition frames repeating structural pillars, a foreground railing, and floor tiles extending into the track void. This visualization serves as a photographic reference rather than an analytical output.

**Teaching pin.** The comparative analysis evaluates paths A, B, and C using an identical \(S_t\) signal. Each full-frame rendering is accompanied by a nearest-neighbor wedge crop isolating the disocclusion slab at the reference pillar.

![Loud failure, clamp path. Same current frame as A and C. Honest VP warp, in-domain ⇒ w=w0, then RGB 3×3 minmax of current St. No depth test. A history texel from the pillar body can sit inside that color box after the truck reveals floor or void. Photograph only.](/assets/journal/reprojection-depth-discontinuities/08_clamp_only.jpg)

**Loud failure, clamp path.** This path utilizes the identical current frame as paths A and C, executing a standard view-projection warp. If a historical sample projects within the screen domain, the solver assigns \(w=w_0\) and restricts the color via an RGB \(3\times 3\) minmax clamp against the current \(S_t\), explicitly ignoring depth correlation. As the camera translates and disoccludes the background track void, historical pixels representing the foreground pillar surface may numerically satisfy the bounding box of the newly revealed background. The clamp erroneously accepts this signal, producing a persistent wrong-surface smear.

![Unique artifact. Beauty dimmed; HOT = d>τ (wrong-surface history); BLUE = reprojected UV out of domain. Named-pillar crop inset. τ=0.020, reject frac 0.025, relative d test. Geometric fingerprint the clamp plate cannot draw.](/assets/journal/reprojection-depth-discontinuities/05_fail_mask.jpg)

**Unique artifact.** We attenuate the beauty pass to prioritize analytical tracking data. Hot regions (red) indicate spatial coordinates where the relative depth test fails (\(d>\tau\)), flagging wrong-surface history. Blue regions denote areas where the backward-reprojected UV coordinate fell out of domain. We include a crop inset of the named pillar. The diagnostic overlay confirms \(\tau=0.020\) with a rejection fraction of 0.025, derived from the relative \(d\) test. This yields a precise geometric fingerprint that a purely chromatic clamp is mathematically incapable of isolating.

![Depth-reject path. Same warp as B. w=0 on d>τ or OOB; current shading stands alone on a rejected pixel. Photograph only.](/assets/journal/reprojection-depth-discontinuities/09_depth_reject.jpg)

**Depth-reject path.** This approach utilizes the identical reprojection warp as path B. However, it rigidly forces \(w=0\) if the relative depth disparity exceeds \(\tau\) (\(d>\tau\)) or if the sample projects out of bounds (OOB). Consequently, the current shading signal stands alone at any rejected pixel.

These visualizations depend on two distinct methodologies that must remain decoupled:

1. **Beauty plates** (including the hero, 3-up, clamp-only, and depth-reject images) represent GL-rendered current buffers processed through the resolve step, Neutral tone mapping, and sRGB OETF. Given the `photo-only` constraint, residual errors or rejection fractions must not be inferred directly from the encoded JPEG.
2. **Instruments** (including the failure mask, history weight visualization, ROI overlay, and residual heatmaps) directly interrogate the underlying floating-point buffers. These maps quantify linearized view-Z, rejection flags, temporal weight, ROI residual RMS, and precise rejection fractions. Quantitative claims must be drawn exclusively from these instrumented readbacks.

---

## Method

### Why: VP warp, then relative \(d\)
The engine's internal working space is linear Rec. 709, with temporal history maintained in an RGBA32F texture format. Integration is performed entirely in linear space. The display transform operates strictly as a post-resolve operation, ensuring non-linear encoding is never baked into the history buffer \(H\). Furthermore, all depth values referenced below are view-linear (positive, matching the MRT conventions) rather than non-linear window-Z.

### Backward reprojection

History UV coordinates are derived from the current pixel location and the current depth value. This formulation strictly requires a clip-space warp; avoid reconstructing intermediate world-space positions.

\[\mathbf{x}_{t}^{\mathrm{clip}} = P_{t}\,V_{t}\, \pi^{-1}(u,v,z_{t}), \qquad \mathbf{x}_{t-1}^{\mathrm{clip}} = P_{t-1}\,V_{t-1}\, V_{t}^{-1}\,P_{t}^{-1}\, \mathbf{x}_{t}^{\mathrm{clip}}\]

\[(u',v',z_{\mathrm{exp}}) = \pi(\mathbf{x}_{t-1}^{\mathrm{clip}}).\]

Any reprojected coordinate \((u',v')\) falling outside the screen domain triggers an automatic rejection. While the history color is fetched via bilinear interpolation at \((u',v')\), the history depth buffer must be point-sampled. For diagnostic instrumentation only, we quantify the implied velocity vector as \(\mathbf{v} = (u,v) - (u',v')\). We do not compute a discrete motion vector (MV) buffer or depend on optical flow approximations.

### Expected previous-view Z versus fetched history Z

Following camera motion, the current \(z_t\) and the previous camera's view-Z operate in disparate coordinate spaces. To establish correspondence, the solver reconstructs the current view-space coordinate, transforms it into the previous view frustum, and compares the **expected** previous-view Z against the point-sampled history depth.

\[\mathbf{X}_{t}=\pi^{-1}(u,v,z_{t}), \qquad \mathbf{X}_{t-1}=V_{t-1}\,V_{t}^{-1}\,\mathbf{X}_{t}, \qquad z_{\mathrm{exp}}=(\mathbf{X}_{t-1})_{z}\]

\[z_{\mathrm{hist}}=\text{point-sample linearized view-Z}_{t-1}(u',v').\]

Comparing \(z_{\mathrm{hist}}\) directly against the current-camera \(z_t\) constitutes a fundamental translation error. Such a flaw would artificially illuminate static pixels during lateral camera trucking and erroneously reject entire ground planes during boom operations.

### Named relative-depth discontinuity

\[d = \frac{\lvert z_{\mathrm{hist}}-z_{\mathrm{exp}}\rvert} {\max(\lvert z_{\mathrm{exp}}\rvert,\,z_{\varepsilon})}, \qquad \text{reject if }d>\tau\text{ or }(u',v')\text{ out of domain.}\]

We enforce \(\tau=0.020\) and \(z_{\varepsilon}=0.050\,\mathrm{m}\). In this formulation, \(\tau\) functions as a deliberate architectural threshold constant, not an arbitrary floating-point epsilon. Note that the prior TAA implementation evaluated the absolute difference \(\lvert z_t-z_{t-1}\rvert\) in world-\(z\), constituting a mathematically distinct—and inferior—predicate.

### History weight (hard cut, not an EMA)

\[w = \begin{cases} 0 & \text{if reject or }(u',v')\text{ out of domain}\\ w_{0} & \text{otherwise} \end{cases} \qquad C=w\,C_{\mathrm{hist}}+(1-w)\,C_{\mathrm{curr}}.\]

The variable \(w\) defines the binary history weight. We apply a frozen parameter \(w_0=0.90\). This must not be conflated with the TAA evaluation's \(\alpha\) factor, which governed the current-frame weight. Do not attempt to derive an accumulation curve from this formulation. The logic verifies trivially: if \(H=1\), \(S=0\), and \(w_0=0.90\), the composite output strictly resolves to \(C=0.90\).

An optional mask dilation phase—functioning strictly as a 1 px expansion upon the binary reject mask, rather than a min-filter over the depth fetch—is available as a topological control. For this specific dataset, dilation is toggled off.

### Color clamp (the failure control, not the product)

Path B unconditionally ignores the depth differential \(d\). It assigns \(w=w_0\) provided \((u',v')\) remains in domain, then mutates the historical sample via:

\[C_{\mathrm{hist}}^{\ast} = \mathrm{clamp}\!\bigl( C_{\mathrm{hist}},\; \min_{\mathcal{N}_{3\times 3}}C_{\mathrm{curr}},\; \max_{\mathcal{N}_{3\times 3}}C_{\mathrm{curr}} \bigr)\]

This function is evaluated in linear RGB, purposefully omitting YCoCg transformations and localized variance clipping. The bounding topology is constructed exclusively from current-frame color data. Consequently, this policy mathematically guarantees the preservation of plausible, yet physically invalid, wrong-surface temporal samples.

In contrast, Path C completely eschews the clamping operation. Its defining thesis relies solely on the rigid geometric depth cut, rejecting the necessity of a secondary AABB color constraint.

### Display (inherited, not re-derived)

\[L_{\mathrm{display}} = \mathrm{TM}\bigl(\mathrm{expose}(C)\bigr) \quad\text{then sRGB OETF for PNG.}\]

The active Tone Mapper (TM) is Khronos PBR Neutral, parameterized at \(e=1.00\) for the metro dataset. The state `GL_FRAMEBUFFER_SRGB` is explicitly disabled; color encoding is executed asynchronously on the CPU. All quantitative measurements are extracted directly from the floating-point rendering buffers, completely bypassing the final PNG quantization.

### Two paths, do not mix the instruments
| Render Path | Output Modality | Visual Instruments |
| --- | --- | --- |
| **Photograph** | Hero, **3**-up comparative, clamp-only, and depth-reject plates. | Evaluated via GLSL **330** utilizing the llvmpipe driver, CPU-side history sampling, and Khronos PBR Neutral tone mapping (\(e=\mathbf{1.00}\)). Validated under the HUD `photo-only` condition. |
| **Instrument** | Failure mask, temporal history weight, ROI overlay, and residual heatmap. | Exposes view-linear Z, binary fail mask, history weight (\(w\)), and ROI residual RMS. |
| **Display** | Uniform pipeline across all presented plates. | Expose (\(e=\mathbf{1.00}\)) \(\to\) Neutral operator \(\to\) standard sRGB OETF. Lighting resolve strictly operates in linear space; the display operator is purely inherited. |

The **3**-up layout operates fundamentally as a true photograph of the algorithmic control while simultaneously serving as the primary pedagogical instrument. When citing quantitative outcomes, analysis must be restricted strictly to the formal RMS and geometric rejection fraction metrics. Assertions characterizing a mathematically derived **0.140465** magnitude based upon a quantized **8**-bit panel output remain procedurally invalid.

---

## Discussion

### Two questions, one warp
Our preceding Temporal Anti-Aliasing (TAA) analysis illustrated why a neighborhood Axis-Aligned Bounding Box (AABB) exhibits structural leaking at textured occlusion boundaries. Because a \(3\times 3\) spatial window inherently spans both the foreground occluder and the newly disoccluded background surface, stale color data frequently remains within the minmax gamut. That specific topological failure resulted in a 0.02162 residual on the loft scene's ghost ROI. Rather than revisiting the loft environment, we focus on the geometric correspondence problem that the AABB algorithm fundamentally ignores.

**Clamp (path B).** Is this historical *color* chromatically plausible given the current spatial neighborhood?

**Depth reject (path C).** Does this historical *sample* correspond to the identical geometric surface?

At the boundary of a metro pillar or a thin railing edge, the current \(3\times 3\) neighborhood is highly heterogeneous—encompassing concrete, grout, painted steel, and the unlit track void. Under lateral camera translation, a historical texel originating from the pillar body can effortlessly map into a color bounding box defined by the newly revealed floor. This satisfies chromatic legality while failing geometric correspondence. The color clamp blindly preserves the artifact, whereas a relative-depth rejection identifies the discontinuity and discards the historical data entirely.

The reprojection warp is invariant across paths. The engine stores the previous and current view-projection matrices per frame, reconstructing the history UV coordinate analytically from the current depth buffer. If these matrices or the depth buffer contain discrepancies, the reprojection predicate is fundamentally compromised; no localized learned optical flow can correct a globally invalid transform.

---

### Unique artifact: fail mask on the pillar silhouette
This technical note exists primarily to document the failure mask. Hot pixels successfully delineate the structural pillar boundaries and the railing segments overlapping the unlit track void. These artifacts explicitly identify regions where the sampled historical Z contradicts the expected previous-view Z mapped from the current sample. Blue pixels correspond to the out-of-bounds (OOB) left-edge domain generated by the camera translation. The inset crop isolating the foreground pillar corresponds exactly to the disocclusion wedge analyzed in the 3-up comparative layout.

The 3-up structure inherently evaluates these temporal policies across that specific geometric slab. Path A isolates the aliased current geometry. Path B incorrectly retains the historical sample because the purely chromatic AABB minmax heuristic accepts it. Path C successfully asserts \(w=0\) uniformly across the hot failure mask.

![Instrument. C-path history weight, false-color 0…1. Accept is w0; reject / OOB is 0. Agrees with the fail mask on the rejected set (fail ⇒ w=0).](/assets/journal/reprojection-depth-discontinuities/06_history_weight.jpg)

The measured history weight corresponds flawlessly with the theoretical rejection set as a continuous mapping: a geometric failure guarantees \(w=0\), satisfying the established assertion. Accepted pixels sustain \(w_0\), whereas relative-depth rejections or OOB boundary traversals evaluate strictly to 0.

The residual temporal lag observed trailing the 1–2 px railing structure derives fundamentally from a combination of **coverage aliasing and geometric correspondence**, rather than an erroneous velocity field. Subpixel coverage is resolved strictly as binary inclusion, omitting MSAA coverage vectors. A geometric surface that fails the spatial sampling in the current \(S_t\) buffer can erroneously persist in \(H\) if the backward reprojection warp inadvertently intercepts the railing's historical coordinates, provided the chromatic bounding box accommodates the metallic steel values.

Metrics must be quoted strictly from the floating-point rendering targets, explicitly rejecting any quantization artifacts embedded in the compressed JPEG output.

---

### What-if failures and controls
Configurations A, B, and C process perfectly bit-identical current color and depth inputs. The temporal history policy is the sole independent variable. Do not attempt to dynamically tune the AABB clamping constraints to artificially suppress B's failure mode.

### What if: History policy (the 3-up)

This comparative matrix evaluates the 3-up composite adjacent to the isolated clamp-only and depth-reject renderings. The engine processes a singular current frame through three divergent resolve pathways. The resulting ghosting is driven exclusively by **wrong-surface correspondence**, not an extended EMA sequence tail. A full-frame evaluation comparing B versus C yields a less severe visual degradation than a naive TAA continuous integration trail. This outcome is precisely aligned with theoretical expectations given the enforcement of a static, single-frame \(w_0\) weight rather than a trailing \((1-\alpha)^N\) recursive sequence. The core artifact resides natively within the structural disocclusion wedge. Rely explicitly upon the isolated crops, the continuous failure mask, and the precise RMS analytical metrics.

| Path | Warp | History Policy | Silhouette Geometry |
| --- | --- | --- | --- |
| **A** (no temporal) | None | \(w=0\) | Aliased current state. Baseline reference. RMS **0**. |
| **B** (clamp-only) | Honest VP | In-domain \(\Rightarrow w=w_0\), RGB \(3\times 3\) clamp | Unresolved wrong-surface ghosting. RMS **0.140465**. |
| **C** (depth-reject) | Same warp | \(d>\tau\) or OOB \(\Rightarrow w=0\) | Correctly illuminates disocclusion wedge. RMS **0.053736**. |

### What if: Clamp on/off is not the thesis

![Instrument. |C−St| residual heat, clamp-only path. HUD quotes ROI RMS 0.1405. The number is the float buffer, not the JPEG.](/assets/journal/reprojection-depth-discontinuities/12_residual_B.jpg)

![Instrument. |C−St| residual heat, depth-reject path. HUD quotes ROI RMS 0.0537. Silhouette slab is punched; accepted same-surface pixels still mix w0 bilinear history.](/assets/journal/reprojection-depth-discontinuities/13_residual_C.jpg)

Configuration B is implemented strictly as the **controlled failure state**. Configuration C intentionally bypasses the AABB clamp logic. Any experiment attempting to "fix" B by arbitrarily constraining the chromatic spatial bounds represents a fundamentally distinct evaluation topology. The residual heatmap visualizes \(\lvert C-S_t\rvert\) mapped directly from the floating-point execution buffer. The real-time diagnostic overlay quotes an ROI RMS of **0.1405** for B and **0.0537** for C. These localized metrics correspond directly to the analytical tables, bypassing non-linear JPEG quantization.

### What if: \(\tau\) (locked, not a hero ladder)

The rejection threshold is immutably set to **0.020**, validated against the limited set \(\{0.005,\,0.02,\,0.08\}\). The resulting aggregate rejection fractions sit at **0.025028 / 0.024903 / 0.024638**. This sequence successfully proves rigorously monotone and extremely tight. Given the locked threshold, full-frame spatial rejection strictly adheres to the mandated \((0.02,\,0.35)\) operational band, converging at **0.0249**. If an experimental output exits this established band, either the \(\tau\) initialization or the structural truck velocity is erroneous—correct the translation speed rather than manipulating the technical narrative.

### What if: Truck speed

The pillar geometry translates at \(\approx\mathbf{14.51}\) px/frame (safely bounded within the target 8–16 range). The calculated mean in-domain velocity resolves to \(\lvert v_x\rvert=\mathbf{15.02}\) and \(\lvert v_y\rvert=\mathbf{0.066}\). This satisfies the essential y-convention verification asserting \(\lvert v_y\rvert\ll\lvert v_x\rvert\). Should path B fail to generate sufficient ghosting artifacts, the correct architectural response is to increase translation speed, not to artificially cripple the clamping logic.

### What if: Static camera

Under absolute static parameters, the total rejection fraction equals exactly **0**. In this state, paths B and C construct perfectly identical frames. Any recorded rejection in a strictly static frame indicates a fundamentally broken view-projection y-convention or flawed depth linearization math. This specific testing run confirms those underlying systems are uncorrupted.

### What if: Off-screen UV

Out-of-bounds (OOB) mapping operations inherently inject a **0.010707** fraction into the overall rejection metric, correctly forcing \(w=0\). This contribution is visualized as the continuous blue slab delineating the failure mask and the darkened left perimeter on the corresponding history-weight render.

### What if: Dilate

The rejection-mask morphological dilation operation is forced **off**. The ROI morphological dilation utilizes a distinct parameter of **6 px** applied exclusively against the morphological-gradient geometric mask, operating solely as a constraint for the spatial RMS calculation.

![Depth-edge ROI overlay. Pillars + railing + other depth silhouettes. CPU 3×3 morphological gradient of current view-Z, then a published 6 px dilate. Not dFdx. Residual RMS is this set only.](/assets/journal/reprojection-depth-discontinuities/11_roi.jpg)

Do not attempt to apply a structural min-filter across the temporal depth fetch. The residual RMS calculations are intentionally constrained exclusively to this uniquely identified spatial set (\(n=\mathbf{128952}\)).

## Limits

### Honesty gaps
**1**. **An isolated frame from an offline \(N=\mathbf{9}\) sequence, rather than continuous \(\mathbf{60}\) Hz photographic persistence.** Temporal integration initializes at frame **1**, explicitly designating frame **8** for final visual evaluation. No claims regarding real-time display refresh stability are asserted.
**2**. **The backward warp integrates previous/current view-projection matrices alongside current linearized view-Z.** This mechanism explicitly excludes rasterized object motion vectors, skeletal skinning velocities, and learned optical flow.
**3**. **The sampled history depth \(z_{\mathrm{hist}}\) evaluates strictly against the transformed expectation \(z_{\mathrm{exp}}\), not against the current-camera \(z_t\).** Substituting current \(z_t\) analytically guarantees a catastrophic view translation error.
**4**. **The RGB clamp is mathematically blind to visibility.** Path B structurally preserves wrong-surface history whenever that historical chromaticity falls securely within the localized current \(\mathbf{3}\times \mathbf{3}\) RGB bounding volume (e.g., within a grout and concrete edge mixed neighborhood).
**5**. **The depth-reject functions as a strict binary threshold at the published \(\tau\), lacking production TAA heuristics.** The formulation systematically omits sub-pixel jitter, localized variance clipping, responsive stencil masking, and multi-frame EMA ladders. The fundamental acceptance weight \(w_0\) remains tightly frozen.
**6**. **Historical color sampling relies on bilinear interpolation (\(u'W-\mathbf{0.5}\)).** This represents a formalized blur source, explicitly bypassing higher-order reconstructions such as a **9**-tap window or Catmull-Rom filtering. History depth evaluates exclusively via nearest-neighbor point sampling (`floor(u'*W)`).
**7**. **NDC \(y\) orientation versus texture \(v\).** OSMesa FBOs and `glReadPixels` conventionally share a bottom-left coordinate origin, whereas PNG encoding flips the row order. History UV mathematics depend entirely on this underlying buffer layout. An inverted coordinate convention would erroneously flood the failure mask—thus validating that mean \(\lvert v_y\rvert\ll\lvert v_x\rvert\) operates as a mandatory correctness assertion.
**8**. **The depth visual operates as a \(\mathbf{32}\)-bit float** (`DEPTH_COMPONENT32F`, queried bits = **32**). The rejection predicate executes directly against linear view-Z via MRT, explicitly ignoring non-linear window-Z representations. Introducing a **16**-bit depth visual would immediately trigger severe quantization-induced false rejections.
**9**. **Hardware derivative functions (`dFdx` / `dFdy`) are excluded.** The depth-edge ROI geometry is constructed via a CPU-side \(\mathbf{3}\times \mathbf{3}\) morphological gradient evaluating the current view-Z buffer. Internal llvmpipe hardware derivatives prove insufficiently precise and frequently collapse to **0** across **1**-px geometric features.
**10**. **MSAA is strictly disabled.** All geometric silhouettes render natively aliased. The ROI expansion radius purposefully encompasses a **1**-px spatial quantization jag. The visual latency observed along the thin structural railing exists as a compound consequence of binary subpixel coverage limits and temporal correspondence aliasing.
**11**. **The \(\tau\) sensitivity sweep acts monotonically and remains exceptionally tight.** Measurement values converge firmly at **0.0250** / **0.0249** / **0.0246**. The massive geometric discontinuity bounding the pillar-to-void edge drastically eclipses the evaluated \(\tau\in\{\mathbf{0.005}, \mathbf{0.02}, \mathbf{0.08}\}\) thresholds.
**12**. **RMS_C does not converge to absolute zero.** Even on geometrically valid, same-surface pixels, the estimator blends a \(w_0\) bilinear history. Surface detail shifting across a translating plane inherently exhibits sampling lag. While the depth-reject heuristic cleanly excises wrong-surface intersections, it cannot completely freeze translating high-frequency textures.
**13**. **Lateral translation velocity is tuned to guarantee baseline clamping failure** (\(\approx \mathbf{14.51}\) px/frame). This parameterization intentionally rejects the imperceptibly slow panning velocities typical of product-still dolly rendering.
**14**. **This dataset diverges from the prior loft evaluation family.** The pipeline directly inherits the Neutral OETF without conducting a Tone Mapper (TM) comparative analysis. Supporting algorithms like Image-Based Lighting (IBL) or split-sum approximations are excluded from the current theoretical framework.
**15**. **The pipeline is not a substitute for neural or hardware temporal upsampling.** This framework does not model DLSS, FSR, XeSS, hardware-accelerated TAA logic, or bit-exact discrete GPU validation.
**16**. **The output PNG acts as an \(\mathbf{8}\)-bit display-referred artifact.** Spectral frequency analysis (FFT) or energy-integration should not be executed against the compressed JPEG output. Residual RMS and geometrical rejection fractions function exclusively as linear-buffer analytical meters.

---

### Mesa / llvmpipe — what this run can claim
| Parameter | Specification |
| --- | --- |
| `GL_VERSION` | **4.5** (Core Profile) Mesa **25.0**.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM **19.1**.7, **256** bits) |
| OSMesa | core **3.3** request; driver validates the string above |
| FBO color space | **RGBA32F** complete, \(\mathbf{1280}\times \mathbf{720}\), MRT color+meta |
| Depth visual format | **DEPTH_COMPONENT32F**, queried bits = **32** |
| `GL_FRAMEBUFFER_SRGB` | Disabled (Neutral + standard sRGB OETF evaluated on CPU) |
| MSAA | Disabled |
| History color sampling | Bilinear (`u'*W-0.5`) |
| History depth sampling | Point-sampled (`floor(u'*W)`) |
| Temporal mix operator | \(C=w\,H+(1-w)\,S\), frozen \(w_0=\mathbf{0.90}\) |
| Chromatic clamp | \(\mathbf{3}\times \mathbf{3}\) RGB minmax of current \(S_t\) (path B only) |
| Depth test predicate | Relative \(d=\lvert z_{\mathrm{hist}}-z_{\mathrm{exp}}\rvert/\max(\lvert z_{\mathrm{exp}}\rvert,z_{\varepsilon})\), path C |
| Neutral \(e\) | **1.00** |
| \(N\) / designated frame | **9** / **8** |

**Can claim:** Within this specific OSMesa / llvmpipe evaluation executing an offline \(N\)-frame lateral translation against a static architectural colonnade, utilizing history UV coordinates derived from prior/current view-projection and current linear view-Z, a frozen acceptance weight \(w_0\) paired with a relative-depth reject at the published \(\tau\) (Path C) successfully bypasses the structural visual artifacting provoked by an RGB \(\mathbf{3}\times \mathbf{3}\) AABB clamp (Path B). The documented ROI residual RMS and internal geometric rejection fractions align identically with the theoretical predictions.

**Cannot claim:** This analysis explicitly makes no claims regarding a complete production TAA implementation, nor does it guarantee **60** Hz visual persistence or parity with vendor-specific spatial upsamplers. We fundamentally reject the hypothesis that chromatic clamping resolves spatial disocclusion, and we emphasize that compressed PNG frame captures do not constitute rigorous persistence photography. Assertions concerning discrete-GPU throughput, stream occupancy, memory bandwidth, or macro-hardware operational behavior remain explicitly out of scope.

---

## Out of scope

This manuscript explicitly excludes comprehensive production TAA comparative analyses encompassing sub-pixel jitter matrices, variance clipping, YCoCg color space transformations, responsive stencil mapping, or TSR functionalities. We omit evaluations of proprietary vendor temporal upsamplers including DLSS, FSR, and XeSS. Optical flow vector models substituting for the rigorous analytical warp—such as Farneback, RAFT, DIS, or any learned residual motion approximations—are strictly out of scope. Performance evaluations of path-traced denoiser architectures, including OIDN, NRD, or SVGF, fall outside the defined analytical boundary. We uniformly bypass rasterized object-space motion vectors, skinned historical palettes, particle kinematics, and alpha transparency rendering. Because shadow-map biasing fundamentally depends on rasterization-light metrics rather than geometric correspondence matching, it is excised from this theoretical predicate. We bypass VR compositor Asynchronous SpaceWarp (ASW) and late-stage reprojection routines. Do not attempt to mathematically re-derive EMA integration ladders or accumulation curves from this constrained dataset—refer to the dedicated TAA literature for those formulations. We omit Image-Based Lighting (IBL), split-sum approximations, and TM Neutral bake-offs, purposefully discarding the prior loft lighting configuration. The tested static scene contains no dynamic crowds, trains, refractive glass, fluid water surfaces, or emissive physical advertising. We ignore interactive display viewers, vsync synchronization latencies, and GUI composite considerations. Ultimately, we reject any claims of bit-exact mathematical parity with vendor-compiled GPU driver implementations.

---

Dense meters follow.

---

## Appendix A — Meters (quote tables, not photographs)

All quantitative figures are derived from the Mesa llvmpipe floating-point buffer. The residual RMS calculates the RGB disparity against the current \(S_t\) signal uniquely within the delineated depth-edge Region of Interest (ROI). This specific geometric mask is constructed utilizing a CPU-side morphological gradient followed by a 6 px structural dilation, yielding a sample population of \(n=128952\) pixels:

\[\mathrm{RMS} = \sqrt{ \frac{1}{3n} \sum_{p\in\mathrm{ROI}} \lVert C(p)-S_t(p)\rVert_2^2 }.\]

The primary evaluation targets frame 8 out of the total \(N=9\) sequence. Frame 0 lacks a valid temporal history and is consequently excluded from scoring. The lateral camera velocity targets the defined pillar index 4, bounded approximately within the coordinate window \((414,206)\)–\((505,608)\).

| Parameter | Value |
| --- | --- |
| \(\tau\) | **0.020** |
| \(w_0\) | **0.90** |
| dilate (reject mask) | **0** |
| \(z_{\varepsilon}\) | **0.050** m |
| truck \(\lvert v\rvert\) at named pillar | **14.5069** px/frame |
| world \(dx\) | **0.125876** m/frame |
| mean \(\lvert v_x\rvert\), \(\lvert v_y\rvert\) in-domain | **15.0238**, **0.0660** |
| ROI \(n\) | **128952** |
| RMS_A | **0.000000** |
| RMS_B | **0.140465** |
| RMS_C | **0.053736** |
| reject frac (default \(\tau\)) | **0.024903** |
| reject oob / depth | **0.010707** / **0.014196** |
| reject \(\tau=0.005/0.02/0.08\) | **0.025028** / **0.024903** / **0.024638** |
| static-camera reject | **0.000000** |

Hero rounding conventions are employed strictly within the introduction: \(\tau=\mathbf{0.020}\); lateral truck speed approximates \(\mathbf{14.51}\) px/frame; the composite rejection fraction is \(\approx \mathbf{0.0249}\); and the ROI RMS targets are established at **0 / 0.140465 / 0.053736**, satisfying the **37 pass / 0 fail** test suite. Do **not** hallucinate an arbitrary residual or rejection fraction from the hero, 3-up, or clamp visual plates. Those specific outputs maintain a strict `photo-only` display status.

RMS_A necessarily evaluates to 0 because configuration A **is** the unmutated \(S_t\) signal. The architectural validation confirms RMS_C \(<\) RMS_B because the silhouette disocclusion slab correctly asserts a zero-weight reject, not based on a subjective appraisal that "C looks better." Path C inherently continues to mix a \(w_0\) temporal history on accepted, contiguous-surface pixels (introducing bilinear sampling lag across the translating grout lines along the planar floor). This continuous temporal integration explains why RMS_C settles at **0.053736**, rather than absolute zero. Color clamping algorithms fundamentally cannot resolve visibility discontinuities, just as depth-rejection heuristics do not function as spatial denoisers.

The \(\tau\) sensitivity sweep behaves monotonically as asserted and remains extremely **tight**, measuring **0.0250 / 0.0249 / 0.0246**. The magnitude of the physical geometric discontinuity at the pillar-to-void boundary is sufficiently massive to trigger a rejection even under a highly permissive \(\tau=0.08\). Furthermore, OOB coordinate accesses account for \(\approx \mathbf{0.0107}\) of the total 0.0249 rejection fraction and remain entirely invariant to the \(\tau\) tuning parameter. This is purposefully not a \(\tau\)-sensitivity paper. The engine enforces a firm lock at 0.02 based on the empirical observation that path B successfully replicates ghosting artifacts while path C preserves temporal stability without rejecting the entire geometric frame.

---

## Appendix B — Assertions

This analytical test suite formally executes and concludes at: **37** pass / **0** fail.

| Validation Check | Result |
| --- | --- |
| Mix unit invariant: \(w_0=\mathbf{0.90}\), \(H=\mathbf{1}\), \(S=\mathbf{0}\) \(\Rightarrow\) \(C=\mathbf{0.90}\) | PASS |
| FBO format requires RGBA32F; depth bits \(\ge \mathbf{24}\) | PASS **32** |
| Required photorealistic gallery plates populate successfully | PASS |
| Structural pillars and railing exist inside the mesh | PASS |
| Resolve evaluates without NaN accumulation | PASS |
| Painted ROI sampling population \(n > \mathbf{200}\) | PASS **128952** |
| Temporal performance: RMS_C \(<\) RMS_B | PASS **0.053736** \(<\) **0.140465** |
| Baseline error constraint: RMS_A \(\approx \mathbf{0}\) | PASS **0** |
| Clamp failure constraint: RMS_B \(> \mathbf{0.002}\) (path B actively ghosts) | PASS **0.140465** |
| Rejection fraction bounded strictly in \((\mathbf{0.02}, \mathbf{0.35})\) | PASS **0.0249** |
| Monotonic \(\tau\) sensitivity: \(\mathbf{0.005} \ge \mathbf{0.02} \ge \mathbf{0.08}\) | PASS **0.0250** / **0.0249** / **0.0246** |
| Static-camera artifact rejection \(< \mathbf{0.01}\) | PASS **0** |
| Translation velocity constrained in \((\mathbf{6}, \mathbf{20})\) px/frame | PASS **14.51** |
| Mandatory y-convention translation: \(\lvert v_y\rvert \ll \lvert v_x\rvert\) | PASS **0.066** vs **15.02** |
| Geometric fail condition mathematically forces \(w=\mathbf{0}\) | PASS |
| Named pillar bounding box non-empty; fail count \(> \mathbf{80}\) | PASS |

Under no circumstances were operational assertion tolerances relaxed to artificially optimize the photorealistic presentation plates.

---

## Appendix C — Resolve lock

```text
(u', v', z_exp) = reproject(P_prev, V_prev, P_curr, V_curr, z_t)
H     = bilinear(history_color, u')     // point-sample history depth
d     = |z_hist - z_exp| / max(|z_exp|, z_eps)
w     = (oob || (C && d > tau)) ? 0 : w0
Hhat  = B ? minmax3x3_rgb(S, H) : H     // B only
C     = w * Hhat + (1 - w) * S
PNG   = sRGB_OETF( Neutral(e * C) )

```

Our finalized resolve explicitly locks \(w\) as the temporal history weight parameter, establishing constant constraints at \(w_0=\mathbf{0.90}\) and \(\tau=\mathbf{0.020}\). The chromatic clamping operation mathematically acts as a strict RGB \(\mathbf{3}\times \mathbf{3}\) spatial minmax against \(S_t\), executing exclusively during the Path B evaluation loop. Both structural mask dilation and camera spatial jitter remain forcibly disabled.

Pin the metro translation sequence as the core analytical presentation. Pin the comparative \(\mathbf{3}\)-up matrix as the primary pedagogical construct. Pin the mathematically derived failure mask as the authoritative geometric fingerprint. The geometric predicate fundamentally mandates the conclusion: A color bounding clamp merely evaluates whether the retained historical sample appears chromatically permissible. A relative depth-rejection heuristic rigorously determines if that identical temporal sample physically represents the corresponding geometric surface.
