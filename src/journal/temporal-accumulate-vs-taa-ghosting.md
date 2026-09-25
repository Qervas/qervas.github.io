---
title: "Temporal Accumulate vs TAA Ghosting"
description: "TAA is a bet that last frame’s color is still this pixel. Loft naive EMA residual 0.20216 vs clamp 0.02162; science 0.26056 vs 0. The ghost is leftover history — not a shutter."
date: 2026-09-16
tags:
  - graphics
  - engine
  - temporal
math: true
cover: /assets/journal/taa-ghosting/14_real_hero.jpg
---

The previous note settled the display operator: a single RGBA32F still, a named curve, and the sRGB OETF. Time was intentionally out of scope there—*TAA, temporal accumulation, and firefly suppression acting as tone mapping.* This note tackles data reuse **across** frames. History lives in linear Rec.709. Khronos PBR Neutral still runs strictly after the resolve step, never directly on the history buffer itself.

**TAA is a bet that the previous frame’s color still belongs to this pixel. Ghosting is the price paid for noise reduction.**

Crucially, **it is not motion blur.** A physical shutter smears whatever crosses a pixel while it remains open. History reuse paints a surface that has already left.

![Loft still after a camera truck: cream-glaze bottle, brass sphere, oak sideboard, factory mullions. Naive EMA, α=0.10 current-frame weight, clamp off, jitter 0. The bottle and sideboard leave a comet on the newly revealed window. Khronos PBR Neutral e=1.05. Photograph only — no residual RMS.](/assets/journal/taa-ghosting/14_real_hero.jpg)

Here is the loft scene established in the IBL and tone-mapping notes, captured after a camera truck along $+X$ with the look-at point locked. Running a naive EMA with a current-frame weight of $\alpha=0.10$, clamping disabled, and jitter set to $0$, the bottle and sideboard leave a comet trail across the newly revealed window. HUD: `Khronos PBR Neutral  e=1.05`, `camera truck`, `photo-only - no metric`. Do not hang a residual RMS measurement on this photograph.

![Teaching pin. Identical loft St. Left: no temporal. Middle: naive EMA — ghost loud. Right: EMA + 3×3 RGB minmax clamp — comet cut, residual the AABB still accepted. Photograph only.](/assets/journal/taa-ghosting/15_real_3up.jpg)

**Pin this comparison.** Across all three panels, the current loft frame $S_t$ is identical; only the history policy differs. Left: **no temporal**. Middle: **naive EMA** with loud, unmistakable ghosting. Right: **EMA + $3\times 3$ RGB minmax clamp**, where the comet trail is cut back to whatever residual the AABB still admitted. Caption on the plate: *identical current loft frame St — only history policy differs.* Photograph only.

Rendered on Mesa 25.0.7 llvmpipe with linear Rec.709 history and **Khronos PBR Neutral** applied after resolve: science field $e=\mathbf{1.00}$, loft $e=\mathbf{1.05}$. Ghost ROI residual RMS on the science field: naive **0.26056** vs clamp **0.00000** ($n=11737$). On the loft: naive **0.20216** vs clamp **0.02162** ($n=8748$). Thin-stick streak length versus $\alpha$ (naive, $\vert{}v\vert{}\approx\mathbf{8.28}$ px/frame): **455 / 338 / 160 / 45** px at $\alpha=0.05/0.10/0.20/0.50$. Loft motion measures $\vert{}v\vert{}\approx\mathbf{9.97}$ px/frame. Blending function: $C=\alpha S+(1-\alpha)\hat{H}$. Clamping function: $3\times 3$ RGB minmax. Verification: **42 pass / 0 fail**.

---

## What you are seeing

Two scenes, governed by a single mix function. The display chain is inherited: resolve in linear space, tone-map through Khronos PBR Neutral, and apply the IEC 61966-2-1 sRGB OETF. The curve still cannot invent lighting, and TAA still cannot generate shaded samples that were never computed.

**Presentation hook.** A camera truck running naive EMA, with $\alpha=0.10$, clamping disabled, and jitter set to $0$. The presentation shows the full frame alongside an inset crop of the bottle, sideboard, and window boundary. The camera truck is deliberately faster than a typical product-still dolly: $\vert{}v\vert{}$ is calibrated so the smear remains obvious even at a casual, full-frame glance. Photograph only.

