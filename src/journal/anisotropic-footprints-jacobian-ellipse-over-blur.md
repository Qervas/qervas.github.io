---
title: "Anisotropic Footprints: Jacobian, Ellipse, Over-Blur"
description: "Mip LOD is not the footprint. Checker graze, then Jacobian ellipse — isotropic over-blur vs CPU-EWA. E_minor 4.244→8.478."
date: 2026-09-13
tags:
  - graphics
  - engine
  - sampling
math: true
cover: /assets/journal/anisotropic/15_hallway.jpg
---

Mip LOD is not the footprint, a reality most evident when observing a grazing checkerboard.

Our previous note on mipmaps photographed the leftover softness: the isotropic $\rho=\max(\rho_x,\rho_y)$ band-limits to the major axis and heavily over-blurs the minor axis. That note introduced the problem in a single sentence, but this piece owns the Jacobian, the ellipse axes, and a lab-honest anisotropic sample—specifically, a CPU elliptical weighted average (EWA) that we can actually run and measure on OSMesa and llvmpipe.

For our primary test footprint ($a=8$, $b=1$, $\mathrm{aniso}=8$), the AC power $P_{\mathrm{ac}}$ measures **979.532** under nearest sampling (no mip), **112.848** under isotropic mip, and **98.751** under CPU-EWA. Do **not** mistakenly sell this metric as "EWA is sharper overall". The leftover AC energy in the isotropic filter consists of box-mip sinc lobes strictly along the **major** axis. The actual theorem lies in the minor-axis energy ($E_{\mathrm{minor}}$): isotropic retains **4.244** while EWA retains **8.478**. EWA preserves more valid detail on the short axis, which is the entire point of the technique.

Assertions on this run: **41 pass / 0 fail**. The science mag MAE $=0$ and the presentation mag MAE $=0$. The photo hero MAE(iso, EWA) on the hallway is $\approx\mathbf{0.011}$. By comparison, llvmpipe GL AF $N=1$ vs $N=16$ yields an MAE $\approx\mathbf{0.0034}$—a small delta explicitly labeled **NOT hardware 16× AF**, serving as a reality check rather than the core lesson.

---

## How it presents

We observe the same floor through three different filters. The stimulus is a CPU-authored black and white checkerboard, $1024^2$, with 64 cells spanning the floor, while the walls and ceiling remain a flat gray. There is no $\rho$ debug visualization on the HUD.

![Checker hallway graze, 3-up. Left: nearest no-mip — vanishing checks crawl. Middle: isotropic mip — fold gone, floor is mud. Right: CPU-EWA — major limited, checks survive. Photograph only. a=n/a. NOT hardware 16× AF.](/assets/journal/anisotropic/15_hallway.jpg)

Walking through the three panels:

* **NO-MIP:** Major-axis frequencies fold. The checkers crawl, sparkle, and moiré toward the vanishing point. This is the same visual as the mipmaps Cornell floor, but now analyzed with a known elliptical footprint in the lab.

* **ISO-MIP:** The aliasing fold is mostly gone, but the floor becomes a gray field of over-blur. The isotropic LOD $\lambda=\log_2 a$ band-limits the *short* axis as if it were the long one. This demonstrates the exact leftover softness identified but left unresolved in our mipmaps note.

* **CPU-EWA:** The major axis remains properly limited, preventing crawl, while the minor axis retains the checker detail. The softness shrinks without reintroducing the fold.

The MAE(iso, EWA) on this specific frame is $\approx 0.011$. You might wonder why we don't simply use Mesa AF for the hero column. On this specific rasterizer, `GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT=16` is a software detail; performing the same graze with GL $N=1$ vs $N=16$ yields an MAE of only $\approx 0.0034$. That delta is not large enough for an unmistakable isotropic vs. anisotropic lesson, which is why the 3-up uses our CPU-EWA reference.

First, we must verify the near field—magnification behavior must still match exactly.

![Near checker floor, true magnification. Center (a,b)=(0.138, 0.097), a_max=0.468. Iso vs AF MAE=0. Photograph only.](/assets/journal/anisotropic/16_nearfield_mag.jpg)

If the "AF" filter looked artificially sharper here, the entire article would be broken. Every probed pixel on this floor section has $a,b\le 1$.

