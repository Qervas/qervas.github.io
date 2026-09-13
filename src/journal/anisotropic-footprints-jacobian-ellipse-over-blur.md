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

Mip LOD is not the footprint. Look at a grazing checker.

The mipmaps note already photographed the leftover softness: isotropic \(\rho=\max(\rho_x,\rho_y)\) band-limits to the major axis and over-blurs the minor. That note stopped at one sentence. This one owns the Jacobian, the ellipse axes, and a lab-honest anisotropic sample — CPU elliptical weighted average — that we can actually run on OSMesa / llvmpipe.

Hero, on a constructed science footprint \(a=8\), \(b=1\), \(\mathrm{aniso}=8\): AC power \(P_{\mathrm{ac}}\) is **979.532** under nearest (no mip), **112.848** under isotropic mip, **98.751** under CPU-EWA. Do **not** sell that as “EWA is sharper overall.” Iso’s leftover AC is box-mip sinc lobes along the **major** axis. The theorem is minor-axis energy \(E_{\mathrm{minor}}\): iso **4.244** → EWA **8.478**. EWA keeps more legal detail on the short axis. That is the point.

Assertions on this run: **41 pass / 0 fail**. Science mag MAE \(=0\). Presentation mag MAE \(=0\). Photo hero MAE(iso, EWA) on the hallway \(\approx\mathbf{0.011}\). llvmpipe GL AF \(N=1\) vs \(N=16\) MAE \(\approx\mathbf{0.0034}\) — a small delta, labeled **NOT hardware 16× AF**, not the lesson hero.

---

## How it presents

Same floor, three filters. Stimulus is a CPU-authored black/white checker, \(1024^2\), 64 cells across the floor. Walls and ceiling are flat gray. No \(\rho\) on the HUD.

![Checker hallway graze, 3-up. Left: nearest no-mip — vanishing checks crawl. Middle: isotropic mip — fold gone, floor is mud. Right: CPU-EWA — major limited, checks survive. Photograph only. a=n/a. NOT hardware 16× AF.](/assets/journal/anisotropic/15_hallway.jpg)

Walk the three panels:

- **NO-MIP.** Major-axis frequencies fold. Checks crawl, sparkle, moiré toward the vanishing point. Same sentence as the mipmaps Cornell floor, now with a known elliptical footprint waiting in the lab.
- **ISO-MIP.** Fold mostly gone. The floor is a gray field of over-blur. \(\lambda=\log_2 a\) band-limited the *short* axis as if it were the long one. That is the leftover softness the mipmaps note named and did not close.
- **CPU-EWA.** Major axis still limited (no crawl). Minor axis keeps the checks. Softness shrinks without reintroducing the fold.

MAE(iso, EWA) on this frame is \(\approx 0.011\). Why not Mesa AF in the hero column: on this rasterizer `GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT=16` is a software detail; the same graze with GL \(N=1\) vs \(N=16\) is only MAE \(\approx 0.0034\). That is not an unmistakable iso-vs-aniso lesson. The 3-up therefore uses CPU-EWA.

Near field first — magnification must still match.

![Near checker floor, true magnification. Center (a,b)=(0.138, 0.097), a_max=0.468. Iso vs AF MAE=0. Photograph only.](/assets/journal/anisotropic/16_nearfield_mag.jpg)

If “AF” looked sharper here, the article would be broken. Every probed floor pixel has \(a,b\le 1\).

Then the photograph of the theorem — same unproject floor, checker texture, known CPU Jacobian:

![Foreshortened checker floor. Left: isotropic mip, check edges smear. Right: CPU-EWA, minor kept. Far pixel (a,b,aniso)=(15.89, 2.916, 5.45). CPU J from unproject.](/assets/journal/anisotropic/14_foreshorten_lr.jpg)

Two regimes, never mixed — in a room or on a zone-plate:

1. **Magnification** (ellipse semi-axes \(a\le 1\) and \(b\le 1\)): reconstruction. Isotropic and anisotropic **must match**. Science path: \(a=b=0.5\), MAE(ISO-MIP, CPU-EWA) \(=\mathbf{0}\), \(P_{\mathrm{ac}}\) identical (**1177.19**). Presentation: the near-field frame above, MAE \(=\mathbf{0}\).
2. **Anisotropic minify** (one axis \(\gg 1\), the other closer to 1): ellipse, not a scalar \(\rho\). This is the article.

