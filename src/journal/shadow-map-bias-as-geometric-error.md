---
title: "Shadow Map Bias as Geometric Error"
description: "On a service-yard curb, constant shadow-map bias is a length along the sun ray: too short yields acne, too long opens a contact gap. One operating point and one slope-scale mark the trade-off."
date: 2026-09-27
tags:
  - graphics
  - engine
  - lighting
math: true
cover: /assets/journal/shadow-map-bias-as-geometric-error/00_hero.jpg
---

Shadow-map bias is a physical length along the incident light ray, applied immediately before the depth comparison. Too short a length misclassifies an analytically lit receiver as shadowed—surface acne. Too long a length lifts the contact shadow of a thin occluder off its geometric foot—peter-panning. This note measures that trade-off on one map, one sun, and one constant-bias sweep.

Discrete depth encoding, winner-islands, and reverse-Z belong to *[Z-fighting is geometric compression plus quantization](/posts/p/z-fighting-is-geometric-compression-plus-quantization/)*. That note defers the acne-versus-peter-pan distinction here and keeps fight-fraction metrics in its own scope. We fix a single shadow map and do not sweep a depth code. The shared geometric idea is that a depth failure can be stated as a length: there an isolatable interval in front of the camera; here a bias \(b\) in metres along the sun vector.

## Scene

The cover is a **service-yard curb**: asphalt apron, 160 mm concrete curb, poured wash ramp at \(20^\circ\), and a 12 mm steel plate, in one \(1280\times 720\) framebuffer. One directional sun at altitude \(32^\circ\) feeds a single \(512^2\) depth-compare map with an 8 m orthographic frustum. The shadow map is rendered once per frame. Across the ladder, bias is the only independent variable.

Beauty runs on Mesa llvmpipe in scene-referred linear Rec.709, then through the display path in [Tone Mapping: Scene-Referred to Display-Referred](/posts/p/tone-mapping-scene-referred-to-display-referred/): **Khronos PBR Neutral** with \(e=1.00\), \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\), and an sRGB OETF on the CPU. Exposure is locked at \(K=3.40\) for every bias sample. Neutral only assigns display codes; it does not enter the acne fraction or the contact gap.

At the operating point \(b^\star=36\,\mathrm{mm}\) (\(0.036000\,\mathrm{m}\)), as \(b\) runs from \(0\) through \(b^\star\) to \(b_{\max}=120\,\mathrm{mm}\), ramp acne \(A_{\mathrm{ramp}}\) falls from \(0.509434\) through \(0.018868\) to \(0\) (lede abbreviations \(0.509\to 0.019\to 0\)), and apron acne \(A_{\mathrm{apron}}\) falls from \(0.482759\) to \(0\) (lede \(0.483\to 0\)). The contact gap \(G\) opens from \(0\) through \(15\,\mathrm{mm}\) to \(91\,\mathrm{mm}\). Slope-scale at \(k_s=1\), \(b_c=0\) clears both acne fractions with \(G=13\,\mathrm{mm}\). The smallest constant bias that also clears the ramp is \(b_{\mathrm{match}}=40\,\mathrm{mm}\), where \(G\) is already \(20\,\mathrm{mm}\). The run prints **11 pass / 0 fail**. Sweep rows, the full meter table, and gate notes live in the appendices.

## Method: bias as a length on one map

A shadow map stores one depth per texel—the front-most surface from the light. The compare asks whether a shaded point lies farther from the light than that stored depth. On a surface tilted relative to the texel plane, continuous shaded points fall deeper than the winning fragment, so the compare fails. Acne is that mismatch: analytic visibility toward the sun is 1, yet the compare marks the sample shadowed.

Under this orthographic frustum, texel slope dominates the 24-bit depth step. Apron slope is \(0.025005\,\mathrm{m}\) per shadow texel; the quantization step is \(4.564028\times 10^{-7}\,\mathrm{m}\). The ratio is \(54787.622775\) (lede \(54788\)), well above the gate floor of \(50\). The acne in the cover sequence is therefore a texel-slope failure; winner-islands stay in the z-fighting note.

