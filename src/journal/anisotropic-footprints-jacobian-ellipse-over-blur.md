---
title: "Anisotropic Footprints: Jacobian, Ellipse, Over-Blur"
description: "Mip LOD is not the footprint. Checker graze, then Jacobian ellipse — isotropic over-blur versus CPU-EWA."
date: 2026-09-13
tags:
  - graphics
  - engine
  - sampling
math: true
cover: /assets/journal/anisotropic/15_hallway.jpg
---

Mip LOD is not the footprint, a reality most evident when observing a grazing checkerboard.

Our preceding analysis of mipmaps documented the residual softness inherent to the formulation: the isotropic \(\rho=\max(\rho_x,\rho_y)\) metric successfully band-limits to the major axis but severely over-blurs the minor axis. While that note introduced the artifact conceptually, this manuscript rigorously defines the Jacobian, the corresponding elliptical footprint axes, and a lab-honest anisotropic sample—specifically, a CPU-evaluated elliptical weighted average (EWA) that executes and measures deterministically on OSMesa and llvmpipe.

For our primary evaluated footprint (\(a=\mathbf{8}\), \(b=\mathbf{1}\), \(\mathrm{aniso}=\mathbf{8}\)), the AC power \(P_{\mathrm{ac}}\) measures **979.532** under nearest-neighbor sampling (no mip), **112.848** under isotropic mipmapping, and **98.751** under CPU-EWA. Do **not** mistakenly interpret this metric as asserting "EWA is sharper overall". The residual AC energy persisting in the isotropic filter consists of box-mip sinc lobes strictly aligned along the **major** axis. The actual functional theorem lies within the minor-axis energy (\(E_{\mathrm{minor}}\)): the isotropic approach retains **4.244** while EWA successfully retains **8.478**. EWA preserves substantially more valid signal detail along the short axis, which represents the entire mathematical justification for the technique.

Assertions on this validation run: **41** pass / **0** fail. The scientific magnification Mean Absolute Error (MAE) evaluates to **0**, and the presentation magnification MAE evaluates to **0**. The photographic hero MAE(iso, EWA) measured on the hallway scene is \(\approx\mathbf{0.011}\). For comparative context, evaluating llvmpipe GL AF \(N=\mathbf{1}\) against \(N=\mathbf{16}\) yields an MAE of \(\approx\mathbf{0.0034}\)—a small delta explicitly labeled **NOT hardware 16× AF**, functioning as an architectural reality check rather than the core pedagogical lesson.


## Scene
We observe an identical floor plane processed through three distinct filter kernels. The stimulus is a CPU-authored black and white checkerboard, \(\mathbf{1024}^2\), featuring **64** discrete cells spanning the floor width, while the bounding walls and ceiling remain a diffuse flat gray. There is deliberately no \(\rho\) debug visualization rendered on the HUD.

![Checker hallway graze, 3-up. Left: nearest no-mip — vanishing checks crawl. Middle: isotropic mip — fold gone, floor is mud. Right: CPU-EWA — major limited, checks survive. Photograph only. a=n/a. NOT hardware 16× AF.](/assets/journal/anisotropic/15_hallway.jpg)

Analyzing the three compositional panels:

* **NO-MIP:** Major-axis frequencies critically fold. The checker patterns crawl, sparkle, and generate moiré interference radiating toward the vanishing point. This replicates the visual from the mipmaps Cornell floor, but is now analyzed against a mathematically known elliptical footprint in the lab environment.
* **ISO-MIP:** The aliasing fold is largely suppressed, but the floor degenerates into a gray field of over-blur. The isotropic Level of Detail (LOD) parameter \(\lambda=\log_\mathbf{2} a\) band-limits the *short* axis precisely as if it were the long axis. This physically demonstrates the exact leftover softness identified but left unresolved in our prior mipmaps manuscript.
* **CPU-EWA:** The major axis remains accurately band-limited, completely suppressing frequency crawl, while the minor axis retains the high-frequency checker detail. The aggregate softness contracts without reintroducing the aliasing fold.