Next, we look at a photograph of the theorem itself, using the same unproject floor, checker texture, and a known CPU Jacobian:

![Foreshortened checker floor. Left: isotropic mip, check edges smear. Right: CPU-EWA, minor kept. Far pixel (a,b,aniso)=(15.89, 2.916, 5.45). CPU J from unproject.](/assets/journal/anisotropic/14_foreshorten_lr.jpg)

There are two distinct regimes here that must never be mixed, whether in a 3D room or on a 2D zone-plate:

1. **Magnification** (ellipse semi-axes $a\le 1$ and $b\le 1$): This is pure reconstruction. Isotropic and anisotropic filtering **must match**. In our science path ($a=b=0.5$), MAE(ISO-MIP, CPU-EWA) $=\mathbf{0}$ and $P_{\mathrm{ac}}$ is identically **1177.19**. In presentation, the near-field frame above also perfectly matches with MAE $=\mathbf{0}$.

2. **Anisotropic minify** (one axis $\gg 1$, the other closer to 1): The footprint is an ellipse, not a scalar $\rho$. This regime is the focus of the article.

Software rasterization does not have to flicker. Blurry softness at a locked pose is the result of using the wrong footprint, not a deliberate art direction choice.

---

## Why: Jacobian, ellipse, over-blur

### UV Jacobian (texel units)

With $(u,v)$ in texels and $(x,y)$ in pixels:

$$ J = \begin{pmatrix} \partial u/\partial x & \partial u/\partial y \\ \partial v/\partial x & \partial v/\partial y \end{pmatrix} = \begin{pmatrix} \mathbf{d}_x & \mathbf{d}_y \end{pmatrix}, \qquad \mathbf{d}_x=\bigl(\partial u/\partial x,\,\partial v/\partial x\bigr), \quad \mathbf{d}_y=\bigl(\partial u/\partial y,\,\partial v/\partial y\bigr). $$

In our science path, this Jacobian is either known exactly from the affine UV construction or computed on the CPU from the projected quad of a locked perspective floor. **Do not trust llvmpipe `dFdx`/`dFdy` as the science source**. While the photograph path may use the hardware sampler, those frames print `a=n/a` to distinguish them.

![One pixel of the Jacobian sentence. Left: screen pixel with d_x, d_y. Right: same vectors in UV plus the SVD ellipse. Constructed affine, a=8, b=1, aniso=8. CPU J, NOT DFDX.](/assets/journal/anisotropic/01_jacobian_legend.jpg)

### Isotropic GL-style scalars (continuity with mipmaps)

$$\rho_x=\lVert\mathbf{d}_x\rVert,\qquad \rho_y=\lVert\mathbf{d}_y\rVert,\qquad \rho=\max(\rho_x,\rho_y),\qquad \lambda=\log_2\rho+\mathrm{lodBias}.$$

Isotropic LOD band-limits **both** axes to $\rho$. When $\rho_x\gg\rho_y$, the minor axis suffers from significant over-blur. This mathematical reality is the cause of the leftover softness on the mipmaps hallway and the middle panel of our checker graze.

An isotropic $\rho=\sqrt{\rho_x^2+\rho_y^2}$ alternative still yields the wrong ellipse. We state this in one sentence and omit an extra frame.

### Footprint ellipse

A pixel’s preimage in UV space is the image of the unit pixel under the Jacobian $J$. The semi-axes are derived from the Singular Value Decomposition (SVD) of $J$ (the eigendecomposition of $JJ^\top$):

$$J = U\,\Sigma\,V^\top, \qquad \Sigma=\mathrm{diag}(\sigma_{\mathrm{maj}},\,\sigma_{\mathrm{min}}), \qquad \sigma_{\mathrm{maj}}\ge\sigma_{\mathrm{min}}>0.$$

$$a=\sigma_{\mathrm{maj}},\qquad b=\sigma_{\mathrm{min}},\qquad \mathrm{aniso}=\frac{a}{b}\quad(b>0).$$

The ellipse's orientation matches the major singular vector in UV space. When you draw this ellipse on the texture, it reveals the unique, non-generic artifact we are analyzing.

