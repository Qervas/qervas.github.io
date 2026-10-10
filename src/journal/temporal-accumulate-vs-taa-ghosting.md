---
title: "Temporal Accumulate vs TAA Ghosting"
description: "TAA is a bet that last frame's color is still this pixel. Naive EMA ghosts; neighborhood clamp kills the streak. The ghost is leftover history — not a shutter."
hook: "The ghostly trails behind moving objects in modern games, and the trick that erases them."
date: 2026-09-16
tags:
  - graphics
  - engine
  - temporal
math: true
cover: /assets/journal/taa-ghosting/14_real_hero.jpg
---

The preceding analysis finalized the display operator configuration: a singular RGBA32F evaluation, mapped via a specified curve, followed by the standard sRGB OETF. Temporal dynamics were explicitly excluded from that scope—specifically, treating Temporal Anti-Aliasing (TAA), temporal accumulation, and firefly suppression as functional components of the tone mapping pass. This analysis addresses the mechanics of data reuse **across** successive frames. The history buffer is maintained strictly within the linear Rec.709 color space. The Khronos PBR Neutral operator is evaluated exclusively post-resolve and is never integrated directly into the history buffer.

**TAA operates on the fundamental assumption that the radiometric value from the previous frame remains valid for the current pixel. Ghosting artifacts constitute the deterministic penalty for this variance reduction.**

Critically, **this process does not simulate motion blur.** A physical optical shutter temporally integrates any radiance traversing a pixel’s solid angle over the exposure duration. Conversely, history reuse propagates the evaluated radiance of a surface that has already vacated the geometric boundary.

![Loft still after a camera truck: cream-glaze bottle, brass sphere, oak sideboard, factory mullions. Naive EMA, α=0.10 current-frame weight, clamp off, jitter 0. The bottle and sideboard leave a comet on the newly revealed window. Khronos PBR Neutral e=1.05. Photograph only — no residual RMS.](/assets/journal/taa-ghosting/14_real_hero.jpg)

We evaluate the established loft environment from the IBL and tone-mapping analyses, rendered during a camera truck translation along \(+X\) while maintaining a fixed look-at target. Executing a naive Exponential Moving Average (EMA) with a current-frame weight of \(\alpha=0.10\), disabled clamping, and zero jitter, the geometry of the bottle and sideboard generates a distinct comet-like artifact across the newly disoccluded window region. The instrumentation HUD specifies: `Khronos PBR Neutral e=1.05`, `camera truck`, and `photo-only - no metric`. Residual RMS metrics must not be derived from this photographic representation.

![Teaching pin. Identical loft St. Left: no temporal. Middle: naive EMA — ghost loud. Right: EMA + 3×3 RGB minmax clamp — comet cut, residual the AABB still accepted. Photograph only.](/assets/journal/taa-ghosting/15_real_3up.jpg)

**Pin this comparison.** The current loft frame \(S_t\) remains mathematically identical across all three evaluations; only the historical integration policy varies. Left: **no temporal integration**. Middle: **naive EMA** exhibiting severe, structured ghosting. Right: **EMA augmented with a \(3\times 3\) RGB minmax clamp**, which truncates the comet artifact strictly to the residual accepted by the local neighborhood Axis-Aligned Bounding Box (AABB). The plate caption dictates: *identical current loft frame St — only history policy differs.* This visual serves exclusively as qualitative photographic evidence.

The evaluation was executed on Mesa 25.0.7 llvmpipe utilizing a linear Rec.709 history buffer, with **Khronos PBR Neutral** applied post-resolve: science field exposure \(e=1.00\), loft exposure \(e=1.05\). Within the defined ghost ROI on the synthetic science field, the residual RMS measures: naive 0.26056 versus clamp 0.00000 (\(n=11737\)). For the loft scene, the residual RMS measures: naive 0.20216 versus clamp 0.02162 (\(n=8748\)). The measured thin-stick streak length as a function of \(\alpha\) (naive evaluation, translation velocity \(\vert{}v\vert{}\approx 8.28\) px/frame) yields: 455, 338, 160, and 45 pixels at \(\alpha \in \{0.05, 0.10, 0.20, 0.50\}\), respectively. The loft translation velocity measures \(\vert{}v\vert{}\approx 9.97\) px/frame. The blending function is strictly defined as: \(C=\alpha S+(1-\alpha)\hat{H}\). The clamping heuristic is the \(3\times 3\) RGB minmax operation. The automated assertion suite reports: 42 pass / 0 fail.


## Scene
The analysis evaluates two distinct environments governed by a unified temporal mixing function. The display pipeline remains strictly inherited: the temporal resolve occurs in linear space, followed by tone mapping via Khronos PBR Neutral, terminating with the IEC 61966-2-1 sRGB OETF. We reiterate that the tone mapping curve cannot synthesize absent lighting data, and the TAA resolve pass cannot hallucinate valid shaded samples for regions lacking evaluation.

