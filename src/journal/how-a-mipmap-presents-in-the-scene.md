---
title: How a mipmap presents in the scene
description: Not blur-because-far — a legal band-limit. Cornell and hallway photographs, then a zone-plate FFT proof. ρ=8 P_ac 898→30 on Mesa llvmpipe.
date: 2026-09-11
tags:
  - graphics
  - engine
  - sampling
math: true
cover: /assets/journal/mipmaps/16_cornell.jpg
---

The usual explanation is that mipmaps blur things as they get further away. That belongs to the wrong family of ideas.

A mipmap actually presents in the scene as the **legal band-limit** of whatever albedo the pixel grid can still hold. Skip the mip chain, and high-frequency details—wood grain, brick, small glyphs, and tiles—continue feeding the shader frequencies that a single sample per pixel simply cannot represent. Consequently, those frequencies fold. Distant floors begin to sparkle, crawl, and moiré, while specular highlights aggressively glitter. If you put a box pyramid under a trilinear sampler, those false patterns collapse into soft, legally represented wood, brick, and disks. Crucially, the near field—where magnification happens—must still look identical.

The Cornell box and the hallway photographs demonstrate this principle in a physical space. Afterward, the zone-plate FFT proves exactly why the missing energy was folded rather than artistically blurred.

---

Look at the Cornell box rendered from the exact same camera angle.
![Cornell box, PBR, same camera. Left: NEAREST no-mip — wood sparkles, glyphs moiré. Right: CPU box-mip trilinear — soft legal wood, soft legal glyphs. Photograph only — no ρ, no AF.](/assets/journal/mipmaps/16_cornell.jpg)

On the left, using `GL_NEAREST` with no mipmap, the satin wood planks, letter-grid wallpaper, and brushed metal are all authored finer than the distant pixels can hold. As a result, the floor sparkles, the small glyphs degrade into moiré, and the metal glitters. On the right, we apply a CPU $2\times 2$ box pyramid to both the albedo and roughness maps using `GL_LINEAR_MIPMAP_LINEAR`. Those false high-frequency patterns collapse. What remains is the actual wood texture the pixel grid can legally represent. Both the tall and short boxes are close enough that their sides still read clearly. This is exactly how a mipmap **presents**. It is not a fog effect, nor is it a simple “far therefore blur” heuristic; it is a pre-band-limited level of detail.

The everyday extension of this concept is walking down a familiar hallway.
![Brick hallway, ceramic-tile floor, wood doors. Left: far tiles crawl. Right: soft legal grout/glaze. Near doors still match. Photograph only.](/assets/journal/mipmaps/18_hallway.jpg)

The folding artifact is most obvious on the vanishing floor. Notice that the near door frames still match perfectly between the two shots—because magnification is purely reconstruction. The leftover softness on the right side is simply isotropic over-blur, where $\rho=\max(\rho_x,\rho_y)$ band-limits the texture to its major axis. This makes no claims about anisotropic filtering (AF) or how NVIDIA explicitly selects a mip level.

A distance strip effectively separates these two regimes, which is highly visible in the wood grain:
![PBR Cornell floor. Top MIP, bottom NO-MIP. Columns NEAR / MID / FAR. NEAR is the mag control — spec hotspot matches. FAR is the fold.](/assets/journal/mipmaps/19_floor_distance.jpg)

The NEAR column must match. If the “mip” version looks softer on a close floor, the implementation is broken. The FAR column is where the fold happens: the no-mip grain still crawls, whereas the mip version resolves into the legal plank.

At grazing angles, the Cook-Torrance GGX specular streak on the varnish should still read convincingly as a floor. The fold primarily affects the underlying wood albedo.
![Same Cornell mesh, low camera along the floor. Spec highlight on the varnish; wood crawl on the left, softer legal wood on the right.](/assets/journal/mipmaps/17_cornell_grazing.jpg)

Moving in close on the metal box reveals the brush strokes versus the mipmap, the green-wall bounce on the flank, and the floor seams. Because it is in the near-field, the “MIP” decal stays perfectly readable.
![Metal box + wood floor, same L/R pair. Photograph only.](/assets/journal/mipmaps/20_cornell_pbr_closeup.jpg)

Shading relies on Cook-Torrance GGX so the room feels like a physical photograph rather than a sterile Lambertian lab. Lighting consists of point lights, an analytic ceiling rectangle, and a cheap IBL lobe—**not a path tracer**. It uses linear lighting with an ACES display transform. A CPU $2\times$ box SSAA is applied so the silhouettes read cleanly. None of these specific frames enter the CSV, nor do they receive an FFT. The HUD explicitly reads: `PBR photo-only … GGX … rho=n/a`. The hero numbers remain locked to the chirp tests.