**Teaching pin (loft).** The identical current frame shown three ways. On the left is raw $S_t$. In the center, history is applied without a neighborhood bounding box. On the right, the named clamping control is engaged.

![Loud loft crop. Left: naive beauty of the ghost edge. Right: |naive−St| linear-luma heat. Mullion stripes, sideboard top, bottle rim, brass limb. If the hero looked like motion blur from across the room, this crop is leftover history.](/assets/journal/taa-ghosting/16_real_crop.jpg)

**Loud loft crop.** Left: naive beauty render of the ghosting edge. Right: $\vert{}\mathrm{naive}-S_t\vert{}$ linear-luma heat map exposing mullion stripes, sideboard top, bottle rim, and brass limb. If the wide hero shot could be mistaken for motion blur from across the room, this crop provides concrete proof of leftover history.

![Theorem plate. Constructed amber field, dark pillar, thin cyan stick. Naive EMA, α=0.10, Neutral e=1.00, jitter 0. Static camera; pillar and stick translate in −X, the trail is +X. Photograph only.](/assets/journal/taa-ghosting/00_hero.jpg)

**Theorem plate.** A synthetic test scene: an amber field, a dark pillar, and a thin cyan stick. It uses the same mix, the same $\alpha$, jitter locked to $0$, and Neutral $e=1.00$. The camera is static while the pillar and stick translate along $-X$, leaving a trail in $+X$. The smear forms a textbook exponential tail rather than a clean render.

![Science teaching pin. Identical St: no temporal | naive EMA | EMA + 3×3 RGB minmax. Uniform field, so the policy is the only variable. Photograph only.](/assets/journal/taa-ghosting/01_3up.jpg)

**Science teaching pin.** Identical $S_t$ under three regimes: no temporal | naive EMA | EMA + $3\times 3$ RGB minmax. The field is completely uniform, isolating the history policy as the single visible variable.

![Science heat. Zoom of the revealed wall. Beauty | |naive−St| heat, ROI box drawn. Caption: clamp is not a visibility solve. RMS is the CSV, not the JPEG.](/assets/journal/taa-ghosting/02_disocclusion.jpg)

**Science heat.** A close-up of the revealed wall showing the beauty pass against the $\vert{}\mathrm{naive}-S_t\vert{}$ heat map, with the ROI bounding box outlined. Plate caption: *clamp is not a visibility solve.* Read the RMS from the CSV, not from the compressed JPEG.

These two modes are never conflated:

1. **Beauty plates** (loft hero, loft 3-up, theorem, science 3-up, stick, $\alpha$ ladder, speed ladder, accumulate bet) show GL-rendered current samples plus resolve, followed by Neutral tone mapping and sRGB OETF. The HUD label `photo-only` means residual values and streak lengths must not be inferred from the JPEG.
2. **Instruments** (loft crop heat, science disocclusion heat, clamp residual, fingerprint plot) reflect the raw floating-point buffer: residual RMS, streak pixels, velocity, and history weights. Quote the CSV directly.

---

## What TAA is (and is not: motion blur)

Motion blur is an integral over shutter time. A pixel that sees a foreground pillar and then a background wall while the shutter is open records a blended radiance across that **exposure interval**. The resulting smear is physical: it represents the trajectory of whatever crossed the pixel during $T_\mathrm{open}$.

TAA does not model a shutter. There is no exposure interval anywhere in this resolve pass. Instead, the previously **resolved frame** is sampled at a reprojected coordinate and blended in under the assumption that its color still belongs at the current pixel. Following a disocclusion, that color belongs to geometry that has already moved away. Blending it produces a **ghost**, not a motion-blur kernel.

Every ghosting hero plate sets jitter to $0$. In that configuration, calling them temporal *anti-aliasing* is technically incorrect; they demonstrate pure temporal **accumulation**—the exponential persistence of historical samples. The sole jittered plate is the accumulate bet: a static camera using Halton $2,3$ subpixel offsets to contrast the raw current frame against the EMA. That trade-off (noise and aliasing $\downarrow$) is the bet. The comet tails on the loft truck and the amber theorem are the price paid.

Here, $\alpha$ denotes the **current-frame weight**, bounded by $(0,1]$. A high $\alpha$ favors the current frame, dampening ghosts; a low $\alpha$ relies heavily on history, letting ghosts linger. Do not invert the convention.

---

## Why: EMA, reprojection, minmax clamp

Working space remains strictly **linear Rec.709**. History is allocated as RGBA32F, and blending occurs in linear space. Display encoding is applied as an explicit post-resolve pass and is never baked into $H$.

