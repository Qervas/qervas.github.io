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

The last note owned reuse across frames as an exponential bet: EMA plus a \(3\times 3\) RGB minmax clamp. The leftover at textured edges was named there — *clamp is not a visibility solve.* Depth-reject was the cousin bit, \(\tau=0.25\) world-\(z\), **off** on those ghost heroes. This note owns that cousin. **Color clamp asks whether history is chromatically plausible. Depth reject asks whether it is the same surface.** On a metro pillar edge those answers diverge.

It is not a second EMA lecture. History weight is a frozen accept \(w_0\), or zero. No jitter sequence. No \(\alpha\) ladder. No YCoCg.

![Underground metro platform colonnade: square concrete pillars, tubular railing, tiled floor, yellow safety line, far track void. Current color after a camera truck in +X. Khronos PBR Neutral e=1.00. Photograph only — no residual RMS.](/assets/journal/reprojection-depth-discontinuities/00_hero.jpg)

A new photographic family: underground metro platform colonnade, not the loft still. Square concrete pillars, a thin tubular railing, large-format tiled floor with grout, a yellow safety line, far track void, recessed coffers. Static world. Camera trucks in \(+X\) with look-at offset locked (pure translation). HUD: `CURRENT COLOR  METRO COLONNADE`, `STATIC WORLD  CAMERA TRUCK +X`, `PHOTO-ONLY`. Do not hang a residual RMS on this photograph.

![Teaching pin. Identical current color and current depth. Left: no temporal. Middle: reproject + RGB 3×3 clamp, no depth test — wrong-surface history that still sits in the box. Right: reproject + τ depth reject — that sample is killed. Wedge crops under each column. Photograph only.](/assets/journal/reprojection-depth-discontinuities/10_3up.jpg)

**Pin this.** Identical current color and current depth. Only history policy differs. Left **A no temporal**. Middle **B reproject + RGB \(3\times 3\) clamp**, no depth test — wrong-surface history that still sits in the box. Right **C reproject + \(\tau\) depth reject** — that sample is killed. Caption on the plate: *B keeps wrong-surface history in the 3×3 box. C zeros \(w\) on \(d>\tau\).* If the full-frame columns look close from across the room, the crop is the compare. Photo only.

Hero, Mesa 25.0.7 llvmpipe, linear Rec.709, **Khronos PBR Neutral** after resolve, \(e=\mathbf{1.00}\): \(\tau=\mathbf{0.020}\), truck \(\approx\mathbf{14.51}\) px/frame at the named pillar, reject frac \(\approx\mathbf{0.0249}\). Depth-edge ROI residual RMS: A **0** / B **0.140465** / C **0.053736** (\(n=128952\)). \(w_0=0.90\). Dilate off. Static-camera reject **0**. Mix \(C=w\,H+(1-w)\,S\). Assertions **37 pass / 0 fail**.

---

## What you are seeing

One scene. One warp from previous/current view-projection and current linearized view-Z. Three history policies on the **identical** current buffers. Display is inherited: resolve in linear, then Khronos PBR Neutral, then IEC 61966-2-1 sRGB OETF. The curve still does not create lighting. Reprojection still does not create samples that were never shaded.

**Presentation hook.** Current color, designated frame 8 of an offline \(N=9\) strip. Pillars march across the bay; the railing crosses in front of two or three of them; tiles recede into the track void. Photo only.

**Teaching pin.** A \| B \| C on the same \(S_t\), plus a nearest wedge crop of the named-pillar disocclusion slab under each column.

![Loud failure, clamp path. Same current frame as A and C. Honest VP warp, in-domain ⇒ w=w0, then RGB 3×3 minmax of current St. No depth test. A history texel from the pillar body can sit inside that color box after the truck reveals floor or void. Photograph only.](/assets/journal/reprojection-depth-discontinuities/08_clamp_only.jpg)

