---
title: "Tone Mapping: Scene-Referred to Display-Referred"
description: "One linear loft still, four named operators. Clip burns 0.13355 of Le to channel-1; Neutral keeps the brass mullions. The curve allocates display codes — it does not create lighting."
date: 2026-09-16
tags:
  - graphics
  - engine
  - lighting
math: true
cover: /assets/journal/tone-mapping/00_hero.jpg
---

The last note owned environment lighting as a multiply: a GGX-prefiltered cube times a DFG LUT, plus distant irradiance. Display was a named footnote there:

\[
L_{\mathrm{display}}=\mathrm{TM}\bigl(\mathrm{expose}(L_o)\bigr)
\quad\text{then sRGB OETF.}
\]

TM was **Khronos PBR Neutral**, exposure **1.05**, identical on every IBL comparison row, not baked into the cubemaps. The IBL out-of-scope line was explicit: *deep tone-map bake-off (TM is one named operator).* This note owns that operator. **Tone mapping allocates display codes; it does not create lighting.**

![Cream stoneware bottle and brass sphere on board-formed concrete, loft window behind. Khronos PBR Neutral, exposure 1.05. Metal still carries mullions; glaze still reads cream. Photograph only — no clip-fraction.](/assets/journal/tone-mapping/00_hero.jpg)

The same loft still the IBL note already earned: cream stoneware (dielectric \(F_0=0.04\), glaze roughness \(0.14\)–\(0.30\)) and measured brass \(F_0=(0.910,\,0.778,\,0.423)\) on a board-formed concrete catcher, loft window behind, grounded contact. Named operator, exposure 1.05. The metal still carries mullions. The glaze still reads cream. HUD: `Khronos PBR Neutral  exposure=1.05`, `photo-only - no metric`. Caption on the plate: *tone mapping allocates display codes; it does not create lighting.* Do not hang a clip-fraction on this photograph.

![Same RGBA32F buffer, same exposure 1.05, only TM differs. Left: per-channel sat(Le) burns any channel ≥1 to display white. Right: Neutral compresses the peak and keeps brass hue. Photograph only. Full-frame is quiet — use the zooms.](/assets/journal/tone-mapping/01_clip_vs_neutral.jpg)

Controlled failure on the **identical** float buffer. Left burns any channel \(\ge 1\) to display white. Right compresses the peak and keeps brass hue. Same \(e=1.05\). Caption on the plate: *not IBL-10: that plate clipped \(L_i\) before prefilter. this clips \(L_e\) after shading.* Photo only. The full-frame pair does not make the mullion crush obvious.

![Teaching zoom of the brass-window specular, nearest upscale, pixel truth. Left CLIP — blown: channel-1 pancake, mullion grid gone. Middle NEUTRAL — structure: 4×5 bars still there, brass tint still there. Right |diff|: heat where clip and Neutral disagree.](/assets/journal/tone-mapping/01_obvious_tight.jpg)

**Pin this.** Tight crop of the brass window specular, nearest upscale. Left **CLIP — blown**: channel-1 pancake, mullion grid gone. Middle **NEUTRAL — structure**: \(4\times 5\) bars still there, brass tint still there. Right \(|\mathrm{diff}|\): heat where clip and Neutral disagree. If the L/R pair looked similar from across the room, this crop is the proof.

Hero, Mesa 25.0.7 llvmpipe, linear working space, **Khronos PBR Neutral** (\(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\)), exposure **1.05**: env solid-angle mean luma **1.628**; linear plate \(Y_{\max}\) **48.22**, \(Y_{\mathrm{mean}}\) **1.302**. Before TM at \(e=1.05\): clip_frac **0.13355**, highlight RMS **7.660**, midtone mean **0.481**. After clip/sat: sat_frac **0.134**, highlight RMS **0.686**, midtones unchanged **0.481**. After Neutral: clip_frac **0**, highlight RMS **0.625**, midtone **0.441**. Assertions **31 pass / 0 fail**.

---

## What you are seeing

