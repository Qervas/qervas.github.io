---
title: "Reprojection and Depth Discontinuities"
description: "Color clamp asks chromatic plausibility; depth reject asks same-surface. Metro colonnade ROI RMS 0 / 0.140465 / 0.053736; reject ≈0.0249 at τ=0.020. Same VP warp — A/B/C on identical current buffers."
date: 2026-09-17
tags:
  - graphics
  - engine
  - temporal
math: true
cover: /assets/journal/reprojection-depth-discontinuities/00_hero.jpg
---

Our previous note treated frame reuse as an exponential bet: an EMA paired with a \(3\times 3\) RGB minmax clamp. We identified the leftover ghosting at textured edges then—*a color clamp is not a visibility solve*. Depth-rejection was the related control, disabled for those hero shots and evaluated at \(\tau=0.25\) in world-\(z\). This note focuses entirely on that depth test. **A color clamp asks whether historical data is chromatically plausible, while a depth reject asks whether it represents the same surface.** Along the edge of a metro pillar, those two answers completely diverge.

This is not another lecture on EMA. History weight is locked as a frozen accept \(w_0\), or strictly zero. We exclude jitter sequences, \(\alpha\) ladders, and YCoCg spaces from this evaluation.

![Underground metro platform colonnade: square concrete pillars, tubular railing, tiled floor, yellow safety line, far track void. Current color after a camera truck in +X. Khronos PBR Neutral e=1.00. Photograph only — no residual RMS.](/assets/journal/reprojection-depth-discontinuities/00_hero.jpg)

We introduce a new photographic family: an underground metro platform colonnade to replace the loft scene. The environment features square concrete pillars, a thin tubular railing, a large-format tiled floor with visible grout, a yellow safety line, a distant track void, and recessed ceiling coffers. The world geometry is fully static. The camera trucks exclusively in the \(+X\) direction with a locked look-at offset to enforce pure translation. The HUD overlay reads `CURRENT COLOR  METRO COLONNADE`, `STATIC WORLD  CAMERA TRUCK +X`, and `PHOTO-ONLY`. Because this is only a photograph, do not attach a residual RMS to it.

![Teaching pin. Identical current color and current depth. Left: no temporal. Middle: reproject + RGB 3×3 clamp, no depth test — wrong-surface history that still sits in the box. Right: reproject + τ depth reject — that sample is killed. Wedge crops under each column. Photograph only.](/assets/journal/reprojection-depth-discontinuities/10_3up.jpg)

**Pin this as the core reference.** The current color and current depth buffers are perfectly identical; only the applied history policy changes. The left column (**A**) employs no temporal filtering. The middle column (**B**) applies reprojection alongside an RGB \(3\times 3\) clamp without a depth test, allowing wrong-surface history to survive as long as it fits inside the local color box. The right column (**C**) utilizes reprojection paired with a \(\tau\) depth reject, successfully killing the invalid sample. The caption notes: *B keeps wrong-surface history in the 3×3 box. C zeros \(w\) on \(d>\tau\).* If the full frames look similar from across the room, the wedge crops beneath each column highlight the disparity. This remains a photo-only plate.

Testing executed on Mesa 25.0.7 llvmpipe operating in linear Rec.709, outputting via **Khronos PBR Neutral** tone mapping after the resolve at \(e=\mathbf{1.00}\). We lock \(\tau=\mathbf{0.020}\). The camera trucks at \(\approx\mathbf{14.51}\) px/frame at the named pillar, generating a rejection fraction of \(\approx\mathbf{0.0249}\). The depth-edge Region of Interest (ROI) residual RMS values hit **0** for A, **0.140465** for B, and **0.053736** for C (\(n=128952\)). The frozen acceptance weight is \(w_0=0.90\). Mask dilation is disabled, leaving static-camera rejection at **0**. We define the mix as \(C=w\,H+(1-w)\,S\). The suite confirms **37 pass / 0 fail** on all assertions.

---

## What you are seeing

