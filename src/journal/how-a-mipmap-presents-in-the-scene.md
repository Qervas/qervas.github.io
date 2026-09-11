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

The usual sentence is: mipmaps blur when things get far. Wrong family.

A mipmap presents in the scene as the **legal band-limit** of whatever albedo the pixel grid can still hold. Skip the chain and high-frequency wood, brick, glyphs, tiles keep feeding frequencies one sample per pixel cannot represent. Those frequencies fold. Distant floors sparkle, crawl, moiré. Specular can glitter too. Put a box pyramid under trilinear and the false pattern collapses into soft legal wood, soft legal brick, a soft legal disk. The near field — magnification — must still look the same.

Cornell and the hallway are that sentence in a room. The zone-plate FFT is why the missing energy was folded, not artistically blurred.

---

Look at a Cornell box. Same camera, twice.

![Cornell box, PBR, same camera. Left: NEAREST no-mip — wood sparkles, glyphs moiré. Right: CPU box-mip trilinear — soft legal wood, soft legal glyphs. Photograph only — no ρ, no AF.](/assets/journal/mipmaps/16_cornell.jpg)

Left: `GL_NEAREST`, no mip. Satin wood planks, a letter-grid wallpaper, brushed metal — all authored finer than the far pixels can hold. The floor sparkles. The small glyphs turn to moiré. The metal can glitter. Right: CPU \(2\times 2\) box pyramid on albedo and roughness, `GL_LINEAR_MIPMAP_LINEAR`. Those false high-frequency patterns collapse. What remains is wood the pixel grid can actually represent. The tall box and the short box are close; both sides still read. That is how a mipmap **presents**. Not a fog. Not “far therefore blur.” A pre-band-limited level.

The everyday extra is a hallway you already know how to walk down.

![Brick hallway, ceramic-tile floor, wood doors. Left: far tiles crawl. Right: soft legal grout/glaze. Near doors still match. Photograph only.](/assets/journal/mipmaps/18_hallway.jpg)

The fold is the vanishing floor. Near door frames still match — magnification is reconstruction. The leftover softness on the right is isotropic over-blur (\(\rho=\max(\rho_x,\rho_y)\) band-limits to the major axis). No AF claim. No “this is how NVIDIA picks a level.”

A distance strip makes the two regimes unmixable, in wood:

![PBR Cornell floor. Top MIP, bottom NO-MIP. Columns NEAR / MID / FAR. NEAR is the mag control — spec hotspot matches. FAR is the fold.](/assets/journal/mipmaps/19_floor_distance.jpg)

NEAR must match. If “mip” looks softer on a close floor, the article is broken. FAR is the fold: no-mip grain still crawls; mip is the legal plank.

Grazing, the GGX spec streak on the varnish should still read as a floor. The fold is still the wood.

![Same Cornell mesh, low camera along the floor. Spec highlight on the varnish; wood crawl on the left, softer legal wood on the right.](/assets/journal/mipmaps/17_cornell_grazing.jpg)

Close on the metal box: brush vs mip, green-wall bounce on the flank, floor seams. The “MIP” decal is near-field and stays readable.

![Metal box + wood floor, same L/R pair. Photograph only.](/assets/journal/mipmaps/20_cornell_pbr_closeup.jpg)

Shade is Cook-Torrance GGX so the room feels like a photograph, not a Lambert lab. Lighting is points + an analytic ceiling rectangle + a cheap IBL lobe — **not a path tracer**. Linear lighting, ACES display. CPU \(2\times\) box SSAA so silhouettes read. None of these frames enter the CSV. None of them get an FFT. HUD: `PBR photo-only … GGX … rho=n/a`. The hero numbers stay on the chirp.

That is the presentation. Here is the proof that the missing energy was folded.

---

## The lab version of the same sparkle

A circular zone-plate (Fresnel chirp). Instantaneous frequency rises with radius, so there is a known Nyquist ring. Same texture, same ortho pose, minified at a locked footprint \(\rho=8\) (\(\lambda=3\)): eight texels per pixel, one sample per pixel.

![ρ=8 GL_NEAREST, no mip: false rings. Left is the real 128-px quad; right is NN zoom (display only).](/assets/journal/mipmaps/04_rho8_nearest.jpg)

