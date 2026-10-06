---
title: How a mipmap presents in the scene
description: "Not blur-because-far — a legal band-limit. Cornell and hallway photographs, then a zone-plate FFT proof on Mesa llvmpipe."
date: 2026-09-11
tags:
  - graphics
  - engine
  - sampling
math: true
cover: /assets/journal/mipmaps/16_cornell.jpg
---

The conventional heuristic suggests that mipmapping primarily blurs surface details as a function of distance. This characterization misidentifies the underlying signal processing mechanism.

In practice, a mipmap functions as the strict **legal band-limit** for the texture data supported by the discrete pixel grid. In the absence of a mip chain, high-frequency spatial details—such as wood grain, brickwork, small glyphs, and tiling—inject frequencies that exceed the Nyquist limit of a single sample per pixel. Consequently, these unsupported frequencies alias and fold into lower bands. Distant floors begin to exhibit specular sparkle, structural crawl, and moiré patterns, while metallic highlights aggressively glitter. By evaluating a box-filtered pyramid via a trilinear sampler, these aliased structures are attenuated, yielding a legally band-limited representation of the underlying materials. Critically, the near field—operating in the magnification regime—must remain mathematically identical.

The subsequent photographic evaluations of a Cornell box and hallway geometry demonstrate this mechanism physically. Afterward, a zone-plate Fast Fourier Transform (FFT) analysis proves that the missing energy undergoes aliasing rather than artistic blurring.

---

## Scene

The presentation scene is a Cornell box and a brick hallway under analytic lights, a ceiling emitter, and a low-cost IBL lobe—not a path tracer—on Mesa llvmpipe. Cook-Torrance GGX shading, linear color, ACES display, and CPU 2×2 box SSAA. Quantitative heroes are the zone-plate / chirp ladder at fixed footprint \(\rho\); the photographs below are photo-only. Dense meters live in the appendix.

Observe the Cornell box rendered from identical camera coordinates.

![Cornell box, PBR, same camera. Left: NEAREST no-mip — wood sparkles, glyphs moiré. Right: CPU box-mip trilinear — soft legal wood, soft legal glyphs. Photograph only — no ρ, no AF.](/assets/journal/mipmaps/16_cornell.jpg)

Under `GL_NEAREST` sampling without a mipmap (left), high-frequency authoring in the satin wood planks, letter-grid wallpaper, and brushed metal exceeds the spatial resolution of the distant pixel grid. As a result, the floor exhibits specular sparkle, small glyphs degrade into moiré interference, and metallic surfaces glitter. Conversely, applying a CPU-generated **2**\(\times\)**2** box pyramid to both the albedo and roughness maps via `GL_LINEAR_MIPMAP_LINEAR` resolves these artifacts (right). The false high-frequency patterns collapse into the true, legally representable wood texture. Because the geometric distance to both the tall and short boxes remains within the near field, their vertical surfaces maintain distinct readability. This demonstrates the fundamental presentation of a mipmap: it is a mathematically pre-band-limited level of detail, rather than a distance-based fog or blurring heuristic.

This mechanism scales to standard environmental traversal, such as a hallway block.

![Brick hallway, ceramic-tile floor, wood doors. Left: far tiles crawl. Right: soft legal grout/glaze. Near doors still match. Photograph only.](/assets/journal/mipmaps/18_hallway.jpg)

The frequency folding artifact is most pronounced on the vanishing floor plane. Notably, the near-field door frames remain identical across both renderings, confirming that magnification functions purely as a reconstruction filter. The residual softness observed on the right is a consequence of isotropic over-blurring, where the footprint bounds \(\rho=\max(\rho_x,\rho_y)\) enforce a band-limit governed by the texture's major axis. This observation is independent of anisotropic filtering (AF) techniques or proprietary hardware-level mip-selection heuristics.

A distance strip explicitly separates the minification and magnification regimes, prominently visible within the wood grain:

![PBR Cornell floor. Top MIP, bottom NO-MIP. Columns NEAR / MID / FAR. NEAR is the mag control — spec hotspot matches. FAR is the fold.](/assets/journal/mipmaps/19_floor_distance.jpg)

The NEAR column serves as the magnification control and must match exactly; a softer "mip" rendering in the near field indicates a flawed implementation. The FAR column isolates the frequency fold: the non-mip grain exhibits structural crawl, whereas the mipmapped evaluation properly resolves into the band-limited plank.