Our hero construction uses $J=\mathrm{diag}(8,1)$. The SVD yields $a=8$, $b=1$, $\lambda_{\mathrm{iso}}=3$, and $\lambda_{\mathrm{aniso}}=0$. A sheared copy at $\theta=35^\circ$ sits beside it to prove that AF is a truly oriented footprint, not just a naive "blur less in $v$" hack.

![Unique artifact. Same zone-plate UV crop, two Jacobians, both aniso=8. Left: axis-aligned a=8, b=1. Right: sheared θ=35°. AF is an oriented footprint.](/assets/journal/anisotropic/02_footprint_ellipse.jpg)

We also visualize the Jacobian *field* on the unproject floor as $\log_2(a/b)$—meaningfully colored, rather than a rainbow gradient for its own sake. This uses the same camera family as our theorem photograph.

![CPU Jacobian field log₂(a/b) on the unproject floor. Marked far pixel a=15.66, b=2.872, aniso=5.451.](/assets/journal/anisotropic/03_aniso_falsecolor.jpg)

### Isotropic vs anisotropic LOD

$$\lambda_{\mathrm{iso}}=\log_2\max(a,b)=\log_2 a, \qquad \lambda_{\mathrm{aniso}}=\log_2 b.$$

The gap between them:

$$\lambda_{\mathrm{iso}}-\lambda_{\mathrm{aniso}}=\log_2(a/b)$$

This difference is exactly the over-blur—measured in mip levels—along the minor axis. At the constructed hero footprint, $\log_2 8=3$: three extra mip levels of softness are unnecessarily applied to the short axis for no valid sampling reason. The eccentricity clamp $A_{\max}=16$ only grows the minor axis (adding more blur and fewer taps) when $a/b>16$. It does not affect our hero case of $a=8,b=1$.

### Lab-honest anisotropic sample (CPU EWA-ish)

For each pixel, we take the UV ellipse $(a,b,\theta)$ from the known Jacobian, clamp the eccentricity to $A_{\max}=16$, choose a mip level driven by the **minor** axis ($\lambda=\log_2 b$), and accumulate a Gaussian weight over the ellipse across that level and the next. Under magnification ($a\le 1$ and $b\le 1$), it gracefully falls back to bilinear L0, identically to the isotropic path. This is **our** strict reference—it is not Heckbert’s production filter, it is not OpenGL AF, and it makes no claims about Mesa’s sampler. Do not compare it against NVIDIA, AMD, or Intel texel-fetch counts or LOD curves.

### Zone-plate (reuse, do not re-litigate)

We reuse a texture with $N=1024$ POT, a disk-masked Fresnel chirp, from the same authorship as our mipmaps note:

$$I=\tfrac12+\tfrac12\cos(\pi r^2/N) \qquad(I=\tfrac12\text{ for }r>N/2), \qquad f_{\mathrm{inst}}(r)=r/N\implies f_{\mathrm{inst}}(N/2)=\tfrac12.$$

Because instantaneous frequency rises with radius, an elliptical minify presents a known major-axis fold alongside a known minor-axis remainder.

![CPU zone-plate L0, disk-masked, clamp. Continuity with mipmaps.](/assets/journal/anisotropic/00_zoneplate_l0.jpg)

---

## Unique artifact: the ellipse, then the spectrum

Constructed minify, \(a=8\), \(b=1\), \(W=128\), three filters, three spectra, **shared** \(\log|F|\) scale. Science is `glReadPixels(..., GL_FLOAT)` from an RGBA32F FBO, interior \(256^2\) crop, mean-subtract, separable Hann, unnormalized radix-2 DFT. Power \(P_{\mathrm{bin}}=|F|^2/M^2\). Do not FFT the checker photographs.

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

## Quote \(E_{\mathrm{minor}}\). Do not quote \(P_{\mathrm{ac}}\) as sharpness.

Using our constructed $a=8$, $b=1$, crop 256, `padded=1`, and clear $=0.5$:

| filter | $P_{\mathrm{ac}}$ | $E_{\mathrm{minor}}$ | $E_{\mathrm{hi}}$ |
| --- | --- | --- | --- |
| `NEAREST` no-mip | **979.532** | 40.233 | $2.925\times 10^{-4}$ |
| `ISO-MIP` $\lambda=\log_2 a$ | **112.848** | **4.244** | $4.194\times 10^{-5}$ |
| `CPU-EWA` $\lambda=\log_2 b$ | **98.751** | **8.478** | $7.702\times 10^{-5}$ |

