---
title: "Multiple Importance Sampling and the Balance Heuristic"
description: "Kiln-mouth glaze shelf. Balance weights two legal arms so neither BSDF nor light sampling alone owns the lip or the miss."
date: 2026-09-26
tags:
  - graphics
  - engine
  - lighting
math: true
video:
  src: /assets/journal/multiple-importance-sampling-and-the-balance-heuristic/mis-explainer.mp4
  poster: /assets/journal/multiple-importance-sampling-and-the-balance-heuristic/mis-explainer-poster.jpg
  vtt: /assets/journal/multiple-importance-sampling-and-the-balance-heuristic/mis-explainer.vtt
  caption: "Animated explainer (5 min, English captions): where fireflies come from, and how the balance heuristic tames them. The written note with full metrics follows below."
cover: /assets/journal/multiple-importance-sampling-and-the-balance-heuristic/00_hero.jpg
---

In [Light Sampling and the Area Jacobian](/posts/p/light-sampling-and-the-area-jacobian/), we established an admissible light sampling density over directional measure \(d\omega\). Earlier, [Importance Sampling: Phong Lobe vs Cosine](/posts/p/importance-sampling-phong-lobe-vs-cosine/) evaluated two BSDF probability density functions for a single surface integral, both parameterized natively in \(1/\mathrm{sr}\). Here, we unify both strategies to evaluate direct illumination from an area source across a kiln mouth.

We consider two distinct sampling distributions to evaluate the direct radiance integral. The first is driven by a Phong–Lambert BSDF. The second draws samples uniformly across a planar rectangular emitter and transforms that area measure via the geometric Jacobian. Evaluated against their respective sampling densities, each independent estimator is strictly unbiased; crucially, their variance profiles are complementary, exhibiting high variance in domains where the alternate strategy remains well-behaved. The balance heuristic combines both techniques by weighting each sample according to its normalized relative density:

\[w_i=\frac{p_i}{p_{\mathrm{bsdf}}+p_{\mathrm{light}}}.\]

Under an equal sample allocation across techniques, the sample counts \(n_i\) cancel identically, preserving the canonical balance weight formulation \(w_i=p_i/(p_{\mathrm{bsdf}}+p_{\mathrm{light}})\). The resulting combined estimator remains provably unbiased. The area-to-solid-angle conversion in the light-sampling density retains the quadratic distance term \(r^2\); neglecting this term or omitting the emitter foreshortening factor introduces a systematic bias, an error mode analyzed in detail in our area Jacobian discussion.

The variance characteristics of dual-BSDF sampling, including the normalization distinction between \((s+1)\) in the sampling PDF and \((s+2)\) in the evaluated BRDF under a horizon boundary rule, are preserved from [Importance Sampling: Phong Lobe vs Cosine](/posts/p/importance-sampling-phong-lobe-vs-cosine/). From [Light Sampling and the Area Jacobian](/posts/p/light-sampling-and-the-area-jacobian/), the emitter density transformed to directional measure is defined as:

\[p(\omega)=p(A)\,\frac{r^2}{n_y\cdot\omega}.\]

We instantiate this directional density directly as \(p_{\mathrm{light}}\). Furthermore, the projected solid angle subtended by the diffuse component uses the signed contour formulation established in [Solid Angle and the Rendering Equation](/posts/p/solid-angle-and-the-rendering-equation/).

The test environment comprises the **kiln-mouth glaze shelf** benchmark: a planar rectangular muffle aperture set flush within an array of firebrick, illuminating a pale ceramic glaze tile on a stoneware support alongside two pyrometric cones and a wooden rib serving as scale references. The virtual camera is positioned at low grazing angles along the shelf, oriented toward the aperture.


![Cover. Kiln-mouth glaze shelf: a rectangular muffle mouth flush in firebrick, one pale glaze tile on a stoneware shelf, two matte pyrometric cones and a wooden rib for scale. Balance arm at N=1024 plus the analytic diffuse fill. Khronos PBR Neutral e=1.00. Photograph only — Lo,Y and the RMSE are not this frame.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/00_hero.jpg)

Numerical benchmarks were executed on Mesa 25.0.7 llvmpipe in linear Rec.709, displaying via **Khronos PBR Neutral** (\(e=\mathbf{1.00}\)) under pseudorandom seed **20260926**. Surface reflectance parameters are specified as \(k_d=0.34\), \(k_s=0.28\), and specular exponent \(s=160\). Source emitter radiance is configured to \(L_i=(7.5,\,4.8,\,2.2)\), yielding a luminance of \(L_{i,Y}=5.186299999999999\). The aperture area spans \(0.2596\,\mathrm{m}^2\), with an exact bounding product of \(0.2595999999999999\).

Two probe locations on the receiver tile exhibit divergent integrand behaviors:

* At the specular highlight boundary (the lip), \(x_L=(0.04,\,0.90,\,0.40)\), the aperture subtends a projected solid angle of \(\Omega_\perp=\mathbf{0.3212572527424995}\,\mathrm{sr}\), yielding exitant luminance \(L_{o,Y}=\mathbf{0.8922731625666653}\) and a specular-to-diffuse ratio of \(\mathbf{3.948324937768523}\).
* At an off-specular observation point (the miss), \(x_M=(-0.28,\,0.90,\,0.28)\), the projected solid angle is \(\Omega_\perp=\mathbf{0.2742559005975028}\,\mathrm{sr}\), with \(L_{o,Y}=\mathbf{0.1539368726945163}\) and a specular-to-diffuse quotient of \(2.114893779357608\times 10^{-10}\), rendering the specular contribution negligible relative to the Lambertian diffuse component.

Evaluating the minimum root-mean-square error demonstrates that the BSDF sampling arm dominates at the lip across sample counts \(N=64\) and \(N=1024\), whereas the light sampling arm dominates at the miss location across the same allocations (`winner_lip_N64`, `winner_lip_N1024`, `winner_miss_N64`, `winner_miss_N1024`).

Convergence was tracked across sample budgets \(N\in\{16,64,256,1024\}\). At the lip position, the relative RMSE evolves as follows:

* BSDF sampling: \(0.2140099356194824\to 0.03737322030225639\)
* Light sampling: \(0.7304631415769416\to 0.07772808316858408\)
* Balance heuristic: \(0.2677916704168401\to 0.0394574853759122\)

At the off-specular miss location, the error convergence is:

* BSDF sampling: \(1.127800620513927\to 0.121007411701054\)
* Light sampling: \(0.1665406649163094\to 0.02502486831590404\)
* Balance heuristic: \(0.2027174941744856\to 0.03449795333963287\)

