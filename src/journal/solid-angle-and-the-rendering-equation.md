---
title: "Solid Angle and the Rendering Equation"
description: "Path tracers sample dω (sr). Irradiance and the RE track projected solid angle Ω⊥. Same Li, α=5° vs 15°: EB/EA=8.818616 (not 9); same-R Ω ratio 3.536 (not 4). Courtyard skylight + Lambert card."
date: 2026-09-22
tags:
  - graphics
  - engine
  - lighting
math: true
cover: /assets/journal/solid-angle-and-the-rendering-equation/00_hero.jpg
---

立体角与渲染方程

The last note owned Monte Carlo sampling mismatch: **same integral, two pdfs, one \(N\).** Those pdfs were already densities in \(1/\mathrm{sr}\). Split-sum had already folded an environment into a GGX prefilter \(\times\) DFG LUT and left the measure inside the integral (env solid-angle mean luma **1.628** on that loft run). **This note owns the measure.**

**Path tracers sample \(d\omega\). Irradiance and the rendering equation track \(\Omega_\perp\).** A direction is a point on the hemisphere, weighted in steradians. Flux through a flat surface uses the projected solid angle \(\Omega_\perp=\int(n\cdot\omega)\,d\omega\). Source area, pixel count, and \(L_i\) used as a brightness knob are the wrong meters.

The [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) key was a finite disk of angular radius **3.600°**. The solid angle that disk subtends, which that note never printed, is

\[
\Omega(3.600^\circ)=2\pi\bigl(1-\cos 3.600^\circ\bigr)=0.012398431\,\mathrm{sr}.
\]

A hemisphere pdf against a cap that small is why a cosine sample fireflies a highlight. Cited here. The cosine-versus-Phong comparison stays in that note.

![Presentation. Sunlit courtyard / skylight atrium: four walls, square skylight with jamb, matte limewash floor, low bench. Analytic sky disk α=15°, white Lambert card. Photograph only — do not hang EB/EA on this frame.](/assets/journal/solid-angle-and-the-rendering-equation/00_hero.jpg)

A new photographic family: sunlit courtyard / skylight atrium — not the loft cream-glaze bottle / measured-brass / dark-oak still, not the metro colonnade, not the gallery lacquer sphere. Four walls, a square skylight with a visible jamb, matte limewash floor, one low bench for scale. An **analytic sky disk** sits in the opening: spherical cap of locked half-angle \(\alpha=15^\circ\), uniform radiance. White Lambert card \(\rho=0.80\), \(n=+Y\), \(L_e=0\), on the floor under the opening. The card is the instrument. HUD: `path tracers sample d omega  E tracks Omega_perp`. Do not hang \(E_B/E_A\) on this photograph.

![Teaching pin. Same camera, same exposure, same Li. Left α=5° | right α=15°. Only Omega changes; brightness change IS the lesson. EB/EA=8.818616. Photograph only.](/assets/journal/solid-angle-and-the-rendering-equation/01_size.jpg)

**Pin this.** Same camera, same exposure, **same \(L_i\)**. Left \(\alpha=5^\circ\). Right \(\alpha=15^\circ\). The right-hand card integrated more steradians. Lower caption: *only Omega changes; brightness change IS the lesson*, and \(E_B/E_A = 8.818616\) with the same-\(R\) control. Upper line: *area is not Omega; pixels are not steradians.* Photo only.

Hero, Mesa 25.0.7 llvmpipe, linear Rec.709, **Khronos PBR Neutral** \(e=\mathbf{1.00}\), seed **1352782172**: \(\Omega_A=\mathbf{0.023909417}\,\mathrm{sr}\), \(\Omega_B=\mathbf{0.214094348}\,\mathrm{sr}\), ratio **8.954394**. \(\Omega_{\perp A}=\mathbf{0.023863926}\,\mathrm{sr}\), \(\Omega_{\perp B}=\mathbf{0.210446804}\,\mathrm{sr}\). Disk irradiance ratio \(E_B/E_A=\mathbf{8.818616}\). The small-angle stand-in \((15/5)^2=9\) is rejected as the meter. Same-\(R\) area control: \(\Omega\) ratio **3.536**. \(L_i=(12.0,\,13.2,\,16.0)\) bit-identical A/B; \(L_{iY}=\mathbf{13.147}\); disk/fill \(Y\)-ratio **200**. Assertions **28 pass / 0 fail**.

---

## What you are seeing

Working space is **scene-referred linear Rec.709**. One courtyard, one analytic cap, one Lambert card. Display is inherited: Khronos PBR Neutral, \(e=1.00\), then IEC 61966-2-1 sRGB OETF on CPU. The curve still does not create lighting. Neutral still does not author \(E\). Cite the [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) and [split-sum IBL](/posts/p/split-sum-image-based-lighting/) notes.

**Hero — presentation hook.** Atrium, visible disk, white card, low bench, \(\alpha=15^\circ\). Photo of the family. The meter is not this JPEG.

**Size A/B — teaching pin.** A \| B, same \(L_i\), \(\alpha=5^\circ\) vs \(15^\circ\), shared exposure. Quote the metrics for the digits.

![Failure B. Same α=15° disk fixed in world. Left card n=+Y, β=0 | right tilted β=60°. Li frozen. (n·ω) is geometry, not a brightness slider. Photograph only.](/assets/journal/solid-angle-and-the-rendering-equation/02_cosine.jpg)

**Cosine tilt — Failure B.** Same \(\alpha=15^\circ\) disk held fixed in world. Left: card \(n=+Y\), \(\beta=0\). Right: card tilted \(\beta=60^\circ\). \(L_i\) frozen. Plate caption: *(n·ω) is geometry, not a brightness slider.* Photo only.

