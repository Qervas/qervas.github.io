---
title: "Light Sampling and the Area Jacobian"
description: "Vertical softbox on a night inspection bench. Ω⊥=0.419598441342 sr; (Ec-E)/E=-0.194936551657; jacobian_ratio 37.5654619429."
date: 2026-09-25
tags:
  - graphics
  - engine
  - lighting
math: true
cover: /assets/journal/light-sampling-and-the-area-jacobian/00_hero.jpg
---

光采样与面积雅可比

The last note, [Solid Angle and the Rendering Equation](/posts/p/solid-angle-and-the-rendering-equation/), owned the measure. Path tracers sample \(d\omega\). Irradiance and the rendering equation track \(\Omega_\perp\). Area was the wrong closed form for a disk. This note draws uniform area on a **rectangle** and converts.

A legal light sample is an area density pushed onto \(d\omega\). An estimator that drops \(r^2\) or the emitter cosine is **biased**. The error does not fall with \(N\).

\[
p(\omega)=p(A)\,\frac{\lVert x-y\rVert^2}{n_y\cdot\omega},\qquad d\omega=\frac{(n_y\cdot\omega)}{r^2}\,dA.
\]

The [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) note (*Importance Sampling: Phong Lobe vs Cosine*) kept two BSDF densities on one integral, both already in \(1/\mathrm{sr}\). Its key was a finite disk of angular radius \(3.600^\circ\). The solid angle of that disk, which that note did not need as a light sample, is

\[
\Omega(3.600^\circ)=0.012398431\,\mathrm{sr}.
\]

Cited here. Phong against cosine stays in that note. The disk irradiance comparison stays in the solid-angle note.

![Night inspection bench. Vertical rectangular softbox, the diffuser in frame and the light. Matte bench, white Lambert card, vise for scale, dark closed shop. Legal rectangle lighting plus named shop fill, Khronos PBR Neutral e=1.00, after an 8× linear box. Photograph only — the meter is not this frame.](/assets/journal/light-sampling-and-the-area-jacobian/00_hero.jpg)

A new photographic family: a **night inspection bench**. A vertical rectangular softbox on a stand, the diffuser in frame and the light. A matte bench. A white Lambert card. A matte vise for scale. A dark closed shop. The loft bottle, the metro colonnade, the gallery lacquer sphere, and the courtyard atrium stay in their own notes.

The card is the instrument. Uniform draws on the diffuser are a density per square meter. The rendering equation still integrates incoming radiance in steradians. \(p(A)\) is a legal area density. It is \(p(\omega)\) only after the factor above.

![Teaching pin. Equal-Ω occupancy of the panel footprint on the receiver hemisphere. Left, area-uniform. Right, the same count drawn uniform in Ω and kept on the diffuser. μ=cos θ, azimuth φ, cell 2π/512 sr. Orange curve is the footprint. White edge is the interior mask: 35 cells, area occupancy 86..952 beside uniform-Ω 314..400. Each chart uses its own color max.](/assets/journal/light-sampling-and-the-area-jacobian/01_bins.jpg)

**Pin this.** Equal-\(\Omega\) occupancy of the panel footprint. Left, area-uniform connects. Right, the same count of directions drawn uniform in \(\Omega\) and kept only when they hit the diffuser. The white edge marks the interior mask. The orange curve is the footprint. Axes are \(\mu=\cos\theta\) and azimuth \(\phi\). Cell solid angle \(2\pi/512\,\mathrm{sr}\). Interior **35** cells. Area occupancy **86..952**. Uniform-in-\(\Omega\) occupancy **314..400**.

Hero, Mesa 25.0.7 llvmpipe, linear Rec.709, **Khronos PBR Neutral** \(e=\mathbf{1.00}\), seed **20260924**: \(\Omega_\perp=\mathbf{0.419598441342}\,\mathrm{sr}\), \(E_Y=\mathbf{1.67839376537}\), \((E_c-E)/E=\mathbf{-0.194936551657}\). The centroid plate rounds that relative to **-0.195**. Legal RMSE across \(K=32\) shared prefixes falls \(0.1644\to 0.1089\to 0.06826\to 0.02638\) at \(N=16/64/256/1024\). The exact tokens are `rmse_legal_N16` **0.164412278931**, `rmse_legal_N64` **0.108928582911**, `rmse_legal_N256` **0.0682573241753**, `rmse_legal_N1024` **0.0263804488107**. Failure A, drop \(r^2\), floors at `mean_rel_drop_r2_N1024` \(=\mathbf{-0.645746690189}\). Failure B, drop the emitter cosine, floors at `mean_rel_drop_cos_N1024` \(=\mathbf{+1.04013072615}\). Jacobian ratio **37.5654619429**. Panel over fill **22.069** (`panel_over_fill` **22.0690362063**). \(r_{\max}/r_{\min}\) **3.349** (`r_ratio` **3.3491112796**). \(L_i=(4,4,4)\), \(\rho=0.80\), \(A=0.448\,\mathrm{m}^2\). Assertions **72 pass / 0 fail**.

