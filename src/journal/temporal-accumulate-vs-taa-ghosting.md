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

The last note owned the display operator: one RGBA32F still, a named curve, then sRGB OETF. Time was out of scope there — *TAA, temporal accumulation, firefly-suppression as TM.* This note owns reuse **across** frames. History is linear Rec.709. Neutral still runs after resolve, not on the history buffer.

**TAA is a bet that last frame’s color is still this pixel. The ghost is the cost of the noise reduction.**

It is **not motion blur.** A shutter smears whatever crossed the pixel while it was open. History reuse paints a surface that has already left.

![Loft still after a camera truck: cream-glaze bottle, brass sphere, oak sideboard, factory mullions. Naive EMA, α=0.10 current-frame weight, clamp off, jitter 0. The bottle and sideboard leave a comet on the newly revealed window. Khronos PBR Neutral e=1.05. Photograph only — no residual RMS.](/assets/journal/taa-ghosting/14_real_hero.jpg)

The loft still the IBL and TM notes already earned, after a camera truck in \(+X\) with look-at locked. Naive EMA, \(\alpha=0.10\) current-frame weight, clamp off, jitter \(0\). The bottle and the sideboard leave a comet on the newly revealed window. HUD: `Khronos PBR Neutral  e=1.05`, `camera truck`, `photo-only - no metric`. Do not hang a residual RMS on this photograph.

![Teaching pin. Identical loft St. Left: no temporal. Middle: naive EMA — ghost loud. Right: EMA + 3×3 RGB minmax clamp — comet cut, residual the AABB still accepted. Photograph only.](/assets/journal/taa-ghosting/15_real_3up.jpg)

**Pin this.** Identical loft \(S_t\). Only history policy differs. Left **no temporal**. Middle **naive EMA** — ghost loud. Right **EMA + \(3\times 3\) RGB minmax clamp** — comet cut, residual the AABB still accepted. Caption on the plate: *identical current loft frame St — only history policy differs.* Photo only.

Hero, Mesa 25.0.7 llvmpipe, linear Rec.709 history, **Khronos PBR Neutral** after resolve: science field \(e=\mathbf{1.00}\), loft \(e=\mathbf{1.05}\). Ghost ROI residual RMS, science: naive **0.26056** vs clamp **0.00000** (\(n=11737\)). Loft: naive **0.20216** vs clamp **0.02162** (\(n=8748\)). Stick streak vs \(\alpha\) (naive, \(|v|\approx\mathbf{8.28}\) px/frame): **455 / 338 / 160 / 45** px at \(\alpha=0.05/0.10/0.20/0.50\). Loft \(|v|\approx\mathbf{9.97}\) px/frame. Mix \(C=\alpha S+(1-\alpha)\hat{H}\). Clamp \(=3\times 3\) RGB minmax. Assertions **42 pass / 0 fail**.

---

## What you are seeing

Two scenes. One mix. Display is inherited: resolve in linear, then Khronos PBR Neutral, then IEC 61966-2-1 sRGB OETF. The curve still does not create lighting. TAA still does not create samples that were never shaded.

**Presentation hook.** Camera truck, naive EMA, \(\alpha=0.10\), clamp off, jitter \(0\). Full frame plus inset crop of the bottle/sideboard/window edge. The truck is faster than a product-still dolly on purpose: \(|v|\) is set so the smear survives a full-frame glance. Photo only.

**Teaching pin (loft).** Same current frame three times. Left is \(S_t\). Middle is history without a neighborhood bound. Right is the named control.

![Loud loft crop. Left: naive beauty of the ghost edge. Right: |naive−St| linear-luma heat. Mullion stripes, sideboard top, bottle rim, brass limb. If the hero looked like motion blur from across the room, this crop is leftover history.](/assets/journal/taa-ghosting/16_real_crop.jpg)

**Loud loft crop.** Left naive beauty of the ghost edge. Right \(|\mathrm{naive}-S_t|\) linear-luma heat. Mullion stripes, sideboard top, bottle rim, brass limb. If the hero looked like motion blur from across the room, this crop is the proof it is leftover history.

![Theorem plate. Constructed amber field, dark pillar, thin cyan stick. Naive EMA, α=0.10, Neutral e=1.00, jitter 0. Static camera; pillar and stick translate in −X, the trail is +X. Photograph only.](/assets/journal/taa-ghosting/00_hero.jpg)

