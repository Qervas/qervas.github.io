---
title: "Solid Angle and the Rendering Equation"
description: "Path tracers sample dω (sr). Irradiance and the RE track projected solid angle. Courtyard skylight and a Lambert card measure the gap."
hook: "Why a skylight overhead lights a room far more than the same window low on the wall."
date: 2026-09-22
tags:
  - graphics
  - engine
  - lighting
math: true
video:
  src: /assets/journal/solid-angle-and-the-rendering-equation/solid-angle-explainer.mp4
  poster: /assets/journal/solid-angle-and-the-rendering-equation/solid-angle-explainer-poster.jpg
  vtt: /assets/journal/solid-angle-and-the-rendering-equation/solid-angle-explainer.vtt
  caption: "Animated explainer: why a light's size is its projected solid angle"
cover: /assets/journal/solid-angle-and-the-rendering-equation/00_hero.jpg
---

Our previous note addressed a common Monte Carlo sampling mismatch: evaluating the same integral using two different probability density functions at a single sample count, \(N\). Those pdfs were properly defined as densities measured in \(1/\mathrm{sr}\). Because split-sum approximations fold an environment into a GGX prefilter multiplied by a DFG LUT, they leave the measure implicit inside the integral (yielding an environment solid-angle mean luma of **1.628** on that specific loft run). This note focuses directly on formalizing that measure.

Path tracers inherently sample \(d\omega\). Irradiance and the rendering equation, however, track the projected solid angle, \(\Omega_\perp\). A direction is simply a point on the hemisphere, weighted in steradians. Flux passing through a flat surface depends on this projected solid angle, defined mathematically as \(\Omega_\perp=\int(n\cdot\omega)\,d\omega\). Relying on source area, pixel counts, or manipulating \(L_i\) as an arbitrary brightness scalar are fundamentally incorrect approaches.

The core of our [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) discussion evaluated a finite disk with an angular radius of **3.600°**. The exact solid angle subtended by that disk—which the previous note omitted—is:

\[\Omega(3.600^\circ)=2\pi\bigl(1-\cos 3.600^\circ\bigr)=0.012398431\,\mathrm{sr}.\]

Evaluating a full-hemisphere pdf against a spherical cap this small demonstrates exactly why a cosine sample produces fireflies in a highlight. The detailed cosine-versus-Phong comparison remains in that earlier note.

![Presentation. Sunlit courtyard / skylight atrium: four walls, square skylight with jamb, matte limewash floor, low bench. Analytic sky disk α=15°, white Lambert card. Photograph only — do not hang EB/EA on this frame.](/assets/journal/solid-angle-and-the-rendering-equation/00_hero.jpg)

We introduce a new photographic family for this analysis: a sunlit courtyard and skylight atrium. This setup trades the dark oak and lacquer of previous scenes for four walls, a square skylight with a visible jamb, a matte limewash floor, and a single low bench for scale. An **analytic sky disk** sits in the opening—a spherical cap with a locked half-angle of \(\alpha=15^\circ\) and uniform radiance. On the floor below rests our primary instrument: a white Lambertian card (\(\rho=0.80\), normal \(n=+Y\), emission \(L_e=0\)). While the HUD accurately states `path tracers sample d omega  E tracks Omega_perp`, do not attempt to derive \(E_B/E_A\) visually from this photograph.

![Teaching pin. Same camera, same exposure, same Li. Left α=5° | right α=15°. Only Omega changes; brightness change IS the lesson. EB/EA=8.818616. Photograph only.](/assets/journal/solid-angle-and-the-rendering-equation/01_size.jpg)

**This is the core visual reference.** Both shots share the exact same camera, exposure, and incident radiance \(L_i\). The left side features \(\alpha=5^\circ\), while the right uses \(\alpha=15^\circ\). The right-hand card is visibly brighter because it integrates over more steradians. As the lower caption indicates, *only \(\Omega\) changes; this brightness difference is the primary lesson*. It yields an exact irradiance ratio of \(E_B/E_A = \mathbf{8.818616}\) under our same-\(R\) control. The fundamental takeaway: area is not \(\Omega\), and pixels are not steradians.

Evaluating the system on Mesa 25.0.7 llvmpipe (linear Rec.709, Khronos PBR Neutral with \(e=\mathbf{1.00}\), seed **1352782172**), we extract the ground-truth solid angles and irradiance metrics. The naive small-angle approximation of \((15/5)^2=9\) is strictly rejected; under a same-\(R\) area control, the true \(\Omega\) ratio is **3.536** (rather than 4). A suite of **28 pass / 0 fail** assertions confirms these bounds against the test harness.

| Setup | Solid Angle (\(\Omega\)) | Projected (\(\Omega_\perp\)) | Irradiance (\(E\)) Ratio |
| --- | --- | --- | --- |
| **Cap A** (\(\alpha=5^\circ\)) | **0.023909417** sr | **0.023863926** sr | Base |
| **Cap B** (\(\alpha=15^\circ\)) | **0.214094348** sr | **0.210446804** sr | \(E_B/E_A = \mathbf{8.818616}\) |
| **Ratio (B/A)** | **8.954394** | - | - |

The incident radiance \(L_i=(12.0,\,13.2,\,16.0)\) remains bit-identical between setups, producing a luminance \(L_{iY}=\mathbf{13.147}\) and a disk-to-fill \(Y\)-ratio of **200**.


## Scene
Our working color space is scene-referred linear Rec.709. The environment consists of one courtyard, one analytic cap, and one Lambertian card. Display parameters are inherited from previous work: the Khronos PBR Neutral operator evaluated at \(e=1.00\), followed by the IEC 61966-2-1 sRGB OETF applied on the CPU. We emphasize that the tone curve does not create lighting, and the Neutral operator does not author irradiance (\(E\)). We refer readers to the [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) and [split-sum IBL](/posts/p/split-sum-image-based-lighting/) notes for full display-pipeline context.

**Hero — presentation hook.** The atrium features the visible disk, white card, and low bench at \(\alpha=15^\circ\). This plate establishes the aesthetic baseline, but the final JPEG artifacts are not the measurement tool.

**Size A/B — teaching pin.** Comparing setups A and B, we maintain the exact same \(L_i\) and shared exposure across \(\alpha=5^\circ\) versus \(15^\circ\). Precision analysis must rely on the tabular metrics rather than visual perception.

![Failure B. Same α=15° disk fixed in world. Left card n=+Y, β=0 | right tilted β=60°. Li frozen. (n·ω) is geometry, not a brightness slider. Photograph only.](/assets/journal/solid-angle-and-the-rendering-equation/02_cosine.jpg)