![The measure. Unit hemisphere over the card. Equal-Ω cells, sky cap as a spherical polygon. Not a latlong unwrap.](/assets/journal/solid-angle-and-the-rendering-equation/03_grid.jpg)

**Grid — the measure.** Unit hemisphere over the card. Equal-\(\Omega\) cells, sky cap as a spherical polygon. Plate caption: *the measure, not a latlong unwrap.*

![Identity. Irradiance vs Ω⊥. Cyan: disk E=LiY Ω⊥. Gold: disk plus named fill. Red ghost: LiY Ω, cosine missing. Squares: cosine-arm N=256.](/assets/journal/solid-angle-and-the-rendering-equation/04_E_vs_Omega.jpg)

**\(E\) vs \(\Omega_\perp\) — the identity.** Horizontal axis \(\Omega_\perp\) in sr. Cyan: disk \(E=L_{iY}\Omega_\perp\). Gold: disk plus named fill. Red ghost: \(L_{iY}\Omega\), cosine missing. Squares: cosine-arm \(N=256\), inverted through Lambert. Plate caption: *irradiance tracks projected solid angle.*

![The article. Same cap twice, side view. Left: steradians on the sphere. Right: foreshortened patch. At 5° they almost agree; at 15° the article appears.](/assets/journal/solid-angle-and-the-rendering-equation/05_wedge.jpg)

**Wedge — the article.** Same cap twice, side view. Left: steradians on the sphere. Right: foreshortened patch. Plate caption: *at 5 deg they almost agree; at 15 deg the article appears.*

![Estimator. Card center, α=15°, N=16/64/256/1024. Uniform-Ω (cyan) and cosine-Ω⊥ (gold), same ξ stream. Not an IS bake-off; rel_err must fall.](/assets/journal/solid-angle-and-the-rendering-equation/06_mc_n.jpg)

**MC-\(N\) — estimator of that integral.** Card center, \(\alpha=15^\circ\), \(N=16/64/256/1024\). Thumbnails are the cosine-\(\Omega_\perp\) instrument. The plot is uniform-\(\Omega\) (cyan) and cosine-\(\Omega_\perp\) (gold), same \(\xi\) stream. Plate caption: *not an IS bake-off; rel_err must fall.* The traces are allowed to rise at \(N=256\). The gate is the fall at \(1024\).

![Instrument. Science plate of the float-buffer metrics. Quote the table, not the JPEG. Not a cover.](/assets/journal/solid-angle-and-the-rendering-equation/07_metrics.jpg)

**Metrics strip — the meter, snapshot.** Science plate of the float-buffer table. Quote the text metrics, not the JPEG.

Two facts, never mixed:

1. **Beauty plates** (`00`, `01`, `02`) are the GLSL courtyard on this llvmpipe, Neutral then sRGB OETF. The shader shades walls, floor, and the card with a disk form factor. Do not invent \(\Omega\), \(E\), or \(L_o\) from the JPEG.
2. **Instruments** (`03`, `04`, `05`, `06`, `07`, and the metrics) are the float identities and the CPU estimator. Quote the metrics.

---

## Three failures

Radiance \(L_i\) is power per area per steradian. Irradiance on a plate is radiance times the **projected** solid angle of the source. Grow the cap and keep \(L_i\) fixed: the card changes. Tilt the card and keep \(L_i\) and the cap fixed: the card changes again, because \((n\cdot\omega)\) moved. Neither change is a hotter source.

**Failure A — area versus \(\Omega\).** It lives on the size A/B plate. Left \(\alpha=5.000^\circ\), right \(\alpha=15.000^\circ\), \(L_i=(12.0,\,13.2,\,16.0)\) on both, \(e=1.00\), \(\rho=0.80\). The right card is brighter because \(\Omega_\perp\) grew from **0.023863926** sr to **0.210446804** sr. The disk irradiance ratio is \(E_B/E_A=\mathbf{8.818616}\). The lower caption names the rejected stand-in: \((15/5)^2=9\).

The same caption carries the area control, which is not a second photograph. On-axis disk, radius \(R\), distance \(d\), \(\alpha=\arctan(R/d)\),

\[
\Omega=2\pi\Bigl(1-\frac{d}{\sqrt{R^2+d^2}}\Bigr).
\]

From the metrics, \(R=1\), area \(=\pi\) on both rows:

| \(R\) | \(d\) | \(\alpha=\arctan(R/d)\) | area | \(\Omega\) [sr] |
|---|---|---|---|---|
| 1 | 2 | \(26.565^\circ\) | \(\pi\) | **0.663334** |
| 1 | 4 | \(14.036^\circ\) | \(\pi\) | **0.187600** |

Area identical. Recorded \(\Omega\) ratio \(=\mathbf{3.536}\). Inverse-square in distance at fixed radius would report \((4/2)^2=4\). The assert rejects 4. Scale \(R\) and \(d\) by the same \(k\) and \(\Omega\) is unchanged while area scales by \(k^2\). Equal area is not equal solid angle. Equal solid angle carries no claim about area.

**Failure B — missing cosine.** It lives on the cosine-tilt plate, and as a curve on the \(E\) vs \(\Omega_\perp\) plot. Integrating \(L_i\,d\omega\) without \((n\cdot\omega)\) collects flux as if the receiver were a spherical probe. The rendering equation on an opaque surface is the flat-plate integral. \((n\cdot\omega)\) is foreshortening of the incoming beam. It is not a brightness slider and it is not the BRDF. On the tilt plate the \(15^\circ\) disk stays put and the card tilts to \(\beta=60^\circ\). The right card goes dark at the same \(L_i\). The red ghost on the identity plot is \(L_{iY}\Omega\) drawn against \(\Omega_\perp\). Raising \(L_i\) to lift the dark card voids the control.