Bias \(b\) subtracts a length along the ray toward the sun before the compare, sliding the shaded point toward the light. Large enough \(b\) swallows the texel mismatch and acne falls. The same slide moves a thin occluder's shadow boundary away from its foot: the lit band between foot and shadow is the contact gap \(G\), measured along the apron.

Two receivers keep the trade-off from collapsing to one slope. The wash ramp sees grazing incidence at \(12^\circ\); the apron sees the sun altitude \(32^\circ\). A constant bias large enough to kill ramp acne opens a large gap at the plate. Slope-scale applies a longer offset where the texel slope is steeper (ramp) and a shorter one on the apron, leaving the constant-bias curve.

The environment is right-handed, \(Y\) up, in metres.

| symbol | meaning | unit |
| --- | --- | --- |
| \(s\) | unit vector toward the sun | — |
| \(\alpha\) | sun altitude, \(32^\circ\) | degree |
| \(\beta\) | ramp tilt, \(20^\circ\) | degree |
| \(d(p)\) | light depth, \(-p\cdot s\) | \(\mathrm{m}\) |
| \(n_l,\,f_l\) | ortho near and far in \(d\) | \(\mathrm{m}\) |
| \(z_w\) | window depth, \(0\) at \(n_l\), \(1\) at \(f_l\) | — |
| \(t\) | shadow texel, ortho width \(/\,512\) | \(\mathrm{m}\) |
| \(b\) | constant bias along the ray, toward the sun | \(\mathrm{m}\) |
| \(k_s\) | slope-scale multiplier | — |
| \(\tau\) | plate thickness, \(0.012\) | \(\mathrm{m}\) |
| \(A\) | acne fraction | — |
| \(G\) | contact gap along \(+x\) | \(\mathrm{m}\) |

\[s=(-\cos\alpha,\ \sin\alpha,\ 0),\qquad d(p)=-p\cdot s.\]

One light camera serves the whole ladder. Depth increases along \(-s\). The ortho square has width \(W_l=8\,\mathrm{m}\):

\[z_w(d)=\frac{d-n_l}{f_l-n_l}.\]

This run uses \(n_l=-3.722583\,\mathrm{m}\) and \(f_l=3.934586\,\mathrm{m}\), so \(t=0.015625\,\mathrm{m}\) (\(15.625\,\mathrm{mm}\)). The 24-bit step is \(4.564028\times 10^{-7}\,\mathrm{m}\). Texel slopes are \(0.025005\,\mathrm{m}\) on the apron, \(0.073510\,\mathrm{m}\) on the ramp, and \(0.009764\,\mathrm{m}\) on the plate face.

CPU meters and the beauty shader share the compare. \(\tilde d\) is the stored window \(z\) of the winning fragment, decoded with the same \(n_l\), \(f_l\). Depth fetch is nearest-neighbor. Bias \(b(n_p)\) depends on the receiver normal:

\[\mathrm{shadowed}(p)\iff d(p)-b(n_p)>\tilde d(u,v).\]

**Constant sweep.** With \(k_s=0\), \(b(n)=b\). The ladder is \(b=0, 4, \ldots, 120\,\mathrm{mm}\) (31 samples). The map is built once; checksum `a816326e2dbe2366` is invariant across every \(b\) and after the last beauty. Bias changes only the compare, never the stored depths.

**Slope-scale, one marked point.** Here \(b_c=0\) and \(k_s=1\). With light-image basis \(e_1\), \(e_2\),

\[\frac{\partial d}{\partial x_l}=\frac{n\cdot e_1}{n\cdot s},\qquad \frac{\partial d}{\partial y_l}=\frac{n\cdot e_2}{n\cdot s},\]

\[\Delta_{\mathrm{tex}}(n)=t\max\left(\left\vert{}\partial d/\partial x_l\right\vert{},\left\vert{}\partial d/\partial y_l\right\vert{}\right),\qquad b(n)=k_s\,\Delta_{\mathrm{tex}}(n).\]