### Exponential accumulate

Following reprojection, clamping, and rejection checks:

$$C_t(\mathbf{u}) = \alpha\, S_t(\mathbf{u}) + (1-\alpha)\,\hat{H}_{t-1}(\mathbf{u}_\mathrm{prev}).$$

* $S_t$ — current shaded sample, linear RGB.
* $\hat{H}$ — history sample after clamping/rejection (or raw $H$ when clamping is disabled).
* Default hero setting: $\alpha=0.10$.

Locked blending formula: $C = \alpha S + (1-\alpha)\hat{H}$. Unit assert: $S=1$, $H=0$, $\alpha=0.10$ $\Rightarrow$ $C=0.10$.

### Steady-state tail (the plot, not a slogan)

A unit step function vacated by geometry decays as $(1-\alpha)^N$ after $N$ frames. Establishing a visible-tail threshold of $\varepsilon=1/64$:

$$N_\varepsilon = \frac{\log\varepsilon}{\log(1-\alpha)}, \qquad L_\mathrm{px} \approx v\cdot N_\varepsilon = v\cdot\frac{\log\varepsilon}{\log(1-\alpha)}.$$

Here $v$ is measured in px/frame, and $L_\mathrm{px}$ represents the visible streak length. Plotting this analytical curve over measured tail lengths yields the fingerprint profile.

### Reprojection (honest path)

History lookups use bilinear filtering for color at $\mathbf{u}_\mathrm{prev}$ combined with nearest-depth $z$. There is no Catmull-Rom filtering and no 9-tap sharpening filter.

**Science field.** The camera remains static. Background walls and floor reproject via the camera matrix (the identity transform). Translating meshes derive motion from their previous world-space coordinates under a single rigid translation.

**Loft still.** Scene geometry is static while the camera trucks along $+X$, keeping its look-at fixed on the IBL reference point. Reprojection is evaluated as:

$$\mathbf{p}_\mathrm{prev}^\mathrm{clip} = \mathbf{M}_\mathrm{prev}\, \mathbf{p}_\mathrm{world}, \qquad \mathbf{u}_\mathrm{prev} = \mathrm{ndc\_to\_uv}(\mathbf{p}_\mathrm{prev}), \qquad \mathbf{v} = \mathbf{u}-\mathbf{u}_\mathrm{prev}.$$

The motion vector $\mathbf{v}$ is a UV offset computed directly from known matrices—**not** an output from a hardware motion-vector pass or optical flow. The sky uses a 400-unit far proxy plane. View-dependent specular highlights on the brass sphere are **not** reprojected (they track world position only); the resulting highlight smear is an honest artifact of leftover history, not an unfulfilled motion-vector claim.

### Neighborhood clamp (named control)

We use the Lottes / Karis minmax formulation, computed in **RGB** across the current $3\times 3$ neighborhood $\Omega$:

$$\hat{H} = \mathrm{clamp}\!\bigl( H(\mathbf{u}_\mathrm{prev}),\; \min_{\Omega} S_t,\; \max_{\Omega} S_t \bigr).$$

This is the exact control referenced in the 3-up comparisons. Call it **clamp**. Do not label a minmax plate as "variance clip," and do not substitute Playdead's `clipToAABB` / YCoCg as the baseline stack. Those approaches are valid, but they are not what generated this plate.

Clamping constrains historical color to the bounds of the immediate neighborhood; it does **not** resolve visibility. Along a disocclusion boundary, the $3\times 3$ bounding box simultaneously covers both the occluder and the newly exposed background, keeping stale historical color validly within range.

### Reject (cousin bit, off on heroes)

* If $\mathbf{u}_\mathrm{prev}$ falls off-screen, $\hat{H}$ is discarded, falling back to $S_t$.
* Depth test: rejected when $\lvert z_t(\mathbf{u})-z_{t-1}(\mathbf{u}_\mathrm{prev})\rvert > \tau$, with threshold $\tau=0.25$ world-$z$.

Depth rejection is intentionally turned **off** on the ghosting heroes so the smear remains fully visible. Off-screen coordinate checks remain active to discard out-of-bounds history.

### Display (inherited, not re-derived)

$$L_{\mathrm{display}} = \mathrm{TM}\bigl(\mathrm{expose}(C)\bigr) \quad\text{then sRGB OETF for PNG.}$$

