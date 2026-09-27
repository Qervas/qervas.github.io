---
title: "Shadow Map Bias as Geometric Error"
description: "Service-yard curb: bias as a length, b*=36 mm, A_ramp 0.509→0.019, G 0→15→91 mm, slope G=13 mm vs b_match 40 mm, 11 pass / 0 fail."
date: 2026-09-27
tags:
  - graphics
  - engine
  - lighting
math: true
cover: /assets/journal/shadow-map-bias-as-geometric-error/00_hero.jpg
---
阴影贴图偏移作为几何误差

A shadow-map bias is a length along the light ray, added before the depth compare. Too little of that length leaves a receiver that is analytically lit classified as shadowed. That classification is acne. Too much of it moves the contact shadow of a thin occluder off the true foot. That detachment is peter-panning. The photograph in this note is the curve that trades the two.

Discrete depth encoding, winner-islands, and reverse-Z belong to the lab note *Z-fighting is geometric compression plus quantization*. That note already points here for acne versus peter-panning. Fight-fractions stay there. This note keeps one shadow map and does not sweep a depth code. The shared idea is geometric. A depth failure can be named as a length: there, a resolvable interval in front of the camera; here, a bias \(b\), in metres, along the sun ray.

The scene is a **service-yard curb**. An asphalt apron, a 160 mm concrete curb, a poured wash ramp at \(20^\circ\), and a 12 mm steel plate stand in one \(1280\times 720\) frame. One directional sun at altitude \(32^\circ\). One \(512^2\) depth-compare map. One 8 m ortho. The map is rendered once. Across the ladder, only the compare bias changes.

Beauty is Mesa llvmpipe, linear Rec.709, then the display path from [Tone Mapping: Scene-Referred to Display-Referred](/posts/p/tone-mapping-scene-referred-to-display-referred/): **Khronos PBR Neutral** with \(e=\mathbf{1.00}\), \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\), and the sRGB OETF on the CPU. Exposure on this run is the gain \(K=\mathbf{3.40}\), held fixed for every bias. Neutral assigns display codes. It does not author the acne fraction or the contact gap.

The curve picks the operating point \(b^\star=\mathbf{36}\,\mathrm{mm}\) (\(0.036\,\mathrm{m}\)). Ramp acne \(A_{\mathrm{ramp}}\) falls from \(0.509\) through \(0.019\) to \(0\), at \(b=0\), at \(b^\star\), and at \(b_{\max}=120\,\mathrm{mm}\). Apron acne \(A_{\mathrm{apron}}\) falls from \(0.483\) to \(0\). The contact gap \(G\) rises from \(0\) through \(15\,\mathrm{mm}\) to \(91\,\mathrm{mm}\). Slope-scale at \(k_s=1\), \(b_c=0\) clears both acne fractions with a gap of \(13\,\mathrm{mm}\). The smallest constant sample whose ramp acne is no higher sits at \(b_{\mathrm{match}}=40\,\mathrm{mm}\), where the gap is already \(20\,\mathrm{mm}\). The run prints **11 pass / 0 fail**.

Those shortenings are for the eye. They map onto the unrounded tokens of this run as follows.

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

---

## What you are seeing

The working space of the photographs is scene-referred linear Rec.709, passed through Neutral at \(K=3.40\) and \(e=1.00\). The sweep plot and the metrics snapshot are authored in sRGB and skip Neutral. Two records stay separate. The photographs show the curb. The tables hold \(A\) and \(G\).

**Cover — the operating point.** \(1280\times 720\), bias \(b^\star=36\,\mathrm{mm}\), the service-yard curb with the wash ramp and the steel plate. The HUD is one line: the bias, and \(512^2\). A faint residue remains on the ramp. The apron reads clear. That residue is the leftover ramp acne in the table, \(0.018868\), and the clear apron is \(A_{\mathrm{apron}}=0\) at this sample. The \(15\,\mathrm{mm}\) gap is a length on the apron, not a grey level in the JPEG.

![Cover. Service-yard curb at the operating bias of 36 mm. Asphalt apron, concrete curb, 20 degree wash ramp, and a 12 mm steel plate under one sun. HUD reads B=36 MM and 512^2. Khronos PBR Neutral, exposure K=3.40. A faint residue remains on the ramp; the apron is clear. Acne fractions and the contact gap are the tables, not this frame.](/assets/journal/shadow-map-bias-as-geometric-error/00_hero.jpg)