Software raster does not have to flicker. Softness at a locked pose is the wrong footprint, not art direction.

---

## Why: Jacobian, ellipse, over-blur

### UV Jacobian (texel units)

\((u,v)\) in texels, \((x,y)\) in pixels:

\[
J
=
\begin{pmatrix}
\partial u/\partial x & \partial u/\partial y \\
\partial v/\partial x & \partial v/\partial y
\end{pmatrix}
=
\begin{pmatrix}
\mathbf{d}_x & \mathbf{d}_y
\end{pmatrix},
\qquad
\mathbf{d}_x=\bigl(\partial u/\partial x,\,\partial v/\partial x\bigr),
\quad
\mathbf{d}_y=\bigl(\partial u/\partial y,\,\partial v/\partial y\bigr).
\]

Science path: known from the affine UV construction, or from a locked perspective floor whose Jacobian is computed on the CPU from the projected quad. **Do not trust llvmpipe `dFdx`/`dFdy` as the science source.** Photograph path may use the sampler; those frames print `a=n/a`.

![One pixel of the Jacobian sentence. Left: screen pixel with d_x, d_y. Right: same vectors in UV plus the SVD ellipse. Constructed affine, a=8, b=1, aniso=8. CPU J, NOT DFDX.](/assets/journal/anisotropic/01_jacobian_legend.jpg)

### Isotropic GL-style scalars (continuity with mipmaps)

\[
\rho_x=\lVert\mathbf{d}_x\rVert,\qquad
\rho_y=\lVert\mathbf{d}_y\rVert,\qquad
\rho=\max(\rho_x,\rho_y),\qquad
\lambda=\log_2\rho+\mathrm{lodBias}.
\]

Isotropic LOD band-limits **both** axes to \(\rho\). When \(\rho_x\gg\rho_y\), the minor axis is over-blurred. That is the leftover softness on the mipmaps hallway, and the middle panel of the checker graze.

An isotropic \(\rho=\sqrt{\rho_x^2+\rho_y^2}\) alternate is still the wrong ellipse. One sentence, no extra frame.

### Footprint ellipse

The pixel’s preimage in UV is the image of the unit pixel under \(J\). Semi-axes from the SVD of \(J\) (eigendecomposition of \(JJ^\top\)):

\[
J = U\,\Sigma\,V^\top,
\qquad
\Sigma=\mathrm{diag}(\sigma_{\mathrm{maj}},\,\sigma_{\mathrm{min}}),
\qquad
\sigma_{\mathrm{maj}}\ge\sigma_{\mathrm{min}}>0.
\]

\[
a=\sigma_{\mathrm{maj}},\qquad
b=\sigma_{\mathrm{min}},\qquad
\mathrm{aniso}=\frac{a}{b}\quad(b>0).
\]

Ellipse orientation = major singular vector in UV. Draw this ellipse on the texture. This is the unique non-generic artifact.

Hero construction: \(J=\mathrm{diag}(8,1)\). SVD: \(a=8\), \(b=1\), \(\lambda_{\mathrm{iso}}=3\), \(\lambda_{\mathrm{aniso}}=0\). A sheared copy at \(\theta=35^\circ\) sits beside it so AF is not mistaken for “blur less in \(v\).”

![Unique artifact. Same zone-plate UV crop, two Jacobians, both aniso=8. Left: axis-aligned a=8, b=1. Right: sheared θ=35°. AF is an oriented footprint.](/assets/journal/anisotropic/02_footprint_ellipse.jpg)

The Jacobian *field* on the unproject floor — \(\log_2(a/b)\), not a rainbow for its own sake. Same camera family as the theorem photograph.

![CPU Jacobian field log₂(a/b) on the unproject floor. Marked far pixel a=15.66, b=2.872, aniso=5.451.](/assets/journal/anisotropic/03_aniso_falsecolor.jpg)

### Isotropic vs anisotropic LOD

\[
\lambda_{\mathrm{iso}}=\log_2\max(a,b)=\log_2 a,
\qquad
\lambda_{\mathrm{aniso}}=\log_2 b.
\]