Tone mapping is locked to **Khronos PBR Neutral**. The science field runs at $e=1.00$, while the loft runs at $e=1.05$ to maintain parity with earlier IBL and tone-mapping notes. This pass omits alternative clip, Reinhard, or ACES comparisons. Hardware `GL_FRAMEBUFFER_SRGB` is kept off, with final encoding handled on the CPU. All quantitative measurements come from the float buffer rather than the output PNG.

---

## Unique artifact: streak vs \(\alpha\)

![Unique artifact. Left: thin cyan stick under naive EMA at α=0.10 — a comet of coverage that already left. Right: measured streak px vs α∈{0.05, 0.10, 0.20, 0.50} plus the analytic v·log ε/log(1−α) curve. Coverage + history, not wrong MV. Quote the CSV.](/assets/journal/taa-ghosting/10_fingerprint.jpg)

This artifact illustrates the core phenomenon the note was built to capture. Left: a thin cyan stick evaluated under naive EMA at $\alpha=0.10$, trailing a comet of coverage that has already moved away. Right: measured streak lengths in pixels across $\alpha\in\{0.05,0.10,0.20,0.50\}$, plotted against the theoretical $v\cdot\log\varepsilon/\log(1-\alpha)$ curve. HUD: $v=8.28$ px/frame, $\varepsilon=1/64$. Plate caption: *coverage + history, not wrong MV.*

The persistent lag on a 1–2 px detail is a byproduct of **coverage plus history**, not an erroneous motion vector. Perspective lean stretches the stick's overall AABB to roughly 16 pixels over its full height, but across any single mid-wall scanline, the geometry is merely a 2–3 px rod. Subpixel coverage is binary because MSAA is off; any subpixel sample that fails to register in $S_t$ continues to linger within $H$.

At $\alpha=0.05$, the measured tail length of **455** px is clipped by the finite sequence limit of $N=52$ frames (whereas the analytical tail extends to an unbounded **671** px). At $\alpha=0.10$, empirical measurements align tightly with theory: **338** px observed versus **326.6** px predicted. Quote the CSV, not the JPEG.

---

## Quote the CSV. Do not quote the beauty photographs as meters.

All analytical figures come from the Mesa llvmpipe float buffer. Residual RMS is evaluated in RGB against the current frame $S_t$ within a defined, static-pixel ghost ROI:

$$\mathrm{RMS} = \sqrt{ \frac{1}{3n} \sum_{p\in\mathrm{ROI}} \lVert C(p)-S_t(p)\rVert_2^2 }.$$

The science ROI spans $n=11737$ pixels; the loft ROI spans $n=8748$ pixels. Streak lengths are evaluated using $\varepsilon=1/64$ along a mid-stick scanline. Out-of-bounds coordinates discard history as expected, but depth-fail rejection is intentionally **not applied** on the ghosting heroes.

Science field, frame 51, $\vert{}v\vert{}=8.275$ px/frame, Neutral $e=1.00$:

| tag | $\alpha$ | clamp | residual RMS | streak px |
| --- | --- | --- | --- | --- |
| hero naive | 0.10 | off | **0.26056** | 338 |
| hero clamp | 0.10 | on | **0.00000** | 0 |
| $\alpha=0.05$ | 0.05 | off | 0.36297 | **455** |
| $\alpha=0.10$ | 0.10 | off | 0.26056 | **338** |
| $\alpha=0.20$ | 0.20 | off | 0.15594 | **160** |
| $\alpha=0.50$ | 0.50 | off | 0.04780 | **45** |
| speed $v\approx 2$ | 0.10 | off | 0.10091 | **82** |
| speed $v\approx 16$ | 0.10 | off | 0.35187 | **499** |

Analytical streak values $v\cdot\log\varepsilon/\log(1-\alpha)$ at $\vert{}v\vert{}=8.275$: **671.0 / 326.6 / 154.2 / 49.7** for $\alpha=0.05/0.10/0.20/0.50$.

Loft still, frame 27, $\vert{}v\vert{}=9.971$ px/frame, Neutral $e=1.05$, $\alpha=0.10$:

| tag | clamp | residual RMS | $n$ |
| --- | --- | --- | --- |
| loft naive | off | **0.20216** | 8748 |
| loft clamp | on | **0.02162** | 8748 |