**Theorem plate.** Constructed amber field, dark pillar, thin cyan stick. Same mix, same \(\alpha\), jitter \(0\), Neutral \(e=1.00\). Static camera. Pillar and stick translate in \(-X\); the trail is \(+X\). The smear is a textbook exponential tail, not a product still.

![Science teaching pin. Identical St: no temporal | naive EMA | EMA + 3×3 RGB minmax. Uniform field, so the policy is the only variable. Photograph only.](/assets/journal/taa-ghosting/01_3up.jpg)

**Science teaching pin.** Identical \(S_t\): no temporal \| naive EMA \| EMA + \(3\times 3\) RGB minmax. Uniform field, so the policy is the only variable you can see.

![Science heat. Zoom of the revealed wall. Beauty | |naive−St| heat, ROI box drawn. Caption: clamp is not a visibility solve. RMS is the CSV, not the JPEG.](/assets/journal/taa-ghosting/02_disocclusion.jpg)

**Science heat.** Zoom of the revealed wall. Beauty \| \(|\mathrm{naive}-S_t|\) heat, ROI box drawn. Caption on the plate: *clamp is not a visibility solve.* RMS is the CSV, not the JPEG.

Two facts, never mixed:

1. **Beauty plates** (loft hero, loft 3-up, theorem, science 3-up, stick, \(\alpha\) ladder, speed ladder, accumulate bet) are GL-rendered current + resolve, Neutral after resolve, sRGB OETF. HUD `photo-only` means do not invent a residual or a streak length from the JPEG.
2. **Instruments** (loft crop heat, science disocclusion heat, clamp residual, fingerprint plot) are the float buffer: residual RMS, streak px, velocity, history weight. Quote the CSV.

---

## What TAA is (and is not: motion blur)

Motion blur is a shutter integral. A pixel that saw pillar then wall while the shutter was open is a blend of those radiances along **exposure time**. The smear is physical: the path of a surface, or of whatever crossed the pixel, during \(T_\mathrm{open}\).

TAA is not a shutter. There is no exposure interval in this resolve. The previous **resolved frame** is fetched at a reprojected location and mixed as if that color still belonged here. After a disocclusion, that color belongs to a surface that is gone. Mixing it in is a **ghost**, not a motion-blur kernel.

Jitter \(=0\) on every ghost hero. You cannot call those plates temporal *anti-aliasing*. They are temporal **accumulate**: exponential lag of a history sample. The only jitter plate is the accumulate bet — static camera, Halton \(2,3\), current vs EMA. That is the bet (alias \(\downarrow\)). The loft truck and the amber theorem are the cost.

\(\alpha\) is **current-frame weight** \(\in(0,1]\). High \(\alpha\) trusts now. Low \(\alpha\) keeps history and ghosts. Do not invert it.

---

## Why: EMA, reprojection, minmax clamp

Working space is **linear Rec.709**. History is RGBA32F. Blend in linear. Display is a named step after resolve, not baked into \(H\).

### Exponential accumulate

After reprojection and after clamp / reject:

\[
C_t(\mathbf{u})
=
\alpha\, S_t(\mathbf{u})
+
(1-\alpha)\,\hat{H}_{t-1}(\mathbf{u}_\mathrm{prev}).
\]

- \(S_t\) — current shaded sample, linear RGB.
- \(\hat{H}\) — history after clamp / reject (or raw \(H\) when clamp is off).
- Default hero: \(\alpha=0.10\).

Locked mix: \(C = \alpha S + (1-\alpha)\hat{H}\). Asserted: \(S=1\), \(H=0\), \(\alpha=0.10\) \(\Rightarrow\) \(C=0.10\).

### Steady-state tail (the plot, not a slogan)

A unit step that left the pixel decays as \((1-\alpha)^N\) after \(N\) frames. Visible-tail threshold \(\varepsilon=1/64\):

\[
N_\varepsilon
=
\frac{\log\varepsilon}{\log(1-\alpha)},
\qquad
L_\mathrm{px}
\approx
v\cdot N_\varepsilon
=
v\cdot\frac{\log\varepsilon}{\log(1-\alpha)}.
\]

\(v\) in px/frame. \(L_\mathrm{px}\) is streak length. Overlay this analytic curve on measured tail px. That is the fingerprint.

### Reprojection (honest path)

History fetch is bilinear color at \(\mathbf{u}_\mathrm{prev}\), nearest \(z\). Not Catmull-Rom. Not 9-tap sharpen.