The cover and the shop frames on the centroid plate are drawn at **8×** and box-averaged in linear light to \(1280\times 720\) before that Neutral encode. The occupancy chart, the bias chart, and the metrics strip are authored sRGB. They are not supersampled.

---

## What you are seeing

Working space is **scene-referred linear Rec.709**. One shop, one rectangle, one Lambert card. Display on the photographs is inherited from the [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) note: Khronos PBR Neutral, \(e=1.00\), \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\), then the IEC 61966-2-1 sRGB OETF on the CPU. Neutral assigns code values. It does not author \(E\).

**Cover — presentation.** Night bench, softbox in frame, white card, vise, legal rectangle lighting plus the named shop fill. No HUD. Photo only. The meter is not this JPEG.

**Occupancy — teaching pin.** Already on the page. Equal-\(\Omega\) cells. Area-uniform beside uniform-in-\(\Omega\). The interior mask is the comparison.

**Bias chart — the floors.** Relative RMSE, \(K=32\), \(N\) on a log axis, RMSE linear. Legal falls. Drop \(r^2\) and drop cosine sit still. Signed means at \(N=1024\) are printed under the chart. The broken weights are this chart. They are not a room.

**Centroid plate — Failure C.** Upper band: legal and centroid full frames, same eye, gold boxes on the card. The type is `CENTROID_SIGNED_REL` **-0.195**, with `(EC-E)/E = -0.194937` and `FROM THIS RUN`. Lower band: a card-and-bench crop of each, headers `Y 0.446` and `Y 0.362`, and a linear \(|\mathrm{legal}-\mathrm{centroid}|\) heat of that crop. The heat is Rec.709 \(Y\) from the float buffers before Neutral. The card is the bright end of the ramp.

**Metrics strip — snapshot.** A picture of this run’s table, set in two columns. The table in the text is the quote. A clipped glyph on the strip loses to that table.

Two facts, kept apart:

1. **Photographs** (the cover, and the framed shop on the centroid plate) are the GLSL room on this llvmpipe, Neutral, then sRGB. The shader shades the shop with a rectangle form factor. \(\Omega_\perp\), \(E\), and a relative error are not readings of the JPEG.
2. **Instruments** (the occupancy chart, the bias chart, the heat on the centroid plate, the metrics strip, and the table below) are the float identities, the occupancy counts, and the CPU estimator. Quote the table.

---

## Three failures

Radiance \(L_i\) is constant on the diffuser and zero on its back face. Irradiance at the card is that radiance times a geometry term. The legal term carries both foreshortenings and \(1/r^2\). Three ways to throw the term away. The first two are Monte Carlo arms on shared samples. The third is an analytic stand-in at the same point.

**Failure A — drop \(r^2\).** Keep both cosines and \(p(A)\). Omit \(1/r^2\). The sample mean converges to \(\int L_i\,\cos_x\,\cos_y\,dA\), which is a different integral, and the weight picks up an extra \(\mathrm{m}^2\). On this seed the \(N=1024\) mean sits at **-0.645746690189** relative to \(E_Y\). The near edge is where \(1/r^2\) is large, so dropping it comes out low. That arm lives on the bias chart.

**Failure B — drop the emitter cosine.** Keep \(1/r^2\), the receiver cosine, and \(p(A)\). Omit \(\cos_y\). The limit is \(\int L_i\,\cos_x/r^2\,dA\). \(\cos_y\) lives in the change of measure. Constant \(L_i\) is already the emitter’s radiance, so \(\cos_y\) is not a second Lambert lobe painted on the panel. The weight is still dimensionally an irradiance, and it is still the wrong irradiance. The \(N=1024\) mean sits at **+1.04013072615** relative to \(E_Y\). High, and a different floor from Failure A. That arm lives on the bias chart.

**Failure C — centroid stand-in.** Replace the integral by the geometry term at the diffuser centroid: one \(r\), one pair of cosines, the same area, the same \(L_i\). That is the point-light reading of a rectangle. The card sits nearer the panel’s near lower edge than its center, and off the panel’s \(z=0\) line, so the shortcut and the four-corner sum separate. \((E_c-E)/E=\mathbf{-0.194936551657}\). The plate prints **-0.195**. This arm is analytic. It has no \(N\). It is the centroid plate.

The receiver cosine \(\cos_x\) stays inside every arm, including the two broken ones and the double-count below. Taking it out is the missing projected factor already metered in the solid-angle note.

A fourth arm counts \(\cos_y\) twice. Constant radiance already carries the emitter. The extra cosine is a dimensionless bug, and it pulls the mean low: `mean_rel_double_N1024` \(=\mathbf{-0.458986283232}\). It is in the metrics table only. It has no frame. It never enters Neutral.

Failures A and B are not beauty photographs. A unit-wrong weight, once Neutral and sRGB have compressed it, is a JPEG that can be misread as irradiance. The same rule as fireflies on the importance-sampling cover: the record of a broken weight is a chart of the float error. That chart is the bias plate. The centroid stand-in is dimensionally an irradiance, so it is on the centroid plate, and only there.

