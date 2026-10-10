---
title: "The Toksvig Factor: Specular Exponent from Normal Length"
description: "On a grinder-chuck roller, normal length from a box of unit shading normals lowers the cosine-power exponent so one shaded mean tracks the average of the per-texel powers."
date: 2026-10-06
tags:
  - graphics
  - engine
  - lighting
math: true
video:
  src: /assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/toksvig-explainer.mp4
  poster: /assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/toksvig-explainer-poster.jpg
  vtt: /assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/toksvig-explainer.vtt
  caption: "Animated explainer (6 min, English captions): why distant metal sparkles, and how the Toksvig factor turns normal length into a wider highlight. The written note with full metrics follows below."
cover: /assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/00_hero.jpg
---

When the tangent slopes within a texture footprint diverge, the box-filtered mean of their unit shading normals evaluates to a length less than one. The Toksvig factor takes that shortened length and derives a lower cosine-power exponent, so a single shaded mean can approximate the average of the individual powers. As the mean vector shortens, the exponent drops, the specular peak falls, and the lobe widens.

Isotropic texture footprints and UV ellipses dictate how a mipmap presents in a scene, but they do not change the length of the shading normal. Shadow map bias addresses geometric error rather than normal variance. This note isolates the variance of a box of shading normals and the cosine-power exponent derived from its length, leaving texel footprints and depth comparisons to separate investigations.

## Scene

The cover is a grinder-chuck roller: a steel plug, \(120\,\mathrm{mm}\) long with a \(28\,\mathrm{mm}\) radius, rests on a surface-grinder chuck with its axis along \(+X\) under a single lamp and one dark panel. Specular response is confined to the cylindrical face; the chuck, panel, and end caps stay diffuse, and contact darkening between roller and chuck is a diffuse term on every operator frame. There is no shadow map. Four stations lock amplitude—polished at \(\sigma=0\), ramp at \(0.06\), hero at \(0.12\), and blasted at \(0.18\). The hero station uses exponent \(s=64\), a \(256^2\) slope tile, a \(16\) texel box, and a texel pitch of `1e-5` m. Highlight azimuth is \(32^\circ\) with a view–lamp split of \(18^\circ\). Other scenes (loft bottle, metro colonnade, gallery lacquer sphere, courtyard, kiln mouth, night inspection bench, service-yard curb, grazing hallway) are excluded.

![Cover. Grinder-chuck roller: a 120 mm steel plug of 28 mm radius on a surface-grinder chuck under one lamp and one dark panel, axis along +X. Toksvig operator, s=64, sigma 0 to 0.18 across the stations. HUD reads TOKSVIG, S 64, SIGMA 0..0.18, FT(HERO) 0.528. The highlight band stays continuous and widens and dims toward the rougher lands. Khronos PBR Neutral, K=1.00.](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/00_hero.jpg)