At grazing angles, the Cook-Torrance GGX specular streak on the varnish continues to render convincingly as a contiguous floor surface. The aliasing fold primarily disrupts the underlying diffuse wood albedo.

![Same Cornell mesh, low camera along the floor. Spec highlight on the varnish; wood crawl on the left, softer legal wood on the right.](/assets/journal/mipmaps/17_cornell_grazing.jpg)

Proximity analysis of the metallic box isolates the geometric brush stroke texture against the mipmap, the green-wall diffuse interreflection, and the floor seams. Confined to the near-field, the "MIP" decal remains fully resolved.

![Metal box + wood floor, same L/R pair. Photograph only.](/assets/journal/mipmaps/20_cornell_pbr_closeup.jpg)

Shading is governed by a Cook-Torrance GGX microfacet model to approximate physical photographic conditions rather than a sterile Lambertian test environment. Scene illumination is provided by analytic point lights, a rectangular ceiling emitter, and a low-cost image-based lighting (IBL) lobe—the renderer is **not a path tracer**. Computations occur in a linear color space followed by an ACES display transform. A CPU **2**\(\times\) box supersampling anti-aliasing (SSAA) pass ensures clean geometric silhouettes. These specific frames are excluded from the quantitative CSV dataset and do not undergo FFT analysis. The diagnostic HUD explicitly outputs: `PBR photo-only … GGX … rho=n/a`. Quantitative hero metrics remain restricted to the subsequent chirp evaluations.

That establishes the visual presentation. The subsequent analysis provides mathematical proof that the missing energy undergoes frequency folding.



## Method

### \(\rho\), \(\lambda\), and the fold
Within this experimental context, \(\rho\) explicitly defines the footprint ratio in **texels per pixel**. Evaluated across the orthographic test quad, this term is derived arithmetically rather than via derivative approximations (`dFdx`):

\[\rho = \frac{N\cdot\Delta\mathrm{UV}}{W_{\mathrm{px}}},\qquad \lambda = \log_2\rho + \mathrm{lodBias}.\]

The evaluation domain strictly isolates \(\rho\in\{\mathbf{1},\mathbf{2},\mathbf{4},\mathbf{8},\mathbf{16}\}\). The primary metric configuration establishes \(N=\mathbf{1024}\) and \(W=\mathbf{128}\), yielding \(\rho=\mathbf{8}\) and \(\lambda=\mathbf{3}\). Note that the \(\rho=\mathbf{1}\) configuration precludes mapping a full **1024**-wide \(uv\)-domain onto a **512**-pixel framebuffer; consequently, the magnification control evaluates the isolated **center** **512**\(\times\)**512** texel region (\(\Delta\mathrm{UV}=\mathbf{0.5}\)).

A given texture spatial frequency \(f_{\mathrm{tex}}\) (cycles/texel) maps to the screen domain as \(f_{\mathrm{px}}=\rho\, f_{\mathrm{tex}}\). The fundamental Nyquist limit for the discrete pixel grid remains fixed at \(\tfrac12\) cycle/px. Spectral aliasing, or folding, occurs unconditionally when:

\[f_{\mathrm{tex}} > \frac{1}{2\rho}.\]

At the prescribed \(\rho=\mathbf{8}\) boundary, any spatial frequency exceeding \(\tfrac{1}{\mathbf{16}}\) cycle/texel surpasses the localized Nyquist limit. High-frequency authoring characteristics—such as wood grain, brick mortar lines, glyph boundaries, and tile grout—occupy this spectral domain as the projected surface area diminishes. Dictated by the sampling theorem, these frequencies cannot undergo spontaneous truncation; they fold into lower wavenumbers \(k\). This induced lower \(k\) structure physically manifests as the observed specular sparkle and structural crawl.

The analytical zone-plate is structured as a Fresnel chirp, constrained by a radial disk mask, and evaluated precisely at pixel centers:

\[I=\tfrac12+\tfrac12\cos(\pi r^2/N)\qquad(I=\tfrac12\text{ for }r>N/2),\]

\[f_{\mathrm{inst}}(r)=r/N \implies f_{\mathrm{inst}}(N/2)=\tfrac12.\]

At \(\rho=\mathbf{8}\), the vast majority of the spatial disk contains frequencies that must fold into lower \(k\) bands. The base LOD (L0) is authored near but not exceeding its local Nyquist limit, followed by discrete sampling; it is explicitly not subjected to a continuous brick-wall low-pass filter prior to evaluation.

