---
title: "Light Sampling and the Area Jacobian"
description: "Vertical softbox on a night inspection bench. Area sampling without the geometry term biases the estimator; the Jacobian puts the measure back."
date: 2026-09-25
tags:
  - graphics
  - engine
  - lighting
math: true
video:
  src: /assets/journal/light-sampling-and-the-area-jacobian/area-jacobian-explainer.mp4
  poster: /assets/journal/light-sampling-and-the-area-jacobian/area-jacobian-explainer-poster.jpg
  vtt: /assets/journal/light-sampling-and-the-area-jacobian/area-jacobian-explainer.vtt
  caption: "Animated explainer (4 min, English captions): why equal area is not equal light, and how the area Jacobian puts the measure back. The written note with full metrics follows below."
cover: /assets/journal/light-sampling-and-the-area-jacobian/00_hero.jpg
---

In [Solid Angle and the Rendering Equation](/posts/p/solid-angle-and-the-rendering-equation/), the analysis centered on the integration measure: while path tracers sample directions over solid angle \(d\omega\), surface irradiance and the projected rendering equation integrate against projected solid angle \(\Omega_\perp\). For planar polygonal sources such as a rectangle, practical Monte Carlo sampling routines draw points uniformly across surface area. Transforming this area density into a directional density requires the differential solid angle conversion:

\[p(\omega)=p(A)\,\frac{\lVert x-y\rVert^2}{n_y\cdot\omega},\qquad d\omega=\frac{(n_y\cdot\omega)}{r^2}\,dA.\]

Omitting the squared distance \(r^2\) or the emitter normal foreshortening term yields an estimator that is strictly biased and non-convergent with increasing sample count \(N\).

As detailed in [Importance Sampling: Phong Lobe vs Cosine](/posts/p/importance-sampling-phong-lobe-vs-cosine/), evaluating competing directional sampling distributions operates in \(1/\mathrm{sr}\). For a finite disk subtending an angular radius of \(3.600^\circ\), the corresponding subtended solid angle evaluates analytically to

\[\Omega(3.600^\circ)=0.012398431\,\mathrm{sr}.\]

To evaluate the area Jacobian empirically, we deploy a physical test configuration: the night inspection bench. The scene consists of a vertical rectangular softbox with an in-frame diffuser, a matte inspection bench, a diffuse white Lambert calibration card, and a matte reference vise inside an unlit enclosure.

![Night inspection bench. Vertical rectangular softbox, the diffuser in frame and the light. Matte bench, white Lambert card, vise for scale, dark closed shop. Legal rectangle lighting plus named shop fill, Khronos PBR Neutral e=1.00, after an 8× linear box. Photograph only — the meter is not this frame.](/assets/journal/light-sampling-and-the-area-jacobian/00_hero.jpg)


The diffuse card acts as the planar measurement receiver. Drawing uniform samples across the emitter parameterization yields an area probability density \(p(A)\) in \(\mathrm{m}^{-2}\); mapping this quantity into incoming radiance integration requires scaling by the geometric Jacobian above.

The directional distortion induced by area-uniform sampling is verified by measuring cell occupancy across the projected hemisphere. Using a discretized \(\mu=\cos\theta\) versus azimuth \(\phi\) spherical grid with bin solid angles of \(2\pi/512\,\mathrm{sr}\), the rectangular panel projects across an interior mask of **35** cells. For an identical total sample count, an area-uniform generator produces an occupancy ranging from **86** to **952** samples per bin. Conversely, drawing uniformly within the subtended solid angle bounded by the source boundary constrains the distribution to **314..400** samples per bin.

![Teaching pin. Equal-Ω occupancy of the panel footprint on the receiver hemisphere. Left, area-uniform. Right, the same count drawn uniform in Ω and kept on the diffuser. μ=cos θ, azimuth φ, cell 2π/512 sr. Orange curve is the footprint. White edge is the interior mask: 35 cells, area occupancy 86..952 beside uniform-Ω 314..400. Each chart uses its own color max.](/assets/journal/light-sampling-and-the-area-jacobian/01_bins.jpg)


Benchmark statistics were collected under Mesa 25.0.7 llvmpipe in linear Rec.709 using Khronos PBR Neutral (\(e=\mathbf{1.00}\)) and pseudorandom seed **20260924**:

| Parameter / Metric | Symbol / Field | Value |
| --- | --- | --- |
| Projected solid angle | \(\Omega_\perp\) | **0.419598441342** \(\mathrm{sr}\) |
| Surface irradiance | \(E_Y\) | **1.67839376537** |
| Centroid relative error | \((E_c-E)/E\) | **-0.194936551657** (rounded: **-0.195**) |
| Panel-to-fill ratio | `panel_over_fill` | **22.0690362063** (or **22.069**) |
| Distance ratio | \(r_{\max}/r_{\min}\) (`r_ratio`) | **3.3491112796** (or **3.349**) |
| Emitter Jacobian ratio | \(\max(J)/\min(J)\) | **37.5654619429** |
| Source parameters | \(L_i\), \(\rho\), \(A\) | \((4,4,4)\), **0.80**, **0.448** \(\mathrm{m}^2\) |
| Test suite status | `assert` | **72** pass / **0** fail |

Convergence of the unbiased legal estimator was tracked across \(K=\mathbf{32}\) shared prefixes: root-mean-square error decreased from **0.1644** to **0.1089**, **0.06826**, and **0.02638** at sample allocations \(N\in\{\mathbf{16}, \mathbf{64}, \mathbf{256}, \mathbf{1024}\}\). The precise values are:

* `rmse_legal_N16`: **0.164412278931**
* `rmse_legal_N64`: **0.108928582911**
* `rmse_legal_N256`: **0.0682573241753**
* `rmse_legal_N1024`: **0.0263804488107**

Conversely, biased estimators converge to non-zero asymptotic floors at \(N=1024\):

* Failure A (omitting \(1/r^2\)): `mean_rel_drop_r2_N1024` \(= \mathbf{-0.645746690189}\)
* Failure B (omitting \(\cos_y\)): `mean_rel_drop_cos_N1024` \(= \mathbf{+1.04013072615}\)

Photographic references and shop crops on the centroid evaluation plate are rendered with **8×** supersampling box-filtered to **1280**\(\times\)**720** before tonemapping. Diagnostic occupancy distributions, bias plots, and the metrics readouts are rendered directly into native sRGB without supersampling.


## Scene
The radiometric computations operate strictly in scene-referred linear Rec.709 with **1** shop, **1** rectangular source, and **1** Lambert receiver. Display mapping follows the configuration documented in [Tone Mapping: Scene-Referred to Display-Referred](/posts/p/tone-mapping-scene-referred-to-display-referred/): the Khronos PBR Neutral curve evaluated with parameters \(e=1.00\), \(F_{\mathbf{90}}=\mathbf{0.04}\), \(K_s=\mathbf{0.76}\), and \(K_d=\mathbf{0.15}\), followed by the IEC **61966**-**2**-**1** sRGB transfer function implemented on the CPU. Neutral determines output display code values but does not alter the underlying computed irradiance \(E\).

* **Cover Presentation:** The complete inspection bench environment showing the softbox, calibration card, and reference vise illuminated under verified area lighting and ambient shop fill. The image represents an un-annotated render without radiometric readouts.
* **Occupancy Bins:** The equal-solid-angle spherical discretization contrasting the area-uniform distribution against uniform solid angle generation across the **35** interior cells.
* **Bias Characteristics:** Relative RMSE computed across \(K=32\) prefixes plotted against sample count \(N\). The legal sampling routine converges linearly on logarithmic axes, whereas estimators omitting geometric factors plateau at fixed asymptotic biases, with signed means tabulated at \(N=\mathbf{1024}\).
* **Centroid Evaluation Plate:** Side-by-side comparison of the full scene rendered via legal integration versus single-point centroid evaluation, marked with `CENTROID_SIGNED_REL` **-0.195**, `(EC-E)/E = -0.194937`, and `FROM THIS RUN`. Regional crops of the card and bench show linear Rec.709 luminance values of `Y 0.446` (legal) and `Y 0.362` (centroid) alongside an absolute error heat map \(\vert{}\mathrm{legal}-\mathrm{centroid}\vert{}\) derived directly from floating-point buffers prior to tonemapping.
* **Metrics Readout:** A two-column visual log capture of runtime metrics; numerical values correspond verbatim to the accompanying analytical data.

Analytical evaluations should distinguish between tonemapped GLSL photographic renderings (subject to display transforms) and raw floating-point instrument measurements (occupancy bins, bias sweeps, and tabulated integral values).

---

## Method

### Equal-\(\Omega\) histogram
The spherical occupancy distribution empirically demonstrates the directional mapping distortion. The receiver hemisphere, centered on the surface normal \(n_x\), is parameterized using \(\mu=\cos\theta=n_x\cdot\omega_i\) against a wrapped azimuthal angle \(\phi\in[0,2\pi)\). The parameterization domain is uniformly discretized into **16** steps in \(\mu\) and **32** steps in \(\phi\):

\[\Delta\omega=\frac{2\pi}{16\cdot 32}=\frac{2\pi}{512}\,\mathrm{sr}.\]

This uniform grid—enforcing equal \(\Delta\phi\) and equal \(\Delta\cos\theta\)—ensures identical solid angle subtension across all discrete cells, consistent with established derivations for spherical caps.

The evaluation contrasts two distinct spatial sampling populations, each utilizing \(N_{\mathrm{hist}}=\mathbf{16384}\) draws evaluated independently from the irradiance estimator prefixes. The first configuration generates **16384** area-uniform samples directly on the diffuser surface, binning their resulting incident vectors \(\omega_i\). The second configuration generates directions uniformly via \(\mu=U\) and \(\phi=2\pi U\), utilizing ray rejection against the spatial footprint until exactly **16384** valid diffuser intersections are accumulated. A discrete spherical cell is classified strictly as an "interior" cell if all **4** bounding \((\mu,\phi)\) corners maintain geometric intersection with the diffuser. While boundary bins containing partial intersections are rendered, quoted population extrema are rigorously constrained to the interior subset. This verified internal mask encompasses exactly **35** cells. Under the area-uniform generation strategy, the directional occupancy distribution exhibits high density variance spanning **86** to **952** samples. Conversely, the uniform-in-\(\Omega\) strategy maintains a tightly bounded interior occupancy of **314** to **400** samples.

The lower near edge of the physical emitter aligns with the global maximum of the area-to-directional Jacobian \(d\omega/dA\). Consequently, an equal-\(\Omega\) discrete cell mapping to this region corresponds to an extremely small differential surface area, resulting in severe under-sampling by the area-uniform generator. To maintain energy conservation, any stochastic intersection occurring within this domain requires an inversely proportional compensatory weight:

\[w_{\mathrm{legal}}=L_i\,\cos_x\,A\,\frac{d\omega}{dA}\]