That covers the visual presentation. Here is the proof that the missing energy was folded.

---

## The lab version of the same sparkle

Consider a circular zone-plate (a Fresnel chirp). Its instantaneous frequency rises with the radius, giving us a known Nyquist ring. Using the exact same texture and orthographic pose, we minify the image at a locked footprint of $\rho=8$ ($\lambda=3$): eight texels per pixel, but only one sample per pixel.
![ρ=8 GL_NEAREST, no mip: false rings. Left is the real 128-px quad; right is NN zoom (display only).](/assets/journal/mipmaps/04_rho8_nearest.jpg)

The resulting disk is a pure moiré pattern. That is not simply “too far” away. It is high-frequency energy from above the new Nyquist limit folding down and sitting at a lower frequency. It is the exact same phenomenon seen on the Cornell floor, but here it has a known instantaneous frequency $f_{\mathrm{inst}}$.

Using bilinear filtering without a mip chain does not fix the issue. `GL_LINEAR` is merely a triangle filter. While it takes some of the heat out, it ultimately leaves the fold intact.
![ρ=8 GL_LINEAR, still no mip. Softer, still folded.](/assets/journal/mipmaps/06_rho8_linear.jpg)

Now, let's examine the same footprint using a CPU $2\times 2$ box pyramid with `GL_LINEAR_MIPMAP_LINEAR`. For comparison, the right side shows a pyramid that operates strictly as a pyramid without low-passing.
![Left: box-mip trilinear, false rings gone — the legal disk, the lab version of the soft wood. Right: point-subsample pyramid, no low-pass — aliases remain.](/assets/journal/mipmaps/08_rho8_mip_box.jpg)

On the left, we see the legal disk—the lab equivalent of the soft wood. On the right, we simply see a smaller picture containing the exact same aliases. **A mip chain without a low-pass filter is not a mipmap.** The right column is included specifically to ensure that “we generated mip levels” is never confused with “we band-limited the signal.” If we rendered the Cornell box with a point-sampled pyramid, the floor would still sparkle.

---

## Two regimes, never mixed

**Magnification** ($\rho\le 1$, $\lambda\le 0$) is strictly about reconstruction. Mip and non-mip versions must match perfectly. If “mip” looks softer here, the note is broken.

**Minification** ($\rho>1$, $\lambda>0$) is where the band-limit or the fold occurs. This is the core subject of the article.

On this run, at $\rho=1$: `LINEAR` versus `LINEAR_MIPMAP_LINEAR` yields a mean absolute error (MAE) of $\mathbf{0}$. Both samplers are reading from L0 with linear magnification. That column serves as our control, not the hero metric. It acts as the same control mechanism as the NEAR column in the distance strip.
![Alias ladder ρ=1,2,4,8,16. Top LINEAR no-mip, bottom box-mip. ρ=1 rows match (MAE=0). Fold takes over from ρ=4.](/assets/journal/mipmaps/10_alias_ladder.jpg)

At $\rho=2$, the authored chirp has only just started to kiss the new Nyquist limit; $P_{\mathrm{ac}}$ still matches closely. However, from $\rho=4$ onward, the top row degenerates into a lattice of aliases, while the bottom row successfully shrinks into a legal disk. Notably, the pixel MAE during minification is *not* the defining theorem. By $\rho=16$, the MAE is only $0.008$ simply because the no-mip variant has already collapsed into a gray field of aliases. The underlying structures still wildly diverge.

---

## \(\rho\), \(\lambda\), and the fold

This lab’s \(\rho\) is the GL footprint: **texels per pixel**. On the ortho science quad it is arithmetic, not `dFdx`:

\[
\rho = \frac{N\cdot\Delta\mathrm{UV}}{W_{\mathrm{px}}},\qquad
\lambda = \log_2\rho + \mathrm{lodBias}.
\]

Locked \(\rho\in\{1,2,4,8,16\}\). Hero: \(N=1024\), \(W=128\) \(\Rightarrow\) \(\rho=8\), \(\lambda=3\). \(\rho=1\) cannot fit a 1024-wide UV window on a 512 framebuffer; the mag control shows the **center** \(512\times 512\) texels (\(\Delta\mathrm{UV}=0.5\)).

A texture frequency \(f_{\mathrm{tex}}\) (cycles/texel) appears on screen at \(f_{\mathrm{px}}=\rho\, f_{\mathrm{tex}}\). Screen Nyquist is \(\tfrac12\) cycle/px. Fold when