Spatial standard error evaluated over a 12 mm radius measurement disk at \(N=64\) corroborates these variance regimes. At the lip probe, light sampling exhibits an elevated disk mean standard error of \(\mathbf{0.3079049113038804}\) (reported in summary as **0.308**) compared to \(0.1197899661872358\) for BSDF sampling, while the combined balance estimator achieves \(0.1312898735904618\). Conversely, at the miss probe, BSDF sampling degrades to a disk mean error of \(0.0772988573354273\) versus \(0.01309165077371938\) for light sampling, with the balance heuristic settling at \(0.01779797833390362\).

Evaluating the directional densities and assigned weights directly along the perfect specular reflection vector at the lip reveals:

* \(p_{\mathrm{bsdf}}=11.65879108669897\)
* \(p_{\mathrm{light}}=0.956701082414125\)
* \(w_{\mathrm{bsdf}}=0.9241645851315697\)
* \(w_{\mathrm{light}}=0.07583541486843028\)

All integration tolerances and validation suites satisfy the test harness constraints (**53 pass / 0 fail**).

The variance distribution across the tile provides the central experimental comparison. The standard error map across the \(N=64\) evaluations illustrates that the light-sampling technique exhibits pronounced variance spikes along the specular perimeter (screen-right, \(x=0.04\)) while maintaining minimal noise across off-specular regions (screen-left, \(x=-0.28\)). Conversely, the BSDF sampling distribution exhibits severe variance across the off-specular region where rays fail to hit the aperture. The balance heuristic tracks close to the optimal low-variance arm in both regimes, bounding variance across the spatial domain without requiring explicit a priori classification of the dominant transport mode.


![Teaching pin. Shared-scale standard error of the N=64 draws on the glaze tile. Left bsdf, middle light, right balance. Turbo on the tile; the room is a flat dark field outside the scale. Two 12 mm rings: screen-left is the miss at x=-0.28, screen-right is the lip at x=0.04. Lip light disk mean 0.3079049113038804 against BSDF 0.1197899661872358; miss BSDF 0.0772988573354273 against light 0.01309165077371938. Balance sits below the hot ring at both points. Scale maximum 0.9246898237889386 is one tile pixel, not the disk mean. Authored sRGB. Not Neutral. Not a photograph of radiance.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/02_variance.jpg)

## Scene
The radiometric pipeline operates entirely in scene-referred linear Rec.709. For visualization, tone mapping utilizes Khronos PBR Neutral with parameters \(e=1.00\), \(F_{90}=0.04\), \(K_s=0.76\), and \(K_d=0.15\), followed by the IEC 61966-2-1 sRGB opto-electronic transfer function (OETF) evaluated at 64-bit precision.

* **Kiln environment**: Visualized using the balance heuristic at \(N=1024\) combined with an analytic diffuse component at \(1280\times 720\) resolution, illustrating the aperture, surrounding masonry, and reference geometry.
* **Three-arm comparative evaluation**: Direct visual comparisons of BSDF sampling, emitter sampling, and the balance heuristic at \(N=64\) across 640 by 720 subpanels (assembled into a 1920 by 720 frame). The optical setup maintains a 46 degree vertical field of view under Khronos PBR Neutral. Noticeable high-frequency variance appears in the BSDF frame where specular samples miss the light source, whereas emitter sampling generates isolated high-luminance outliers on the specular reflection boundary.

![Three legal arms at one N. Left bsdf, middle light, right balance. Each panel is 640 by 720, assembled to 1920 by 720, N=64, same eye, same target, same 46 degree vertical field. Khronos PBR Neutral e=1.00 on every panel. The BSDF panel carries grain where the highlight has left the mouth. The light panel carries bright specks on the reflected mouth. Balance keeps the reflection and quiets both failures. A light-arm speck at this N can shoulder to white; the size of that speck is the standard error on the variance plate. Photograph only.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/01_three_arms.jpg)

* **Variance error plate**: Renders the per-pixel empirical standard error of the \(N=64\) estimator across all three configurations under a unified colormap scale. The scale ceiling is normalized to the peak single-pixel variance observed on the tile, `stderr_scale_max` \(=0.9246898237889386\). The mean error within the 12 mm measurement disk at the lip under light sampling (\(0.3079049113038804\)) reaches roughly one third of this absolute peak. Off-tile background elements are masked outside the metric scale.
* **Convergence ladder**: Compares relative RMSE across discrete budgets \(N\in\{16,64,256,1024\}\) evaluated against high-precision reference quadrature for both probe coordinates. Each row uses an independent vertical normalization.

![Ladder. Relative RMSE against N at the lip (top) and the miss (bottom). Blue bsdf, orange light, green balance. N is categorical: 16, 64, 256, 1024 equally spaced. Each row has its own vertical scale, so the tall marks are not one number. At the lip the light arm is the high curve and balance tracks just above bsdf. At the miss the BSDF arm is the high curve and balance tracks just above light. Every series falls. The digits live in the table, not on the chart.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/03_ladder.jpg)

* **Run metrics summary**: Summary capture containing configuration parameters (seed 20260926, projected solid angle \(\Omega_\perp\), exitant luminance \(L_{o,Y}\), RMSE convergence ladders, localized disk standard errors, convergence winners, and verification suite assertions 53 pass / 0 fail).