**Loud failure, clamp path.** Same current frame as A and C. Honest VP warp, in-domain \(\Rightarrow w=w_0\), then RGB \(3\times 3\) minmax of current \(S_t\). No depth test. A history texel from the pillar body can sit inside that color box after the truck reveals floor or void. Clamp keeps it. Wrong-surface smear. Photo only.

![Unique artifact. Beauty dimmed; HOT = d>τ (wrong-surface history); BLUE = reprojected UV out of domain. Named-pillar crop inset. τ=0.020, reject frac 0.025, relative d test. Geometric fingerprint the clamp plate cannot draw.](/assets/journal/reprojection-depth-discontinuities/05_fail_mask.jpg)

**Unique artifact (pin this with the 3-up).** Beauty dimmed; **HOT** = \(d>\tau\) (wrong-surface history); **BLUE** = reprojected UV out of domain. Named-pillar crop inset. HUD: \(\tau=0.020\), reject frac \(0.025\), relative \(d\) test. This is the geometric fingerprint the clamp plate cannot draw.

![Depth-reject path. Same warp as B. w=0 on d>τ or OOB; current shading stands alone on a rejected pixel. Photograph only.](/assets/journal/reprojection-depth-discontinuities/09_depth_reject.jpg)

**Depth-reject path.** Same warp as B. \(w=0\) on \(d>\tau\) or OOB; current shading stands alone on a rejected pixel. Photo only.

Two facts, never mixed:

1. **Beauty plates** (hero, 3-up, clamp-only, depth-reject) are GL-rendered current + resolve, Neutral after resolve, sRGB OETF. HUD `photo-only` means do not invent a residual or a reject fraction from the JPEG.
2. **Instruments** (fail mask, history weight, ROI overlay, residual heat) are the float buffer: linearized view-Z, fail mask, history weight, ROI residual RMS, reject fraction. Quote the metrics.

---

## Two questions, one warp

The TAA note already showed why a neighborhood AABB still leaks at a textured edge: the \(3\times 3\) spans occluder and newly revealed surface, so stale color is still in range. That leftover was **0.02162** on the loft ghost ROI. This note does not rerun that loft. It asks the correspondence question the AABB cannot ask.

**Clamp (path B).** Is this history *color* plausible among current neighbors?

**Depth reject (path C).** Is this history *sample* the same surface?

On a metro pillar or railing edge the current \(3\times 3\) is mixed: concrete, grout, painted steel, dark track void. After the camera trucks, a history texel from the pillar body can land inside that box on a pixel whose current surface is newly revealed floor or void. Chromatically legal. Geometrically wrong. Clamp keeps it. Relative-depth reject does not consult the box.

The warp is shared. Previous and current view-projection are stored per frame. History UV is reconstructed from current depth. If the matrices or the depth are wrong, the test is invalid — there is no learned flow to paper over that.

---

## Why: VP warp, then relative \(d\)

Working space is **linear Rec.709**. History is RGBA32F. Blend in linear. Display is a named step after resolve, not baked into \(H\). All depths below are **view-linear** (positive, MRT), not window-Z.

### Backward reprojection

History UV from the current pixel and current depth. Clip-space warp; do not reconstruct world position as a product claim.

\[
\mathbf{x}_{t}^{\mathrm{clip}}
=
P_{t}\,V_{t}\,
\pi^{-1}(u,v,z_{t}),
\qquad
\mathbf{x}_{t-1}^{\mathrm{clip}}
=
P_{t-1}\,V_{t-1}\,
V_{t}^{-1}\,P_{t}^{-1}\,
\mathbf{x}_{t}^{\mathrm{clip}}
\]

\[
(u',v',z_{\mathrm{exp}})
=
\pi(\mathbf{x}_{t-1}^{\mathrm{clip}}).
\]

Off-screen \((u',v')\) is an automatic reject. History color is bilinear at \((u',v')\). History depth is **point-sampled**. Implied velocity, instrument only: \(\mathbf{v}=(u,v)-(u',v')\). No separate MV buffer. Not optical flow.