The MAE(iso, EWA) calculated on this specific frame is \(\approx \mathbf{0.011}\). One might question why we do not simply utilize Mesa AF for the hero presentation column. On this specific software rasterizer, `GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT=16` operates as a software detail; performing the identical graze utilizing GL \(N=\mathbf{1}\) versus \(N=\mathbf{16}\) yields an MAE of only \(\approx \mathbf{0.0034}\). That mathematical delta is insufficiently large to provide an unmistakable isotropic versus anisotropic instructional lesson, which fundamentally necessitates utilizing our CPU-EWA reference for the \(\mathbf{3}\)-up layout.

Initially, we must verify the near-field reconstruction—magnification behavior must remain exactly invariant.

![Near checker floor, true magnification. Center (a,b)=(0.138, 0.097), a_max=0.468. Iso vs AF MAE=0. Photograph only.](/assets/journal/anisotropic/16_nearfield_mag.jpg)

If the anisotropic ("AF") filter appeared artificially sharper in this regime, the entire theoretical premise would be broken. Every probed spatial pixel on this near-field floor section satisfies \(a,b\le \mathbf{1}\).

Next, we evaluate a photograph of the theorem itself, utilizing the identical unprojected floor, checker texture, and a deterministically known CPU Jacobian:

![Foreshortened checker floor. Left: isotropic mip, check edges smear. Right: CPU-EWA, minor kept. Far pixel (a,b,aniso)=(15.89, 2.916, 5.45). CPU J from unproject.](/assets/journal/anisotropic/14_foreshorten_lr.jpg)

There exist two distinct sampling regimes here that must never be mathematically mixed, whether evaluated in a 3D environment or on a 2D zone-plate:

1. **Magnification** (ellipse semi-axes \(a\le \mathbf{1}\) and \(b\le \mathbf{1}\)): This regime represents pure signal reconstruction. Isotropic and anisotropic filtering operators **must match**. In our analytical science path (\(a=b=\mathbf{0.5}\)), the evaluated MAE(ISO-MIP, CPU-EWA) \(=\mathbf{0}\) and the corresponding \(P_{\mathrm{ac}}\) is identically **1177.19**. In the presentation pathway, the near-field frame evaluated above also perfectly matches with an MAE \(=\mathbf{0}\).
2. **Anisotropic minify** (one axis \(\gg \mathbf{1}\), the orthogonal axis closer to \(\mathbf{1}\)): The filtering footprint is fundamentally an ellipse, not a scalar radius \(\rho\). This regime constitutes the primary focus of this article.

Software rasterization inherently does not have to exhibit temporal flicker. Blurry softness observed at a locked camera pose is strictly the mathematical result of evaluating the wrong footprint, not a deliberate artistic direction choice.

---

## Method

### Why: Jacobian, ellipse, over-blur
### UV Jacobian (texel units)

Defining \((u,v)\) in texture space (texels) and \((x,y)\) in screen space (pixels):

\[J = \begin{pmatrix} \partial u/\partial x & \partial u/\partial y \\ \partial v/\partial x & \partial v/\partial y \end{pmatrix} = \begin{pmatrix} \mathbf{d}_x & \mathbf{d}_y \end{pmatrix}, \qquad \mathbf{d}_x=\bigl(\partial u/\partial x,\,\partial v/\partial x\bigr), \quad \mathbf{d}_y=\bigl(\partial u/\partial y,\,\partial v/\partial y\bigr).\]

In our analytical science path, this Jacobian is either defined exactly from the affine UV construction or computed deterministically on the CPU from the projected quad coordinates of a locked perspective floor plane. **Do not trust llvmpipe hardware `dFdx`/`dFdy` operations as the authoritative science source**. While the photographic presentation path may utilize the hardware sampler pipeline, those specific frames explicitly print `a=n/a` to formally distinguish them.