![CPU zone-plate L0, disk-masked.](/assets/journal/mipmaps/00_zoneplate_l0.jpg)

![log|F| of the L0 crop. Energy lives inside the Nyquist circle.](/assets/journal/mipmaps/01_zoneplate_fft.jpg)

To isolate radial aliasing without planar cross-contamination, a 1-D chirp serves as a correlated diagnostic tool characterized by a single spectral ridge. The signal phase is rigorously locked to enforce \(f(N)=\tfrac12\); evaluating the naive form \(\pi x^2/N\) would inherently alias the right half of the L0 domain, corrupting the benchmark by measuring an authoring artifact rather than a sampling fold.

![1-D chirp L0, f(N)=1/2.](/assets/journal/mipmaps/02_chirp_l0.jpg)

![log|F| of the chirp: one ridge.](/assets/journal/mipmaps/03_chirp_fft.jpg)

---

### What the PBR path actually is
The shading pipeline evaluates a Cook-Torrance GGX microfacet model utilizing a metalness-roughness workflow implemented in GLSL **330**. Specifically, the normal distribution function \(D\) evaluates GGX (Trowbridge-Reitz), the geometric masking-shadowing function \(G\) evaluates Smith utilizing the Schlick-GGX approximation, and the Fresnel term \(F\) evaluates the Schlick approximation. The rendering framework relies entirely upon direct analytical lighting—it is explicitly not a path tracer. Normal variance mapping (Toksvig mapping) is excluded. Both the semantic albedo textures and the ORM material parameter maps are prefiltered using the identical CPU **2**\(\times\)**2** box convolution. The display mapping pipeline applies the ACES (Narkowicz) curve followed by a \(\gamma=\) **2.2** inverse electro-optical transfer function applied to the linear framebuffer output.

The primary room photographs were acquired at a high gallery resolution of **2560**\(\times\)**1440**, utilizing a CPU **2**\(\times\) box supersampling anti-aliasing (SSAA) pass in lieu of hardware GL MSAA. This dedicated SSAA pass operates strictly on geometric boundaries—attenuating discrete rasterization steps along the boxes, the ceiling light quad, door frames, and vanishing hallway trajectories. While this spatial filtering slightly averages the high-frequency non-mipmapped aliasing ("sparkle"), the fundamental phenomenological distinction between spectral folding and mathematical band-limiting remains unambiguous. The analytical zone-plate and corresponding FFT frames are strictly locked to **1280**\(\times\)**720**, evaluating a **512**\(^2\) FBO extraction.

The Cornell Box configuration provides a standardized structural *layout*; it is not deployed here as a global illumination benchmark metric. The visual aesthetic is strictly defined by the combination of an area emitter, localized bounce approximations, and a gradient IBL environment. Ultimately, evaluating the scene via physical-based rendering (PBR) does not alter the fundamental signal processing mathematics governing the core theorem.

---

## Discussion

### The lab version of the same sparkle
Consider a circular zone-plate (a Fresnel chirp). Its instantaneous frequency \(f_{\mathrm{inst}}\) increases with radial distance, establishing a well-defined Nyquist ring. Maintaining the exact texture and orthographic projection, the image is minified at a fixed footprint of \(\rho=\) **8** (\(\lambda=\) **3**): effectively **8** texels per pixel evaluated with only **1** sample per pixel.

![ρ=8 GL_NEAREST, no mip: false rings. Left is the real 128-px quad; right is NN zoom (display only).](/assets/journal/mipmaps/04_rho8_nearest.jpg)

The resulting evaluation yields a pure moiré pattern. This artifact is not a product of excessive distance; rather, it is high-frequency energy exceeding the local Nyquist limit folding into lower frequency bands. This represents the precise mechanism observed on the Cornell floor, quantified here with a known instantaneous frequency \(f_{\mathrm{inst}}\).

Applying bilinear filtering without a supporting mip chain is insufficient to correct the aliasing. The `GL_LINEAR` operator functions merely as a triangle filter; while it attenuates minor amplitude components, the underlying frequency fold remains largely intact.

![ρ=8 GL_LINEAR, still no mip. Softer, still folded.](/assets/journal/mipmaps/06_rho8_linear.jpg)