---

## Change of measure

Write the symbols once. Later sections use these names.

| symbol | meaning | unit |
|---|---|---|
| \(x\) | instrument point on the card, \((0.280,\,0.908,\,-0.200)\) | \(\mathrm{m}\) |
| \(y\) | sample point on the diffuser | \(\mathrm{m}\) |
| \(y_c\) | diffuser centroid, \((0,\,1.50,\,0)\) | \(\mathrm{m}\) |
| \(r\) | \(\lVert y-x\rVert\) | \(\mathrm{m}\) |
| \(\omega_i\) | \((y-x)/r\), from the card toward the panel | unitless |
| \(n_x\) | card normal, \(+Y\) | unitless |
| \(n_y\) | diffuser outward normal, \(+X\) | unitless |
| \(\cos_x\) | \(n_x\cdot\omega_i\) | unitless |
| \(\cos_y\) | \(n_y\cdot(x-y)/r\) | unitless |
| \((n_x\cdot\omega)\) | means \(\cos_x\) in the opening formula | |
| \((n_y\cdot\omega)\) | means \(\cos_y\) in the opening formula | |
| \(A\) | diffuser area, \(0.448\) | \(\mathrm{m}^2\) |
| \(p(A)\) | \(1/A\) on the diffuser, else \(0\) | \(\mathrm{m}^{-2}\) |
| \(L_i\) | constant one-sided radiance, \((4,4,4)\) | linear Rec.709 |
| \(L_{\mathrm{fill}}\) | shop fill on the rest of the hemisphere, \((0.025,\,0.028,\,0.036)\) | linear Rec.709 |
| \(\rho\) | card albedo, \(0.80\) | unitless |
| \(E\) | irradiance at \(x\) from the diffuser alone | \(L\cdot\mathrm{sr}\) |
| \(L_o\) | outgoing radiance of the Lambert card, \(\rho E/\pi\) | linear Rec.709 |

The two cosines are two foreshortenings. \(\cos_x\) uses the direction from the card toward the emitter. \(\cos_y\) uses the direction from the emitter toward the card. One shared \(\omega\) dotted into both normals flips a sign. On this panel, at this card, both cosines are positive at every corner and at every legal sample. The printed minima are \(\min\cos_y=\mathbf{0.246253045359}\) and \(\min\cos_x=\mathbf{0.326568395956}\).

The diffuser is the plane \(x=0\), \(y\in[1.10,\,1.90]\), \(z\in[-0.28,\,0.28]\). Width \(0.56\,\mathrm{m}\), height \(0.80\,\mathrm{m}\), \(A=0.448\,\mathrm{m}^2\). One-sided. Sampling does not depend on the contour order:

\[
y=(0,\;1.10+v\cdot 0.80,\;-0.28+u\cdot 0.56),\qquad u,v\in[0,1).
\]

Change of measure, panel in the front half-space:

\[
d\omega=\frac{\cos_y}{r^2}\,dA,\qquad
p(\omega)=p(A)\,\frac{r^2}{\cos_y}.
\]

Irradiance at the card from constant \(L_i\), one bounce, unoccluded, fill excluded from the arms:

\[
E
=
\int_{\mathrm{panel}} L_i\,\cos_x\,d\omega
=
\int_{A} L_i\,\frac{\cos_x\,\cos_y}{r^2}\,dA.
\]

Lambert card, \(L_e=0\), \(f_r=\rho/\pi\):

\[
L_o=\frac{\rho}{\pi}\,E.
\]

Ground truth is the projected solid angle of the planar rectangle times \(L_i\). Signed four-corner sum:

\[
\Omega_\perp(x)
=
\frac12\sum_{i=0}^{3}
\gamma_i\,(n_x\cdot\hat\nu_i),
\qquad
\gamma_i=\arccos(\hat r_i\cdot\hat r_{i+1}),
\qquad
\hat\nu_i=\mathrm{normalize}(\hat r_i\times\hat r_{i+1}),
\qquad
r_i=v_i-x.
\]

\[
E=L_i\,\Omega_\perp.
\]

Vertex order is part of the sign. The loop that makes \(\Omega_\perp>0\) at the instrument runs

| | \(x\) | \(y\) | \(z\) |
|---|---|---|---|
| \(v_0\) | 0 | 1.90 | +0.28 |
| \(v_1\) | 0 | 1.90 | -0.28 |
| \(v_2\) | 0 | 1.10 | -0.28 |
| \(v_3\) | 0 | 1.10 | +0.28 |

The sum is signed. An absolute value that hides a reversed card normal fails the check. This run prints \(\Omega_\perp=\mathbf{0.419598441342}\,\mathrm{sr}\) and \(E_Y=\mathbf{1.67839376537}\). \(L_i\) is achromatic, so the three channels of \(E\) match: each is **1.67839376537**.