![One pixel of the Jacobian sentence. Left: screen pixel with d_x, d_y. Right: same vectors in UV plus the SVD ellipse. Constructed affine, a=8, b=1, aniso=8. CPU J, NOT DFDX.](/assets/journal/anisotropic/01_jacobian_legend.jpg)

### Isotropic GL-style scalars (continuity with mipmaps)

\[\rho_x=\lVert\mathbf{d}_x\rVert,\qquad \rho_y=\lVert\mathbf{d}_y\rVert,\qquad \rho=\max(\rho_x,\rho_y),\qquad \lambda=\log_\mathbf{2}\rho+\mathrm{lodBias}.\]

The isotropic LOD formulation band-limits **both** orthogonal axes to the scalar \(\rho\). When \(\rho_x\gg\rho_y\), the minor axis inherently suffers from significant over-blur. This mathematical reality directly causes the leftover softness observed on the mipmaps hallway test and the middle comparative panel of our checker graze.

An isotropic \(\rho=\sqrt{\rho_x^\mathbf{2}+\rho_y^\mathbf{2}}\) alternative formulation still inherently yields the wrong bounding ellipse. We establish this mathematically in one sentence and omit an extraneous visual frame.

### Footprint ellipse

A screen pixel’s preimage mapped into UV space constitutes the image of the unit pixel transformed under the Jacobian \(J\). The bounding semi-axes are derived analytically from the Singular Value Decomposition (SVD) of \(J\) (equivalent to the eigendecomposition of the covariance matrix \(JJ^\top\)):

\[J = U\,\Sigma\,V^\top, \qquad \Sigma=\mathrm{diag}(\sigma_{\mathrm{maj}},\,\sigma_{\mathrm{min}}), \qquad \sigma_{\mathrm{maj}}\ge\sigma_{\mathrm{min}}>\mathbf{0}.\]

\[a=\sigma_{\mathrm{maj}},\qquad b=\sigma_{\mathrm{min}},\qquad \mathrm{aniso}=\frac{a}{b}\quad(b>\mathbf{0}).\]

The bounding ellipse's geometric orientation aligns precisely with the major singular vector evaluated in UV space. When this ellipse is rendered onto the texture domain, it visualizes the unique, non-generic sampling artifact we are analyzing.

Our primary hero construction utilizes \(J=\mathrm{diag}(\mathbf{8},\mathbf{1})\). The analytical SVD yields \(a=\mathbf{8}\), \(b=\mathbf{1}\), \(\lambda_{\mathrm{iso}}=\mathbf{3}\), and \(\lambda_{\mathrm{aniso}}=\mathbf{0}\). A sheared variant computed at \(\theta=\mathbf{35}^\circ\) is presented adjacently to prove that AF fundamentally constitutes a truly oriented footprint, rather than a naive orthogonal "blur less in \(v\)" algorithmic hack.

![Unique artifact. Same zone-plate UV crop, two Jacobians, both aniso=8. Left: axis-aligned a=8, b=1. Right: sheared θ=35°. AF is an oriented footprint.](/assets/journal/anisotropic/02_footprint_ellipse.jpg)

We additionally visualize the Jacobian *field* mapped on the unprojected floor as \(\log_\mathbf{2}(a/b)\)—utilizing a meaningfully parameterized color scale, rather than a generic rainbow gradient deployed for aesthetic purposes. This evaluation utilizes the identical camera family as our primary theorem photograph.

![CPU Jacobian field log₂(a/b) on the unproject floor. Marked far pixel a=15.66, b=2.872, aniso=5.451.](/assets/journal/anisotropic/03_aniso_falsecolor.jpg)

### Isotropic vs anisotropic LOD

\[\lambda_{\mathrm{iso}}=\log_\mathbf{2}\max(a,b)=\log_\mathbf{2} a, \qquad \lambda_{\mathrm{aniso}}=\log_\mathbf{2} b.\]