The gap

\[
\lambda_{\mathrm{iso}}-\lambda_{\mathrm{aniso}}=\log_2(a/b)
\]

is exactly the over-blur in mip levels along the minor axis. At the constructed hero, \(\log_2 8=3\): three extra mip levels of softness on the short axis, for no sampling reason. Eccentricity clamp \(A_{\max}=16\) grows the minor axis (more blur, fewer taps) when \(a/b>16\). It does not change the hero \(a=8,b=1\).

### Lab-honest anisotropic sample (CPU EWA-ish)

For each pixel: take the UV ellipse \((a,b,\theta)\) from the known Jacobian, clamp eccentricity to \(A_{\max}=16\), choose a mip level from the **minor** axis (\(\lambda=\log_2 b\)), and accumulate a Gaussian weight over the ellipse in that level and the next. Under mag (\(a\le 1\) and \(b\le 1\)) it falls back to bilinear L0, same as iso. This is **our** reference — not Heckbert’s production filter, not OpenGL AF, not a claim about Mesa’s sampler. Do not match it against NVIDIA/AMD/Intel texel-fetch counts or LOD curves.

### Zone-plate (reuse, do not re-litigate)

Texture \(N=1024\) POT, disk-masked Fresnel chirp, same authorship as mipmaps:

\[
I=\tfrac12+\tfrac12\cos(\pi r^2/N)
\qquad(I=\tfrac12\text{ for }r>N/2),
\qquad
f_{\mathrm{inst}}(r)=r/N\implies f_{\mathrm{inst}}(N/2)=\tfrac12.
\]

Instantaneous frequency rises with radius, so an elliptical minify has a known major-axis fold and a known minor-axis remainder.

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

Constructed \(a=8\), \(b=1\), crop 256, `padded=1`, clear \(=0.5\):

| filter | \(P_{\mathrm{ac}}\) | \(E_{\mathrm{minor}}\) | \(E_{\mathrm{hi}}\) |
|---|---|---|---|
| `NEAREST` no-mip | **979.532** | 40.233 | \(2.925\times 10^{-4}\) |
| `ISO-MIP` \(\lambda=\log_2 a\) | **112.848** | **4.244** | \(4.194\times 10^{-5}\) |
| `CPU-EWA` \(\lambda=\log_2 b\) | **98.751** | **8.478** | \(7.702\times 10^{-5}\) |

Nearest is hot from fold. Iso vs EWA on **total** AC can go either way, because EWA also band-limits the major axis: here EWA’s \(P_{\mathrm{ac}}\) is *lower* than iso’s (98.751 vs 112.848). Iso’s leftover AC is the box-mip sinc along the major axis. \(E_{\mathrm{hi}}\) is a radial-mean ratio of outer annuli — even smaller, and not the claim.

\(E_{\mathrm{minor}}\) is the sum of \(P_{\mathrm{bin}}\) on bins with \(\lvert k_y\rvert>\lvert k_x\rvert\) (vertical frequencies = minor axis of \(\mathrm{diag}(a,b)\)). Iso **4.244** → EWA **8.478** is \(>1.05\times\). That, the shared-scale \(\log|F|\) pair, and the 1-D cut, are the claim. Do not invent a “16× sharpness score.” Do not hang \(P_{\mathrm{ac}}\) on the checker hallway.

Mag control (\(a=b=0.5\)):

| filter | \(P_{\mathrm{ac}}\) | \(E_{\mathrm{minor}}\) | MAE |
|---|---|---|---|
| `ISO-MIP` | 1177.190 | 486.292 | **0** |
| `CPU-EWA` | 1177.190 | 486.292 | **0** |

Identical. If EWA invented detail under mag, the kernel would be wrong.

When \(W<M\) (\(W=128\) inside a 256 crop), the framebuffer is cleared to \(0.5\) — the zone-plate mean — so the pad is zeros after mean-subtract. A hard rectangular cut would have been a 2-D sinc that owns every filter.

The Hann window used on every crop has its own spectrum, so its cross is not mistaken for aliasing:

![Hann-window spectrum. Sidelobes are not alias.](/assets/journal/anisotropic/hann_control.jpg)

---

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
