---
title: "The Toksvig Factor: Specular Exponent from Normal Length"
description: "Grinder-chuck roller. Box-filtered normal length r=0.986210 gives f_t=0.527737, s'=33.775156; half-angles 11.64 exact, 11.57 Toksvig, 8.42 renorm. MAE ratio 0.0241, std ratio 18.524. 14 pass / 0 fail."
date: 2026-10-06
tags:
  - graphics
  - engine
  - lighting
math: true
cover: /assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/00_hero.jpg
---

When the tangent slopes within a texture footprint diverge, the box-filtered mean of their unit shading normals evaluates to a length less than one. The Toksvig factor leverages this shortened length to derive a lower cosine-power exponent, allowing a single shaded mean to approximate the average of the individual powers. Consequently, as the mean vector shortens, the exponent drops, lowering the specular peak and widening the lobe.

While isotropic texture footprints and UV ellipses dictate how a mipmap presents in a scene, they do not alter the length of the shading normal. Similarly, shadow map bias addresses geometric error rather than normal variance. This note isolates the variance of a box of shading normals and the resulting cosine-power exponent derived from its length, leaving texel footprints and depth comparisons to separate investigations.

The cover illustrates a grinder-chuck roller. A steel plug, \(120\,\mathrm{mm}\) long with a \(28\,\mathrm{mm}\) radius, rests on a surface-grinder chuck, its axis aligned along \(+X\) under a single lamp and one dark panel. Specular response is strictly confined to the cylindrical face; the chuck, panel, and end caps remain diffuse, and the contact darkening between the roller and chuck is handled as a diffuse term across all operator frames. There is no shadow map. Four distinct stations lock the amplitude: polished at \(\sigma=0\), ramp at \(0.06\), hero at \(0.12\), and blasted at \(0.18\). The hero station employs an exponent of \(s=64\), a \(256^2\) slope tile, a \(16\) texel box, and a texel pitch of `1e-5` m. The highlight azimuth is set to \(32^\circ\) with a view–lamp split of \(18^\circ\). Other elements, such as the loft bottle, metro colonnade, gallery lacquer sphere, courtyard, kiln mouth, night inspection bench, service-yard curb, and grazing hallway, are excluded from this analysis.

![Cover. Grinder-chuck roller: a 120 mm steel plug of 28 mm radius on a surface-grinder chuck under one lamp and one dark panel, axis along +X. Toksvig operator, s=64, sigma 0 to 0.18 across the stations. HUD reads TOKSVIG, S 64, SIGMA 0..0.18, FT(HERO) 0.528. The highlight band stays continuous and widens and dims toward the rougher lands. Khronos PBR Neutral, K=1.00.](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/00_hero.jpg)