**Cosine tilt — Failure B.** The \(\alpha=15^\circ\) disk remains fixed in world space. On the left, the Lambertian card is flat (\(n=+Y\), \(\beta=0^\circ\)). On the right, the card is tilted to \(\beta=60^\circ\) while incident radiance \(L_i\) remains frozen. The geometric projection \((n\cdot\omega)\) strictly governs this behavior; it cannot be treated as an artistic brightness slider.

![The measure. Unit hemisphere over the card. Equal-Ω cells, sky cap as a spherical polygon. Not a latlong unwrap.](/assets/journal/solid-angle-and-the-rendering-equation/03_grid.jpg)

**Grid — the measure.** A unit hemisphere is projected over the card and discretized into equal-\(\Omega\) cells. The sky cap is treated geometrically as a spherical polygon. This visualizes the true solid angle measure, avoiding the distortions of a lat-long unwrap.

![Identity. Irradiance vs Ω⊥. Cyan: disk E=LiY Ω⊥. Gold: disk plus named fill. Red ghost: LiY Ω, cosine missing. Squares: cosine-arm N=256.](/assets/journal/solid-angle-and-the-rendering-equation/04_E_vs_Omega.jpg)

**\(E\) vs \(\Omega_\perp\) — the identity.** The horizontal axis tracks \(\Omega_\perp\) in steradians. The cyan line plots the analytic disk irradiance \(E=L_{iY}\Omega_\perp\), while the gold line includes the disk alongside named ambient fill. The red ghost trace plots \(L_{iY}\Omega\), visually demonstrating the resulting error when the cosine term is incorrectly omitted. The square markers plot our cosine-arm estimator at \(N=256\), inverted through the Lambertian BRDF. The core mathematical identity is upheld: irradiance directly tracks projected solid angle.

![The article. Same cap twice, side view. Left: steradians on the sphere. Right: foreshortened patch. At 5° they almost agree; at 15° the article appears.](/assets/journal/solid-angle-and-the-rendering-equation/05_wedge.jpg)

**Wedge — the article.** We view the same spherical cap twice in profile. The left side visualizes steradians mapped on the unit sphere, whereas the right side shows the foreshortened patch. At a narrow \(5^\circ\), the two measures nearly agree; at \(15^\circ\), the mathematical divergence becomes highly pronounced.

![Estimator. Card center, α=15°, N=16/64/256/1024. Uniform-Ω (cyan) and cosine-Ω⊥ (gold), same ξ stream. Not an IS bake-off; rel_err must fall.](/assets/journal/solid-angle-and-the-rendering-equation/06_mc_n.jpg)

**MC-\(N\) — estimator of that integral.** Sampled at the card center using \(\alpha=15^\circ\), we evaluate the rendering equation at \(N=16\), \(64\), \(256\), and \(1024\) samples. The thumbnails depict the cosine-\(\Omega_\perp\) instrument. The plot tracks both uniform-\(\Omega\) (cyan) and cosine-\(\Omega_\perp\) (gold) integration using the same \(\xi\) random stream. This is not an importance-sampling performance comparison; the requirement is that `rel_err` reliably converges. Traces may oscillate at \(N=256\), but strict error reduction is gated at \(N=1024\).

![Instrument. Science plate of the float-buffer metrics. Quote the table, not the JPEG. Not a cover.](/assets/journal/solid-angle-and-the-rendering-equation/07_metrics.jpg)

**Metrics strip — the meter snapshot.** This is the science plate capturing the float-buffer measurements. Data must be quoted from the text table, not inferred from the JPEG.

Maintain a strict separation between these two artifact categories:

1. **Beauty plates** (`00`, `01`, `02`) represent the GLSL courtyard running on llvmpipe, mapped through Neutral and an sRGB OETF. The shader properly evaluates walls, floor, and the card using a disk form factor. Do not attempt to reverse-engineer \(\Omega\), \(E\), or \(L_o\) from these JPEGs.
2. **Instruments** (`03`, `04`, `05`, `06`, `07`, and the metrics block) represent exact float identities and the CPU estimator.

## Method

### The Rendering Equation Once
We formally state the integral and define all notation. Subsequent derivations rely upon this specific formulation.

\[L_o(x,\omega_o) = L_e(x,\omega_o) + \int_{\Omega^+} f_r(x,\omega,\omega_o)\, L_i(x,\omega)\, (n\cdot\omega)\, d\omega.\]

| Symbol | Definition | Units |
| --- | --- | --- |
| \(L_o\) | Outgoing radiance | \(\mathrm{W}\,\mathrm{m}^{-2}\,\mathrm{sr}^{-1}\) (linear Rec.709 RGB) |
| \(L_e\) | Emitted radiance | \(\mathrm{W}\,\mathrm{m}^{-2}\,\mathrm{sr}^{-1}\); **0** on the card and floor |
| \(L_i\) | Incident radiance | \(\mathrm{W}\,\mathrm{m}^{-2}\,\mathrm{sr}^{-1}\); piecewise-constant sky disk + fill |
| \(f_r\) | BSDF | \(\mathrm{sr}^{-1}\); Lambertian \(\rho/\pi\) |
| \(n\) | Geometric unit normal | Dimensionless |
| \(\omega\) | Incident direction vector | Unit vector, \(\omega\in S^2\) |
| \(\omega_o\) | Outgoing direction vector | Unit vector |
| \(\Omega^+\) | Hemisphere about \(n\) | \(\{\omega:n\cdot\omega>0\}\) |
| \(d\omega\) | Solid-angle measure | \(\mathrm{sr}\) |

A Monte Carlo path tracer evaluates this integral by drawing samples \(\omega\in\Omega^+\) and computing the estimator \(f_r L_i (n\cdot\omega)/p(\omega)\). While the implementation of such a tracer is beyond the scope of this note, we strictly focus on validating the radiometric measure represented by \(p\).

### \(d\omega\), Then Projected Solid Angle

Let \(\theta\) denote the polar angle measured from the normal \(n\), and \(\phi\) the azimuthal angle in the local tangent frame.

\[d\omega = \sin\theta\,d\theta\,d\phi = -\,d(\cos\theta)\,d\phi \qquad [\,\mathrm{sr}\,].\]

Grid visualization exploits this latter differential form: uniform intervals in \(\phi\) and \(\cos\theta\) subtend equal solid angles. To maintain a constant \(\Delta\cos\theta\), the necessary polar interval is \(\Delta\theta=\Delta\cos\theta/\sin\theta\). Consequently, uniform sampling partitions are broad near the pole and dense near the horizon. Thus, a latitude-longitude parameterization that is uniform in \(\theta\) produces visually isotropic texture cells but highly distorted \(d\omega\) elements that scale proportionally with \(\sin\theta\). Drawing uniform \(d\omega\) across \(\Omega^+\) necessitates generating samples via the inverse cumulative distribution functions \(\cos\theta=\xi_1\) and \(\phi=2\pi\xi_2\).