**Failure C — pixels versus steradians.** The upper line of the size plate already says so. Pixel coverage is a camera projection of the *drawn sky disk*. Solid angle in the rendering equation is at the **card**. The two stored counts are not a matched pair. `pixels_disk_A` **910** is a luma threshold on the linear \(\alpha=5^\circ\) panel at \(628\times 720\). `pixels_disk_B` **7242** is the same kind of count on the \(\alpha=15^\circ\) hero at \(1280\times 720\). Both lines are tagged `omega_from_pixels_illegal`. Different frame size, different aspect, and the right-hand panel of the size plate is not the image that produced 7242. Dividing the two integers does not estimate \(\Omega_B/\Omega_A\). A \(5^\circ\) cap is \(\Omega=0.023909417\,\mathrm{sr}\) at 910 px and at any other footprint. Frame size moves the count. It does not move card \(\Omega\).

The importance-sampling key is Failure A at a still smaller cap. **3.600°** subtends **0.012398431** sr. That note’s cosine pdf spends its mass on the hemisphere around \(n\), not on that cap. This note prints the steradian.

---

## The rendering equation once

Write it once. Name every symbol. Later lines evaluate this integral. They do not rename it.

\[
L_o(x,\omega_o)
=
L_e(x,\omega_o)
+
\int_{\Omega^+}
f_r(x,\omega,\omega_o)\,
L_i(x,\omega)\,
(n\cdot\omega)\,
d\omega.
\]

| symbol | name | unit |
|---|---|---|
| \(L_o\) | outgoing radiance | \(\mathrm{W}\,\mathrm{m}^{-2}\,\mathrm{sr}^{-1}\) (linear Rec.709 RGB in the lab) |
| \(L_e\) | emitted radiance | same; **0** on the card and floor |
| \(L_i\) | incident radiance | same; piecewise-constant sky disk + dim fill |
| \(f_r\) | BSDF | \(\mathrm{sr}^{-1}\); Lambert \(\rho/\pi\) on card and floor |
| \(n\) | geometric unit normal | dimensionless |
| \(\omega\) | incoming direction, toward the source | unit vector, \(\omega\in S^2\) |
| \(\omega_o\) | outgoing direction | unit vector |
| \(\Omega^+\) | hemisphere about \(n\) | \(\{\omega:n\cdot\omega>0\}\) |
| \(d\omega\) | solid-angle measure | \(\mathrm{sr}\) |

A path tracer samples this integral: draw \(\omega\in\Omega^+\), weight by \(f_r L_i (n\cdot\omega)/p(\omega)\). Building the tracer is a different note. What this one locks is the measure \(p\) is a density *of*.

### \(d\omega\), then projected solid angle

\(\theta\) is polar angle from \(n\). \(\phi\) is azimuth in the tangent frame.

\[
d\omega
=
\sin\theta\,d\theta\,d\phi
=
-\,d(\cos\theta)\,d\phi
\qquad
[\,\mathrm{sr}\,].
\]

The second form is the grid. Equal steps of \(\phi\) and of \(\cos\theta\) are equal steradians. The polar step that realizes a fixed \(\Delta\cos\theta\) is \(\Delta\theta=\Delta\cos\theta/\sin\theta\), wide near the pole, packed near the horizon. A lat-long that is even in \(\theta\) is even in the picture and uneven in \(d\omega\): its cells scale with \(\sin\theta\) and collapse at the pole. Sampling \(\theta\) from a uniform angle is not sampling solid angle. The inverse CDF for uniform \(d\omega\) on \(\Omega^+\) is \(\cos\theta=\xi_1\), \(\phi=2\pi\xi_2\).

Full sphere \(\int_{S^2}d\omega=4\pi\). Hemisphere \(\int_{\Omega^+}d\omega=2\pi\). This run: `sphere_sr` **12.566370614**, `hemisphere_sr` **6.283185307**. Neither number is \(\pi\). \(\pi\) is the projected hemisphere:

\[
d\omega_\perp
=
(n\cdot\omega)\,d\omega
=
\cos\theta\,\sin\theta\,d\theta\,d\phi,
\qquad
\int_{\Omega^+}d\omega_\perp
=
\pi.
\]

A sky of constant radiance \(L_i\) over all of \(\Omega^+\) delivers irradiance \(E=L_i\pi\). The \(2\pi\) count of directions is the wrong meter for a flat plate. That factor is geometry. It is already in the integral, before \(f_r\).

`E_analytic_*` below is this lab’s scalar: Rec.709 luma of \(L_i\) times \(\Omega_\perp\). The plates label that axis \(\mathrm{W}/\mathrm{m}^2\). It is not a spectrally integrated pyranometer reading.

### The cap, then one bounce

On-axis spherical cap, \(\theta\in[0,\alpha]\), \(\phi\in[0,2\pi)\), \(L_i\) constant on the cap:

\[
\Omega(\alpha)
=
\int_0^{2\pi}\!\!d\phi\int_0^{\alpha}\sin\theta\,d\theta
=
2\pi\bigl(1-\cos\alpha\bigr),
\]

\[
\Omega_\perp(\alpha)
=
\int_0^{2\pi}\!\!d\phi\int_0^{\alpha}\cos\theta\sin\theta\,d\theta
=
\pi\sin^2\alpha.
\]

\(\Omega_\perp\) is the area of the disk of radius \(\sin\alpha\) in the tangent plane. That disk is the right-hand drawing on the wedge plate. The ratio of the two closed forms is the identity printed on that plate:

\[
\frac{\Omega_\perp}{\Omega}
=
\frac{\sin^2\alpha}{2(1-\cos\alpha)}
=
\cos^2(\alpha/2),
\]