**Science field.** Static camera. Wall and floor reproject by the camera matrix (identity). Moving meshes use previous world position. One rigid translation.

**Loft still.** Static geometry. Camera trucks in \(+X\), look-at locked at the IBL still point. Reprojection is

\[
\mathbf{p}_\mathrm{prev}^\mathrm{clip}
=
\mathbf{M}_\mathrm{prev}\,
\mathbf{p}_\mathrm{world},
\qquad
\mathbf{u}_\mathrm{prev}
=
\mathrm{ndc\_to\_uv}(\mathbf{p}_\mathrm{prev}),
\qquad
\mathbf{v}
=
\mathbf{u}-\mathbf{u}_\mathrm{prev}.
\]

\(\mathbf{v}\) is UV displacement from known matrices, **not** a hardware MV unit and not optical flow. Sky uses a 400-unit far proxy. View-dependent brass highlights are **not** reprojected (world-pos only); extra highlight smear is honest leftover, not a production MV claim.

### Neighborhood clamp (named control)

Lottes / Karis minmax, **RGB**, \(3\times 3\) current neighborhood \(\Omega\):

\[
\hat{H}
=
\mathrm{clamp}\!\bigl(
H(\mathbf{u}_\mathrm{prev}),\;
\min_{\Omega} S_t,\;
\max_{\Omega} S_t
\bigr).
\]

This is the control the 3-up names. Say **clamp**. Do not write “variance clip” on a minmax plate. Do not write Playdead `clipToAABB` / YCoCg as the default stack. Those exist; they are not this plate.

Clamp bounds history to the current neighborhood. It does **not** solve visibility. On a disocclusion edge the \(3\times 3\) AABB spans occluder and newly revealed surface, so stale color is still in range.

### Reject (cousin bit, off on heroes)

- Off-screen \(\mathbf{u}_\mathrm{prev}\) \(\rightarrow\) \(\hat{H}\) discarded, output \(S_t\).
- Depth: \(\lvert z_t(\mathbf{u})-z_{t-1}(\mathbf{u}_\mathrm{prev})\rvert > \tau\), \(\tau=0.25\) world-\(z\).

Depth-reject is **off** on ghost heroes so the smear stays loud. Off-screen still drops history.

### Display (inherited, not re-derived)

\[
L_{\mathrm{display}}
=
\mathrm{TM}\bigl(\mathrm{expose}(C)\bigr)
\quad\text{then sRGB OETF for PNG.}
\]

TM is **Khronos PBR Neutral**. Science field \(e=1.00\). Loft \(e=1.05\) (IBL / TM continuity). No clip / Reinhard / ACES ladder in this note. `GL_FRAMEBUFFER_SRGB` is off; encode is CPU. Measurement is the float buffer, not the PNG.

---

## Unique artifact: streak vs \(\alpha\)

![Unique artifact. Left: thin cyan stick under naive EMA at α=0.10 — a comet of coverage that already left. Right: measured streak px vs α∈{0.05, 0.10, 0.20, 0.50} plus the analytic v·log ε/log(1−α) curve. Coverage + history, not wrong MV. Quote the CSV.](/assets/journal/taa-ghosting/10_fingerprint.jpg)

This is the thing this note exists to draw. Left: thin cyan stick under naive EMA at \(\alpha=0.10\) — a comet of coverage that already left. Right: measured streak px vs \(\alpha\in\{0.05,0.10,0.20,0.50\}\) plus the analytic \(v\cdot\log\varepsilon/\log(1-\alpha)\) curve. HUD: \(v=8.28\) px/frame, \(\varepsilon=1/64\). Caption: *coverage + history, not wrong MV.*

Lag of a 1–2 px feature is **coverage + history**, not “the velocity was wrong.” The stick AABB is \(\sim 16\) px from perspective lean over the full height; a mid-wall scanline is a 2–3 px rod. Subpixel coverage is binary (no MSAA). A sample that does not survive \(S_t\) still lives in \(H\).

\(\alpha=0.05\) measured tail **455** px clips at finite \(N=52\) (analytic **671**, unbounded). \(\alpha=0.10\) tracks the curve: measured **338** vs analytic **326.6**. Quote the CSV, not the JPEG.

---

## Quote the CSV. Do not quote the beauty photographs as meters.

Float buffer, Mesa llvmpipe. Residual RMS is RGB vs current \(S_t\) in a painted ghost ROI (static pixels only):