By contrast, the far spatial corner correlates with the global minimum of the Jacobian. Here, an equivalent equal-\(\Omega\) discrete cell subtends a dramatically larger differential surface area, thereby over-accumulating area-uniform ray hits that subsequently receive heavily diminished individual scalar weights. This mapping discrepancy mathematically dictates the **86**-to-**952** density disparity across the interior region. The uniformly drawn angular distribution appropriately stabilizes between **314** and **400**. Local maximum normalization separates spatial density gradients from discrete boundary rasterization errors.

The drastic modulation of the compensatory weight is fundamentally dictated by radial distance \(r\). Across this specific spatial footprint, the geometric transfer kernel \(\cos_y/r^2\) diverges by an absolute factor of **37.5654619429**. Estimator formulations that omit this necessary scaling term reliably converge to an invalid radiometric integration target.
## Discussion

### Three failures
For a planar emitter with uniform exitant radiance \(L_i\) and zero emission from the rear hemisphere, receiver irradiance is defined by integrating incoming radiance weighted by the geometric transfer kernel. The unbiased formulation accounts for both geometric foreshortening and inverse-square falloff. Systemic bias typically arises from three deviations:

* **Failure A — Omission of the inverse-square law (\(r^2\)):** Preserving surface cosines and \(p(A)\) while omitting \(1/r^2\) shifts the Monte Carlo expectation toward \(\int L_i\,\cos_x\,\cos_y\,dA\), altering the physical dimension of the estimator by \(\mathrm{m}^2\). Because \(1/r^2\) contributes maximal weight along the near boundary of the panel, omitting it severely underestimates total flux, yielding a relative mean error of **-0.645746690189** at \(N=1024\).
* **Failure B — Omission of the emitter foreshortening term (\(\cos_y\)):** Omitting \(\cos_y\) while retaining \(1/r^2\), the receiver cosine \(\cos_x\), and \(p(A)\) converges to \(\int L_i\,(\cos_x/r^2)\,dA\). Because \(L_i\) is already defined per unit projected area at the source, \(\cos_y\) originates strictly from the differential area-to-solid-angle transformation \(d\omega = \cos_y\,dA/r^2\) rather than an emitter scattering lobe. While dimensionally consistent with irradiance, the integral evaluates the incorrect measure, converging to a relative error floor of **+1.04013072615** at \(N=1024\).
* **Failure C — Single-point centroid approximation:** Approximating the surface integral by evaluating the transfer kernel exclusively at the geometric centroid replaces numerical quadrature with a single distance \(r\) and cosine pair scaled by total area \(A\). Because the measurement card is positioned near the panel's lower boundary and displaced from the center axis, this point-source approximation produces a large discrepancy relative to the true boundary integral, yielding \((E_c-E)/E=\mathbf{-0.194936551657}\) (displayed as **-0.195**).

The receiver foreshortening term \(\cos_x\) remains active across all test cases. An additional evaluation arm testing redundant weighting of \(\cos_y\) introduced a dimensionless attenuation bias, converging to `mean_rel_double_N1024` \(=\mathbf{-0.458986283232}\) at \(N=1024\).

Because tonemapping non-linearities and display transforms compress dimensional discrepancies, biased Monte Carlo estimators cannot be reliably evaluated from tonemapped photographic images alone. Numerical error floors are properly verified through raw floating-point error metrics on the bias plate, whereas the dimensionally consistent centroid approximation is analyzed on the centroid plate.

---
### Change of measure
We first formalize the notation and physical quantities utilized in the subsequent evaluations.

| symbol | meaning | unit |
| --- | --- | --- |
| \(x\) | instrument point on the card, \((0.280,\,0.908,\,-0.200)\) | \(\mathrm{m}\) |
| \(y\) | sample point on the diffuser | \(\mathrm{m}\) |
| \(y_c\) | diffuser centroid, \((0,\,1.50,\,0)\) | \(\mathrm{m}\) |
| \(r\) | \(\lVert y-x\rVert\) | \(\mathrm{m}\) |
| \(\omega_i\) | \((y-x)/r\), from the card toward the panel | unitless |
| \(n_x\) | card normal, \(+Y\) | unitless |
| \(n_y\) | diffuser outward normal, \(+X\) | unitless |
| \(\cos_x\) | \(n_x\cdot\omega_i\) | unitless |
| \(\cos_y\) | \(n_y\cdot(x-y)/r\) | unitless |
| \((n_x\cdot\omega)\) | means \(\cos_x\) in the opening formula |  |
| \((n_y\cdot\omega)\) | means \(\cos_y\) in the opening formula |  |
| \(A\) | diffuser area, \(0.448\) | \(\mathrm{m}^2\) |
| \(p(A)\) | \(1/A\) on the diffuser, else \(0\) | \(\mathrm{m}^{-2}\) |
| \(L_i\) | constant one-sided radiance, \((4,4,4)\) | linear Rec.709 |
| \(L_{\mathrm{fill}}\) | shop fill on the rest of the hemisphere, \((0.025,\,0.028,\,0.036)\) | linear Rec.709 |
| \(\rho\) | card albedo, \(0.80\) | unitless |
| \(E\) | irradiance at \(x\) from the diffuser alone | \(L\cdot\mathrm{sr}\) |
| \(L_o\) | outgoing radiance of the Lambert card, \(\rho E/\pi\) | linear Rec.709 |

The two cosine terms parameterize distinct foreshortening effects. The receiver cosine \(\cos_x\) is evaluated with respect to the direction from the measurement card toward the emitter, whereas the emitter cosine \(\cos_y\) evaluates the direction from the emitter toward the card. Evaluating the dot product with respect to a shared direction vector \(\omega\) naturally necessitates a sign inversion. Given the geometric configuration of the panel and card, both cosines remain positive for all valid surface samples. The computed numerical minima are \(\min\cos_y=\mathbf{0.246253045359}\) and \(\min\cos_x=\mathbf{0.326568395956}\).