### Expected previous-view Z versus fetched history Z

After the truck, \(z_t\) and the previous camera’s view-Z are not the same coordinate. Reconstruct the current view-space point, transform it into the previous view, and compare the **expected** previous-view Z to the point-sampled previous depth.

\[
\mathbf{X}_{t}=\pi^{-1}(u,v,z_{t}),
\qquad
\mathbf{X}_{t-1}=V_{t-1}\,V_{t}^{-1}\,\mathbf{X}_{t},
\qquad
z_{\mathrm{exp}}=(\mathbf{X}_{t-1})_{z}
\]

\[
z_{\mathrm{hist}}=\text{point-sample linearized view-Z}_{t-1}(u',v').
\]

Comparing \(z_{\mathrm{hist}}\) to current-camera \(z_t\) is a **translation bug**. It is not done. On a lateral truck it would still light the wrong pixels; on a boom it would light the whole floor.

### Named relative-depth discontinuity

\[
d
=
\frac{\lvert z_{\mathrm{hist}}-z_{\mathrm{exp}}\rvert}
{\max(\lvert z_{\mathrm{exp}}\rvert,\,z_{\varepsilon})},
\qquad
\text{reject if }d>\tau\text{ or }(u',v')\text{ out of domain.}
\]

Locked: \(\tau=\mathbf{0.020}\), \(z_{\varepsilon}=\mathbf{0.050}\,\mathrm{m}\). \(\tau\) is a published constant, not a buried epsilon. The TAA cousin bit compared \(\lvert z_t-z_{t-1}\rvert\) in world-\(z\). That is not this predicate.

### History weight (hard cut, not an EMA)

\[
w
=
\begin{cases}
0 & \text{if reject or }(u',v')\text{ out of domain}\\
w_{0} & \text{otherwise}
\end{cases}
\qquad
C=w\,C_{\mathrm{hist}}+(1-w)\,C_{\mathrm{curr}}.
\]

\(w\) is **history weight**. Frozen \(w_0=\mathbf{0.90}\). Do not invert it against the TAA note’s \(\alpha\) (that \(\alpha\) was current-frame weight). Do not re-derive an accumulation curve. Asserted unit: \(H=1\), \(S=0\), \(w_0=0.90\) \(\Rightarrow\) \(C=0.90\).

Optional mask dilate (1 px on the **binary reject mask**, not a min-filter on the depth fetch) is a control. This run: **off**.

### Color clamp (the failure control, not the product)

Path B ignores \(d\). Force \(w=w_0\) whenever \((u',v')\) is in domain. Replace history with

\[
C_{\mathrm{hist}}^{\ast}
=
\mathrm{clamp}\!\bigl(
C_{\mathrm{hist}},\;
\min_{\mathcal{N}_{3\times 3}}C_{\mathrm{curr}},\;
\max_{\mathcal{N}_{3\times 3}}C_{\mathrm{curr}}
\bigr)
\]

in linear RGB. Not YCoCg. Not variance clip. Neighborhood is current-frame color only. This is the policy that keeps a plausible wrong-surface sample.

Path C does **not** clamp. The thesis is the depth cut, not a third AABB.

### Display (inherited, not re-derived)

\[
L_{\mathrm{display}}
=
\mathrm{TM}\bigl(\mathrm{expose}(C)\bigr)
\quad\text{then sRGB OETF for PNG.}
\]

TM is **Khronos PBR Neutral**, \(e=1.00\) on this metro plate. `GL_FRAMEBUFFER_SRGB` is off; encode is CPU. Measurement is the float buffer, not the PNG.

---

## Unique artifact: fail mask on the pillar silhouette

The fail mask is the thing this note exists to draw. HOT traces the pillar limbs and the railing against the track void — the set where fetched history Z is not the expected previous-view Z of the current sample. BLUE is the left-edge OOB slab from the truck. The named-pillar inset is the same wedge the 3-up crops.