The setup captures a single scene using one warp built from the previous and current view-projection matrices alongside the current linearized view-Z. We evaluate three distinct history policies on **identical** current buffers. The display pipeline is fully inherited: the engine resolves in linear space, passes through Khronos PBR Neutral, and applies the IEC 61966-2-1 sRGB OETF. A tone curve cannot synthesize lighting, and reprojection cannot synthesize samples that were never shaded to begin with.

**Presentation hook.** We showcase current color at designated frame 8, extracted from an offline \(N=9\) strip. The framing shows pillars marching across the bay, the railing crossing in front of multiple pillars, and floor tiles receding into the track void. This visual is for photographic reference only.

**Teaching pin.** The comparison pits A, B, and C against the same \(S_t\) buffer. Below each full frame is a nearest-neighbor wedge crop isolating the disocclusion slab at the named pillar.

![Loud failure, clamp path. Same current frame as A and C. Honest VP warp, in-domain ⇒ w=w0, then RGB 3×3 minmax of current St. No depth test. A history texel from the pillar body can sit inside that color box after the truck reveals floor or void. Photograph only.](/assets/journal/reprojection-depth-discontinuities/08_clamp_only.jpg)

**Loud failure, clamp path.** This uses the exact same current frame as paths A and C, applying an honest view-projection warp. If the sample falls in-domain, it assigns \(w=w_0\) and executes an RGB \(3\times 3\) minmax clamp against the current \(S_t\) without checking depth. Once the camera truck reveals the floor or track void, a history texel from the pillar body can easily land inside that new color box. Because the clamp accepts it, a wrong-surface smear persists. Photograph only.

![Unique artifact. Beauty dimmed; HOT = d>τ (wrong-surface history); BLUE = reprojected UV out of domain. Named-pillar crop inset. τ=0.020, reject frac 0.025, relative d test. Geometric fingerprint the clamp plate cannot draw.](/assets/journal/reprojection-depth-discontinuities/05_fail_mask.jpg)

**Unique artifact (pin this with the 3-up).** The beauty pass is dimmed to highlight tracking data. **HOT** regions indicate \(d>\tau\), representing wrong-surface history. **BLUE** regions denote areas where the reprojected UV fell out of domain. We include a crop inset of the named pillar. The HUD reads \(\tau=0.020\) with a reject fraction of \(0.025\) based on a relative \(d\) test. This produces a distinct geometric fingerprint that the color clamp plate is fundamentally incapable of drawing.

![Depth-reject path. Same warp as B. w=0 on d>τ or OOB; current shading stands alone on a rejected pixel. Photograph only.](/assets/journal/reprojection-depth-discontinuities/09_depth_reject.jpg)

**Depth-reject path.** This path relies on the exact same warp as path B. It strictly sets \(w=0\) if \(d>\tau\) or if the sample is Out of Bounds (OOB). On any rejected pixel, the current shading stands entirely alone. Photograph only.

These visuals rely on two facts that must never be mixed:

1. **Beauty plates** (including the hero, 3-up, clamp-only, and depth-reject images) display GL-rendered current buffers plus the resolve, Neutral mapping, and sRGB OETF. The `photo-only` HUD tag mandates that you do not invent a residual or a reject fraction directly from the JPEG.
2. **Instruments** (such as the fail mask, history weight, ROI overlay, and residual heat) visualize the actual float buffers. These maps measure linearized view-Z, the fail mask, history weight, ROI residual RMS, and reject fractions. Only quote the metrics for these evaluations.

---

## Two questions, one warp

Our previous Temporal Anti-Aliasing (TAA) note already demonstrated why a neighborhood Axis-Aligned Bounding Box (AABB) continues to leak at textured edges. Because a \(3\times 3\) window spans both an occluder and a newly revealed surface, stale color remains safely in range. That specific artifact left a **0.02162** residual on the loft ghost ROI. We are not rerunning that loft scene here; instead, we address the correspondence question that an AABB is blind to.

**Clamp (path B).** Is this history *color* plausible among the current neighbors?