\[
f_{\mathrm{tex}} > \frac{1}{2\rho}.
\]

At \(\rho=8\), anything above \(\tfrac{1}{16}\) cycle/texel is past the new Nyquist. Wood grain, brick edges, glyph stems, tile grout all live in that regime once the surface is small enough on screen. They have nowhere legal to go except a lower \(k\). That lower \(k\) is the sparkle.

The zone-plate is a Fresnel chirp, disk-masked, authored at pixel centers:

\[
I=\tfrac12+\tfrac12\cos(\pi r^2/N)\qquad(I=\tfrac12\text{ for }r>N/2),
\]

\[
f_{\mathrm{inst}}(r)=r/N \implies f_{\mathrm{inst}}(N/2)=\tfrac12.
\]

Most of that disk has nowhere legal to go, at \(\rho=8\), except a lower \(k\). L0 is authored at or under Nyquist and then measured — not a brick-wall bandlimited field.

![CPU zone-plate L0, disk-masked.](/assets/journal/mipmaps/00_zoneplate_l0.jpg)

![log|F| of the L0 crop. Energy lives inside the Nyquist circle.](/assets/journal/mipmaps/01_zoneplate_fft.jpg)

A 1-D chirp is the cousin with a single ridge. Phase is locked so \(f(N)=\tfrac12\); the naive \(\pi x^2/N\) would have aliased the right half of L0 and we would have been measuring our own authoring bug.

![1-D chirp L0, f(N)=1/2.](/assets/journal/mipmaps/02_chirp_l0.jpg)

![log|F| of the chirp: one ridge.](/assets/journal/mipmaps/03_chirp_fft.jpg)

---

## The theorem is the spectrum

The PNG is a 16-entry heat LUT of $\log_{10}(\vert{}F\vert{}+\varepsilon)$, where $\varepsilon=10^{-8}$. The actual science relies on calling `glReadPixels(..., GL_FLOAT)` from an RGBA32F FBO, taking an interior $256^2$ crop, mean-subtracting it, applying a separable Hann window, and executing an unnormalized radix-2 DFT within this binary. Power is calculated as $P_{\mathrm{bin}}=\vert{}F\vert{}^2/M^2$. We use the exact same `vmin/vmax` scaling on the $\rho=8$ pair so they can be accurately compared. Do not attempt to FFT the Cornell PNG yourself.

Using nearest-neighbor with no mipmap results in a complete fold:
![ρ=8 NEAREST log|F|. Shared scale with 07/09. vmax=2.21.](/assets/journal/mipmaps/05_rho8_nearest_fft.jpg)

Using bilinear filtering with no mipmap still runs hot at high $k$, retaining a vmax of $2.21$:
![ρ=8 LINEAR no-mip log|F|. Triangle filter, not a band-limit.](/assets/journal/mipmaps/07_rho8_linear_fft.jpg)

Comparing the box-mip against a point-subsample, **using the exact same scale as 05**:
![Left: box-mip, high-k gone, box-sinc sidelobes remain, vmax=0.998. Right: point-subsample, aliases remain, vmax=2.22.](/assets/journal/mipmaps/09_rho8_mip_box_fft.jpg)

That specific image pair visually represents the theorem. The high-$k$ energy clearly present in 05 is completely missing from 09-left. Meanwhile, 09-right is identical to 05, because a point-sampled pyramid never actually passes through a low-pass filter. The Cornell floor became soft due to the mathematics in 09-left, not 09-right.

A box filter in spatial coordinates equates to a sinc filter in the frequency domain:

$$L_{\ell+1}(i,j) =\tfrac14\sum_{a=0}^{1}\sum_{b=0}^{1} L_{\ell}(2i+a,\,2j+b).$$

The resulting sidelobes above the new Nyquist limit are distinctly visible in 09-left. That artifact is a mark of honesty, not a driver bug. We did not use `glGenerateMipmap`; Mesa's internal path functions as a blit/box-ish operation anyway. Both the semantic albedo and ORM maps rely on this same CPU box. The point-subsample acts purely as the control:

$$L_{\ell+1}(i,j)=L_{\ell}(2i,\,2j).$$

Trilinear filtering is defined as $\mathrm{mix}(L_{\lfloor\lambda\rfloor},L_{\lceil\lambda\rceil},\{\lambda\})$. This note makes no specific claims about commercial hardware filtering quality.

---

## Quote \(P_{\mathrm{ac}}\). Do not quote \(E_{\mathrm{hi}}\) as \(10\times\).

Radial