![Metrics strip. A two-column picture of this run's table: seed 20260926, mouth area, Omega_perp, Lo,Y, the RMSE ladder, disk standard errors, winners bsdf / bsdf / light / light, furnace mean, Lambert residual, 53 pass / 0 fail. Quote the table in the text. Not a cover.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/04_metrics.jpg)

To avoid misinterpreting the data, two methodological representations are strictly delineated:

1. **Rendered photographs** depict display-referred outputs transformed via Khronos PBR Neutral and sRGB transfer functions. Radiometric quantities, solid angles, and absolute errors cannot be extracted from display code values; at low sampling rates (\(N=64\)), extreme sample weights under light sampling may compress to the display white point.
2. **Instrumentation plates and tables** represent uncompressed double-precision numerical evaluations computed directly from the Monte Carlo estimators. Absolute physical metrics should always be referenced from the tabulated data.

## Method

### Two legal arms on one mouth
The rendering equation evaluated at a coordinate on the receiver tile demands an integral over directional measure. The BSDF sampling arm constructs this domain from a mixture distribution: with probability \(\pi_d\), it draws from a cosine-weighted hemisphere about the surface normal, and with complementary probability, it draws from a Phong lobe centered on the ideal reflection of the view vector. The light sampling arm draws a uniform areal sample from the planar aperture, transforming this area density to directional measure via the geometric Jacobian. Both estimators evaluate outgoing radiance \(L_o\), fully accommodating the specular component.

The analytic diffuse form \(E=L_i\Omega_\perp\) serves as ground truth strictly for the Lambertian contribution. Assessing a glossy estimator against \(L_i\Omega_\perp\) and identifying the residual as bias represents a methodological error. At the specular boundary (the lip), the specular contribution dominates the diffuse component by approximately a factor of four. At the off-specular location (the miss), the specular term vanishes, and the estimators converge cleanly to the diffuse ground truth.

**Lip.** The ideal reflection vector cast from \(x_L\) intersects the emitter plane exactly at \((0,\,1.13,\,0)\). (The numerical output in the metrics table evaluates this intersection precisely as \((1.387778780781446\times 10^{-17},\,1.13,\,0)\)). This coordinate lies 80 mm above the sill and 0.22 m from either lateral edge. Because the Phong lobe (with exponent 160) is centered precisely on this intersection, the specular sampling distribution heavily favors the active emitter. The aperture subtends a solid angle of \(0.3212572527424995\,\mathrm{sr}\). An exponent of this magnitude restricts the effective lobe support to a cap of approximately \(2\pi/(s+1)\approx 0.039\,\mathrm{sr}\), rendering the aperture approximately eight times larger than the primary lobe region. Consequently, a uniform areal draw across the emitter frequently misses the high-density peak, but infrequently places a sample directly within it. These sparse, high-density hits induce extreme variance (fireflies) under light sampling. The BSDF arm, aligned natively with the lobe peak, maintains bounded variance. In visual evaluation, this light sampling failure manifests as localized speckling along the lower boundary of the reflected aperture.

**Miss.** The ideal reflection vector cast from \(x_M\) fails to intersect the emitter. The computed intersection evaluates to \((-0.3814786798045011,\,1.044538867186654,\,0)\), missing laterally past the left edge and vertically below the sill. The maximum dot product \(R\cdot\omega\) across the entire emitter domain evaluates to \(0.8789249543972235\), located roughly \(28^\circ\) off the ideal reflection axis. Furthermore, this observation angle is significantly more grazing: \(n\cdot\omega_o=0.4366167162249477\) at the miss, compared to \(0.4966085446506598\) at the lip. The specular integral evaluates numerically to zero in this configuration. The entire evaluated radiance derives from the Lambertian component distributed cleanly over the aperture. Nevertheless, the mixture density statically assigns \(\pi_s\) of its samples to a specular lobe that fails to intersect the emitter. A given cosine-weighted sample intersects the aperture with probability \(\Omega_\perp/\pi\), approximately \(0.087\) at this location. Light sampling, conversely, correctly stratifies every sample across the active emitter. Given the low frequency of the Lambertian integrand across the rectangular domain, the area-sampled estimator exhibits minimal variance. Visually, the BSDF sampling failure manifests as pronounced high-frequency noise on the tile where the specular highlight has detached from the active light source.

**Balance.** Under the balance heuristic, each sample weight is formulated as its generating density normalized by the sum of all evaluated densities. When an area-sampled ray lands directly within the narrow specular lobe—where \(p_{\mathrm{bsdf}}\) evaluates to an extreme magnitude—it receives a severely attenuated weight. This mechanism rigorously suppresses the firefly variance at the lip. Evaluated precisely at the mirror intersection, the light sample weight is throttled to \(w_{\mathrm{light}}=0.07583541486843028\), while the BSDF sample, drawn natively from the optimal density, dominates at \(w_{\mathrm{bsdf}}=0.9241645851315697\).

Conversely, when a BSDF sample intersects the emitter far along the Lambertian flank—where \(p_{\mathrm{light}}\) represents the optimal area density—it is similarly down-weighted. If either constituent density evaluates to zero, the opposing weight resolves to 1. Sample rays that miss the emitter entirely evaluate to zero integrand regardless. The combined estimator remains provably unbiased provided each constituent technique is individually unbiased and the resulting weights form a valid partition of unity over the non-zero integrand support.

The balance heuristic successfully bounds the maximum error, tracking consistently below the inferior sampling technique across all discrete budgets from \(N=16\) through \(N=1024\), and constraining the localized error within the spatial standard error disks. It does not strictly guarantee lower variance than the optimal single technique for a given spatial location. At the lip probe, the pure BSDF arm achieves lower absolute error. At the miss probe, the pure light arm minimizes error. The balance heuristic tracks just above the BSDF error curve at the lip (bounding far below the light arm) and tracks just above the light error curve at the miss.

All three sampling strategies evaluated here represent mathematically valid estimators. The tone mapping (Neutral) is applied consistently across all panels in the visual comparisons because none of the evaluated techniques suffers from divergent weighting errors.

### The balance weight
We establish the foundational geometry and radiometric quantities for a single evaluation point \(x\), an outgoing direction \(\omega_o\), and a rectangular source region:

| symbol | meaning | unit |
| --- | --- | --- |
| \(x\) | shade point on the tile | \(\mathrm{m}\) |
| \(y\) | point on the mouth | \(\mathrm{m}\) |
| \(r\) | \(\lVert y-x\rVert\) | \(\mathrm{m}\) |
| \(\omega_i\) | \((y-x)/r\), tile toward the mouth | unitless |
| \(\omega_o\) | direction from \(x\) toward the eye | unitless |
| \(n_x\) | tile normal, \(+Y\) | unitless |
| \(n_y\) | mouth normal, \(+Z\), into the room | unitless |
| \(\cos_x\) | \(n_x\cdot\omega_i\) | unitless |
| \(\cos_y\) | \(n_y\cdot(x-y)/r=x_z/r\) | unitless |
| \(A\) | mouth area | \(\mathrm{m}^2\) |
| \(p(A)\) | \(1/A\) on the mouth, else 0 | \(\mathrm{m}^{-2}\) |
| \(R\) | \(2(n_x\cdot\omega_o)\,n_x-\omega_o\) | unitless |
| \(s\) | Phong exponent, 160 on the hero | unitless |
| \(k_d,\,k_s\) | Lambert weight, Phong weight | unitless |
| \(\pi_d,\,\pi_s\) | \(k_d/(k_d+k_s)\), \(k_s/(k_d+k_s)\) | unitless |
| \(L_i\) | constant one-sided mouth radiance | linear Rec.709 |
| \(\ell\) | mouth integrand | linear Rec.709 |
| \(L_o\) | outgoing radiance from the mouth | linear Rec.709 |
| \(\Omega_\perp\) | projected solid angle of the mouth | \(\mathrm{sr}\) |
| \(p_{\mathrm{bsdf}},\,p_{\mathrm{light}}\) | the two densities | \(\mathrm{sr}^{-1}\) |
| \(N\) | integrand evaluations in one estimate | count |
| \(n\) | \(N/2\), the count of each technique inside balance | count |

We note that both directional cosines are strictly positive across every evaluation point on the source for both camera instrument positions. The measured spatial minima evaluate to \(\min\cos_x=0.2999400179940021\) at the lip and \(0.2532209156959798\) at the miss, alongside \(\min\cos_y=0.4543108504242547\) at the lip and \(0.2991616902194818\) at the miss.

**BSDF.** The scattering function comprises a Lambertian component and a Lafortune-parameterized Phong lobe aligned with the reflection vector \(R\). The formulation remains achromatic, sharing the exact decomposition detailed in our prior importance-sampling analysis.

\[f_r(\omega_i)=\frac{k_d}{\pi}+k_s\frac{s+2}{2\pi}\,(R\cdot\omega_i)_+^{\,s}.\]

\[\begin{aligned} p_{\cos}(\omega)&=\frac{n_x\cdot\omega}{\pi}, & n_x\cdot\omega>0,\\ p_{\mathrm{phong}}(\omega)&=\frac{s+1}{2\pi}\,(R\cdot\omega)_+^{\,s}, & R\cdot\omega>0,\\ p_{\mathrm{bsdf}}(\omega)&=\pi_d\,p_{\cos}(\omega)+\pi_s\,p_{\mathrm{phong}}(\omega). \end{aligned}\]

Our locked geometric reflection parameters are \(k_d=0.34\), \(k_s=0.28\), and \(s=160\). This parameterization yields discrete mixture weights of \(\pi_d=0.34/0.62\) and \(\pi_s=0.28/0.62\). The evaluation pipeline strictly logs these as \(\pi_d=0.5483870967741935\) and \(\pi_s=0.4516129032258064\).

Observe that the BRDF normalization utilizes the constant \((s+2)\), whereas the probability density normalizes by \((s+1)\). At \(s=160\), this distinction amounts to a fractional offset of exactly \(1/161\). Consequently, evaluating a standard white furnace test at our primary exponent provides limited sensitivity to a swapped normalization term. However, the ratio \(f_{\mathrm{spec}}/p_{\mathrm{phong}}=k_s(s+2)/(s+1)\) affords a direct algebraic verification. To expose a swapped constant empirically, the furnace must be evaluated over a broader distribution, such as \(s=8\). At this exponent, the numerical mean evaluates to \(0.619901030295896\) against the reference albedo \(k_d+k_s=0.62\), thereby exposing a relative discrepancy of approximately \(1.6\times 10^{-4}\).

Evaluating the BSDF operates algorithmically as a unified sampling technique. We draw standard uniform variates \(\xi_c,\xi_1,\xi_2\). If \(\xi_c<\pi_d\), we sample the cosine-weighted hemisphere (\(\cos\theta=\sqrt{\xi_1}\), \(\phi=2\pi\xi_2\)). Otherwise, we sample the Phong lobe centered on \(R\) (\(\cos\theta=\xi_1^{1/(s+1)}\), \(\phi=2\pi\xi_2\)). The cumulative geometric contribution is subsequently divided by the total marginal density \(p_{\mathrm{bsdf}}(\omega)\). It is critical that the balance heuristic evaluates this complete marginal mixture; dividing solely by the active component density fundamentally alters the statistical expectation. If \(n_x\cdot\omega\le 0\), the integrand converges to 0, the sample contributes to the fixed budget, and \(p_{\mathrm{phong}}\) remains unrenormalized, strictly preserving the importance-sampling horizon constraint. At both focal points, the lobe axis rests safely above the geometric horizon, yielding horizon fractions of identically 0.

**Light density.** Assuming the light source resides in the positive half-space and the generated ray successfully intersects the rectangular bound, the spatial density transforms to solid angle as:

\[p_{\mathrm{light}}(\omega)=\frac{1}{A}\,\frac{r^2}{\cos_y}.\]

Otherwise, \(p_{\mathrm{light}}=0\). This expression formalizes the standard area-to-solid-angle Jacobian mapping. A sample failing to intersect the geometric bound contributes exactly 0, as \(L_i=0\) uniformly outside the active area. The underlying spatial sampling strategy, parameterized by \(u,v\in[0,1)\), is defined as:

\[y=\bigl(X_0+u(X_1-X_0),\; Y_0+v(Y_1-Y_0),\; 0\bigr).\]

**Integrand.** For the direct illumination originating exclusively from the mouth (the analytic fill operates independently of these integration arms), the integrand is formulated as:

\[\ell(\omega_i)=f_r(\omega_i)\,L_i\,\cos_x\]

This holds strictly when the ray intersects the emitter and both bounding cosines remain positive. Otherwise, \(\ell=0\). The final outgoing radiance integral becomes:

\[L_o=\int_{\Omega^+}\ell(\omega)\,d\omega.\]

The spatial formulation provides an algebraically equivalent expansion for the light-arm contribution:

\[\frac{\ell}{p_{\mathrm{light}}}=f_r\,L_i\,\cos_x\,\cos_y\,\frac{A}{r^2}.\]

The emitter cosine in the numerator fundamentally represents geometric foreshortening, precisely inverting the Jacobian transformation rather than duplicating it. Should an erroneous \(\cos_y\) be introduced or the \(r^2\) term be omitted, the expected Lambertian reduction will immediately diverge.

**Balance heuristic (equal sampling).** For any arbitrary technique \(i\) drawing \(n_i\) samples, the generalized multiple importance sampling weight is defined as \(n_i p_i\big/\sum_j n_j p_j\). Because the present formulation allocates an identical sample count \(n=N/2\) to both evaluated strategies, the discrete counts gracefully cancel:

\[w_{\mathrm{bsdf}}=\frac{p_{\mathrm{bsdf}}}{p_{\mathrm{bsdf}}+p_{\mathrm{light}}},\qquad w_{\mathrm{light}}=\frac{p_{\mathrm{light}}}{p_{\mathrm{bsdf}}+p_{\mathrm{light}}}.\]

Across the nonzero support of \(\ell\), both probability densities are strictly positive at our evaluation points. Because the source resides in the forward hemisphere, the cosine component of \(p_{\mathrm{bsdf}}\) remains positive, and \(p_{\mathrm{light}}\) is strictly positive on the domain of the mouth. Consequently, \(w_{\mathrm{bsdf}}+w_{\mathrm{light}}=1\). Floating-point evaluation confirms the lip-direction pair sums precisely to 1 within a numerical tolerance of \(10^{-12}\).

Off the source entirely, \(p_{\mathrm{light}}=0\). Should a BSDF ray fail to intersect the emitter, it receives a balance weight of \(w_{\mathrm{bsdf}}=1\), though its underlying integrand evaluates identically to 0. Conversely, any sampled direction where \(p_{\mathrm{bsdf}}=0\) and \(p_{\mathrm{light}}>0\) simply receives \(w_{\mathrm{light}}=1\). The combination cleanly partitions unity anywhere the target integrand has a chance to be nonzero. For unconditionally stable evaluation (used whenever \(p_{\mathrm{light}}>0\)), we prefer \(w_{\mathrm{light}}=1/(1+p_{\mathrm{bsdf}}/p_{\mathrm{light}})\), avoiding unnecessary overflow while yielding the exact same numeric outcome as the raw rational function.

**Three-arm budget evaluation.** We evaluate performance under total sample budgets of \(N\in\{16,64,256,1024\}\). Here, "budget" strictly denotes the total allocation of integrand evaluations. Evaluating the secondary PDF to compute the balance weight does not constitute an additional spatial sample.

\[\begin{aligned} \widehat L_{\mathrm{bsdf}}&=\frac1N\sum_{j=1}^{N}\frac{\ell(\omega_j)}{p_{\mathrm{bsdf}}(\omega_j)},\\ \widehat L_{\mathrm{light}}&=\frac1N\sum_{j=1}^{N}\frac{\ell(\omega_j)}{p_{\mathrm{light}}(\omega_j)},\\ \widehat L_{\mathrm{bal}} &=\frac1n\sum_{j=1}^{n} w_{\mathrm{bsdf}}(\omega_j)\,\frac{\ell(\omega_j)}{p_{\mathrm{bsdf}}(\omega_j)} +\frac1n\sum_{j=1}^{n} w_{\mathrm{light}}(y_j)\,\frac{\ell(y_j)}{p_{\mathrm{light}}(y_j)}. \end{aligned}\]

The \(1/n\) normalization factor is rigorously required. Applying a \(1/N\) scale to the independent balance sums would inadvertently halve the statistical expectation. The technique allocation remains strictly deterministic: the first \(n\) evaluations are drawn from the BSDF stream, and the subsequent \(n\) originate from the spatial light stream.

**Analytic Fill.** Computed downstream of the stochastic evaluation, this diffuse-only term guarantees identical integration across all parallel estimators. Because both instrument configurations maintain the source strictly within the positive hemisphere, the fill component evaluates to:

\[L_{o,\mathrm{fill}}=\frac{k_d}{\pi}\,L_{\mathrm{fill}}\,(\pi-\Omega_\perp).\]

The published empirical statistics and mean profiles explicitly exclude this fill radiance, comparing the stochastic mouth integral strictly against the partial quadrature \(L_o\). Matte surfaces natively leverage the analytic Lambertian expression parameterized by their local albedo and bypass Phong evaluation entirely. The resulting background fill radiance evaluates to \((0.012,\,0.014,\,0.018)\), yielding a stable luminance of \(Y=1.3863600000\times 10^{-2}\).

**Ground truth.** The diffuse integration component reduces analytically to the signed, four-corner projected solid angle. Vertex ordering inherently governs the sign. Our evaluation framework yields \(\Omega_\perp>0\) at both geometric points.

\[E=L_i\,\Omega_\perp,\qquad L_{o,d}=\frac{k_d}{\pi}\,E.\]

The specular integration lacks a closed-form equivalent. The total absolute outgoing radiance \(L_o\), including this specular reflection, is established via a tensor-product Gauss–Legendre quadrature over the domain of the rectangle. This employs an \(8\times 8\) cell discretization with order 40 per cell (denoted systematically as `gauss_legendre_8x40`). A reduced \(6\times 32\) integration rule maintains numerical agreement to within a relative threshold of \(10^{-8}\) on \(Y\) at both spatial positions. The diffuse-only quadrature similarly matches the analytic \(L_{o,d,Y}\) to within a relative \(10^{-9}\). The published \(L_{o,Y}\) strictly reflects the heavy order 40 integration schema.

**Exponent selection.** The parameterized Phong distribution broadly localizes energy across a solid angle of approximately \(2\pi/(s+1)\approx 0.039\,\mathrm{sr}\) for \(s=160\). At the lip position, the source solid angle significantly exceeds this compact footprint; consequently, uniform area samples largely miss the primary specular lobe, whereas Phong samples naturally converge on the active region. Conversely, at the miss position, evaluating the narrow specular exponent over the source extent yields entirely negligible energy compared to the Lambertian response. If we utilized an exponent wide enough to artificially blanket this specific light source, it would trivially prevent the light arm from fireflying.

**Error analysis.** We evaluate convergence behavior using \(K=32\) independent sequences, uniquely seeded at 20260926 via SplitMix64, which systematically maps the highest 53 bits directly to uniform variates in \([0,1)\). The stream indexed at 0 initiates with the sequence \(0.7466817377103402\), \(0.669510631620856\), \(0.5708748435191999\). We quantify error on the linear Rec.709 \(Y\) channel (incorporating standardized spectral weights \(0.2126\), \(0.7152\), and \(0.0722\)) directly against the quadrature baseline:

\[\mathrm{rel}_k(N)=\frac{\widehat L_{k,Y}(N)-L_{o,Y}}{L_{o,Y}}, \qquad \mathrm{rmse}(N)=\sqrt{\frac1K\sum_k\mathrm{rel}_k(N)^2}.\]

The draws are strictly IID. We evaluate convergence natively via the RMSE aggregated across the \(K\) prefixes. A single realization of a heavy-tailed spatial light arm can experience massive variance while the cumulative estimator rigorously remains completely unbiased.

**Standard error on the variance plate.** This diagnostic metric leverages the identical \(N=64\) sequences utilized for the three-arm composite. For an independent technique, the sample variance of the Rec.709 \(Y\) responses naturally uses \(N-1\) degrees of freedom, yielding \(\mathrm{stderr}=\sqrt{s^2/N}\). Under balance heuristics, we strictly accumulate \(n=32\) weighted evaluations per technique:

\[\mathrm{stderr}=\sqrt{\frac{s_b^2}{n}+\frac{s_l^2}{n}}.\]

The two foundational techniques are strictly isolated during accumulation. The analytic fill resides externally as a spatial constant. The final quoted distribution figures reflect the arithmetic mean of this per-pixel standard error, evaluated continuously within a 12 mm radius.

## Discussion

### The kiln mouth
The environment operates in meters within a right-handed coordinate system, where \(Y\) represents the up vector. The sole emitter within the scene is the muffle mouth, bounded by the plane \(z=0\), with lateral extents \(x\in[-0.22,\,0.22]\) and vertical extents \(y\in[1.05,\,1.64]\), possessing an outward normal oriented toward \(+Z\). These dimensions define a width of \(0.44\,\mathrm{m}\) and a height of \(0.59\,\mathrm{m}\), yielding a total area of \(A=0.2596\,\mathrm{m}^2\). As emission is strictly one-sided, the region \(z<0\) generates no radiance. The exposure is fixed at \(1.00\).

The eye position is derived via a reflection construction that cleanly maps the mirror ray of the lip onto the selected target, ensuring the inset evaluates to an identity mapping.

| Parameter | Value |
| --- | --- |
| eye | \((0.1453673781693574,\; 1.505862424473805,\; 1.453673781693575)\) |
| target | \((0,\; 1.18,\; 0.28)\) |
| vertical FOV | \(46^\circ\) |

| Metric | lip | miss |
| --- | --- | --- |
| \(\Omega_\perp\) | \(0.3212572527424995\,\mathrm{sr}\) | \(0.2742559005975028\,\mathrm{sr}\) |
| \(E_Y\) | \(1.666136489898425\) | \(1.422373377268829\) |
| \(L_{o,d,Y}\) | \(0.1803182235985176\) | \(0.1539368726619603\) |
| \(L_{o,Y}\) | \(0.8922731625666653\) | \(0.1539368726945163\) |
| specular / diffuse | \(3.948324937768523\) | \(2.114893779357608\times 10^{-10}\) |
| \(E_Y/E_{\mathrm{fill},Y}\) | \(42.61218441186641\) | \(35.78152895218164\) |
| \(n\cdot\omega_o\) | \(0.4966085446506598\) | \(0.4366167162249477\) |

Because \(f_r\) remains achromatic, \(L_o\) and \(E\) uniformly share a single scalar relationship across all color channels with \(L_i\). The mouth radiance substantially dominates the ambient fill at both evaluation points. The glaze tile acts as the sole Phong surface in the entire scene, with its top surface situated at \(y=0.900\). Both camera instruments—and the 12 mm evaluation disks localized around them—rest flush against this surface. All other environmental geometry (including the shelf, pyrometric cones, rib, firebrick, and floor) is strictly matte. Because the cones and rib are positioned exclusively on the camera side of both instruments, any line segment constructed from either instrument to the mouth avoids intersection. Consequently, the estimator operates entirely unoccluded. Structural corners oriented away from the mouth remain dark, as the back wall is coplanar with the mouth and the background fill provides only constant Lambertian ambient illumination without secondary bounces. Furthermore, there are no contact shadows beneath the cones.

Evaluating the distance ratios, we observe \(r_{\max}/r_{\mathrm{closest}}\) equal to \(2.06098792642672\) for the lip and \(2.89530225013162\) for the miss. This confirms that the Jacobian is non-constant across the source domain. We note, however, that these ratios do not constitute an omission floor, nor do we plot one in this analysis.

### The ladder
At the lip position, we evaluate the relative RMSE against the reference \(L_{o,Y}=0.8922731625666653\):

| \(N\) | BSDF | light | balance |
| --- | --- | --- | --- |
| 16 | \(0.2140099356194824\) | \(0.7304631415769416\) | \(0.2677916704168401\) |
| 64 | \(0.08843426554976692\) | \(0.4514279104903152\) | \(0.1654913366919019\) |
| 256 | \(0.05961818706512619\) | \(0.1422980316823544\) | \(0.07342216607057826\) |
| 1024 | \(0.03737322030225639\) | \(0.07772808316858408\) | \(0.0394574853759122\) |

At the miss position, we evaluate against \(L_{o,Y}=0.1539368726945163\):

| \(N\) | BSDF | light | balance |
| --- | --- | --- | --- |
| 16 | \(1.127800620513927\) | \(0.1665406649163094\) | \(0.2027174941744856\) |
| 64 | \(0.6061904264789479\) | \(0.0866628181189508\) | \(0.1117390659993689\) |
| 256 | \(0.2255597833559149\) | \(0.04945588327264005\) | \(0.06214339069118716\) |
| 1024 | \(0.121007411701054\) | \(0.02502486831590404\) | \(0.03449795333963287\) |

Observe the monotonic convergence across all sampling strategies. Each error metric at \(N=16\) exceeds its corresponding \(N=1024\) evaluation by a factor greater than five. Our primary validation criteria required strict reduction at each successive rung and an overall decrease of at least a factor of three. We did not establish a rigid numeric RMSE threshold a priori; the tabulated data represents the direct empirical output.

Analyzing the relative performance, the ratio of the light estimator to the BSDF estimator at the lip is approximately \(5.10\) at \(N=64\) and \(2.08\) at \(N=1024\). Conversely, at the miss position, the BSDF-to-light error ratio is roughly \(7.00\) at \(N=64\) and \(4.84\) at \(N=1024\). This structural behavior is consistent across \(N=16\) and \(N=256\) as well: the light arm systematically underperforms at the lip, the BSDF arm systematically underperforms at the miss, and the balance heuristic successfully maintains an error bounded below the poorer performing arm in all cases.

Crucially, the balance heuristic error strictly exceeds that of the single optimal technique at every tested configuration. At the lip for \(N=1024\), the balance heuristic yields \(0.0394574853759122\) compared to the optimal BSDF arm's \(0.03737322030225639\). At the miss for \(N=1024\), it evaluates to \(0.03449795333963287\) against the superior light arm's \(0.02502486831590404\). This performance gap to the superior arm constitutes the inherent statistical penalty of the balance heuristic's robustness.

The light arm at the lip position exhibits a heavy tail, where a small subset of fortuitous area samples dominates the reflected lobe. Although its RMSE converges rapidly—decreasing from \(0.7304631415769416\) to \(0.07772808316858408\), an improvement rate exceeding that of the BSDF arm—it remains definitively the less efficient estimator at \(N=1024\). Similarly, the BSDF arm at the miss position represents our secondary heavy tail and remains the suboptimal choice even at the highest sampling budget.

Signed relative means evaluated at \(N=1024\):

| arm | lip | miss |
| --- | --- | --- |
| BSDF | \(-0.002731905356039808\) | \(+0.02759449102141028\) |
| light | \(-0.003899555994426759\) | \(-0.008199037159731746\) |
| balance | \(-0.01277686469507701\) | \(-0.01175426953620759\) |

We verify unbiasedness using the condition \(\lvert\mathrm{mean\_rel}(1024)\rvert\le 5\,\mathrm{rmse}(1024)/\sqrt{K}\) for \(K=32\). In the presence of a persistent bias floor, the absolute mean would stall on the same order of magnitude as the RMSE. Every evaluated strategy at both sample positions definitively satisfies this threshold. The largest absolute mean at the lip occurs within the balance arm, measuring approximately one-third of its corresponding RMSE. At the miss position, the maximum absolute mean is observed in the BSDF arm, remaining strictly under one-quarter of its RMSE.

Finally, we report the disk-averaged means of the \(N=64\) standard error, corresponding to the empirical data utilized in the primary visual analysis:

| disk | BSDF | light | balance |
| --- | --- | --- | --- |
| lip | \(0.1197899661872358\) | \(0.3079049113038804\) | \(0.1312898735904618\) |
| miss | \(0.0772988573354273\) | \(0.01309165077371938\) | \(0.01779797833390362\) |

## Limits

### Honesty gaps
1. **Analytical vs. Display Precision:** The authoritative measurements are derived from the double-precision CPU contour, the double-precision Gauss–Legendre integration, and the double-precision estimator. The localized room rendering for display purposes utilizes float32. Metrics are not extracted post-rasterization. The exponential evaluation \((R\cdot\omega)^{160}\) is strictly maintained in double precision; a float32 evaluation would aggressively underflow on the lobe shoulder, introducing severe bias at the lip. A representative source pixel yields \(R=\)**7.5** prior to tone mapping. The framebuffer maintains perfect linearity. We observe that a front-facing shelf pixel evaluated via the CPU double-precision Lambert formulation agrees with the float32 shading to within a relative **\(2.8\times 10^{-6}\)** on \(Y\). A linear probe of the target pixel nearest the lip records the balance sample at \(Y\) **0.902**, compared to an analytic Lambert reference at \(Y\) **0.184**. These display-referred readings do not serve as metric keys.
2. **Tone-Mapping Interactions:** The tone mapper may easily drive an \(N=\)**64** light-arm firefly into saturation. We strictly avoid clamping the estimator prior to evaluating the standard error. The absolute magnitude of a firefly maps directly to the standard error visualized on the variance plate. We make no rigorous claims regarding energy conservation *after* the Neutral operator is applied. Tone-mapping parameters remain locked as \(e=\)**1.00**, \(F_{90}=\)**0.04**, \(K_s=\)**0.76**, and \(K_d=\)**0.15**.
3. **Variance Visualization:** The variance plate visualizes the float standard error mapped through an authored sRGB curve. It utilizes a unified scale clamped at **0.9246898237889386**. Applying localized autoscaling per panel would technically preserve the theoretical inequalities but yield a misleading visual comparison. The evaluated disk means represent spatial averages, whereas the scale maximum is dictated by a singular tile pixel.
4. **Heuristic Bounding:** The balance heuristic consistently yields an error bounded below the inferior single technique and above the superior technique. At the lip, it traces the BSDF series; at the miss, it traces the light series. The weighting correctly manages the PDF mixture, but this structural property precludes the balance heuristic from outperforming the single strategy that optimally matches the local integrand.
5. **Occlusion Simplifications:** The integral is evaluated under strictly unoccluded conditions. Because the back geometry is coplanar with the emitter, it receives zero direct illumination. Ambient corners remain unlit as the fill acts as a constant Lambertian ambient source, and secondary bounces are systematically disabled. Specular fill is intentionally omitted to avoid introducing extraneous highlights that do not originate from the primary source. Contact shadows and generic visibility terms are completely excluded.
6. **Statistic Monotonicity:** A single sampling sequence does not guarantee monotonic convergence. The primary validation relies on RMSE evaluated across \(K=\)**32** prefixes. The lip light arm exhibits a notably heavy tail; consequently, an individual path of length **1024** may exhibit significant variance despite the underlying weight formulation remaining structurally sound.
7. **Lambert Residual Checks:** The Lambert residual validation evaluates the bounds at a peak sample count of **16384**. This outputs `lambert_reduction_max_abs_mean_rel` \(=\)**0.002711173413998751**. This specific diagnostic enforces \(k_s=\)**0** at the lip over **8** independent replicates, utilizing the analytic contour \(L_{o,d}\) as the absolute baseline. The reported metric constitutes the maximum absolute mean relative error across the three algorithms at that final evaluation budget. Under these conditions, the cosine arm functions as a binary hit-or-miss draw, with \(\Omega_\perp/\pi\) roughly equal to one-tenth. The absolute mean relative error measured **0.024** at **512** samples and **0.017** at **4096** samples—both exceeding \(10^{-2}\)—while the light arm remained stable. The expected error reduction from a prefix of **32** to **512** operates as a supplementary validation. Any structural defect—such as omitting \(r^2\), duplicating \(\cos_y\), or improperly scaling the balance average by **1**/\(N\)—will cause the estimator to violate this bound catastrophically. The count of **16384** serves strictly for this singular residual test and does not represent a standard rendering tier.
8. **Furnace Sensitivity:** The white furnace validation is deliberately executed at \(s=\)**8** to maximize sensitivity, yielding a mean of **0.619901030295896** against an albedo of **0.62**. Fixture S, possessing \(\Omega_\perp=\)**0.002397921970815975** \(\mathrm{sr}\), functions as the on-axis contour baseline.
9. **Display Formatting:** Final image outputs are strictly **8**-bit display-referred. All scientifically relevant quantities reside inside the double-precision estimator. The background geometry is rendered using a unified fragment shader on llvmpipe.

### What this run can claim
| Parameter | Value |
| --- | --- |
| `GL_VERSION` | **4.5** (Core Profile) Mesa **25.0**.**7**-**2**+deb**13**u**1** |
| `GL_RENDERER` | llvmpipe (LLVM **19.1**.**7**, **256** bits) |
| OSMesa | core **3.3** request |
| FBO configuration | **RGBA32F**, \(1280\times 720\) and \(640\times 720\), nearest filtering |
| `GL_FRAMEBUFFER_SRGB` | disabled |
| MSAA | disabled |
| RNG | SplitMix**64**, seed **20260926**. Top **53** bits map to \([\)**0**,**1**\()\). |
| Tone Mapping \(e\) | **1.00** |
| Estimator Implementation | CPU double-precision overwrites rasterized tile pixels. |

**Can claim:** Within this specific OSMesa/llvmpipe environment, the double-precision CPU estimator correctly evaluated a Lambert–Phong mixture against a uniform area integration for a single, unoccluded rectangular source. The formulation accurately applied the solid-angle Jacobian and composited the independent sampling strategies via the balance heuristic using identical sample allocations. At both geometric focal points, the relative RMSE across \(K=\)**32** prefixes monotonically decreased from \(N=\)**16** to \(N=\)**1024** relative to the quadrature baseline \(L_o\), with the balance heuristic maintaining an error bound strictly below the poorer single arm across all evaluation tiers. The BSDF arm minimized error at the lip (\(N=\)**64** and **1024**), while the light arm minimized error at the miss position. The standardized variance plate maps the per-pixel standard error at \(N=\)**64**, anchoring the lip light disk at **0.3079049113038804**. The primary visualization reliably reflects the balance estimator evaluated at \(N=\)**1024** with an exposure of \(e=\)**1.00**. The evaluation suite successfully reports **53** pass / **0** fail.

**Cannot claim:** This analysis asserts no claims regarding GPU performance, wavefront utilization, ray-tracing hardware, or frame-time efficiency. The integrated evaluation never retrieves metric data from the rasterized pixels. No physical claims are made post-tone-mapping. The balance heuristic is not guaranteed to outperform the optimal single technique, nor is it benchmarked against power heuristics, VNDF sampling, or complex multi-light environments. Floating-point evaluations of the specular power are explicitly avoided.

For this specific configuration: **53** pass / **0** fail. The underlying geometry, signed contour integrations, Gauss–Legendre alignments, directional PDFs, and balance weights were exhaustively validated prior to generating the primary figures. The Lambert reduction precisely achieves **0.002711173413998751**.

## Out of scope

Modifying the proportionality of \(p_i\), such as evaluating a power heuristic parameterized by \(\beta=\)**2**, fundamentally alters the estimator and remains beyond the current scope. Balance here strictly denotes the direct mixture weight proportional to \(p_i\). Introducing secondary emitters, environment maps, emissive meshes, or bifurcating the BSDF into independent diffuse and specular arms falls outside this analysis. A single rectangular source is utilized specifically to induce decoupled failure modes within the individual sampling arms.

Additional occlusion terms, shadowing from local geometry, multi-bounce transport, Russian roulette, and non-direct path formulations are excluded. We similarly omit the half-vector Jacobian, Smith shadowing-masking functions, VNDF, GGX distributions, and Fresnel modulations. The application of the balance heuristic to the reflection-aligned Phong lobe is uniquely enabled by its native formulation as a density in \(d\omega\).

```text
w_i            = p_i / (p_bsdf + p_light)          # n_bsdf = n_light, so n_i cancels
p_bsdf         = pi_d * (n·ω)/π + pi_s * (s+1)/(2π) (R·ω)_+^s
p_light        = (1/A) * r^2 / cos_y               # on the mouth, else 0
f_r            = kd/π + ks * (s+2)/(2π) (R·ω)_+^s  # s+1 is the pdf; s+2 is the BRDF
ell / p_light  = f_r * Li * cos_x * cos_y * A / r^2
Lhat_bsdf      = (1/N) sum ell / p_bsdf
Lhat_light     = (1/N) sum ell / p_light
Lhat_bal       = (1/n) sum w_bsdf  * ell / p_bsdf
               + (1/n) sum w_light * ell / p_light  # n = N/2
E              = Li * Omega_perp                    # diffuse truth, signed contour
Lo             = Gauss-Legendre 8x40                # mouth integral, specular included
Lo,Y lip       = 0.8922731625666653
winner lip     = bsdf                               # N=64 and N=1024
winner miss    = light
stderr lip, light arm = 0.3079049113038804          # disk mean, N=64; lede 0.308
asserts        = 53 pass / 0 fail
beauty 00, 01  = sRGB_OETF(Neutral(e * Lo))         # e=1.00
variance plate = authored sRGB of float stderr


```

The cover plate serves as the definitive evaluation of the balance heuristic at \(N=\)**1024**. The variance plate highlights the spatial distribution of standard error across the \(N=\)**64** tier. The three-arm composite visualizes the independent formulation of the legal densities. The analytical sequence successfully shifts variance bounds while preserving strict statistical unbiasedness.
Dense meters follow.

---

## Appendix A — Meters (quote tables, not photographs)

The baseline evaluation utilizes a double-precision CPU estimator prior to tone mapping. The pseudorandom number generator is initialized with seed **20260926**. Beauty renders are displayed using Khronos PBR Neutral with an exposure of \(e=1.00\), strictly maintaining the original, un-refit constants. The RMSE series correspond to the tabular data in the preceding section.

| Parameter | Value |
| --- | --- |
| seed / \(K\) / \(N\) | **20260926** / **32** / **16**, **64**, **256**, **1024** |
| \(N\) (three-arm & variance plates) / \(N\) (cover) | **64** / **1024** |
| \(s\) / \(k_d\) / \(k_s\) | **160** / **0.34** / **0.28** |
| \(\pi_d\) / \(\pi_s\) | **0.5483870967741935** / **0.4516129032258064** |
| stream **0**, initial three uniform variates | **0.7466817377103402**, **0.669510631620856**, **0.5708748435191999** |
| \(L_i\) RGB / \(Y\) | **(7.5, 4.8, 2.2)** / **5.186299999999999** |
| \(L_{\mathrm{fill}}\) RGB / \(Y\) | **(0.012, 0.014, 0.018)** / **\(1.3863600000\times 10^{-02}\)** |
| exposure / Neutral configuration | **1.00** / \(F_{90}=\)**0.04**, \(K_s=\)**0.76**, \(K_d=\)**0.15** |
| eye coordinate | **(0.1453673781693574, 1.505862424473805, 1.453673781693575)** |
| target coordinate / vertical FOV | **(0, 1.18, 0.28)** / **46**\(^\circ\) |
| lip target / miss target | **(0.04, 0.90, 0.40)** / **(−0.28, 0.90, 0.28)** |
| mouth \(x\) / \(y\) / \(A\) | **[−0.22, 0.22]** / **[1.05, 1.64]** / **0.2595999999999999** \(\mathrm{m}^2\) |
| \(\Omega_\perp\) lip / miss | **0.3212572527424995** / **0.2742559005975028** \(\mathrm{sr}\) |
| \(E_Y\) lip / miss | **1.666136489898425** / **1.422373377268829** |
| \(L_{o,d,Y}\) lip / miss | **0.1803182235985176** / **0.1539368726619603** |
| \(L_{o,Y}\) lip / miss | **0.8922731625666653** / **0.1539368726945163** |
| specular / diffuse ratio (lip / miss) | **3.948324937768523** / **\(2.114893779357608\times 10^{-10}\)** |
| panel / fill ratio (lip / miss) | **42.61218441186641** / **35.78152895218164** |
| \(r_{\max}/r_{\mathrm{closest}}\) lip / miss | **2.06098792642672** / **2.89530225013162** |
| \(n\cdot\omega_o\) lip / miss | **0.4966085446506598** / **0.4366167162249477** |
| \(\max(R\cdot\omega)\) across the mouth, miss | **0.8789249543972235** |
| \(p_{\mathrm{bsdf}}\) / \(p_{\mathrm{light}}\) at the lip evaluation | **11.65879108669897** / **0.956701082414125** |
| \(w_{\mathrm{bsdf}}\) / \(w_{\mathrm{light}}\) at the lip evaluation | **0.9241645851315697** / **0.07583541486843028** |
| superior arm, lip (\(N=64\) / \(N=1024\)) | bsdf / bsdf |
| superior arm, miss (\(N=64\) / \(N=1024\)) | light / light |
| disk stderr lip (BSDF / light / balance) | **0.1197899661872358** / **0.3079049113038804** / **0.1312898735904618** |
| disk stderr miss (BSDF / light / balance) | **0.0772988573354273** / **0.01309165077371938** / **0.01779797833390362** |
| maximum standard error scale | **0.9246898237889386** |
| horizon fraction (lip / miss) | **0** / **0** |
| fixture S, \(\Omega_\perp\) | **0.002397921970815975** \(\mathrm{sr}\) |
| furnace evaluation (\(s=\)**8**) mean | **0.619901030295896** against \(k_d+k_s=\)**0.62** |
| Lambert reduction, \(\max\lvert\mathrm{mean\_rel}\rvert\) | **0.002711173413998751** |
| ground truth integration | gauss_legendre_**8**x**40** |
| diagnostic assertions | **53** pass / **0** fail |

Certain abbreviated values are provided strictly for typographical convenience. The lip light disk standard error of **0.308** functionally represents \(0.3079049113038804\). The reported mouth area of **0.2596** substitutes the rigorous geometric bound product \(0.2595999999999999\). These visual abbreviations do not supersede the full-precision internal tables.