**Presentation hook.** A lateral camera truck evaluating naive EMA with \(\alpha=0.10\), disabled clamping, and zero jitter. The presentation juxtaposes the full-frame rendering with a localized diagnostic crop bounding the bottle, sideboard, and window interface. The translation velocity \(\vert{}v\vert{}\) is parameterized intentionally faster than a conventional product-still dolly track, ensuring the temporal smear remains explicitly legible during a casual, full-frame inspection. This serves strictly as photographic evidence.

**Teaching pin (loft).** A comparative evaluation of the identical current frame evaluated under three operational modes. The left panel isolates the raw current evaluation \(S_t\). The center panel applies historical integration without a neighborhood bounding box constraint. The right panel engages the specified minmax clamping control.

![Loud loft crop. Left: naive beauty of the ghost edge. Right: |naive−St| linear-luma heat. Mullion stripes, sideboard top, bottle rim, brass limb. If the hero looked like motion blur from across the room, this crop is leftover history.](/assets/journal/taa-ghosting/16_real_crop.jpg)

![Theorem plate. Constructed amber field, dark pillar, thin cyan stick. Naive EMA, α=0.10, Neutral e=1.00, jitter 0. Static camera; pillar and stick translate in −X, the trail is +X. Photograph only.](/assets/journal/taa-ghosting/00_hero.jpg)

![Science teaching pin. Identical St: no temporal | naive EMA | EMA + 3×3 RGB minmax. Uniform field, so the policy is the only variable. Photograph only.](/assets/journal/taa-ghosting/01_3up.jpg)

![Science heat. Zoom of the revealed wall. Beauty | |naive−St| heat, ROI box drawn. Caption: clamp is not a visibility solve. RMS is the CSV, not the JPEG.](/assets/journal/taa-ghosting/02_disocclusion.jpg)

**Loud loft crop.** Left: the naive beauty rendering of the temporal ghost boundary. Right: an absolute residual \(\vert{}\mathrm{naive}-S_t\vert{}\) mapped as linear-luma heat, explicitly isolating the residual structure of the mullion stripes, sideboard top, bottle rim, and brass geometric limb. While the wide hero shot might perceptually masquerade as motion blur, this diagnostic crop provides mathematical verification of residual historical data.

**Theorem plate.** A synthetic diagnostic environment comprising an amber field, a dark geometric pillar, and a thin cyan stick. This evaluation employs the identical mixing formulation, matching \(\alpha=0.10\), zero jitter, and Neutral exposure \(e=1.00\). The camera remains entirely static while the pillar and stick undergo a rigid translation along \(-X\), generating a trailing artifact along \(+X\). The resulting smear exhibits a textbook exponential decay rather than the linear integration characteristic of a physical shutter.

**Science teaching pin.** The identical current state \(S_t\) evaluated under three distinct regimes: no temporal integration, naive EMA, and EMA augmented with a \(3\times 3\) RGB minmax clamp. The uniform background explicitly isolates the historical integration policy as the sole visual variable.

**Science heat.** A localized diagnostic magnification of the disoccluded wall surface, contrasting the beauty rendering against the absolute residual \(\vert{}\mathrm{naive}-S_t\vert{}\) heat map, with the evaluation ROI explicitly delineated. The plate caption formally notes: *clamp is not a visibility solve.* Quantitative RMS metrics must be extracted from the tabulated CSV data, not estimated from the compressed JPEG representation.

These two evaluative modes are strictly segregated:

1. **Beauty plates** (encompassing the loft hero, loft 3-up, theorem composite, science 3-up, stick evaluation, \(\alpha\) parameter ladder, speed ladder, and accumulation baseline) represent GL-rendered current samples, resolved temporally, and finalized via Neutral tone mapping and sRGB encoding. The embedded HUD label `photo-only` dictates that residual magnitudes and streak lengths must not be derived from the JPEG file.
2. **Instruments** (comprising the loft crop heat map, science disocclusion heat map, clamp residual analysis, and analytical fingerprint plot) evaluate the uncompressed floating-point buffer directly, quantifying residual RMS, discrete streak pixel counts, geometric velocities, and applied history weights. Quantitative citations must reference the CSV directly.

---

## Method

### What TAA is (and is not: motion blur)
Physical motion blur constitutes a continuous radiometric integral evaluated over an open shutter interval. A sensory element that observes a foreground pillar followed by a background wall during the open shutter records the integrated radiance across that defined **exposure interval**. This resultant smear is fundamentally physical: it maps the spatial trajectory of all geometry intersecting the sensor's solid angle during \(T_\mathrm{open}\).