**Acne — the short end.** Same camera, same map, \(b=0\). The ramp and the apron self-shadow in stripes. Each stripe is a receiver with analytic visibility 1 that the compare has marked shadowed. Ramp acne is \(0.509434\). Apron acne is \(0.482759\). The contact gap is \(0\).

![Acne end. Same camera and the same shadow map, bias 0. Ramp and apron self-shadow as stripes: analytically lit receivers classified as shadowed. Ramp acne 0.509434, apron acne 0.482759, contact gap 0. HUD reads B=0 MM and 512^2. Khronos PBR Neutral. Photograph only.](/assets/journal/shadow-map-bias-as-geometric-error/01_acne.jpg)

**Peter-panning — the long end.** Same camera, same map, \(b=b_{\max}=120\,\mathrm{mm}\). Both acne fractions are \(0\). The plate’s contact shadow has left the foot. The measured gap along the apron is \(91\,\mathrm{mm}\) (\(0.091\,\mathrm{m}\)). The dark band is that detachment. The curb’s own occlusion is a separate shadow.

![Peter-panning end. Same camera and the same shadow map, bias 120 mm. Both acne fractions are 0. The plate's contact shadow has left the foot; the measured gap along the apron is 91 mm. HUD reads B=120 MM and 512^2. Khronos PBR Neutral. Photograph only.](/assets/journal/shadow-map-bias-as-geometric-error/02_peterpan.jpg)

**Sweep — teaching pin.** \(A_{\mathrm{ramp}}\), \(A_{\mathrm{apron}}\), and \(G\) against constant bias, with \(b^\star\) marked and the slope-scale triple as a callout. Eight contact strips sit underneath: the samples nearest \(0\), \(24\), \(48\), \(72\), \(96\), and \(120\,\mathrm{mm}\), then \(b^\star\), then slope-scale. The staircase in \(G\) is left visible. This figure is the trade. The selected rows are the next table; the plot does not replace them.

![Teaching pin. Ramp acne, apron acne, and contact gap in millimetres against constant bias from 0 to 120 mm. Marker at b-star = 36 mm. Callout: slope-scale ks=1, bc=0, both acne fractions 0, gap 13 mm. Eight contact strips at 0, 24, 48, 72, 96, and 120 mm, then b-star, then slope-scale. The gap staircase is left visible. Authored sRGB of the curves and the contact strips.](/assets/journal/shadow-map-bias-as-geometric-error/03_sweep.jpg)

Selected constant-bias samples from this run. The full ladder is 31 samples, \(b=0,4,\ldots,120\,\mathrm{mm}\), drawn on the figure.

| \(b\) (mm) | \(A_{\mathrm{ramp}}\) | \(A_{\mathrm{apron}}\) | \(G\) (mm) |
| --- | --- | --- | --- |
| 0 | 0.509434 | 0.482759 | 0 |
| 16 | 0.283019 | 0 | 0 |
| 24 | 0.188679 | 0 | 11 |
| 36 \(=b^\star\) | 0.018868 | 0 | 15 |
| 40 | 0 | 0 | 20 |
| 80 | 0 | 0 | 56 |
| 120 | 0 | 0 | 91 |

At \(b=0\) the gap is closed and about half of each lit grid is false shadow. Apron acne has reached zero by \(16\,\mathrm{mm}\), while the ramp still carries \(0.283019\) and the gap is still closed. At \(b^\star\) the ramp fraction is \(0.018868\), the apron is clear, and the gap has opened to \(15\,\mathrm{mm}\). The ramp fraction reaches zero at \(40\,\mathrm{mm}\), where the gap is \(20\,\mathrm{mm}\). At \(120\,\mathrm{mm}\) both fractions are zero and the gap is \(91\,\mathrm{mm}\). The operating point is the interior sample where ramp acne is almost gone and the gap has only begun to open.

**Metrics snapshot.** A picture of this run’s table. If a glyph is soft or clipped, the markdown tables win.

![Metrics snapshot. Two columns from this run: scene service-yard-curb, the constant-bias sweep, the slope-scale row, apron median -0.000350 m, checksum a816326e2dbe2366, and eleven passing gates. Quote the tables in the text if a glyph is soft.](/assets/journal/shadow-map-bias-as-geometric-error/04_metrics.jpg)

---

## Bias as a length on one map

The shadow map stores one depth per texel: the front-most surface the light rasterized there. The compare asks whether the shaded point is farther from the light than that stored depth. On a surface that tilts across the texel, most shaded points are farther than the front-most fragment, so they fail the compare. Acne is that mismatch. The receiver’s analytic visibility toward the sun is 1, and the compare calls it shadowed.

On this frustum the texel slope dominates a 24-bit quantisation step. The apron slope is \(0.025005\,\mathrm{m}\) per texel. The quantisation step is \(4.564028\times 10^{-7}\,\mathrm{m}\). Their ratio is \(54787.622775\), about \(54788\), and the acceptance gate is anything above \(50\). The acne in the cover’s family of frames is a texel-slope failure. Winner-islands stay in the z-fighting note.

A bias \(b\) subtracts a length along the ray before the compare, which pushes the shaded point toward the light. Large enough \(b\) eats the texel mismatch, and the acne fraction falls. The same push moves the shadow boundary of a thin occluder off the true contact. The ground between the foot and the boundary is analytically shadowed, and the compare calls it lit. That length, measured along the apron, is the contact gap \(G\).

The two receivers keep the trade from collapsing to one slope. The wash ramp is grazed by the sun, at an incidence of \(12^\circ\). The apron faces the sun more steeply, at the sun’s altitude of \(32^\circ\). A constant large enough to quiet the ramp is already a visible gap at the plate. Slope-scale pays the ramp’s texel and a shorter length on the apron, so the marked point sits off the constant-bias curve: ramp acne down, gap still short.

\(b=0\) is the acne end. \(b=b_{\max}=0.120\,\mathrm{m}\) is the peter-pan end. The cover is the interior sample \(b^\star\). All three share the camera, the exposure, the materials, and the shadow map. The slope-scale point is the callout and the last strip on the teaching figure, plus one row of the metrics table. It is a single marked point on the same trade.

---

## The compare

World is right-handed, \(Y\) up, metres.

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

\[
s=(-\cos\alpha,\ \sin\alpha,\ 0),\qquad d(p)=-p\cdot s.
\]

One light camera serves the whole ladder. Depth increases along \(-s\). The ortho is a square of width \(W_l=8\,\mathrm{m}\). Window depth is

\[
z_w(d)=\frac{d-n_l}{f_l-n_l}.
\]

This run: \(n_l=-3.722583\,\mathrm{m}\), \(f_l=3.934586\,\mathrm{m}\), texel \(t=0.015625\,\mathrm{m}\) (\(15.625\,\mathrm{mm}\)). The quantisation step is \(4.564028\times 10^{-7}\,\mathrm{m}\). Texel slopes are \(0.025005\,\mathrm{m}\) on the apron, \(0.073510\,\mathrm{m}\) on the ramp, and \(0.009764\,\mathrm{m}\) on the plate face.

The CPU meter and the beauty shader share one compare. \(\tilde d\) is the stored window \(z\) of the winning fragment, decoded with the same \(n_l\) and \(f_l\). The fetch is the nearest texel. \(b(n_p)\) is evaluated on the receiver normal.

\[
\mathrm{shadowed}(p)\iff d(p)-b(n_p)>\tilde d(u,v).
\]

**Constant sweep.** \(k_s=0\), so \(b(n)=b\). The ladder is \(b=0,4,\ldots,120\,\mathrm{mm}\), thirty-one samples. The shadow map is rendered once. The checksum `a816326e2dbe2366` is the same at every \(b\), and it is the same after the last beauty frame. Bias lives only in the compare.

**Slope-scale, one marked point.** \(b_c=0\), \(k_s=1\). On a plane, with \(e_1\) and \(e_2\) the light-image axes,

\[
\frac{\partial d}{\partial x_l}=\frac{n\cdot e_1}{n\cdot s},\qquad
\frac{\partial d}{\partial y_l}=\frac{n\cdot e_2}{n\cdot s},
\]

\[
\Delta_{\mathrm{tex}}(n)=t\max\left(\left|\partial d/\partial x_l\right|,\left|\partial d/\partial y_l\right|\right),\qquad
b(n)=k_s\,\Delta_{\mathrm{tex}}(n).
\]

The derivatives are per metre in the light image, so \(\Delta_{\mathrm{tex}}\) is metres of light depth across one shadow texel. On the flat, un-averaged faces that length is the bias: \(73.510\,\mathrm{mm}\) on the ramp and \(25.005\,\mathrm{mm}\) on the apron. Neutral’s shoulder constant \(K_s=0.76\) is a display parameter. It is a different symbol from this \(k_s\).

**Acne fraction.** On a receiver region, an \(8\,\mathrm{mm}\) grid. A sample counts only when analytic visibility toward the sun is 1.

\[
A=\frac{\#\{\text{lit samples the compare marks shadowed}\}}{\#\{\text{lit samples}\}}.
\]

The ramp grid and the apron grid use that definition. Both are entirely analytically lit: ramp \(2703/2703\), apron \(3654/3654\).

**Contact gap.** The plate’s downstream face is at \(x_c=1\), with thickness \(\tau=12\,\mathrm{mm}\) toward the sun. On the raster map, each visible ground segment is majority-filtered with a \(31\,\mathrm{mm}\) window, and that filter is only for finding the boundary. \(G\) is the start of the longest shadowed run, minus \(x_c\). The filter is not applied to \(A\). Downstream of the plate, at \(b=0\), the raw compare shadows \(451/451\) transect samples, so the closed gap is a contact, not a missing caster.

**Ideal-map oracle.** A unit test of the metric, for this plate and this sun:

\[
G_{\mathrm{ideal}}(b)=\max(0,\ b\cos\alpha-\tau).
\]

The knee is \(b=\tau/\cos\alpha\). The unfiltered walk on the ideal depth matches \(G_{\mathrm{ideal}}\) within \(1.5\,\mathrm{mm}\) on the five locked biases. The worst walk error is \(0.647\,\mathrm{mm}\). The raster gap is not fit to that oracle.

**Operating point.** With \(A_0=A_{\mathrm{ramp}}(0)\) and \(G_{\mathrm{hi}}=\max(G(b_{\max}),0)\),

\[
J(b)=\frac{A_{\mathrm{ramp}}(b)}{A_0}+\frac{\max(G(b),0)}{G_{\mathrm{hi}}}.
\]

\(b^\star=\arg\min J\), and a tie goes to the smaller \(b\). On this run the minimum is \(b^\star=36\,\mathrm{mm}\) with \(J=0.202\), strictly between the ends. The sweep was not extended.

---

## Slope-scale as one marked point

Slope-scale is one point on the same trade: \(k_s=1\), \(b_c=0\), derivatives in shadow-texel units. On this run that point clears both acne fractions, \(A_{\mathrm{ramp}}=0\) and \(A_{\mathrm{apron}}=0\), at a contact gap of \(13\,\mathrm{mm}\) (\(0.013\,\mathrm{m}\)).

The comparison is against the constant ladder. Let \(b_{\mathrm{match}}\) be the smallest constant-bias sample whose ramp acne is no higher than the slope-scale point. That sample is \(40\,\mathrm{mm}\), and the gap there is already \(20\,\mathrm{mm}\) (\(0.020\,\mathrm{m}\)). Slope-scale therefore sits below the constant curve at matched acne: the same zero ramp acne, a shorter gap. The eleventh check records \(G(k_s=1)=13\,\mathrm{mm}<G(b_{\mathrm{match}})=20\,\mathrm{mm}\). The callout and the last strip on the teaching figure are that sentence as a photograph.

Normal-offset bias, receiver-plane depth, and a write-time polygon offset are other families. This measurement does not cover them. Bias here is metres in the compare.

---

## Quote the metrics. The photographs are not the meter.

CPU double, before Neutral. Beauty display is Khronos PBR Neutral, \(e=1.00\), with the tone-mapping note’s constants, not re-fit per bias.

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

---

## Honesty

1. **The meter is the CPU compare on the float color copy of the winning fragment depth, together with the analytic visibility grids.** Acne and gap come from that compare. Probes shade world points with the beauty compare. The bits match the CPU function at \(b=0\) and at \(b^\star\), \(16/16\).

2. **Gate 3, the apron median.** The measured apron median of \(d-\tilde d\) is \(-0.000350\,\mathrm{m}\), that is \(-0.35\,\mathrm{mm}\): a third of a millimetre below the strict planning floor of 0, because the 8 mm lattice sits slightly sunward of the \(512^2\) texel centers. The same grid against those texel-center depths predicts \(-0.349\,\mathrm{mm}\). The control accepts medians above \(-2\,\mathrm{mm}\). An apron that had not been drawn would land near \(-3.3\,\mathrm{m}\).

3. **Neutral may shoulder the plate’s lit face.** Specular on the plate is gated by the shadow bit and does not enter \(A\) or \(G\). Energy after Neutral is not a claim. \(K=3.40\) is not retuned per bias. The Neutral constants are the tone-mapping note’s.

4. **\(G\) is a staircase.** The \(31\,\mathrm{mm}\) majority window finds the contact boundary and is not applied to acne. The ship gate asks only that \(G(b_{\max})>G(0)\). Adjacent samples are allowed to step backward. On this run the series does not step backward: it holds flat landings, then rises from \(0\) to \(0.091\,\mathrm{m}\).

5. **Slope-scale is one marked point.** The claim is \(G(k_s=1)<G(b_{\mathrm{match}})\) at matched ramp acne. Percentage-closer filtering, variance and exponential shadow maps, and cascades are outside this measurement.

6. **One map, one checksum.** The shadow pass runs once. A checksum mismatch stops the run. This run’s checksum `a816326e2dbe2366` is constant across the sweep and after the last beauty.

7. **Rasterization is llvmpipe’s.** The ideal-map oracle checks the metric code. The raster curve checks the shadow map. There is no discrete-GPU depth claim, no hierarchical-Z claim, and no vendor polygon-offset scale.

| item | value |
| --- | --- |
| renderer | llvmpipe, OSMesa core 3.3 request |
| color / depth | **RGBA32F** copy of the winning fragment \(z\); attachment **DEPTH_COMPONENT24** |
| window depth bits | **0** (the meter does not read that buffer) |
| depth-texture sample | sixteen apron texels match the color copy |
| hardware compare | `sampler2DShadow` agrees on 8/8 stable points |
| encode | \(K=3.40\), Neutral \(e=1.00\), sRGB OETF on the CPU |
| map | rendered once; checksum **a816326e2dbe2366** |

**This run can claim the following.** On this OSMesa / llvmpipe build, one directional sun, one \(512^2\) nearest-texel shadow map, and one constant-bias sweep from 0 to 120 mm produced a falling acne fraction on both receivers and a rising contact gap at a 12 mm plate. The operating point that minimises the normalised sum of ramp acne and gap is the interior sample \(b^\star=36\,\mathrm{mm}\) (\(J=0.202\)). Slope-scale at \(k_s=1\) clears ramp acne at a shorter gap than the matching constant sample, \(13\,\mathrm{mm}\) against \(20\,\mathrm{mm}\). The regime ratio places the failure in the texel-slope regime. The run prints **11 pass / 0 fail**.

**This run does not claim the following.** A GPU, a wavefront, or a frame-time budget. A filtered shadow, a cascade, or a soft penumbra. A measured polygon offset, a normal-offset bias, or a receiver-plane depth. Acne or gap read from a JPEG. A second depth codebook, a fight-fraction, or a reverse-Z curve. A ranking of this bias length against a product shadow stack.

The eleven checks cover window depth, the regime ratio, the apron median, lit and covered regions, the ideal-map gap, probes and the checksum, frame projection, falling acne, a rising gap, an interior operating point, and the slope-scale gap.

Percentage-closer and contact-hardening filters, cascades, and atlas packing sit outside the measurement, as do a second light, an animated sun, and a soft penumbra. So do reverse-Z, a depth-format sweep, and the z-fighting note’s fight-fractions. The cover is the operating point. The sweep is the teaching figure. Bias is a geometric length, and the curve is the photograph.