Integration over the full sphere yields \(\int_{S^2}d\omega=4\pi\), and over the hemisphere \(\int_{\Omega^+}d\omega=2\pi\). In our test framework, `sphere_sr` returns **12.566370614** and `hemisphere_sr` returns **6.283185307**. Note that neither evaluates to \(\pi\). The constant \(\pi\) applies exclusively to the *projected* hemisphere:

\[d\omega_\perp = (n\cdot\omega)\,d\omega = \cos\theta\,\sin\theta\,d\theta\,d\phi, \qquad \int_{\Omega^+}d\omega_\perp = \pi.\]

An environment emitting constant radiance \(L_i\) across all \(\Omega^+\) produces a total irradiance of \(E=L_i\pi\). Substituting the \(2\pi\) hemispherical scalar for a flat plate integration is radiometrically incorrect; the geometric attenuation must be integrated prior to BSDF evaluation.

The metric `E_analytic_*` tracks the scalar product of the Rec.709 luma \(L_i\) and \(\Omega_\perp\). Although axis labels may denote \(\mathrm{W}/\mathrm{m}^2\), the data represents this specific calculated radiometric quantity rather than a spectrally integrated pyranometer measurement.

### The Cap, Then One Bounce

For an on-axis spherical cap bounded by \(\theta\in[0,\alpha]\) and \(\phi\in[0,2\pi)\) with a uniform radiance \(L_i\), the solid angle and projected solid angle are:

\[\Omega(\alpha) = \int_0^{2\pi}\!\!d\phi\int_0^{\alpha}\sin\theta\,d\theta = 2\pi\bigl(1-\cos\alpha\bigr),\]

\[\Omega_\perp(\alpha) = \int_0^{2\pi}\!\!d\phi\int_0^{\alpha}\cos\theta\sin\theta\,d\theta = \pi\sin^2\alpha.\]

The expression for \(\Omega_\perp\) corresponds to the area of a disk of radius \(\sin\alpha\) projected onto the tangent plane, as depicted in the wedge plate diagrams. The ratio of these closed-form integrals yields a fundamental identity:

\[\frac{\Omega_\perp}{\Omega} = \frac{\sin^2\alpha}{2(1-\cos\alpha)} = \cos^2(\alpha/2),\]

derived using the half-angle identities \(1-\cos\alpha=2\sin^2(\alpha/2)\) and \(\sin\alpha=2\sin(\alpha/2)\cos(\alpha/2)\). Evaluating this quotient for our experimental configurations confirms the relationship: **0.998097** at \(5^\circ\) and **0.982963** at \(15^\circ\).

Calculating the single-bounce irradiance from this cap on an un-tilted Lambertian surface (assuming zero emission, \(L_e=0\)) produces:

\[E = L_i\,\Omega_\perp(\alpha) = L_i\,\pi\sin^2\alpha, \qquad L_o^{\mathrm{disk}} = \frac{\rho}{\pi}\,E = \rho\,L_i\sin^2\alpha.\]

The Lambertian BRDF term \(\rho/\pi\) is normalized per steradian, allowing the \(\pi\) in the projected solid angle to cancel appropriately. Evaluating this integral without the \((n\cdot\omega)\) factor but retaining \(\rho/\pi\) fundamentally misspecifies the radiometry (yielding the aforementioned red ghost artifact), as the resulting weight fails to convert radiance into irradiance.

Our environment includes a constant background fill applied over the remaining domain of \(\Omega^+\). This complement subtends a projected solid angle of \(\pi\cos^2\alpha\):

\[L_o = \rho\,L_i\sin^2\alpha + \rho\,L_{\mathrm{fill}}\bigl(1-\sin^2\alpha\bigr).\]

The variable `E_analytic_*` isolates the **disk** contribution (\(L_{iY}\,\Omega_\perp\)), whereas `Lo_analytic_*_Y` records the aggregated disk and fill contributions. Because the A/B irradiance identity applies solely to the disk, these metrics correspond to distinct integrals.

### Estimator of the Same Integral

Both uniform solid angle sampling and cosine-weighted sampling on \(\Omega^+\) represent statistically valid methodologies for estimating this integral, assuming identical sample counts \(N\) and random sequences \(\xi\). This analysis seeks to verify estimator correctness rather than compare variance (which is addressed in the [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) note).

\[\widehat{L}_o = \frac{1}{N} \sum_{k=1}^{N} \frac{f_r(\omega_k,\omega_o)\,L_i(\omega_k)\,(n\cdot\omega_k)}{p(\omega_k)}.\]

| Sampling Strategy on \(\Omega^+\) | Generator | PDF \(p(\omega)\) |
| --- | --- | --- |
| Uniform-\(\Omega\) | \(\cos\theta=\xi_1\), \(\phi=2\pi\xi_2\) | \(1/(2\pi)\) |
| Cosine-weighted \(\Omega_\perp\) | \(\cos\theta=\sqrt{\xi_1}\), \(\phi=2\pi\xi_2\) | \((n\cdot\omega)/\pi\) |

Under \(p_{\cos}\), the geometric term \((n\cdot\omega)\) cancels entirely from the estimator weight, reducing the contribution of each sample to either \(\rho L_i\) or \(\rho L_{\mathrm{fill}}\) depending on the ray intersection. Conversely, under \(p_{\mathrm{unif}}\), the cosine term is preserved in the evaluation weight: \((n\cdot\omega)/p_{\mathrm{unif}}=(n\cdot\omega)\,2\pi\). Both strategies are unbiased, provided the evaluating density correctly matches the generating distribution. Radiometrically, the BSDF \(f_r\) introduces one \(\mathrm{sr}^{-1}\) unit and \(p(\omega)\) introduces another, ensuring \(d\omega\) dimensional consistency. Defining a probability density based on pixel footprints or uniform polar angles without accounting for the solid-angle Jacobian fundamentally violates this requirement.

### Small-Angle Stand-In

For sufficiently small angles, the subtended geometry is commonly approximated as:

\[\Omega(\alpha)\approx\pi\alpha^2, \qquad \Omega_\perp(\alpha)\approx\pi\alpha^2 \qquad(\alpha\text{ in radians}).\]

The recorded \(\Omega\) and \(\Omega_\perp\) values for \(5^\circ\) and \(15^\circ\), alongside \(\Omega\) for \(3.600^\circ\), are extracted directly from empirical telemetry. The \(\Omega_\perp\) at \(3.600^\circ\) and the \(\pi\alpha^2\) approximations evaluate the closed-form expressions.