Evaluating the same footprint using a CPU **2**\(\times\)**2** box pyramid paired with `GL_LINEAR_MIPMAP_LINEAR` resolves the aliasing. For analytical comparison, the right column demonstrates a pyramid constructed without a low-pass filter, operating strictly as a point-subsampled hierarchy.

![Left: box-mip trilinear, false rings gone — the legal disk, the lab version of the soft wood. Right: point-subsample pyramid, no low-pass — aliases remain.](/assets/journal/mipmaps/08_rho8_mip_box.jpg)

The left column demonstrates the legally band-limited disk—the analytical equivalent of the soft wood rendering. The right column merely produces a lower-resolution image preserving identical aliases. **A mip chain generated without an appropriate low-pass filter does not constitute a valid mipmap.** This specific control column confirms that generating hierarchical levels must mathematically equate to band-limiting the signal. If the Cornell scene were evaluated using a point-sampled pyramid, the floor would retain its specular sparkle.

---

### Two regimes, never mixed
**Magnification** (\(\rho\le\) **1**, \(\lambda\le\) **0**) operates strictly as a reconstruction filter. The mipmapped and non-mipmapped evaluations must match exactly. Any observed softening in the mipmapped output under magnification indicates a systemic error.

**Minification** (\(\rho>\) **1**, \(\lambda>\) **0**) dictates the onset of the band-limit and the associated frequency fold. This regime forms the core subject of the present analysis.

Within this execution, at \(\rho=\) **1**: the comparison between `LINEAR` and `LINEAR_MIPMAP_LINEAR` yields a mean absolute error (MAE) of **0**. Both sampling routines access the base level (L0) utilizing identical linear magnification. This column functions as the analytical control rather than a primary metric, mirroring the NEAR column in the physical distance strip.

![Alias ladder ρ=1,2,4,8,16. Top LINEAR no-mip, bottom box-mip. ρ=1 rows match (MAE=0). Fold takes over from ρ=4.](/assets/journal/mipmaps/10_alias_ladder.jpg)

At \(\rho=\) **2**, the authored chirp signal marginally reaches the updated Nyquist limit; consequently, the alternating-current power \(P_{\mathrm{ac}}\) remains highly correlated. However, scaling to \(\rho=\) **4** and beyond, the non-mipmapped (top) sequence degenerates into an aliased lattice, whereas the box-filtered mipmap (bottom) successfully isolates the legally band-limited disk. Critically, the spatial pixel MAE during minification does not function as the defining metric. By \(\rho=\) **16**, the spatial MAE is reduced to a nominal **0.008** simply because the unmitigated aliasing variant has collapsed into a uniform gray field of unresolved high frequencies. Despite the low MAE, the underlying structural compositions of the two signals remain fundamentally divergent.

---

### The theorem is the spectrum
The diagnostic PNG output utilizes a **16**-entry heat lookup table representing \(\log_{\mathbf{10}}(\vert{}F\vert{}+\varepsilon)\), bounded by \(\varepsilon=\mathbf{10}^{\mathbf{-8}}\). Analytical fidelity requires executing `glReadPixels(..., GL_FLOAT)` directly against the active RGBA32F framebuffer object. An interior \(\mathbf{256}^2\) spatial crop is extracted, mean-centered, windowed via a separable Hann function, and processed through an unnormalized radix-**2** Discrete Fourier Transform (DFT) within the identical execution binary. Spectral power is computed as \(P_{\mathrm{bin}}=\vert{}F\vert{}^2/M^2\). Crucially, the identical `vmin/vmax` scaling factors are rigidly enforced across the \(\rho=\mathbf{8}\) evaluation pairs to guarantee valid comparative analysis. Extracting FFT derivations from the heavily compressed Cornell PNG files is strictly unsupported.

Evaluating nearest-neighbor sampling (`GL_NEAREST`) without a mipmap produces total spectral folding:

![ρ=8 NEAREST log|F|. Shared scale with 07/09. vmax=2.21.](/assets/journal/mipmaps/05_rho8_nearest_fft.jpg)

Employing bilinear magnification filtering (`GL_LINEAR`) without a mipmap hierarchy demonstrates minor high-\(k\) attenuation but retains significant alias energy, maintaining a measured vmax of **2.21**:

![ρ=8 LINEAR no-mip log|F|. Triangle filter, not a band-limit.](/assets/journal/mipmaps/07_rho8_linear_fft.jpg)