The one-sided diffuser occupies the plane \(x=0\), bounded by \(y\in[1.10,\,1.90]\) and \(z\in[-0.28,\,0.28]\). The domain spans a width of \(0.56\,\mathrm{m}\) and a height of \(0.80\,\mathrm{m}\), yielding a total area \(A=0.448\,\mathrm{m}^2\). The sampling parameterization is invariant to the specific contour vertex ordering:

\[y=(0,\;1.10+v\cdot 0.80,\;-0.28+u\cdot 0.56),\qquad u,v\in[0,1).\]

Applying the change of integration measure (restricting the evaluation to the frontal half-space) yields:

\[d\omega=\frac{\cos_y}{r^2}\,dA,\qquad p(\omega)=p(A)\,\frac{r^2}{\cos_y}.\]

Assuming a uniform unoccluded exitant radiance \(L_i\) and isolating the direct diffuser contribution from the ambient environment, the receiver irradiance is formulated as:

\[E=\int_{\mathrm{panel}} L_i\,\cos_x\,d\omega=\int_{A} L_i\,\frac{\cos_x\,\cos_y}{r^2}\,dA.\]

The corresponding outgoing radiance for the Lambertian card, assuming no spontaneous emission (\(L_e=0\)) and a diffuse BRDF \(f_r=\rho/\pi\), is:

\[L_o=\frac{\rho}{\pi}\,E.\]

The analytic ground truth evaluates to the projected solid angle of the planar rectangle scaled by \(L_i\). This is computed precisely via a signed four-corner spherical polygon summation:

\[\Omega_\perp(x)=\frac12\sum_{i=0}^{3}\gamma_i\,(n_x\cdot\hat\nu_i),\qquad \gamma_i=\arccos(\hat r_i\cdot\hat r_{i+1}),\qquad \hat\nu_i=\mathrm{normalize}(\hat r_i\times\hat r_{i+1}),\qquad r_i=v_i-x.\]

\[E=L_i\,\Omega_\perp.\]

The cyclic vertex permutation inherently defines the geometric sign. To enforce \(\Omega_\perp>0\) at the physical instrument, the vertices are ordered as follows:

| Vertex | \(x\) | \(y\) | \(z\) |
| --- | --- | --- | --- |
| \(v_0\) | 0 | 1.90 | +0.28 |
| \(v_1\) | 0 | 1.90 | -0.28 |
| \(v_2\) | 0 | 1.10 | -0.28 |
| \(v_3\) | 0 | 1.10 | +0.28 |

This summation is strictly signed. Applying an absolute value to rectify a reversed normal would erroneously mask spatial configuration errors. Under this verified configuration, the computed solid angle is \(\Omega_\perp=\mathbf{0.419598441342}\,\mathrm{sr}\) with a resultant luminance \(E_Y=\mathbf{1.67839376537}\). As \(L_i\) is strictly achromatic, the three spectral channels of \(E\) perfectly align, each evaluating identically to **1.67839376537**.

**Arms.** Evaluating the Monte Carlo estimator arms utilizing a single shared uniform area draw \(y\sim p(A)\), where \(p(A)=1/A\), yields four distinct sample weights:

\[w_{\mathrm{legal}}=L_i\,\frac{\cos_x\,\cos_y}{r^2\,p(A)}=L_i\,\cos_x\,\cos_y\,\frac{A}{r^2},\]

\[w_{r^2}=L_i\,\cos_x\,\cos_y\,A,\]

\[w_{\cos}=L_i\,\cos_x\,\frac{A}{r^2},\]

\[w_{\mathrm{dbl}}=L_i\,\cos_x\,\cos_y\,\cos_y\,\frac{A}{r^2}.\]

\[\widehat E=\frac1N\sum_{k=1}^{N} w(y_k).\]

The formulation \(w_{\mathrm{legal}}\) represents the unbiased integrand \(L_i\cos_x/p(\omega)\), appropriately scaled by the sampled probability density. The subsequent variants isolate specific geometric failures: \(w_{r^2}\) defines Failure A, \(w_{\cos}\) defines Failure B, and \(w_{\mathrm{dbl}}\) introduces a redundant secondary cosine attenuation. The receiver foreshortening term \(\cos_x\) correctly remains active across all four weighting strategies.

**Centroid.** The centroid approximation substitutes the spatial integral for a discrete geometry term evaluated at the geometric center, retaining the true \(L_i\) and total area \(A\):

\[E_c=L_i\,A\,\frac{\cos_x(y_c)\,\cos_y(y_c)}{r_c^2},\qquad r_c=\lVert y_c-x\rVert.\]

For this geometric arrangement, the centroid approximation evaluates to \(E_{c,Y}=\mathbf{1.35121347243}\).

**Fill.** The ambient environmental contribution at the instrument integrates the remainder of the hemisphere (excluding the primary panel):

\[E_{\mathrm{fill}}=L_{\mathrm{fill}}\,(\pi-\Omega_\perp),\qquad E_{\mathrm{total}}=E+E_{\mathrm{fill}}.\]

The numerical estimator arms strictly isolate the direct contribution \(E\). Folding the ambient fill into the biased estimators would improperly tether their error asymptotes to the environmental lighting baseline. The measured ambient statistics evaluate to \(L_{\mathrm{fill},Y}=\mathbf{0.0279398000}\), \(E_{\mathrm{fill},Y}=\mathbf{0.0760519738914}\), yielding a high direct-to-ambient ratio of \(E_Y/E_{\mathrm{fill},Y}=\mathbf{22.0690362063}\). The card's integrated outgoing radiance derived exclusively from the direct panel is \(L_{o,Y}=\mathbf{0.427399462741}\). When aggregated with the ambient fill, the total outgoing radiance resolves to \(L_{o,Y}=\mathbf{0.446765938864}\).