because \(1-\cos\alpha=2\sin^2(\alpha/2)\) and \(\sin\alpha=2\sin(\alpha/2)\cos(\alpha/2)\). At the locked pair the quotient of the metrics tokens is the same identity: **0.998097** at \(5^\circ\), **0.982963** at \(15^\circ\).

Irradiance on the untilted plate from the cap alone, and the Lambert evaluation of the integral with \(L_e=0\), one bounce, no interreflect:

\[
E
=
L_i\,\Omega_\perp(\alpha)
=
L_i\,\pi\sin^2\alpha,
\qquad
L_o^{\mathrm{disk}}
=
\frac{\rho}{\pi}\,E
=
\rho\,L_i\sin^2\alpha.
\]

Lambert’s \(\rho/\pi\) is already per steradian. The \(\pi\) in \(\Omega_\perp\) cancels it. Dropping \((n\cdot\omega)\) and leaving \(\rho/\pi\) in place is not a harmless rescaling. The weight still has the units of radiance. The integral is the wrong one. That wrong integral is the red ghost.

Named fill is a dim constant on the rest of \(\Omega^+\), same projected measure. The complement has projected solid angle \(\pi\cos^2\alpha\):

\[
L_o
=
\rho\,L_i\sin^2\alpha
+
\rho\,L_{\mathrm{fill}}\bigl(1-\sin^2\alpha\bigr).
\]

`E_analytic_*` is the **disk** product \(L_{iY}\,\Omega_\perp\). `Lo_analytic_*_Y` is disk plus fill. The A/B irradiance identity is the disk row. The two columns answer different questions.

### Estimator of the same integral

Uniform in solid angle on \(\Omega^+\), and cosine-weighted, are instruments of the integral above. Same \(N\), same \(\xi\). This note does not rank them. That ranking is the [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) note.

\[
\widehat{L}_o
=
\frac{1}{N}
\sum_{k=1}^{N}
\frac{f_r(\omega_k,\omega_o)\,L_i(\omega_k)\,(n\cdot\omega_k)}{p(\omega_k)}.
\]

| arm | sample on \(\Omega^+\) | \(p(\omega)\) |
|---|---|---|
| uniform-\(\Omega\) | \(\cos\theta=\xi_1\), \(\phi=2\pi\xi_2\) | \(1/(2\pi)\) |
| cosine-\(\Omega_\perp\) | \(\cos\theta=\sqrt{\xi_1}\), \(\phi=2\pi\xi_2\) | \((n\cdot\omega)/\pi\) |

Under \(p_{\cos}\) the factor \((n\cdot\omega)\) cancels, and a hit contributes \(\rho L_i\) or \(\rho L_{\mathrm{fill}}\) according to the cap test. Under \(p_{\mathrm{unif}}\) the cosine stays in the weight: \((n\cdot\omega)/p_{\mathrm{unif}}=(n\cdot\omega)\,2\pi\). Both estimate the integral written once above, provided the density in the denominator is the density that was sampled. \(f_r\) supplies one \(\mathrm{sr}^{-1}\). \(p\) supplies the other. \(d\omega\) is accounted for. A density built on pixel footprint, or on uniform \(\theta\), does not become a solid-angle density by writing \(1/\mathrm{sr}\) next to it.

### Small-angle stand-in

\[
\Omega(\alpha)\approx\pi\alpha^2,
\qquad
\Omega_\perp(\alpha)\approx\pi\alpha^2
\qquad(\alpha\text{ in radians}).
\]

\(\Omega\) and \(\Omega_\perp\) at \(5^\circ\) and \(15^\circ\), and \(\Omega\) at \(3.600^\circ\), are from the metrics. \(\Omega_\perp\) at \(3.600^\circ\) and the \(\pi\alpha^2\) column are that closed form, evaluated. They are not extra rows of the metrics file.

| \(\alpha\) | \(\Omega\) [sr] | \(\Omega_\perp\) [sr] | \(\pi\alpha^2\) [sr] |
|---|---|---|---|
| \(3.600^\circ\) (IS-note key) | **0.012398431** | 0.012386198 | 0.012402511 |
| \(5.000^\circ\) (A) | **0.023909417** | **0.023863926** | 0.023924596 |
| \(15.000^\circ\) (B) | **0.214094348** | **0.210446804** | 0.215321366 |

Each entry is close to its neighbors. The ratio of the stand-in is exactly \((15/5)^2=9\). The identity is

\[
\frac{\Omega_B}{\Omega_A}=8.954394,
\qquad
\frac{E_B}{E_A}=\frac{\Omega_{\perp B}}{\Omega_{\perp A}}=8.818616.
\]

\(E\) tracks \(\Omega_\perp\). `E_over_omega_ratio` **0.984837** is the quotient of those two printed ratios, \((\Omega_{\perp B}/\Omega_B)/(\Omega_{\perp A}/\Omega_A)=\cos^2(7.5^\circ)/\cos^2(2.5^\circ)\). The absolute foreshortening at B alone is \(\Omega_{\perp B}/\Omega_B=\mathbf{0.982963}\).

Fairness, gated:

\[
L_i^{\mathrm{A}}=L_i^{\mathrm{B}},
\qquad
e^{\mathrm{A}}=e^{\mathrm{B}},
\qquad
\rho^{\mathrm{A}}=\rho^{\mathrm{B}}.
\]

Only \(\Omega\) or the cosine changes between the photographs. The disk spectrum is one RGB triple, \((12.0,\,13.2,\,16.0)\), Rec.709 luma \(Y=13.147\), exposure \(e=1.00\). The brightness change on the size plate is the lesson.

---

## Unique artifacts

The grid plate is the measure drawn as a mesh. Twelve equal steps of \(\cos\theta\) from 1 to 0, twenty-four equal steps of \(\phi\). Every cell has solid angle