**Depth reject (path C).** Is this history *sample* genuinely the same geometric surface?

On a metro pillar or a thin railing edge, the current \(3\times 3\) neighborhood is highly mixed, capturing concrete, grout, painted steel, and the dark track void. When the camera trucks laterally, a history texel originally on the pillar body can fall into a box belonging to newly revealed floor or void. This makes it chromatically legal but geometrically incorrect. The clamp blindly preserves it, whereas a relative-depth reject ignores the color box entirely.

The warp is shared across paths. We store the previous and current view-projection matrices per frame, reconstructing history UV directly from current depth. If those matrices or the depth buffer contain errors, the test is fundamentally invalid—there is no learned flow to paper over that.

---

## Why: VP warp, then relative \(d\)

The internal working space is **linear Rec.709**, with history tracked in RGBA32F. We blend entirely in linear space. The display transform is applied as a named step after the resolve, ensuring it is not baked into \(H\). All depths referenced below are **view-linear** (positive, MRT), rather than window-Z.

### Backward reprojection

History UV is calculated using the current pixel and the current depth. This relies on a clip-space warp; do not reconstruct world positions as a product claim.

\[\mathbf{x}_{t}^{\mathrm{clip}} = P_{t}\,V_{t}\, \pi^{-1}(u,v,z_{t}), \qquad \mathbf{x}_{t-1}^{\mathrm{clip}} = P_{t-1}\,V_{t-1}\, V_{t}^{-1}\,P_{t}^{-1}\, \mathbf{x}_{t}^{\mathrm{clip}}\]

\[(u',v',z_{\mathrm{exp}}) = \pi(\mathbf{x}_{t-1}^{\mathrm{clip}}).\]

Any off-screen \((u',v')\) coordinate constitutes an automatic reject. We fetch history color bilinearly at \((u',v')\), but history depth must be **point-sampled**. For instrumentation only, we measure implied velocity as \(\mathbf{v}=(u,v)-(u',v')\). We do not run a separate MV buffer or rely on optical flow.

### Expected previous-view Z versus fetched history Z

Once the camera moves, \(z_t\) and the previous camera's view-Z no longer represent the same coordinate space. We must reconstruct the current view-space point, transform it into the previous view, and compare the **expected** previous-view Z against the point-sampled history depth.

\[\mathbf{X}_{t}=\pi^{-1}(u,v,z_{t}), \qquad \mathbf{X}_{t-1}=V_{t-1}\,V_{t}^{-1}\,\mathbf{X}_{t}, \qquad z_{\mathrm{exp}}=(\mathbf{X}_{t-1})_{z}\]

\[z_{\mathrm{hist}}=\text{point-sample linearized view-Z}_{t-1}(u',v').\]

Comparing \(z_{\mathrm{hist}}\) directly to the current-camera \(z_t\) is a **translation bug**. Implementing that would falsely illuminate wrong pixels during a lateral truck, and light the entire floor during a boom move.

### Named relative-depth discontinuity

\[ d = \frac{\lvert z_{\mathrm{hist}}-z_{\mathrm{exp}}\rvert} {\max(\lvert z_{\mathrm{exp}}\rvert,\,z_{\varepsilon})}, \qquad \text{reject if }d>\tau\text{ or }(u',v')\text{ out of domain.} \]

We lock \(\tau=\mathbf{0.020}\) and \(z_{\varepsilon}=\mathbf{0.050}\,\mathrm{m}\). Here, \(\tau\) acts as a published threshold constant, not a hidden epsilon. The previous TAA test evaluated \(\lvert z_t-z_{t-1}\rvert\) in world-\(z\), which is a completely different predicate.

### History weight (hard cut, not an EMA)

\[ w = \begin{cases} 0 & \text{if reject or }(u',v')\text{ out of domain}\\ w_{0} & \text{otherwise} \end{cases} \qquad C=w\,C_{\mathrm{hist}}+(1-w)\,C_{\mathrm{curr}}. \]