The functional gap between these evaluations:

\[\lambda_{\mathrm{iso}}-\lambda_{\mathrm{aniso}}=\log_\mathbf{2}(a/b)\]

This calculable difference represents exactly the magnitude of the over-blur—quantified in discrete mip levels—applied along the minor axis. At the analytically constructed hero footprint, \(\log_\mathbf{2} \mathbf{8}=\mathbf{3}\): three extraneous mip levels of softness are unnecessarily applied to the short spatial axis for no mathematically valid sampling reason. The eccentricity hardware clamp \(A_{\max}=\mathbf{16}\) solely restricts the minor axis (forcing more blur and requiring fewer samples) when the ratio \(a/b>\mathbf{16}\). It strictly does not affect our hero case parameterized at \(a=\mathbf{8},b=\mathbf{1}\).

### Lab-honest anisotropic sample (CPU EWA-ish)

For each discrete pixel, we extract the UV ellipse geometry \((a,b,\theta)\) directly from the known Jacobian, clamp the operational eccentricity to \(A_{\max}=\mathbf{16}\), select a mipmap level driven exclusively by the **minor** axis (\(\lambda=\log_\mathbf{2} b\)), and accumulate a Gaussian weight distributed over the ellipse across that integer level and the adjacent next level. Under evaluated magnification (\(a\le \mathbf{1}\) and \(b\le \mathbf{1}\)), the filter gracefully falls back to bilinear L0, behaving identically to the standard isotropic path. This implementation serves as **our** strict mathematical reference—it is explicitly not Heckbert’s production filter, it is not OpenGL hardware AF, and it makes absolutely no claims regarding Mesa’s internal sampler behavior. Do not compare this reference model against NVIDIA, AMD, or Intel hardware texel-fetch counts or proprietary LOD transition curves.

### Zone-plate (reuse, do not re-litigate)

We reuse an analytical texture defined at \(N=\mathbf{1024}\) POT, formatted as a disk-masked Fresnel chirp, originating from the identical authorship as our prior mipmaps technical note:

\[I=\tfrac{\mathbf{1}}{\mathbf{2}}+\tfrac{\mathbf{1}}{\mathbf{2}}\cos(\pi r^\mathbf{2}/N) \qquad(I=\tfrac{\mathbf{1}}{\mathbf{2}}\text{ for }r>N/\mathbf{2}), \qquad f_{\mathrm{inst}}(r)=r/N\implies f_{\mathrm{inst}}(N/\mathbf{2})=\tfrac{\mathbf{1}}{\mathbf{2}}.\]

Because the instantaneous spatial frequency rises proportionally with the radius, an elliptical minification filter presents a deterministically known major-axis fold adjacent to a deterministically known minor-axis frequency remainder.

![CPU zone-plate L0, disk-masked, clamp. Continuity with mipmaps.](/assets/journal/anisotropic/00_zoneplate_l0.jpg)

## Discussion

### Unique artifact: the ellipse, then the spectrum
To isolate the filtering behavior, we construct a minification scenario where \(a=8\), \(b=1\), and \(W=128\). We evaluate three filters and their corresponding spectra, visualized using a shared \(\log\vert{}F\vert{}\) scale. The underlying data is acquired via `glReadPixels(..., GL_FLOAT)` from a 32-bit (RGBA32F) frame buffer object (FBO). We apply an interior \(256^2\) crop, mean-subtraction, and a separable Hann window before computing an unnormalized radix-2 discrete Fourier transform (DFT). The spectral power is defined as \(P_{\mathrm{bin}}=\vert{}F\vert{}^2/M^2\). Note that the checkerboard photographs are explicitly excluded from this DFT analysis.

**Nearest, no mip — major-axis fold.**
![Constructed elliptical minify, nearest no-mip. Disk is a lattice of false vertical rings. P_ac=979.5, E_minor=40.23.](/assets/journal/anisotropic/04_ellip_nearest.jpg)