The area-to-solid-angle Jacobian constitutes the fundamental geometric transfer function:

\[\frac{d\omega}{dA}=\frac{\cos_y}{r^2}.\]

Given the relation \(\cos_y=\Delta x/r\) with a constant orthogonal plane displacement \(\Delta x=\mathbf{0.280}\,\mathrm{m}\), the extremal ratio across the domain simplifies analytically to \((r_{\max}/r_{\min})^3\). Evaluation of the domain metrics yields \(r_{\max}/r_{\min}=\mathbf{3.3491112796}\), a maximal Jacobian \((d\omega/dA)_{\max}=\mathbf{7.15512954475}\,\mathrm{m}^{-2}\), and a minimal Jacobian \((d\omega/dA)_{\min}=\mathbf{0.190470958553}\,\mathrm{m}^{-2}\). This results in a steep spatial distortion ratio of **37.5654619429**. The maximal geometric weight coincides with the near lower edge, whereas the minimal weight aligns with the distant opposing corner. The absolute radial distance spans from \(r_{\min}=\mathbf{0.339505522783}\,\mathrm{m}\) to \(r_{\max}=\mathbf{1.13704177584}\,\mathrm{m}\).

The Monte Carlo integration utilizes \(K=\mathbf{32}\) independent pseudorandom streams seeded with **20260924** via the SplitMix64 generator. Each stream evaluates to a maximum sequence length of **1024**. Estimator convergence is quantified at power-of-two prefix limits \(N\in\{\mathbf{16},\mathbf{64},\mathbf{256},\mathbf{1024}\}\). A unified generator state reliably supplies the domain samples across all four prefixes and distinct weighting arms. Stream **0** initializes predictably with the vector \(u_0=\mathbf{0.0549755345579}\) and \(v_0=\mathbf{0.190148106104}\). The samples are drawn independent and identically distributed (IID) strictly within the area parameterization.

Relative integration error is quantified against the analytic ground truth exclusively on the linear Rec.**709** \(Y\) channel:

\[\mathrm{rel}_k(N)=\frac{\widehat E_{k,Y}(N)-E_Y}{E_Y},\qquad \mathrm{mean\_rel}(N)=\frac1K\sum_k\mathrm{rel}_k(N),\qquad \mathrm{rmse}(N)=\sqrt{\frac1K\sum_k\mathrm{rel}_k(N)^2}.\]

The provided bias chart visualizes \(\mathrm{rmse}(N)\). The signed mean of the unbiased legal formulation is unsuitable for tracking asymptotic convergence variance; at \(N=1024\), the empirical mean exhibits minor stochastic deviation around \(+\mathbf{0.00775270607151}\), which remains bounded securely within the legal RMSE envelope.

---

### Bias floors
The bias plate serves as our primary evaluation instrument. The gold trajectory represents the unbiased legal estimator, while the red and blue trajectories illustrate the respective omissions of \(r^2\) and the emitter cosine. These metrics are computed over \(K=\mathbf{32}\) shared prefixes. (The double-count arm is omitted from this specific visualization.)

![Bias chart. K=32 relative RMSE, N on a log axis. Gold legal falls from N=16 to N=1024. Red drop-r² and blue drop-cosine sit on floors. Signed means under the chart: legal +0.007753, drop r² -0.645747, drop cosine +1.040131. The broken weights are this chart, not a photograph of the shop.](/assets/journal/light-sampling-and-the-area-jacobian/02_bias.jpg)


The exact relative root-mean-square error (RMSE) generated during this execution is tabulated below:

| \(N\) | Legal | Drop \(r^2\) | Drop \(\cos_y\) |
| --- | --- | --- | --- |
| **16** | **0.164412278931** | **0.646465572668** | **1.05231399133** |
| **64** | **0.108928582911** | **0.644735526234** | **1.06914370379** |
| **256** | **0.0682573241753** | **0.645666437568** | **1.05028736473** |
| **1024** | **0.0263804488107** | **0.645750980439** | **1.04059885976** |

These legal column entries correspond directly to the variables `rmse_legal_N16`, `rmse_legal_N64`, `rmse_legal_N256`, and `rmse_legal_N1024`. The legal estimator's RMSE demonstrates expected monotonic convergence, sequentially rounding to **0.1644**, **0.1089**, **0.06826**, and **0.02638**. Evaluating the ratio between the \(N=\mathbf{64}\) and \(N=\mathbf{1024}\) legal RMSE values yields a quotient of approximately **4.13**.

Conversely, the biased omission estimators converge to non-zero asymptotic floors. Omitting \(r^2\) constraints the error near **0.646** across all measurement rungs. Omitting the emitter cosine yields an error strictly bounded between **1.04059885976** and **1.06914370379**. The true magnitude of these bias floors is represented by their signed means, which dwarf the legal estimator's residual stochastic noise at \(N=\mathbf{1024}\):

| Estimator Arm | `mean_rel` at \(N=\mathbf{1024}\) |
| --- | --- |
| Legal | \(+\mathbf{0.00775270607151}\) |
| Drop \(r^2\) | \(\mathbf{-0.645746690189}\) |
| Drop \(\cos_y\) | \(\mathbf{+1.04013072615}\) |
| Double-count \(\cos_y\) | \(\mathbf{-0.458986283232}\) |

