---
title: "Split-Sum Image-Based Lighting"
description: "An HDR loft folded into a GGX-prefiltered cube × DFG LUT. Distant irradiance fills dielectrics — not local multi-bounce GI."
date: 2026-09-15
tags:
  - graphics
  - engine
  - lighting
math: true
cover: /assets/journal/ibl-split-sum/00_hero.jpg
---

The last note owned a tangent-space height march so a quad reads as carved brick. The silhouette stayed the quad. This one does not pick a new sampler. An HDR environment is folded into two tables: a GGX-prefiltered specular cube and a DFG LUT. The fragment multiplies them. **Split-sum makes environment lighting display-ready.** Irradiance on/off is the GI-**shaped** control: distant environment, not local bounce.

![Cream stoneware bottle and brass sphere on board-formed concrete, loft window behind, full split-sum. Metal carries sharp mullions; glaze picks up a dim rim and colored fill. Khronos PBR Neutral, exposure 1.05. Photograph only — no energy metric.](/assets/journal/ibl-split-sum/00_hero.jpg)

Cream stoneware and measured brass on a catcher, loft window behind, full split-sum. The metal carries sharp mullions. The glaze picks up a dim rim and colored fill from the room, not a flat ambient. HUD: `Khronos PBR Neutral  exposure=1.05`, `distant environment irradiance, not local multi-bounce GI`, `photo-only - no metric`. Do not hang an energy number on this photograph.

![Same camera, same exposure, three shaders. Left SPEC IBL ONLY: ceramic flanks dark; brass still shows the window. Middle IRRADIANCE ONLY: ceramic fills; brass black (kD=0). Right FULL SPLIT-SUM. Distant environment ambient, not local multi-bounce GI.](/assets/journal/ibl-split-sum/01_gi_control.jpg)

Same camera, same exposure, three shaders. Left **SPEC IBL ONLY**: ceramic flanks go dark; brass still shows the window. Middle **IRRADIANCE ONLY**: ceramic fills; brass is black because \(k_D=0\). Right **FULL SPLIT-SUM**. Caption: distant environment ambient, not local multi-bounce GI.

Hero, Mesa 25.0.7 llvmpipe, linear working space, **Khronos PBR Neutral**, exposure **1.05**: white-env Karis prefilter energy **1.000** at \(r=0.05,\,0.20,\,0.50,\,1.00\). DFG at \(\mathbf{n}\cdot\mathbf{v}=1\), \(r\approx 0\): \(S=\mathbf{1.000}\), \(B=\mathbf{0}\). Flank crop (linear, full / spec-only luma ratio) **5.11**. Env solid-angle mean luma **1.628**. Assertions **25 pass / 0 fail**.

---

## What you are seeing

The environment is an authored loft HDR (procedural latlong, not a captured EXR): plaster, baseboard, timber-ish beams, a key \(+Z\) factory window with jambs and a 4×5 mullion grid, offset backdrop sashes, a door/panel, warm floor. No extra analytic key light on the hero plates. The env does the lighting.

**Presentation hook.** Product still, \(1920\times 1080\), GL photograph, CPU tone map. Glazed ceramic (dielectric \(F_0=0.04\), glaze roughness in \(0.14\)–\(0.30\)) and measured brass \(F_0=(0.910,\,0.778,\,0.423)\). Soft planar contact on the catcher. Photo only.

**GI-shaped control.** Same objects, same camera `eye (1.30, 0.54, 1.98) → (0.05, 0.25, 0.02)`, fov \(30^\circ\). Three-up \(1920\times 820\). Metals stay black in the middle panel. That is the model, not a bug. Linear flank crop (ceramic, spec-only vs full) is the meter for “irradiance did something”; the JPEG is still a photograph.

Walk the three panels:

- **Spec IBL only.** The conductor can live on a prefiltered cube: window, frame, a strip of interior. The dielectric cannot. \(F_0=0.04\) leaves the body dark. Studio void.
- **Irradiance only.** Distant-environment \(E(\mathbf{n})\) fills the ceramic. Brass is black (\(k_D=0\)). No local object bounce, no bottle-in-sphere, no floor color bleeding onto the metal.
- **Full split-sum.** Specular cube \(\times\) DFG, plus irradiance. The plate that is supposed to look like a product shot.