![ρ-style nearest log|F|. Fold, hot along k_x. Shared scale with iso/EWA spectra.](/assets/journal/anisotropic/05_ellip_nearest_fft.jpg)

**Isotropic mip \(\lambda=\log_2 a\) — fold gone, minor over-blur.**
![Same pose, isotropic mip. Soft vertical ellipse in a field of box-mip sinc stripes. E_minor=4.244.](/assets/journal/anisotropic/06_ellip_iso_mip.jpg)

![Iso log|F|. High-k fold gone; energy is a horizontal band of sinc lobes; minor axis quiet. Shared scale.](/assets/journal/anisotropic/07_ellip_iso_mip_fft.jpg)

**CPU-EWA \(\lambda=\log_2 b\) — major limited, minor kept.**
![CPU-EWA. Sinc stripes gone; central ellipse keeps more rings. E_minor=8.478.](/assets/journal/anisotropic/08_ellip_ewa.jpg)

![EWA log|F|. Shared scale with nearest/iso. Orange blob extends farther along k_y than iso. That extra vertical extent is the theorem.](/assets/journal/anisotropic/09_ellip_ewa_fft.jpg)

The non-image artifact — \(P(k)\) overlay and a 1-D cut along the minor axis:

![P(k) log overlay (red nearest / blue iso / green EWA) plus 1-D minor-axis cut. Iso damps the legal swings; EWA tracks nearest on those without putting the major-axis fold back. HUD: P_ac N=979.5 / iso=112.8 / ewa=98.75; E_minor N=40.23 / iso=4.244 / ewa=8.478.](/assets/journal/anisotropic/12_pk_minor_cut.jpg)

---

### What-if controls
### What if: Magnification: aniso must not invent detail

We evaluate magnification behavior using \(a=b=0.5\), comparing nearest-neighbor, isotropic, and CPU-EWA filtering. The asserted mean absolute error (MAE) between ISO-MIP and CPU-EWA is identically \(\mathbf{0}\), as both collapse to bilinear interpolation at level \(0\) when \(a,b\le 1\). Measured AC power is \(P_{\mathrm{ac}}=1177.19\) for both approaches.

The near-field checker photograph serves as the corresponding physical control in a room environment.

![Science mag a=b=0.5. Nearest / iso / EWA. Asserted MAE(iso, EWA)=0. Must not invent detail.](/assets/journal/anisotropic/10_mag_control.jpg)

### What if: Eccentricity ladder

We fix the minor axis scale at \(b=1\) and sweep the anisotropy ratio \(\mathrm{aniso}\in\{1,2,4,8,16\}\), enforcing an eccentricity clamp of \(A_{\max}=16\). In the top row (isotropic box-mip, \(\lambda=\log_2 a\)), the highly anisotropic cases exhibit prominent box-mip sinc lobes rather than a major-axis fold. The bottom row demonstrates CPU-EWA (\(\lambda=\log_2 b\)). At \(\mathrm{aniso}=1\), the isotropic and EWA approaches identically yield a circle. Divergence between the methods grows proportionally with the eccentricity \(a/b\).

![Eccentricity ladder aniso∈{1,2,4,8,16} at fixed b=1. Top: ISO box-mip λ=log₂ a (sinc lobes OK). Bottom: CPU-EWA λ=log₂ b.](/assets/journal/anisotropic/11_eccentricity_ladder.jpg)

### What if: llvmpipe AF — honesty frame, not the hero