| \(\alpha\) | \(\Omega\) [sr] | \(\Omega_\perp\) [sr] | \(\pi\alpha^2\) [sr] |
| --- | --- | --- | --- |
| \(3.600^\circ\) (IS-note key) | **0.012398431** | 0.012386198 | 0.012402511 |
| \(5.000^\circ\) (A) | **0.023909417** | **0.023863926** | 0.023924596 |
| \(15.000^\circ\) (B) | **0.214094348** | **0.210446804** | 0.215321366 |

While each quantity closely tracks its neighbors, the naive ratio of the extremes yields exactly \((15/5)^2=9\). The rigorously measured experimental identities diverge slightly from this linear approximation:

\[\frac{\Omega_B}{\Omega_A}=8.954394, \qquad \frac{E_B}{E_A}=\frac{\Omega_{\perp B}}{\Omega_{\perp A}}=8.818616.\]

Because irradiance \(E\) strictly scales with \(\Omega_\perp\), the telemetry metric `E_over_omega_ratio` evaluates to **0.984837**, which mathematically corresponds to the quotient of these ratios: \((\Omega_{\perp B}/\Omega_B)/(\Omega_{\perp A}/\Omega_A)=\cos^2(7.5^\circ)/\cos^2(2.5^\circ)\). Furthermore, the absolute foreshortening explicitly calculated at configuration B is \(\Omega_{\perp B}/\Omega_B=\mathbf{0.982963}\).

The experimental framework ensures strict radiometric parity across test configurations:

\[L_i^{\mathrm{A}}=L_i^{\mathrm{B}}, \qquad e^{\mathrm{A}}=e^{\mathrm{B}}, \qquad \rho^{\mathrm{A}}=\rho^{\mathrm{B}}.\]

The only independent variables between frames are the solid angle \(\Omega\) and the applied cosine term. The emissive disk spectrum is fixed at an RGB vector of \((12.0,\,13.2,\,16.0)\), generating a Rec.709 luma of \(Y=13.147\) at an exposure of \(e=1.00\). Consequently, the observed variation in surface brightness isolates the exact radiometric impact of \(\Omega\).

### Unique Artifacts
The grid plate visually formalizes this solid angle measure as a 3D hemisphere, discretized into 12 uniform steps of \(\cos\theta\) (from 1 to 0) and 24 uniform steps of \(\phi\). This geometric construction guarantees that every individual cell subtends an identical solid angle:

\[\Delta\Omega=\Delta\phi\,\Delta\cos\theta=\frac{2\pi}{24}\cdot\frac{1}{12}=\frac{\pi}{144}\,\mathrm{sr}.\]

When the \(15^\circ\) half-angle sky cap B is projected onto this hemispherical mesh as a spherical polygon, it precisely bisects the grid cells rather than distorting into a standard latitude-longitude mapping. The evaluation of \(\Omega\) is an analytical integration over this continuous cap geometry. The plate caption presents truncated values of \(\Omega=0.214094\,\mathrm{sr}\) and \(\Omega_\perp=0.210447\,\mathrm{sr}\), alongside the importance-sampling reference key of **0.012398431**, and reiterates the fundamental differential relationship `d omega = d phi d(cos theta)`. The precise nine-decimal-place values are rigorously maintained within the telemetry block as **0.214094348** and **0.210446804**.

The wedge plate profiles this cap geometry from a cross-sectional perspective, contrasting the narrow \(5^\circ\) cap (top) against the wider \(15^\circ\) cap (bottom). The left column illustrates the unprojected solid angle \(\Omega\) via the polar spherical segment and bounding cone rays, whereas the right column visualizes the foreshortened disk representing \(\Omega_\perp\) on the tangent plane. For the narrow \(5^\circ\) configuration, foreshortening is virtually negligible, yielding a ratio \(\Omega_\perp/\Omega=\mathbf{0.998097}\). However, at \(15^\circ\), the structural deviation becomes radiometrically significant at **0.982963**.

| \(\alpha\) | \(\Omega\) [sr] | \(\Omega_\perp\) [sr] | \(\Omega_\perp/\Omega\) |
| --- | --- | --- | --- |
| \(5^\circ\) | 0.023909417 | 0.023863926 | 0.998097 |
| \(15^\circ\) | 0.214094348 | 0.210446804 | 0.982963 |

The identity plot charts surface irradiance \(E\) as a function of \(\Omega_\perp\), extending the domain to \(0.85\,\mathrm{sr}\) to safely bound \(\Omega_\perp(30^\circ)=\pi/4\). The cyan trajectory accurately models the pure disk irradiance \(E=L_{iY}\Omega_\perp\). The gold trajectory incorporates the constant fill radiance integrated across the remaining projected complement:

\[E_{\mathrm{gold}}=L_{iY}\,\Omega_\perp+L_{\mathrm{fill},Y}\bigl(\pi-\Omega_\perp\bigr).\]

As the primary cap solid angle expands, the corresponding vertical offset \(L_{\mathrm{fill},Y}(\pi-\Omega_\perp)\) naturally diminishes. The red ghost trajectory plots the erroneous Failure-B formulation \(L_{iY}\,\Omega(\alpha)\) against the \(\Omega_\perp\) domain, diverging from the correct irradiance by the quantity \(L_{iY}(\Omega-\Omega_\perp)\). While this deviation is visually imperceptible at \(5^\circ\), the discrepancy at \(15^\circ\) corresponds precisely with our established metric ratio \(\Omega_\perp/\Omega=\mathbf{0.982963}\). Evaluating these functions at the analytical boundary of \(30^\circ\) yields:

\[\Omega(30^\circ)=0.841787214\,\mathrm{sr}, \qquad \Omega_\perp(30^\circ)=\pi/4=0.785398163\,\mathrm{sr}.\]

The mapped squares track the convergence of the cosine-\(\Omega_\perp\) estimator at \(N=256\) samples for configurations A and B, referencing the total expected irradiance (gold line) via the Lambertian relationship \(E=L_{oY}\,\pi/\rho\). If an estimator coordinate were to align with the red ghost trajectory, it would indicate a flawed implementation omitting the required cosine weighting. If it were evaluated strictly against the cyan line, it would erroneously discard the fill radiance contribution. The `rel_err` parameter reported in the metrics exclusively quantifies the deviation of the estimated \(L_o\) from the rigorous analytical expectation, rather than any pixel-space discrepancy within the visualization.

These three structural analysis plates establish our fundamental mathematical baseline; the corresponding courtyard renders serve only as supplementary visual confirmations.

---