Contrasting the true box-filtered mipmap against an invalid point-subsampled hierarchy, **evaluated utilizing the identical scaling constraints established in 05**:

![Left: box-mip, high-k gone, box-sinc sidelobes remain, vmax=0.998. Right: point-subsample, aliases remain, vmax=2.22.](/assets/journal/mipmaps/09_rho8_mip_box_fft.jpg)

This specific image pairing forms the visual proof of the underlying sampling theorem. The significant high-\(k\) spectral energy documented in **05** is entirely eradicated in the left panel of **09**. Conversely, the right panel of **09** is structurally indistinguishable from **05**, confirming that a point-sampled hierarchical pyramid bypasses fundamental low-pass filtering. The visual softness achieved in the Cornell evaluation is exclusively a product of the mathematical band-limiting demonstrated in the left panel of **09**, not the hierarchy generation in the right panel.

Evaluating a discrete box filter in the spatial domain corresponds mathematically to a sinc filter evaluated in the frequency domain:

\[L_{\ell+1}(i,j) =\tfrac14\sum_{a=0}^{1}\sum_{b=0}^{1} L_{\ell}(2i+a,\,2j+b).\]

The resultant high-frequency sinc sidelobes propagating above the adjusted Nyquist limit are distinctly resolvable in the left panel of **09**. This spectral artifact serves as a rigorous proof of methodology rather than an anomalous driver implementation. The evaluation deliberately bypasses `glGenerateMipmap`; instead, Mesa's internal codepath operates functionally as a discrete blit/box approximation. Both the semantic albedo textures and the ORM material maps are processed strictly utilizing this identical CPU box filter. The point-subsampled hierarchy is retained purely as an analytical control vector:

\[L_{\ell+1}(i,j)=L_{\ell}(2i,\,2j).\]

Standard trilinear hardware filtering is formally defined as the interpolation \(\mathrm{mix}(L_{\lfloor\lambda\rfloor},L_{\lceil\lambda\rceil},\{\lambda\})\). The findings presented within this analysis do not assert specific qualitative claims regarding the filtering fidelity of commercial hardware implementations.

---

### Spectrum follows \(\lambda\), not “distance”
There is no spatial camera operating within the orthographic evaluation path. By modulating the `lodBias` by \(\pm\) **1** at a **fixed** \(\rho=\) **8** footprint, the resulting spectral response is explicitly isolated:

![lodBias −1 / 0 / +1 at ρ=8. Top: sampler. Bottom: textureLod. Spectrum follows λ.](/assets/journal/mipmaps/14_lod_bias.jpg)

| Bias | \(\lambda\) | \(P_{\mathrm{ac}}\) |
| --- | --- | --- |
| \(-\) **1** | **2** | **110** |
| **0** | **3** | **30** |
| \(+\) **1** | **4** | **0.27** |

Under-biasing (\(-\mathbf{1}\)) demonstrably retains a residual frequency fold. Over-biasing (\(+\mathbf{1}\)) attenuates nearly all AC spectral power. These precise evaluation cells were independently verified utilizing explicit `textureLod` queries. This confirms that the spectral footprint follows the directly specified level of detail. The perceived softness observed within the Cornell box rendering is governed by this exact mechanism: the specific prefiltered hierarchical level accessed by the sampler dictates the band-limit, not the raw geometric distance calculated from the camera origin.

If the mip level is explicitly forced upon a \(\rho=\) **1** spatial window, the resulting signal footprint physically contracts because \(\lambda\) dictates the evaluation frequency, not because the underlying quad underwent spatial translation:

![textureLod λ=0..4, same UV window. Spatial strip on top, log|F| under a shared scale.](/assets/journal/mipmaps/13_lod_strip.jpg)

The measured \(P_{\mathrm{ac}}\) values along that progression are: **1146**, **1042**, **815**, **437**, and **144**. The residual high-frequency box-sinc lobes emerging at \(\lambda\ge\) **2** represent the identical spectral artifact documented previously in the left panel of **09**.

Expressed in GLSL **330** utilizing a singular uniform state:

```glsl
vec4 s = (uMode == 1) ? textureLod(uTex, vUV, uLod)
                      : texture(uTex, vUV, uBias);

```