Conversely, Temporal Anti-Aliasing (TAA) does not mathematically simulate an exposure shutter. No continuous exposure interval is evaluated during the resolve pass. Rather, the previously **resolved frame** is sampled at a reprojected coordinate and integrated under the explicit heuristic that the historical color remains valid at the current spatial coordinate. In the event of a disocclusion, that historical color corresponds to geometry that has vacated the sampled solid angle. Integrating this invalid data generates a **ghost** artifact, not a physical motion-blur kernel.

For all primary ghosting evaluations, the subpixel jitter offset is strictly clamped to 0. Under this specific configuration, designating the process as temporal *anti-aliasing* is technically inaccurate; the process evaluates pure temporal **accumulation**—the exponential persistence of previously resolved samples. The single evaluation employing subpixel jitter is the accumulation baseline: a static camera utilizing Halton \(2,3\) offsets to contrast the raw spatial aliasing of the current frame against the converged EMA. This operational trade-off (reducing noise and aliasing) constitutes the core algorithmic bet. The comet artifacts present on the loft truck and the synthetic amber theorem represent the deterministic penalty for this approach.

Within this formulation, \(\alpha\) specifies the **current-frame weight**, strictly bounded within the interval \((0,1]\). A higher \(\alpha\) parameter heavily biases the integration toward the current frame, accelerating the decay of ghost artifacts; a lower \(\alpha\) parameter heavily biases the integration toward the history buffer, significantly increasing the persistence of ghosting. This mathematical convention must not be inverted.

---

### Why: EMA, reprojection, minmax clamp
The rendering and temporal resolve operations execute exclusively within a **linear Rec.709** color space. The history buffer is allocated as RGBA32F, and all temporal blending operations occur within this linear domain. Display tone mapping and OETF encoding are implemented as explicit post-resolve operations and are never written back into the history buffer \(H\).

### Exponential accumulate

Subsequent to coordinate reprojection, neighborhood clamping, and heuristic rejection evaluations, the temporal blend is formalized as:

\[C_t(\mathbf{u}) = \alpha\, S_t(\mathbf{u}) + (1-\alpha)\,\hat{H}_{t-1}(\mathbf{u}_\mathrm{prev}).\]

* \(S_t\) — The currently evaluated shaded sample, expressed in linear RGB.
* \(\hat{H}\) — The reprojected history sample evaluated after clamping and rejection heuristics (or the unmodified raw history \(H\) when clamping is bypassed).
* The default evaluation parameter: \(\alpha=0.10\).

The blending formulation is strictly locked as: \(C = \alpha S + (1-\alpha)\hat{H}\). This is verified via a discrete unit assertion: \(S=1\), \(H=0\), evaluated at \(\alpha=0.10\) must deterministically yield \(C=0.10\).

### Steady-state tail (the plot, not a slogan)

The temporal decay of a discrete unit step function vacated by geometry follows the exponential relationship \((1-\alpha)^N\) over \(N\) discrete frames. By establishing an arbitrary but consistent visible-tail threshold of \(\varepsilon=1/64\):

\[N_\varepsilon = \frac{\log\varepsilon}{\log(1-\alpha)}, \qquad L_\mathrm{px} \approx v\cdot N_\varepsilon = v\cdot\frac{\log\varepsilon}{\log(1-\alpha)}.\]

In this formulation, \(v\) defines the pixel velocity (px/frame), and \(L_\mathrm{px}\) computes the spatial extent of the visible streak. Mapping this analytical function against the empirically measured tail lengths generates the characteristic fingerprint profile of the estimator.

### Reprojection (honest path)

Historical sampling employs bilinear texture filtering to evaluate the color data at \(\mathbf{u}_\mathrm{prev}\), coupled with a nearest-neighbor fetch for the associated depth scalar \(z\). The pipeline explicitly omits higher-order reconstruction filters (e.g., Catmull-Rom) and subsequent 9-tap spatial sharpening passes.

**Science field.** The evaluation camera is rigorously static. The background wall and floor planes reproject via the camera matrix, effectively acting as an identity transformation. Translating geometric meshes compute their screen-space motion directly from the differential of their world-space coordinates under a uniform rigid translation.

**Loft still.** The environmental geometry is completely static while the camera executes a continuous translation along \(+X\), maintaining a fixed look-at vector intersecting the central IBL reference point. The reprojection coordinate is derived analytically:

\[\mathbf{p}_\mathrm{prev}^\mathrm{clip} = \mathbf{M}_\mathrm{prev}\, \mathbf{p}_\mathrm{world}, \qquad \mathbf{u}_\mathrm{prev} = \mathrm{ndc\_to\_uv}(\mathbf{p}_\mathrm{prev}), \qquad \mathbf{v} = \mathbf{u}-\mathbf{u}_\mathrm{prev}.\]

The computed motion vector \(\mathbf{v}\) represents a direct UV offset derived from the known transformation matrices—**not** an estimated vector field generated via a hardware motion-vector pass or post-process optical flow algorithm. The sky dome utilizes a fixed far-plane proxy positioned at a depth of 400 units. Crucially, view-dependent specular highlights evaluating on the brass sphere are **not** reprojected (they track strictly with the world-space geometry normal and reflection vector); the resulting temporal smear across the highlight constitutes a mathematically valid artifact of residual history, not a failure of the motion-vector pipeline.