The variable \(w\) represents the **history weight**. We employ a frozen \(w_0=\mathbf{0.90}\). Do not conflate this with the TAA note’s \(\alpha\), which controlled current-frame weight. Avoid re-deriving an accumulation curve from it. The asserted unit proves that if \(H=1\), \(S=0\), and \(w_0=0.90\), the output cleanly calculates to \(C=0.90\).

An optional mask dilate (acting strictly as a 1 px expansion on the **binary reject mask**, rather than a min-filter applied to the depth fetch) is available as a control. In this specific run, it is toggled **off**.

### Color clamp (the failure control, not the product)

Path B entirely ignores \(d\). It forces \(w=w_0\) as long as \((u',v')\) remains in domain, then replaces history with:

\[C_{\mathrm{hist}}^{\ast} = \mathrm{clamp}\!\bigl( C_{\mathrm{hist}},\; \min_{\mathcal{N}_{3\times 3}}C_{\mathrm{curr}},\; \max_{\mathcal{N}_{3\times 3}}C_{\mathrm{curr}} \bigr)\]

This evaluates in linear RGB, avoiding YCoCg and variance clipping. The bounding neighborhood relies solely on current-frame color. This policy inevitably preserves a plausible but physically incorrect wrong-surface sample.

Path C fundamentally does **not** clamp. The defining thesis is the strict depth cut, not a secondary AABB.

### Display (inherited, not re-derived)

\[L_{\mathrm{display}} = \mathrm{TM}\bigl(\mathrm{expose}(C)\bigr) \quad\text{then sRGB OETF for PNG.}\]

The active Tone Mapper (TM) is **Khronos PBR Neutral**, evaluated at \(e=1.00\) for this specific metro plate. `GL_FRAMEBUFFER_SRGB` remains off; encoding executes on the CPU. All measurements rely on the float buffer rather than the final PNG.

---

## Unique artifact: fail mask on the pillar silhouette

This note exists primarily to draw the fail mask. HOT pixels accurately trace the pillar limbs and the railing where they intersect the dark track void—these identify the specific set where the fetched history Z contradicts the expected previous-view Z of the current sample. BLUE pixels mark the out-of-bounds left-edge slab generated by the camera truck. The inset cropping the named pillar perfectly matches the wedge examined in the 3-up layout.

The 3-up effectively compares policies across that exact slab. Path A represents current geometry. Path B illegally keeps the sample because the AABB accepts it. Path C properly zeros out \(w\) anywhere the mask is hot.

![Instrument. C-path history weight, false-color 0…1. Accept is w0; reject / OOB is 0. Agrees with the fail mask on the rejected set (fail ⇒ w=0).](/assets/journal/reprojection-depth-discontinuities/06_history_weight.jpg)

The history weight aligns exactly with the rejected set as a mapped weight: a failure guarantees \(w=0\) as asserted. Accepted pixels sit at \(w_0\), while rejects or OOB boundaries sit at \(0\).

Lag observed behind a 1–2 px railing stems from a combination of **coverage and correspondence**, not from inaccurate velocity tracking. Subpixel coverage operates purely in binary space without MSAA. A geometric sample that fails to resolve in current \(S_t\) can persist in \(H\) if the warp inadvertently lands on the railing's previous coordinates while the color box happens to include steel.

Quote the float metrics, not the JPEG.

---

## Quote the metrics. Do not quote the beauty photographs as meters.

All figures derive from the Mesa llvmpipe float buffer. Residual RMS calculates the RGB disparity against the current \(S_t\) uniquely inside the painted depth-edge ROI. We construct this using a CPU morph gradient and a 6 px dilate, evaluating \(n=128952\) pixels:

\[\mathrm{RMS} = \sqrt{ \frac{1}{3n} \sum_{p\in\mathrm{ROI}} \lVert C(p)-S_t(p)\rVert_2^2 }.\]

We evaluate designated frame **8** from the total \(N=9\). Frame 0 inherently lacks history and goes unscored. The truck velocity targets named pillar index **4**, bound roughly by \((414,206)\)–\((505,608)\).