\[
\Delta\Omega=\Delta\phi\,\Delta\cos\theta=\frac{2\pi}{24}\cdot\frac{1}{12}=\frac{\pi}{144}\,\mathrm{sr}.
\]

The sky cap is a spherical polygon of half-angle \(15^\circ\) (cap B), laid on that mesh. It is not a lat-long texture, and it is not however many quads the checkerboard painted. The boundary cuts cells; \(\Omega\) is the cap integral. The lower caption rounds cap B to \(\Omega=0.214094\,\mathrm{sr}\), \(\Omega_\perp=0.210447\,\mathrm{sr}\), prints the IS-key **0.012398431**, and states `d omega = d phi d(cos theta)`. The ninth digit lives in the metrics: **0.214094348** and **0.210446804**. Upper line: *the measure, not a latlong unwrap.*

The wedge plate is the same cap in side view, \(5^\circ\) above and \(15^\circ\) below. Left: the polar segment on the sphere, cone rays drawn, unprojected \(\Omega\). Right: the foreshortened disk of radius \(\sin\alpha\), area \(\Omega_\perp\) on the unit sphere. At \(5^\circ\) the disk is a speck and \(\Omega_\perp/\Omega=\mathbf{0.998097}\). At \(15^\circ\) the disk is readable and the ratio is **0.982963**. Lower caption: *at 5 deg they almost agree; at 15 deg the article appears.* The row labels print \(\Omega\) to nine digits and the ratio to six; quote the metrics, not a re-read of the JPEG.

| \(\alpha\) | \(\Omega\) [sr] | \(\Omega_\perp\) [sr] | \(\Omega_\perp/\Omega\) |
|---|---|---|---|
| \(5^\circ\) | 0.023909417 | 0.023863926 | 0.998097 |
| \(15^\circ\) | 0.214094348 | 0.210446804 | 0.982963 |

The identity plot plots irradiance against \(\Omega_\perp\), out to \(0.85\,\mathrm{sr}\) so the axis covers \(\Omega_\perp(30^\circ)=\pi/4\). Cyan is \(E=L_{iY}\Omega_\perp\), the disk row. Gold is that plus named fill on the projected complement,

\[
E_{\mathrm{gold}}=L_{iY}\,\Omega_\perp+L_{\mathrm{fill},Y}\bigl(\pi-\Omega_\perp\bigr).
\]

The vertical gap is \(L_{\mathrm{fill},Y}(\pi-\Omega_\perp)\). It narrows as the cap grows. Red is the Failure-B ghost \(L_{iY}\,\Omega(\alpha)\), plotted at \(x=\Omega_\perp(\alpha)\). Its gap above cyan is \(L_{iY}(\Omega-\Omega_\perp)\). At \(5^\circ\) that gap is invisible on this axis. At \(15^\circ\) the metrics already carry it: \(\Omega_\perp/\Omega=\mathbf{0.982963}\). At the \(30^\circ\) rung, an analytic mark on this plot and not a second metrics family,

\[
\Omega(30^\circ)=0.841787214\,\mathrm{sr},
\qquad
\Omega_\perp(30^\circ)=\pi/4=0.785398163\,\mathrm{sr}.
\]

Circles mark the ladder \(8^\circ/20^\circ/30^\circ\). Squares are the cosine-\(\Omega_\perp\) arm at \(N=256\), at A and at B only, mapped back by \(E=L_{oY}\,\pi/\rho\). The estimator’s reference includes fill, so the squares target **gold**, the total irradiance. A square on the red ghost would mean the cosine had been dropped from the weight. A square read against cyan alone ignores the fill the estimator was asked to integrate. `rel_err` in the metrics is how far the underlying \(L_o\) sits from `Lo_analytic`, not a pixel reading of this JPEG.

These three plates are the fingerprints. The courtyard stills do not replace them.

---

## Size A/B

The size plate is the photograph of Failure A. Identical \(L_i\), identical \(e=1.00\), identical \(\rho=0.80\), identical camera. The two RGB triples compare equal.

From the metrics, disk cap, untilted card:

| | A \(5^\circ\) | B \(15^\circ\) | B/A |
|---|---|---|---|
| \(\Omega\) [sr] | 0.023909417 | 0.214094348 | **8.954394** |
| \(\Omega_\perp\) [sr] | 0.023863926 | 0.210446804 | **8.818616** |
| \(E\) (disk, \(L_{iY}\Omega_\perp\)) | 0.313739973 | 2.766752422 | **8.818616** |
| \((\alpha_B/\alpha_A)^2\) | — | — | **9.000000** (rejected) |

The same-\(R\) pair under Failure A is the area hook: \(R=1\), \(d\in\{2,4\}\), \(\Omega\in\{0.663334,\,0.187600\}\,\mathrm{sr}\), ratio **3.536**.

The stored footprints are **910** and **7242**, and they are not a ratio to set beside 8.954394 or 8.818616. Failure C: different frames, both tagged illegal as steradians. The lower caption of the size plate already prints the irradiance ratio.

Fill is named: `Li_fill` \(=(0.0600,\,0.0660,\,0.0800)\), \(Y=0.065735\), disk/fill \(Y\)-ratio **200**. At \(\alpha=5^\circ\) that dim hemisphere is the same order as the disk term inside `Lo_analytic_A_Y` **0.132081911**, because \(\Omega_{\perp A}\) is small. At \(\alpha=15^\circ\) the disk dominates: `E_analytic_B` **2.766752422**, `Lo_analytic_B_Y` **0.753613234**. The ratio **8.818616** is the disk-cap identity. Interreflect is not in it. Walls exist so the courtyard reads.

---

## Cosine tilt, then the \(N\) ladder