### Two Paths, Do Not Mix the Instruments
| Path | Frames | Description |
| --- | --- | --- |
| **Photograph** | `00`, `01`, `02` | GLSL 330 implementations of the courtyard scene executed on llvmpipe. The shader explicitly evaluates the analytical disk form factor. Final output incorporates Neutral tonemapping (\(e=1.00\)) and the sRGB OETF. |
| **Instrument** | `03`, `04`, `05`, `06`, `07`, metrics | Exact mathematical visualizations: the equal-\(\Omega\) solid angle grid, the \(E\) versus \(\Omega_\perp\) function plot, the projected solid angle wedge diagram, the nested Monte Carlo `rel_err` ladder, and closed-form derivations. |
| **Display** | Every plate | The linear buffer resolve enforces an exposure of \(e=1.00\) prior to the Neutral tonemapping and sRGB OETF. Tonemapping operators are applied statically. |

While the physical size plate provides an intuitive visual demonstration of the control variables, the mathematically rigorous irradiance ratio of 8.818616 is derived exclusively from the numerical metrics.

---

## Discussion

### Three Failures
Radiance \(L_i\) represents power per unit area per steradian. Irradiance on a surface is defined as radiance scaled by the **projected** solid angle of the source. Expanding a spherical cap while maintaining a constant \(L_i\) increases the incident irradiance, thereby brightening the receiving surface. Conversely, tilting the surface while holding both \(L_i\) and the cap geometry fixed decreases the irradiance, as the geometric attenuation term \((n\cdot\omega)\) changes. In neither scenario does the source radiance inherently increase.

**Failure A — Area Versus \(\Omega\).** This distinction is demonstrated in the size A/B experimental plate. The left configuration utilizes a half-angle of \(\alpha=5.000^\circ\) and the right \(\alpha=15.000^\circ\). Both setups maintain a constant source radiance of \(L_i=(12.0,\,13.2,\,16.0)\), an exposure of \(e=1.00\), and a surface albedo of \(\rho=0.80\). The right surface appears brighter strictly because the projected solid angle \(\Omega_\perp\) increases from **0.023863926** sr to **0.210446804** sr. Consequently, the observed disk irradiance ratio is \(E_B/E_A=\mathbf{8.818616}\). A naive quadratic approximation based solely on the angle ratio, \((15/5)^2=9\), is demonstrably inaccurate.

The plate caption further details an area-control experiment. For an on-axis disk of radius \(R\) at distance \(d\), the subtended half-angle is \(\alpha=\arctan(R/d)\), which yields the solid angle:

\[\Omega=2\pi\Bigl(1-\frac{d}{\sqrt{R^2+d^2}}\Bigr).\]

Evaluating this for \(R=1\) and an area of \(\pi\) across two distances:

| \(R\) | \(d\) | \(\alpha=\arctan(R/d)\) | Area | \(\Omega\) [sr] |
| --- | --- | --- | --- | --- |
| 1 | 2 | \(26.565^\circ\) | \(\pi\) | **0.663334** |
| 1 | 4 | \(14.036^\circ\) | \(\pi\) | **0.187600** |

Although the physical disk area remains constant in both configurations, the measured solid angle ratio is **3.536**. Applying a standard inverse-square law derived solely from distance would incorrectly predict a ratio of \((4/2)^2=4\). Uniformly scaling both \(R\) and \(d\) by a factor \(k\) preserves \(\Omega\) while scaling the physical area by \(k^2\). Therefore, equivalent area does not guarantee equivalent solid angle.

**Failure B — The Missing Cosine.** The cosine-tilt plate and the red ghost curve on the \(E\) versus \(\Omega_\perp\) plot illustrate the error of omitting the geometric term. Integrating \(L_i\,d\omega\) without the \((n\cdot\omega)\) factor incorrectly accumulates flux, effectively treating the receiving surface as a spherical probe rather than a flat plate. The rendering equation for an opaque surface explicitly requires this cosine term to account for the foreshortening of the incoming beam; it serves neither as an arbitrary brightness adjustment nor as a component of the BSDF. On the tilt plate, the right card correctly darkens at \(\beta=60^\circ\) despite \(L_i\) remaining constant. Artificially increasing \(L_i\) to offset this darkening would violate fundamental radiometric principles.

**Failure C — Pixels Versus Steradians.** Pixel coverage is merely a rasterized projection of the source, whereas the solid angle evaluated in the rendering equation is continuous and defined relative to the receiving surface. These quantities are decoupled. For example, the metric `pixels_disk_A` captures **910** pixels for a linear \(\alpha=5^\circ\) source evaluated at a \(628\times 720\) resolution. Conversely, `pixels_disk_B` records **7242** pixels for an \(\alpha=15^\circ\) source rendered at \(1280\times 720\). Both values are appropriately flagged as `omega_from_pixels_illegal`. Due to the disparities in frame size and aspect ratio, the ratio of these discrete pixel counts provides no rigorous estimate of \(\Omega_B/\Omega_A\). A \(5^\circ\) spherical cap subtends precisely \(\Omega=0.023909417\,\mathrm{sr}\), irrespective of its projected raster footprint.

The importance-sampling reference from our prior note demonstrates Failure A at a micro-scale: a **3.600^\circ** spherical cap subtends exactly **0.012398431** sr. A cosine-weighted probability density function distributes its mass across the entire hemisphere oriented around \(n\), not solely over this small restricted solid angle.

---

### Size A/B
The size plate provides a direct visualization of Failure A by maintaining constant parameters for source radiance \(L_i\), exposure \(e=1.00\), surface albedo \(\rho=0.80\), and camera configuration across both experimental shots.

Drawing from the untilted disk cap metrics:

|  | A (\(5^\circ\)) | B (\(15^\circ\)) | B/A Ratio |
| --- | --- | --- | --- |
| \(\Omega\) [sr] | 0.023909417 | 0.214094348 | **8.954394** |
| \(\Omega_\perp\) [sr] | 0.023863926 | 0.210446804 | **8.818616** |
| \(E\) (disk only, \(L_{iY}\Omega_\perp\)) | 0.313739973 | 2.766752422 | **8.818616** |
| \((\alpha_B/\alpha_A)^2\) | — | — | **9.000000** (Rejected approximation) |

Implementing the equivalent-\(R\) area control dictates a completely distinct scaling relationship: fixing the radius at \(R=1\) with variable distances \(d\in\{2,4\}\) yields solid angles of \(\Omega\in\{0.663334,\,0.187600\}\,\mathrm{sr}\), resulting in a solid angle ratio of **3.536**.

The captured pixel area metrics of **910** and **7242** are fundamentally invalid for solid angle evaluation. Because they are derived from different image resolutions and aspect ratios, utilizing them for direct radiometric comparison constitutes Failure C; hence, both values are explicitly flagged as `omega_from_pixels_illegal`. The mathematically sound comparison relies strictly on the established irradiance ratio.