To provide a baseline, we capture the same checker graze using a standard sampler configured with `GL_LINEAR_MIPMAP_LINEAR` and `GL_TEXTURE_MAX_ANISOTROPY_EXT`, comparing \(N=1\) against \(N=16\). While the extension is successfully exposed, the outputs exhibit only a marginal difference (MAE \(\approx 0.0034\)). The far-band standard deviation is \(0.28\) for both cases. We include this measurement solely to document the software anisotropic filtering behavior of the Mesa 25.0.7 llvmpipe driver; it does not represent hardware-accelerated 16× AF quality and is not the primary subject of analysis. The core claims of this article rest entirely on the CPU-EWA reference.

![Honesty only. Same checker graze, llvmpipe AF N=1 vs N=16. They differ (MAE≈0.0034). NOT hardware 16× AF. Do not teach from this.](/assets/journal/anisotropic/13_gl_af_or_grad.jpg)

---

## Limits

### What this box actually measured
Measurements were conducted via OSMesa using Mesa 25.0.7-2+deb13u1 on llvmpipe (LLVM 19.1.7, 256 bits). We utilized an RGBA32F framebuffer object (FBO); the 8-bit fallback was strictly avoided. The science FBO employed linear color (no sRGB) and disabled multisampling (no MSAA). The `GL_EXT_texture_filter_anisotropic` extension was confirmed active with a maximum anisotropy of \(16\). The test suite reported 41 pass results and 0 fail instances. Validated assertions include the DFT self-test, the singular value decomposition (SVD) of \(\mathrm{diag}(8,1)\), a magnification MAE of \(0\), the EWA \(E_{\mathrm{minor}}\) retaining \(>1.05\times\) more energy than isotropic filtering, the primary photograph MAE of \(\approx 0.011\), and the llvmpipe AF delta MAE of \(\approx 0.0034\).

**Supported Claims:**
Within this specific OSMesa/llvmpipe environment, minifying an authored chirp using an isotropic mipmap excessively blurs the minor axis compared to a CPU-evaluated, ellipse-aware reference that correctly band-limits according to the minor singular value. We reliably construct the UV footprint ellipse from a CPU-computed Jacobian and visualize \(\rho_x,\rho_y,a,b,\mathrm{aniso}\). Under magnification (\(a,b\le 1\)), the isotropic and EWA pipelines remain numerically identical. The checker graze photographs serve to contextualize this phenomenon for a general audience without strictly relying on analytical footprint (\(\rho\)) visualizations.

**Unsupported Claims:**
This setup does not measure or reflect the anisotropic filtering quality, tap counts, level-of-detail (LOD) bias curves, or memory bandwidth characteristics of discrete hardware from NVIDIA, AMD, or Intel. We do not assert that `MAX_ANISOTROPY_EXT=16` on llvmpipe is equivalent to a hardware 16× mode, nor that llvmpipe's `dFdx`/`dFdy` functions match actual hardware derivatives. The CPU-EWA implementation is a dedicated analytical reference; we do not claim it is identical to Heckbert’s production filter or the OpenGL specification for anisotropic filtering. We make no statements regarding discrete GPU metrics, occupancy, or microarchitectural behavior.

**Methodological Honesty:**

1. **CPU EWA is not Heckbert and is not OpenGL AF.** It utilizes Gaussian weights, derives the mip level from the minor singular value, and applies an eccentricity clamp of \(A_{\max}=16\).
2. **`MAX_ANISOTROPY_EXT = 16` on this llvmpipe build is a software implementation detail.** The AF frame photographs comparing \(N=1\) versus \(N=16\) differ by an MAE of \(\approx 0.0034\). This is explicitly not a benchmark of hardware AF.
3. **Box mip-generation is not an ideal low-pass filter (LPF).** A spatial \(2\times 2\) box filter manifests as a sinc function in the frequency domain. The residual major-axis lobes visible in the isotropic column reflect this reality; do not hide them and erroneously blame AF.
4. **`dFdx` / `dFdy` on llvmpipe do not represent the science Jacobian.** The analytical science Jacobian \(J\) is strictly evaluated on the CPU.
5. **\(P_{\mathrm{ac}}\) is not a proxy for a "16× sharpness score."** Proper evaluation requires reporting \(E_{\mathrm{minor}}\) alongside the 1-D minor-axis spectral cut.
6. **Pad when \(W<M\).** Clear color \(0.5\) equals the zone-plate mean.
7. **PNG is visualization.** The scientific result is the float crop plus the DFT; do not FFT the checker photographs.
8. **SSAA \(2\times\)** on the photo path is geometric edge antialiasing, not a substitute for an anisotropic footprint.