The 3-up is the policy compare on that same slab. A is current. B keeps the sample the AABB still likes. C zeros \(w\) where the mask is hot.

![Instrument. C-path history weight, false-color 0…1. Accept is w0; reject / OOB is 0. Agrees with the fail mask on the rejected set (fail ⇒ w=0).](/assets/journal/reprojection-depth-discontinuities/06_history_weight.jpg)

History weight is the same rejected set as a weight: fail \(\Rightarrow w=0\), asserted. Accept is \(w_0\); reject / OOB is \(0\).

Lag of a 1–2 px railing is **coverage + correspondence**, not “the velocity was wrong.” Subpixel coverage is binary (no MSAA). A sample that does not survive \(S_t\) can still live in \(H\) if the warp lands on the rail’s previous body and the color box includes steel.

Quote the metrics, not the JPEG.

---

## Quote the metrics. Do not quote the beauty photographs as meters.

Float buffer, Mesa llvmpipe. Residual RMS is RGB vs current \(S_t\) inside the painted depth-edge ROI (CPU morph gradient, 6 px dilate, \(n=128952\)):

\[
\mathrm{RMS}
=
\sqrt{
\frac{1}{3n}
\sum_{p\in\mathrm{ROI}}
\lVert C(p)-S_t(p)\rVert_2^2
}.
\]

Designated frame **8**. \(N=9\). Frame 0 has no history and is not scored. Truck measured at named pillar index **4**, bbox \((414,206)\)–\((505,608)\).

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

Hero rounding used in the lede: \(\tau=\mathbf{0.020}\); truck \(\approx\mathbf{14.51}\) px/frame; reject frac \(\approx\mathbf{0.0249}\); ROI RMS **0 / 0.140465 / 0.053736**; **37 pass / 0 fail**. Do **not** invent a residual or a reject fraction from the hero, the 3-up, or the clamp plate. Those frames are `photo-only`.

RMS_A is identically 0 because A **is** \(S_t\). RMS_C \(<\) RMS_B is the pass: the silhouette slab is zeroed, not “C looks better.” C still mixes \(w_0\) history on accepted same-surface pixels (bilinear fetch, grout lag on a translating plane). That leftover is why RMS_C is **0.053736**, not 0. Clamp is not a visibility solve; depth-reject is not a denoiser.

The \(\tau\) sweep is monotone as asserted and **tight**: **0.0250 / 0.0249 / 0.0246**. Most of the geometric jump at pillar / void exceeds even \(\tau=0.08\); OOB is \(\approx 0.0107\) of the 0.0249 and does not move with \(\tau\). This is not a \(\tau\)-sensitivity study. The lock is \(0.02\) after the sweep showed B still ghosts and C does not reject the entire frame.

---

## Failures / controls

A, B, and C share bit-identical current color and current depth. Only the history policy changes. Do not retune the clamp to hide B.

### History policy (the 3-up)

The 3-up plus the clamp-only and depth-reject plates. One current frame, three resolves. Ghost here is **wrong-surface correspondence**, not an EMA tail. Full-frame B vs C is quieter than the TAA naive comet — expected: frozen one-frame \(w_0\), no \((1-\alpha)^N\) streak. The smear lives in the disocclusion wedge. Trust the crop, the fail mask, and the RMS.

| Path | Warp | History policy | Silhouette |
|---|---|---|---|
| A no temporal | none | \(w=0\) | Aliased current. Reference. RMS **0**. |
| B clamp-only | honest VP | in-domain \(\Rightarrow w=w_0\), RGB \(3\times 3\) clamp | Wrong-surface ghost. RMS **0.140465**. |
| C depth-reject | same warp | \(d>\tau\) or OOB \(\Rightarrow w=0\) | Fail mask lights that wedge. RMS **0.053736**. |

### Clamp on/off is not the thesis

![Instrument. |C−St| residual heat, clamp-only path. HUD quotes ROI RMS 0.1405. The number is the float buffer, not the JPEG.](/assets/journal/reprojection-depth-discontinuities/12_residual_B.jpg)