### Neighborhood clamp (named control)

The implemented clamping heuristic utilizes the standard Lottes/Karis minmax formulation, computed strictly within the **RGB** color space across the currently evaluated \(3\times 3\) spatial neighborhood \(\Omega\):

\[\hat{H} = \mathrm{clamp}\!\bigl( H(\mathbf{u}_\mathrm{prev}),\; \min_{\Omega} S_t,\; \max_{\Omega} S_t \bigr).\]

This specific bounding mechanism constitutes the defined control referenced across the 3-up comparative evaluations. It is formally designated as **clamp**. This mechanism must not be mischaracterized as a "variance clip," nor should it be conflated with the `clipToAABB` algorithm or YCoCg-space bounding implementations utilized by Playdead. While those methodologies are theoretically sound and widely adopted, they are definitively not the algorithms that generated this specific evaluative plate.

The minmax clamp mathematically constrains the historical color data to the bounding box established by the immediate spatial neighborhood; it inherently does **not** resolve geometric visibility or disocclusion failures. Along a distinct disocclusion boundary, the evaluating \(3\times 3\) footprint spans both the foreground occluder and the newly disoccluded background surface, inadvertently generating a bounding box that permits stale historical color to pass the validation check.

### Reject (cousin bit, off on heroes)

* If the reprojected coordinate \(\mathbf{u}_\mathrm{prev}\) evaluates to an off-screen position, the historical sample \(\hat{H}\) is unconditionally discarded, forcing a fallback strictly to the current sample \(S_t\).
* Depth test heuristic: the historical sample is rejected if the absolute depth differential exceeds a defined threshold, \(\lvert z_t(\mathbf{u})-z_{t-1}(\mathbf{u}_\mathrm{prev})\rvert > \tau\), where \(\tau\) is parameterized at 0.25 in world-\(z\) space.

For the primary ghosting evaluation plates, the depth rejection heuristic is intentionally **disabled** to ensure the temporal smear artifacts propagate fully without truncation. The off-screen coordinate validation remains unconditionally active to prevent sampling invalid memory regions.

### Display (inherited, not re-derived)

\[L_{\mathrm{display}} = \mathrm{TM}\bigl(\mathrm{expose}(C)\bigr) \quad\text{then sRGB OETF for PNG.}\]

The tone mapping operator is strictly locked to **Khronos PBR Neutral**. The synthetic science field is evaluated at an exposure of \(e=1.00\), whereas the loft environment is evaluated at \(e=1.05\) to strictly preserve radiometric parity with the prior IBL and tone-mapping documentation. This pipeline purposefully omits any comparative evaluation against alternative clip, Reinhard, or ACES operators. Hardware-accelerated `GL_FRAMEBUFFER_SRGB` encoding remains disabled, with the final non-linear encoding evaluated explicitly on the CPU. All quantitative residual measurements are derived strictly from the uncompressed float buffer, bypassing the encoded PNG output.

---

### Two paths, do not mix the instruments
| path | frames | instrument |
| --- | --- | --- |
| **Science photograph** | theorem, science 3-up, stick, \(\alpha\) ladder, speed ladder, accumulate bet | Lambert field on this llvmpipe, CPU history ping-pong, Neutral \(e=1.00\). HUD `photo-only`. |
| **Science instrument** | disocclusion heat, clamp residual, fingerprint | residual heat, streak vs \(\alpha\). |
| **Loft photograph** | hero, loft 3-up | Split-sum loft (IBL tables reused, not re-derived), camera truck, Neutral \(e=1.05\). HUD `photo-only`. |
| **Loft crop / heat** | loud crop | nearest crop of naive beauty + \(\lvert\mathrm{naive}-S_t\rvert\) heat. RMS from CSV. |
| **Display** | every plate | expose \(e\) \(\to\) Neutral \(\to\) sRGB OETF. Resolve is linear. Operator is inherited. |

The 3-up comparative panels serve dually as photographic demonstrations of the applied heuristic controls and as the foundational teaching material. Methodological rigor requires relying strictly on the CSV dataset for all RMS and streak measurements; it is invalid to quote the 8-bit non-linear display output as representing a precision metric of 0.26056.

---

## Discussion

### Unique artifact: streak vs \(\alpha\)
![Unique artifact. Left: thin cyan stick under naive EMA at α=0.10 — a comet of coverage that already left. Right: measured streak px vs α∈{0.05, 0.10, 0.20, 0.50} plus the analytic v·log ε/log(1−α) curve. Coverage + history, not wrong MV. Quote the CSV.](/assets/journal/taa-ghosting/10_fingerprint.jpg)