Incorporating the dim hemispherical fill radiance (`Li_fill` \(=(0.0600,\,0.0660,\,0.0800)\), with luma \(Y=0.065735\)), the ratio of disk luma to fill luma is exactly **200**. Because \(\Omega_{\perp A}\) is exceedingly small at \(\alpha=5^\circ\), the integrated fill contribution remains on the same order of magnitude as the disk contribution within `Lo_analytic_A_Y` (**0.132081911**). However, at \(\alpha=15^\circ\), the primary disk radiance overwhelmingly dominates the integral: the pure disk irradiance `E_analytic_B` evaluates to **2.766752422**, whereas the combined analytical exitance `Lo_analytic_B_Y` is **0.753613234**. The derived ratio of **8.818616** applies exclusively to the pure disk irradiance calculation, devoid of secondary interreflection or fill.

---

### Cosine Tilt, Then the \(N\) Ladder
The cosine experimental plate isolates the effect of the \((n\cdot\omega)\) geometric term by tilting the receiving surface while fixing the \(\alpha=15.000^\circ\) disk geometry in world space. Source radiance \(L_i\), exposure, and surface albedo (\(\rho=0.80\)) remain strictly constant. The reference flat configuration (\(\beta=0^\circ\), normal aligned to \(+Y\)) yields a projected solid angle of \(\Omega_\perp=\mathbf{0.210446804}\). When the surface is tilted to \(\beta=60^\circ\), a theoretical small-source approximation suggests a scaling factor approaching \(\cos 60^\circ=\mathbf{0.500}\). The exact analytical integration over the cap geometry provides the rigorous value:

\[\Omega_\perp(\alpha,\beta)=\int_{\mathrm{cap}}(n\cdot\omega)_+\,d\omega=\mathbf{0.105223414}.\]

Notably, exactly half of the baseline \(\Omega_{\perp B}\) evaluates to \(0.105223402\). Because the entire cap remains safely elevated above the local horizon (\(\beta+\alpha=75^\circ<90^\circ\), avoiding truncation), these two theoretical models agree within our rigorous analytical tolerance of \(5\times 10^{-4}\). It is radiometrically invalid to compensate for this geometric attenuation by arbitrarily scaling the source radiance \(L_i\).

The Monte Carlo \(N\)-ladder plate explicitly evaluates the rendering equation at the center of the untilted surface (\(\alpha=15^\circ\), normal \(+Y\)). We execute both a uniform solid-angle sampling strategy and a cosine-weighted strategy using nested random sequences (e.g., the \(N=16\) sequence shares its initial terms with the \(N=64\) sequence, which in turn prefixes the \(N=256\) sequence, etc.). The reference target is the expected mean exitance `Lo_analytic_B` (\(Y=\mathbf{0.753613234}\)), calculated over a localized spatial neighborhood of independent random streams. The relative error metric `rel_err` quantifies the relative deviation \(\vert{}Y(\hat L_o)-Y(L_o)\vert{}/Y(L_o)\) of this neighborhood mean, avoiding the stochastic noise of single-pixel evaluations.

Referencing the explicit telemetry from the \(\alpha=15^\circ\) convergence ladder:

| \(N\) Samples | Uniform \(L_{oY}\) | Uniform `rel_err` | Cosine \(L_{oY}\) | Cosine `rel_err` |
| --- | --- | --- | --- | --- |
| 16 | 0.638092875 | **0.153288654** | 0.625904322 | **0.169462141** |
| 64 | 0.766444683 | **0.017026571** | 0.740971565 | **0.016774743** |
| 256 | 0.770062149 | **0.021826733** | 0.771251976 | **0.023405564** |
| 1024 | 0.758612514 | **0.006633748** | 0.761155903 | **0.010008675** |

The corresponding image thumbnails display the cosine estimator performance using localized display rounding (`0.1695`, `0.0168`, `0.0234`, `0.0100`). Always reference the exact telemetry metrics over these visual approximations for formal analysis.

Observe that transitioning from \(N=64\) to \(N=256\) yields a temporary increase in error across both sampling strategies (Uniform: \(0.017026571\rightarrow 0.021826733\); Cosine: \(0.016774743\rightarrow 0.023405564\)). Such non-monotonic convergence is expected behavior within fixed-seed nested sequences. The definitive validation of the estimators is demonstrated by the final error reduction at \(N=1024\), where both strategies successfully converge well below their respective \(N=16\) and \(N=64\) benchmarks. Variations in relative performance between the two strategies at intermediate sample counts reflect the specific stochastic distribution of the shared random sequences, rather than systemic flaws in the weighting functions or PDFs.

Executing uniform solid-angle sampling at the narrow \(\alpha=5^\circ\) configuration introduces significant variance, as the cap source occupies an extremely small fraction of the \(2\pi\) hemispherical domain. As documented in the telemetry at \(N=256\), the uniform `rel_err` rests at **0.054307110**, compared to the cosine-weighted `rel_err` at **0.059173158**. Because of this inherent variance issue at small angles, we designate the \(\alpha=15^\circ\) ladder as the definitive benchmark for estimator validation.

### What-if controls
The experimental design relies on the strict isolation of three independent variables.

### What if: Size (\(\Omega\))

The controlled A/B comparison manipulates the source half-angle \(\alpha\in\{5.000^\circ,15.000^\circ\}\) evaluated from the center of an on-axis card subject to a constant source radiance. The supplementary identity plot evaluates the analytical formulations at intermediate positions including \(8^\circ\), \(20^\circ\), and \(30^\circ\). The constant-\(R\) area control is included strictly as a computed theoretical metric and caption annotation, not as a rendered visual plate.

### What if: Cosine (\(\beta\))

Maintaining the \(\alpha=15.000^\circ\) spherical disk fixed in world space, we rotate the receiving surface normal to angles \(\beta\in\{0^\circ,60^\circ\}\). The corresponding analytical metric evaluates the explicit cap integration against the theoretical small-source approximation \(\cos 60^\circ=0.500\).

### What if: MC-\(N\)

We execute a deterministic sampling ladder \(N\in\{16,64,256,1024\}\) evaluated at the center of the un-tilted card. This ladder drives both uniform-\(\Omega^+\) and cosine-\(\Omega_\perp\) Monte Carlo estimators utilizing identical pseudo-random sequences generated via nested prefixes. The fundamental validation criterion is that both estimators demonstrably converge to minimal error states by \(N=1024\), acknowledging the statistical variance bumps expected at intermediate sample counts.

Across all experimental plates, the following state parameters are held constant:

* Camera transformations, surface albedos (card, walls, floor), fill radiance, disk RGB values, and global exposure (\(e=1.00\)).
* Tonemapping constants (Neutral PBR) and random seeds.
* The processing pipeline operates strictly on the CPU, tracing a linear RGBA32F buffer through the Neutral operator and an sRGB OETF; `GL_FRAMEBUFFER_SRGB` is explicitly disabled, and auto-exposure mechanisms are circumvented.
* The luma ratio defining the contrast between the bright primary disk and the hemispherical fill remains fixed at **200**.
* Solid angle \(\Omega\) is evaluated using the exact spherical cap analytical formula; the polygonal approximation rendered in the visual output does not redefine the mathematical definition of a steradian.