The cosine plate moves \((n\cdot\omega)\) and leaves the disk alone. \(\alpha=15.000^\circ\) fixed in world. \(L_i\), exposure, and \(\rho=0.80\) frozen. Left \(\beta=0\), \(n=+Y\), \(\Omega_\perp=\mathbf{0.210446804}\). Right \(\beta=60^\circ\). Small-source caption: \(\cos 60^\circ=\mathbf{0.500}\). The analytic row is the cap integral

\[
\Omega_\perp(\alpha,\beta)=\int_{\mathrm{cap}}(n\cdot\omega)_+\,d\omega=\mathbf{0.105223414}.
\]

Half of \(\Omega_{\perp B}\) is \(0.105223402\). The cap stays above the horizon (\(\beta+\alpha=75^\circ<90^\circ\)), and the two numbers meet inside the gated tolerance \(5\times 10^{-4}\). The caption is 0.5. The meter is the integral **0.105223414**. The Monte Carlo ladder below is the untilted card. Do not “fix” the dark card by raising \(L_i\).

The MC-\(N\) plate estimates the rendering equation at the card center, \(\alpha=15^\circ\), \(n=+Y\). Two arms, one \(\xi\) stream per sample index, nested prefixes: \(N=16\) is the head of \(N=64\), which is the head of \(N=256\), which is the head of \(N=1024\). The published value is a mean over a small card-center neighborhood of independent streams. Reference is `Lo_analytic_B` (disk + fill), \(Y=\mathbf{0.753613234}\). `rel_err` is \(|Y(\hat L_o)-Y(L_o)|/Y(L_o)\) on that mean. It is not a single-pixel lottery and not the importance-sampling note’s \(\mathrm{RMSE}_H\).

From the metrics (\(\alpha=15^\circ\) ladder):

| \(N\) | unif \(L_{oY}\) | unif `rel_err` | cos \(L_{oY}\) | cos `rel_err` |
|---|---|---|---|---|
| 16 | 0.638092875 | **0.153288654** | 0.625904322 | **0.169462141** |
| 64 | 0.766444683 | **0.017026571** | 0.740971565 | **0.016774743** |
| 256 | 0.770062149 | **0.021826733** | 0.771251976 | **0.023405564** |
| 1024 | 0.758612514 | **0.006633748** | 0.761155903 | **0.010008675** |

The thumbnails label the cosine arm at display rounding (`0.1695`, `0.0168`, `0.0234`, `0.0100`). Those four decimals are not the quote. The metrics are.

\(N=256\) **bumps** against \(N=64\) on both arms (unif \(0.017026571\rightarrow 0.021826733\); cos \(0.016774743\rightarrow 0.023405564\)). The rise is on the MC plate, between the second and third markers, on both traces. One seed, nested prefixes, not a theorem that every rung is monotone. The gate is the nested fall to 1024: `rel_err` at \(N=1024\) is below \(N=16\) and below \(N=64\) on both arms. Which arm sits closer changes with the rung. That trade is not a sampler ranking. A flat error out to 1024 would be a broken weight or a broken \(p\).

Uniform-\(\Omega\) at \(\alpha=5^\circ\) is a high-variance instrument. The cap is a small fraction of \(2\pi\). Card-center A at \(N=256\), from the metrics: unif `rel_err` **0.054307110**, cos **0.059173158**. The fall gate uses the \(\alpha=15^\circ\) ladder.

---

## Quote the metrics. Do not quote the beauty photographs as meters.

Float buffer, Mesa llvmpipe. \(\Omega\), \(\Omega_\perp\), \(E\), \(L_o\), `rel_err` from linear Rec.709, before Neutral. Seed **1352782172**. Hash = pcg. TM = Khronos PBR Neutral (not re-fit), \(e=1.00\).

| item | value |
|---|---|
| \(\alpha_A\) / \(\alpha_B\) | **5.000°** / **15.000°** |
| \(\Omega_A\) / \(\Omega_B\) | **0.023909417** / **0.214094348** sr |
| \(\Omega_{\perp A}\) / \(\Omega_{\perp B}\) | **0.023863926** / **0.210446804** sr |
| \(\Omega_B/\Omega_A\) | **8.954394** |
| \(E_A\) / \(E_B\) (disk) | **0.313739973** / **2.766752422** |
| \(E_B/E_A\) | **8.818616** |
| `E_over_omega_ratio` | **0.984837** |
| `naive_alpha_sq_ratio` | **9.000000** (rejected) |
| same-\(R\) \(\Omega(d=2)\) / \(\Omega(d=4)\) | **0.663334** / **0.187600** sr |
| same-\(R\) \(\Omega\) ratio | **3.536** |
| hemisphere / sphere | **6.283185307** / **12.566370614** sr |
| \(L_i\) RGB A and B | **(12.0, 13.2, 16.0)** bit-identical |
| \(L_{iY}\) | **13.147** |
| \(L_{\mathrm{fill}}\) RGB / \(Y\) | **(0.0600, 0.0660, 0.0800)** / **0.065735** |
| disk/fill \(Y\) ratio | **200.000** |
| exposure / \(\rho\) / \(n\) | **1.00** / **0.80** / \(+Y\) |
| `Lo_analytic_A_Y` / `Lo_analytic_B_Y` | **0.132081911** / **0.753613234** (disk + fill) |
| \(\Omega_\perp(15^\circ,60^\circ)\) / \(\cos 60^\circ\) | **0.105223414** / **0.500** |
| `pixels_disk_A` / `pixels_disk_B` | **910** / **7242** (`omega_from_pixels_illegal`) |
| IS-key \(3.600^\circ\) | **0.012398431** sr (header; cited) |
| seed / hash | **1352782172** / pcg |

The \(\alpha=15^\circ\) Monte Carlo ladder is the table in the previous section. Card-center A at \(N=256\) is only in the metrics: unif \(L_{oY}\) **0.139254898**, cos \(L_{oY}\) **0.139897615**, `rel_err` **0.054307110** / **0.059173158**.