The implicit derivative function `textureQueryLod` is excluded (requiring GLSL **400**). The LOD *photograph* is constructed via a false-color mip chain evaluated utilizing `NEAREST_MIPMAP_NEAREST`. Executed on llvmpipe under `GALLIVM_PERF=no_filter_hacks`, the implicit \(\lfloor\lambda\rfloor\) aligned precisely with the explicit CPU hierarchical ladder. **This behavior must not be generalized to commercial NVIDIA, AMD, or Intel hardware implementations.** Furthermore, one must not assume that the continuous analytical derivative `dFdx` perfectly mirrors discrete hardware gradient evaluations. The rigorous scientific path circumvents these variables entirely: it relies exclusively on a CPU-derived \(\lambda\), a CPU-constructed pyramid, and explicit `textureLod` sampling.

![Falsecolor level vs CPU λ on the ortho ladder. Matched here; untrusted as a hardware claim.](/assets/journal/mipmaps/12_lod_falsecolor.jpg)

---

### Isotropic mip is the wrong ellipse
The following photograph (with no \(\rho\) debug HUD and no AF analytical table) perfectly visualizes the residual softness localized on the mipmapped half of the hallway sequence, explained here via the zone-plate analysis.

![Foreshortened floor. Left: NEAREST no-mip. Right: isotropic mip over-blurs the minor axis. Photograph only.](/assets/journal/mipmaps/15_foreshorten.jpg)

Because the isotropic footprint \(\rho=\max(\rho_x,\rho_y)\) strictly enforces a band-limit determined by the major geometric axis, it inherently over-blurs high frequencies along the minor axis. Elliptical Weighted Average (EWA) and hardware anisotropic filtering (AF) are the advanced reconstruction techniques designed to address this limitation; however, they are not executed within this specific laboratory framework. It is crucial to reiterate that llvmpipe is an unsuitable backend for characterizing discrete-GPU filtering quality.

---

## Limits

### What this box actually measured
Host Environment: OSMesa, Mesa **25.0**.**7**-**2**+deb13u1, llvmpipe (LLVM **19.1**.**7**, **256** bits). The framebuffer utilizes a strict **RGBA32F** target, ensuring that an **8**-bit quantization fallback is **not hit**. Neither hardware sRGB conversions nor MSAA are applied to the analytical FBO. Texture wrapping behavior is rigidly set to `CLAMP_TO_EDGE`. Across all automated internal assertions, **27** pass / **0** fail. This validation suite encompasses the DFT integrity self-test, verifying that the \(\rho=\) **1** MAE identically evaluates to **0**, and ensuring that the measured \(\rho=\) **8** \(P_{\mathrm{ac}}\) for nearest-neighbor sampling exceeds **5**\(\times\) the equivalent mipmapped output (specifically, **898** vs **30**). The semantic PBR scene renders function purely as supplementary qualitative visualizations; they are formally decoupled from the core numerical scientific checks.

We can establish the following claims: Operating on this specific software rasterizer architecture, minifying a frequency-authored chirp without a hierarchical mip chain forces signal energy into an aliasing fold. Evaluating a CPU-generated box pyramid in conjunction with trilinear sampling mathematically eliminates the vast majority of that spurious AC spectral power. This attenuation was measured directly utilizing the binary's internal DFT, evaluated from a high-precision floating-point readback. Furthermore, the qualitative sampler visualizations—encompassing both the PBR Cornell box and the hallway geometry—represent mathematically accurate outputs for this specific rasterizer configuration.

We cannot establish the following claims: the behavior of hardware LOD heuristics, the quality of hardware anisotropy algorithms, texture cache hit-rate performance, memory bandwidth consumption, shader occupancy metrics, or a definitive assertion that "this represents standardized commercial GPU operation." We cannot assert that the continuous zone-plate functions as a mathematically perfect ideal low-pass filter (LPF) source. We cannot validate executing an arbitrary FFT against the compressed output PNG and classifying the resultant data as rigorous scientific measurement. Finally, we cannot directly correlate the numerical \(P_{\mathrm{ac}}\) reductions to the subjective visual softness of the rendered wood floor geometry.

A discrete box filter \(\neq\) an ideal LPF. A point-subsampled hierarchy \(\neq\) a valid frequency-band-limited mipmap. A shift in \(E_{\mathrm{hi}}\) \(\neq\) the documented **10**\(\times\) drop in aliased power. Failure to zero-pad utilizing the mean value guarantees that windowing artifacts will dominate the spectral results. Magnification MAE must inherently evaluate to zero, otherwise the foundational reconstruction methodology is irreparably flawed. Ultimately, a mipmap presents within the scene strictly as a legal mathematical band-limit, and never merely as a heuristic distance-fog.
## Out of scope