![Brass roughness ladder, six rungs r∈{0.05, 0.18, 0.32, 0.48, 0.68, 1.00}. Smooth metal still shows mullions; the lobe widens; highlight tints with F0. Photograph only — no metric.](/assets/journal/ibl-split-sum/02_metal_roughness.jpg)

**Conductor ladder.** Six rungs \(r\in\{0.05,\,0.18,\,0.32,\,0.48,\,0.68,\,1.00\}\), measured brass, albedo-only so rung roughness stays the control. Smooth metal still shows mullions. The lobe widens; the highlight tints with \(F_0\); the body is not an irradiance-albedo mix-up. `lod = roughness * (mips-1)`. Photo only.

![Dielectric F0=0.04 cream roughness ladder, same six rungs. Grazing Fresnel remains as roughness climbs (the DFG). Photograph only.](/assets/journal/ibl-split-sum/03_dielectric_roughness.jpg)

**Dielectric ladder.** Same rungs, \(F_0=0.04\), cream albedo. Grazing Fresnel remains as roughness climbs (that is the DFG). Same env / exposure / TM as the metal ladder. Photo only.

Two facts, never mixed:

1. **Beauty plates** (heroes, ladders, failures, calibration strip) are GL-rendered split-sum, Khronos PBR Neutral, exposure 1.05, then sRGB OETF. HUD `photo-only` means do not invent a GL energy theorem from the JPEG.
2. **Instruments** (mip strip, spp residual, DFG LUT, roughness→mip map, and the CSV) are CPU tables: Karis prefilter, DFG integrate, white-env energy, mip variance, 64-spp vs 512-spp RMSE.

---

## Why: the reflection integral, then Karis

Working space is **linear radiance**. Cubemaps are linear. Tone map is a named display step after shading, not baked into the tables.

### Reflection equation (specular)

\[
L_o(\mathbf{v})
=
\int_{\Omega}
L_i(\mathbf{l})\,
f_r(\mathbf{l},\mathbf{v})\,
(\mathbf{n}\cdot\mathbf{l})\,
\mathrm{d}\omega_l.
\]

Microfacet specular (Cook–Torrance):

\[
f_r
=
\frac{D(h)\,F(\mathbf{v},h)\,G(\mathbf{l},\mathbf{v})}
{4\,(\mathbf{n}\cdot\mathbf{l})\,(\mathbf{n}\cdot\mathbf{v})}.
\]

NDF is **isotropic GGX / Trowbridge–Reitz**. \(\alpha=r^2\) in the NDF only:

\[
D(h)
=
\frac{\alpha^2}{\pi\bigl((\mathbf{n}\cdot h)^2(\alpha^2-1)+1\bigr)^2},
\quad
\alpha=r^2.
\]

A hemisphere of HDR samples times that BRDF, every fragment, is the reference. Production does not do that.

### Split-sum (Karis / UE4-style)

Factor the integral into **prefiltered incident radiance** (depends on \(L_i\) and roughness, not on \(F_0\)) and a **view-dependent BRDF integral** against a white environment (depends on \(\mathbf{n}\cdot\mathbf{v}\) and roughness, not on \(L_i\)):

\[
L_o(\mathbf{v})
\;\approx\;
L_{\mathrm{prefilter}}(\mathbf{R},r)
\cdot
\bigl(F_0\,S(\mathbf{n}\cdot\mathbf{v},\,r)+B(\mathbf{n}\cdot\mathbf{v},\,r)\bigr),
\]

with \(\mathbf{R}=\mathrm{reflect}(-\mathbf{v},\mathbf{n})\). That multiply is the production trick. This note photographs it and names the two stored tables.

### Term A — prefiltered radiance

Stored in cubemap mips. Karis weighting, \(V=N=R\), no second \(G\) in the prefilter:

\[
L_{\mathrm{prefilter}}(\mathbf{R},r)
=
\frac{
\int_{\Omega} L_i(\mathbf{l})\,D_{r}(h)\,(\mathbf{n}\cdot\mathbf{l})\,\mathrm{d}\omega_l
}{
\int_{\Omega} D_{r}(h)\,(\mathbf{n}\cdot\mathbf{l})\,\mathrm{d}\omega_l
}.
\]

Importance-sample the GGX NDF in half-vector space, reflect to \(\mathbf{l}\), weight by \(\mathbf{n}\cdot\mathbf{l}\). Constant \(L_i=1\) must return **1**. That is the white-env energy row: **1.000** at four roughness keys.