The disk is a moiré. That is not “too far.” That is energy from above the new Nyquist sitting at a lower frequency — the same sentence as the Cornell floor, with a known \(f_{\mathrm{inst}}\).

Bilinear without a mip chain is not a fix. `GL_LINEAR` is a triangle filter. It takes some of the heat out and leaves the fold.

![ρ=8 GL_LINEAR, still no mip. Softer, still folded.](/assets/journal/mipmaps/06_rho8_linear.jpg)

Now the same footprint with a CPU \(2\times 2\) box pyramid and `GL_LINEAR_MIPMAP_LINEAR` — and, on the right, a pyramid that is *only* a pyramid.

![Left: box-mip trilinear, false rings gone — the legal disk, the lab version of the soft wood. Right: point-subsample pyramid, no low-pass — aliases remain.](/assets/journal/mipmaps/08_rho8_mip_box.jpg)

Left: the legal disk. Right: a smaller picture of the same aliases. **A mip chain without a low-pass is not a mipmap.** The right column exists so “we generated mip levels” cannot be confused with “we band-limited.” A Cornell with a point-sampled pyramid would still sparkle.

---

## Two regimes, never mixed

**Magnification** (\(\rho\le 1\), \(\lambda\le 0\)) is reconstruction. Mip and non-mip must match. If “mip” looks softer here, the note is broken.

**Minification** (\(\rho>1\), \(\lambda>0\)) is band-limit or fold. This is the article.

On this run, \(\rho=1\): `LINEAR` vs `LINEAR_MIPMAP_LINEAR`, MAE \(=\mathbf{0}\). Both samplers are reading L0 with linear magnification. That column is the control, not the hero. Same control as the distance-strip NEAR column.

![Alias ladder ρ=1,2,4,8,16. Top LINEAR no-mip, bottom box-mip. ρ=1 rows match (MAE=0). Fold takes over from ρ=4.](/assets/journal/mipmaps/10_alias_ladder.jpg)

At \(\rho=2\) the authored chirp has only started to kiss the new Nyquist; \(P_{\mathrm{ac}}\) still matches. From \(\rho=4\) the top row is a lattice of aliases and the bottom row is a shrinking legal disk. Pixel MAE in minify is *not* the theorem — at \(\rho=16\) MAE is only \(0.008\) because no-mip is already a gray field of aliases. Structure still diverges.

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

PNG is a 16-entry heat LUT of \(\log_{10}(|F|+\varepsilon)\), \(\varepsilon=10^{-8}\). Science is `glReadPixels(..., GL_FLOAT)` from an RGBA32F FBO, interior \(256^2\) crop, mean-subtract, separable Hann, unnormalized radix-2 DFT in this binary. Power \(P_{\mathrm{bin}}=|F|^2/M^2\). Same `vmin/vmax` on the \(\rho=8\) pair so you can actually compare. Do not FFT the Cornell PNG.

Nearest, no mip — fold:

![ρ=8 NEAREST log|F|. Shared scale with 07/09. vmax=2.21.](/assets/journal/mipmaps/05_rho8_nearest_fft.jpg)

Bilinear, no mip — still hot at high \(k\), vmax still \(2.21\):

![ρ=8 LINEAR no-mip log|F|. Triangle filter, not a band-limit.](/assets/journal/mipmaps/07_rho8_linear_fft.jpg)

Box-mip vs point-subsample, **same scale as 05**:

![Left: box-mip, high-k gone, box-sinc sidelobes remain, vmax=0.998. Right: point-subsample, aliases remain, vmax=2.22.](/assets/journal/mipmaps/09_rho8_mip_box_fft.jpg)

That pair is the theorem. High-\(k\) energy in 05 is not in 09-left. 09-right is 05 again, because a point-sampled pyramid never low-passed. The Cornell floor went soft because of 09-left, not because of 09-right.

The box in space is a sinc in frequency:

\[
L_{\ell+1}(i,j)
=\tfrac14\sum_{a=0}^{1}\sum_{b=0}^{1}
L_{\ell}(2i+a,\,2j+b).
\]

Sidelobes above the new Nyquist are visible in 09-left. That is honesty, not a driver bug. `glGenerateMipmap` was not used; Mesa’s path is blit / box-ish anyway. Semantic albedo and ORM use the same CPU box. Point-subsample is the control:

\[
L_{\ell+1}(i,j)=L_{\ell}(2i,\,2j).
\]

Trilinear is \(\mathrm{mix}(L_{\lfloor\lambda\rfloor},L_{\lceil\lambda\rceil},\{\lambda\})\). Not a claim about hardware quality.

---

## Quote \(P_{\mathrm{ac}}\). Do not quote \(E_{\mathrm{hi}}\) as \(10\times\).

Radial

\[
P(k)=\mathrm{mean}\{P_{\mathrm{bin}}:k-\tfrac12\le|\omega|<k+\tfrac12\},
\qquad
E_{\mathrm{hi}}=\frac{\sum_{k>k_{\mathrm{Nyq}}}P(k)}{\sum_{k\ge 1}P(k)}
\]

with \(k_{\mathrm{Nyq}}=M/2=128\). Annuli are weighted equally, so Hann / box-sinc lobes in the outer rings keep the ratio from collapsing even when the fold is gone.

\(\rho=8\), \(W=128\), crop 256, `padded=1`, measured on this run:

| filter | \(E_{\mathrm{hi}}\) | \(P_{\mathrm{ac}}\) | \(\log_{10}\|F\|\) vmax |
|---|---|---|---|
| `NEAREST` no-mip | 0.274 | **898** | 2.21 |
| `LINEAR` no-mip | 0.256 | 379 | 2.21 |
| box-mip trilinear | 0.241 | **30** | 0.998 |
| point-subsample | 0.328 | **899** | 2.22 |
| `textureLod` \(\lambda=3\) | 0.241 | 30 | 0.998 |

\(E_{\mathrm{hi}}\) moves \(0.274\to 0.241\). That is not a \(10\times\) drop. Pixel-weighted \(E_{\mathrm{hi,pix}}\) is \(0.202\to 0.206\). At \(\rho=16\), radial \(E_{\mathrm{hi}}\) is *higher* for box-mip than for `LINEAR` (\(0.119\) vs \(0.087\)) while \(P_{\mathrm{ac}}\) falls \(118\to 2\).

\(P_{\mathrm{ac}}\) is the sum of \(P_{\mathrm{bin}}\) except DC. **898 vs 30** is \(\sim 30\times\). That, and the shared-scale \(\log|F|\) pair, is the claim. `textureLod` matched the implicit-LOD photograph on this ortho build. Do not hang those numbers on the wood floor. Cornell is the presentation; the chirp is the meter.

![P(k) overlay at ρ=8, log y, Nyquist tick. HUD: P_ac N=898 / M=29.8.](/assets/journal/mipmaps/11_pk_overlay.jpg)

When the quad is smaller than the crop (\(W=128\) or \(64\)), the framebuffer is cleared to \(0.5\) — the zone-plate mean — so the pad is zeros after mean-subtract (`padded=1` in the CSV). A hard rectangular cut would have been a 2-D sinc that owns every filter.

The Hann window used on every crop has its own spectrum, so its cross is not mistaken for aliasing:

![Hann-window spectrum. Sidelobes are not alias.](/assets/journal/mipmaps/hann_control.jpg)

---

## Spectrum follows \(\lambda\), not “distance”

There is no camera on the ortho path. `lodBias` \(\pm 1\) at **fixed** \(\rho=8\):

![lodBias −1 / 0 / +1 at ρ=8. Top: sampler. Bottom: textureLod. Spectrum follows λ.](/assets/journal/mipmaps/14_lod_bias.jpg)

| bias | \(\lambda\) | \(P_{\mathrm{ac}}\) |
|---|---|---|
| \(-1\) | 2 | 110 |
| \(0\) | 3 | 30 |
| \(+1\) | 4 | 0.27 |

Under-bias leaves residual fold. Over-bias kills almost all AC power. Same cells via `textureLod`. That is a level pick. The Cornell softness is the same knob: which prefiltered level the sampler landed on, not how many metres the camera walked.

Force the level on a \(\rho=1\) window and the disk shrinks because \(\lambda\) said so, not because the quad moved:

![textureLod λ=0..4, same UV window. Spatial strip on top, log|F| under a shared scale.](/assets/journal/mipmaps/13_lod_strip.jpg)

\(P_{\mathrm{ac}}\) along that strip: 1146, 1042, 815, 437, 144. Residual box-sinc lobes at \(\lambda\ge 2\) are the same honesty gap as 09-left.

GLSL 330, one uniform:

```glsl
vec4 s = (uMode == 1) ? textureLod(uTex, vUV, uLod)
                      : texture(uTex, vUV, uBias);
```

`textureQueryLod` is out (GLSL 400). The LOD *photograph* is a falsecolor mip chain plus `NEAREST_MIPMAP_NEAREST`. On this llvmpipe with `GALLIVM_PERF=no_filter_hacks`, implicit \(\lfloor\lambda\rfloor\) matched the CPU ladder. **Do not take that to NVIDIA / AMD / Intel.** Do not claim `dFdx` equals hardware derivatives. The science path does not care: CPU \(\lambda\), CPU pyramid, `textureLod`.

![Falsecolor level vs CPU λ on the ortho ladder. Matched here; untrusted as a hardware claim.](/assets/journal/mipmaps/12_lod_falsecolor.jpg)

---

## Isotropic mip is the wrong ellipse

One photograph, no \(\rho\) on the HUD, no AF table. This is the leftover softness on the hallway mip side, said with a zone-plate.

![Foreshortened floor. Left: NEAREST no-mip. Right: isotropic mip over-blurs the minor axis. Photograph only.](/assets/journal/mipmaps/15_foreshorten.jpg)

\(\rho=\max(\rho_x,\rho_y)\) band-limits to the major axis and over-blurs the minor. EWA / anisotropy is the cousin this note does not run. llvmpipe is not a discrete-GPU quality study.

---

## What the PBR path actually is

Cook-Torrance GGX, metalness-roughness, GLSL 330. \(D\) is GGX / Trowbridge-Reitz, \(G\) is Smith with Schlick-GGX, \(F\) is Schlick. Direct lighting form, not a path tracer. No Toksvig. Albedo and ORM both get the CPU \(2\times 2\) box. Display is ACES (Narkowicz) then \(\gamma=2.2\) from a linear FBO.

The room photographs are hi-res: gallery \(2560\times 1440\), CPU \(2\times\) box SSAA (not GL MSAA). SSAA is for geometry — box edges, lamp quad, door frames, hallway vanishing lines. It slightly averages the no-mip sparkle; the fold vs band-limit pair still reads. The zone-plate / FFT frames stay at \(1280\times 720\), FBO \(512^2\).

Cornell is the *layout*, not a GI benchmark. Area light + bounce points + gradient IBL is a look. PBR does not change the theorem.

---

## What this box actually measured

Host: OSMesa, Mesa 25.0.7-2+deb13u1, llvmpipe (LLVM 19.1.7, 256 bits). FBO **RGBA32F**, 8-bit fallback **not hit**, no sRGB, no MSAA on the science FBO, wrap `CLAMP_TO_EDGE`. Assertions: **27 pass / 0 fail**, including DFT self-test, \(\rho=1\) MAE \(=0\), and \(\rho=8\) \(P_{\mathrm{ac}}\) nearest \(>5\times\) mip (898 vs 30). Semantic frames are extra outputs, not extra checks.

Can claim: on this rasterizer, minifying an authored chirp without a mip chain folds energy; a CPU box pyramid plus trilinear sampling removes most of that AC power; we measured it with this binary’s DFT of a float readback; the sampler pictures are pictures of this rasterizer, including a PBR Cornell and a hallway.

Cannot claim: hardware LOD, anisotropy quality, texel cache, bandwidth, occupancy, or “this is how GPUs work.” Cannot claim the zone-plate is a perfect LPF source. Cannot FFT the PNG and call it science. Cannot hang \(P_{\mathrm{ac}}\) on a wood floor.

Box \(\neq\) ideal LPF. Point-subsample \(\neq\) mipmap. \(E_{\mathrm{hi}}\) \(\neq\) the \(10\times\) drop. Pad with the mean, or the window owns you. Magnification MAE has to be zero or the note is broken. A mipmap presents in the scene as a legal band-limit, not as distance-fog.