![Instrument. |C−St| residual heat, depth-reject path. HUD quotes ROI RMS 0.0537. Silhouette slab is punched; accepted same-surface pixels still mix w0 bilinear history.](/assets/journal/reprojection-depth-discontinuities/13_residual_C.jpg)

Path B is the **controlled failure**. Path C does not also clamp. A plate that “fixes” B by shrinking the AABB is a different experiment. Residual heat is \(\lvert C-S_t\rvert\) on the float buffer. HUD quotes ROI RMS **0.1405** (B) and **0.0537** (C). The number is the metrics table, not the JPEG.

### \(\tau\) (locked, not a hero ladder)

Default **0.020** after \(\{0.005,\,0.02,\,0.08\}\). Reject frac **0.025028 / 0.024903 / 0.024638**. Monotone, tight. Full-frame reject at the lock sits in \((0.02,\,0.35)\): **0.0249**. Outside that band, \(\tau\) or speed is wrong — retune the truck, do not narrate.

### Truck speed

Pillars cross \(\approx\mathbf{14.51}\) px/frame (target 8–16). Mean in-domain \(\lvert v_x\rvert=\mathbf{15.02}\), \(\lvert v_y\rvert=\mathbf{0.066}\) — y-convention check: \(\lvert v_y\rvert\ll\lvert v_x\rvert\). If B does not ghost, raise speed. Do not “improve” the clamp.

### Static camera

Reject fraction **0**. B and C would be identical. A static frame that still rejects means the VP y-convention or depth linearization is broken. This run is not that bug.

### Off-screen UV

OOB contributes **0.010707** of the reject fraction and forces \(w=0\). Visible as the blue slab on the fail mask and the dark left edge on the history-weight plate.

### Dilate

Reject-mask dilate **off**. ROI dilate is a different number: **6 px** on the morph-gradient mask used only to score RMS.

![Depth-edge ROI overlay. Pillars + railing + other depth silhouettes. CPU 3×3 morphological gradient of current view-Z, then a published 6 px dilate. Not dFdx. Residual RMS is this set only.](/assets/journal/reprojection-depth-discontinuities/11_roi.jpg)

Do not min-filter the depth fetch. Residual RMS is this painted set only (\(n=128952\)).

---

## Two paths, do not mix the instruments

| path | frames | instrument |
|---|---|---|
| **Photograph** | hero, 3-up, clamp-only, depth-reject | GLSL 330 metro on this llvmpipe, CPU history fetch, Neutral \(e=1.00\). HUD `photo-only`. |
| **Instrument** | fail mask, history weight, ROI overlay, residual heat | view-Z, fail mask, \(w\), ROI residual. |
| **Display** | every plate | expose \(e=1.00\) \(\to\) Neutral \(\to\) sRGB OETF. Resolve is linear. Operator is inherited. |

The 3-up is a photograph of the control *and* the source of the teaching. Quote the metrics for RMS and reject fraction. Do not quote the 8-bit panel as 0.140465.

---

## Honesty gaps