**Arms.** One sample \(y\sim p(A)\). The same \(y\) feeds every arm. \(p(A)=1/A\).

\[
\begin{aligned}
w_{\mathrm{legal}}
&=
L_i\,\frac{\cos_x\,\cos_y}{r^2\,p(A)}
=
L_i\,\cos_x\,\cos_y\,\frac{A}{r^2},
\\
w_{r^2}
&=
L_i\,\cos_x\,\cos_y\,A,
\\
w_{\cos}
&=
L_i\,\cos_x\,\frac{A}{r^2},
\\
w_{\mathrm{dbl}}
&=
L_i\,\cos_x\,\cos_y\,\cos_y\,\frac{A}{r^2}.
\end{aligned}
\]

\[
\widehat E
=
\frac1N\sum_{k=1}^{N} w(y_k).
\]

\(w_{\mathrm{legal}}\) is \(L_i\cos_x/p(\omega)\): the integrand over the density that was sampled. \(w_{r^2}\) is Failure A. \(w_{\cos}\) is Failure B. \(w_{\mathrm{dbl}}\) is the double-count. \(\cos_x\) is inside all four.

**Centroid**, analytic, same \(L_i\) and the same area:

\[
E_c
=
L_i\,A\,\frac{\cos_x(y_c)\,\cos_y(y_c)}{r_c^2},
\qquad
r_c=\lVert y_c-x\rVert.
\]

This run: \(E_{c,Y}=\mathbf{1.35121347243}\).

**Fill** at the instrument, panel inside the front hemisphere:

\[
E_{\mathrm{fill}}=L_{\mathrm{fill}}\,(\pi-\Omega_\perp),
\qquad
E_{\mathrm{total}}=E+E_{\mathrm{fill}}.
\]

The arms estimate \(E\), the diffuser term. They do not estimate \(E_{\mathrm{total}}\). Folding fill into the broken weights would pin the floor to the shop ambient. Printed fill: \(L_{\mathrm{fill},Y}=\mathbf{0.0279398000}\), \(E_{\mathrm{fill},Y}=\mathbf{0.0760519738914}\), \(E_Y/E_{\mathrm{fill},Y}=\mathbf{22.0690362063}\). Card outgoing, panel alone, \(L_{o,Y}=\mathbf{0.427399462741}\). Panel plus fill, \(L_{o,Y}=\mathbf{0.446765938864}\).

Jacobian of the measure, used as geometry:

\[
\frac{d\omega}{dA}=\frac{\cos_y}{r^2}.
\]

On this plane \(\cos_y=\Delta x/r\) with \(\Delta x=0.280\,\mathrm{m}\) fixed, so the ratio of the extrema is \((r_{\max}/r_{\min})^3\). The run prints \(r_{\max}/r_{\min}=\mathbf{3.3491112796}\), \((d\omega/dA)_{\max}=\mathbf{7.15512954475}\,\mathrm{m}^{-2}\), \((d\omega/dA)_{\min}=\mathbf{0.190470958553}\,\mathrm{m}^{-2}\), ratio **37.5654619429**. The near lower edge is the high end. The far corner is the low end. Distance runs from \(r_{\min}=\mathbf{0.339505522783}\,\mathrm{m}\) to \(r_{\max}=\mathbf{1.13704177584}\,\mathrm{m}\).

The estimator draws \(K=32\) independent streams from seed **20260924**, SplitMix64, each of length 1024. The estimate at \(N\in\{16,64,256,1024\}\) is the mean of the prefix of length \(N\). One generator, four prefixes, four weights. Stream 0 opens at \(u_0=\mathbf{0.0549755345579}\), \(v_0=\mathbf{0.190148106104}\). The draws are IID in area. Stratification would change the variance and would be a different note.

Error is on Rec.709 \(Y\), against the closed form:

\[
\mathrm{rel}_k(N)=\frac{\widehat E_{k,Y}(N)-E_Y}{E_Y},
\qquad
\mathrm{mean\_rel}(N)=\frac1K\sum_k\mathrm{rel}_k(N),
\qquad
\mathrm{rmse}(N)=\sqrt{\frac1K\sum_k\mathrm{rel}_k(N)^2}.
\]

The bias chart plots \(\mathrm{rmse}(N)\). The signed mean of the legal arm is the wrong curve to call the fall. At \(N=1024\) that mean is \(+\mathbf{0.00775270607151}\), small beside the legal RMSE.

---

## Equal-\(\Omega\) histogram

The occupancy plate is the figure this note exists to draw. Receiver hemisphere about \(n_x\). \(\mu=\cos\theta=n_x\cdot\omega_i\). Azimuth \(\phi\) wrapped to \([0,2\pi)\). Sixteen equal steps of \(\mu\), thirty-two equal steps of \(\phi\):

\[
\Delta\omega=\frac{2\pi}{16\cdot 32}=\frac{2\pi}{512}\,\mathrm{sr}.
\]