The reference figures summarized in the lead paragraph are: science RMS **0.26056 / 0.00000**; loft RMS **0.20216 / 0.02162**; streak lengths **455 / 338 / 160 / 45**; velocities $\vert{}v\vert{}\approx\mathbf{8.28}$ / $\mathbf{9.97}$. Do **not** attempt to reconstruct residual values or streak lengths from the loft hero, the loft 3-up, or the amber theorem plates. Those images are strictly `photo-only`.

The science clamp RMS reading of **0.00000** occurs because the field is uniform: the evaluated ROI sits 8 pixels away from the moving occluder, meaning the $3\times 3$ kernel samples only the solid background wall. It does not mean visibility has been solved. On the complex, textured geometry of the loft edge, that exact same clamping rule still leaves an RMS of **0.02162**.

---

## Failures / controls

Four individual controls are examined, each backed by an isolated plate rather than adjusted simultaneously on the hero shot.

### History policy (the 3-up)

Seen in the loft 3-up and science 3-up. A single input frame is resolved under three separate policies to show that ghosting is a property of the history policy, not the current shaded frame. The clamped render represents the named control, not an idealized cinematic ground truth; some aliasing and temporal lag necessarily remain where historical data is aggressively bounded.

### Clamp on/off

![Instrument. |naive−clamp| heat. Where the 3×3 RGB minmax spent budget. Same St.](/assets/journal/taa-ghosting/08_clamp_residual.jpg)

The clamp-residual heat map alongside the science disocclusion and loft crop views. On the flat test field, clamp residual inside the inset ROI evaluates to **0.00000** because $\Omega$ contains only uniform amber wall pixels. On the loft scene, the residual registers at **0.02162** because the $3\times 3$ neighborhood spans mullions, dark wood, reflective glaze, and the window backdrop. Any stale color falling within that dynamic range is retained. Core takeaway: *clamp is not a visibility solve.*

### \(\alpha\) ladder

![Naive α=0.05 / 0.10 / 0.20 / 0.50, same motion, no clamp. Streak 455 / 338 / 160 / 45 px. Photograph only.](/assets/journal/taa-ghosting/06_alpha_ladder.jpg)

Evaluated under naive EMA without clamping under constant velocity. The streak contracts systematically as $\alpha$ increases: **455 $\to$ 338 $\to$ 160 $\to$ 45** px. Higher $\alpha$ values prioritize current-frame data and minimize ghosting, but they forfeit the alias-reduction benefits of temporal accumulation. The fingerprint plot maps these identical values in graphical form.

### Motion speed

![α=0.10 fixed, v≈2 / 8 / 16 px/frame, naive vs clamp. Ghost grows with v. Photograph only.](/assets/journal/taa-ghosting/07_speed_ladder.jpg)

Holding $\alpha=0.10$ constant across speeds of $v\approx 2/8/16$ px/frame, comparing naive EMA directly against the clamped resolve. Naive streak lengths scale up to **82 / 338 / 499** px. While the blending math remains unchanged, higher velocities stretch the smear proportionally. The clamped panels remain completely stable on the uniform background field.

### Thin-stick lag

![Thin-stick 3-up. Left: current coverage, a 2–3 px rod. Middle: history comet. Right: clamp eats the comet because the neighborhood is field color. Coverage + history, not wrong MV. Photograph only.](/assets/journal/taa-ghosting/03_stick_3up.jpg)

Left: current frame coverage capturing a 2–3 px wide rod. Middle: the resulting historical comet tail. Right: clamping eliminates the trail entirely because the surrounding neighborhood consists purely of background field samples. Caption: coverage + history, not wrong MV.

### The bet (not the hero)

![The bet, not the hero. Static camera, Halton 2,3 jitter. Left: current checker is aliased. Right: EMA at α=0.10. This is the noise/alias reduction you bought the ghost with.](/assets/journal/taa-ghosting/09_accumulate.jpg)

Rendered with a stationary camera and Halton $2,3$ subpixel jitter. On the left, the single-frame checkerboard exhibits heavy aliasing. On the right, EMA filtering at $\alpha=0.10$ demonstrates the anti-aliasing and noise suppression bought at the expense of ghosting. Caption on the plate: *this is the bet; the ghost plates are the cost.*

---

## Two paths, do not mix the instruments