Hero line: \(E_B/E_A\) **8.818616**; same-\(R\) **3.536**; IS-key \(\Omega\) **0.012398431**; \(L_{iY}\) **13.147**; fill \(Y\)-ratio **200**; seed **1352782172**; **28 pass / 0 fail**. Do not invent \(\Omega\) or \(E\) from the hero, the size plate, or the cosine plate. The metrics strip is a snapshot of this table. The source of quoted numbers is the float-buffer metrics.

---

## Controls

Three knobs. Everything else stays put.

### Size (\(\Omega\))

Locked A/B: \(\alpha\in\{5.000^\circ,15.000^\circ\}\), on-axis from the card center, one disk radiance. Ladder rungs on the identity plot only: \(8^\circ\), \(20^\circ\), \(30^\circ\). Same-\(R\) area control is a caption on the size plate and a row in the metrics, not a reshoot.

### Cosine (\(\beta\))

Locked: \(\alpha=15.000^\circ\) disk fixed in world, card normal at \(\beta\in\{0^\circ,60^\circ\}\). The analytic row is the cap integral, written next to \(\cos 60^\circ=0.500\).

### MC-\(N\)

Locked ladder \(N\in\{16,64,256,1024\}\) at the untilted card center. Uniform-\(\Omega^+\) and cosine-\(\Omega_\perp\), same \(\xi\), nested prefixes. Hero quote is the \(\alpha=15^\circ\) fall to 1024. \(N=256\) may sit above \(N=64\).

Frozen on every plate:

- Camera, card albedo, wall and floor albedo, fill radiance, disk RGB, exposure \(e=1.00\), Neutral constants inherited from the tone-mapping note, one seed.
- Display: RGBA32F \(\to\) Neutral \(\to\) sRGB OETF on CPU. `GL_FRAMEBUFFER_SRGB` off.
- No auto-exposure. No per-plate gain.
- Fill named. Disk / fill luminance ratio **200**.
- \(\Omega\) from the cap formula. The white shape in the opening is a drawn disk. Triangle count does not define the steradian.

The fairness gate is bit-identical \(L_i\) on A and B. Only \(\alpha\) or \(\beta\) changes. Darkening A by lowering \(L_i\) so the JPEGs read as a pair fails the note.

---

## Two paths, do not mix the instruments

| path | frames | what it is |
|---|---|---|
| **Photograph** | `00`, `01`, `02` | GLSL 330 courtyard on this llvmpipe. Disk form factor in the shader. Neutral \(e=1.00\), sRGB OETF. |
| **Instrument** | `03`, `04`, `05`, `06`, `07`, metrics | Equal-\(\Omega\) grid, \(E\)–\(\Omega_\perp\) plot, projected wedge, nested MC `rel_err`, closed forms. |
| **Display** | every plate | \(e=1.00\) \(\to\) Neutral \(\to\) sRGB OETF. Resolve is linear. The operator is inherited. |

The size plate is a photograph of the control and the source of the teaching. The number 8.818616 is the metrics.

---

## Honesty gaps

1. **Beauty shading, including the card, is a disk form factor in GLSL.** The meter is the card-center analytic identity and the CPU estimator. The JPEG is a picture of the courtyard.
2. **Fill \(Y\)-ratio is 200.** At \(\alpha=5^\circ\) the fill term is the same order as the disk term inside `Lo_analytic_A_Y` **0.132081911**. At \(\alpha=15^\circ\) the disk dominates `Lo_analytic_B_Y` **0.753613234**. The ratio **8.818616** is disk-only.
3. **Tilt.** \(\Omega_\perp(15^\circ,60^\circ)=\mathbf{0.105223414}\). Half of \(\Omega_{\perp B}\) is \(0.105223402\). They meet inside \(5\times 10^{-4}\). The caption is \(\cos 60^\circ=0.500\). The cap stays above the horizon. The \(N\) ladder is untilted.
4. **Interreflect is not in the A/B identity.** Walls exist so the courtyard reads.
5. **`pixels_disk` is a luma threshold on the linear frame**, before Neutral, aimed at the drawn disk. **910** is the \(628\times 720\), \(\alpha=5^\circ\) panel. **7242** is the \(1280\times 720\) hero. Not a matched pair. Not a steradian. A \(5^\circ\) cap is 0.023909417 sr either way.
6. **Uniform-\(\Omega\) at \(\alpha=5^\circ\) is high variance.** The fall gate is the nested \(\alpha=15^\circ\) ladder.
7. **\(N=256\) bumps versus \(N=64\)** on both arms. The traces on the MC plate show it. The gate is nested fall to 1024, both arms, below \(N=16\) and below \(N=64\).
8. **`rel_err` is a nested neighborhood mean**, not a single pixel and not \(\mathrm{RMSE}_H\). Thumbnails show the cosine arm. The metrics hold both arms. HUD rounding on the thumbnails is not the quote.
9. **JPEG is 8-bit display-referred.** Neutral + OETF allocates codes. \(\Omega\), \(E\), \(L_o\), and `rel_err` live in the float buffer and in the metrics.
10. **Neutral constants are copied** from the tone-mapping note. Not re-fit. Energy after Neutral is not a claim.
11. **Analytic disk.** Not a captured EXR. Not a directional delta, which would replace the cap with a Dirac and erase the steradian plate. The drawn opening does not define \(\Omega\) by tessellation.
12. **The two MC arms are instruments of one integral.** Closer `rel_err` changes with \(N\). Cite the importance-sampling note for pdf–integrand mismatch. Cite the IBL note for Karis / DFG. Env mean luma **1.628** stays there.
13. **A \(9\times\) irradiance jump at \(5^\circ\) versus \(15^\circ\) is the rejected stand-in.** The identity is **8.818616**. A same-\(R\) ratio of 4 is the rejected inverse-square in distance. The identity is **3.536**.