This run: specular cube **128**, **8** mips, CPU authored, uploaded per level. `glGenerateMipmap` is **not** called. Production spp is 64 (doubled on coarser mips). A separate **512** sky cube, mip0 only, `GL_LINEAR`, is the backdrop; it is not the GGX chain.

### Roughness \(\to\) mip (linear, stated)

\[
\lambda(r)=r\cdot(\lambda_{\max}),
\quad
\lambda_{\max}=\mathrm{mips}-1.
\]

Eight mips \(\Rightarrow\) \(\lambda=7r\). This is **not** a GGX solid-angle match. It is the default so the roughness ladder is readable. Shader: `lod = rough * uMaxMip`.

### Term B — DFG / EnvBRDF LUT

2D: \(X=\mathbf{n}\cdot\mathbf{v}\), \(Y=\) roughness. Single-scatter. Schlick \(F\) split into \(F_0\) and the white-Fresnel remainder. Smith–GGX IBL geometry with

\[
k_{\mathrm{IBL}}=\frac{r^2}{2}.
\]

LUT RGB is `(scale, bias)`. Integrate against a white environment; the env cube never enters this table.

\[
I_{\mathrm{BRDF}}=F_0\cdot S(\mathbf{n}\cdot\mathbf{v},\,r)+B(\mathbf{n}\cdot\mathbf{v},\,r).
\]

Dielectric \(F_0=0.04\). Conductor \(F_0=\) linear RGB albedo (measured brass here; no dielectric coat). At \(\mathbf{n}\cdot\mathbf{v}=1\), \(r\approx 0\): \(S\to 1\), \(B\to 0\). CSV: \(S=0.999984\), \(B=0\). LUT range **[0, 1]**.

### Distant irradiance (the locked GI control)

Lambert:

\[
L_{\mathrm{diffuse}}
=
\frac{\rho}{\pi}\,E(\mathbf{n}),
\quad
E(\mathbf{n})
=
\int_{\Omega} L_i(\mathbf{l})\,(\mathbf{n}\cdot\mathbf{l})\,\mathrm{d}\omega_l,
\]

with \(k_D=(1-F)(1-\mathrm{metal})\) so metals do not pick up a diffuse body. \(E\) is a low-frequency irradiance cubemap from the **same** distant environment. This run: cube **64**, **192** spp cosine, then a 3-pass \(3\times 3\) blur on mip0 only so window mullions do not reprint as wood grain on Lambertian flanks. Specular mips are not blurred.

**Honesty line:** irradiance here is distant environment lighting preintegrated over the hemisphere. It is not local multi-bounce GI, not path tracing, not DDGI, not lightmaps, not SSGI.

On/off is the three-up above. No extra directional fill on the hero.

### Display

\[
L_{\mathrm{display}}=\mathrm{TM}\bigl(\mathrm{expose}(L_o)\bigr)
\quad\text{then sRGB OETF.}
\]

TM is **Khronos PBR Neutral** (linear in, linear display-referred out). Exposure **1.05**, identical on every comparison row. TM is **not** baked into the cubemaps. `GL_FRAMEBUFFER_SRGB` is off; encode is CPU.

---

## Unique artifacts: the mip strip, the LUT, the map

![CPU GGX prefilter, +Z face, mip 0…7. Mip0 is a 4×5 factory window; mullions dissolve into the lobe. Not glGenerateMipmap. Luma variance 70.9 → … → 0.](/assets/journal/ibl-split-sum/04_prefilter_mips.jpg)

This is the thing this note exists to draw. CPU GGX prefilter, \(+Z\) face, mip \(0\ldots 7\), roughness \(=\) mip \(/\) (mips\(-1\)). Mip0 is a 4×5 factory window with dark frames. Then the mullions dissolve into the lobe. Caption: `not glGenerateMipmap`. \(+Z\) luma variance is the monotone blur meter: **70.9 → 43.9 → 23.3 → 9.34 → 3.54 → 2.33 → 0.76 → 0**.

![64 spp vs 512 spp at r=0.25/0.50/0.80, +Z, plus relative-error heatmap. RMSE 0.777 / 1.045 / 1.465. CPU both sides. Instrument.](/assets/journal/ibl-split-sum/05_prefilter_vs_ref.jpg)