| item | value |
|---|---|
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

Hero rounding is utilized in the introduction: \(\tau=\mathbf{0.020}\); truck speed is \(\approx\mathbf{14.51}\) px/frame; reject fraction is \(\approx\mathbf{0.0249}\); ROI RMS hits **0 / 0.140465 / 0.053736**; yielding **37 pass / 0 fail**. Do **not** invent a residual or a reject fraction from the hero, the 3-up, or the clamp plates. Those specific frames strictly maintain a `photo-only` status.

RMS_A naturally equals 0 because pass A **is** the unaltered \(S_t\). The test validates RMS_C \(<\) RMS_B precisely because the silhouette slab properly zeros out, rather than due to subjective claims that "C looks better". Path C fundamentally still mixes a \(w_0\) history on accepted, same-surface pixels (producing bilinear fetch lag on the grout lines translating across a plane). This ongoing mix is exactly why RMS_C settles at **0.053736**, rather than absolute zero. Clamp algorithms do not resolve visibility, and depth-rejection algorithms do not act as denoisers.

The \(\tau\) sweep behaves monotonically as asserted and remains exceptionally **tight**: registering **0.0250 / 0.0249 / 0.0246**. The physical geometric jump located at the pillar-to-void edge is so massive it exceeds even \(\tau=0.08\). Furthermore, OOB accesses account for \(\approx 0.0107\) of the total 0.0249 fraction and do not scale with \(\tau\). This explicitly is not a \(\tau\)-sensitivity study. We enforce a firm lock at \(0.02\) after observing that path B ghosts effectively while path C correctly avoids rejecting the entire frame.

---

## Failures / controls

Paths A, B, and C rely on bit-identical current color and depth buffers. The isolated history policy is the only variable. Do not attempt to dynamically retune the clamp parameters to artificially hide B's failure.

### History policy (the 3-up)

This evaluates the 3-up composition alongside the clamp-only and depth-reject visuals. We process one current frame through three distinct resolves. The isolated ghosting is entirely driven by **wrong-surface correspondence**, not an extended EMA tail. A full-frame evaluation of B vs C produces a quieter result than a naive TAA comet trail. This is completely expected due to enforcing a frozen, one-frame \(w_0\) without a trailing \((1-\alpha)^N\) sequence. The artifact lives natively inside the disocclusion wedge. Trust the crop, the fail mask, and the precise RMS metrics.

| Path | Warp | History policy | Silhouette |
|---|---|---|---|
| A no temporal | none | \(w=0\) | Aliased current. Reference. RMS **0**. |
| B clamp-only | honest VP | in-domain \(\Rightarrow w=w_0\), RGB \(3\times 3\) clamp | Wrong-surface ghost. RMS **0.140465**. |
| C depth-reject | same warp | \(d>\tau\) or OOB \(\Rightarrow w=0\) | Fail mask lights that wedge. RMS **0.053736**. |

### Clamp on/off is not the thesis

![Instrument. |C−St| residual heat, clamp-only path. HUD quotes ROI RMS 0.1405. The number is the float buffer, not the JPEG.](/assets/journal/reprojection-depth-discontinuities/12_residual_B.jpg)

![Instrument. |C−St| residual heat, depth-reject path. HUD quotes ROI RMS 0.0537. Silhouette slab is punched; accepted same-surface pixels still mix w0 bilinear history.](/assets/journal/reprojection-depth-discontinuities/13_residual_C.jpg)

Path B functions explicitly as the **controlled failure**. Path C inherently does not apply a clamp. An experiment that "fixes" B simply by shrinking the AABB boundaries constitutes an entirely different evaluation. The residual heat visualization maps \(\lvert C-S_t\rvert\) directly from the float buffer. The active HUD quotes an ROI RMS of **0.1405** for B and **0.0537** for C. This specific number originates from the metrics table, not the JPEG.

### \(\tau\) (locked, not a hero ladder)