This specific artifact empirically isolates the foundational phenomenon this analysis aims to quantify. The left panel depicts a thin cyan stick evaluated under a naive Exponential Moving Average (EMA) parameterized at \(\alpha=0.10\), generating a trailing comet artifact corresponding to coverage that has already vacated the geometric boundary. The right panel plots the empirically measured streak lengths (in pixels) across the discrete parameter set \(\alpha\in\{0.05, 0.10, 0.20, 0.50\}\), superimposed against the theoretical analytical decay curve \(v\cdot\log\varepsilon/\log(1-\alpha)\). The instrumentation HUD confirms: geometric velocity \(v=8.28\) px/frame, and the visible tail threshold \(\varepsilon=1/64\). The plate caption explicitly reinforces the theorem: *coverage + history, not wrong MV.*

The persistent temporal lag observed on a geometrically thin 1–2 px structural detail represents a direct consequence of **subpixel coverage combined with historical integration**, rather than an erroneous motion vector calculation. Perspective projection lean stretches the overall geometric Axis-Aligned Bounding Box (AABB) of the stick to approximately 16 pixels over its full vertical extent. However, evaluated across any single mid-wall scanline, the projected geometry measures merely a 2–3 px rod. Because Multi-Sample Anti-Aliasing (MSAA) is explicitly disabled, subpixel coverage remains binary; consequently, any subpixel sample that geometrically fails to register in the current evaluation \(S_t\) continues to persist indefinitely within the history buffer \(H\).

Evaluated at \(\alpha=0.05\), the empirically measured tail length of 455 px is artificially truncated by the finite sequence limit of \(N=52\) evaluated frames (whereas the unbounded analytical derivation projects a tail extending to 671 px). At \(\alpha=0.10\), empirical measurements tightly corroborate the theoretical prediction: an observed length of 338 px against an analytically predicted length of 326.6 px. Quantitative assertions must always quote the CSV dataset, not visual estimates from the JPEG.

---

### What-if failures and controls
Four specific evaluative controls are examined. Each parameter variation is supported by a dedicated, isolated evaluation plate rather than being simultaneously modulated on the primary hero rendering.

### What if: History policy (the 3-up)

Documented in the loft 3-up and science 3-up comparisons. A singular input frame is temporally resolved under three distinct heuristic policies to mathematically verify that the ghosting artifact is intrinsically a property of the historical integration policy, not a defect in the currently evaluated shaded frame. The clamped rendering serves as the explicitly named control, not as an idealized, artifact-free cinematic ground truth; localized aliasing and temporal lag necessarily persist in regions where historical data is aggressively truncated by the bounding box.

### What if: Clamp on/off

![Instrument. |naive−clamp| heat. Where the 3×3 RGB minmax spent budget. Same St.](/assets/journal/taa-ghosting/08_clamp_residual.jpg)

The clamp-residual heat map is presented alongside the science disocclusion and localized loft crop views. On the uniform test field, the clamp residual computed inside the inset ROI evaluates strictly to 0.00000 because the sampling neighborhood \(\Omega\) comprises exclusively uniform amber wall pixels. Conversely, on the loft environment, the residual evaluates to 0.02162 because the \(3\times 3\) bounding box spans the high-contrast transition between mullions, dark wood, reflective glaze, and the bright window backdrop. Any stale historical color that falls within this expanded dynamic range is mathematically retained. The core analytical takeaway remains: *clamp is not a visibility solve.*

### What if: \(\alpha\) ladder

![Naive α=0.05 / 0.10 / 0.20 / 0.50, same motion, no clamp. Streak 455 / 338 / 160 / 45 px. Photograph only.](/assets/journal/taa-ghosting/06_alpha_ladder.jpg)

This ladder is evaluated under naive EMA lacking bounding constraints, operating under a constant translation velocity. The measured streak contracts systematically as the current-frame weight \(\alpha\) increases: 455 \(\to\) 338 \(\to\) 160 \(\to\) 45 px. Elevating the \(\alpha\) parameter prioritizes the integration of current-frame data, effectively minimizing the temporal extent of ghosting, but structurally forfeits the spatial alias-reduction benefits inherent to temporal accumulation. The empirical fingerprint plot maps these identical values into a graphical representation.

### What if: Motion speed

![α=0.10 fixed, v≈2 / 8 / 16 px/frame, naive vs clamp. Ghost grows with v. Photograph only.](/assets/journal/taa-ghosting/07_speed_ladder.jpg)

Isolating the temporal weight at \(\alpha=0.10\) across varied translation speeds of \(v\approx 2, 8,\) and \(16\) px/frame, this evaluation contrasts naive EMA directly against the clamped resolve heuristic. The resulting naive streak lengths scale proportionally up to 82, 338, and 499 px. Although the core blending mathematics remain strictly unchanged, elevated velocities spatially stretch the resulting artifact proportionally. In contrast, the clamped evaluation panels remain radiometrically stable across the uniform background field.