That is the solid-angle note’s grid, equal \(\Delta\phi\) and equal \(\Delta\cos\theta\), redrawn here at \(16\times 32\) so this footprint has interior cells to count. The sky-cap solid angles of that note stay there.

Two series, \(N_{\mathrm{hist}}=16384\) each, neither of them an estimator prefix. Series A places 16384 area-uniform points on the diffuser and bins \(\omega_i\). Series B draws \(\mu=U\), \(\phi=2\pi U\), rejects until the ray from \(x\) hits the diffuser, and stops at 16384 accepts. A cell is interior when all four \((\mu,\phi)\) corners hit the diffuser. Partial cells are drawn. The quoted extrema ignore them. The plate’s white edge is that mask. This run: **35** interior cells, area occupancy **86..952**, uniform-\(\Omega\) occupancy **314..400**.

The near lower edge is the high end of \(d\omega/dA\). An equal-\(\Omega\) cell there covers little diffuser area, so an area-uniform draw leaves it thin, and the legal weight

\[
w_{\mathrm{legal}}=L_i\,\cos_x\,A\,\frac{d\omega}{dA}
\]

is large on each hit that does land. The far corner is the low end of the Jacobian: more area per steradian, more area-uniform hits per cell, a smaller weight on each hit. Across the interior mask the area-uniform counts run from 86 to 952. The same cells, filled uniformly in \(\Omega\), run from 314 to 400. Each chart is colored by its own maximum, which is why the right-hand interior reads as one field and the left-hand interior does not. Boundary cells look lumpy because the polygon cuts them. That lump is not the Jacobian. The interior mask is the comparison.

The weight is large where the panel is near because \(r\) is small there, \(\cos_y/r^2\) swings by **37.5654619429** across this rectangle, and the estimator that forgets that factor converges to the wrong irradiance.

---

## Bias floors

![Bias chart. K=32 relative RMSE, N on a log axis. Gold legal falls from N=16 to N=1024. Red drop-r² and blue drop-cosine sit on floors. Signed means under the chart: legal +0.007753, drop r² -0.645747, drop cosine +1.040131. The broken weights are this chart, not a photograph of the shop.](/assets/journal/light-sampling-and-the-area-jacobian/02_bias.jpg)

The bias plate is the meter. Gold, legal. Red, drop \(r^2\). Blue, drop cosine. \(K=32\) shared prefixes. The double-count arm is not on the chart.

Exact relative RMSE from this run:

| \(N\) | legal | drop \(r^2\) | drop \(\cos_y\) |
|---|---|---|---|
| 16 | **0.164412278931** | 0.646465572668 | 1.05231399133 |
| 64 | **0.108928582911** | 0.644735526234 | 1.06914370379 |
| 256 | **0.0682573241753** | 0.645666437568 | 1.05028736473 |
| 1024 | **0.0263804488107** | 0.645750980439 | 1.04059885976 |

Those legal entries are `rmse_legal_N16`, `rmse_legal_N64`, `rmse_legal_N256`, `rmse_legal_N1024`. Legal RMSE falls at every rung. The opening rounds that column to \(0.1644\to 0.1089\to 0.06826\to 0.02638\). The printed \(N=64\) value over the printed \(N=1024\) value is about **4.13**. That quotient is not its own key.

The omission columns stay on the scale of the bias. Drop \(r^2\) stays near 0.646 from the first rung to the last. Drop cosine stays between 1.04059885976 and 1.06914370379. A small drift in those columns is still a floor: the signed means are the floors, and they are large next to the legal noise at \(N=1024\).

| arm | `mean_rel` at \(N=1024\) |
|---|---|
| legal | \(+\mathbf{0.00775270607151}\) |
| drop \(r^2\) | \(\mathbf{-0.645746690189}\) |
| drop \(\cos_y\) | \(\mathbf{+1.04013072615}\) |
| double-count \(\cos_y\) | \(\mathbf{-0.458986283232}\) |

The chart prints those first three means at six decimals: legal \(+0.007753\), drop \(r^2\) \(-0.645747\), drop cosine \(+1.040131\). Six-digit rounding of the table. The table is the quote.

The Jacobian on this panel spans **37.5654619429**. One nested prefix of length 1024 can wiggle while the estimator is right. The locked meter is the RMSE over \(K=32\) prefixes. A single walk is not asserted monotone. The plate draws that RMSE. The legal signed mean at \(N=1024\) stays small beside it.

Double-count RMSE, metrics only, same prefixes: 0.476232581495, 0.452992595682, 0.45710934368, 0.459388011928. The signed means at the four \(N\) are -0.459580193104, -0.445824837954, -0.454300420772, -0.458986283232. No frame. Never Neutral.

---

## Centroid plate

![Failure C. Same eye: legal rectangle form factor beside the centroid stand-in. Gold boxes mark the card. Callout -0.195, (Ec-E)/E = -0.194937 from this run. Crops print linear Y 0.446 legal and Y 0.362 centroid. The third panel is linear |ΔY| of that crop before Neutral; the ramp is marked 0.115 and the card is the bright end.](/assets/journal/light-sampling-and-the-area-jacobian/03_centroid.jpg)

