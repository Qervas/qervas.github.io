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

Our previous note addressed Monte Carlo sampling mismatches, specifically the issue of evaluating the same integral using two different probability density functions at a single sample count, $N$. Those pdfs were appropriately defined as densities measured in $1/\mathrm{sr}$. Split-sum techniques had successfully folded an environment into a GGX prefilter multiplied by a DFG LUT, which left the measure inside the integral (with an environment solid-angle mean luma of **1.628** on that specific loft run). This current note focuses entirely on understanding that measure.

Path tracers inherently sample $d\omega$. Irradiance and the rendering equation, however, track the projected solid angle, $\Omega_\perp$. A direction is simply a point on the hemisphere, weighted in steradians. Flux passing through a flat surface depends on the projected solid angle, defined as $\Omega_\perp=\int(n\cdot\omega)\,d\omega$. Relying on source area, pixel counts, or manipulating $L_i$ as a brightness knob are fundamentally incorrect ways to measure this.

The core of our [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) discussion was a finite disk with an angular radius of **3.600°**. The solid angle subtended by that disk, which was not explicitly printed in that note, is:

$$\Omega(3.600^\circ)=2\pi\bigl(1-\cos 3.600^\circ\bigr)=0.012398431\,\mathrm{sr}.$$

Evaluating a hemisphere pdf against a cap this small precisely explains why a cosine sample produces fireflies in a highlight. The detailed cosine-versus-Phong comparison remains in that original note.

![Presentation. Sunlit courtyard / skylight atrium: four walls, square skylight with jamb, matte limewash floor, low bench. Analytic sky disk α=15°, white Lambert card. Photograph only — do not hang EB/EA on this frame.](/assets/journal/solid-angle-and-the-rendering-equation/00_hero.jpg)

We introduce a new photographic family for this analysis: a sunlit courtyard and skylight atrium. This setting replaces the still-life scenes from previous notes, such as the loft's cream-glaze bottle, the measured-brass and dark-oak materials, the metro colonnade, or the gallery's lacquer sphere. The scene features four walls, a square skylight with a visible jamb, a matte limewash floor, and a single low bench for scale. An **analytic sky disk** sits inside the opening, represented as a spherical cap with a locked half-angle of $\alpha=15^\circ$ and uniform radiance. Our primary instrument is a white Lambert card ($\rho=0.80$, normal $n=+Y$, emission $L_e=0$) placed on the floor directly beneath the opening. The HUD states: `path tracers sample d omega  E tracks Omega_perp`. Do not attempt to derive the $E_B/E_A$ ratio purely from visual inspection of this photograph.

![Teaching pin. Same camera, same exposure, same Li. Left α=5° | right α=15°. Only Omega changes; brightness change IS the lesson. EB/EA=8.818616. Photograph only.](/assets/journal/solid-angle-and-the-rendering-equation/01_size.jpg)

**Pin this control setup.** Using the exact same camera, identical exposure, and the **same $L_i$**, we compare $\alpha=5^\circ$ on the left against $\alpha=15^\circ$ on the right. The right-hand card is visibly brighter because it integrates over more steradians. The lower caption emphasizes that *only Omega changes; brightness change IS the lesson*, noting that the irradiance ratio is $E_B/E_A = 8.818616$ when using the same-$R$ control. The upper text line reinforces that *area is not Omega; pixels are not steradians*.

For the hero shot (Mesa 25.0.7 llvmpipe, scene-referred linear Rec.709, **Khronos PBR Neutral** with $e=\mathbf{1.00}$, seed **1352782172**), the metrics are $\Omega_A=\mathbf{0.023909417}\,\mathrm{sr}$ and $\Omega_B=\mathbf{0.214094348}\,\mathrm{sr}$, yielding a ratio of **8.954394**. The projected solid angles are $\Omega_{\perp A}=\mathbf{0.023863926}\,\mathrm{sr}$ and $\Omega_{\perp B}=\mathbf{0.210446804}\,\mathrm{sr}$. This produces a disk irradiance ratio of $E_B/E_A=\mathbf{8.818616}$. We reject the small-angle approximation of $(15/5)^2=9$ as an accurate meter. Under a same-$R$ area control, the true $\Omega$ ratio is **3.536**. The incident radiance $L_i=(12.0,\,13.2,\,16.0)$ is bit-identical across A and B, yielding a luma of $L_{iY}=\mathbf{13.147}$ and a disk-to-fill $Y$-ratio of **200**. The test suite confirms **28 pass / 0 fail**.

---

## What You Are Seeing

The working color space is **scene-referred linear Rec.709**. The scene contains one courtyard, one analytic cap, and one Lambert card. The display pipeline is inherited: it applies Khronos PBR Neutral with $e=1.00$, followed by the IEC 61966-2-1 sRGB OETF evaluated on the CPU. The tone curve does not create lighting, and the Neutral operator does not author irradiance $E$. For background, refer to the [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) and [split-sum IBL](/posts/p/split-sum-image-based-lighting/) notes.

**Hero — presentation hook.** This is the atrium with the visible disk, white card, low bench, and $\alpha=15^\circ$. It serves as a photograph of the setup family, but the final JPEG itself is not the measurement tool.

**Size A/B — teaching pin.** This plate compares A and B at the same $L_i$, showing $\alpha=5^\circ$ versus $15^\circ$ under a shared exposure. Always quote the numerical metrics to ensure precision.

![Failure B. Same α=15° disk fixed in world. Left card n=+Y, β=0 | right tilted β=60°. Li frozen. (n·ω) is geometry, not a brightness slider. Photograph only.](/assets/journal/solid-angle-and-the-rendering-equation/02_cosine.jpg)

**Cosine tilt — Failure B.** The $\alpha=15^\circ$ disk is held fixed in world space. On the left, the card is oriented with $n=+Y$ ($\beta=0$). On the right, the card is tilted to $\beta=60^\circ$ while $L_i$ remains frozen. As the caption states, *(n·ω) is geometry, not a brightness slider.*

![The measure. Unit hemisphere over the card. Equal-Ω cells, sky cap as a spherical polygon. Not a latlong unwrap.](/assets/journal/solid-angle-and-the-rendering-equation/03_grid.jpg)

**Grid — the measure.** This illustrates a unit hemisphere directly over the card. It features equal-$\Omega$ cells and represents the sky cap as a spherical polygon. The plate clarifies this is *the measure, not a latlong unwrap.*