| path | frames | instrument |
| --- | --- | --- |
| **Science photograph** | theorem, science 3-up, stick, $\alpha$ ladder, speed ladder, accumulate bet | Lambert field on this llvmpipe, CPU history ping-pong, Neutral $e=1.00$. HUD `photo-only`. |
| **Science instrument** | disocclusion heat, clamp residual, fingerprint | residual heat, streak vs $\alpha$. |
| **Loft photograph** | hero, loft 3-up | Split-sum loft (IBL tables reused, not re-derived), camera truck, Neutral $e=1.05$. HUD `photo-only`. |
| **Loft crop / heat** | loud crop | nearest crop of naive beauty + $\lvert\mathrm{naive}-S_t\rvert$ heat. RMS from CSV. |
| **Display** | every plate | expose $e$ $\to$ Neutral $\to$ sRGB OETF. Resolve is linear. Operator is inherited. |

The 3-up panels provide both photographic demonstrations of the control and the core teaching material. Rely on the CSV for all RMS and streak measurements; never attempt to quote the 8-bit display panel as 0.26056.

---

## Honesty gaps

1. **Output PNGs represent a single selected frame from an offline sequence of length $N$, not a photographic capture of 60 Hz display persistence.** The science test sequence runs for $N=52$ frames after history initialization; the loft sequence runs for $N=28$. No refresh-rate claims are made.
2. **This is not physical motion blur.** The mechanism is history reuse, distinct from shutter integration. Subpixel jitter is locked to $0$ on all ghost heroes and is enabled only for the Halton accumulation test.
3. **$\alpha$ denotes the current-frame blending weight.** The accumulation equation is strictly $C = \alpha S + (1-\alpha)\hat{H}$. Do not invert this relationship.
4. **Neighborhood clamping is not a solution for visibility.** The science ROI clamp RMS evaluates to **0.00000** solely because the region is placed on a flat, uniform background. On the textured loft scene, the same operation leaves an RMS of **0.02162**. High-contrast disocclusion boundaries continue to leak stale history color.
5. **Velocities are derived analytically via camera matrices (loft scene, science walls) or rigid previous-frame translations (science pillar/stick).** The pipeline does not employ screen-space velocity buffers, skinned motion vectors, or optical flow estimation. The sky uses a planar proxy at 400 units. Specular highlights on brass are view-dependent and are not reprojected.
6. **Thin-stick persistence stems from coverage and history accumulation, not incorrect motion vectors.** Subpixel coverage is binary because MSAA is disabled. The overall stick AABB spans roughly 16 pixels, but the geometry occupies only a 2–3 px rod on any given scanline.
7. **Depth rejection is a secondary fail-safe.** Tuned to $\tau=0.25$ world-$z$, it is deliberately left **off** on ghosting heroes so the full smear can be inspected without masking disocclusion artifacts.
8. **TAA fundamentally trades aliasing/noise reduction against lag and ghosting.** The clamped resolve illustrates a specific bounding method, not an absolute visual ideal.
9. **Low-$\alpha$ streak measurements ($\alpha=0.05$) are truncated by the sequence length of $N=52$.** The analytical model assumes an unbounded sequence (**671** theoretical vs. **455** measured). Always refer directly to the CSV.
10. **The loft camera truck is intentionally fast.** At $\vert{}v\vert{}\approx 9.97$ px/frame, the naive comet artifact is exaggerated so it remains distinct across the entire frame, unlike a gentle cinematic dolly shot.
11. **IBL and tone-mapping models are carried over from earlier notes, not re-evaluated here.** Neutral tone-mapping parameters are not re-fit. Contact shadows use a simple planar cosine approximation, and the environment relies on a synthetic procedural loft HDR rather than a physical EXR capture.
12. **This implementation is baseline TAA.** It does not use DLSS, FSR, XeSS, 9-tap Catmull-Rom sampling, YCoCg `clipToAABB` variance bounding, or specialized hardware blocks.
13. **Rendered PNGs are 8-bit display-referred images.** Do not perform Fourier analysis or energy-conservation integrals on the JPEG files; residual RMS and streak values are valid only within the linear floating-point buffer.

---

## Mesa / llvmpipe — what this run can claim