Working space is **scene-referred linear Rec.709 radiance**. One RGBA32F loft still, shaded once. Camera, materials, env, and split-sum tables are IBL-continuous (`eye (1.30, 0.54, 1.98) → (0.05, 0.25, 0.02)`, fov \(30^\circ\)). This note does not re-derive Karis, DFG, or distant \(E(\mathbf{n})\). It changes the display operator.

**Presentation hook.** Product still, \(1920\times 1080\), GL photograph, CPU tone map. Named display operator. Photo only.

**Controlled failure.** L/R, \(1920\times 660\). Identical float buffer, same exposure, only TM differs. The full-frame pair is a quiet product still. The brass-window mullion crush lives in the teaching zooms.

![Four-up of the same brass-window crop, 5× nearest, same exposure / same buffer. (1) hard clip/sat, specular is a flat white pancake. (2) Neutral, mullion bar + brass hue still there. (3) clip with fail pixels marked: red = channel-1 white where Neutral keeps structure. (4) |clip−Neutral| heat. If panel 1 vs 2 still looks similar from afar, trust panel 4.](/assets/journal/tone-mapping/01_obvious_diff.jpg)

Four-up of the same crop, \(5\times\) nearest. (1) hard clip/sat, specular is a flat white pancake. (2) Neutral, mullion bar + brass hue still there. (3) clip with fail pixels marked: red = channel-1 white where Neutral keeps structure. (4) \(|\mathrm{clip}-\mathrm{Neutral}|\) heat. Caption on the plate: *if panel 1 vs 2 still looks similar from afar, trust panel 4.*

![Labeled clip vs Neutral, callouts on the brass specular. Left: hard clip/sat, hue crushed to channel-1. Right: Neutral, mullion / brass color kept. Photograph only.](/assets/journal/tone-mapping/01_callouts.jpg)

Same L/R as the controlled failure, callouts on the brass specular: left *hard clip/sat, hue crushed to channel-1*; right *Neutral, mullion / brass color kept.*

Two facts, never mixed:

1. **Beauty plates** (hero, clip-vs-Neutral, exposure ladder, Reinhard / ACES / luma controls) are GL-rendered split-sum, then a named CPU TM, then sRGB OETF. HUD `photo-only` means do not invent a clip-fraction or RMS theorem from the JPEG.
2. **Instruments** (false-color \(Y(L_o)\), curve-on-hist of \(Y(L_e)\), clip-mask of \(L_e>1\), and the CSV) are the float buffer. The teaching zooms are nearest-upscale crops of the L/R pair so the failure is readable.

---

## Scene-referred, display-referred, then 8-bit

Three spaces. Mixing them is how people “fix lighting” with a tone curve.

1. **Scene-referred linear.** \(L_o\) is radiance after shading. Values \(\gg 1\) are legal. This plate: \(Y_{\max}=48.22\), \(Y_{\mathrm{mean}}=1.302\). At \(e=1.05\), **276928** pixels have any \(L_e\) channel \(>1\) (clip_frac **0.13355**).
2. **Display-referred linear.** After TM, \(L_d\in[0,1]\) (Neutral and per-channel Reinhard land here; luma-ratio Reinhard can still overshoot a channel and needs a final sat). This is what a display code of 1 means in this note.
3. **8-bit sRGB PNG.** The OETF is IEC 61966-2-1 piecewise, **not** \(\gamma=2.2\). PNG 255 is not linear 1. Measurement is the float buffer / CSV. Do not FFT or energy-integrate the JPEG.

IBL-10 is not this failure. That plate authored \(L_i\le 1\) *before* prefilter: the environment never had HDR, so the metal lost punch and the interior collapsed. These plates clip \(L_e\) *after* shading, on a float loft that does have HDR (env mean luma **1.628**). Same visual family, different theorem. Stated on the L/R pair and the clip-mask.

---

## Why: expose, then a named curve, then OETF

Shade once into RGBA32F. Operator rows change only TM + encode. \(e\) is a stated gain, not Neutral’s \(F_{90}\), not an auto-exposure meter.

### Exposure is a separate pre-TM gain