\(\Delta_{\mathrm{tex}}\) is metres of light depth across one texel: \(73.510\,\mathrm{mm}\) on the ramp, \(25.005\,\mathrm{mm}\) on the apron. Neutral's display shoulder \(K_s=0.76\) is unrelated to this geometric \(k_s\).

**Acne fraction.** An \(8\,\mathrm{mm}\) grid over a receiver; a sample counts only if analytic visibility toward the sun is exactly 1:

\[ A=\frac{\#\{\text{lit samples the compare marks shadowed}\}}{\#\{\text{lit samples}\}}. \]

Both regions are fully analytically lit: ramp \(2703/2703\), apron \(3654/3654\).

**Contact gap.** The plate's downstream face sits at \(x_c=1\) with thickness \(\tau=12\,\mathrm{mm}\) toward the sun. Visible ground is majority-filtered over a \(31\,\mathrm{mm}\) window for boundary finding only—never for \(A\). \(G\) is the start of the longest shadowed run minus \(x_c\). At \(b=0\), the raw compare shadows \(451/451\) transect samples downstream of the plate, so a closed gap is a real contact shadow, not a missing caster.

**Ideal-map oracle.** For this plate and sun altitude,

\[G_{\mathrm{ideal}}(b)=\max(0,\ b\cos\alpha-\tau).\]

The knee sits at \(b=\tau/\cos\alpha\). Across five locking biases the unfiltered ideal traversal tracks \(G_{\mathrm{ideal}}\) within \(1.5\,\mathrm{mm}\); peak error is \(0.647\,\mathrm{mm}\). The raster gap is measured, not fitted to the oracle.

**Operating point.** With \(A_0=A_{\mathrm{ramp}}(0)\) and \(G_{\mathrm{hi}}=\max(G(b_{\max}),0)\),

\[J(b)=\frac{A_{\mathrm{ramp}}(b)}{A_0}+\frac{\max(G(b),0)}{G_{\mathrm{hi}}}.\]

\(b^\star=\arg\min J\) (ties take the smaller \(b\)). This run isolates \(b^\star=36\,\mathrm{mm}\) at \(J=0.202\), interior to the swept extremes. The sweep was not extrapolated past \(b_{\max}\).

Photographs are scene-referred linear Rec.709 through Neutral at \(K=3.40\), \(e=1.00\). The sweep plot and metrics snapshot are authored sRGB, bypassing Neutral: photographs show the curb; tables and curves carry \(A\) and \(G\).

## Discussion: what if bias is short, long, or slope-scaled?

### What if you stop at the interior minimum of \(J\)?

The cover is that operating point: \(1280\times 720\), \(b^\star=36\,\mathrm{mm}\). A faint residue remains on the ramp (\(A_{\mathrm{ramp}}=0.018868\)); the apron is clear (\(A_{\mathrm{apron}}=0\)); the annotated gap is the measured \(15\,\mathrm{mm}\) along the apron, not a JPEG luminance cue. Apron acne is already gone by \(16\,\mathrm{mm}\) while the ramp still shows \(0.283019\) with \(G=0\). At \(b^\star\) the gap has just opened; ramp acne nulls only at \(40\,\mathrm{mm}\) with \(G=20\,\mathrm{mm}\). The operating point sits where ramp acne is mostly gone and detachment has only begun.

![Cover. Service-yard curb at the operating bias of 36 mm. Asphalt apron, concrete curb, 20 degree wash ramp, and a 12 mm steel plate under one sun. HUD reads B=36 MM and 512^2. Khronos PBR Neutral, exposure K=3.40. A faint residue remains on the ramp; the apron is clear. Acne fractions and the contact gap are the tables, not this frame.](/assets/journal/shadow-map-bias-as-geometric-error/00_hero.jpg)

### What if \(b=0\)?

Same camera and the same shadow map, compare at \(b=0\). Ramp and apron self-shadow as high-frequency stripes: lit receivers marked shadowed. \(A_{\mathrm{ramp}}=0.509434\), \(A_{\mathrm{apron}}=0.482759\), \(G=0\). Contact is correct; about half of every lit grid is a false shadow.

![Acne end. Same camera and the same shadow map, bias 0. Ramp and apron self-shadow as stripes: analytically lit receivers classified as shadowed. Ramp acne 0.509434, apron acne 0.482759, contact gap 0. HUD reads B=0 MM and 512^2. Khronos PBR Neutral. Photograph only.](/assets/journal/shadow-map-bias-as-geometric-error/01_acne.jpg)

### What if \(b=b_{\max}=120\,\mathrm{mm}\)?

Same camera and map at the long extreme. Both acne fractions are \(0\), but the plate's contact shadow has left the foot: \(G=91\,\mathrm{mm}\) (\(0.091\,\mathrm{m}\)) along the apron. The curb's own shadow remains a separate band.

![Peter-panning end. Same camera and the same shadow map, bias 120 mm. Both acne fractions are 0. The plate's contact shadow has left the foot; the measured gap along the apron is 91 mm. HUD reads B=120 MM and 512^2. Khronos PBR Neutral. Photograph only.](/assets/journal/shadow-map-bias-as-geometric-error/02_peterpan.jpg)

### What if slope-scale marks one point instead?

Slope-scale at \(k_s=1\), \(b_c=0\) is one marked point in the same space—not a second ladder. It clears \(A_{\mathrm{ramp}}=0\) and \(A_{\mathrm{apron}}=0\) with \(G=13\,\mathrm{mm}\) (\(0.013000\,\mathrm{m}\)), shorter than \(G(b_{\mathrm{match}})=20\,\mathrm{mm}\) at matched ramp acne. The claim is that inequality, not a product ranking of filtered shadows.

![Teaching pin. Ramp acne, apron acne, and contact gap in millimetres against constant bias from 0 to 120 mm. Marker at b-star = 36 mm. Callout: slope-scale ks=1, bc=0, both acne fractions 0, gap 13 mm. Eight contact strips at 0, 24, 48, 72, 96, and 120 mm, then b-star, then slope-scale. The gap staircase is left visible. Authored sRGB of the curves and the contact strips.](/assets/journal/shadow-map-bias-as-geometric-error/03_sweep.jpg)

The teaching pin plots \(A_{\mathrm{ramp}}\), \(A_{\mathrm{apron}}\), and \(G\) against constant bias from 0 to 120 mm, marks \(b^\star\), and callouts the slope-scale triplet. Eight contact strips sit under the plot at 0, 24, 48, 72, 96, and 120 mm, then \(b^\star\), then slope-scale; the gap staircase is left visible. Selected constant-bias rows are in Appendix A; the full 31-sample ladder is what the figure maps.

![Metrics snapshot. Two columns from this run: scene service-yard-curb, the constant-bias sweep, the slope-scale row, apron median -0.000350 m, checksum a816326e2dbe2366, and eleven passing gates. Quote the tables in the text if a glyph is soft.](/assets/journal/shadow-map-bias-as-geometric-error/04_metrics.jpg)

| frame | role |
|---|---|
| [00](/assets/journal/shadow-map-bias-as-geometric-error/00_hero.jpg) | **Cover.** Operating point \(b^\star=36\,\mathrm{mm}\). |
| [01](/assets/journal/shadow-map-bias-as-geometric-error/01_acne.jpg) | **Acne.** Same map, \(b=0\). |
| [02](/assets/journal/shadow-map-bias-as-geometric-error/02_peterpan.jpg) | **Peter-pan.** Same map, \(b=120\,\mathrm{mm}\). |
| [03](/assets/journal/shadow-map-bias-as-geometric-error/03_sweep.jpg) | **Sweep.** \(A\) and \(G\) vs constant bias; slope-scale callout. |
| [04](/assets/journal/shadow-map-bias-as-geometric-error/04_metrics.jpg) | **Metrics snapshot.** Tables and gates from this run. |


## Limits: what this run can and cannot claim

**Can claim.** On this OSMesa / llvmpipe build (core 3.3 request), one directional sun, one \(512^2\) nearest-texel shadow map, and one constant-bias sweep from 0 to 120 mm produced falling acne on both receivers and a rising contact gap at a 12 mm plate. The interior minimum of the normalised sum of ramp acne and gap is \(b^\star=36\,\mathrm{mm}\) (\(J=0.202\)). Slope-scale at \(k_s=1\) clears ramp acne at a shorter gap than the matching constant sample (13 mm against 20 mm). The regime ratio places the failure in the texel-slope regime. The run prints **11 pass / 0 fail**.

**Cannot claim.** A discrete GPU, wavefront, or frame-time budget. A filtered shadow, cascade, or soft penumbra. A measured polygon offset, normal-offset bias, or receiver-plane depth. Acne or gap read from a JPEG. A second depth codebook, fight-fraction, or reverse-Z curve. A ranking of this bias length against a product shadow stack.

Honesty notes that stay out of the main argument: the meter uses a 32-bit float color copy of winning fragment \(z\) (attachment **DEPTH_COMPONENT24**; window depth bits **0**); sixteen apron depth-texture texels match that copy; `sampler2DShadow` agrees on 8/8 stable points; probes at \(b=0\) and \(b^\star\) match the CPU test at 16/16 locations. Gate 3 apron median \(d-\tilde d=-0.000350\,\mathrm{m}\) (\(-0.35\,\mathrm{mm}\)) sits under the unquantized floor of 0 because the 8 mm lattice is sunward of \(512^2\) texel centers (projected residual \(-0.349\,\mathrm{mm}\)); the gate accepts any median within \(-2\,\mathrm{mm}\) (an unrendered apron would be about \(-3.3\,\mathrm{m}\)). Specular on the lit plate face is masked by the binary shadow and does not enter \(A\) or \(G\). The 31 mm majority filter is boundary-only; pass requires \(G(b_{\max})>G(0)\), and \(G\) rises monotonically from 0 to \(0.091\,\mathrm{m}\) even if individual staircase steps plateau. One map, one checksum—mismatch stops the run. The ideal-map oracle checks metric code; the raster curve checks the shadow map.

## Out of scope

Percentage-closer and contact-hardening filters, cascades, atlas packing, a second light, an animated sun, and a soft penumbra. Reverse-Z, a depth-format sweep, and the z-fighting note's fight-fractions. Vendor polygon-offset scales and hierarchical-Z. Reading \(A\) or \(G\) from a beauty JPEG.

The cover is the operating point. The sweep is the teaching figure. Bias is a geometric length. Dense meters follow.

---

## Appendix A — Constant-bias sweep and lede map

Metrics are CPU double precision before Neutral. The 31-sample ladder is \(b=0, 4, \ldots, 120\,\mathrm{mm}\); selected rows:

| \(b\) (mm) | \(A_{\mathrm{ramp}}\) | \(A_{\mathrm{apron}}\) | \(G\) (mm) |
| --- | --- | --- | --- |
| 0 | 0.509434 | 0.482759 | 0 |
| 16 | 0.283019 | 0 | 0 |
| 24 | 0.188679 | 0 | 11 |
| 36 \(=b^\star\) | 0.018868 | 0 | 15 |
| 40 | 0 | 0 | 20 |
| 80 | 0 | 0 | 56 |
| 120 | 0 | 0 | 91 |

Lede abbreviations map to this run's unrounded tokens:

| lede | this run |
| --- | --- |
| \(b^\star=36\,\mathrm{mm}\) | \(0.036000\,\mathrm{m}\) |
| \(A_{\mathrm{ramp}}\) \(0.509\to 0.019\to 0\) | \(0.509434\), \(0.018868\), \(0\) |
| \(A_{\mathrm{apron}}\) \(0.483\to 0\) | \(0.482759\), \(0\) |
| \(G\) \(0\to 15\,\mathrm{mm}\to 91\,\mathrm{mm}\) | \(0\), \(0.015\,\mathrm{m}\), \(0.091\,\mathrm{m}\) |
| slope \(G=13\,\mathrm{mm}\) | \(0.013000\,\mathrm{m}\) |
| \(b_{\mathrm{match}}=40\,\mathrm{mm}\), \(G=20\,\mathrm{mm}\) | \(0.040\,\mathrm{m}\), \(0.020\,\mathrm{m}\) |
| apron median \(-0.35\,\mathrm{mm}\) | \(-0.000350\,\mathrm{m}\) |
| regime ratio \(54788\) | \(54787.622775\) |

Contact strips on the teaching pin: 0, 24, 48, 72, 96, 120 mm, then \(b^\star\), then slope-scale. Sweep plot authored sRGB of the curves and strips.

## Appendix B — Full meter table

| item | value |
| --- | --- |
| scene | **service-yard-curb** |
| \(\alpha\) / \(\beta\) | **32°** / **20°** |
| shadow resolution / ortho width | **\(512^2\)** / **8 m** |
| texel / depth path | **0.015625 m** / **color-copy** |
| \(n_l\) / \(f_l\) | **−3.722583 m** / **3.934586 m** |
| quantisation step / regime ratio | **\(4.564028\times 10^{-7}\,\mathrm{m}\)** / **54787.622775** |
| \(\Delta_{\mathrm{tex}}\) apron / ramp / plate | **0.025005** / **0.073510** / **0.009764 m** |
| shadow checksum | **a816326e2dbe2366** |
| \(K\) / Neutral | **3.40** / \(e=1.00\), \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\) |
| \(b^\star\) / \(b_{\max}\) | **0.036 m** / **0.120 m** |
| \(A_{\mathrm{ramp}}\) at \(0\), \(b^\star\), \(b_{\max}\) | **0.509434** / **0.018868** / **0** |
| \(A_{\mathrm{apron}}\) at \(0\), \(b_{\max}\) | **0.482759** / **0** |
| \(G\) at \(0\), \(b^\star\), \(b_{\max}\) | **0** / **0.015 m** / **0.091 m** |
| slope \(k_s\) / \(b_c\) | **1** / **0** |
| slope \(A_{\mathrm{ramp}}\) / \(A_{\mathrm{apron}}\) / \(G\) | **0** / **0** / **0.013 m** |
| \(b_{\mathrm{match}}\) | **0.040 m**, \(G=0.020\,\mathrm{m}\) |
| apron median \(d-\tilde d\) | **−0.000350 m** |
| boundary majority / depth format | **31 mm** / **DEPTH_COMPONENT24** |
| analytic gap / probes | **pass** / **pass** |
| asserts | **11 pass / 0 fail** |

Renderer row: llvmpipe, OSMesa core 3.3 request; **RGBA32F** copy of winning fragment \(z\); attachment **DEPTH_COMPONENT24**; window depth bits **0**; sixteen apron texels match the color copy; hardware compare 8/8; encode \(K=3.40\), Neutral \(e=1.00\), sRGB OETF on the CPU; map checksum **a816326e2dbe2366**.

## Appendix C — Assertions and formula cheat sheet

Printed: **11 pass / 0 fail**. The eleven checks cover window depth, the regime ratio, the apron median, lit and covered regions, the ideal-map gap, probes and the checksum, frame projection, falling acne, a rising gap, an interior operating point, and the slope-scale gap.

Honesty checklist retained from the pre-appendix draft (items 1–7): (1) CPU depth verification; (2) Gate 3 apron median; (3) display tone-mapping constraints; (4) discreteness of \(G\); (5) slope-scale is one marked point; (6) one map, one checksum; (7) rasterization is llvmpipe's.

```text
b*           = 0.036 m (36 mm),  J = 0.202
A_ramp       = 0.509434 / 0.018868 / 0     at 0, b*, b_max
A_apron      = 0.482759 / 0
G            = 0 / 0.015 / 0.091 m
slope        ks=1, bc=0 → A=0/0, G=0.013 m
b_match      = 0.040 m, G=0.020 m
regime ratio = 54787.622775  (lede 54788)
apron median = -0.000350 m
checksum     = a816326e2dbe2366
asserts      = 11 pass / 0 fail
```