![Identity. Irradiance vs Ω⊥. Cyan: disk E=LiY Ω⊥. Gold: disk plus named fill. Red ghost: LiY Ω, cosine missing. Squares: cosine-arm N=256.](/assets/journal/solid-angle-and-the-rendering-equation/04_E_vs_Omega.jpg)

**$E$ vs $\Omega_\perp$ — the identity.** The horizontal axis tracks $\Omega_\perp$ in steradians. The cyan line represents disk irradiance $E=L_{iY}\Omega_\perp$. The gold line shows the disk plus named fill. The red ghost line represents $L_{iY}\Omega$, where the required cosine term is incorrectly missing. The squares map the cosine-arm at $N=256$, inverted through the Lambert BRDF. This plate demonstrates that *irradiance tracks projected solid angle.*

![The article. Same cap twice, side view. Left: steradians on the sphere. Right: foreshortened patch. At 5° they almost agree; at 15° the article appears.](/assets/journal/solid-angle-and-the-rendering-equation/05_wedge.jpg)

**Wedge — the article.** This displays the same spherical cap twice from a side view. The left shows steradians directly on the sphere, while the right displays the foreshortened patch. As noted, *at 5 deg they almost agree; at 15 deg the article appears.*

![Estimator. Card center, α=15°, N=16/64/256/1024. Uniform-Ω (cyan) and cosine-Ω⊥ (gold), same ξ stream. Not an IS bake-off; rel_err must fall.](/assets/journal/solid-angle-and-the-rendering-equation/06_mc_n.jpg)