1. **A selected frame of an offline \(N=9\) strip, not a 60 Hz persistence photograph.** Metrics start at frame 1. Designated frame is 8. No display refresh claim.
2. **Warp is previous/current view-projection + current linearized view-Z.** Not a rasterized MV buffer, not skinned MV, not optical flow.
3. **\(z_{\mathrm{hist}}\) is compared to \(z_{\mathrm{exp}}\), not to current-camera \(z_t\).** Comparing to \(z_t\) is a translation bug.
4. **Clamp is not a visibility solve.** Path B keeps wrong-surface history when that color sits inside the current \(3\times 3\) RGB box (grout / edge mix).
5. **Depth-reject is a hard cut at published \(\tau\), not a production TAA stack.** No jitter, no variance clip, no responsive stencil, no EMA ladder. \(w_0\) is frozen.
6. **History color is bilinear** (\(`u'*W-0.5`\)). Named blur source. Not a 9-tap filter, not Catmull-Rom. History depth is point-sampled (\(`floor(u'*W)`\)).
7. **NDC y versus texture v.** OSMesa FBO and `glReadPixels` share a bottom-left origin; PNG write flips rows. History UV uses that buffer space. If this convention is wrong the fail mask lights the whole frame — mean \(\lvert v_y\rvert\ll\lvert v_x\rvert\) is the check.
8. **Depth visual is 32-bit float** (`DEPTH_COMPONENT32F`, queried bits = 32). Predicate compares stored linear view-Z (MRT), not window-Z. A 16-bit depth visual would invent false rejects.
9. **`dFdx` / `dFdy` are not used.** Depth-edge ROI is a CPU \(3\times 3\) morphological gradient of current view-Z. llvmpipe derivatives are coarse and often zero on 1-px features.
10. **MSAA off.** Silhouettes are aliased; ROI radius absorbs a 1-px jag. Thin-rail lag is coverage + correspondence.
11. **\(\tau\) sweep is monotone and tight.** **0.0250 / 0.0249 / 0.0246**. The pillar/void jump is large compared with \(\tau\in\{0.005,0.02,0.08\}\).
12. **RMS_C is not zero.** Accepted same-surface pixels still mix \(w_0\) bilinear history. Grout on a translating plane lags. Depth-reject punches the wrong-surface set; it does not freeze the tiles.
13. **Truck is set so B still ghosts** (\(\approx 14.51\) px/frame). Not a product-still dolly.
14. **Not the loft family.** Neutral is inherited; no TM bake-off. No IBL / split-sum as a theorem here.
15. **Not DLSS / FSR / XeSS, not a hardware TAA unit, not bit-exact GPU validation.**
16. **PNG is 8-bit display-referred.** Do not FFT or energy-integrate the JPEG. Residual RMS and reject fraction are linear-buffer meters.

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

**Can claim:** on this OSMesa / llvmpipe build, an offline \(N\)-frame truck of a static metro colonnade, with history UV from prev/curr VP and current view-Z, a frozen accept weight \(w_0\), RGB \(3\times 3\) clamp (B) versus relative-depth reject at published \(\tau\) (C), produces these photographs. ROI residual RMS and reject fraction move as the metrics say.

**Cannot claim:** a production TAA stack, 60 Hz persistence, vendor upsamplers, that clamp “fixes” disocclusion, or that a PNG of a selected frame is a persistence photograph. Discrete-GPU metrics, occupancy, bandwidth, or “this is how the hardware works.”

---

## Assertions

This run: **37 pass / 0 fail**.

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

No assert tolerances were loosened for the photoreal plates.

---

## Out of scope

Full production TAA bakeoff (jitter sequences, variance clip, YCoCg, responsive stencils, TSR). DLSS, FSR, XeSS, or any vendor temporal upsampler. Optical flow as the warp (Farneback, RAFT, DIS, or learned residual MVs). Path-traced denoiser hero (OIDN, NRD, SVGF). Rasterized object motion vectors, skinning previous palettes, particles, transparency. Shadow-map bias (different predicate: rasterization-light, not correspondence). VR compositor ASW / late-stage reprojection. EMA ladder re-derivation; accumulation curves as a study — cite the TAA note. IBL / split-sum / TM Neutral bake-off; loft lighting family. Crowds, trains, glass, water, emissive advertising. Interactive viewer, vsync, GUI. Claiming GPU bit-exact parity with a vendor driver.

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

Locked: \(w\) is history weight; \(w_0=0.90\); \(\tau=0.020\); clamp is RGB \(3\times 3\) minmax of \(S_t\) on path B only; dilate off; jitter none. Pin the metro truck as the presentation. Pin the 3-up as the teaching. Pin the fail mask as the fingerprint. The predicate is the caption. Clamp asks if history looks legal. Depth reject asks if it is the same surface.