\[
\mathrm{RMS}
=
\sqrt{
\frac{1}{3n}
\sum_{p\in\mathrm{ROI}}
\lVert C(p)-S_t(p)\rVert_2^2
}.
\]

Science ROI \(n=11737\). Loft ROI \(n=8748\). Streak uses \(\varepsilon=1/64\) on a mid-stick scanline. Off-screen still drops history; depth-fail is **not applied** on ghost heroes.

Science field, frame 51, \(|v|=8.275\) px/frame, Neutral \(e=1.00\):

| tag | \(\alpha\) | clamp | residual RMS | streak px |
|---|---|---|---|---|
| hero naive | 0.10 | off | **0.26056** | 338 |
| hero clamp | 0.10 | on | **0.00000** | 0 |
| \(\alpha=0.05\) | 0.05 | off | 0.36297 | **455** |
| \(\alpha=0.10\) | 0.10 | off | 0.26056 | **338** |
| \(\alpha=0.20\) | 0.20 | off | 0.15594 | **160** |
| \(\alpha=0.50\) | 0.50 | off | 0.04780 | **45** |
| speed \(v\approx 2\) | 0.10 | off | 0.10091 | **82** |
| speed \(v\approx 16\) | 0.10 | off | 0.35187 | **499** |

Analytic \(v\cdot\log\varepsilon/\log(1-\alpha)\) at \(|v|=8.275\): **671.0 / 326.6 / 154.2 / 49.7** for \(\alpha=0.05/0.10/0.20/0.50\).

Loft still, frame 27, \(|v|=9.971\) px/frame, Neutral \(e=1.05\), \(\alpha=0.10\):

| tag | clamp | residual RMS | \(n\) |
|---|---|---|---|
| loft naive | off | **0.20216** | 8748 |
| loft clamp | on | **0.02162** | 8748 |

Hero rounding used in the lede: science **0.26056 / 0.00000**; loft **0.20216 / 0.02162**; streak **455 / 338 / 160 / 45**; \(|v|\approx\mathbf{8.28}\) / \(\mathbf{9.97}\). Do **not** invent a residual or a streak from the loft hero, the loft 3-up, or the amber theorem. Those frames are `photo-only`.

Science clamp RMS **0.00000** is a uniform-field fact: the painted ROI sits 8 px off the occluder, so the \(3\times 3\) is wall-only. It is not a visibility solve. At a textured loft edge the same rule leaves **0.02162**.

---

## Failures / controls

Four knobs. Each earns a plate. Do not turn them all at once on the hero.

### History policy (the 3-up)

The loft 3-up and the science 3-up. One current frame, three resolves. Ghost is the history policy, not the current frame. The clamped plate is the named anti-ghost control, not “correct cinematography.” Some alias / lag trade remains where history was boxed.

### Clamp on/off

![Instrument. |naive−clamp| heat. Where the 3×3 RGB minmax spent budget. Same St.](/assets/journal/taa-ghosting/08_clamp_residual.jpg)

The clamp-residual heat plus the science disocclusion plus the loft crop. On the constructed field, clamp residual in the inset ROI is **0.00000** because \(\Omega\) is a flat amber wall. On the loft, clamp residual is **0.02162**: the \(3\times 3\) spans mullions, oak, glaze, window. Stale color that still sits inside that box survives. Caption to keep: *clamp is not a visibility solve.*

### \(\alpha\) ladder

![Naive α=0.05 / 0.10 / 0.20 / 0.50, same motion, no clamp. Streak 455 / 338 / 160 / 45 px. Photograph only.](/assets/journal/taa-ghosting/06_alpha_ladder.jpg)

Naive, no clamp, same motion. Streak shortens as \(\alpha\) rises: **455 \(\to\) 338 \(\to\) 160 \(\to\) 45** px. High \(\alpha\) trusts now and ghosts less; it also keeps less of the accumulate bet. The fingerprint is the same numbers as a plot.

### Motion speed

![α=0.10 fixed, v≈2 / 8 / 16 px/frame, naive vs clamp. Ghost grows with v. Photograph only.](/assets/journal/taa-ghosting/07_speed_ladder.jpg)

\(\alpha=0.10\) fixed, \(v\approx 2/8/16\) px/frame, naive vs clamp. Naive streak **82 / 338 / 499** px. Same mix, longer smear. Clamp columns stay tight on the uniform field.

### Thin-stick lag