Crucially, the incident radiance vector \(L_i\) is maintained bit-identical between configurations A and B to ensure analytical parity. Arbitrarily attenuating configuration A to balance the visual appearance of the JPEGs would invalidate the radiometric control.

---

## Limits

### Honesty Gaps
1. **The beauty shading relies on a direct GLSL evaluation of the disk form factor.** The rigorous validation of the radiometric principles is established via the analytical identity evaluated at the card center and the corresponding CPU Monte Carlo estimator, not the final courtyard JPEG output.
2. **The disk-to-fill luma ratio is strictly clamped at 200.** For the minimal \(\alpha=5^\circ\) cap geometry, the ambient fill significantly influences the total exitance `Lo_analytic_A_Y` (**0.132081911**). Conversely, at \(\alpha=15^\circ\), the primary disk radiance overwhelmingly dominates the integral (`Lo_analytic_B_Y` evaluates to **0.753613234**). The derived ratio of **8.818616** explicitly isolates the disk contribution.
3. **The tilted surface integral exhibits minor deviation from pure cosine scaling.** The analytical evaluation \(\Omega_\perp(15^\circ,60^\circ)=\mathbf{0.105223414}\) and exactly half of the baseline \(\Omega_{\perp B}\) (\(0.105223402\)) agree only within our established \(5\times 10^{-4}\) tolerance threshold. This bounding holds true provided the source cap remains entirely above the local horizon. The Monte Carlo \(N\)-ladder is evaluated exclusively on the flat surface.
4. **Interreflection is intentionally excluded from the A/B numerical identities,** despite the presence of bounding walls included to provide visual context within the courtyard renders.
5. **The `pixels_disk` metrics evaluate a simple luma threshold on the linear frame buffer** prior to the application of Neutral tonemapping. The distinct raster footprints of **910** and **7242** correspond to entirely different frame resolutions and aspect ratios, precluding any valid geometric correlation to solid angle.
6. **The uniform-\(\Omega\) Monte Carlo estimator exhibits severe variance at the narrow \(\alpha=5^\circ\) configuration.** Consequently, the definitive convergence milestone is established using the \(\alpha=15^\circ\) evaluation ladder.
7. **The nested \(N=256\) estimates intentionally exhibit an error bump relative to the \(N=64\) estimates** across both sampling strategies. Standard Monte Carlo convergence analysis requires tracking the definitive error reduction to the final \(N=1024\) milestone.
8. **The published `rel_err` quantifies the mean error over a localized spatial neighborhood**, rather than a single-pixel deviation or a global root-mean-square error (\(\mathrm{RMSE}_H\)). The numerical rounding applied to the HUD thumbnails is intended for visual clarity in layout, not rigorous formal citation.
9. **The JPEGs represent strictly 8-bit display-referred data.** The fundamental floating-point quantities for \(\Omega\), \(E\), \(L_o\), and `rel_err` are evaluated directly from the raw linear buffer prior to OETF compression.
10. **The Neutral tonemapping constants are statically inherited** from prior experimental setups rather than dynamically re-calibrated for this specific environment.
11. **The experimental setup utilizes a purely analytical disk source.** Substituting a captured EXR environment map or a directional delta light would replace the continuous cap integration with a discrete sum or Dirac delta function, violating the core objective of explicitly evaluating continuous solid angle steradians.
12. **Both Monte Carlo sampling strategies correctly estimate the identical underlying integral.** Variations in `rel_err` merely reflect differences in sample distribution for a given sample count \(N\). Complex interactions involving probability density mismatches are thoroughly analyzed in the preceding importance-sampling and image-based lighting notes (where the mean luma is logged as **1.628**).
13. **The naive geometric approximations of \(9\times\) and \(4\times\) are explicitly rejected.** The mathematical identities restrict the true radiometric ratios to precisely **8.818616** and **3.536**.

---

### Mesa / llvmpipe — What This Run Can Claim
| Component | Value |
| --- | --- |
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| OSMesa Target | core 3.3 request; driver reports 4.5 core |
| FBO Color Format | **RGBA32F** complete, resolution \(1280\times 720\). 8-bit fallback avoided. |
| `GL_FRAMEBUFFER_SRGB` | Disabled (Neutral tonemapping + sRGB OETF applied on CPU) |
| MSAA | Disabled |
| RNG | PCG hash, static seed **1352782172** (`0x50A1D15C`) |
| Neutral Tonemapper Exposure \(e\) | **1.00** |
| Disk / Fill Illumination | Analytic cap + uniform dim hemisphere, luma \(Y\)-ratio **200** |
| Estimator Implementations | uniform-\(\Omega\) |

**Can claim:** Executed on this controlled OSMesa / llvmpipe software stack, the integration of an analytical sky cap at a specified half-angle \(\alpha\) over a Lambertian surface rigorously produces an irradiance and a corresponding single-bounce exitance \(L_o\) that tracks the projected solid angle \(\Omega_\perp=\pi\sin^2\alpha\). The hemispherical grid visualization, the \(E\) versus \(\Omega_\perp\) response curve, and the projected wedge diagram accurately illustrate this fundamental geometric identity. The CPU-based Monte Carlo estimators generate results matching the exact analytical formulations.

**Cannot claim:** This experiment makes no assertions regarding hardware ray tracing performance, real-time computational budgeting, the viability of interactive 1-spp rendering algorithms, or the preservation of radiometric energy through the Neutral tonemapper. We fundamentally reject the validity of mapping pixel footprints to steradians, and we demonstrably refute the naive \(9\times\) and \(4\times\) area-distance approximations.

---

## Out of scope

The following related topics are intentionally excluded from the scope of this note: Comparative analysis of Phong versus cosine-weighted sampling strategies, Multiple Importance Sampling (MIS) balance heuristics, GGX Visible Normal Distribution Functions (VNDF), the Smith geometric shadowing function \(G\), and the Jacobian associated with the half-vector transformation (refer to the [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) note for comprehensive analysis of PDF and integrand variance). Techniques such as split-sum approximations, Karis pre-integrated environments, DFG Look-Up Tables (LUTs), and High Dynamic Range (HDR) processing pipelines are addressed in the [IBL](/posts/p/split-sum-image-based-lighting/) note. Evaluations of specific tone-mapping operators are relegated to the [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) note. Fully integrated path tracing systems incorporating multi-bounce global illumination (GI), Next Event Estimation (NEE), Russian roulette termination, spectral transport, and participating media are entirely distinct subjects. Hardware acceleration strategies, temporal anti-aliasing and denoising algorithms (DLSS/SVGF/OIDN), Linearly Transformed Cosines (LTC), discrete directional light deltas, IES photometric profiles, microfacet metallic BRDFs, shadow mapping techniques, and anisotropic footprint analyses are explicitly omitted from this foundational validation of solid angle measures.