The centroid plate is where Failure C is readable. The full frames hide the card. A gold box marks the crop; the lower row opens it.

Both shop frames share the eye \((1.70,\,1.45,\,0.70)\), the target \((0.10,\,1.40,\,-0.02)\), the \(46^\circ\) vertical field, \(L_i\), the shop fill, \(\rho=0.80\), exposure \(1.00\), and Neutral \(e=1.00\). Legal shading uses \(L_i\,\Omega_\perp\). Centroid shading uses \(E_c\) at the shaded point, same fill rule. No per-half gain.

The callout is this run’s centroid relative. Large type **-0.195**. Under it, `(EC-E)/E = -0.194937`. The metrics token is **-0.194936551657**. \(E_c\) is about a fifth low. A few percent does not describe it.

The crop headers print the instrument pixel’s linear Rec.709 \(Y\) from the float buffers, before Neutral: legal **0.446**, centroid **0.362**. The analytic card with panel plus fill is `Lo_total_Y` **0.446765938864**. The legal header and that analytic card meet at the plate’s three digits. The centroid pixel has no finer key in the metrics table. The third panel is linear \(|\Delta Y|\) on that same crop, also before Neutral. The ramp tops at about **0.115**, and the card is the bright end. Bench pixels move too. The card is the instrument the caption is about.

The full-frame pair can look like one photograph at a glance. The heat is the disagreement. Broken arms A and B are still not in either half.

The small-angle limit, where the centroid term and the contour agree, is a separate check. Fixture S prints \(\Omega_\perp=\mathbf{0.000399946674132}\,\mathrm{sr}\). Fixture M prints \(\Omega_\perp=\mathbf{0.752274688454}\,\mathrm{sr}\), the rectangle where a single differential term has left the contour. The card is in that second regime. The hero gate requires \(|(E_c-E)/E|\ge 0.10\). This run clears it at 0.194936551657. Agreement on the small fixture and disagreement on the card are both required. The small-angle stand-in is the limit the solid-angle note already refused as a meter.

---

## Quote the metrics. Do not quote the beauty photographs as meters.

CPU double, before Neutral. Seed **20260924**. Beauty display is Khronos PBR Neutral, \(e=1.00\), not re-fit. The RMSE ladder is the table in the previous section; the same tokens are repeated here so this sheet stands alone.

| item | value |
|---|---|
| seed / \(K\) / \(N\) | **20260924** / **32** / **16, 64, 256, 1024** |
| \(N_{\mathrm{hist}}\) / \(n_\mu\) / \(n_\phi\) | **16384** / **16** / **32** |
| \(u_0\) / \(v_0\) | **0.0549755345579** / **0.190148106104** |
| \(L_i\) RGB / \(Y\) | **(4, 4, 4)** / **4** |
| \(L_{\mathrm{fill}}\) RGB / \(Y\) | **(0.025, 0.028, 0.036)** / **0.0279398000** |
| \(\rho\) / exposure / Neutral | **0.80** / **1.00** / \(e=1.00\), \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\) |
| instrument | **(0.280, 0.908, -0.200)** |
| panel \(y\) / \(z\) / \(A\) | **[1.10, 1.90]** / **[-0.28, 0.28]** / **0.448 m²** |
| \(\Omega_\perp\) | **0.419598441342 sr** |
| \(E_Y\) / \(E\) RGB | **1.67839376537** / three channels **1.67839376537** |
| \(E_{c,Y}\) | **1.35121347243** |
| \((E_c-E)/E\) | **-0.194936551657** |
| \(r_{\min}\) / \(r_{\max}\) / `r_ratio` | **0.339505522783** / **1.13704177584** / **3.3491112796** |
| \(\min\cos_y\) / \(\min\cos_x\) | **0.246253045359** / **0.326568395956** |
| \((d\omega/dA)_{\max}\) / min / `jacobian_ratio` | **7.15512954475** / **0.190470958553** / **37.5654619429** |
| \(E_{\mathrm{fill},Y}\) / `panel_over_fill` | **0.0760519738914** / **22.0690362063** |
| \(L_{o,Y}\) panel / panel+fill | **0.427399462741** / **0.446765938864** |
| `rmse_legal_N16` / `N64` / `N256` / `N1024` | **0.164412278931** / **0.108928582911** / **0.0682573241753** / **0.0263804488107** |
| `mean_rel_legal_N1024` | **0.00775270607151** |
| drop-\(r^2\) RMSE \(16/64/256/1024\) | **0.646465572668** / **0.644735526234** / **0.645666437568** / **0.645750980439** |
| `mean_rel_drop_r2_N1024` | **-0.645746690189** |
| drop-\(\cos_y\) RMSE \(16/64/256/1024\) | **1.05231399133** / **1.06914370379** / **1.05028736473** / **1.04059885976** |
| `mean_rel_drop_cos_N1024` | **1.04013072615** |
| double `mean_rel` \(16/64/256/1024\) | **-0.459580193104** / **-0.445824837954** / **-0.454300420772** / **-0.458986283232** |
| double RMSE \(16/64/256/1024\) | **0.476232581495** / **0.452992595682** / **0.45710934368** / **0.459388011928** |
| interior cells | **35** |
| area occupancy min / max | **86** / **952** |
| uniform-\(\Omega\) occupancy min / max | **314** / **400** |
| fixture S / fixture M \(\Omega_\perp\) | **0.000399946674132** / **0.752274688454 sr** |
| asserts | **72 pass / 0 fail** |