Hardware paths, product filters, and instruments named only as excluded in the honesty notes remain out of scope for this measurement.

Dense meters follow.

---

## Appendix A — Meters (quote tables, not photographs)

Radial metrics are defined as:

\[P(k)=\mathrm{mean}\{P_{\mathrm{bin}}:k-\tfrac12\le\vert{}\omega\vert{}<k+\tfrac12\}, \qquad E_{\mathrm{hi}}=\frac{\sum_{k>k_{\mathrm{Nyq}}}P(k)}{\sum_{k\ge 1}P(k)}\]

with the Nyquist threshold \(k_{\mathrm{Nyq}}=M/\mathbf{2}=\mathbf{128}\). Because spectral annuli are integrated with uniform weighting, the persistent Hann/box-sinc sidelobes residing in the outer high-frequency rings artificially stabilize the computed ratio, even after the primary alias fold is successfully mitigated.

Operating at \(\rho=\mathbf{8}\), footprint \(W=\mathbf{128}\), utilizing a localized crop of **256**, and enforcing `padded=`**1**, the analytical run captured the following metrics:

| Filter Algorithm | \(E_{\mathrm{hi}}\) | \(P_{\mathrm{ac}}\) | \(\log_{\mathbf{10}}\Vert{}F\Vert{}\) vmax |
| --- | --- | --- | --- |
| `NEAREST` no-mip | **0.274** | **898** | **2.21** |
| `LINEAR` no-mip | **0.256** | **379** | **2.21** |
| box-mip trilinear | **0.241** | **30** | **0.998** |
| point-subsample | **0.328** | **899** | **2.22** |
| `textureLod` \(\lambda=\mathbf{3}\) | **0.241** | **30** | **0.998** |

It is crucial to observe that the radial \(E_{\mathrm{hi}}\) metric registers an insignificant reduction from **0.274** to **0.241**. This shift emphatically does not represent a **10**\(\times\) decrease. The corresponding pixel-weighted variant \(E_{\mathrm{hi,pix}}\) similarly remains static, shifting merely from **0.202** to **0.206**. Under extreme minification at \(\rho=\mathbf{16}\), the radial \(E_{\mathrm{hi}}\) metric actually evaluates *higher* for the proper box-mip implementation than for the broken `LINEAR` evaluation (**0.119** vs **0.087**), despite the total AC power \(P_{\mathrm{ac}}\) plummeting precipitously from **118** to **2**.

The scalar \(P_{\mathrm{ac}}\) directly quantifies the integrated sum of \(P_{\mathrm{bin}}\) excluding the DC component. The documented reduction from **898** to **30** signifies an approximate **30**\(\times\) attenuation in alias energy. This massive scalar drop, corroborated by the rigidly shared-scale \(\log\vert{}F\vert{}\) visual pairings, forms the central analytical conclusion of this evaluation. The explicit `textureLod` output aligned flawlessly with the implicit-LOD derivation under this strictly orthographic geometry. These precise numerical metrics must be attributed exclusively to the analytical chirp evaluations, not the qualitative wood floor renderings; the Cornell geometry provides phenomenological context, whereas the zone-plate serves as the calibrated mathematical instrument.

![P(k) overlay at ρ=8, log y, Nyquist tick. HUD: P_ac N=898 / M=29.8.](/assets/journal/mipmaps/11_pk_overlay.jpg)

When the projected quad dimensions fall below the evaluation crop window (\(W=\mathbf{128}\) or **64**), the unpopulated framebuffer region is initialized to a strict **0.5** clear color—precisely matching the analytical mean of the zone-plate. Consequently, upon executing mean-subtraction, the padded exterior collapses exactly to zero (`padded=`**1** in the resulting CSV dataset). Enforcing a rigid rectangular boundary cut would have injected a pervasive **2**-D sinc distribution capable of overpowering the filter responses across the entire test matrix.

The analytical Hann window applied across every discrete evaluation crop inherently introduces its own spectral footprint, ensuring its orthogonal cross-axial structure is not erroneously interpreted as genuine signal aliasing:

![Hann-window spectrum. Sidelobes are not alias.](/assets/journal/mipmaps/hann_control.jpg)

---