**MC-$N$ — estimator of the integral.** This evaluates the rendering equation at the card center for $\alpha=15^\circ$ using (N=16/64/256/1---
title: "Solid Angle and the Rendering Equation"
description: "Path tracers sample dω (sr). Irradiance and the RE track projected solid angle Ω⊥. Same Li, α=5° vs 15°: EB/EA=8.818616 (not 9); same-R Ω ratio 3.536 (not 4). Courtyard skylight + Lambert card."
date: 2026-09-22
tags:

* graphics
* engine
* lighting
math: true
cover: /assets/journal/solid-angle-and-the-rendering-equation/00_hero.jpg

---

Our previous note addressed a common Monte Carlo sampling mismatch: **same integral, two pdfs, one $N$.** Those probability density functions were already defined as densities in $1/\mathrm{sr}$. Because split-sum approximations fold an environment into a GGX prefilter $\times$ DFG LUT, they leave the measure implicit inside the integral (yielding an environment solid-angle mean luma of **1.628** on that specific loft run). **This note focuses directly on that measure.**

**Path tracers sample $d\omega$. Irradiance and the rendering equation track $\Omega_\perp$.** A direction is simply a point on the hemisphere, weighted in steradians. Flux through a flat surface, however, depends on the projected solid angle $\Omega_\perp=\int(n\cdot\omega)\,d\omega$. Relying on source area, pixel count, or tweaking $L_i$ as a brightness knob are fundamentally incorrect ways to measure this.

The key to our [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) discussion was a finite disk with an angular radius of **3.600°**. The exact solid angle subtended by that disk—which the previous note never explicitly printed—is:

$$\Omega(3.600^\circ)=2\pi\bigl(1-\cos 3.600^\circ\bigr)=0.012398431\,\mathrm{sr}.$$

Applying a full-hemisphere pdf against a cap this small demonstrates exactly why a cosine sample produces fireflies on a highlight. The detailed cosine-versus-Phong comparison remains in that earlier note.

We introduce a new photographic family for this analysis: a sunlit courtyard and skylight atrium. It trades the dark oak and lacquer of previous scenes for four walls, a square skylight with a visible jamb, a matte limewash floor, and a single low bench for scale. An **analytic sky disk** sits in the opening—a spherical cap with a locked half-angle of $\alpha=15^\circ$ and uniform radiance. On the floor below rests our primary instrument: a white Lambertian card ($\rho=0.80$, $n=+Y$, $L_e=0$). While the HUD accurately states `path tracers sample d omega  E tracks Omega_perp`, do not attempt to derive $E_B/E_A$ visually from this photograph.

**This is the core visual reference.** Both shots share the exact same camera, exposure, and **$L_i$**. The left side features $\alpha=5^\circ$, while the right uses $\alpha=15^\circ$. The right-hand card is visibly brighter because it integrates over more steradians. As the lower caption indicates, *only $\Omega$ changes; this brightness difference is the primary lesson*. It yields an exact ratio of $E_B/E_A = 8.818616$ under our same-$R$ control. The fundamental takeaway: area is not $\Omega$, and pixels are not steradians.

Running on Mesa 25.0.7 llvmpipe in linear Rec.709 with **Khronos PBR Neutral** ($e=\mathbf{1.00}$) and seed **1352782172**, we record the following: $\Omega_A=\mathbf{0.023909417}\,\mathrm{sr}$ and $\Omega_B=\mathbf{0.214094348}\,\mathrm{sr}$, giving a ratio of **8.954394**. The projected solid angles are $\Omega_{\perp A}=\mathbf{0.023863926}\,\mathrm{sr}$ and $\Omega_{\perp B}=\mathbf{0.210446804}\,\mathrm{sr}$. This results in a disk irradiance ratio of $E_B/E_A=\mathbf{8.818616}$. The naive small-angle approximation of $(15/5)^2=9$ is strictly rejected here. Using a same-$R$ area control gives an $\Omega$ ratio of **3.536**. The incident radiance $L_i=(12.0,\,13.2,\,16.0)$ is bit-identical between setups, with a luminance $L_{iY}=\mathbf{13.147}$ and a disk-to-fill $Y$-ratio of **200**. In total, **28 pass / 0 fail** assertions confirm these bounds.

---

## What You Are Seeing

Our working space is **scene-referred linear Rec.709**. The environment consists of one courtyard, one analytic cap, and one Lambertian card. Display parameters are inherited from previous work: Khronos PBR Neutral at $e=1.00$, followed by the IEC 61966-2-1 sRGB OETF applied on the CPU. Note that the tone curve does not create lighting, and Neutral does not author irradiance ($E$). See the [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) and [split-sum IBL](/posts/p/split-sum-image-based-lighting/) notes for full context.

**Hero — presentation hook.** The atrium features the visible disk, white card, and low bench at $\alpha=15^\circ$. This serves as the aesthetic baseline, but the actual meter is not derived from this JPEG.

**Size A/B — teaching pin.** Comparing A and B, we maintain the same $L_i$ and shared exposure across $\alpha=5^\circ$ versus $15^\circ$. Rely on the quoted metrics for precise digits.

**Cosine tilt — Failure B.** The $\alpha=15^\circ$ disk remains fixed in world space. On the left, the card is flat ($n=+Y$, $\beta=0$). On the right, the card is tilted to $\beta=60^\circ$. The incident radiance $L_i$ remains frozen. The geometric relationship $(n\cdot\omega)$ drives this behavior—it is not a configurable brightness slider.

**Grid — the measure.** A unit hemisphere is projected over the card, divided into equal-$\Omega$ cells. The sky cap is treated as a spherical polygon. This represents the true measure, rather than a distorted lat-long unwrap.

**$E$ vs $\Omega_\perp$ — the identity.** The horizontal axis tracks $\Omega_\perp$ in sr. The cyan line plots the disk irradiance $E=L_{iY}\Omega_\perp$, while gold includes the disk plus named fill. The red ghost line represents $L_{iY}\Omega$, visually demonstrating the error of a missing cosine term. The squares plot our cosine-arm at $N=256$, inverted through the Lambertian BRDF. The core identity is clear: irradiance directly tracks projected solid angle.

**Wedge — the article.** We view the same cap twice from the side. The left visualizes steradians on the unit sphere, while the right shows the foreshortened patch. At a narrow $5^\circ$, they nearly agree; at $15^\circ$, the mathematical divergence becomes highly visible.

**MC-$N$ — estimator of that integral.** Sampled at the card center using $\alpha=15^\circ$, we test $N=16/64/256/1024$. The thumbnails depict the cosine-$\Omega_\perp$ instrument. The plot tracks both uniform-$\Omega$ (cyan) and cosine-$\Omega_\perp$ (gold) using the same $\xi$ random stream. This is not an importance-sampling bake-off; the focus is verifying that `rel_err` reliably falls. The traces are permitted to rise briefly at $N=256$, but the critical gate is the strict error reduction at $N=1024$.

![Instrument. Science plate of the float-buffer metrics. Quote the table, not the JPEG. Not a cover.](/assets/journal/solid-angle-and-the-rendering-equation/07_metrics.jpg)

**Metrics strip — the meter snapshot.** This is the science plate capturing the float-buffer table. Always quote the source text metrics rather than reading values off the JPEG.

Maintain a strict separation between these two artifact categories:

1. **Beauty plates** (`00`, `01`, `02`) represent the GLSL courtyard running on llvmpipe, mapped through Neutral and an sRGB OETF. The shader properly evaluates walls, floor, and the card using a disk form factor. Do not attempt to reverse-engineer $\Omega$, $E$, or $L_o$ from these JPEGs.
2. **Instruments** (`03`, `04`, `05`, `06`, `07`, and the metrics block) represent exact float identities and the CPU estimator.

---

## Three Failures

Radiance $L_i$ is defined as power per unit area per steradian. Irradiance on a surface is radiance multiplied by the **projected** solid angle of the source. If you expand the spherical cap while holding $L_i$ fixed, the card brightens. If you tilt the card while holding both $L_i$ and the cap fixed, the card darkens because the geometric relationship $(n\cdot\omega)$ changes. In neither scenario did the source itself get "hotter."

**Failure A — area versus $\Omega$.** This is visualized on the size A/B plate. The left uses $\alpha=5.000^\circ$ and the right $\alpha=15.000^\circ$. Both maintain $L_i=(12.0,\,13.2,\,16.0)$, $e=1.00$, and $\rho=0.80$. The right card is brighter purely because $\Omega_\perp$ increased from **0.023863926** sr to **0.210446804** sr. The resulting disk irradiance ratio is $E_B/E_A=\mathbf{8.818616}$. The naive approximation $(15/5)^2=9$ is explicitly rejected.

The same plate caption details the area control test. For an on-axis disk with radius $R$ at distance $d$, the half-angle is $\alpha=\arctan(R/d)$, yielding:

$$\Omega=2\pi\Bigl(1-\frac{d}{\sqrt{R^2+d^2}}\Bigr).$$

Taking values from the metrics block where $R=1$ and area equals $\pi$ for both configurations:

| $R$ | $d$ | $\alpha=\arctan(R/d)$ | area | $\Omega$ [sr] |
| --- | --- | --- | --- | --- |
| 1 | 2 | $26.565^\circ$ | $\pi$ | **0.663334** |
| 1 | 4 | $14.036^\circ$ | $\pi$ | **0.187600** |

Even though the area remains identical, the recorded $\Omega$ ratio is **3.536**. Standard inverse-square logic tied only to distance would falsely predict $(4/2)^2=4$, which our assertions reject. If you scale $R$ and $d$ by identical factor $k$, $\Omega$ remains constant while the area scales by $k^2$. Equal area simply does not guarantee equal solid angle.

**Failure B — the missing cosine.** This flaw is illustrated by the cosine-tilt plate and the red ghost curve on the $E$ vs $\Omega_\perp$ plot. Integrating $L_i\,d\omega$ without including $(n\cdot\omega)$ incorrectly gathers flux as if the receiving surface were a spherical probe. The rendering equation for an opaque surface demands the flat-plate integral. The $(n\cdot\omega)$ term correctly accounts for the foreshortening of the incoming beam—it is not a brightness adjustment, nor is it part of the BRDF. On the tilt plate, the right card darkens at $\beta=60^\circ$ despite $L_i$ remaining constant. Raising $L_i$ artificially to compensate would invalidate the control setup.

**Failure C — pixels versus steradians.** Pixel coverage is merely a camera projection of the drawn sky disk, whereas solid angle in the rendering equation evaluates at the surface location (the card). These are fundamentally decoupled. For instance, `pixels_disk_A` (**910**) tracks a luma threshold on the linear $\alpha=5^\circ$ panel at $628\times 720$. `pixels_disk_B` (**7242**) tracks the same threshold on the $\alpha=15^\circ$ hero frame at $1280\times 720$. Both metrics are accurately tagged `omega_from_pixels_illegal`. Because the frame size and aspect ratio change between panels, dividing these integers provides no meaningful estimate of $\Omega_B/\Omega_A$. A $5^\circ$ cap maintains $\Omega=0.023909417\,\mathrm{sr}$ regardless of whether it covers 910 pixels or any other footprint.

The importance-sampling key from our previous note is an example of Failure A at an even smaller scale: a **3.600°** cap subtends **0.012398431** sr. The cosine pdf discussed there allocates its mass over the entire hemisphere around $n$, not specifically on that tiny cap.

---

## The Rendering Equation Once

We establish the integral once and define all symbols clearly. Subsequent evaluations refer to this specific formulation.

$$L_o(x,\omega_o) = L_e(x,\omega_o) + \int_{\Omega^+} f_r(x,\omega,\omega_o)\, L_i(x,\omega)\, (n\cdot\omega)\, d\omega.$$

| symbol | name | unit |
| --- | --- | --- |
| $L_o$ | outgoing radiance | $\mathrm{W}\,\mathrm{m}^{-2}\,\mathrm{sr}^{-1}$ (linear Rec.709 RGB in the lab) |
| $L_e$ | emitted radiance | same; **0** on the card and floor |
| $L_i$ | incident radiance | same; piecewise-constant sky disk + dim fill |
| $f_r$ | BSDF | $\mathrm{sr}^{-1}$; Lambert $\rho/\pi$ on card and floor |
| $n$ | geometric unit normal | dimensionless |
| $\omega$ | incoming direction, toward the source | unit vector, $\omega\in S^2$ |
| $\omega_o$ | outgoing direction | unit vector |
| $\Omega^+$ | hemisphere about $n$ | $\{\omega:n\cdot\omega>0\}$ |
| $d\omega$ | solid-angle measure | $\mathrm{sr}$ |

A path tracer samples this integral by drawing $\omega\in\Omega^+$ and weighting it by $f_r L_i (n\cdot\omega)/p(\omega)$. While building the tracer is a topic for a different note, our focus here is strictly on validating the measure that $p$ represents.

### $d\omega$, Then Projected Solid Angle

Let $\theta$ be the polar angle from the normal $n$, and $\phi$ be the azimuth in the tangent frame.

$$d\omega = \sin\theta\,d\theta\,d\phi = -\,d(\cos\theta)\,d\phi \qquad [\,\mathrm{sr}\,].$$

The grid visualization leverages this second form: equal steps of $\phi$ and $\cos\theta$ generate equal steradians. To achieve a fixed $\Delta\cos\theta$, the required polar step is $\Delta\theta=\Delta\cos\theta/\sin\theta$, which means steps are wide near the pole and tightly packed near the horizon. Consequently, a lat-long parameterization that is uniform in $\theta$ yields visually even cells in a texture but heavily biased $d\omega$ cells that scale with $\sin\theta$ and pinch at the poles. Uniformly sampling the angle $\theta$ is not equivalent to sampling uniform solid angle. To properly draw uniform $d\omega$ on $\Omega^+$, the inverse CDF requires $\cos\theta=\xi_1$ and $\phi=2\pi\xi_2$.

The full sphere integrates to $\int_{S^2}d\omega=4\pi$, and the hemisphere to $\int_{\Omega^+}d\omega=2\pi$. On this run, `sphere_sr` returns **12.566370614** and `hemisphere_sr` returns **6.283185307**. Neither metric is $\pi$. The value $\pi$ applies exclusively to the *projected* hemisphere:

$$d\omega_\perp = (n\cdot\omega)\,d\omega = \cos\theta\,\sin\theta\,d\theta\,d\phi, \qquad \int_{\Omega^+}d\omega_\perp = \pi.$$

A sky offering constant radiance $L_i$ across the entire $\Omega^+$ delivers an irradiance of $E=L_i\pi$. Using the $2\pi$ directional count for a flat plate is mathematically flawed; the geometric factor is built into the integral before the BSDF $f_r$ is even evaluated.

The variable `E_analytic_*` tracks the scalar product of Rec.709 luma $L_i$ and $\Omega_\perp$. While the plates label this axis $\mathrm{W}/\mathrm{m}^2$, it strictly represents this calculated value, not a spectrally integrated pyranometer reading.

### The Cap, Then One Bounce

For an on-axis spherical cap where $\theta\in[0,\alpha]$ and $\phi\in[0,2\pi)$ with a constant $L_i$:

$$\Omega(\alpha) = \int_0^{2\pi}\!\!d\phi\int_0^{\alpha}\sin\theta\,d\theta = 2\pi\bigl(1-\cos\alpha\bigr),$$

$$\Omega_\perp(\alpha) = \int_0^{2\pi}\!\!d\phi\int_0^{\alpha}\cos\theta\sin\theta\,d\theta = \pi\sin^2\alpha.$$

$\Omega_\perp$ calculates the area of a disk with radius $\sin\alpha$ resting on the tangent plane, which corresponds to the right-hand diagram on the wedge plate. The ratio of these two closed forms forms our core identity:

$$\frac{\Omega_\perp}{\Omega} = \frac{\sin^2\alpha}{2(1-\cos\alpha)} = \cos^2(\alpha/2),$$

derived via the identities $1-\cos\alpha=2\sin^2(\alpha/2)$ and $\sin\alpha=2\sin(\alpha/2)\cos(\alpha/2)$. Checking our locked configurations, the quotient matches perfectly: **0.998097** at $5^\circ$ and **0.982963** at $15^\circ$.

Evaluating irradiance on the untilted plate purely from the cap, and computing the one-bounce Lambertian integral without interreflection ($L_e=0$), yields:

$$ E = L_i\,\Omega_\perp(\alpha) = L_i\,\pi\sin^2\alpha, \qquad L_o^{\mathrm{disk}} = \frac{\rho}{\pi}\,E = \rho\,L_i\sin^2\alpha. $$

The Lambertian $\rho/\pi$ term natively expects to operate per steradian, meaning the $\pi$ within $\Omega_\perp$ cancels it cleanly. Dropping the $(n\cdot\omega)$ factor while retaining $\rho/\pi$ evaluates the wrong integral (creating the red ghost plot), as the weight still incorrectly carries radiance units.

Our named fill is a dim constant applied across the remainder of $\Omega^+$. The complement yields a projected solid angle of $\pi\cos^2\alpha$:

$$ L_o = \rho\,L_i\sin^2\alpha + \rho\,L_{\mathrm{fill}}\bigl(1-\sin^2\alpha\bigr). $$

`E_analytic_*` isolated the **disk** product $L_{iY}\,\Omega_\perp$, while `Lo_analytic_*_Y` tracks the disk combined with fill. The A/B irradiance identity is derived from the disk row; these columns address fundamentally different integrals.

### Estimator of the Same Integral

Sampling uniformly in solid angle on $\Omega^+$ and using cosine-weighting are both valid methods for estimating this integral, sharing the same $N$ and random stream $\xi$. This note verifies their correctness rather than ranking their efficiency (a topic handled in the [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) note).

$$\widehat{L}_o = \frac{1}{N} \sum_{k=1}^{N} \frac{f_r(\omega_k,\omega_o)\,L_i(\omega_k)\,(n\cdot\omega_k)}{p(\omega_k)}.$$

| arm | sample on $\Omega^+$ | $p(\omega)$ |
| --- | --- | --- |
| uniform-$\Omega$ | $\cos\theta=\xi_1$, $\phi=2\pi\xi_2$ | $1/(2\pi)$ |
| cosine-$\Omega_\perp$ | $\cos\theta=\sqrt{\xi_1}$, $\phi=2\pi\xi_2$ | $(n\cdot\omega)/\pi$ |

Under $p_{\cos}$, the $(n\cdot\omega)$ term neatly cancels, and each hit contributes either $\rho L_i$ or $\rho L_{\mathrm{fill}}$ based on the cap intersection test. Under $p_{\mathrm{unif}}$, the cosine remains in the evaluation weight: $(n\cdot\omega)/p_{\mathrm{unif}}=(n\cdot\omega)\,2\pi$. Both correctly estimate the integral provided the density in the denominator matches the drawn distribution. The BSDF $f_r$ supplies one $\mathrm{sr}^{-1}$ unit, while $p$ supplies the other, keeping $d\omega$ balanced. Assigning a label of $1/\mathrm{sr}$ to a density built upon pixel footprints or uniform $\theta$ does not mathematically make it a solid-angle density.

### Small-Angle Stand-In

$$\Omega(\alpha)\approx\pi\alpha^2, \qquad \Omega_\perp(\alpha)\approx\pi\alpha^2 \qquad(\alpha\text{ in radians}).$$

The $\Omega$ and $\Omega_\perp$ values at $5^\circ$ and $15^\circ$, as well as $\Omega$ at $3.600^\circ$, are pulled directly from the metrics. The $\Omega_\perp$ at $3.600^\circ$ and the $\pi\alpha^2$ column evaluate the closed form approximation explicitly.

| $\alpha$ | $\Omega$ [sr] | $\Omega_\perp$ [sr] | $\pi\alpha^2$ [sr] |
| --- | --- | --- | --- |
| $3.600^\circ$ (IS-note key) | **0.012398431** | 0.012386198 | 0.012402511 |
| $5.000^\circ$ (A) | **0.023909417** | **0.023863926** | 0.023924596 |
| $15.000^\circ$ (B) | **0.214094348** | **0.210446804** | 0.215321366 |

Though each value lies close to its neighbors, the naive approximation cleanly yields $(15/5)^2=9$. The actual measured identities, however, are:

$$\frac{\Omega_B}{\Omega_A}=8.954394, \qquad \frac{E_B}{E_A}=\frac{\Omega_{\perp B}}{\Omega_{\perp A}}=8.818616.$$

Because $E$ accurately tracks $\Omega_\perp$, the printed `E_over_omega_ratio` of **0.984837** mathematically represents the quotient of these two ratios: $(\Omega_{\perp B}/\Omega_B)/(\Omega_{\perp A}/\Omega_A)=\cos^2(7.5^\circ)/\cos^2(2.5^\circ)$. The absolute foreshortening explicitly at B is $\Omega_{\perp B}/\Omega_B=\mathbf{0.982963}$.

Our testing guarantees strict fairness constraints:

$$L_i^{\mathrm{A}}=L_i^{\mathrm{B}}, \qquad e^{\mathrm{A}}=e^{\mathrm{B}}, \qquad \rho^{\mathrm{A}}=\rho^{\mathrm{B}}.$$

The only variables moving between frames are $\Omega$ or the applied cosine. The disk spectrum holds constant at an RGB triple of $(12.0,\,13.2,\,16.0)$, resulting in a Rec.709 luma $Y=13.147$ at an exposure $e=1.00$. The resultant brightness change strictly illustrates the impact of $\Omega$.

---

## Unique Artifacts

The grid plate visualizes the measure as a 3D mesh utilizing twelve uniform steps of $\cos\theta$ (from 1 to 0) and twenty-four uniform steps of $\phi$. This geometry ensures every discrete cell spans an identical solid angle:

$$\Delta\Omega=\Delta\phi\,\Delta\cos\theta=\frac{2\pi}{24}\cdot\frac{1}{12}=\frac{\pi}{144}\,\mathrm{sr}.$$

When the sky cap B ($15^\circ$ half-angle) is overlaid onto this mesh as a spherical polygon, it accurately cuts the cells rather than mapping to a lat-long texture. The $\Omega$ evaluation integrates the continuous cap geometry. The plate caption rounds this to $\Omega=0.214094\,\mathrm{sr}$ and $\Omega_\perp=0.210447\,\mathrm{sr}$, alongside printing the IS-key reference of **0.012398431** and restating the rule `d omega = d phi d(cos theta)`. The precise ninth digit remains preserved in the metrics block: **0.214094348** and **0.210446804**.

The wedge plate profiles the same cap from a side view, contrasting $5^\circ$ on top against $15^\circ$ below. The left column shows unprojected $\Omega$ via the polar segment and cone rays on the sphere, while the right displays the foreshortened disk of area $\Omega_\perp$. At a narrow $5^\circ$, the foreshortening is virtually imperceptible with $\Omega_\perp/\Omega=\mathbf{0.998097}$. At $15^\circ$, the divergence becomes structurally obvious at **0.982963**.

| $\alpha$ | $\Omega$ [sr] | $\Omega_\perp$ [sr] | $\Omega_\perp/\Omega$ |
| --- | --- | --- | --- |
| $5^\circ$ | 0.023909417 | 0.023863926 | 0.998097 |
| $15^\circ$ | 0.214094348 | 0.210446804 | 0.982963 |

The identity plot charts irradiance $E$ against $\Omega_\perp$ out to $0.85\,\mathrm{sr}$ to safely capture $\Omega_\perp(30^\circ)=\pi/4$. The cyan line perfectly models the disk irradiance $E=L_{iY}\Omega_\perp$. The gold line includes the fill radiance applied across the remaining projected complement:

$$E_{\mathrm{gold}}=L_{iY}\,\Omega_\perp+L_{\mathrm{fill},Y}\bigl(\pi-\Omega_\perp\bigr).$$

As the cap grows, the vertical offset $L_{\mathrm{fill},Y}(\pi-\Omega_\perp)$ naturally compresses. The red ghost plots the Failure-B error $L_{iY}\,\Omega(\alpha)$ over the $\Omega_\perp$ domain, diverging by $L_{iY}(\Omega-\Omega_\perp)$. While invisible at $5^\circ$, the divergence at $15^\circ$ aligns exactly with our metric $\Omega_\perp/\Omega=\mathbf{0.982963}$. Hitting the $30^\circ$ analytical rung yields:

$$\Omega(30^\circ)=0.841787214\,\mathrm{sr}, \qquad \Omega_\perp(30^\circ)=\pi/4=0.785398163\,\mathrm{sr}.$$

The mapped squares track the cosine-$\Omega_\perp$ estimator at $N=256$ for configurations A and B, referencing total irradiance (gold line) via $E=L_{oY}\,\pi/\rho$. If a square landed on the red ghost, it would signal a broken estimator lacking the cosine weight. If evaluated strictly against the cyan line, it would incorrectly discard the fill radiance. The `rel_err` value in the metrics strictly tracks deviation of $L_o$ from the analytical expectation, not pixel discrepancies in the visual graph.

These three structural plates are our core mathematical fingerprints; the courtyard stills supplement rather than replace them.

---

## Size A/B

The size plate directly visualizes Failure A by holding $L_i$, $e=1.00$, $\rho=0.80$, and the camera completely identical across both shots.

Referencing the untilted disk cap metrics:

|  | A $5^\circ$ | B $15^\circ$ | B/A |
| --- | --- | --- | --- |
| $\Omega$ [sr] | 0.023909417 | 0.214094348 | **8.954394** |
| $\Omega_\perp$ [sr] | 0.023863926 | 0.210446804 | **8.818616** |
| $E$ (disk, $L_{iY}\Omega_\perp$) | 0.313739973 | 2.766752422 | **8.818616** |
| $(\alpha_B/\alpha_A)^2$ | — | — | **9.000000** (rejected) |

Applying the same-$R$ area control establishes an entirely different ratio hook: fixing $R=1$ with $d\in\{2,4\}$ produces $\Omega\in\{0.663334,\,0.187600\}\,\mathrm{sr}$, resulting in a ratio of **3.536**.

The stored pixel footprints of **910** and **7242** are fundamentally incompatible with solid angle calculations. Because they arise from different frame sizes and aspect ratios, comparing them directly represents Failure C, which is why both counts are marked `omega_from_pixels_illegal`. The true governing metric is the established irradiance ratio.

Factoring in the dim hemisphere fill (`Li_fill` $=(0.0600,\,0.0660,\,0.0800)$ with $Y=0.065735$), the disk-to-fill $Y$-ratio is **200**. Because $\Omega_{\perp A}$ is tiny at $\alpha=5^\circ$, the fill remains on the same order of magnitude as the disk inside `Lo_analytic_A_Y` (**0.132081911**). At $\alpha=15^\circ$, the disk massively dominates: `E_analytic_B` reaches **2.766752422** against `Lo_analytic_B_Y` at **0.753613234**. The **8.818616** ratio exclusively tracks the pure disk cap identity without interreflection.

---

## Cosine Tilt, Then the $N$ Ladder

The cosine plate manipulates $(n\cdot\omega)$ while preserving the $\alpha=15.000^\circ$ disk fixed in world space. $L_i$, exposure, and albedo ($\rho=0.80$) are completely frozen. The baseline flat card ($\beta=0$, $n=+Y$) gives $\Omega_\perp=\mathbf{0.210446804}$. When tilted to $\beta=60^\circ$, the theoretical small-source scaling approaches $\cos 60^\circ=\mathbf{0.500}$. The exact analytical integral for the cap yields:

$$\Omega_\perp(\alpha,\beta)=\int_{\mathrm{cap}}(n\cdot\omega)_+\,d\omega=\mathbf{0.105223414}.$$

Exactly half of $\Omega_{\perp B}$ equals $0.105223402$. Because the cap remains safely above the horizon ($\beta+\alpha=75^\circ<90^\circ$), these two values agree within the rigorous $5\times 10^{-4}$ gated tolerance. You cannot compensate for this geometric darkening by arbitrarily boosting $L_i$.

The MC-$N$ plate evaluates the rendering equation explicitly at the untilted card center ($\alpha=15^\circ$, $n=+Y$). We test both a uniform and a cosine arm using nested prefixes ($N=16$ shares the same random seed head as $N=64$, which drives $N=256$, etc.). The published target is the mean `Lo_analytic_B` ($Y=\mathbf{0.753613234}$) computed over a small neighborhood of independent streams. The `rel_err` tracks $\vert{}Y(\hat L_o)-Y(L_o)\vert{}/Y(L_o)$ across that mean rather than a single-pixel lottery.

Using the metrics from the $\alpha=15^\circ$ ladder:

| $N$ | unif $L_{oY}$ | unif `rel_err` | cos $L_{oY}$ | cos `rel_err` |
| --- | --- | --- | --- | --- |
| 16 | 0.638092875 | **0.153288654** | 0.625904322 | **0.169462141** |
| 64 | 0.766444683 | **0.017026571** | 0.740971565 | **0.016774743** |
| 256 | 0.770062149 | **0.021826733** | 0.771251976 | **0.023405564** |
| 1024 | 0.758612514 | **0.006633748** | 0.761155903 | **0.010008675** |

The image thumbnails report the cosine arm using localized display rounding (`0.1695`, `0.0168`, `0.0234`, `0.0100`). Always quote the exact table metrics over these visual summaries.

Notice that moving from $N=64$ to $N=256$ produces a temporary error **bump** on both arms (unif $0.017026571\rightarrow 0.021826733$; cos $0.016774743\rightarrow 0.023405564$). This rise is normal within fixed-seed nested sequences. The true algorithmic gate is the final error reduction at $N=1024$, where both arms successfully fall below their respective $N=16$ and $N=64$ markers. Exchanging leads at different rungs simply reflects sample distribution, not a fatal flaw in the weights or PDFs.

Evaluating uniform-$\Omega$ at $\alpha=5^\circ$ introduces severe variance because the cap occupies a tiny fraction of $2\pi$. As recorded in the metrics at $N=256$, unif `rel_err` sits at **0.054307110** against cos at **0.059173158**. Consequently, we use the $\alpha=15^\circ$ ladder as our definitive evaluation gate.

---

## Quote the Metrics. Do Not Quote the Beauty Photographs as Meters.

All baseline numbers derive from the float buffer running on Mesa llvmpipe. Calculations for $\Omega$, $\Omega_\perp$, $E$, $L_o$, and `rel_err` are extracted directly from linear Rec.709 space prior to Neutral tonemapping. Seed **1352782172** and PCG hashing drive the Monte Carlo passes. TM remains Khronos PBR Neutral at $e=1.00$.

| item | value |
| --- | --- |
| $\alpha_A$ / $\alpha_B$ | **5.000°** / **15.000°** |
| $\Omega_A$ / $\Omega_B$ | **0.023909417** / **0.214094348** sr |
| $\Omega_{\perp A}$ / $\Omega_{\perp B}$ | **0.023863926** / **0.210446804** sr |
| $\Omega_B/\Omega_A$ | **8.954394** |
| $E_A$ / $E_B$ (disk) | **0.313739973** / **2.766752422** |
| $E_B/E_A$ | **8.818616** |
| `E_over_omega_ratio` | **0.984837** |
| `naive_alpha_sq_ratio` | **9.000000** (rejected) |
| same-$R$ $\Omega(d=2)$ / $\Omega(d=4)$ | **0.663334** / **0.187600** sr |
| same-$R$ $\Omega$ ratio | **3.536** |
| hemisphere / sphere | **6.283185307** / **12.566370614** sr |
| $L_i$ RGB A and B | **(12.0, 13.2, 16.0)** bit-identical |
| $L_{iY}$ | **13.147** |
| $L_{\mathrm{fill}}$ RGB / $Y$ | **(0.0600, 0.0660, 0.0800)** / **0.065735** |
| disk/fill $Y$ ratio | **200.000** |
| exposure / $\rho$ / $n$ | **1.00** / **0.80** / $+Y$ |
| `Lo_analytic_A_Y` / `Lo_analytic_B_Y` | **0.132081911** / **0.753613234** (disk + fill) |
| $\Omega_\perp(15^\circ,60^\circ)$ / $\cos 60^\circ$ | **0.105223414** / **0.500** |
| `pixels_disk_A` / `pixels_disk_B` | **910** / **7242** (`omega_from_pixels_illegal`) |
| IS-key $3.600^\circ$ | **0.012398431** sr (header; cited) |
| seed / hash | **1352782172** / pcg |

The previous section details the $\alpha=15^\circ$ Monte Carlo ladder. The metrics exclusively retain the card-center A results at $N=256$: unif $L_{oY}$ **0.139254898**, cos $L_{oY}$ **0.139897615**, computing a `rel_err` of **0.054307110** / **0.059173158**.

The definitive parameters are exactly: $E_B/E_A$ **8.818616**; same-$R$ ratio **3.536**; IS-key $\Omega$ **0.012398431**; $L_{iY}$ **13.147**; fill $Y$-ratio **200**; fixed seed **1352782172**; triggering **28 pass / 0 fail**. Do not derive variables directly from visual plates.

---

## Controls

The experiment relies on strictly isolating three key independent variables.

### Size ($\Omega$)

The locked A/B comparison tests $\alpha\in\{5.000^\circ,15.000^\circ\}$ from an on-axis card center at constant radiance. The identity plot incorporates auxiliary ladder rungs at $8^\circ$, $20^\circ$, and $30^\circ$. The same-$R$ area control exists strictly as a calculated metric and caption note, not a re-rendered visual frame.

### Cosine ($\beta$)

Holding the $\alpha=15.000^\circ$ disk fixed in world space, we rotate the card normal to $\beta\in\{0^\circ,60^\circ\}$. The analytical row directly evaluates the cap integral against the simple theoretical approximation $\cos 60^\circ=0.500$.

### MC-$N$

We step a fixed ladder of $N\in\{16,64,256,1024\}$ evaluated at the flat card center. It drives uniform-$\Omega^+$ and cosine-$\Omega_\perp$ estimators using the same random streams and nested prefixes. The core requirement is that both arms fall cleanly to their minimum error states at $N=1024$, accommodating necessary statistical bumps at intermediate sample counts.

Across all plates, the following parameters remain frozen:

* Camera transforms, albedos for the card, walls, and floor, fill radiance, disk RGB, and exposure ($e=1.00$).
* Neutral tone-mapping constants and random seeds.
* The pipeline remains strictly CPU-bound linear RGBA32F $\to$ Neutral $\to$ sRGB OETF, with `GL_FRAMEBUFFER_SRGB` disabled and auto-exposure removed entirely.
* The $Y$-ratio distinguishing the bright disk from the fill hemisphere remains pegged at **200**.
* $\Omega$ evaluates via the exact spherical cap formula; the drawn polygon in the visual output is a geometric approximation that does not redefine the mathematical steradian.

Crucially, $L_i$ is bit-identical between A and B to maintain analytical fairness. Artificially darkening A to make the JPEGs "look balanced" would fundamentally break the control.

---

## Two Paths, Do Not Mix the Instruments

| path | frames | what it is |
| --- | --- | --- |
| **Photograph** | `00`, `01`, `02` | GLSL 330 courtyard running on llvmpipe. Evaluates disk form factor in the shader. Output via Neutral ($e=1.00$) and sRGB OETF. |
| **Instrument** | `03`, `04`, `05`, `06`, `07`, metrics | Exact mathematical diagrams: equal-$\Omega$ grid, $E$–$\Omega_\perp$ plot, projected wedge, nested MC `rel_err`, and closed forms. |
| **Display** | every plate | The linear resolve forces $e=1.00$ $\to$ Neutral $\to$ sRGB OETF. The tone operator is inherited statically. |

While the size plate visualizes the control and delivers the conceptual lesson, the ratio 8.818616 lives strictly in the numerical metrics.

---

## Honesty Gaps

1. **Beauty shading directly relies on a GLSL disk form factor.** The rigorous validation occurs via the card-center analytical identity and CPU estimator, not the courtyard JPEG.
2. **The fill $Y$-ratio is aggressively clamped at 200.** For the tiny $\alpha=5^\circ$ cap, the ambient fill significantly impacts `Lo_analytic_A_Y` (**0.132081911**). At $\alpha=15^\circ$, the disk massively overshadows the fill (`Lo_analytic_B_Y` **0.753613234**). The stated **8.818616** ratio evaluates the disk isolation explicitly.
3. **The tilt integral deviates slightly from pure cosine scaling.** Because $\Omega_\perp(15^\circ,60^\circ)=\mathbf{0.105223414}$ and half of $\Omega_{\perp B}$ is $0.105223402$, they agree only within our strict $5\times 10^{-4}$ tolerance threshold, bounded because the cap stays above the horizon. The $N$ ladder tests only the flat card.
4. **Interreflection is completely absent from the A/B numerical identity,** even though the bounding walls exist to provide context in the courtyard visual.
5. **The `pixels_disk` metrics evaluate a simple luma threshold on the linear frame** prior to Neutral mapping. The **910** and **7242** footprints map to completely distinct frame sizes and aspect ratios, breaking any valid solid angle relationship.
6. **The uniform-$\Omega$ estimator exhibits massive variance at $\alpha=5^\circ$,** which is why the definitive fall gate is established using the $\alpha=15^\circ$ ladder.
7. **The nested $N=256$ estimates intentionally bump relative to $N=64$** on both traces. Standard Monte Carlo mechanics demand tracking the definitive error reduction out to the $N=1024$ milestone.
8. **The published `rel_err` tracks a localized neighborhood mean**, not a single pixel or a global $\mathrm{RMSE}_H$. The rounding displayed on the HUD thumbnails is meant for visual layout, not rigorous quotation.
9. **JPEGs represent strictly 8-bit display-referred data.** The true floating-point values for $\Omega$, $E$, $L_o$, and `rel_err` are evaluated strictly from the raw buffer before OETF compression.
10. **The Neutral constants remain hard-copied** from previous setups rather than re-fitted to this environment.
11. **We employ a purely analytic disk.** Introducing a captured EXR or directional delta would replace the cap integration with a Dirac function, breaking the core premise of evaluating solid angle steradians explicitly.
12. **Both MC arms properly estimate a single integral.** Variations in `rel_err` simply reflect sample distributions at varying $N$ counts. Complex integrand mismatches are detailed in the previous importance-sampling and IBL notes (where the mean luma stays logged at **1.628**).
13. **We expressly reject the naive $9\times$ and $4\times$ approximations.** Mathematical identities firmly lock the ratios to **8.818616** and **3.536**.

---

## Mesa / llvmpipe — What This Run Can Claim

| item | value |
| --- | --- |
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| OSMesa | core 3.3 request; driver reports 4.5 core |
| FBO color | **RGBA32F** complete, $1280\times 720$. 8-bit fallback not hit |
| `GL_FRAMEBUFFER_SRGB` | disabled (Neutral + sRGB OETF on CPU) |
| MSAA | disabled |
| RNG | PCG hash, seed **1352782172** (`0x50A1D15C`) |
| Neutral $e$ | **1.00** |
| disk / fill | analytic cap + named dim hemisphere, $Y$-ratio **200** |
| estimator | uniform-$\Omega$ | cosine-$\Omega_\perp$ | analytic-cap |

**Can claim:** On this controlled OSMesa / llvmpipe stack, rendering an analytical sky cap at a specified $\alpha$ over a Lambertian card strictly produces an irradiance and a one-bounce $L_o$ that exactly tracks $\Omega_\perp=\pi\sin^2\alpha$. The hemisphere grid, the $E$–$\Omega_\perp$ plot, and the projected wedge properly diagram this identity. The CPU estimator outputs exact analytical matches.

**Cannot claim:** We make no claims regarding hardware RT efficiency, real-time budgeting, interactive 1-spp viability, or energy calculations surviving the Neutral tonemapper. We cannot validate pixel footprints as steradians, nor do we validate the naive $9\times$ and $4\times$ area-distance approximations.

---

## Assertions

This run verifies **28 pass / 0 fail**.

| check | result |
| --- | --- |
| FBO is RGBA32F | PASS |
| $\Omega_A=0.023909417$, $\Omega_B=0.214094348$ | PASS |
| $\Omega_{\perp A}=0.023863926$, $\Omega_{\perp B}=0.210446804$ | PASS |
| $\Omega_B/\Omega_A=8.954394$ | PASS |
| $E_B/E_A=8.818616$, and outside $9$ | PASS |
| naive $(15/5)^2=9$, labeled | PASS |
| same-$R$ $\Omega$ ratio $=3.536$, and outside $4$ | PASS |
| $L_{iY}=13.147$; disk/fill $Y$ $\ge 100$ | PASS **200** |
| $L_i$ RGB bit-identical A/B | PASS |
| MC $\alpha=15^\circ$: `rel_err` at $N=1024$ below $N=16$ and below $N=64$, both arms | PASS |
| $\Omega_\perp(15^\circ,60^\circ)$ within $5\times 10^{-4}$ of $\Omega_\perp\cos 60^\circ$ | PASS **0.105223414** |
| hero, size, grid, $E$ vs $\Omega_\perp$, wedge, metrics plates | PASS |
| `pixels_disk_B>20`, `pixels_disk_A>0` | PASS **7242** / **910** |

Zero tolerances were expanded to forcibly accept the $E_B/E_A=9$ or same-$R$ ratio of 4 approximations.

---

## Out of Scope

The following topics deliberately fall outside the bounds of this note: Phong-versus-cosine bake-offs, MIS balance heuristics, GGX VNDF, Smith $G$, and the half-vector Jacobian (cite the [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) note for detailed pdf–integrand mismatches). Split-sum, Karis prefilters, DFG LUTs, and HDR processing belong to the [IBL](/posts/p/split-sum-image-based-lighting/) note. Tone-mapping evaluations are deferred to the [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) note. Fully featured path tracing components (multi-bounce GI, NEE, Russian roulette, spectral transport, media) are entirely separate. Hardware acceleration algorithms, DLSS/SVGF/OIDN processing, LTC implementations, directional deltas, IES profiles, microfacet metals, shadow maps, and anisotropic footprint analyses are specifically excluded from this fundamental measure lockdown.

---

## Measure Lock

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

The hero image stands strictly as a presentation element, and the size A/B plate operates as the core teaching pair. The grid, $E$ vs $\Omega_\perp$, and wedge charts supply our mathematical fingerprints, while the MC-$N$ plate validates the estimator logic. Path tracers fundamentally sample $d\omega$, and irradiance firmly tracks $\Omega_\perp$. Where our previous note evaluated densities correctly built in $1/\mathrm{sr}$, this iteration mathematically draws and proves the steradian itself.