![Thin-stick 3-up. Left: current coverage, a 2–3 px rod. Middle: history comet. Right: clamp eats the comet because the neighborhood is field color. Coverage + history, not wrong MV. Photograph only.](/assets/journal/taa-ghosting/03_stick_3up.jpg)

Left: current coverage, a 2–3 px rod. Middle: history comet. Right: clamp eats the comet because the neighborhood is field color. Caption: coverage + history, not wrong MV.

### The bet (not the hero)

![The bet, not the hero. Static camera, Halton 2,3 jitter. Left: current checker is aliased. Right: EMA at α=0.10. This is the noise/alias reduction you bought the ghost with.](/assets/journal/taa-ghosting/09_accumulate.jpg)

Static camera, Halton \(2,3\) jitter. Current checker is aliased. EMA at \(\alpha=0.10\) is the noise/alias reduction you bought the ghost with. Caption on the plate: *this is the bet; the ghost plates are the cost.*

---

## Two paths, do not mix the instruments

| path | frames | instrument |
|---|---|---|
| **Science photograph** | theorem, science 3-up, stick, \(\alpha\) ladder, speed ladder, accumulate bet | Lambert field on this llvmpipe, CPU history ping-pong, Neutral \(e=1.00\). HUD `photo-only`. |
| **Science instrument** | disocclusion heat, clamp residual, fingerprint | residual heat, streak vs \(\alpha\). |
| **Loft photograph** | hero, loft 3-up | Split-sum loft (IBL tables reused, not re-derived), camera truck, Neutral \(e=1.05\). HUD `photo-only`. |
| **Loft crop / heat** | loud crop | nearest crop of naive beauty + \(\lvert\mathrm{naive}-S_t\rvert\) heat. RMS from CSV. |
| **Display** | every plate | expose \(e\) \(\to\) Neutral \(\to\) sRGB OETF. Resolve is linear. Operator is inherited. |

The 3-ups are photographs of the control *and* the source of the teaching. Quote the CSV for RMS and streak. Do not quote the 8-bit panel as 0.26056.

---

## Honesty gaps

1. **PNG is a selected frame of an offline \(N\)-frame strip, not a 60 Hz persistence photograph.** Science \(N=52\) after history init. Loft \(N=28\). No display refresh claim.
2. **Not motion blur.** Shutter smear vs history reuse. Jitter \(0\) on ghost heroes; Halton only on the accumulate bet.
3. **\(\alpha\) is current-frame weight.** Mix \(C = \alpha S + (1-\alpha)\hat{H}\). Do not invert.
4. **Clamp is not a visibility solve.** Science ROI clamp RMS **0.00000** is a uniform-field inset. Loft clamp RMS **0.02162** is the textured leftover. High-contrast disocclusion still leaks at the silhouette.
5. **Velocity is camera-matrix (loft, science walls) or rigid previous-pos (science pillar/stick).** Not a production MV buffer, not skinned MV, not optical flow. Sky is a 400-unit far proxy. Brass highlights are view-dependent and not reprojected.
6. **Thin-stick lag is coverage + history, not wrong MV.** No MSAA. AABB \(\sim 16\) px; mid-wall rod 2–3 px.
7. **Depth reject is the cousin bit.** \(\tau=0.25\) world-\(z\), **off** on ghost heroes. Do not swallow the full reprojection / occlusion ticket.
8. **TAA trades noise/alias \(\downarrow\) against ghost/lag \(\uparrow\).** The clamped plate is the named control, not correct cinematography.
9. **Low-\(\alpha\) streak (\(\alpha=0.05\)) clips at finite \(N=52\).** Analytic overlay is unbounded (**671** vs measured **455**). Quote the CSV.
10. **Loft truck is exaggerated for visibility.** \(|v|\approx 9.97\) px/frame so the naive comet survives a full-frame glance. Not a product-still dolly.
11. **IBL / TM are reused, not proven here.** Neutral constants are not re-fit. Contact is planar cosine. Env is procedural loft HDR, not a captured EXR.
12. **Not DLSS / FSR / XeSS, not Catmull-Rom 9-tap, not YCoCg clipToAABB, not a hardware TAA unit.**
13. **PNG is 8-bit display-referred.** Do not FFT or energy-integrate the JPEG. Residual RMS and streak px are linear-buffer meters.

---

## Mesa / llvmpipe — what this run can claim