The visual bias chart truncates the first three means to exactly **6** decimal places: legal \(+\mathbf{0.007753}\), drop \(r^2\) \(\mathbf{-0.645747}\), and drop cosine \(+\mathbf{1.040131}\). However, the analytic table remains the definitive reference. Because the geometric Jacobian evaluated across this specific panel spans a steep ratio of **37.5654619429**, an isolated prefix walk of length **1024** (or terminating in suffix **024** for metric alignment, just as **256** terminates in **56**) will exhibit localized variance even under unbiased integration. Therefore, the locked meter remains the RMSE computed over \(K=\mathbf{32}\) independent prefixes.

The double-count \(\cos_y\) estimator, tracked exclusively in the metrics array utilizing identical prefixes, produces RMSE values of **0.476232581495**, **0.452992595682**, **0.45710934368**, and **0.459388011928**. The corresponding signed means at those **4** sequential rungs are **-0.459580193104**, **-0.445824837954**, **-0.454300420772**, and **-0.458986283232**.

---

### Centroid plate
The centroid plate isolates the geometric distortion introduced by Failure C. Both rendered shop frames utilize identical camera parameters: eye position \((\mathbf{1.70},\,\mathbf{1.45},\,\mathbf{0.70})\), target \((\mathbf{0.10},\,\mathbf{1.40},\,\mathbf{-0.02})\), and a **46**\(^\circ\) vertical field of view. They share the identical \(L_i\) source radiance, ambient shop fill, material albedo \(\rho=\mathbf{0.80}\), photographic exposure **1.00**, and Khronos PBR Neutral parameter \(e=\mathbf{1.00}\).

![Failure C. Same eye: legal rectangle form factor beside the centroid stand-in. Gold boxes mark the card. Callout -0.195, (Ec-E)/E = -0.194937 from this run. Crops print linear Y 0.446 legal and Y 0.362 centroid. The third panel is linear |ΔY| of that crop before Neutral; the ramp is marked 0.115 and the card is the bright end.](/assets/journal/light-sampling-and-the-area-jacobian/03_centroid.jpg)


The legal frame is shaded strictly using \(L_i\,\Omega_\perp\), whereas the centroid substitute evaluates \(E_c\) directly at the shading point, with both applying identical fill rules and no per-half gain. The visual callout displays a centroid relative error of **-0.195**, corresponding directly to `(EC-E)/E = -0.194937`. The verified numeric metric from this specific execution evaluates to **-0.194936551657**.

The cropped region headers report the instrument pixel's linear Rec.**709** \(Y\) magnitude sampled directly from the floating-point buffers prior to tonemapping: the legal evaluation yields **0.446**, while the centroid approximation falls to **0.362**. The analytically computed card radiance, incorporating both panel and fill, evaluates to `Lo_total_Y` **0.446765938864**. The third comparative panel visualizes the linear \(\vert{}\Delta Y\vert{}\) difference of this exact crop prior to Neutral mapping, peaking at approximately **0.115**, with the calibration card situated at the bright maximum.

A separate validation verifies the small-angle limit, where the discrete centroid term converges with the continuous boundary integral. A small diagnostic source, Fixture S, yields \(\Omega_\perp=\mathbf{0.000399946674132}\,\mathrm{sr}\). A moderate source, Fixture M, yields \(\Omega_\perp=\mathbf{0.752274688454}\,\mathrm{sr}\), establishing the geometric regime where the point-source approximation safely diverges from the true contour integral. The benchmark acceptance threshold mandates \(\vert{}(E_c-E)/E\vert{}\ge \mathbf{0.10}\), a condition easily satisfied by the observed magnitude of 0.194936551657.

---

## Limits

### Honesty gaps
1. **The reference meter is defined by the CPU double-precision contour evaluation and the shared-sample estimator.** Radiometric validation does not sample float32 output from rendered photographs, nor are metric entries extracted from display-referred JPEGs. The unclamped floating-point ceiling is bounded at **4** (corresponding to source radiance \(L_i\)).
2. **Biased formulations (Failures A and B) do not undergo Khronos PBR Neutral tonemapping onto beauty renders.** Their quantitative characteristics are evaluated exclusively as error curves on the bias chart and as entries in the benchmark table. The single-point centroid approximation represents the sole analytical proxy visualized spatially, isolated to the centroid plate. The redundant double-count formulation carries no graphical frame and bypasses Neutral evaluation entirely.
3. **Emitter boundaries exhibit a fractional coverage fringe under Neutral after linear downsampling.** The rendering pipeline bypasses hardware MSAA. Photographic frames target an RGBA32F render target configured at **8**× resolution (**10240**\(\times\)**5760**), filtered via an 8\(\times\)8 linear box kernel down to **1280**\(\times\)**720**, followed by exposure scaling and Neutral application. Where the emitter silhouette intersects a sample column, box averaging produces an approximate one-eighth coverage step. Bench and reference geometry reside within normal dynamic ranges and filter cleanly. The occupancy histograms, bias curves, and metrics capture are generated natively without supersampling.
4. **Shading locations failing the four-corner frontal half-space test evaluate to zero emitter contribution.** Non-frontal configurations are culled rather than analytically clipped, which can cause horizon grazing regions to appear darker than a clipped polygonal solver. The primary instrument card resides securely within the valid half-space, preserving metric fidelity.
5. **Surfaces positioned behind the diffuser plane, including mounting fixtures, receive ambient fill exclusively.** Due to the absence of indirect surface interreflections, occluded geometry does not visually detach from background shop bounds, leaving peripheral image boundaries unilluminated.
6. **The reference vise does not cast cast-shadow occlusions.** Shading evaluations across the receiver assume an unoccluded line-of-sight; the vise serves purely as a physical scale artifact.
7. **The Neutral tone operator evaluated at exposure 1.00 governs display transform mapping only.** It does not alter physical scene irradiance \(E\). Its operational parameters match prior derivations without per-scene optimization, and radiometric energy conservation post-tonemapping is explicitly out of scope.
8. **Asymptotic convergence tracking utilizes RMSE aggregated across \(K=32\) independent prefixes.** Individual pseudorandom sample sequences are not asserted to be strictly monotonic, as localized stochastic fluctuations occur naturally despite correct estimator formulation.
9. **The direct-to-fill irradiance ratio evaluates to 22.0690362063.** This value represents \(E_Y/E_{\mathrm{fill},Y}\) computed strictly for the prescribed emitter radiance, ambient fill, and measured projected solid angle \(\Omega_\perp\).
10. **Tabulated omission floors represent empirical sample means under the active seed.** Measured asymptotes evaluate to **-0.645746690189** for inverse-square omission and **+1.04013072615** for emitter cosine omission, confirming two distinct failure regimes.
11. **Uniform area sampling scaled by the geometric Jacobian serves as an isolated baseline.** It represents a foundational change-of-measure test rather than a competitive production sampling strategy such as visible normal distribution functions (VNDF) or environment map multiple importance sampling (env-MIS).
12. **Region crop readouts (0.446 and 0.362) denote linear \(Y\) luminance at the receiver pixel.** The linear absolute difference \(\vert{}\Delta Y\vert{}\) map peaks at approximately **0.115** on the target card prior to Neutral mapping. The total analytical card luminance combining direct and ambient illumination is **0.446765938864** (`Lo_total_Y`).
13. **Rendered display output is constrained to standard 8-bit dynamic range.** Radiometric metrics, including \(\Omega_\perp\), \(E\), RMSE convergence rungs, and bias asymptotes, are resolved in high-precision CPU floating-point calculations.