| item | value |
| --- | --- |
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| FBO color | **RGBA32F** complete, $1280\times 720$ |
| `GL_FRAMEBUFFER_SRGB` | disabled (Neutral + sRGB OETF on CPU) |
| MSAA | disabled |
| History | CPU ping-pong RGBA32F, bilinear color, nearest $z$ |
| Mix | $C=\alpha S+(1-\alpha)\hat{H}$, $\alpha=$ current-frame weight |
| Clamp | $3\times 3$ RGB minmax of current $S_t$ |
| Science | $N=52$, $v=8.275$ px/frame, Neutral $e=1.00$, jitter $0$ |
| Loft | $N=28$, $v=9.971$ px/frame, Neutral $e=1.05$, jitter $0$ |
| Depth-reject $\tau$ | 0.25 world-$z$, instrument only, **off** on heroes |
| Tail $\varepsilon$ | $1/64$ |

What this setup verifies: under this specific OSMesa / llvmpipe build, an offline sequence evaluated across $N$ frames with known rigid object translations (science field) or known camera matrix deltas (loft scene), resolving an EMA pass with $\alpha$ as current-frame weight alongside a $3\times 3$ RGB minmax clamp, produces the plates shown. Residual RMS within the ghost ROI and spatial streak lengths vary consistently with the CSV data as $\alpha$, velocity $v$, and clamping state are adjusted.

What it cannot claim: equivalence to hardware TAA hardware, 60 Hz display persistence, production-ready motion vectors, an outright fix for ghosting via clamping, DLSS-tier temporal reconstruction, or any performance characteristics concerning discrete GPUs, hardware thread occupancy, or memory bandwidth.

---

## Assertions

Validation status: **42 pass / 0 fail**.

| check | result |
| --- | --- |
| Mix unit: $\alpha=0.10$, $S=1$, $H=0$ $\Rightarrow$ $C=0.10$ | PASS |
| FBO is RGBA32F | PASS |
| Required gallery plates exist and are non-empty | PASS |
| No NaNs in resolve | PASS |
| Science pillar / stick coverage and $3 < v < 16$ px/frame | PASS **8.275** |
| Naive ROI RMS $>$ clamp $\times 1.8$ and $>0.02$ | PASS **0.26056 vs 0.00000** |
| Streak monotone in $\alpha$: $0.05\ge 0.10>0.20>0.50$ | PASS **455 / 338 / 160 / 45** |
| Speed monotone: $v_{16}>v_8>v_2$ streak | PASS **499 / 338 / 82** |
| Loft naive RMS $>$ clamp RMS and $>0.008$ | PASS **0.20216 vs 0.02162** |
| Loft $v>3$ px/frame | PASS **9.971** |

Assertion tolerances were strictly maintained without relaxation for the photographic plates.

---

## Out of scope

Comparative evaluation of production TAA pipelines (e.g. SMAA+TAA+sharpen, or engine-specific stacks in Unreal, Unity, or Godot). Deep learning reconstruction models (DLSS, FSR, XeSS). Comprehensive motion-vector generation (screen-space velocity buffers, skinned geometry vectors, displacement motion vectors, or optical flow). Path-traced spatiotemporal denoisers (SVGF, ReSTIR spatio-temporal passes, OIDN). Nine-tap Catmull-Rom history sampling, YCoCg variance clipping via `clipToAABB` as a default baseline, or velocity-weighted blending heuristics. Halton or R2 subpixel jitter on ghost-demonstration heroes. High-frequency specular handling, Toksvig normal filtering, anisotropic GGX models, or sRGB vs. linear texture decode comparisons. Re-testing alternative tone-mapping operators (clip, Reinhard, ACES, Neutral ladders)—Neutral remains the static display operator inherited from prior notes. Shadow-map bias tuning. Dedicated hardware TAA pipelines, 60 Hz display refresh characteristics, GPU thread occupancy, and bandwidth profiling. Theoretical derivations of Karis filtering, split-sum DFG approximations, or the Khronos Neutral curve (consult earlier entries for derivations).

---

## Resolve lock

```text
H     = bilinear(history, u_prev)     // nearest z
Hhat  = clamp ? minmax3x3_rgb(S, H) : H
C     = alpha * S + (1 - alpha) * Hhat
PNG   = sRGB_OETF( Neutral(e * C) )

```

Locked parameters: $\alpha$ indicates current-frame weight; the default hero uses $\alpha=0.10$; clamping is strictly defined as the $3\times 3$ RGB minmax over $S_t$; subpixel jitter is $0$ on ghosting hero plates. Use the loft camera truck for presentation. Use the loft 3-up plate for instructional comparison. Use the fingerprint plot to isolate the coverage artifact. Use the synthetic amber field as the governing theorem. The blending math dictates the visual output: temporal history is an educated bet, and ghosting is the tax paid when that bet fails.