---

Dense meters follow.

---

## Appendix A — Meters (quote tables, not photographs)

All baseline metrics are derived directly from the floating-point buffer evaluated on the Mesa llvmpipe software rasterizer. Quantities including \(\Omega\), \(\Omega_\perp\), \(E\), \(L_o\), and `rel_err` are extracted strictly from the linear Rec.709 color space prior to the application of the Khronos PBR Neutral tonemapping operator. The Monte Carlo estimator is driven by a PCG hash utilizing the fixed seed **1352782172**. The exposure value for the Neutral tonemapper is maintained at \(e=1.00\).

| Parameter | Value |
| --- | --- |
| \(\alpha_A\) / \(\alpha_B\) | **5.000^\circ** / **15.000^\circ** |
| \(\Omega_A\) / \(\Omega_B\) | **0.023909417** / **0.214094348** sr |
| \(\Omega_{\perp A}\) / \(\Omega_{\perp B}\) | **0.023863926** / **0.210446804** sr |
| \(\Omega_B/\Omega_A\) | **8.954394** |
| \(E_A\) / \(E_B\) (disk contribution) | **0.313739973** / **2.766752422** |
| \(E_B/E_A\) | **8.818616** |
| `E_over_omega_ratio` | **0.984837** |
| `naive_alpha_sq_ratio` | **9.000000** (Rejected approximation) |
| Constant-\(R\) \(\Omega(d=2)\) / \(\Omega(d=4)\) | **0.663334** / **0.187600** sr |
| Constant-\(R\) \(\Omega\) ratio | **3.536** |
| Hemispherical / Spherical solid angle | **6.283185307** / **12.566370614** sr |
| \(L_i\) RGB (Configurations A and B) | **(12.0, 13.2, 16.0)** (Bit-identical) |
| \(L_{iY}\) | **13.147** |
| \(L_{\mathrm{fill}}\) RGB / \(Y\) | **(0.0600, 0.0660, 0.0800)** / **0.065735** |
| Ratio of Disk to Fill (Luma \(Y\)) | **200.000** |
| Exposure / Albedo \(\rho\) / Normal \(n\) | **1.00** / **0.80** / \(+Y\) |
| `Lo_analytic_A_Y` / `Lo_analytic_B_Y` | **0.132081911** / **0.753613234** (Combined disk + fill) |
| \(\Omega_\perp(15^\circ,60^\circ)\) / \(\cos 60^\circ\) | **0.105223414** / **0.500** |
| `pixels_disk_A` / `pixels_disk_B` | **910** / **7242** (`omega_from_pixels_illegal`) |
| IS-key \(3.600^\circ\) benchmark | **0.012398431** sr (Cited from prior work) |
| Random Seed / Hash Algorithm | **1352782172** / pcg |

The preceding section details the convergence of the \(\alpha=15^\circ\) Monte Carlo ladder. The formal metrics record the results at the card center for the configuration A at \(N=256\) samples: the uniform sampling estimator yields \(L_{oY}\) **0.139254898**, while the cosine-weighted estimator yields \(L_{oY}\) **0.139897615**, resulting in relative errors (`rel_err`) of **0.054307110** and **0.059173158**, respectively.

The definitive mathematical parameters established by this experiment are precisely: the irradiance ratio \(E_B/E_A\) of **8.818616**; the constant-\(R\) solid angle ratio of **3.536**; the importance-sampling reference solid angle of **0.012398431** sr; the source luma \(L_{iY}\) of **13.147**; the fixed disk-to-fill luma ratio of **200**; and the static random seed **1352782172**, which jointly trigger a rigorous validation suite resulting in **28 pass / 0 fail**. Physical or radiometric quantities must not be approximated by direct measurement of the visual plates.

---

## Appendix B — Assertions

This specific test run validates **28 pass / 0 fail**.

| Check | Result |
| --- | --- |
| FBO utilizes RGBA32F | PASS |
| \(\Omega_A=0.023909417\), \(\Omega_B=0.214094348\) | PASS |
| \(\Omega_{\perp A}=0.023863926\), \(\Omega_{\perp B}=0.210446804\) | PASS |
| \(\Omega_B/\Omega_A=8.954394\) | PASS |
| \(E_B/E_A=8.818616\), strictly non-equal to \(9\) | PASS |
| Naive \((15/5)^2=9\) explicitly logged and labeled | PASS |
| Constant-\(R\) \(\Omega\) ratio \(=3.536\), strictly non-equal to \(4\) | PASS |
| \(L_{iY}=13.147\); Ratio of disk/fill \(Y\) \(\ge 100\) | PASS (**200**) |
| \(L_i\) RGB is bit-identical between configurations A/B | PASS |
| MC convergence at \(\alpha=15^\circ\): `rel_err` at \(N=1024\) falls strictly below \(N=16\) and \(N=64\) across both sampling strategies | PASS |
| \(\Omega_\perp(15^\circ,60^\circ)\) agrees within \(5\times 10^{-4}\) of the theoretical \(\Omega_\perp\cos 60^\circ\) approximation | PASS (**0.105223414**) |
| Validation of all graphical outputs: hero render, size comparison, grid visualization, \(E\) vs \(\Omega_\perp\) plot, wedge diagram, and metrics plate | PASS |
| `pixels_disk_B>20`, `pixels_disk_A>0` | PASS (**7242** / **910**) |

Zero tolerances within the testing suite were deliberately bypassed to forcibly reject the mathematically flawed \(E_B/E_A=9\) and constant-\(R\) ratio of 4 approximations.

---

## Appendix C — Measure Lock

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
p_unif             = 1/(2 pi) on Omega^+       # cos theta = xi_1
p_cos              = (n·w) / pi                # cos theta = sqrt(xi_1)
PNG                = sRGB_OETF( Neutral(e * Lo) )    # e=1.00, inherited

```

The primary hero image serves strictly as an introductory presentation element, while the size A/B comparison plate functions as the core pedagogical demonstration. The grid visualization, the \(E\) versus \(\Omega_\perp\) function plot, and the projected wedge diagrams constitute our formal mathematical evidence, supported by the Monte Carlo \(N\)-ladder plate which validates the underlying estimator logic. Formally, path tracing algorithms sample the differential solid angle measure \(d\omega\), whereas surface irradiance strictly integrates over the projected solid angle \(\Omega_\perp\). Building upon our prior work which evaluated probability densities correctly formulated in units of \(1/\mathrm{sr}\), this iteration mathematically diagrams and substantiates the physical definition of the steradian measure itself.