Sample-count instrument, CPU both sides. Production spp vs **512** spp at \(r=0.25/0.50/0.80\), \(+Z\), \(32^2\), plus a relative-error heatmap. RMSE **0.777 / 1.045 / 1.465**. That is 64-spp vs 512-spp on an HDR window with a sun disc, not production-mip vs analytic, and not a GL filtering theorem. Residual fireflies at 64 spp are expected.

![DFG scale S and bias B, 128², CPU GGX. Axes: N·V × roughness. Face-on smooth corner: S≈1, B=0.](/assets/journal/ibl-split-sum/06_dfg_lut.jpg)

Scale \(S\) and bias \(B\), \(128^2\), CPU GGX, 64 spp. Axes labeled. \(I_{\mathrm{BRDF}} = F_0 \cdot S(\mathbf{n}\cdot\mathbf{v},\,a) + B(\mathbf{n}\cdot\mathbf{v},\,a)\), single-scatter. The smooth, face-on corner is the CSV row: \(S\approx 1\), \(B=0\).

![Linear λ(r)=r·(mips−1) plot plus mip thumbnails of the same +Z window. Not a solid-angle match; the ladder stays readable.](/assets/journal/ibl-split-sum/07_roughness_mip.jpg)

\(\lambda(r)=r\cdot(\mathrm{mips}-1)\) as a plot, plus mip thumbnails of the same \(+Z\) window. Caption: not a solid-angle match; the ladder stays readable. GGX \(\alpha=r^2\) lives in the NDF, not in this map.

---

## Quote the CSV. Do not quote the beauty photographs as energy.

Photoreal gallery, Mesa llvmpipe:

| metric | theory / gate | measured | note |
|---|---|---|---|
| white-env energy \(r=0.05,0.20,0.50,1.00\) | 1 | **1.000** all four | Karis prefilter, constant \(L_i=1\) |
| DFG \(S(\mathbf{n}\cdot\mathbf{v}=1,\,r\approx 0)\) | \(>0.70\) | **0.999984** | sampled at \(r=0.045\) (shader clamp) |
| DFG \(B\) same cell | \(\sim 0\) | **0** | |
| flank luma spec-only | n/a | 0.134657 | linear crop, not the JPEG |
| flank luma full | n/a | 0.688492 | linear crop |
| flank ratio full / spec | \(>1.08\) | **5.112927** | irradiance on vs spec-only |
| env mean luma | HDR in \((0.15,\,25)\) | **1.628385** | solid-angle weighted latlong |
| prefilter RMSE \(r=0.25/0.50/0.80\) | n/a | **0.777 / 1.045 / 1.465** | prod spp vs 512 spp, \(+Z\) |
| metal highlight RMS \(r=0.05\to 0.18\) | grows | **5.08 → 48.2** | linear render; then saturates |
| \(+Z\) luma variance mips \(0\ldots 7\) | decreasing | **70.9 → … → 0** | monotone blur meter |

Hero rounding used in the lede: energy **1.000**; \(S=\mathbf{1.000}\), \(B=\mathbf{0}\); flank ratio **5.11**; env luma **1.628**. The ratio is still \(\gg 1\). Do **not** invent a GL energy or RMSE theorem from the hero or the roughness ladders. Those frames are `photo-only`.

Highlight RMS grows on the first metal rungs, then saturates once the lobe covers the sphere (\(r\gtrsim 0.32\): 54.1, 46.9, 39.2, 39.2). Width after that is not a useful meter. Mip variance is.

---

## Failures / controls

### Wrong mip

![Failure: force mip0 on rough (sparkly sandpaper) | correct | force max mip on smooth (pewter blob). Photograph only.](/assets/journal/ibl-split-sum/08_wrong_mip.jpg)

Left: roughness \(0.75\), force mip0. Sparkly sandpaper; the window is still a window. Middle: same roughness, correct \(\lambda\). Right: roughness \(0.08\), force max mip. Pewter blob; a smooth conductor has been given the roughest table. Photo only. The metal ladder is the honest map; this plate is the knife.

### No DFG LUT (\(F=1\))

![Failure: F=1 (no DFG) washes metals grey vs split-sum F0·S+B. Photograph only.](/assets/journal/ibl-split-sum/09_no_lut.jpg)