$$P(k)=\mathrm{mean}\{P_{\mathrm{bin}}:k-\tfrac12\le\vert{}\omega\vert{}<k+\tfrac12\}, \qquad E_{\mathrm{hi}}=\frac{\sum_{k>k_{\mathrm{Nyq}}}P(k)}{\sum_{k\ge 1}P(k)}$$

with $k_{\mathrm{Nyq}}=M/2=128$. Because annuli are weighted equally, the Hann/box-sinc lobes dwelling in the outer rings prevent the ratio from collapsing, even after the fold is eliminated.

At $\rho=8$, $W=128$, using a crop of 256, and `padded=1`, we measured the following on this run:

| filter | $E_{\mathrm{hi}}$ | $P_{\mathrm{ac}}$ | $\log_{10}\Vert{}F\Vert{}$ vmax |
| --- | --- | --- | --- |
| `NEAREST` no-mip | 0.274 | **898** | 2.21 |
| `LINEAR` no-mip | 0.256 | 379 | 2.21 |
| box-mip trilinear | 0.241 | **30** | 0.998 |
| point-subsample | 0.328 | **899** | 2.22 |
| `textureLod` $\lambda=3$ | 0.241 | 30 | 0.998 |

Notice that $E_{\mathrm{hi}}$ only moves from $0.274$ to $0.241$. That is emphatically not a $10\times$ drop. The pixel-weighted $E_{\mathrm{hi,pix}}$ similarly barely moves from $0.202$ to $0.206$. At $\rho=16$, the radial $E_{\mathrm{hi}}$ is actually *higher* for the box-mip than for `LINEAR` ($0.119$ vs $0.087$), even though $P_{\mathrm{ac}}$ plummets from $118$ to $2$.

$P_{\mathrm{ac}}$ represents the sum of $P_{\mathrm{bin}}$ excluding DC. **898 vs 30** represents an approximate $30\times$ reduction. That significant drop, alongside the shared-scale $\log\vert{}F\vert{}$ pair, forms the core technical claim. The `textureLod` output perfectly matched the implicit-LOD photograph on this orthographic build. Do not attribute these exact metrics to the wood floor visuals; the Cornell box serves as the presentation, whereas the chirp acts as the scientific meter.
![P(k) overlay at ρ=8, log y, Nyquist tick. HUD: P_ac N=898 / M=29.8.](/assets/journal/mipmaps/11_pk_overlay.jpg)

When the quad is smaller than the crop window ($W=128$ or $64$), the framebuffer clears to $0.5$—the mean of the zone-plate. Because of this, the padding resolves to zeros after mean-subtraction (`padded=1` in the CSV). Using a hard rectangular cut would have introduced a 2-D sinc that dominates every filter in the test.

The Hann window applied to every crop possesses its own spectrum, preventing its cross pattern from being mistaken for genuine aliasing:
![Hann-window spectrum. Sidelobes are not alias.](/assets/journal/mipmaps/hann_control.jpg)

---

## Spectrum follows \(\lambda\), not “distance”

There is no camera operating on the orthographic path. By adjusting the `lodBias` by $\pm 1$ at a **fixed** $\rho=8$ footprint:
![lodBias −1 / 0 / +1 at ρ=8. Top: sampler. Bottom: textureLod. Spectrum follows λ.](/assets/journal/mipmaps/14_lod_bias.jpg)

| bias | $\lambda$ | $P_{\mathrm{ac}}$ |
| --- | --- | --- |
| $-1$ | 2 | 110 |
| $0$ | 3 | 30 |
| $+1$ | 4 | 0.27 |

Under-biasing clearly leaves a residual fold. Over-biasing strips away almost all AC power. The exact same cells were verified using `textureLod`. This demonstrates a direct level pick. The softness observed in the Cornell box is driven by the exact same knob: the specific prefiltered level the sampler lands on dictates the blur, not the raw metric distance the camera moved.

If we force the mip level on a $\rho=1$ window, the disk physically shrinks because $\lambda$ demands it, not because the quad shifted in space:
![textureLod λ=0..4, same UV window. Spatial strip on top, log|F| under a shared scale.](/assets/journal/mipmaps/13_lod_strip.jpg)

The $P_{\mathrm{ac}}$ values along that strip are: 1146, 1042, 815, 437, and 144. The residual box-sinc lobes visible at $\lambda\ge 2$ represent the same honesty gap shown earlier in 09-left.

Written in GLSL 330 using a single uniform:

```glsl
vec4 s = (uMode == 1) ? textureLod(uTex, vUV, uLod)
                      : texture(uTex, vUV, uBias);

```