### What if: Thin-stick lag

![Thin-stick 3-up. Left: current coverage, a 2–3 px rod. Middle: history comet. Right: clamp eats the comet because the neighborhood is field color. Coverage + history, not wrong MV. Photograph only.](/assets/journal/taa-ghosting/03_stick_3up.jpg)

Left panel: the current frame coverage isolating a 2–3 px wide cylindrical rod. Middle panel: the resultant historical comet trail generated by the naive resolve. Right panel: the clamping heuristic fully eliminates the temporal trail because the encompassing neighborhood \(\Omega\) evaluates purely to background field radiometric samples. The plate caption formally states: coverage + history, not wrong MV.

### What if: The bet (not the hero)

![The bet, not the hero. Static camera, Halton 2,3 jitter. Left: current checker is aliased. Right: EMA at α=0.10. This is the noise/alias reduction you bought the ghost with.](/assets/journal/taa-ghosting/09_accumulate.jpg)

Evaluated utilizing a strictly stationary camera supplemented with Halton \(2,3\) subpixel spatial jitter. On the left, the single-frame evaluation of the checkerboard pattern exhibits severe spatial aliasing. On the right, the EMA filter parameterized at \(\alpha=0.10\) demonstrates the targeted anti-aliasing and noise suppression capabilities acquired specifically at the expense of temporal ghosting. The plate caption notes: *this is the bet; the ghost plates are the cost.*

---

## Limits

### Honesty gaps
1. **Output PNGs represent a single selected frame from an offline sequence of length \(N\), not a photographic capture of 60 Hz display persistence.** The synthetic science evaluation sequence processes \(N=52\) discrete frames following history buffer initialization; the loft environment sequence processes \(N=28\) frames. This analysis makes no claims regarding dynamic refresh-rate phenomenology.
2. **This is not physical motion blur.** The evaluated mechanism represents historical radiometric reuse, fundamentally distinct from optical shutter integration. Subpixel spatial jitter is rigorously locked to 0 across all ghosting evaluation plates and is active solely for the Halton accumulation variance test.
3. **\(\alpha\) denotes the current-frame blending weight.** The temporal accumulation function is strictly parameterized as \(C = \alpha S + (1-\alpha)\hat{H}\). This relationship must not be inverted.
4. **Neighborhood clamping is not a solution for visibility.** Within the designated science ROI, the clamp RMS evaluates identically to 0.00000 solely because the bounding region is localized on an untextured, uniform background. Evaluated on the high-contrast textured geometry of the loft scene, the identical mathematical operation yields a residual RMS of 0.02162. High-contrast disocclusion boundaries systematically fail to reject stale historical radiance.
5. **Velocities are derived analytically via camera matrices (loft scene, science walls) or rigid previous-frame translations (science pillar/stick).** The rendering pipeline explicitly omits screen-space velocity buffers, skeletal skinned motion vectors, or post-process optical flow estimation. The sky environment relies on a planar proxy projected at 400 units. Furthermore, view-dependent specular highlights evaluating on the brass geometry are not reprojected.
6. **Thin-stick persistence stems from coverage and history accumulation, not incorrect motion vectors.** Subpixel geometric coverage is analytically binary due to the disabled MSAA state. While the global stick AABB extends approximately 16 pixels vertically, the projected geometry occupies a mere 2–3 px horizontal rod on any specific scanline.
7. **Depth rejection is a secondary fail-safe.** Parameterized at \(\tau=0.25\) world-\(z\), this heuristic is deliberately forced off on the primary ghosting evaluation plates to ensure the complete temporal smear is preserved for analysis without artificially masking disocclusion artifacts.
8. **TAA fundamentally trades aliasing/noise reduction against temporal lag and ghosting.** The clamped resolve variant demonstrates one specific variance bounding heuristic, not a universally optimal or absolute visual baseline.
9. **Low-\(\alpha\) streak measurements (\(\alpha=0.05\)) are truncated by the sequence length of \(N=52\).** The theoretical analytical model projects an unbounded sequence length (yielding 671 theoretical pixels versus the 455 measured pixels). All quantitative citations must reference the CSV directly.
10. **The loft camera truck is intentionally fast.** Parameterized at an arbitrary velocity of \(\vert{}v\vert{}\approx 9.97\) px/frame, the naive comet artifact is deliberately exaggerated to remain explicitly legible across the full frame, contrasting with the subtle velocities typical of a cinematic dolly.
11. **IBL and tone-mapping models are carried over from earlier notes, not re-evaluated here.** The Khronos PBR Neutral tone-mapping parameters are strictly locked and not re-fit. Contact occlusion employs a simplified planar cosine approximation, and the environmental illumination is sourced from a synthetic procedural loft HDR rather than an empirical EXR capture.
12. **This implementation is baseline TAA.** The pipeline explicitly lacks advanced reconstruction models such as DLSS, FSR, XeSS, 9-tap Catmull-Rom history sampling, YCoCg `clipToAABB` variance bounding, or specialized tensor hardware acceleration.
13. **Rendered PNGs are 8-bit display-referred images.** It is methodologically invalid to perform Fourier analysis or execute radiometric energy-conservation integrals on the non-linear JPEG files; the evaluated residual RMS and spatial streak magnitudes are mathematically valid only when computed against the linear floating-point buffer.