---

### Mesa / llvmpipe — what this run can claim
| Parameter | Specification / Measured State |
| --- | --- |
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| Context Interface | OSMesa (Core 3.3 profile) |
| Render Target | **RGBA32F**, **10240**\(\times\)**5760** (**8**× SSAA over **1280**\(\times\)**720**) |
| Post-Processing | **1280**\(\times\)**720** via 8\(\times\)8 linear box resolve, Neutral mapping, sRGB OETF |
| Hardware Flags | `GL_FRAMEBUFFER_SRGB` disabled, MSAA disabled |
| SSAA / Texture | **8**× box resolve on primary scene and centroid plates; `GL_MAX_TEXTURE_SIZE` **16384** |
| PRNG Configuration | SplitMix64, seed **20260924**, 53-bit mantissa float mapping to \([0,1)\) |
| Tone Operator | Khronos PBR Neutral (\(e=\mathbf{1.00}\)) |

**Empirical claims established by this benchmark:**
Under the specified OSMesa and llvmpipe pipeline, a double-precision CPU Monte Carlo estimator drawing uniform area samples across an unoccluded planar rectangle and transformed via the geometric area Jacobian achieves consistent convergence. Evaluated across \(K=\mathbf{32}\) shared prefixes against analytic four-corner contour integration, RMSE decreases monotonically across sample allocations \(N\in\{\mathbf{16},\mathbf{64},\mathbf{256},\mathbf{1024}\}\). Conversely, omitting \(r^2\) or \(\cos_y\) arrests convergence at non-zero bias asymptotes. Discretized equal-solid-angle spherical occupancy bins reveal substantial non-uniform clustering for area-uniform sampling relative to solid-angle generation. At the evaluated receiver position, the single-point centroid approximation diverges from ground truth by **-0.194936551657**. The tonemapped hero visual accurately depicts the combination of direct area illumination and ambient fill post-box downsampling under Neutral \(e=\mathbf{1.00}\).

**Non-claims and technical limitations:**
The evaluation does not model GPU hardware acceleration, wavefront execution, hardware ray tracing cores, or interactive frame-rate constraints; the synthetic room is generated via an isolated software fragment shader. The benchmark does not extract radiometric ground truth from tonemapped framebuffers or lossy image formats. The formulation omits indirect surface interreflection, dynamic shadow casting under the scale vise, strict monotonicity across single pseudorandom paths, and variance comparisons against VNDF or environment MIS routines. Silhouette coverage boundaries remain bounded by the resolution limits of the **8**× spatial box filter.

---

## Out of scope

Multiple importance sampling heuristics (including balance and power weighting), multi-light sampling, and generalized Veach estimators remain deferred until the directional transformation of light area densities is established.

Similarly, half-vector coordinate transforms, Smith shadowing-masking functions \(G\), and visible normal distribution functions (VNDF) extend microfacet BRDF sampling rather than spatial measure transformations.

Linearly Transformed Cosines (LTC) and analytical solid-angle polygonal integration are omitted; numerical validation relies entirely on exact four-corner contour summation. Polygonal horizon clipping, Phong-versus-cosine variance comparisons, high-variance firefly metrics, disk irradiance ratios, auxiliary shadow maps, multi-bounce transport, Russian roulette path termination, ReSTIR spatio-temporal resampling, and stratified area variance reduction are intentionally excluded. Biased estimators are evaluated strictly via numerical convergence curves rather than spatial renderings.

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

The presentation plates serve distinct diagnostic functions: the primary scene photograph establishes spatial context; the directional occupancy histogram verifies non-uniform angular density; the bias plot quantifies asymptotic error floors; and the centroid plate demonstrates localized geometric divergence. Proper Monte Carlo light sampling requires transforming surface area density into directional solid angle via the full differential Jacobian; omitting \(r^2\) or the emitter cosine yields persistent, non-convergent integration bias.
Dense meters follow.