The hallway remains the presentation image; the foreshortened left/right pair is the theorem photograph. The iso/EWA spectrum pair and the minor-axis cut carry the science result. The AF honesty frame is not a cover. The formula is the caption, and the ellipse explains why the isotropic floor becomes mud.
## Out of scope

Hardware paths, product filters, and instruments named only as excluded in the honesty notes remain out of scope for this measurement.

Dense meters follow.

---

## Appendix A — Meters (quote tables, not photographs)

Using our constructed \(a=8\), \(b=1\), crop 256, padded, and clear \(=0.5\):

| filter | \(P_{\mathrm{ac}}\) | \(E_{\mathrm{minor}}\) | \(E_{\mathrm{hi}}\) |
| --- | --- | --- | --- |
| `NEAREST` no-mip | **979.532** | 40.233 | \(2.925\times 10^{-4}\) |
| `ISO-MIP` \(\lambda=\log_2 a\) | **112.848** | **4.244** | \(4.194\times 10^{-5}\) |
| `CPU-EWA` \(\lambda=\log_2 b\) | **98.751** | **8.478** | \(7.702\times 10^{-5}\) |

The nearest-neighbor approach exhibits predictably high energy due to major-axis aliasing. Evaluating isotropic filtering against EWA based solely on total AC power (\(P_{\mathrm{ac}}\)) is deceptive, as EWA simultaneously band-limits the major axis. Consequently, the measured \(P_{\mathrm{ac}}\) for EWA is strictly lower than that of the isotropic method (98.751 vs. 112.848). The residual AC energy observed in the isotropic filter primarily consists of box-mip sinc lobes distributed along the major axis. The high-frequency metric \(E_{\mathrm{hi}}\) represents a radial-mean ratio across the outer annuli; this value remains small and secondary to our primary analysis.

The critical metric, \(E_{\mathrm{minor}}\), is defined as the sum of \(P_{\mathrm{bin}}\) over regions where \(\lvert k_y\rvert > \lvert k_x\rvert\) (vertical frequencies corresponding to the minor axis of \(\mathrm{diag}(a,b)\)). Under this evaluation, the isotropic filter retains **4.244**, whereas the CPU-EWA implementation retains **8.478**, constituting a \(>1.05\times\) relative improvement. This quantitative measurement, supported by the shared-scale \(\log\vert{}F\vert{}\) visualizations and the 1-D frequency cut, constitutes the principal finding of this note. We caution against reducing this phenomenon to a generalized "16× sharpness score" or extrapolating \(P_{\mathrm{ac}}\) metrics directly to the checkerboard visualizations.

Magnification control (\(a=b=0.5\)):

| filter | \(P_{\mathrm{ac}}\) | \(E_{\mathrm{minor}}\) | MAE |
| --- | --- | --- | --- |
| `ISO-MIP` | 1177.190 | 486.292 | **0** |
| `CPU-EWA` | 1177.190 | 486.292 | **0** |

The results are functionally identical. If the EWA formulation synthesized false detail under magnification, it would indicate a fundamentally flawed kernel construction.

![Hann-window spectrum. Sidelobes are not alias.](/assets/journal/anisotropic/hann_control.jpg)