---

### Mesa / llvmpipe — what this run can claim
| item | value |
| --- | --- |
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| FBO color | RGBA32F complete, \(1280\times 720\) |
| `GL_FRAMEBUFFER_SRGB` | disabled (Neutral + sRGB OETF on CPU) |
| MSAA | disabled |
| History | CPU ping-pong RGBA32F, bilinear color, nearest \(z\) |
| Mix | \(C=\alpha S+(1-\alpha)\hat{H}\), \(\alpha=\) current-frame weight |
| Clamp | \(3\times 3\) RGB minmax of current \(S_t\) |
| Science | \(N=52\), \(v=8.275\) px/frame, Neutral \(e=1.00\), jitter 0 |
| Loft | \(N=28\), \(v=9.971\) px/frame, Neutral \(e=1.05\), jitter 0 |
| Depth-reject \(\tau\) | 0.25 world-\(z\), instrument only, off on heroes |
| Tail \(\varepsilon\) | \(1/64\) |

What this configuration validates: executing on this specifically designated OSMesa / llvmpipe build, an offline rendering sequence processed over \(N\) discrete frames utilizing known rigid object translations (science field) or known camera matrix transformations (loft scene), integrating an EMA pass parameterized with \(\alpha\) as the current-frame weight alongside a \(3\times 3\) RGB minmax clamp, deterministically generates the documented output plates. The evaluated residual RMS within the defined ghost ROI and the spatial streak lengths scale consistently with the tabulated CSV data as the parameters \(\alpha\), velocity \(v\), and clamping state are modulated.

What it cannot claim: parity with hardware-accelerated TAA implementations, evaluations of 60 Hz display persistence phenomenology, the generation of production-ready motion vectors, a comprehensive resolution for ghosting artifacts via minmax clamping, DLSS-tier spatiotemporal reconstruction fidelity, or any performance-oriented metrics characterizing discrete GPUs, hardware thread occupancy limits, or memory bandwidth utilization.

---

## Out of scope

Comparative benchmarking of production TAA pipelines (e.g., SMAA+TAA+sharpen, or proprietary implementations within Unreal, Unity, or Godot). Deep learning reconstruction architectures (DLSS, FSR, XeSS). Comprehensive motion-vector generation subsystems (screen-space velocity buffers, skinned geometry vectors, displacement motion vectors, or optical flow). Path-traced spatiotemporal denoising filters (SVGF, ReSTIR spatio-temporal variants, OIDN). Nine-tap Catmull-Rom historical sampling algorithms, YCoCg variance clipping utilizing `clipToAABB` as a generalized baseline, or velocity-weighted blending heuristics. The application of Halton or R2 subpixel jitter sequences on the primary ghost-demonstration heroes. High-frequency specular aliasing mitigation, Toksvig normal filtering, anisotropic GGX distributions, or sRGB versus linear texture decoding evaluations. Re-evaluating alternative tone-mapping operators (clip, Reinhard, ACES, exposure ladders)—Khronos PBR Neutral remains the rigidly fixed display operator inherited from prior documentation. Shadow-map bias tuning optimizations. Dedicated hardware TAA pipelines, 60 Hz display refresh characteristics, GPU thread occupancy, and hardware bandwidth profiling. Theoretical derivations encompassing Karis filtering, split-sum DFG approximations, or the Khronos Neutral transfer curve (refer to earlier documentation for foundational derivations).

---

Dense meters follow.

---

## Appendix A — Meters (quote tables, not photographs)

All analytical metrics are extracted directly from the uncompressed float buffer evaluated via Mesa llvmpipe. Residual RMS is calculated in the linear RGB domain, evaluated against the current frame \(S_t\) within a strictly defined, static-pixel ghost Region of Interest (ROI):

\[\mathrm{RMS} = \sqrt{ \frac{1}{3n} \sum_{p\in\mathrm{ROI}} \lVert C(p)-S_t(p)\rVert_2^2 }.\]

The defined science ROI encompasses \(n=11737\) pixels; the defined loft ROI encompasses \(n=8748\) pixels. Streak lengths are quantified utilizing the visibility threshold \(\varepsilon=1/64\) measured along a horizontal mid-stick scanline. Out-of-bounds screen coordinates appropriately discard historical data as specified; however, the depth-fail rejection heuristic is intentionally **not applied** on the primary ghosting evaluation plates to ensure the temporal smear remains fully quantified.