\[
L_e = e\,L_o.
\]

Default lock \(e=1.05\) on every operator comparison (IBL continuity). The exposure ladder varies \(e\in\{0.50,\,1.05,\,2.00\}\) under **one** fixed curve. Neutral’s \(K_s\) is not retuned.

### Clip / saturate — controlled failure

\[
L_d = \mathrm{sat}(L_e)=\min\bigl(\max(L_e,0),1\bigr)
\quad\text{(per channel).}
\]

No shoulder. Any channel \(\ge 1\) becomes display white. Hue of a clipped brass highlight is whatever channel survived. Shiny white and matte white become the same code. The product still dies. That is the left panel of the L/R pair, and the pancake in the teaching zoom.

### Reinhard — labeled control

Global form:

\[
L'=\frac{L}{1+L}.
\]

Never reaches 1. Two application modes, one control plate:

- **Per-channel.** Apply to \(R,G,B\) independently. Highlights desaturate toward grey; brass hue walks. Midtones on this crop: **0.325** (pulled vs Neutral’s 1:1-ish band).
- **Luminance-ratio.** Rec.709 luma \(Y=0.2126R+0.7152G+0.0722B\), \(Y'=Y/(1+Y)\), \(RGB'=RGB\cdot(Y'/Y)\). Hue-preserving; a channel can still exceed 1 before the final sat (clip_frac **0.056** on \(L_d\)).

Extended white-point Reinhard \(L(1+L/L_w^2)/(1+L)\) is mention-only, not a hero.

### Narkowicz ACES — labeled control (album continuity)

Older sampling notes displayed with ACES (Narkowicz) then \(\gamma=2.2\). Keep that operator as a **labeled control**, not the hero. No silent \(0.6\) pre-scale.

\[
x_{\mathrm{out}}=\mathrm{sat}\!\left(\frac{x\,(2.51x+0.03)}{x\,(2.43x+0.59)+0.14}\right).
\]

Per-channel. On this midtone crop ACES mean **0.604** sits above Neutral **0.441** and even above \(L_e\) **0.481**: Narkowicz around \(Y\approx 0.48\) has gain \(>1\). That is filmic contrast, not a Neutral defect, and not a claim that ACES is wrong.

### Khronos PBR Neutral — named hero

Linear Rec.709 in, linear Rec.709 in \([0,1]\) out. Constants from the Khronos spec / `pbrNeutral.glsl`, not re-fit. Cite KhronosGroup/ToneMapping `PBR_Neutral`. No gamut mapping in this note.

\[
F_{90}=0.04,\qquad K_s=0.8-F_{90}=0.76,\qquad K_d=0.15.
\]

Three stages:

- **Toe.** Offset from \(x=\min(R,G,B)\) so darks are not a raw 1:1 that looks desaturated under Fresnel-aware PBR. \(F_{90}=0.04\) is the dielectric normal-incidence term Neutral is built around:

\[
o=\begin{cases}
x-6.25\,x^{2} & x<0.08\\
F_{90} & \text{otherwise.}
\end{cases}
\qquad
c \leftarrow c-o.
\]

- **Mid.** 1:1-ish after that offset for base colors in the band \(0.08\le RGB\le 0.8\) (sRGB 80–231 under unitary white). Peak \(P=\max(c)\). If \(P<K_s\), return \(c\). That band is why Neutral is the product-still operator. On this ceramic/catcher crop the midtone is \(L_e\) mean minus the \(0.04\) offset exactly: **0.4815 − 0.04 = 0.4415**. Gray slice asserted: Neutral\((0.50,0.50,0.50)\to 0.46\).

- **Shoulder.** Peak compression starts at \(K_s=0.76\). Let \(d=1-K_s\):

\[
P'=1-\frac{d^{2}}{P+d-K_s},\qquad
c\leftarrow c\cdot\frac{P'}{P},\qquad
g=1-\frac{1}{K_d(P-P')+1}.
\]

Then mix \(c\) toward \((P',P',P')\) at mix \(g\). Desaturation toward the compressed peak at rate \(K_d=0.15\).

Neutral is the named product-still display operator, not “correct cinematography.”

### Display-referred range, then OETF

After TM, \(L_d\in[0,1]\) is **display-referred linear**. Then the sRGB OETF (IEC 61966-2-1 piecewise):

\[
u'=\begin{cases}
12.92\,u & u\le 0.0031308\\
1.055\,u^{1/2.4}-0.055 & u>0.0031308.
\end{cases}
\]

PNG write is this encode. `GL_FRAMEBUFFER_SRGB` is off. Measurement is the float buffer, not the PNG.

---

## Unique artifact: this plate’s histogram, these curves

![Log-Y histogram of this Le plate (e=1.05×Lo), clip wall at 1, Neutral / Reinhard / ACES / clip curves, thumbnail of this still. Not an RGB triangle. Not a stock filmic screenshot from another scene.](/assets/journal/tone-mapping/03_curve_on_hist.jpg)

This is the thing this note exists to draw. Log-\(x\) scene-referred \(Y(L_e)\), same loft buffer as the beauty rows, clip drawn as a wall at 1. Overlay: clip/sat (hits 1 and stays), Neutral (gold, 1:1-ish through the mid, shoulder after \(K_s\)), Narkowicz ACES (magenta, gain \(>1\) in the mids on this plate), Reinhard \(L/(1+L)\) (cyan, never reaches 1). Thumbnail of **this** still so it cannot be a stock filmic screenshot.

Honesty on the overlay: Neutral’s peak compression plus desat-toward-white is RGB. The plotted curve is grayscale `Neutral(Y,Y,Y)`, labeled on the plate. Gold band on the legend is \(0.08\ldots 0.8\), the 1:1-ish claim.

![Instrument: log10 Y(Lo) before exposure and TM, turbo, color bar in linear Y from 0.01 to 31.6, tick at Y=1. Window glass and the brass reflection sit well above 1. Values ≫1 are legal scene-referred radiance. Not a beauty plate.](/assets/journal/tone-mapping/02_falsecolor_hdr.jpg)

Instrument, not a hero. \(\log_{10} Y(L_o)\) before exposure and TM, turbo, color bar in linear \(Y\) from 0.01 to 31.6, tick at \(Y=1\). Window glass and the brass reflection sit well above 1. Values \(\gg 1\) are legal scene-referred radiance.

False-color is \(Y(L_o)\) **before** exposure. The histogram is \(Y(L_e)\) with \(e=1.05\) so the wall at 1 matches the clip operator. Do not mix those two \(Y\)s.

![Instrument: Neutral photograph plus red overlay where any Le channel >1, plus a brass/window crop. Clip flattens the mullions; Neutral keeps highlight structure. Red is the pixels sat() burns to channel-1.](/assets/journal/tone-mapping/08_clip_mask.jpg)

Neutral photograph plus red overlay where any \(L_e\) channel \(>1\), plus a brass/window crop: clip flattens, Neutral keeps highlight structure. Red is the pixels \(\mathrm{sat}()\) burns to channel-1. Neutral compresses the peak. Same theorem as the teaching zoom, painted on the whole plate.

---

## Quote the CSV. Do not quote the beauty photographs as meters.

Float buffer, Mesa llvmpipe. Highlight crop: brass window specular \((1125,475)\)–\((1345,635)\), \(n=35200\). Midtone crop: ceramic/catcher away from the window spec \((421,239)\)–\((601,399)\), \(n=28800\). \(e=1.05\) unless the row is the Neutral ladder.

| stage | operator | clip_frac | sat_frac | highlight RMS | midtone mean |
|---|---|---|---|---|---|
| before TM | identity \(L_e\) | **0.13355** | 0.13362 | **7.660** | **0.4815** |
| after TM | clip/sat | 0 | **0.13362** | 0.686 | **0.4815** |
| after TM | Reinhard per-channel | 0 | 0 | 0.562 | **0.325** |
| after TM | Reinhard luma-ratio | **0.05607** | 0.05657 | 0.564 | 0.325 |
| after TM | Narkowicz ACES | 0 | 0.06453 | 0.717 | 0.604 |
| after TM | **PBR Neutral** | **0** | 0.00004 | **0.625** | **0.4415** |

Neutral exposure ladder (curve fixed, \(K_s\) not retuned):

| \(e\) | highlight RMS | midtone mean | clip_frac after Neutral |
|---|---|---|---|
| 0.50 | 0.530 | **0.189** | 0 |
| 1.05 | 0.625 | **0.441** | 0 |
| 2.00 | 0.758 | **0.817** | 0 |

Env solid-angle mean luma **1.628**. Linear plate \(Y_{\max}\) **48.22**, \(Y_{\mathrm{mean}}\) **1.302**. FBO **RGBA32F** \(1920\times 1080\); 8-bit fallback **not hit**.

Hero rounding used in the lede: clip_frac **0.13355**; highlight RMS **7.660 → 0.686** (clip) / **0.625** (Neutral); midtones **0.481** (clip, unchanged) / **0.441** (Neutral) / **0.325** (Reinhard RGB); ladder **0.189 / 0.441 / 0.817**. Do **not** invent a clip-fraction or RMS theorem from the hero, the L/R pair, or the Reinhard plate. Those frames are `photo-only`.

Highlight RMS is photometric, not a structure meter. After clip, crop RMS is **0.686** (many pixels parked at 1). After Neutral it is **0.625** (shoulder below 1). Clip RMS \(>\) Neutral RMS is not Neutral “losing” highlights. Structure (mullions in the brass reflection) is the clip-mask and the teaching zoom, not the RMS ranking.

---

## Failures / controls

### Clip vs Neutral

The L/R pair plus the obvious zooms plus the clip-mask. Clip-fraction of \(L_e\) is the input fact (**0.13355**). After clip, that fraction is burned into channel-1 (sat_frac **0.134**, midtones untouched at **0.481**). After Neutral, clip-fraction of \(L_d\) is **0**; sat_frac is \(4.2\times 10^{-5}\) (a handful of pixels at the compressed peak \(\ge 0.999\)), highlight structure remains. This is the controlled failure, not a contestant.

The zooms exist because the full-frame L/R is a quiet product still. The tight crop is the brass-window mullion grid: clip is a white rectangle; Neutral still has bars. The four-up panel 4 is the heat proof if the photographs still look close. The clip-mask paints the same \(L_e>1\) pixels red on the Neutral plate (window, glaze rims, brass spec) and repeats the crop.

### Exposure ladder under one curve

![Neutral only, e∈{0.50, 1.05, 2.00}. Curve fixed, Ks not retuned. Not auto-exposure. Photograph only.](/assets/journal/tone-mapping/04_exposure_ladder.jpg)

Neutral only. \(e=0.50\) underexposes the glaze (midtone **0.189**). \(e=1.05\) is the lock (midtone **0.441**). \(e=2.00\) drives more of the window into Neutral’s shoulder (midtone **0.817**, highlight RMS **0.758**). Clip-frac after Neutral stays 0 at all three gains. Not auto-exposure. \(K_s\) is not retuned. The scientific point is the split: gain first, curve second.

### Reinhard vs Neutral

![Same buffer, same e=1.05. Left: Reinhard L/(1+L) per RGB. Right: Neutral. Reinhard pulls cream glaze / concrete midtones down. Photograph only.](/assets/journal/tone-mapping/05_reinhard_vs_neutral.jpg)

Same buffer, same \(e=1.05\). Reinhard \(L/(1+L)\) per RGB never reaches 1 and pulls cream glaze / concrete midtones down (**0.325** vs Neutral **0.441** vs \(L_e\) **0.481**). Neutral keeps a 1:1-ish base-color band. Reinhard is a labeled control, not a second hero.

### ACES vs Neutral

![Same buffer, same e. Left: Narkowicz ACES. Right: Neutral. Older album default, labeled control, no 0.6 pre-scale. Not a claim that ACES is wrong cinematography. Photograph only.](/assets/journal/tone-mapping/06_aces_vs_neutral.jpg)

Same buffer, same \(e\). ACES is the older album default. Caption on the plate: *not a claim that ACES is wrong cinematography.* Midtone mean **0.604** is the filmic contrast already quoted. No \(0.6\) input pre-scale.

### Per-channel vs luminance Reinhard (brass hue)

![Reinhard per-channel vs luma-ratio, brass highlight crop. Per-channel greys the highlight; luma-ratio keeps F0 hue. Control plate, not a second hero. Photograph only.](/assets/journal/tone-mapping/07_perchannel_vs_luma.jpg)

Control plate, not a second hero. Measured brass \(F_0\) is colored. Per-channel Reinhard greys the highlight (the crop walks toward white-grey). Luma-ratio keeps \(F_0\) hue; a channel can still exceed 1 before final display sat (clip_frac **0.056**). Per-channel TM is a hue operator in disguise. Neutral’s peak-based compression plus desat-toward-white is a different, stated choice.

---

## Two paths, do not mix the instruments

| path | frames | instrument |
|---|---|---|
| **Photograph** | hero, L/R pair, exposure ladder, Reinhard / ACES / luma controls | GLSL 330 split-sum on this llvmpipe into RGBA32F, then CPU TM + sRGB OETF. HUD `photo-only`. |
| **Instrument** | false-color, curve-on-hist, clip-mask, CSV | false-color \(Y(L_o)\), curve-on-hist of \(Y(L_e)\), clip-mask of \(L_e>1\), linear-crop meters. |
| **Teaching zoom** | callouts, tight crop, four-up | nearest-upscale of the brass-window specular so the mullion crush is readable. |
| **Display** | every plate | expose \(e\) → named TM → sRGB OETF. One linear \(L_o\). Operator is the knob. |

The L/R pair is a photograph of the control *and* the source of the teaching zooms. Quote the CSV for clip-frac and RMS. Do not quote the 8-bit panel as 0.13355.

---

## Honesty gaps

1. **Neutral is the named product-still display operator, not “correct cinematography.”** ACES is a labeled control (older album default). Reinhard is a labeled control. Clip is the controlled failure.
2. **Highlight RMS is photometric, not a structure meter.** Clip RMS **0.686** vs Neutral **0.625** does not rank highlight quality. Structure is the clip-mask and the teaching zoom.
3. **ACES midtone mean (0.604)** sits above Neutral (0.441) and even above \(L_e\) (0.481) on this crop. Narkowicz around \(Y\approx 0.48\) has gain \(>1\). Filmic contrast, not a Neutral defect.
4. **Neutral sat_frac is \(4.2\times 10^{-5}\), not identically 0.** A handful of pixels sit at the compressed peak \(\ge 0.999\). `clip_frac` (any channel \(>1\)) is 0.
5. **Reinhard luma-ratio still needs a final display sat** for PNG (clip_frac **0.056** on \(L_d\) before sat). Per-channel Reinhard never reaches 1.
6. **Curve overlay on the histogram is grayscale `TM(Y,Y,Y)`.** Neutral’s peak compression + desat-toward-white is RGB; the overlay is labeled `Neutral(Y,Y,Y)`.
7. **False-color is \(Y(L_o)\) before exposure.** Histogram is \(Y(L_e)\) with \(e=1.05\) so the wall at 1 matches the clip operator.
8. **This clip is post-shading \(L_e\), not IBL-10.** IBL-10 clipped \(L_i\) before prefilter (source never had HDR). Same visual family, different theorem.
9. **TM does not create lighting.** Same \(L_o\), same env, same materials. The curve only allocates display codes.
10. **Contact AO** is a planar cosine term, not a shadow map. **Env** is procedural loft HDR, not a captured EXR.
11. **No hardware tonemap unit, no PQ/HDR10, no OCIO cinema LUT, no local adaptive TM as hero.** Neutral’s current spec is sRGB. Local TM exists; it is not this plate.
12. **JPEG / PNG is 8-bit display-referred.** Do not FFT or energy-integrate the file. Midtone mean and highlight RMS are linear-crop meters.
13. **IBL tables are reused, not proven here.** Seamless-cube face edges, `glGenerateMipmap`, prefilter spp caveats stay in the IBL note.

---

## Mesa / llvmpipe — what this run can claim

| item | value |
|---|---|
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| FBO color | **RGBA32F** complete, \(1920\times 1080\). 8-bit fallback **not hit** |
| Specular / irradiance / sky cubes | **RGBA16F** cubemaps, CPU mips uploaded per level. `glGenerateMipmap` **not** called |
| DFG LUT | RGBA32F \(128^{2}\), CPU GGX (reused IBL integrator, not re-derived as a theorem) |
| `GL_FRAMEBUFFER_SRGB` | disabled (TM + sRGB OETF on CPU) |
| MSAA | disabled |
| Neutral gamut | Rec.709 in, Rec.709 out, no gamut mapping |
| Exposure / TM | **1.05** / **Khronos PBR Neutral** (\(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\)) |

Can claim: on this llvmpipe build, one linear HDR loft buffer, exposed by a stated gain, produces these photographs under clip / Reinhard / ACES / Neutral; clip-fraction, highlight RMS, and midtone mean move as the CSV says; Neutral is the named display operator carried forward from IBL.

Cannot claim: that Neutral is “correct cinematography,” that ACES is wrong, that a JPEG histogram is the scene histogram, that PNG 255 is linear 1, that changing the curve invented lighting, or that this is how a display chip’s tonemap unit works. Discrete-GPU metrics, occupancy, bandwidth, HDR10/PQ encode, OCIO cinema LUTs.

---

## Assertions

This run: **31 pass / 0 fail**.

| check | result |
|---|---|
| Required gallery plates + CSV exist and are non-empty | PASS |
| FBO is RGBA32F; 8-bit fallback not hit | PASS |
| No NaNs in \(L_o\) | PASS |
| Env mean luma in \((0.15,\,25)\) | PASS **1.628** |
| Cube upload not `fail` | PASS **RGBA16F** |
| \(L_e\) clip-frac \(>0.002\) | PASS **0.13355** |
| Neutral clip-frac \(<10^{-4}\) | PASS **0** |
| Clip sat-frac tracks input clip-frac | PASS **0.13362** |
| Highlight RMS drops under clip and Neutral vs \(L_e\) | PASS **7.660 → 0.686 / 0.625** |
| Reinhard per-channel midtones below Neutral in the 1:1 band | PASS **0.325 < 0.441** |
| Neutral gray slice \(0.50\to 0.46\) (F90 offset, not re-fit) | PASS |
| Neutral constants not re-fit | PASS |

No assert tolerances were loosened for the photoreal plates.

---

## Out of scope

Full cinema LUT pipelines, OCIO shows, film print emulations, AgX / Hable / Uncharted2 as additional heroes. HDR10 / PQ / HLG / Rec.2020 mastering (Neutral’s current spec is sRGB). Local adaptive / operator-TMO / bilateral / photographic-zone TM as the hero. Auto-exposure meters, key-value, histogram-centering as the primary subject (\(e\) is a stated gain). Color-management ICC / display-profile rabbit hole. sRGB-vs-linear texture decode. TAA, temporal accumulation, firefly-suppression as TM. Re-deriving IBL: Karis prefilter, DFG LUT, roughness→mip, distant \(E(\mathbf{n})\). Cite the live note. Toksvig, anisotropic GGX, sheen, clearcoat, layered metals. Shadow-map bias. Hardware “tonemap unit,” real-time cost, occupancy, bandwidth.

---

## Display lock

```text
Le = e * Lo
Ld = TM(Le)          // Neutral hero; clip / Reinhard / ACES are labeled
sRGB = OETF(sat(Ld))
```

Locked Neutral constants (not re-fit): \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\). Rec.709 in/out. Pin the hero as the presentation. Pin the tight crop as the failure. Pin the histogram as the unique artifact. The formula is the caption. Same \(L_o\). The curve only allocates display codes.