![Metrics strip. A two-column picture of this run’s table: seed 20260924, Ω⊥, EY, centroid relative, Jacobian ratio, RMSE ladder, omission floors, histogram counts, 72 pass / 0 fail. Quote the table in the text. Not a cover.](/assets/journal/light-sampling-and-the-area-jacobian/04_metrics.jpg)

Plate rounding, for the eye only. The bias chart’s six-decimal means: \(+0.007753\), \(-0.645747\), \(+1.040131\). Centroid callout: **-0.195** and `-0.194937`. Crop headers: legal **0.446**, centroid **0.362**. Heat peak about **0.115**. Opening RMSE: \(0.1644\), \(0.1089\), \(0.06826\), \(0.02638\). Opening panel/fill **22.069**. Opening distance ratio **3.349**. None of those shortenings replaces the table.

The instrument-pixel headers are float-buffer luma on the photograph. `Lo_total_Y` is the analytic card. Quote the table for \(E\), \(\Omega_\perp\), and the floors. The strip is a picture of that table.

---

## Honesty gaps

1. **The meter is the CPU double contour and the shared-sample estimator.** The four-corner evaluation in the photograph is float32. The metrics table is not read off a JPEG. Hero float max is 4, the emitter, unclamped.
2. **Failures A and B never pass through Neutral onto a beauty plate.** They are the curves on the bias chart and the rows in the table. The centroid stand-in is the only shortcut that is an image, and only on the centroid plate. The double-count arm has no frame and never enters Neutral.
3. **The softbox edge under Neutral, after the 8× box.** MSAA is off. The photographs are an RGBA32F target at 8×, \(10240\times 5760\), then an 8×8 linear box down to \(1280\times 720\), then exposure and Neutral. An 8× box leaves about a one-eighth coverage fringe where the vertical emitter edge crosses a sample column. Bench and vise edges sit in the linear range and take the box filter directly. The occupancy chart, the bias chart, and the metrics strip are not supersampled.
4. **A shading point that fails the four-corner front test contributes no panel term.** Partial polygons are dropped, not clipped. Horizon pixels can be darker than a clipped rectangle would have been. The instrument passes the front test, so the meter is unaffected.
5. **Shop surfaces behind the diffuser, including the stand, receive fill only.** They do not separate from the unlit wall. That is the missing bounce. It is not a second practical. The corners of the cover are dark because nothing interreflects.
6. **The vise casts no shadow.** The integral is unoccluded. The vise is scale.
7. **Neutral at exposure 1.00 assigns code values.** It does not author \(E\). Constants are the tone-mapping note’s, not re-fit. Energy after Neutral is not a claim.
8. **The locked meter is RMSE over \(K=32\) prefixes.** One nested walk is not asserted monotone. A single prefix can wiggle while the weight is right.
9. **Panel over fill is this run’s 22.0690362063.** It is \(E_Y/E_{\mathrm{fill},Y}\) for the locked \(L_i\), the named fill, and this \(\Omega_\perp\). The atrium’s fill ratio stays in the solid-angle note.
10. **The omission floors are this seed’s measured means.** Drop \(r^2\) at -0.645746690189 and drop cosine at +1.04013072615. They are not one bug printed twice.
11. **Uniform area with the legal weight is the scalar Jacobian.** It is not a production light sampler, and it has not been compared with VNDF or env-MIS.
12. **The crop headers 0.446 and 0.362 are instrument-pixel linear \(Y\).** The heat peak is about 0.115, on the card, in linear \(|\Delta Y|\) before Neutral. Those three plate figures are not extra keys in the metrics table. The analytic panel-plus-fill card is `Lo_total_Y` 0.446765938864.
13. **The JPEG is 8-bit display-referred.** \(\Omega_\perp\), \(E\), RMSE, and the signed floors live in the float estimator and in the table above.

---

## Mesa / llvmpipe — what this run can claim

| item | value |
|---|---|
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| OSMesa | core 3.3 request |
| FBO color | **RGBA32F**, \(10240\times 5760\) (8× of \(1280\times 720\)) |
| Encode | \(1280\times 720\) after an 8×8 linear box, then Neutral, then sRGB OETF |
| `GL_FRAMEBUFFER_SRGB` | disabled |
| MSAA | disabled |
| SSAA | **8×** box on the cover and on the shop frames inside the centroid plate. `GL_MAX_TEXTURE_SIZE` 16384 |
| RNG | SplitMix64, seed **20260924**. Top 53 bits to \([0,1)\). Not a sin-hash |
| Neutral \(e\) | **1.00** |