---

## Appendix A — Meters (quote tables, not photographs)

All radiometric quantities are resolved in CPU double-precision before entering the Neutral transform. The pseudorandom seed is strictly defined as **20260924**. The comprehensive operational metrics from this execution are organized into a **2**-column format, tabulated below:

![Metrics strip. A two-column picture of this run’s table: seed 20260924, Ω⊥, EY, centroid relative, Jacobian ratio, RMSE ladder, omission floors, histogram counts, 72 pass / 0 fail. Quote the table in the text. Not a cover.](/assets/journal/light-sampling-and-the-area-jacobian/04_metrics.jpg)


| Parameter | Value |
| --- | --- |
| Seed / \(K\) / \(N\) rungs | **20260924** / **32** / **16**, **64**, **256**, **1024** |
| \(N_{\mathrm{hist}}\) / \(n_\mu\) / \(n_\phi\) | **16384** / **16** / **32** |
| Generator \(u_0\) / \(v_0\) | **0.0549755345579** / **0.190148106104** |
| \(L_i\) RGB / \(Y\) | \((\mathbf{4}, \mathbf{4}, \mathbf{4})\) / **4** |
| \(L_{\mathrm{fill}}\) RGB / \(Y\) | \((\mathbf{0.025}, \mathbf{0.028}, \mathbf{0.036})\) / **0.0279398000** |
| \(\rho\) / exposure / Neutral | **0.80** / **1.00** / \(e=\mathbf{1.00}\), \(F_{\mathbf{90}}=\mathbf{0.04}\), \(K_s=\mathbf{0.76}\), \(K_d=\mathbf{0.15}\) |
| Instrument coordinate | \((\mathbf{0.280}, \mathbf{0.908}, \mathbf{-0.200})\) |
| Panel \(y\) / \(z\) / \(A\) | \([\mathbf{1.10}, \mathbf{1.90}]\) / \([\mathbf{-0.28}, \mathbf{0.28}]\) / **0.448** \(\mathrm{m}^2\) |
| \(\Omega_\perp\) | **0.419598441342** \(\mathrm{sr}\) |
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
| Interior cells | **35** |
| Area occupancy min / max | **86** / **952** |
| Uniform-\(\Omega\) occupancy min / max | **314** / **400** |
| Fixture S / M \(\Omega_\perp\) | **0.000399946674132** / **0.752274688454** \(\mathrm{sr}\) |
| Asserts | **72** pass / **0** fail |

 |

Display rounding is employed strictly for visual coherence on the output plates. The bias chart's six-decimal means are printed as: \(+\mathbf{0.007753}\), \(\mathbf{-0.645747}\), and \(+\mathbf{1.040131}\). The centroid callout reads: **-0.195** and `\mathbf{-0.194937}`. The crop headers display: legal **0.446**, centroid **0.362**. The heat map peaks at roughly **0.115**. Our opening RMSE sequence lists: **0.1644**, **0.1089**, **0.06826**, and **0.02638**. The opening panel-to-fill ratio is **22.069**, and the radial distance ratio evaluates to **3.349**. These visual abbreviations never supersede the full precision of the analytic table.

The instrument-pixel headers strictly measure the float-buffer luma corresponding to the photograph. The `Lo_total_Y` value belongs exclusively to the analytic card. Always rely upon the raw numerical metrics to dictate the true values for \(E\), \(\Omega_\perp\), and the biased estimator floors.
## Appendix B — Assertions

Execution suite validation: **72 pass / 0 fail**.

All geometric bounds are verified analytically prior to render dispatch:

* Signed projected solid angle \(\Omega_\perp\), luminance \(E_Y\), centroid discrepancy, radial distance limits, minimum cosines, and extremal Jacobian values match analytic contour limits.
* Minimum emitter cosine across the surface remains \(\ge \mathbf{0.20}\).
* The distance ratio \(r_{\max}/r_{\min}\) is \(\ge \mathbf{2}\).
* The measurement card is offset by **0.28** m from the emitter plane (exceeding the **0.25** m constraint), precluding coplanar boundary singularities.
* The nearest emitter coordinate resides at \(y=\mathbf{1.10}\), confirming closer proximity than the panel centroid.
* All corner cosine evaluations remain strictly positive.
* Direct-to-ambient ratio \(E_Y/E_{\mathrm{fill},Y}\) exceeds **10**.
* Source emission \(L_i\) is achromatic, surface albedo is \(\rho=\mathbf{0.80}\), and exposure is set to **1.00**.

Calibration source verification confirms that Fixture S converges with the analytical on-axis limit, while Fixture M confirms boundary divergence. The test scene satisfies the divergence threshold \(\vert{}(E_c-E)/E\vert{}\ge \mathbf{0.10}\).

Statistical convergence criteria verify that legal estimator RMSE decreases across all **4** rungs, with the error at \(N=\mathbf{64}\) exceeding twice the error at \(N=\mathbf{1024}\). Evaluated at \(N=\mathbf{1024}\), both omission bias floors substantially exceed residual legal RMSE, demonstrate mutual divergence, and stabilize between \(N=\mathbf{256}\) and \(N=\mathbf{1024}\). The directional interior mask encompasses exactly **35** bins, with area-uniform sample variance exceeding uniform solid angle distributions. Both \(E\) and the multi-prefix legal estimate remain strictly achromatic. Frame buffers maintain target dimensions of **1280**\(\times\)**720**, with tonemapped plates matching specification.

---