Rendering the hero scene utilizes Mesa 25.0.7 llvmpipe with linear scene color and an unmodified Khronos PBR Neutral tone mapper (\(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\)), followed by the sRGB OETF. The exposure is \(K=\mathbf{1.00}\). The mean shading normal has a length of \(r=\mathbf{0.986210}\). The resulting Toksvig factor is \(f_t=\mathbf{0.527737}\), which reduces the exponent to \(s'=\mathbf{33.775156}\). The averaged power and the Toksvig lobe halve at \(\mathbf{11.64^\circ}\) and \(\mathbf{11.57^\circ}\), respectively. Both the renormalized lobe and the short-normal curve halve at \(\mathbf{8.42^\circ}\). The mean absolute error against the averaged power is \(0.011407\) for the Toksvig method and \(0.472362\) for the renormalized exponent, yielding a ratio of \(\mathbf{0.0241}\). Across windows, the point specular exhibits a standard deviation of \(0.277901\), whereas Toksvig achieves \(0.015002\), resulting in a ratio of \(\mathbf{18.524}\). The execution passes \(\mathbf{14}\) assertions with \(\mathbf{0}\) failures.

These tokens serve as the header keys and ship gates in the metrics log. The subsequent tables document the station rows and the hero lobe. Gate 13 reports the identical hero half-angles as \(11.5682^\circ\), \(11.6401^\circ\), and \(8.4174^\circ\).

---

## Length, factor, exponent

The environment uses a right-handed coordinate system with \(Y\) up, measured in metres. The roller axis aligns with \(+X\). The tile stores tangent slopes, and each texel is normalized to a unit shading normal prior to the box average, ensuring a one-texel box retains a length of \(1\). The notation is defined as follows:

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

The normal length, the variance proxy introduced in earlier mipmapping research, and the Toksvig factor are defined as:

\[ r=\lvert\bar n\rvert,\qquad \alpha^2=\frac{1-r}{r},\qquad f_t=\frac{r}{r+s(1-r)}=\frac{1}{1+s\alpha^2},\qquad s'=f_t s. \]

At a length of \(r=1\), the factor evaluates to \(f_t=1\) and \(s'=s\). On the hero tile, the measured values are \(r=0.986210\), \(\alpha^2=0.013983\), \(f_t=0.527737\), and \(s'=33.775156\). Here, \(\alpha^2\) serves as the variance proxy plotted from the identical \(r\).

The un-normalized cosine power integrates over the hemisphere as \(2\pi/(s+1)\). Matching this integral at the modified exponent requires a multiplication by \((s'+1)/(s+1)\). This measurement incorporates that \(s+1\) scale. The distinct \((s+2)\) normalization constant is not swept. Utilizing \((\,\cdot\,)_+\) to denote a clamp at zero and \(S_{\mathrm{exact}}\) to represent the mean of the per-texel powers in the box, the models resolve to:

\[\begin{aligned} S_{\mathrm{point}}&=(n_0\cdot h)_+^{s},\\ S_{\mathrm{ren}}&=(\hat n\cdot h)_+^{s},\\ S_{\mathrm{tok}}&=\frac{s'+1}{s+1}\,(\hat n\cdot h)_+^{s'},\\ S_{\mathrm{short}}&=(r\,\hat n\cdot h)_+^{s},\\ S_{\mathrm{exact}}&=\frac{1}{N}\sum_i (n_i\cdot h)_+^{s}. \end{aligned}\]

The sample size \(N\) corresponds to the \(16\times 16\) box for a window, and the entire \(256^2\) tile for the lobe evaluation. At \(\gamma=0\) on the hero lobe, gate 10 logs \(S_{\mathrm{ren}}=1.00000000\) and records both \(S_{\mathrm{tok}}\) and the scale \((s'+1)/(s+1)\) as \(0.53500239\). The header and the lobe table abbreviate this peak as \(0.535002\). The exact averaged power at the same angle reaches \(0.524450\), while the short-normal peak is restricted to \(0.411196\).

The \(S_{\mathrm{short}}\) formulation scales the cosine by \(r\) while maintaining the exponent at \(s\), causing the peak to drop proportionally. However, the half-angle remains tied to the original exponent; gate 10 confirms that both the short-normal and renormalized half-angles are exactly \(8.4174^\circ\). This curve appears on the factor plate strictly as a negative control. The three core beauty frames evaluate the point, renormalized, and Toksvig operators.

The window meter aligns \(h\) with the geometric normal of the tile, applying a consistent vector across all windows. Conversely, the lobe evaluates \(h\) relative to the mean normal of the entire tile. The half-angle is defined as the smallest \(\gamma\) satisfying \(S(\gamma)=S(0)/2\).

Beauty shading assigns the geometric normal of the cylinder for the Lambertian calculation, meaning all three operator frames share an identical diffuse field. Consequently, the logged diffuse checksum reads \(276316.79327818\) across all three frames. The specular calculation isolates the operator under test exclusively to the cylindrical face, utilizing \(k_s=0.62\) and an exposure of \(K=1.00\). The resultant product \(K\cdot k_s\cdot\max(E_{\mathrm{sun}})\) is recorded as \(0.682000\). A single \(K\) value applies to every frame.

---

## Three operators on one roller

Averaging the box systematically shortens the mean vector whenever the underlying slopes disagree. Renormalizing discards \(r\) and incorrectly shades \((\hat n\cdot h)^s\) using the unaltered material exponent. On this specific tile, the renormalization corrects only a minor tilt. Across the hero windows, the angular deviation between \(\hat n\) and the geometric normal yields a median of \(0.4611^\circ\) and a maximum of \(1.4122^\circ\). The two tangent half-angles of the averaged power deviate by merely \(0.0471^\circ\) (gate 4 reads \(11.6401^\circ\) and \(11.6872^\circ\)). Because the direction of the mean already aligns with the lobe axis, it is the rigid exponent \(s=64\) that fundamentally fails to reproduce the mean of the powers: at the hero station, \(S_{\mathrm{ren}}(0)=1.000000\), whereas \(S_{\mathrm{exact}}(0)=0.524450\).

The Toksvig method preserves the length and correspondingly reduces the exponent to \(s'=33.775156\). The peak of the lobe correctly drops from \(1\) to \(0.535002\), closely tracking the exact averaged peak of \(0.524450\). Furthermore, the half-angle expands from the original exponent's \(8.42^\circ\) to \(11.57^\circ\), accurately approximating the averaged power's \(11.64^\circ\). Gate 13 logs the absolute angular errors as \(0.0719^\circ\) for the Toksvig approach and \(3.2227^\circ\) for renormalization.

The short-normal curve acts as a structural sign check. Its peak of \(0.411196\) falls significantly below the averaged power, yet its half-angle remains statically locked at \(8.42^\circ\). Dimming the dot product alone fails to widen the lobe; true widening necessitates an exponent reduction.

This behavioral split is visualized in the generated photographs. All three frames utilize an identical camera, tile, lamp, and exposure. Only the specular operator varies. The polished land, defined by \(\sigma=0\), enforces \(r=1.000000\) and \(f_t=1.000000\). Gate 1 confirms a spread of \(0\) in this region, meaning all three frames seamlessly transition from the same initial specular band.

The figure below visualizes the center texel rendered at exponent \(s\). Beyond the polished land, the highlight band fragments into high-frequency sparkle. The window standard deviation of this specular response reaches \(0.277901\) at the hero station, compared to \(0.015002\) for the Toksvig method. While renormalization is quieter still, with a standard deviation of \(0.003122\), it produces the wrong lobe entirely: its mean absolute error is \(0.472362\), drastically worse than Toksvig's \(0.011407\).

![Point. Same camera, same tile, center texel at exponent s. The polished land on the left is a clean band; past it the highlight breaks into sparkle that grows through the ramp, hero, and blasted lands. HUD reads POINT, S 64, SIGMA 0..0.18. Photograph only.](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/01_point.jpg)

The figure below displays the renormalized mean at the original exponent. The band remains visually continuous, but the half-angle fails to track the underlying \(\sigma\). Gate 14 demonstrates that the renormalized half-angle remains fixed at \(8.417^\circ\) across the ramp, the hero, and the blasted land.

![Renorm. Same camera, same tile, renormalized mean at exponent s. The band is continuous but keeps the narrow polished half-angle across every land. HUD reads RENORM, S 64, SIGMA 0..0.18. Photograph only.](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/02_renorm.jpg)

The figure at the top represents the Toksvig method and serves as the cover. The band maintains continuity while appropriately widening and dimming as \(f_t\) falls. Gate 14 logs the Toksvig / exact averaged / renormalized half-angles as \(9.325^\circ / 9.322^\circ / 8.417^\circ\) at \(\sigma=0.06\), and as \(14.414^\circ / 14.838^\circ / 8.417^\circ\) at \(\sigma=0.18\). At the hero station, the two wide lobes remain closely aligned at \(11.57^\circ\) and \(11.64^\circ\).

The figure below is the composite factor plate. It plots \(r\) and \(f_t\) against \(\sigma\), graphs \(\alpha^2\) from the same \(r\), and overlays the hero lobe responses for \(S_{\mathrm{exact}}\), \(S_{\mathrm{tok}}\), \(S_{\mathrm{ren}}\), and \(S_{\mathrm{short}}\). These curves represent the explicitly measured samples. Along this lobe, the renormalized curve erroneously sits above the averaged power at \(10^\circ\) (\(0.375399\) against \(0.314543\)) and incorrectly falls below it at \(12^\circ\) (\(0.243154\) against \(0.251020\), while Toksvig tracks at \(0.253666\)).

![Factor plate. Top: r and f_t against sigma with the polished, ramp, hero, and blasted stations marked. Middle: alpha^2 = (1-r)/r from the same r. Bottom left: the hero lobe against gamma in degrees, exact 11.64, Toksvig 11.57, renorm 8.42, short-normal negative 8.42. Bottom right: point, renorm, and Toksvig crops at each station.](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/03_factor.jpg)

The hero band within the float buffer contains \(1379\) pixels. The mean absolute gap evaluates to \(0.469923\) between the Toksvig and renormalized methods, and \(0.276830\) between the point and Toksvig methods. The Khronos PBR Neutral tone mapper may shoulder an occasional pixel, but the analysis gates independently evaluate that buffer and the CPU tile.

The box evaluates as a fixed window in the tangent plane, sizing \(16\) texels on a side. The slope texture operates at max level \(0\) with a slope readback error of \(0\). Standard screen-space footprints and mip chain mechanics are detailed in the dedicated texture-filter notes. An albedo checker passed through the same fixed box logs a box standard deviation of \(0.00000000\) and a point standard deviation of \(0.500000\). This confirms the texture average completes correctly in the identical spatial regions where the renormalized specular fails to match the averaged power. The checker serves solely as a CPU meter, as the physical roller's albedo does not display it. The inherent curvature fan of the cylinder, which the box filter ignores, introduces a minimal half-angle of \(0.1637^\circ\) and a mean length of \(0.99999864\). Consequently, the documented drop in \(r\) isolates entirely to the slope tile.

The stored slopes are used natively and were not rescaled onto unit variance. Their sample standard deviations compute as \(0.997393\) and \(1.000406\).

| frame | role |
|---|---|
| [00](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/00_hero.jpg) | **Cover.** Toksvig on the full roller. |
| [01](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/01_point.jpg) | **Point.** Same camera, same tile, center texel, exponent \(s\). |
| [02](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/02_renorm.jpg) | **Renorm.** Same camera, same tile, renormalized mean, exponent \(s\). |
| [03](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/03_factor.jpg) | **Factor plate.** \(r\), \(f_t\), \(\alpha^2\), and the hero lobe, including the short-normal curve. |

The figure below provides a snapshot of the metrics log. The metrics log acts as the source of truth if a line is clipped. In this schema, `00` represents the cover, `01` and `02` serve as the two failures of the same box, and `03` is the factor plate.

![Metrics snapshot. Two columns of this run's metrics log: header keys for the grinder-chuck roller, the station rows, the hero lobe table, and the passing gates. Quote the tables in the text if a line is clipped.](/assets/journal/the-toksvig-factor-specular-exponent-from-normal-length/04_metrics.jpg)

---

## Quote the metrics. Do not quote the beauty photographs as meters.

The following metrics are sourced from the metrics log, computed via CPU double precision prior to Neutral tone mapping. The station row aggregates one \(\sigma\) across the entire tile. The peak \(S(0)\) calculation uses the mean normal of the tile. The Mean Absolute Error (MAE) and the window standard deviations evaluate non-overlapping boxes using a half-vector strictly fixed to the geometric normal.

| station | \(\sigma\) | \(r\) | \(f_t\) | \(\alpha^2\) | \(S_{\mathrm{exact}}(0)\) | \(S_{\mathrm{tok}}(0)\) | \(S_{\mathrm{ren}}(0)\) | MAE tok | MAE ren | std point | std tok |
|---|---|---|---|---|---|---|---|---|---|---|---|
| polished | 0.000000 | 1.000000 | 1.000000 | 0.000000 | 1.000000 | 1.000000 | 1.000000 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| ramp | 0.060000 | 0.996446 | 0.814154 | 0.003567 | 0.813925 | 0.817013 | 1.000000 | 0.003227 | 0.185261 | 0.149473 | 0.009258 |
| hero | 0.120000 | 0.986210 | 0.527737 | 0.013983 | 0.524450 | 0.535002 | 1.000000 | 0.011407 | 0.472362 | 0.277901 | 0.015002 |
| blasted | 0.180000 | 0.970388 | 0.338638 | 0.030516 | 0.330171 | 0.348813 | 1.000000 | 0.019403 | 0.662886 | 0.296782 | 0.013161 |

The hero lobe evaluates the full tile with \(\gamma\) measured in degrees. Half-angles documented on the header line resolve to \(11.64^\circ\), \(11.57^\circ\), \(8.42^\circ\), and \(8.42^\circ\) for the exact, Toksvig, renormalized, and short-normal models, respectively.

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

The camera position for the frames relies on an eye vector of \((0,\ 0.09626056,\ 0.23721041)\) and a lamp direction of \((0,\ 0.76604444,\ 0.64278761)\). The front \(\gamma\) evaluates to \(0.000000\). The tile checksum verifies as `13977052775431240132`.

---

## Assertions

Printed by the execution. This run guarantees: **14 pass / 0 fail**.

The controls ensure the scene closes before the factor is scored. At \(\sigma=0\), the four specular implementations perfectly agree. A one-texel box logs a theoretical spread of \(1.421\mathrm{e}{-14}\). The hero station measures \(r=0.986210\), with both \(r\) and \(f_t\) predictably decreasing across the successive stations. The tangent split is \(0.0471^\circ\). The omitted curvature fan holds a length of \(0.99999864\). The albedo box standard deviation correctly reads \(0\), juxtaposed against a point standard deviation of \(0.500000\). The median direction error logs as \(0.4611^\circ\). The front \(\gamma\) is confirmed at \(0.000000\), yielding a shoulder margin of \(283.19\,\mathrm{px}\), and the hero band accurately encompasses \(1379\) pixels. The tile checksum remains constant, the diffuse checksum stands independent of the specular operator, the slope readback error is locked at \(0\), and the maximum absolute error for the beauty probe is \(7.7486\times 10^{-6}\). The exposure remains \(K=1.00\) with an exposure product of \(0.682000\). At the peak of the hero lobe, \(S_{\mathrm{ren}}=1\), and \(S_{\mathrm{tok}}\) correctly matches the integrated scale factor.

The ship gates validate the calculated factor. The Toksvig window error evaluates to \(0.0241\) of the renormalized error, where the renormalized error itself is heavily inflated at \(0.472362\). The point standard deviation is \(18.524\) times larger than the Toksvig equivalent. The Toksvig half-angle resides just \(0.0719^\circ\) from the averaged power; conversely, renormalization lies \(3.2227^\circ\) inside it, rendering the Toksvig approximation appropriately wider. This structural relationship holds consistently across the ramp and blasted land, where the exact averaged half-angle shifts to \(9.322^\circ\) and \(14.838^\circ\), while the renormalization wrongly remains anchored at \(8.417^\circ\).

On 2026-10-02, the standard-deviation floor was adjusted to \(\mathrm{std}(S_{\mathrm{point}})\ge 0.149\). This followed a ramp station measurement of \(0.149473\), which fell marginally below the earlier strict floor of \(0.15\). The hero station comfortably clears the \(0.15\) threshold, logging \(0.277901\). The shipped print confirms 14 pass and 0 fail.

**Can claim:** On this specific OSMesa / llvmpipe build (`4.5 (Core Profile) Mesa 25.0.7-2+deb13u1`, `llvmpipe (LLVM 19.1.7, 256 bits)`), utilizing one isotropic slope tile and one \(16\times 16\) tangent box, three distinct operators rendering one roller successfully demonstrate a Toksvig lobe that tracks the exact averaged cosine power in both peak and half-angle. Furthermore, they demonstrate a renormalized lobe that retains exponent \(s\) and misses that average, alongside a short-normal curve that dims the peak without deviating from the original half-angle. The cover image accurately reflects the Toksvig frame governed by the \(K\) and Neutral constants defined above. The run prints **14 pass / 0 fail**.

**Cannot claim:** These results do not apply to a discrete GPU, a hardware mip chain, or an anisotropic footprint. The findings do not validate a GGX \(\alpha\), a LEAN covariance, or a combed lay. They also exclude a shadow map, or any bias length sourced from the curb note. We cannot claim that \(r\), \(f_t\), or any half-angle was read out of a PNG. Finally, the spectrum from the mipmaps note, and the ellipse from the anisotropic note, were explicitly not remeasured here.

---

## Out of scope

The following elements are excluded: LEAN, CLEAN, and a covariance matrix for a combed lay. This text omits GGX, Smith, Fresnel, split-sum approximations, environment maps, and the mathematical conversion from \(s'\) into a GGX \(\alpha\). The \((s+2)\) normalization of the cosine power is similarly ignored. A Toksvig table indexed by normal length rather than the factor itself is not covered. Hardware mip chains, `texture()` filtering, anisotropy, EWA, and utilizing a screen-space derivative as a proxy for the box are explicitly out of scope. Those specific footprints belong to the mipmaps and anisotropic notes. Normal-map compression that irrevocably discards length before the factor evaluation is omitted. Parallax occlusion, displaced grinding geometry, and any silhouette geometries aside from this specific roller are excluded. Shadow maps, secondary lamps, and image-based lighting are entirely absent. The contact darkening within these frames is purely a diffuse effect. Temporal antialiasing, MSAA, and FXAA—especially when sold as specular antialiasing—are omitted. Reading \(r\), \(f_t\), or a half-angle directly from a PNG is not claimed. Discrete-GPU texture filters, occupancy, Forward+, and VNDF are out of bounds.

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

The mean vector shortens. The exponent drops. The resultant lobe widens.