**Can claim:** on this OSMesa / llvmpipe build, a CPU double estimator drew uniform area on one unoccluded rectangle, converted with the legal Jacobian, and the \(K=32\) RMSE of that estimator fell from \(N=16\) to \(N=1024\) against the four-corner \(E\). Two estimators that share those samples and drop \(r^2\) or \(\cos_y\) sat on the signed floors in the metrics table. An equal-\(\Omega\) histogram of the area samples is uneven across the panel footprint beside a uniform-in-\(\Omega\) draw of the same count. The centroid geometry term at the locked point differs from the four-corner \(E\) by -0.194936551657. The cover is a photograph of the legal form factor plus named shop fill, under Neutral \(e=1.00\), after an 8× linear box.

**Cannot claim:** a GPU, a wavefront, a ray-tracing core, or a frame-time budget. The room is one fragment shader. The meter never reads that shader’s outputs back as \(E\). Energy after Neutral. Anything measured by sampling the JPEG of the cover or the centroid plate. Interreflect. A shadow under the vise. That one prefix is monotone. That this weight has been ranked against VNDF or env-MIS. That the softbox silhouette is resolved past the 8× fringe above.

---

## Assertions

This run: **72 pass / 0 fail**.

The geometry checks ran before any draw. Signed \(\Omega_\perp\), \(E_Y\), the centroid ratio, both distance extrema, both minimum cosines, both Jacobian extrema, and the Jacobian ratio match the closed form of this scene. Minimum cosine on the panel is at least 0.20. \(r_{\max}/r_{\min}\) is at least 2. The card is 0.28 m off the diffuser plane, past 0.25 m, and the panel does not contain the shading point. The closest point of the rectangle lies on \(y=1.10\) and is nearer than the centroid. Every corner cosine is positive. Panel over fill is at least 10. \(L_i\) is achromatic. \(\rho=0.80\). Exposure is 1.00.

Fixture S matches its on-axis contour. Fixture M matches its contour, and the contour there has left the single differential term. The hero shortcut clears \(|(E_c-E)/E|\ge 0.10\).

Legal RMSE falls at all four rungs, and the \(N=64\) rung is at least twice the \(N=1024\) rung. Each omission mean at \(N=1024\) is large beside the legal RMSE, the two omission means differ, and each omission mean has stopped moving from \(N=256\) to \(N=1024\). The double-count row was written after those checks. The histogram interior holds 35 cells, with the area occupancy wider than the uniform-\(\Omega\) occupancy. \(E\) and the \(K\)-mean legal estimate at \(N=1024\) are achromatic. The five frames are \(1280\times 720\). The photographs on the cover and on the centroid plate are the Neutral outputs.

---

## Out of scope

Balance and power heuristics, a second light, and a Veach survey. The light density had to be on the page before a balance weight means anything. That is the sequel.

The half-vector Jacobian, Smith \(G\), and VNDF. Those continue the BSDF side of the [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) note. They do not continue this measure.

LTC, and polygonal solid-angle sampling as the product. The four-corner sum is the ground truth here. Clipping a partly visible rectangle is a different problem. Sampling proportional to the polygon’s solid angle is a different problem.

Phong against cosine, firefly counts, and the importance-sampling note’s \(\mathrm{RMSE}_H\). Disk irradiance ratios from the [solid-angle](/posts/p/solid-angle-and-the-rendering-equation/) note. A second practical, a shadow map, a vise shadow, multi-bounce, Russian roulette, ReSTIR. Stratified area samples as a claimed variance win. Reading \(E\) off a JPEG. A beauty plate of \(w_{r^2}\), \(w_{\cos}\), or \(w_{\mathrm{dbl}}\).

```text
d omega          = cos_y / r^2 * dA
p(omega)         = p(A) * r^2 / cos_y          # p(A) = 1/A
w_legal          = Li * cos_x * cos_y * A / r^2
w_drop_r2        = Li * cos_x * cos_y * A
w_drop_cos       = Li * cos_x * A / r^2
w_double         = Li * cos_x * cos_y^2 * A / r^2    # metrics only, no frame
E                = Li * Omega_perp                   # signed four-corner
Ec               = Li * A * cos_x(yc) * cos_y(yc) / rc^2
(Ec - E) / E     = -0.194936551657
Omega_perp       = 0.419598441342 sr
jacobian ratio   = 37.5654619429
mean_rel drop r  = -0.645746690189                  # N=1024, K=32
mean_rel drop cos= +1.04013072615
beauty           = sRGB_OETF(Neutral(e * Lo))       # e=1.00, after 8x linear box
```

Pin the cover as the presentation. Pin the occupancy plate as the teaching figure. Pin the bias chart as the floors. Pin the centroid plate as the callout. A legal light sample is an area density pushed onto \(d\omega\). Drop \(r^2\), or drop the emitter cosine, and the error stays.