Same prefilter cube, same exposure. Left: skip the LUT, output the prefiltered radiance as if \(F=1\). Metals wash grey; the brass \(F_0\) is gone; the dielectric loses the grazing rim and the body energy is wrong. Right: \(F_0 S+B\). Photo only.

### LDR clip vs HDR

![Failure: clipped Li≤1 env vs float HDR, same TM. Window highlight and interior collapse on the left. Photograph only.](/assets/journal/ibl-split-sum/10_ldr_vs_hdr.jpg)

Same TM, same exposure. Left: env authored with \(L_i\le 1\), then prefiltered. Window highlight and interior both collapse; the metal loses punch. Right: float HDR env. TM is not in the cubemaps; clipping the *source* is the failure. Photo only.

### Instrument strip (not a hero)

![Calibration balls: smooth metal / rough metal / Lambertian with spec off. Not the product shot.](/assets/journal/ibl-split-sum/11_instrument_spheres.jpg)

Smooth metal / rough metal / Lambertian with spec off. Caption: calibration balls, not the product shot. Photo only. If this were the cover, the note would be a void-sphere demo.

---

## Two paths, do not mix the instruments

| path | frames | instrument |
|---|---|---|
| **Science** | mip strip, spp residual, DFG LUT, roughness→mip, CSV, white-env energy, mip variance, RMSE | CPU latlong, CPU Karis prefilter, CPU cosine irradiance, CPU DFG. Image is visualization of those buffers after the same TM. |
| **Photograph** | heroes, ladders, failures, calibration strip | GLSL 330 split-sum on this llvmpipe: `textureLod` of the CPU mips, DFG 2D, irradiance cube. HUD `photo-only`. Flank luma and metal RMS are linear-FBO crops, not JPEG theorems. |
| **Display** | every plate | expose \(1.05\) → Khronos PBR Neutral → sRGB OETF. One operator, every row. |

The GI-control three-up is a photograph of the control *and* the source of the flank-ratio CSV row. Quote the CSV. Do not quote the 8-bit panel as 5.11.

---

## Honesty gaps

1. **Distant-environment irradiance \(\neq\) local GI.** No bottle-to-brass bounce, no floor color in the metal, no path tracing, no DDGI, no lightmaps, no SSGI. Metals are black in the irradiance-only panel because \(k_D=0\).
2. **Single-scatter split-sum.** No multi-scatter energy compensation. Grazing metals can pick up a white-ish LUT bias term.
3. **Roughness→mip is linear.** \(\lambda=r\cdot(\mathrm{mips}-1)\), not a GGX solid-angle match.
4. **Prefilter RMSE** is 64-spp vs 512-spp at matched roughness on the HDR window, not production-mip vs analytic. Sun disc → residual fireflies (RMSE 0.777–1.465). Documented; not a GL filtering theorem.
5. **Highlight RMS** grows on the first metal rungs, then saturates. Mip variance is the monotone blur meter.
6. **Irradiance blur** is a 3-pass presentation filter on \(E(\mathbf{n})\) so mullions do not reprint as wood grain on dielectrics. Specular prefilter mips are not blurred.
7. **Contact** is a planar cosine term, not a shadow map or a ray trace.
8. **Env** is procedural loft HDR, not a captured EXR. Solid-angle mean luma **1.628**.
9. **Cubemap sampling** is llvmpipe RGBA16F with CPU-authored mips. Seamless cubemap is requested; face-edge quality is still a Mesa caveat.
10. **No hardware IBL unit** and no real-time convolution cost claim. Prefilter, irradiance, and DFG are CPU.
11. **Residual turned-form spec bands** on the bottle are the loft windows wrapping a surface of revolution. Milder than a marble-chalk urn, not a second lobe.
12. **JPEG is visualization.** Measurement is the CSV. Do not FFT or energy-integrate a beauty frame.

---

## Mesa / llvmpipe — what this run can claim

| item | value |
|---|---|
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| FBO color | **RGBA32F** complete, photo \(1920\times 1080\) |
| Specular / irradiance / sky cubes | **RGBA16F**, CPU mips uploaded per level |
| `glGenerateMipmap` | **not** called on the specular chain |
| DFG LUT | RGBA32F \(128^2\), CPU GGX |
| `GL_FRAMEBUFFER_SRGB` | disabled (TM + sRGB on CPU) |
| MSAA | disabled |
| `GL_TEXTURE_CUBE_MAP_SEAMLESS` | enabled |
| Exposure / TM | **1.05** / **Khronos PBR Neutral** |