The threshold is firmly set to **0.020** after evaluating the set \(\{0.005,\,0.02,\,0.08\}\). The resulting reject fractions sit at **0.025028 / 0.024903 / 0.024638**. This produces a sequence that is rigorously monotone and tight. Under the locked threshold, full-frame rejection cleanly sits within the \((0.02,\,0.35)\) band, resting at **0.0249**. If the output falls outside that defined band, either the \(\tau\) value or the truck speed is broken—retune the truck speed rather than tweaking the written narrative.

### Truck speed

The pillars transit across the screen at \(\approx\mathbf{14.51}\) px/frame (targeting an 8–16 range). Mean in-domain velocity resolves to \(\lvert v_x\rvert=\mathbf{15.02}\) and \(\lvert v_y\rvert=\mathbf{0.066}\). This successfully validates the required y-convention check where \(\lvert v_y\rvert\ll\lvert v_x\rvert\). If path B fails to produce ghosting, simply raise the translation speed. Do not attempt to falsely "improve" the clamp function.

### Static camera

Under purely static conditions, the reject fraction hits absolute **0**. Path B and path C would render identical frames. If a static frame somehow registers a reject, it exposes a broken VP y-convention or flawed depth linearization. This specific run does not suffer from that bug.

### Off-screen UV

OOB mapping inherently contributes **0.010707** to the overall reject fraction, aggressively forcing \(w=0\). This is clearly visible as the blue slab marking the fail mask and as the darkened left edge visible on the history-weight plate.

### Dilate

The reject-mask dilate is forced **off**. The ROI dilate relies on a completely different metric of **6 px** applied against the morph-gradient mask, which functions strictly for scoring the RMS.

![Depth-edge ROI overlay. Pillars + railing + other depth silhouettes. CPU 3×3 morphological gradient of current view-Z, then a published 6 px dilate. Not dFdx. Residual RMS is this set only.](/assets/journal/reprojection-depth-discontinuities/11_roi.jpg)

Do not attempt to min-filter the depth fetch. The residual RMS calculations apply exclusively to this uniquely painted set (\(n=128952\)).

---

## Two paths, do not mix the instruments

| path | frames | instrument |
|---|---|---|
| **Photograph** | hero, 3-up, clamp-only, depth-reject | GLSL 330 metro on this llvmpipe, CPU history fetch, Neutral \(e=1.00\). HUD `photo-only`. |
| **Instrument** | fail mask, history weight, ROI overlay, residual heat | view-Z, fail mask, \(w\), ROI residual. |
| **Display** | every plate | expose \(e=1.00\) \(\to\) Neutral \(\to\) sRGB OETF. Resolve is linear. Operator is inherited. |

The 3-up layout fundamentally acts as a photograph of the control while doubling as the primary source of teaching. When referencing data, exclusively quote the metrics tied to RMS and the reject fraction. Do not erroneously quote an 8-bit panel output as possessing a 0.140465 value.

---

## Honesty gaps