---

## Mesa / llvmpipe — what this run can claim

| item | value |
|---|---|
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| OSMesa | core 3.3 request; driver reports 4.5 core |
| FBO color | **RGBA32F** complete, \(1280\times 720\). 8-bit fallback not hit |
| `GL_FRAMEBUFFER_SRGB` | disabled (Neutral + sRGB OETF on CPU) |
| MSAA | disabled |
| RNG | PCG hash, seed **1352782172** (`0x50A1D15C`) |
| Neutral \(e\) | **1.00** |
| disk / fill | analytic cap + named dim hemisphere, \(Y\)-ratio **200** |
| estimator | uniform-\(\Omega\) \| cosine-\(\Omega_\perp\) \| analytic-cap |

**Can claim:** on this OSMesa / llvmpipe build, an analytic sky cap of published \(\alpha\) over a Lambert card, same \(L_i\), produces an irradiance and a one-bounce \(L_o\) that track \(\Omega_\perp=\pi\sin^2\alpha\). The hemisphere grid, the \(E\)–\(\Omega_\perp\) plot, and the projected wedge are diagrams of that identity. A fixed-\(N\) estimator of the rendering equation at the card center reports the numbers in the metrics.

**Cannot claim:** hardware RT, a real-time budget, or interactive 1-spp. That uniform or cosine is the production sampler. Energy after Neutral. Anything measured off the JPEG. A captured sky. Interreflect inside the A/B ratio. A pixel footprint as a steradian. A \(9\times\) irradiance jump at \(5^\circ\) versus \(15^\circ\) as confirmation. A same-\(R\) ratio of 4 as confirmation.

---

## Assertions

This run: **28 pass / 0 fail**.

| check | result |
|---|---|
| FBO is RGBA32F | PASS |
| \(\Omega_A=0.023909417\), \(\Omega_B=0.214094348\) | PASS |
| \(\Omega_{\perp A}=0.023863926\), \(\Omega_{\perp B}=0.210446804\) | PASS |
| \(\Omega_B/\Omega_A=8.954394\) | PASS |
| \(E_B/E_A=8.818616\), and outside \(9\) | PASS |
| naive \((15/5)^2=9\), labeled | PASS |
| same-\(R\) \(\Omega\) ratio \(=3.536\), and outside \(4\) | PASS |
| \(L_{iY}=13.147\); disk/fill \(Y\) \(\ge 100\) | PASS **200** |
| \(L_i\) RGB bit-identical A/B | PASS |
| MC \(\alpha=15^\circ\): `rel_err` at \(N=1024\) below \(N=16\) and below \(N=64\), both arms | PASS |
| \(\Omega_\perp(15^\circ,60^\circ)\) within \(5\times 10^{-4}\) of \(\Omega_\perp\cos 60^\circ\) | PASS **0.105223414** |
| hero, size, grid, \(E\) vs \(\Omega_\perp\), wedge, metrics plates | PASS |
| `pixels_disk_B>20`, `pixels_disk_A>0` | PASS **7242** / **910** |

No tolerance was opened to accept \(E_B/E_A=9\) or a same-\(R\) ratio of 4.

---

## Out of scope

Phong-versus-cosine as a second bake-off, MIS balance heuristics, GGX VNDF, Smith \(G\), the half-vector Jacobian. Cite the [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) note for pdf–integrand mismatch. Split-sum, Karis prefilter, DFG LUT, the loft HDR — cite the [IBL](/posts/p/split-sum-image-based-lighting/) note. Tone-map bake-off — Neutral is inherited at \(e=1.00\); cite the [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) note. A full path tracer: multi-bounce GI, next-event estimation as a sampling arm, Russian roulette, spectral transport, participating media. Real-time path tracing, hardware RT, DLSS / SVGF / OIDN / ReSTIR. Area-light LTC as the production method — the wedge is a diagram of \(\Omega\) against \(\Omega_\perp\). A directional delta, IES profiles, Hosek–Wilkie / Preetham as the disk. Microfacet metals and the banned still-life (lacquer, brass, oak, bottle glaze). Shadow maps, POM, anisotropic footprints, mip LOD, TAA. Different notes.

---

## Measure lock

```text
Omega(alpha)       = 2 pi (1 - cos alpha)
Omega_perp(alpha)  = pi sin^2(alpha)
E_disk             = Li_Y * Omega_perp
Lo_disk            = rho * Li * sin^2(alpha)
Lo_analytic        = Lo_disk + rho * L_fill * (1 - sin^2(alpha))
E_B / E_A          = 8.818616     # (15/5)^2 = 9 is the rejected stand-in
sameR Omega ratio  = 3.536        # R=1, d=2/4, area=pi; 4 is rejected
IS-key 3.600 deg   -> Omega = 0.012398431 sr   # cited, not rematched
hat Lo             = (1/N) sum  f_r Li (n·w) / p(w)
p_unif             = 1/(2 pi) on Omega^+      # cos theta = xi_1
p_cos              = (n·w) / pi               # cos theta = sqrt(xi_1)
PNG                = sRGB_OETF( Neutral(e * Lo) )    # e=1.00, inherited
```

Pin the hero as the presentation. Pin the size A/B plate as the teaching pair. Pin the grid, \(E\) vs \(\Omega_\perp\), and wedge as the fingerprints. Pin the MC-\(N\) plate as the estimator. Path tracers sample \(d\omega\). Irradiance tracks \(\Omega_\perp\). The previous note’s densities were already in \(1/\mathrm{sr}\). This note drew the steradian.