Nearest is predictably hot due to the major-axis fold. Comparing Isotropic vs. EWA on **total** AC power can be misleading, because EWA also band-limits the major axis. Here, EWA’s $P_{\mathrm{ac}}$ is actually *lower* than isotropic’s (98.751 vs 112.848). The isotropic filter's leftover AC energy is just the box-mip sinc along the major axis. $E_{\mathrm{hi}}$ is a radial-mean ratio of the outer annuli—it is even smaller and not the focus of our claim.

$E_{\mathrm{minor}}$ is the sum of $P_{\mathrm{bin}}$ on bins where $\lvert k_y\rvert>\lvert k_x\rvert$ (the vertical frequencies, mapping to the minor axis of $\mathrm{diag}(a,b)$). Isotropic retains **4.244** while EWA retains **8.478**, which is a $>1.05\times$ improvement. That specific metric, the shared-scale $\log\vert{}F\vert{}$ pair, and the 1-D cut form our core claim. Do not invent a "16× sharpness score" or hang $P_{\mathrm{ac}}$ metrics on the checker hallway.

Mag control ($a=b=0.5$):

| filter | $P_{\mathrm{ac}}$ | $E_{\mathrm{minor}}$ | MAE |
| --- | --- | --- | --- |
| `ISO-MIP` | 1177.190 | 486.292 | **0** |
| `CPU-EWA` | 1177.190 | 486.292 | **0** |

They are identical. If EWA magically invented detail under magnification, the kernel would be fundamentally flawed.