1. **A selected frame of an offline \(N=9\) strip, not a 60 Hz persistence photograph.** Metrics begin at frame 1, designating frame 8 for visual review. No real-time display refresh claims are made.
2. **Warp is previous/current view-projection + current linearized view-Z.** It inherently avoids rasterized motion vectors, skinned motion vectors, and optical flow.
3. **\(z_{\mathrm{hist}}\) is compared to \(z_{\mathrm{exp}}\), not to current-camera \(z_t\).** Comparing it to \(z_t\) guarantees a devastating translation bug.
4. **Clamp is not a visibility solve.** Path B actively preserves wrong-surface history whenever that historical color value falls securely inside the current \(3\times 3\) RGB box (such as in a grout / edge mix).
5. **Depth-reject is a hard cut at published \(\tau\), not a production TAA stack.** It omits jitter, variance clipping, responsive stencils, and EMA ladders entirely. The acceptance weight \(w_0\) remains tightly frozen.
6. **History color is bilinear** (\(`u'*W-0.5`\)). This serves as a named blur source. It strictly avoids 9-tap filtering and Catmull-Rom filtering. History depth evaluates strictly point-sampled (\(`floor(u'*W)`\)).
7. **NDC y versus texture v.** OSMesa FBO and `glReadPixels` inherently share a bottom-left origin, while PNG encoding flips the rows. History UV calculations rely on that specific buffer layout. If this convention was accidentally inverted, the fail mask would flood the entire screen—which is why checking that mean \(\lvert v_y\rvert\ll\lvert v_x\rvert\) is mandatory.
8. **Depth visual is 32-bit float** (`DEPTH_COMPONENT32F`, queried bits = 32). The underlying predicate evaluates directly against stored linear view-Z via MRT, ignoring window-Z. Deploying a 16-bit depth visual would immediately introduce severe false rejects.
9. **`dFdx` / `dFdy` are not used.** The depth-edge ROI generates from a CPU \(3\times 3\) morphological gradient calculating against current view-Z. The internal llvmpipe derivatives prove far too coarse and frequently return zero against 1-px features.
10. **MSAA off.** All geometric silhouettes render natively aliased. The ROI radius explicitly absorbs a 1-px jag. The visual lag along the thin rail exists as a combination of subpixel coverage limits and correspondence matching.
11. **\(\tau\) sweep is monotone and tight.** Values rest firmly at **0.0250 / 0.0249 / 0.0246**. The massive pillar-to-void jump is mathematically huge compared to our tested \(\tau\in\{0.005,0.02,0.08\}\) set.
12. **RMS_C is not zero.** Even on correctly accepted same-surface pixels, the algorithm mixes \(w_0\) bilinear history. Grout shifting across a translating plane inevitably lags. While depth-reject punches out the wrong-surface elements, it cannot fully freeze the translating tiles.
13. **Truck is set so B still ghosts** (\(\approx 14.51\) px/frame). This rejects the overly slow panning typical of a product-still dolly.
14. **Not the loft family.** We purely inherit the Neutral curve without conducting a Tone Map (TM) bake-off. No IBL or split-sum models act as supporting theorems.
15. **Not DLSS / FSR / XeSS, not a hardware TAA unit, not bit-exact GPU validation.**
16. **PNG is 8-bit display-referred.** Do not execute an FFT or attempt to energy-integrate the output JPEG. Residual RMS and the reject fraction are designed strictly as linear-buffer meters.

---

## Mesa / llvmpipe — what this run can claim

| item | value |
|---|---|
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| OSMesa | core 3.3 request; driver reports the string above |
| FBO color | **RGBA32F** complete, \(1280\times 720\), MRT color+meta |
| Depth visual | **DEPTH_COMPONENT32F**, queried bits = **32** |
| `GL_FRAMEBUFFER_SRGB` | disabled (Neutral + sRGB OETF on CPU) |
| MSAA | disabled |
| History color | bilinear (`u'*W-0.5`) |
| History depth | point-sampled (`floor(u'*W)`) |
| Mix | \(C=w\,H+(1-w)\,S\), frozen \(w_0=0.90\) |
| Clamp | \(3\times 3\) RGB minmax of current \(S_t\) (path B only) |
| Depth test | relative \(d=\lvert z_{\mathrm{hist}}-z_{\mathrm{exp}}\rvert/\max(\lvert z_{\mathrm{exp}}\rvert,z_{\varepsilon})\), path C |
| Neutral \(e\) | **1.00** |
| \(N\) / designated frame | **9** / **8** |

**Can claim:** On this specific OSMesa / llvmpipe build running an offline \(N\)-frame lateral truck against a static metro colonnade, utilizing history UV derived from previous/current VP and current view-Z, a frozen accept weight \(w_0\) paired with a relative-depth reject at published \(\tau\) (C) successfully avoids the visible artifacting generated by an RGB \(3\times 3\) clamp (B). The ROI residual RMS and internal reject fractions track exactly as the metrics predict.