Can claim: on this OSMesa / llvmpipe build, a CPU Karis GGX prefilter of an authored HDR loft conserves white-env energy (**1.000** at four roughness keys), a CPU DFG LUT hits \(S\approx 1\), \(B=0\) at face-on smooth, and a GLSL 330 split-sum shader times those tables plus a distant-environment irradiance cube produces these photographs. Turning irradiance off darkens dielectric flanks (linear crop ratio **5.11**). Wrong mip, missing LUT, and an LDR-clipped env are visible failures. Photographs of those paths are photographs of **this** software rasterizer.

Cannot claim: NVIDIA / AMD / Intel hardware IBL units, real-time convolution cost, occupancy, or bandwidth. That seamless cubemap filtering on llvmpipe equals a discrete GPU. That `glGenerateMipmap` would have been a GGX chain (it is not; we did not call it). That distant \(E(\mathbf{n})\) is local multi-bounce GI. That linear roughness→mip is a solid-angle match. That an FFT or energy integral of an 8-bit sRGB JPEG is a spectrum of the signal. Discrete-GPU metrics, or “this is how the hardware works.”

Science path does not depend on `GALLIVM_PERF`: CPU latlong, CPU prefilter, CPU DFG.

---

## Assertions

This run: **25 pass / 0 fail**.

| check | result |
|---|---|
| Required gallery plates + CSV exist and are non-empty | PASS |
| DFG LUT range in \([-0.02,\,1.25]\) | PASS **[0, 1]** |
| DFG \(S(\mathbf{n}\cdot\mathbf{v}=1,\,r\approx 0)>0.70\), \(B<0.20\) | PASS **\(S=1.000\), \(B=0\)** |
| White-env Karis prefilter energy at \(r=0.05,0.20,0.50,1.00\) within 8–12% of 1 | PASS **all 1.000** |
| Flank crop: full luma \(>1.08\times\) spec-only | PASS **ratio 5.11** |
| Env mean luma in \((0.15,\,25)\) | PASS **1.628** |
| \(+Z\) prefilter luma variance decreases with mip | PASS **70.9 → … → 0** |
| Metal highlight RMS grows on the first ladder rungs | PASS **5.08 → 48.2** |
| Cube upload not `fail` | PASS **RGBA16F** |

No assert tolerances were loosened for the photoreal plates.

---

## Out of scope

Local path-traced GI, photon maps, irradiance caching of *scene* bounce. DDGI, lightmaps, SSGI/SSR as a substitute for the cube. Multi-bounce local solvers of any kind. Anisotropic GGX, Toksvig AA of the NDF, sheen, clearcoat, layered metals. Area lights / LTC. Deep tone-map bake-off (TM is one named operator). Shadow-map bias. Real-time convolution on a “hardware IBL unit.” Re-deriving the mipmaps chirp, the anisotropic ellipse, or the POM height march: cite continuity; this is a BRDF-integral approximation, not a new sampler and not new geometry.

Album sequence:

1. Perspective-correct — *what* you interpolate
2. Z-fighting — *how* depth is encoded
3. Mipmaps — *which frequencies survive* an isotropic minify
4. Anisotropic — *which UV ellipse* that pixel covers
5. Parallax occlusion — *fake depth from a height field*; the silhouette is still the quad
6. **Split-sum IBL** — *environment lighting as a multiply*: GGX-prefiltered cube \(\times\) DFG, plus distant \(E(\mathbf{n})\)

---

## Fragment lock

```glsl
float lod = rough * uMaxMip;                 // linear: r * (mips-1)
vec3 pre  = textureLod(uPrefilter, R, lod).rgb;
vec2 dfg  = texture(uDFG, vec2(Nv, rough)).rg;
spec = pre * (F0 * dfg.x + vec3(dfg.y));     // Karis split
// kD = (1-F)*(1-metal);  diff = kD * albedo/PI * E(n)
```

Prefilter writes every mip. Irradiance is one low-res cube. DFG does not see \(L_i\). Pin the hero as the presentation. Pin the three-up as the GI-control photograph. Pin the mip strip plus the DFG LUT plus the roughness→mip map as the unique artifacts. The formula is the caption. Distant \(E(\mathbf{n})\) is why the ceramic flanks filled, and why the brass stayed black without a diffuse body.