Science field, frame 51, translation velocity \(\vert{}v\vert{}=8.275\) px/frame, Khronos PBR Neutral exposure \(e=1.00\):

| tag | \(\alpha\) | clamp | residual RMS | streak px |
| --- | --- | --- | --- | --- |
| hero naive | 0.10 | off | **0.26056** | 338 |
| hero clamp | 0.10 | on | **0.00000** | 0 |
| \(\alpha=0.05\) | 0.05 | off | 0.36297 | **455** |
| \(\alpha=0.10\) | 0.10 | off | 0.26056 | **338** |
| \(\alpha=0.20\) | 0.20 | off | 0.15594 | **160** |
| \(\alpha=0.50\) | 0.50 | off | 0.04780 | **45** |
| speed \(v\approx 2\) | 0.10 | off | 0.10091 | **82** |
| speed \(v\approx 16\) | 0.10 | off | 0.35187 | **499** |

Analytical streak values \(v\cdot\log\varepsilon/\log(1-\alpha)\) evaluated at \(\vert{}v\vert{}=8.275\): 671.0, 326.6, 154.2, and 49.7 pixels for \(\alpha=0.05, 0.10, 0.20,\) and \(0.50\), respectively.

Loft still, frame 27, translation velocity \(\vert{}v\vert{}=9.971\) px/frame, Khronos PBR Neutral exposure \(e=1.05\), evaluated at \(\alpha=0.10\):

| tag | clamp | residual RMS | \(n\) |
| --- | --- | --- | --- |
| loft naive | off | **0.20216** | 8748 |
| loft clamp | on | **0.02162** | 8748 |

The reference metrics summarized in the introductory section are derived identically: science RMS 0.26056 / 0.00000; loft RMS 0.20216 / 0.02162; evaluated streak lengths 455, 338, 160, and 45 pixels; measured translation velocities \(\vert{}v\vert{}\approx 8.28\) and 9.97 px/frame. It is methodologically invalid to attempt to reconstruct residual magnitudes or streak lengths via visual estimation from the loft hero, the loft 3-up, or the amber theorem plates. Those visual representations are strictly designated `photo-only`.

The reported science clamp RMS metric of 0.00000 is a direct consequence of the uniform radiometric field: the evaluated ROI is spatially positioned 8 pixels away from the translating occluder, guaranteeing that the \(3\times 3\) sampling kernel evaluates only solid background wall pixels. This null result does not imply that the clamping operation analytically resolves geometric visibility. Evaluated against the complex, highly textured geometry comprising the loft boundary, the identical clamping heuristic yields a measurable residual RMS of 0.02162.

---

## Appendix B — Assertions

Validation status: 42 pass / 0 fail.

| check | result |
| --- | --- |
| Mix unit: \(\alpha=0.10\), \(S=1\), \(H=0\) \(\Rightarrow\) \(C=0.10\) | PASS |
| FBO is RGBA32F | PASS |
| Required gallery plates exist and are non-empty | PASS |
| No NaNs in resolve | PASS |
| Science pillar / stick coverage and \(3 < v < 16\) px/frame | PASS 8.275 |
| Naive ROI RMS \(>\) clamp \(\times 1.8\) and \(>0.02\) | PASS 0.26056 vs 0.00000 |
| Streak monotone in \(\alpha\): \(0.05\ge 0.10>0.20>0.50\) | PASS 455 / 338 / 160 / 45 |
| Speed monotone: \(v_{16}>v_8>v_2\) streak | PASS 499 / 338 / 82 |
| Loft naive RMS \(>\) clamp RMS and \(>0.008\) | PASS 0.20216 vs 0.02162 |
| Loft \(v>3\) px/frame | PASS 9.971 |

All assertion tolerances were rigorously enforced and were not artificially relaxed to accommodate variance in the photoreal plates.

---

## Appendix C — Resolve lock

```text
H     = bilinear(history, u_prev)     // nearest z
Hhat  = clamp ? minmax3x3_rgb(S, H) : H
C     = alpha * S + (1 - alpha) * Hhat
PNG   = sRGB_OETF( Neutral(e * C) )

```

Rigidly locked parameters: \(\alpha\) formally defines the current-frame integration weight; the baseline evaluation defaults to \(\alpha=0.10\); the clamping heuristic is strictly constrained to the \(3\times 3\) RGB minmax bounding box evaluated over \(S_t\); subpixel spatial jitter is fixed to 0 on all ghosting hero plates. The loft camera truck rendering serves as the primary visual presentation. The loft 3-up plate functions as the core instructional comparison. The analytical fingerprint plot isolates the specific coverage artifact. The synthetic amber field operates as the governing diagnostic theorem. The underlying blending mathematics deterministically dictate the visual output: temporal history integration represents a statistical bet, and ghosting artifacts constitute the deterministic penalty incurred when that bet fails.