**Cannot claim:** We explicitly do not claim to offer a production TAA stack, nor do we achieve 60 Hz persistence or match vendor upsamplers. We reject the premise that a clamp can "fix" disocclusion, and we caution against treating a PNG frame grab as a true persistence photograph. We avoid making assertions regarding discrete-GPU metrics, stream occupancy, memory bandwidth, or broad hardware operational truths.

---

## Assertions

This specific test suite concludes exactly at: **37 pass / 0 fail**.

| check | result |
|---|---|
| Mix unit: \(w_0=0.90\), \(H=1\), \(S=0\) \(\Rightarrow\) \(C=0.90\) | PASS |
| FBO is RGBA32F; depth bits \(\ge 24\) | PASS **32** |
| Required gallery plates exist and are non-empty | PASS |
| Pillars and rails in the mesh | PASS |
| No NaNs in resolve | PASS |
| ROI \(n>200\) | PASS **128952** |
| RMS_C \(<\) RMS_B | PASS **0.053736 \(<\) 0.140465** |
| RMS_A \(\approx 0\) | PASS **0** |
| RMS_B \(>0.002\) (B actually ghosts) | PASS **0.140465** |
| Reject frac in \((0.02,\,0.35)\) | PASS **0.0249** |
| \(\tau\) sweep monotone \(0.005\ge 0.02\ge 0.08\) | PASS **0.0250 / 0.0249 / 0.0246** |
| Static-camera reject \(<0.01\) | PASS **0** |
| Truck in \((6,\,20)\) px/frame | PASS **14.51** |
| \(\lvert v_y\rvert\ll\lvert v_x\rvert\) | PASS **0.066 vs 15.02** |
| Fail \(\Rightarrow w=0\) | PASS |
| Named pillar bbox non-empty; fail count \(>80\) | PASS |

Absolutely no assertion tolerances were loosened to artificially accommodate the photoreal plates.

---

## Out of scope

This post ignores full production TAA bakeoffs covering jitter sequences, variance clipping, YCoCg space transforms, responsive stencils, or TSR functionality. We exclude vendor-specific temporal upsamplers such as DLSS, FSR, and XeSS. We omit optical flow algorithms serving as the warp—meaning Farneback, RAFT, DIS, or any learned residual MVs are off the table. Path-traced denoiser tests implementing OIDN, NRD, or SVGF fall out of bounds. We completely bypass rasterized object motion vectors, skinned previous palettes, particles, and transparency. Shadow-map bias relies on rasterization-light metrics rather than correspondence matching, removing it from our predicate. We bypass VR compositor ASW and any late-stage reprojection routines. Do not attempt to re-derive EMA ladders or accumulation curves from this data—please cite the dedicated TAA note for those. We leave out IBL, split-sum, and TM Neutral bake-offs, essentially walking away from the loft lighting setup. The test scene features no crowds, trains, glass, water, or emissive advertising. We ignore interactive viewers, vsync implementations, and GUI considerations. Ultimately, we refuse to claim bit-exact mathematical parity with vendor GPU drivers.

---

## Resolve lock

```text
(u', v', z_exp) = reproject(P_prev, V_prev, P_curr, V_curr, z_t)
H     = bilinear(history_color, u')     // point-sample history depth
d     = |z_hist - z_exp| / max(|z_exp|, z_eps)
w     = (oob || (C && d > tau)) ? 0 : w0
Hhat  = B ? minmax3x3_rgb(S, H) : H     // B only
C     = w * Hhat + (1 - w) * S
PNG   = sRGB_OETF( Neutral(e * C) )

```

Our resolve securely locks $w$ as the history weight parameter, with $w_0=0.90$ and $\tau=0.020$. The clamp function calculates purely as an RGB $3\times 3$ minmax against $S_t$ exclusively during path B execution. Both dilation and jitter remain disabled. Pin the metro truck visualization as the core presentation. Pin the 3-up as the primary instructional tool. Pin the generated fail mask as the true geometric fingerprint. The predicate essentially drives the caption. A color clamp solely evaluates if the retained history looks legal. A depth reject mathematically evaluates if that sample genuinely represents the exact same surface.