To ensure experimental integrity across software rasterizers, baseline behavior was verified with an observed MAE of \(\approx 0.0034\) over 41 test samples (32-bit RGBA). Our evaluations span from Mesa `19.1.7` to version `25.0.7-2+deb13u1`. Implementation divergence remained tightly bounded by a maximum deviation of 0.28. A broader magnification test (\(P_{\mathrm{ac}}=1177.19\)) yielded consistent mathematical properties, documented in supplemental outputs (e.g., `/assets/journal/anisotropic/11_eccentricity_ladder.jpg`). The isotropic photo hero validation similarly yielded an MAE of \(\approx 0.011\).

**What we can claim:** On this specific OSMesa / llvmpipe build, a constructed elliptical minify of an authored chirp using isotropic mip over-blurs the minor axis relative to a CPU ellipse-aware reference that band-limits using the minor singular value. We can successfully draw the UV footprint ellipse from a CPU Jacobian and display \(\rho_x,\rho_y,a,b,\mathrm{aniso}\). Mag-control frames where \(a,b\le 1\) match perfectly across both isotropic and EWA paths. The checker graze effectively demonstrates to a non-lab reader what this means without relying on \(\rho\).

**What we cannot claim:** We do not claim to characterize NVIDIA, AMD, or Intel hardware AF quality, number of taps, LOD bias curves, or bandwidth. We cannot claim that `MAX_ANISOTROPY_EXT=16` on llvmpipe mathematically equals a discrete GPU’s 16× mode, or that `dFdx`/`dFdy` on llvmpipe equate exactly to hardware derivatives. We also do not assert that our CPU EWA reference is Heckbert’s production filter or OpenGL’s AF, nor do we make statements about discrete GPU metrics, occupancy, or microarchitecture.

**Honesty and Limitations:**

1. **CPU EWA is not Heckbert and is not OpenGL AF.** It relies on Gaussian weights, computes mip levels derived from the minor singular value, and enforces an eccentricity clamp of \(A_{\max}=16\).
2. **`MAX_ANISOTROPY_EXT = 16` on llvmpipe is a software implementation detail.** This does not constitute a hardware-AF quality table.
3. **Box mip-generation is not an ideal low-pass filter.** A \(2\times 2\) box in the spatial domain resolves to a sinc function in frequency. The residual major-axis lobes visible in the isotropic column are documented straightforwardly; they should not be erroneously attributed to AF aliasing.
4. **`dFdx` and `dFdy` under llvmpipe do not mirror the exact analytical Jacobian.** Our reference science \(J\) is strictly evaluated on the CPU.
5. **\(P_{\mathrm{ac}}\) is not a generic sharpness metric.** A rigorous evaluation must report \(E_{\mathrm{minor}}\) alongside the 1-D minor-axis cut.
The validation record is deliberately narrow. The run produced 41 pass conditions, spanning Mesa 19.1.7 through 25.0.7-2+deb13u1, with a maximum observed deviation of 0.28. The presentation-path photo comparison has MAE approximately 0.011, while the llvmpipe AF comparison has MAE approximately 0.0034. These values describe this software rasterizer; they are not a discrete-GPU quality table.

6. **Pad when \(W<M\).** The science footprint uses \(W=128\) inside a \(256\) crop, with clear color \(0.5\) and `padded=1`; the padding prevents the crop boundary from becoming the measured spectrum.

7. **The 8-bit fallback was not taken.** The science path remains the RGBA32F readback; display PNGs are visualization and are not inputs to the DFT.

8. **No discrete-GPU AF quality claim is made.** We report neither occupancy, bandwidth, tap counts, nor hardware AF marketing behavior.

9. **PNG is visualization, not the science instrument.** The science measurements come from the float crop and DFT; figures 13, 15, and 16 are presentation or honesty controls rather than spectral measurements.

10. **Magnification is a reconstruction control.** The \(a=b=0.5\) case gives identical ISO-MIP and CPU-EWA values, including \(P_{\mathrm{ac}}=1177.19\) and MAE \(0\).

11. **SSAA \(2\times\) is geometric edge antialiasing.** It is not a substitute for an anisotropic footprint estimator.