| item | value |
|---|---|
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| FBO color | **RGBA32F** complete, \(1280\times 720\) |
| `GL_FRAMEBUFFER_SRGB` | disabled (Neutral + sRGB OETF on CPU) |
| MSAA | disabled |
| History | CPU ping-pong RGBA32F, bilinear color, nearest \(z\) |
| Mix | \(C=\alpha S+(1-\alpha)\hat{H}\), \(\alpha=\) current-frame weight |
| Clamp | \(3\times 3\) RGB minmax of current \(S_t\) |
| Science | \(N=52\), \(v=8.275\) px/frame, Neutral \(e=1.00\), jitter \(0\) |
| Loft | \(N=28\), \(v=9.971\) px/frame, Neutral \(e=1.05\), jitter \(0\) |
| Depth-reject \(\tau\) | 0.25 world-\(z\), instrument only, **off** on heroes |
| Tail \(\varepsilon\) | \(1/64\) |

Can claim: on this OSMesa / llvmpipe build, an offline \(N\)-frame loop with known rigid-pillar previous-pos (science field) or known camera prev/curr matrices (loft still), EMA with named \(\alpha\) as current-frame weight, and a \(3\times 3\) RGB minmax clamp, produces these photographs. Residual RMS in the painted ghost ROI and streak length in px move as the CSV says when \(\alpha\), \(v\), and clamp on/off change.

Cannot claim: a hardware TAA unit, 60 Hz persistence, production motion vectors, that clamp “fixes ghosting,” that this is DLSS-class, or that a PNG of a selected frame is a persistence photograph. Discrete-GPU metrics, occupancy, bandwidth, or “this is how the hardware works.”

---

## Assertions

This run: **42 pass / 0 fail**.

| check | result |
|---|---|
| Mix unit: \(\alpha=0.10\), \(S=1\), \(H=0\) \(\Rightarrow\) \(C=0.10\) | PASS |
| FBO is RGBA32F | PASS |
| Required gallery plates exist and are non-empty | PASS |
| No NaNs in resolve | PASS |
| Science pillar / stick coverage and \(3 < v < 16\) px/frame | PASS **8.275** |
| Naive ROI RMS \(>\) clamp \(\times 1.8\) and \(>0.02\) | PASS **0.26056 vs 0.00000** |
| Streak monotone in \(\alpha\): \(0.05\ge 0.10>0.20>0.50\) | PASS **455 / 338 / 160 / 45** |
| Speed monotone: \(v_{16}>v_8>v_2\) streak | PASS **499 / 338 / 82** |
| Loft naive RMS \(>\) clamp RMS and \(>0.008\) | PASS **0.20216 vs 0.02162** |
| Loft \(v>3\) px/frame | PASS **9.971** |

No assert tolerances were loosened for the photoreal plates.

---

## Out of scope

Full production TAA suite as a product bake-off (SMAA+TAA+sharpen, UE/Unity/Godot stacks). DLSS / FSR / XeSS / any learned reconstructor. Full motion-vector generation as the only subject (screen-space velocity buffers, skinned MV, tessellated displacement MV, optical flow). Path-traced temporal denoisers (SVGF, ReSTIR + temporal, OIDN) as hero. Catmull-Rom 9-tap history, YCoCg + clipToAABB + variance as the **default** stack. Motion-weighted blend as a third hidden policy. Halton / R2 jitter on ghost heroes. Fast specular as a required plate. Toksvig, anisotropic GGX, sRGB-vs-linear texture decode. Tone-mapping bake-off rerun (clip / Reinhard / ACES / Neutral ladders) — Neutral is the inherited display operator. Shadow-map bias. Hardware TAA unit, 60 Hz persistence, display refresh, occupancy, bandwidth. Re-deriving Karis, DFG, or Neutral: cite the live notes.

---

## Resolve lock

```text
H     = bilinear(history, u_prev)     // nearest z
Hhat  = clamp ? minmax3x3_rgb(S, H) : H
C     = alpha * S + (1 - alpha) * Hhat
PNG   = sRGB_OETF( Neutral(e * C) )
```

Locked: \(\alpha\) is current-frame weight; hero \(\alpha=0.10\); clamp is RGB \(3\times 3\) minmax of \(S_t\); jitter \(0\) on ghost heroes. Pin the loft truck as the presentation. Pin the loft 3-up as the teaching. Pin the fingerprint as the unique artifact. Pin the amber field as the theorem. The mix is the caption. Last frame’s color is a bet. The ghost is what you pay when the bet is wrong.