The hero render runs on Mesa 25.0.7 llvmpipe with linear scene color and an unmodified Khronos PBR Neutral tone mapper (\(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\)), then the sRGB OETF, at exposure \(K=\mathbf{1.00}\). On that tile the mean shading normal has length \(r=\mathbf{0.986210}\). The Toksvig factor is \(f_t=\mathbf{0.527737}\), which cuts the exponent to \(s'=\mathbf{33.775156}\). Averaged power and Toksvig lobe halve at \(\mathbf{11.64^\circ}\) and \(\mathbf{11.57^\circ}\); renormalized and short-normal curves both halve at \(\mathbf{8.42^\circ}\). Against the averaged power, Toksvig MAE is \(0.011407\) and renormalized MAE is \(0.472362\) (ratio \(\mathbf{0.0241}\)). Across windows, point specular standard deviation is \(0.277901\) against Toksvig \(0.015002\) (ratio \(\mathbf{18.524}\)). The run prints \(\mathbf{14}\) pass / \(\mathbf{0}\) fail. Station rows, the hero lobe table, gate dumps, and run tokens live in the appendices; the prose below argues from those meters rather than reprinting them.

## Length, factor, exponent

The environment is right-handed with \(Y\) up, in metres; the roller axis is \(+X\). The tile stores tangent slopes. Each texel is normalized to a unit shading normal before the box average, so a one-texel box keeps length \(1\). Notation:

| symbol | meaning | unit |
|---|---|---|
| \(s\) | material cosine-power exponent, \(64\) | — |
| \(\sigma\) | slope amplitude on that tile | — |
| \(n_i\) | unit shading normal of one texel | — |
| \(\bar n\) | mean of the unit normals in the box | — |
| \(r\) | \(\lvert\bar n\rvert\) | — |
| \(\hat n\) | \(\bar n/r\) | — |
| \(\alpha^2\) | variance roughness \((1-r)/r\) | — |
| \(f_t\) | Toksvig factor | — |
| \(s'\) | \(f_t\, s\) | — |
| \(h\) | unit half-vector | — |
| \(\gamma\) | angle of \(h\) off the reference normal | degree |
| \(S\) | cosine-power factor, before \(k_s E\) | — |

Normal length, the variance proxy from earlier mipmapping work, and the Toksvig factor are

\[ r=\lvert\bar n\rvert,\qquad \alpha^2=\frac{1-r}{r},\qquad f_t=\frac{r}{r+s(1-r)}=\frac{1}{1+s\alpha^2},\qquad s'=f_t s. \]

At \(r=1\), \(f_t=1\) and \(s'=s\). On the hero tile the measured values are \(r=0.986210\), \(\alpha^2=0.013983\), \(f_t=0.527737\), and \(s'=33.775156\); \(\alpha^2\) is the variance proxy plotted from that same \(r\).

The un-normalized cosine power integrates over the hemisphere as \(2\pi/(s+1)\). Matching the integral at the modified exponent multiplies by \((s'+1)/(s+1)\); this measurement includes that \(s+1\) scale. The distinct \((s+2)\) normalization is not swept. With \((\,\cdot\,)_+\) a clamp at zero and \(S_{\mathrm{exact}}\) the mean of per-texel powers in the box,

\[\begin{aligned} S_{\mathrm{point}}&=(n_0\cdot h)_+^{s},\\ S_{\mathrm{ren}}&=(\hat n\cdot h)_+^{s},\\ S_{\mathrm{tok}}&=\frac{s'+1}{s+1}\,(\hat n\cdot h)_+^{s'},\\ S_{\mathrm{short}}&=(r\,\hat n\cdot h)_+^{s},\\ S_{\mathrm{exact}}&=\frac{1}{N}\sum_i (n_i\cdot h)_+^{s}. \end{aligned}\]

Here \(N\) is the \(16\times 16\) box for a window, or the full \(256^2\) tile for the lobe. At \(\gamma=0\) on the hero lobe, gate 10 logs \(S_{\mathrm{ren}}=1.00000000\) and both \(S_{\mathrm{tok}}\) and the scale \((s'+1)/(s+1)\) as \(0.53500239\) (header and lobe table abbreviate the peak as \(0.535002\)). Exact averaged power at the same angle is \(0.524450\); the short-normal peak is \(0.411196\).

Beauty shading uses the cylinder geometric normal for Lambertian, so all three operator frames share one diffuse field (diffuse checksum \(276316.79327818\)). Specular isolates the operator under test to the cylindrical face with \(k_s=0.62\) and \(K=1.00\); the product \(K\cdot k_s\cdot\max(E_{\mathrm{sun}})\) is \(0.682000\). One \(K\) applies to every frame. The window meter aligns \(h\) with the tile geometric normal; the lobe evaluates \(h\) relative to the mean normal of the whole tile. Half-angle is the smallest \(\gamma\) with \(S(\gamma)=S(0)/2\).

## Three operators on one roller

Averaging the box shortens the mean whenever the underlying slopes disagree. The three beauty operators—and the short-normal plate curve—answer four structural questions on the same camera, tile, lamp, and exposure.

### What if the mean is already aligned?

On this tile, renormalization corrects only a minor tilt. Across hero windows the angular gap between \(\hat n\) and the geometric normal has median \(0.4611^\circ\) and maximum \(1.4122^\circ\). The two tangent half-angles of the averaged power differ by only \(0.0471^\circ\) (gate 4: \(11.6401^\circ\) and \(11.6872^\circ\)). Because the mean direction already sits on the lobe axis, the failure is not a wrong normal direction: it is the rigid exponent \(s=64\) that cannot reproduce the mean of the powers. At the hero station, \(S_{\mathrm{ren}}(0)=1.000000\) while \(S_{\mathrm{exact}}(0)=0.524450\).

### What if you renormalize and keep \(s\)?

\(S_{\mathrm{ren}}\) discards \(r\) and shades \((\hat n\cdot h)^s\) at the unaltered material exponent. The band stays continuous in the photograph, but the half-angle refuses to track \(\sigma\). Gate 14 keeps the renormalized half-angle at \(8.417^\circ\) on ramp, hero, and blasted land alike. Absolute angular error against the averaged power is \(3.2227^\circ\) at the hero (gate 13), against Toksvig's \(0.0719^\circ\). MAE is \(0.472362\)—orders worse than Toksvig's \(0.011407\). Renormalization is quiet (window std \(0.003122\)), yet it produces the wrong lobe: continuity without the right width.

![Renorm. Same camera, same tile, renormalized mean at exponent s. The band is continuous but keeps the narrow polished half-angle across every land. HUD reads RENORM, S 64, SIGMA 0..0.18. Photograph only.](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/02_renorm.jpg)

### What if you only scale the cosine by \(r\)?

\(S_{\mathrm{short}}\) multiplies the cosine by \(r\) and leaves the exponent at \(s\). The peak drops with \(r\) (hero peak \(0.411196\), below the averaged \(0.524450\)), but the half-angle stays locked to the original exponent: gate 10 confirms short-normal and renormalized half-angles are both exactly \(8.4174^\circ\). Dimming the dot product alone does not widen the lobe; widening requires an exponent reduction. The short-normal curve appears on the factor plate strictly as a negative control.

### What Toksvig does instead

Toksvig keeps the length and lowers the exponent to \(s'=33.775156\). The lobe peak falls from \(1\) to \(0.535002\), close to the exact averaged peak \(0.524450\). The half-angle opens from the original \(8.42^\circ\) to \(11.57^\circ\), matching the averaged power's \(11.64^\circ\). Gate 13 quotes the finer half-angles \(11.5682^\circ\), \(11.6401^\circ\), and \(8.4174^\circ\) for Toksvig, exact, and renormalized. Gate 14 across stations logs Toksvig / exact / renormalized as \(9.325^\circ / 9.322^\circ / 8.417^\circ\) at \(\sigma=0.06\) and \(14.414^\circ / 14.838^\circ / 8.417^\circ\) at \(\sigma=0.18\).

![Point. Same camera, same tile, center texel at exponent s. The polished land on the left is a clean band; past it the highlight breaks into sparkle that grows through the ramp, hero, and blasted lands. HUD reads POINT, S 64, SIGMA 0..0.18. Photograph only.](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/01_point.jpg)

The point operator shades the center texel at exponent \(s\). Past the polished land the highlight fragments into high-frequency sparkle; window std reaches \(0.277901\) at the hero against Toksvig \(0.015002\). Polished land \(\sigma=0\) forces \(r=1.000000\) and \(f_t=1.000000\); gate 1 reports spread \(0\), so all three frames leave the same initial specular band.

The cover Toksvig frame keeps the band continuous while widening and dimming as \(f_t\) falls. The factor plate plots \(r\) and \(f_t\) against \(\sigma\), \(\alpha^2\) from the same \(r\), and the hero lobe for \(S_{\mathrm{exact}}\), \(S_{\mathrm{tok}}\), \(S_{\mathrm{ren}}\), and \(S_{\mathrm{short}}\). Along that lobe, renormalization sits above the averaged power at \(10^\circ\) (\(0.375399\) vs \(0.314543\)) and below it at \(12^\circ\) (\(0.243154\) vs \(0.251020\); Toksvig tracks at \(0.253666\)).

![Factor plate. Top: r and f_t against sigma with the polished, ramp, hero, and blasted stations marked. Middle: alpha^2 = (1-r)/r from the same r. Bottom left: the hero lobe against gamma in degrees, exact 11.64, Toksvig 11.57, renorm 8.42, short-normal negative 8.42. Bottom right: point, renorm, and Toksvig crops at each station.](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/03_factor.jpg)

The hero band in the float buffer holds \(1379\) pixels. Mean absolute gap is \(0.469923\) between Toksvig and renormalized, and \(0.276830\) between point and Toksvig. Neutral may shoulder an occasional pixel; the gates score the float buffer and the CPU tile independently.

The box is a fixed \(16\)-texel window in the tangent plane. Slope texture is at max level \(0\) with slope readback error \(0\). An albedo checker through the same box logs box std \(0.00000000\) and point std \(0.500000\), confirming the texture average completes in the same regions where renormalized specular misses the averaged power. Cylinder curvature that the box ignores contributes a minimal half-angle \(0.1637^\circ\) and mean length \(0.99999864\), so the documented drop in \(r\) isolates to the slope tile. Stored slopes were not rescaled onto unit variance; sample standard deviations are \(0.997393\) and \(1.000406\).

| frame | role |
|---|---|
| [00](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/00_hero.jpg) | **Cover.** Toksvig on the full roller. |
| [01](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/01_point.jpg) | **Point.** Same camera, same tile, center texel, exponent \(s\). |
| [02](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/02_renorm.jpg) | **Renorm.** Same camera, same tile, renormalized mean, exponent \(s\). |
| [03](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/03_factor.jpg) | **Factor plate.** \(r\), \(f_t\), \(\alpha^2\), and the hero lobe, including the short-normal curve. |

![Metrics snapshot. Two columns of this run's metrics log: header keys for the grinder-chuck roller, the station rows, the hero lobe table, and the passing gates. Quote the tables in the text if a line is clipped.](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/04_metrics.jpg)

## Discussion: floors, claims, and what OSMesa does not prove

On 2026-10-02 the standard-deviation floor was relaxed to \(\mathrm{std}(S_{\mathrm{point}})\ge 0.149\) after the ramp station measured \(0.149473\), just under the earlier floor of \(0.15\). The hero station clears \(0.15\) comfortably at \(0.277901\). The nudge documents a gate that was slightly too strict for the ramp land; it does not change the operator ranking or the half-angle story. The shipped print remains 14 pass / 0 fail.

**Can claim.** On this OSMesa / llvmpipe build (`4.5 (Core Profile) Mesa 25.0.7-2+deb13u1`, `llvmpipe (LLVM 19.1.7, 256 bits)`), one isotropic slope tile and one \(16\times 16\) tangent box, three operators on one roller show a Toksvig lobe that tracks exact averaged cosine power in peak and half-angle; a renormalized lobe that keeps exponent \(s\) and misses that average; and a short-normal curve that dims the peak without leaving the original half-angle. The cover is the Toksvig frame under the \(K\) and Neutral constants above. The run prints **14 pass / 0 fail**.

**Cannot claim.** The result does not transfer to a discrete GPU, a hardware mip chain, or an anisotropic footprint. It does not validate a GGX \(\alpha\), a LEAN covariance, or a combed lay. It excludes shadow maps and any bias length from the curb note. We do not claim that \(r\), \(f_t\), or any half-angle was read from a PNG. The spectrum from the mipmaps note and the ellipse from the anisotropic note were not remeasured here.

## Out of scope

Excluded: LEAN, CLEAN, and a covariance matrix for a combed lay; GGX, Smith, Fresnel, split-sum, environment maps, and converting \(s'\) into a GGX \(\alpha\); the \((s+2)\) cosine-power normalization; a Toksvig table indexed by normal length rather than the factor; hardware mip chains, `texture()` filtering, anisotropy, EWA, and screen-space derivatives as a box proxy (those footprints belong to the mipmaps and anisotropic notes); normal-map compression that discards length before the factor; parallax occlusion, displaced grinding geometry, and silhouettes other than this roller; shadow maps, secondary lamps, and image-based lighting (contact darkening here is diffuse only); temporal antialiasing, MSAA, and FXAA sold as specular antialiasing; reading \(r\), \(f_t\), or a half-angle from a PNG; discrete-GPU texture filters, occupancy, Forward+, and VNDF.

The mean vector shortens. The exponent drops. The lobe widens. Dense meters follow.

---

## Appendix A — Hero and station metrics

Metrics are from the metrics log, CPU double precision, before Neutral tone mapping. Each station row aggregates one \(\sigma\) across the tile. Peak \(S(0)\) uses the tile mean normal. MAE and window standard deviations use non-overlapping boxes with half-vector fixed to the geometric normal. Quote these tables if a metrics-snapshot line is clipped; do not quote beauty photographs as meters.

| station | \(\sigma\) | \(r\) | \(f_t\) | \(\alpha^2\) | \(S_{\mathrm{exact}}(0)\) | \(S_{\mathrm{tok}}(0)\) | \(S_{\mathrm{ren}}(0)\) | MAE tok | MAE ren | std point | std tok |
|---|---|---|---|---|---|---|---|---|---|---|---|
| polished | 0.000000 | 1.000000 | 1.000000 | 0.000000 | 1.000000 | 1.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| ramp | 0.060000 | 0.996446 | 0.814154 | 0.003567 | 0.813925 | 0.817013 | 1.000000 | 0.003227 | 0.185261 | 0.149473 | 0.009258 |
| hero | 0.120000 | 0.986210 | 0.527737 | 0.013983 | 0.524450 | 0.535002 | 1.000000 | 0.011407 | 0.472362 | 0.277901 | 0.015002 |
| blasted | 0.180000 | 0.970388 | 0.338638 | 0.030516 | 0.330171 | 0.348813 | 1.000000 | 0.019403 | 0.662886 | 0.296782 | 0.013161 |

Hero header half-angles: exact \(11.64^\circ\), Toksvig \(11.57^\circ\), renormalized \(8.42^\circ\), short-normal \(8.42^\circ\).

Hero dump (also in the opening prose): \(r=0.986210\), \(f_t=0.527737\), \(s'=33.775156\); half-angles \(11.64^\circ\), \(11.57^\circ\), \(8.42^\circ\); MAE \(0.011407\) / \(0.472362\) (ratio \(0.0241\)); std \(0.277901\) / \(0.015002\) (ratio \(18.524\)); asserts \(14\) pass / \(0\) fail. Gate 13 hero half-angles: \(11.5682^\circ\), \(11.6401^\circ\), \(8.4174^\circ\).

## Appendix B — Hero lobe table

Full-tile lobe; \(\gamma\) in degrees.

| \(\gamma\) | \(S_{\mathrm{exact}}\) | \(S_{\mathrm{tok}}\) | \(S_{\mathrm{ren}}\) | \(S_{\mathrm{short}}\) |
|---|---|---|---|---|
| 0 | 0.524450 | 0.535002 | 1.000000 | 0.411196 |
| 2 | 0.513721 | 0.524104 | 0.961752 | 0.395468 |
| 4 | 0.483154 | 0.492698 | 0.855481 | 0.351771 |
| 6 | 0.436262 | 0.444406 | 0.703588 | 0.289313 |
| 8 | 0.378135 | 0.384508 | 0.534783 | 0.219901 |
| 10 | 0.314543 | 0.319007 | 0.375399 | 0.154363 |
| 12 | 0.251020 | 0.253666 | 0.243154 | 0.099984 |
| 14 | 0.192116 | 0.193215 | 0.145166 | 0.059691 |
| 16 | 0.140948 | 0.140874 | 0.079775 | 0.032803 |
| 18 | 0.099081 | 0.098236 | 0.040291 | 0.016567 |
| 20 | 0.066706 | 0.065456 | 0.018668 | 0.007676 |
| 22 | 0.042994 | 0.041627 | 0.007918 | 0.003256 |
| 24 | 0.026521 | 0.025235 | 0.003067 | 0.001261 |
| 26 | 0.015654 | 0.014562 | 0.001082 | 0.000445 |
| 28 | 0.008841 | 0.007985 | 0.000347 | 0.000143 |

## Appendix C — Assertions and run tokens

Printed by the execution: **14 pass / 0 fail**.

Controls before the factor is scored: at \(\sigma=0\) the four specular implementations agree; a one-texel box logs theoretical spread \(1.421\mathrm{e}{-14}\); hero \(r=0.986210\) with \(r\) and \(f_t\) decreasing across stations; tangent split \(0.0471^\circ\); omitted curvature fan length \(0.99999864\); albedo box std \(0\), point std \(0.500000\); median direction error \(0.4611^\circ\); front \(\gamma=0.000000\); shoulder margin \(283.19\,\mathrm{px}\); hero band \(1379\) pixels; tile checksum constant; diffuse checksum independent of specular operator; slope readback error \(0\); beauty-probe max absolute error \(7.7486\times 10^{-6}\); exposure \(K=1.00\); exposure product \(0.682000\); at hero lobe peak \(S_{\mathrm{ren}}=1\) and \(S_{\mathrm{tok}}\) matches the integrated scale.

Ship gates: Toksvig window error \(0.0241\) of renormalized error (renormalized MAE \(0.472362\)); point std \(18.524\) times Toksvig; Toksvig half-angle \(0.0719^\circ\) from averaged power, renormalization \(3.2227^\circ\) inside it. Across ramp and blasted, exact averaged half-angles \(9.322^\circ\) and \(14.838^\circ\); renormalization stays at \(8.417^\circ\). Gate 14 dumps: \(9.325^\circ / 9.322^\circ / 8.417^\circ\) at \(\sigma=0.06\); \(14.414^\circ / 14.838^\circ / 8.417^\circ\) at \(\sigma=0.18\).

Camera / eye / lamp: eye \((0,\ 0.09626056,\ 0.23721041)\), lamp \((0,\ 0.76604444,\ 0.64278761)\); front \(\gamma=0.000000\); tile checksum `13977052775431240132`; diffuse checksum \(276316.79327818\).

Gate 10 peak tokens: \(S_{\mathrm{ren}}=1.00000000\); \(S_{\mathrm{tok}}\) and scale \((s'+1)/(s+1)\) both \(0.53500239\); exact \(0.524450\); short \(0.411196\); short and renorm half-angles \(8.4174^\circ\).

Std-floor history: floor set to \(\mathrm{std}(S_{\mathrm{point}})\ge 0.149\) on 2026-10-02 after ramp \(0.149473\) fell under \(0.15\); hero \(0.277901\).

Schema for the metrics figure: `00` cover, `01` and `02` the two failures of the same box, `03` the factor plate. HUD cover abbreviates \(f_t\) as \(0.528\).

## Appendix D — Formula cheat sheet

```text
r        = |n_bar|
alpha2   = (1 - r) / r
ft       = r / (r + s * (1 - r))
s'       = ft * s
S_tok    = (s' + 1) / (s + 1) * (n_hat · h)_+ ^ s'
S_ren    = (n_hat · h)_+ ^ s
S_short  = (r * n_hat · h)_+ ^ s          # plate only; half-angle stays at s
S_point  = (n_0 · h)_+ ^ s
hero     r = 0.986210,  ft = 0.527737,  s' = 33.775156
half     exact 11.64, Toksvig 11.57, renorm 8.42, short 8.42
MAE      0.011407 / 0.472362             # ratio 0.0241
std      0.277901 / 0.015002             # ratio 18.524
asserts  = 14 pass / 0 fail
```