When $W<M$ ![Eccentricity ![Hann-window ![Honesty ![Science "16× ## ### (**yes**), (LLVM (MAE (MAE≈0.0034). ($\lambda="\log_2" (both (sinc (such 41 RGBA32F, differ not sinc --- / 0 0.0034$)[cite: 16[cite: 16× 19.1.7, 1)). 1]: 2-D 25.0.7 25.0.7-2+deb13u1, 256 8-bit A AF AF," AF. AF[cite: Asserted Assertions: At Bottom: CPU-EWA CPU-EWA[cite: Controls DFT Divergence Do EWA EWA)="0." EWA. EWA[cite: Eccentricity FBO FBO[cite: For Hann Host: However, ISO ISO-MIP It L0 MAE MAE(iso, MSAA Magnification: Mesa Must N="16." NOT Nearest OK). OSMesa, SVD Same Sidelobes The They This Top: We What $ \(0.28$ $0.28$[cite: $0.5$, $A_{\max}="16$[cite:" $E_{\mathrm{minor}}$ $N="16$[cite:" (P_{\mathrm{ac}}="1177.19)" (W="128)" (\approx \(\mathrm{aniso}="1)," (\mathrm{aniso}\in\{1,2,4,8,16\}) (\mathrm{diag}(8,1)), (a="b=0.5)," (a,b\le \(a/b) (b="1)," `GL_EXT_texture_filter_anisotropic` `GL_LINEAR_MIPMAP_LINEAR` `GL_TEXTURE_MAX_ANISOTROPY_EXT` a a)); actually after alias.](/assets/journal/anisotropic/hann_control.jpg) aliasing aliasing[cite: alongside an and aniso aniso∈{1,2,4,8,16} apply are article as asserted at b="1." b.](/assets/journal/anisotropic/11_eccentricity_ladder.jpg) b))[cite: becomes bilinear bits)[cite: both bottom box box-mip busy, checker circles[cite: cleared clearly compares control, crop crop), cross cut delta detail detail.](/assets/journal/anisotropic/10_mag_control.jpg) deviation differ documented dominates due ensures environment[cite: essentially every extension extremely fail, fallback far-band filter[cite: fixed fold[cite: for frame, framebuffer from graze graze, grows hallway, hard hardware has have here hero high-aniso hit, honesty in includes inside integrity introduced invent is iso iso, isotropic it its ladder lesson[cite: llvmpipe llvmpipe’s lobes lobes, logically look mag mag, main match max mean-subtraction[cite: mean[cite: measured minor mistaken must near-field nearest, no not of on only. operate or own padding pass perfectly photograph present, quality ratio[cite: real rectangular room row rows sRGB same sampler science self-test, shows sides[cite: sinc sitting small, so software spectrum, spectrum. standard stands supported table, teach test tested that the there they this this.](/assets/journal/anisotropic/13_gl_af_or_grad.jpg) three-up to top two used using vs we when which window with would zeros zone-plate λ="log₂" —>1.05\times) iso, the photo hero MAE $\approx 0.011$, and the llvmpipe AF delta $\approx 0.0034$.

![Hann-window spectrum. Sidelobes are not alias.](/assets/journal/anisotropic/hann_control.jpg)

What we can claim: On this specific OSMesa / llvmpipe build, a constructed elliptical minify of an authored chirp using **isotropic** mip over-blurs the minor axis relative to a CPU ellipse-aware reference that band-limits using the minor singular value. We can successfully draw the UV footprint ellipse from a **CPU** Jacobian and display $\rho_x,\rho_y,a,b,\mathrm{aniso}$. Mag-control frames where $a,b\le 1$ match perfectly across both isotropic and EWA paths. The checker graze effectively demonstrates to a non-lab reader what this means without relying on $\rho$.

What we cannot claim: NVIDIA, AMD, or Intel hardware AF quality, number of taps, LOD bias curves, or bandwidth. We cannot claim that `MAX_ANISOTROPY_EXT=16` on llvmpipe equals a discrete GPU’s 16× mode, or that `dFdx`/`dFdy` on llvmpipe equal hardware derivatives. We also do not claim that our CPU EWA reference is Heckbert’s production filter or OpenGL’s AF, nor do we make statements about discrete GPU metrics, occupancy, or "how the hardware works".

Honesty, in short:

1. **CPU EWA is not Heckbert and is not OpenGL AF.** It uses Gaussian weights, mip levels derived from the minor singular value, and an eccentricity clamp of $A_{\max}=16$.

2. **`MAX_ANISOTROPY_EXT = 16` on this llvmpipe is a software detail.** The AF frame photographs $N=1$ vs $N=16$; they differ by an MAE of $\approx 0.0034$. This is not a hardware-AF quality table.

3. **Box mip-gen is not an ideal LPF.** A $2\times 2$ box in space becomes a sinc in frequency. The residual major-axis lobes in the isotropic column are reported with the same honesty as in our mipmaps note—do not hide them and erroneously blame AF.

4. **`dFdx` / `dFdy` on llvmpipe are not the science Jacobian.** Our science $J$ is strictly computed on the CPU.

5. **$P_{\mathrm{ac}}$ is not a "16× sharpness score."** You must report $E_{\mathrm{minor}}$ and the 1-D minor-axis cut.

6. **Pad when $W<M$.** **PNG **SSAA 1]. 7. 8. AA[cite: AF DFT[cite: Do FFT It L/R Pin The True $0.5$ $2\times$** a acts an and anisotropic as caption, checker clear color combined cover[cite: crop cut edge ellipse equals exact float floor footprint[cite: for foreshorten formula frame geometric hallway honesty is iso/EWA isotropic mean[cite: minor-axis mud[cite: never not of on pair path photo photo[cite: photographs[cite: plus presentation[cite: reason science spectrum substitute the theorem theorem[cite: to turned visualization.** with zone-plate>

## Controls

### Magnification: aniso must not invent detail

Science mag, \(a=b=0.5\), three-up nearest / iso / EWA. The asserted MAE is ISO-MIP vs CPU-EWA (both bilinear L0 when \(a,b\le 1\)). MAE \(=\mathbf{0}\), \(P_{\mathrm{ac}}=1177.19\) both sides.

![Science mag a=b=0.5. Nearest / iso / EWA. Asserted MAE(iso, EWA)=0. Must not invent detail.](/assets/journal/anisotropic/10_mag_control.jpg)

The near-field checker photograph is that control in a room.

### Eccentricity ladder

Fixed minor \(b=1\), \(\mathrm{aniso}\in\{1,2,4,8,16\}\), \(A_{\max}=16\). Top row: isotropic box-mip, \(\lambda=\log_2 a\) — the busy high-aniso look is box-mip **sinc lobes**, not fold. Bottom row: CPU-EWA, \(\lambda=\log_2 b\). At \(\mathrm{aniso}=1\) the two rows match (circle, no ellipse). Divergence grows with \(a/b\).

![Eccentricity ladder aniso∈{1,2,4,8,16} at fixed b=1. Top: ISO box-mip λ=log₂ a (sinc lobes OK). Bottom: CPU-EWA λ=log₂ b.](/assets/journal/anisotropic/11_eccentricity_ladder.jpg)

### llvmpipe AF — honesty frame, not the hero

Same checker graze as the hallway, real sampler, `GL_LINEAR_MIPMAP_LINEAR` plus `GL_TEXTURE_MAX_ANISOTROPY_EXT` \(N=1\) vs \(N=16\). Extension is present. They **differ** (MAE \(\approx 0.0034\)). The delta is small. Far-band std is \(0.28\) vs \(0.28\). This is a photograph of Mesa 25.0.7 llvmpipe’s software AF — not a hardware quality table, not “16× hardware AF,” and not the lesson. The article stands on CPU-EWA.

![Honesty only. Same checker graze, llvmpipe AF N=1 vs N=16. They differ (MAE≈0.0034). NOT hardware 16× AF. Do not teach from this.](/assets/journal/anisotropic/13_gl_af_or_grad.jpg)

---

## What this box actually measured

Host: OSMesa, Mesa 25.0.7-2+deb13u1, llvmpipe (LLVM 19.1.7, 256 bits). FBO **RGBA32F**, 8-bit fallback **not hit**, no sRGB, no MSAA on the science FBO. `GL_EXT_texture_filter_anisotropic` **yes**, max \(=16\). Assertions: **41 pass / 0 fail**, including DFT self-test, SVD of \(\mathrm{diag}(8,1)\), mag MAE \(=0\), \(E_{\mathrm{minor}}\) EWA \(>1.05\times\) iso, photo hero MAE \(\approx 0.011\), and the llvmpipe AF delta \(\approx 0.0034\).

Can claim: on this OSMesa / llvmpipe build, a constructed elliptical minify of an authored chirp with **isotropic** mip over-blurs the minor axis relative to a CPU ellipse-aware reference that band-limits using the minor singular value. We can draw the UV footprint ellipse from a **CPU** Jacobian and show \(\rho_x,\rho_y,a,b,\mathrm{aniso}\). Mag-control frames where \(a,b\le 1\) match across iso / EWA. The checker graze is how a non-lab reader sees the sentence without \(\rho\).

Cannot claim: NVIDIA / AMD / Intel hardware AF quality, number of taps, LOD bias curves, or bandwidth. That `MAX_ANISOTROPY_EXT=16` on llvmpipe equals a discrete GPU’s 16× mode. That `dFdx`/`dFdy` on llvmpipe equal hardware derivatives. That the CPU EWA reference is Heckbert’s production filter or OpenGL’s AF. Discrete GPU metrics, occupancy, or “this is how the hardware works.”

Honesty, short:

1. **CPU EWA is not Heckbert and is not OpenGL AF.** Gaussian weights, mip from the minor singular value, eccentricity clamp \(A_{\max}=16\).
2. **`MAX_ANISOTROPY_EXT = 16` on this llvmpipe is a software detail.** The AF frame photographs \(N=1\) vs \(N=16\); they differ by MAE \(\approx 0.0034\). Not a hardware-AF quality table.
3. **Box mip-gen is not an ideal LPF.** A \(2\times 2\) box in space is a sinc in frequency. Residual major-axis lobes in the iso column are the same honesty as mipmaps — do not hide them and blame AF.
4. **`dFdx` / `dFdy` on llvmpipe are not the science Jacobian.** Science \(J\) is CPU.
5. **\(P_{\mathrm{ac}}\) is not a “16× sharpness score.”** Report \(E_{\mathrm{minor}}\) and the 1-D minor-axis cut.
6. **Pad when \(W<M\).** Clear color \(0.5\) = zone-plate mean.
7. **PNG is visualization.** Science is the float crop + DFT. Do not FFT the checker photographs.
8. **SSAA \(2\times\)** on the photo path is geometric edge AA. It is not a substitute for an anisotropic footprint.

Pin the hallway as the presentation. Pin the foreshorten L/R as the theorem photo. Pin the iso/EWA spectrum pair plus the minor-axis cut as the science theorem. The AF honesty frame is not a cover. The formula is the caption. The ellipse is why the isotropic floor went to mud.