`textureQueryLod` is out (GLSL 400). The LOD *photograph* is composed of a falsecolor mip chain combined with `NEAREST_MIPMAP_NEAREST`. Running on llvmpipe with `GALLIVM_PERF=no_filter_hacks`, the implicit $\lfloor\lambda\rfloor$ directly matched the CPU ladder. **Do not take that to NVIDIA / AMD / Intel.** Furthermore, do not assume `dFdx` perfectly aligns with hardware derivatives. The scientific path simply does not care: it relies on CPU $\lambda$, a CPU pyramid, and explicit `textureLod`.
![Falsecolor level vs CPU λ on the ortho ladder. Matched here; untrusted as a hardware claim.](/assets/journal/mipmaps/12_lod_falsecolor.jpg)

---

## Isotropic mip is the wrong ellipse

One photograph, no $\rho$ on the HUD, no AF table. This perfectly illustrates the residual softness found on the hallway's mip side, visually explained via a zone-plate.
![Foreshortened floor. Left: NEAREST no-mip. Right: isotropic mip over-blurs the minor axis. Photograph only.](/assets/journal/mipmaps/15_foreshorten.jpg)

Because $\rho=\max(\rho_x,\rho_y)$ strictly band-limits to the major axis, it heavily over-blurs the minor axis. EWA and anisotropic filtering (AF) are the more advanced cousins that this specific lab note does not run. Keep in mind that llvmpipe is not an appropriate backend for a discrete-GPU quality study.

---

## What the PBR path actually is

The shading pipeline uses Cook-Torrance GGX with a metalness-roughness workflow in GLSL 330. Specifically, $D$ is GGX / Trowbridge-Reitz, $G$ is Smith with Schlick-GGX, and $F$ is Schlick. It relies entirely on direct lighting—it is not a path tracer. There is no Toksvig mapping. Both the albedo and ORM maps receive the exact same CPU $2\times 2$ box filter. The display pipeline applies ACES (Narkowicz) followed by a $\gamma=2.2$ curve from a linear FBO.

The room photographs were captured at a high gallery resolution of $2560\times 1440$ utilizing CPU $2\times$ box SSAA, rather than GL MSAA. This SSAA pass is dedicated solely to geometry—smoothing out box edges, the lamp quad, door frames, and hallway vanishing lines. While it slightly averages out the no-mip sparkle, the core visual difference between the fold and the band-limit remains distinctly clear. The zone-plate and FFT frames are locked to $1280\times 720$ with a $512^2$ FBO.

The Cornell setup provides a familiar structural *layout*; it is not intended as a global illumination benchmark. The combination of an area light, bounce points, and gradient IBL strictly establishes the look. Ultimately, rendering in PBR does not alter the underlying math of the theorem.

---

## What this box actually measured

Host: OSMesa, Mesa 25.0.7-2+deb13u1, llvmpipe (LLVM 19.1.7, 256 bits). The FBO uses an **RGBA32F** format, meaning the 8-bit fallback is **not hit**. There is no sRGB and no MSAA applied to the science FBO. Texture wrap is set to `CLAMP_TO_EDGE`. Out of all internal assertions, **27 pass / 0 fail**. This includes the DFT self-test, verifying $\rho=1$ MAE $=0$, and ensuring the $\rho=8$ $P_{\mathrm{ac}}$ for nearest is $>5\times$ that of the mipmap (898 vs 30). The semantic scene frames are purely supplementary outputs; they are not part of the core scientific checks.

We can claim: On this specific rasterizer, minifying an authored chirp without a mip chain forces energy to fold. Applying a CPU box pyramid alongside trilinear sampling removes the vast majority of that AC power. We measured this directly using the binary's DFT calculated from a float readback. Furthermore, the sampler pictures—including the PBR Cornell box and the hallway—are accurate representations of this rasterizer's output.

We cannot claim: hardware LOD, anisotropy quality, texel cache performance, bandwidth, occupancy, or definitively state "this is how commercial GPUs work." We cannot assert that the zone-plate acts as a perfect LPF source. We cannot simply FFT the resulting PNG and label it as rigorous science. Finally, we cannot directly attribute the numerical $P_{\mathrm{ac}}$ results to the visual softness of the wood floor.

A box filter $\neq$ an ideal LPF. A point-subsample $\neq$ a valid mipmap. $E_{\mathrm{hi}}$ $\neq$ the $10\times$ drop. If you do not pad with the mean, the windowing artifact will dominate the results. Magnification MAE must inherently be zero, or the entire methodology is broken. Ultimately, a mipmap presents in the scene as a legal band-limit, never just as distance-fog.
