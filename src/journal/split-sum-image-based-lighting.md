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

The last note covered tangent-space height marching to make a flat quad read as carved brick, though the silhouette remained completely flat. This note shifts focus away from samplers. Instead, an HDR environment is folded into two specific tables: a GGX-prefiltered specular cube and a DFG lookup table (LUT). The fragment shader simply multiplies them. **Split-sum makes environment lighting display-ready.** Here, toggling irradiance acts as our GI-**shaped** control—providing distant environment fill rather than local multi-bounce illumination.

![Cream stoneware bottle and brass sphere on board-formed concrete, loft window behind, full split-sum. Metal carries sharp mullions; glaze picks up a dim rim and colored fill. Khronos PBR Neutral, exposure 1.05. Photograph only — no energy metric.](/assets/journal/ibl-split-sum/00_hero.jpg)

We placed cream stoneware and measured brass on a shadow catcher, backed by a loft window under full split-sum lighting. The metal accurately reflects sharp mullions. The ceramic glaze picks up a dim rim and colored fill from the room itself, rather than relying on a flat ambient term. The HUD notes `Khronos PBR Neutral  exposure=1.05`, `distant environment irradiance, not local multi-bounce GI`, and `photo-only - no metric`. This is a photograph; do not try to hang an energy number on it.

![Same camera, same exposure, three shaders. Left SPEC IBL ONLY: ceramic flanks dark; brass still shows the window. Middle IRRADIANCE ONLY: ceramic fills; brass black (kD=0). Right FULL SPLIT-SUM. Distant environment ambient, not local multi-bounce GI.](/assets/journal/ibl-split-sum/01_gi_control.jpg)

Using the same camera and exposure, we compare three shader configurations. On the left (**SPEC IBL ONLY**), the ceramic flanks go dark, though the brass still reflects the window. In the middle (**IRRADIANCE ONLY**), the ceramic fills with light, but the brass renders black because $k_D=0$. On the right (**FULL SPLIT-SUM**), we see the complete distant environment ambient contribution—again, this is not local multi-bounce GI.

We rendered the hero shot using Mesa 25.0.7 llvmpipe in a linear working space. The tone mapper is **Khronos PBR Neutral** at an exposure of **1.05**. The white-env Karis prefilter energy measures exactly **1.000** at roughness keys $r=0.05,\,0.20,\,0.50,\,1.00$. Evaluating the DFG LUT at $\mathbf{n}\cdot\mathbf{v}=1$ and $r\approx 0$ yields $S=\mathbf{1.000}$ and $B=\mathbf{0}$. The flank crop's linear full-to-spec-only luma ratio is **5.11**. The environment's solid-angle mean luma sits at **1.628**. The test suite reports **25 pass / 0 fail** for assertions.

---

## What you are seeing

The lighting environment is an authored HDR loft—a procedural latlong rather than a captured EXR. It features plaster, baseboards, timber-style beams, a warm floor, offset backdrop sashes, and a key $+Z$ factory window with jambs and a 4×5 mullion grid. There are no analytical key lights acting on the hero plates; the environment alone provides the illumination.

**Presentation hook.** This is a $1920\times 1080$ product still photographed in GL with CPU tone mapping. It showcases glazed ceramic (a dielectric with $F_0=0.04$ and a glaze roughness between $0.14$ and $0.30$) alongside measured brass with $F_0=(0.910,\,0.778,\,0.423)$. Both rest with a soft planar contact on the shadow catcher. This plate is strictly photographic.

**GI-shaped control.** We set up a three-up $1920\times 820$ comparison using the identical camera (`eye (1.30, 0.54, 1.98) → (0.05, 0.25, 0.02)`, fov $30^\circ$) and objects. The metals stay black in the middle panel, which is an intentional outcome of the model, not a bug. The linear flank crop of the ceramic (comparing spec-only against full) acts as our meter to prove irradiance is functioning, even though the JPEG remains a photograph.

Walk the three panels:

* **Spec IBL only.** The conductor successfully lives on a prefiltered cube, reflecting the window, frame, and a strip of the interior. The dielectric cannot do this; its $F_0=0.04$ leaves the main body dark, resembling a studio void.
* **Irradiance only.** The distant-environment $E(\mathbf{n})$ fills out the ceramic. The brass is pitch black because $k_D=0$. There is no local object bounce, no bottle-reflected-in-sphere, and no floor color bleeding onto the metal.
* **Full split-sum.** We combine the specular cube $\times$ DFG with the irradiance. This generates the final plate that passes for a product shot.

![Brass roughness ladder, six rungs r∈{0.05, 0.18, 0.32, 0.48, 0.68, 1.00}. Smooth metal still shows mullions; the lobe widens; highlight tints with F0. Photograph only — no metric.](/assets/journal/ibl-split-sum/02_metal_roughness.jpg)

**Conductor ladder.** We evaluate measured brass across six roughness rungs $r\in\{0.05,\,0.18,\,0.32,\,0.48,\,0.68,\,1.00\}$. By keeping this albedo-only, the rung roughness serves as the sole control variable. The smooth metal cleanly reflects the mullions. As roughness increases, the specular lobe widens and the highlight tints with $F_0$. The material body remains accurate without suffering from an irradiance-albedo mix-up, driven by `lod = roughness * (mips-1)`. This is photographic only.

![Dielectric F0=0.04 cream roughness ladder, same six rungs. Grazing Fresnel remains as roughness climbs (the DFG). Photograph only.](/assets/journal/ibl-split-sum/03_dielectric_roughness.jpg)

**Dielectric ladder.** Using the same six rungs, we test a cream albedo dielectric with $F_0=0.04$. Thanks to the DFG, the grazing Fresnel effect appropriately remains even as roughness climbs. This uses the exact same environment, exposure, and tone mapping as the metal ladder. This is photographic only.

Keep these two domains strictly separate:

1. **Beauty plates** (including heroes, ladders, failures, and the calibration strip) are GL-rendered split-sum outputs. They use Khronos PBR Neutral at exposure 1.05 before receiving an sRGB OETF. The HUD marking `photo-only` means you should not attempt to reverse-engineer a GL energy theorem from the JPEG.
2. **Instruments** (the mip strip, spp residual, DFG LUT, roughness→mip map, and CSV data) are explicit CPU tables. They measure the Karis prefilter, DFG integration, white-env energy, mip variance, and the 64-spp vs 512-spp RMSE.

---

## Why: the reflection integral, then Karis

Our working space is strictly **linear radiance**. Cubemaps remain linear, and the tone map acts purely as a named display step applied after shading, rather than being baked into the tables.

### Reflection equation (specular)

$$L_o(\mathbf{v}) = \int_{\Omega} L_i(\mathbf{l})\, f_r(\mathbf{l},\mathbf{v})\, (\mathbf{n}\cdot\mathbf{l})\, \mathrm{d}\omega_l.$$

Microfacet specular (Cook–Torrance) is defined as:

$$ f_r = \frac{D(h)\,F(\mathbf{v},h)\,G(\mathbf{l},\mathbf{v})} {4\,(\mathbf{n}\cdot\mathbf{l})\,(\mathbf{n}\cdot\mathbf{v})}. $$

The NDF is an **isotropic GGX / Trowbridge–Reitz**. Note that $\alpha=r^2$ applies strictly to the NDF:

$$D(h) = \frac{\alpha^2}{\pi\bigl((\mathbf{n}\cdot h)^2(\alpha^2-1)+1\bigr)^2}, \quad \alpha=r^2.$$

Computing a full hemisphere of HDR samples against that BRDF for every fragment provides the ground truth reference. Production environments cannot afford to do that.

### Split-sum (Karis / UE4-style)

Instead, we factor the integral into **prefiltered incident radiance** (which depends on $L_i$ and roughness, but ignores $F_0$) and a **view-dependent BRDF integral** computed against a white environment (which depends on $\mathbf{n}\cdot\mathbf{v}$ and roughness, but ignores $L_i$):

$$L_o(\mathbf{v}) \;\approx\; L_{\mathrm{prefilter}}(\mathbf{R},r) \cdot \bigl(F_0\,S(\mathbf{n}\cdot\mathbf{v},\,r)+B(\mathbf{n}\cdot\mathbf{v},\,r)\bigr),$$

with $\mathbf{R}=\mathrm{reflect}(-\mathbf{v},\mathbf{n})$. This multiplication is the core production trick. This note documents the visual results and explicitly names the two stored tables.

### Term A — prefiltered radiance

This term is stored across cubemap mips. We use standard Karis weighting where $V=N=R$, omitting the second $G$ in the prefilter:

$$L_{\mathrm{prefilter}}(\mathbf{R},r) = \frac{ \int_{\Omega} L_i(\mathbf{l})\,D_{r}(h)\,(\mathbf{n}\cdot\mathbf{l})\,\mathrm{d}\omega_l }{ \int_{\Omega} D_{r}(h)\,(\mathbf{n}\cdot\mathbf{l})\,\mathrm{d}\omega_l }.$$

We importance-sample the GGX NDF in half-vector space, reflect to $\mathbf{l}$, and weight the result by $\mathbf{n}\cdot\mathbf{l}$. A constant environment where $L_i=1$ must precisely return **1**. This validates the white-env energy row, measuring **1.000** at our four key roughness levels.

For this run, our specular cube is **128** square with **8** mips. These are CPU-authored and uploaded strictly per level; `glGenerateMipmap` is **not** called. The production sample count is 64 spp (doubled on coarser mips). A separate **512** sky cube for the backdrop (mip0 only, `GL_LINEAR`) remains entirely decoupled from the GGX chain.

### Roughness \(\to\) mip (linear, stated)

$$\lambda(r)=r\cdot(\lambda_{\max}), \quad \lambda_{\max}=\mathrm{mips}-1.$$

Given eight mips, we use $\lambda=7r$. This is explicitly **not** a GGX solid-angle match. It remains the default mapping simply to ensure the roughness ladder is visually readable. The shader implementation is `lod = rough * uMaxMip`.

### Term B — DFG / EnvBRDF LUT

This 2D LUT uses $X=\mathbf{n}\cdot\mathbf{v}$ and $Y=$ roughness to handle single-scatter integration. The Schlick $F$ equation is split into a base $F_0$ and the white-Fresnel remainder. We use Smith–GGX IBL geometry where:

$$k_{\mathrm{IBL}}=\frac{r^2}{2}.$$

The LUT RGB channels store the `(scale, bias)` result of integrating against a white environment; the actual environment cubemap never enters this specific table.

$$I_{\mathrm{BRDF}}=F_0\cdot S(\mathbf{n}\cdot\mathbf{v},\,r)+B(\mathbf{n}\cdot\mathbf{v},\,r).$$

Dielectrics use $F_0=0.04$. Conductors use their linear RGB albedo for $F_0$ (in this case, measured brass without a dielectric coat). At $\mathbf{n}\cdot\mathbf{v}=1$ and $r\approx 0$, the values converge to $S\to 1$ and $B\to 0$. Our CSV confirms $S=0.999984$ and $B=0$, mapping cleanly to a LUT range of **[0, 1]**.

### Distant irradiance (the locked GI control)

We evaluate the Lambertian diffuse component as:

$$L_{\mathrm{diffuse}} = \frac{\rho}{\pi}\,E(\mathbf{n}), \quad E(\mathbf{n}) = \int_{\Omega} L_i(\mathbf{l})\,(\mathbf{n}\cdot\mathbf{l})\,\mathrm{d}\omega_l,$$

where $k_D=(1-F)(1-\mathrm{metal})$ ensures metals do not improperly pick up a diffuse body term. The term $E$ represents a low-frequency irradiance cubemap derived from the **same** distant environment. In this run, we use a **64** square cube evaluated at **192** spp cosine. We apply a 3-pass $3\times 3$ blur exclusively on mip0 to prevent window mullions from reprinting as wood grain artifacts on Lambertian flanks. The specular mips remain unblurred.

**Honesty line:** The irradiance shown here is purely distant environment lighting preintegrated over the hemisphere. It absolutely is not local multi-bounce GI, path tracing, DDGI, lightmaps, or SSGI.

Toggling this on and off produces the three-up comparison seen earlier. We applied no additional directional fill on the hero asset.

### Display

$$L_{\mathrm{display}}=\mathrm{TM}\bigl(\mathrm{expose}(L_o)\bigr) \quad\text{then sRGB OETF.}$$

Our Tone Mapper (TM) is **Khronos PBR Neutral**, accepting linear input and providing linear display-referred output. The exposure sits at **1.05**, matched identically across every comparison row. The tone map is **not** baked into the cubemaps. We keep `GL_FRAMEBUFFER_SRGB` disabled and handle the sRGB encoding entirely on the CPU.

---

## Unique artifacts: the mip strip, the LUT, the map

![CPU GGX prefilter, +Z face, mip 0…7. Mip0 is a 4×5 factory window; mullions dissolve into the lobe. Not glGenerateMipmap. Luma variance 70.9 → … → 0.](/assets/journal/ibl-split-sum/04_prefilter_mips.jpg)

This visual is the primary reason this note exists. It displays the CPU GGX prefilter on the $+Z$ face across mips $0\ldots 7$, mapping roughness $=$ mip $/$ (mips$-1$). Mip0 clearly shows the 4×5 factory window and its dark frames. In successive mips, the mullions accurately dissolve into the specular lobe. Caption: `not glGenerateMipmap`. The $+Z$ luma variance serves as a reliable monotone blur meter, reading: **70.9 → 43.9 → 23.3 → 9.34 → 3.54 → 2.33 → 0.76 → 0**.

![64 spp vs 512 spp at r=0.25/0.50/0.80, +Z, plus relative-error heatmap. RMSE 0.777 / 1.045 / 1.465. CPU both sides. Instrument.](/assets/journal/ibl-split-sum/05_prefilter_vs_ref.jpg)

This is a sample-count instrument calculated on the CPU for both sides. We compare the production 64 spp against a **512** spp reference at $r=0.25/0.50/0.80$ on the $+Z$ face at $32^2$ resolution, including a relative-error heatmap. The RMSE is **0.777 / 1.045 / 1.465**. Note that this compares a 64-spp production pass against a 512-spp pass on a high-contrast HDR window featuring a bright sun disc; it is not comparing a production mip against an analytic ground truth, nor is it a GL filtering theorem. Residual fireflies are fully expected at 64 spp.

![DFG scale S and bias B, 128², CPU GGX. Axes: N·V × roughness. Face-on smooth corner: S≈1, B=0.](/assets/journal/ibl-split-sum/06_dfg_lut.jpg)

This illustrates the scale $S$ and bias $B$ for a $128^2$ LUT calculated via CPU GGX at 64 spp. The axes follow $I_{\mathrm{BRDF}} = F_0 \cdot S(\mathbf{n}\cdot\mathbf{v},\,a) + B(\mathbf{n}\cdot\mathbf{v},\,a)$ for a single-scatter approximation. The smooth, face-on corner visually aligns with our CSV row metrics: $S\approx 1$ and $B=0$.

![Linear λ(r)=r·(mips−1) plot plus mip thumbnails of the same +Z window. Not a solid-angle match; the ladder stays readable.](/assets/journal/ibl-split-sum/07_roughness_mip.jpg)

Here we plot $\lambda(r)=r\cdot(\mathrm{mips}-1)$ alongside mip thumbnails of the same $+Z$ window. Caption: not a solid-angle match; the ladder stays readable. The GGX alpha parameter ($\alpha=r^2$) lives firmly within the NDF, not in this mapping.

---

## Quote the CSV. Do not quote the beauty photographs as energy.

Photoreal gallery, Mesa llvmpipe:

| metric | theory / gate | measured | note |
| --- | --- | --- | --- |
| white-env energy $r=0.05,0.20,0.50,1.00$ | 1 | **1.000** all four | Karis prefilter, constant $L_i=1$ |
| DFG $S(\mathbf{n}\cdot\mathbf{v}=1,\,r\approx 0)$ | $>0.70$ | **0.999984** | sampled at $r=0.045$ (shader clamp) |
| DFG $B$ same cell | $\sim 0$ | **0** |  |
| flank luma spec-only | n/a | 0.134657 | linear crop, not the JPEG |
| flank luma full | n/a | 0.688492 | linear crop |
| flank ratio full / spec | $>1.08$ | **5.112927** | irradiance on vs spec-only |
| env mean luma | HDR in $(0.15,\,25)$ | **1.628385** | solid-angle weighted latlong |
| prefilter RMSE $r=0.25/0.50/0.80$ | n/a | **0.777 / 1.045 / 1.465** | prod spp vs 512 spp, $+Z$ |
| metal highlight RMS $r=0.05\to 0.18$ | grows | **5.08 → 48.2** | linear render; then saturates |
| $+Z$ luma variance mips $0\ldots 7$ | decreasing | **70.9 → … → 0** | monotone blur meter |

The hero paragraph relies on these rounded values: energy **1.000**; $S=\mathbf{1.000}$, $B=\mathbf{0}$; flank ratio **5.11**; env luma **1.628**. The ratio clearly remains $\gg 1$. Do **not** invent a GL energy or RMSE theorem based on the hero images or the roughness ladders. Those frames are explicitly labeled `photo-only`.

Highlight RMS predictably grows on the first metal rungs, but quickly saturates once the specular lobe covers the sphere ($r\gtrsim 0.32$: 54.1, 46.9, 39.2, 39.2). Beyond that point, lobe width ceases to be a useful tracking metric. Mip variance remains a reliable gauge.

---

## Failures / controls

### Wrong mip

![Failure: force mip0 on rough (sparkly sandpaper) | correct | force max mip on smooth (pewter blob). Photograph only.](/assets/journal/ibl-split-sum/08_wrong_mip.jpg)

On the left, we force mip0 on a material with roughness $0.75$. The result looks like sparkly sandpaper because the high-frequency window details remain entirely intact. In the middle, we apply the correct $\lambda$ for the same roughness. On the right, we force the max mip on a smooth material (roughness $0.08$), turning it into a pewter blob. A highly smooth conductor was inappropriately given the roughest available table. Photo only. While the metal ladder represents our honest map, this plate demonstrates the failure mode.

### No DFG LUT (\(F=1\))

![Failure: F=1 (no DFG) washes metals grey vs split-sum F0·S+B. Photograph only.](/assets/journal/ibl-split-sum/09_no_lut.jpg)

Using the same prefilter cube and exposure, the left panel skips the LUT entirely, outputting the prefiltered radiance as if $F=1$. The metals wash out to grey, the brass $F_0$ coloration vanishes, the dielectric loses its grazing rim, and overall body energy becomes incorrect. The right panel correctly applies $F_0 S+B$. Photo only.

### LDR clip vs HDR

![Failure: clipped Li≤1 env vs float HDR, same TM. Window highlight and interior collapse on the left. Photograph only.](/assets/journal/ibl-split-sum/10_ldr_vs_hdr.jpg)

Under identical tone mapping and exposure settings, the left panel demonstrates an environment incorrectly authored with $L_i\le 1$ prior to prefiltering. The bright window highlight and the interior details both collapse entirely, causing the metal to lose its visual punch. The right panel uses the proper float HDR environment. Because tone mapping is not baked into the cubemaps, clipping the *source* data constitutes a catastrophic failure. Photo only.

### Instrument strip (not a hero)

![Calibration balls: smooth metal / rough metal / Lambertian with spec off. Not the product shot.](/assets/journal/ibl-split-sum/11_instrument_spheres.jpg)

This strip shows smooth metal, rough metal, and a Lambertian surface with specular disabled. Caption: calibration balls, not the product shot. Photo only. If we used this as the cover image, the post would look like a generic void-sphere demo.

---

## Two paths, do not mix the instruments

| path | frames | instrument |
| --- | --- | --- |
| **Science** | mip strip, spp residual, DFG LUT, roughness→mip, CSV, white-env energy, mip variance, RMSE | CPU latlong, CPU Karis prefilter, CPU cosine irradiance, CPU DFG. Image is visualization of those buffers after the same TM. |
| **Photograph** | heroes, ladders, failures, calibration strip | GLSL 330 split-sum on this llvmpipe: `textureLod` of the CPU mips, DFG 2D, irradiance cube. HUD `photo-only`. Flank luma and metal RMS are linear-FBO crops, not JPEG theorems. |
| **Display** | every plate | expose $1.05$ → Khronos PBR Neutral → sRGB OETF. One operator, every row. |

The GI-control three-up acts simultaneously as a photographic demonstration of the control parameter *and* the visual source for the flank-ratio CSV row. Always quote the CSV data. Do not attempt to pull an 8-bit panel value and quote it as 5.11.

---

## Honesty gaps

1. **Distant-environment irradiance $\neq$ local GI.** The system simulates no bottle-to-brass bounce, no floor color bleeding into the metal, and features no path tracing, DDGI, lightmaps, or SSGI. Metals render black in the irradiance-only panel simply because $k_D=0$.
2. **Single-scatter split-sum.** We lack multi-scatter energy compensation. Grazing metals can artificially pick up a white-ish bias term from the LUT.
3. **Roughness→mip is linear.** We mapped $\lambda=r\cdot(\mathrm{mips}-1)$, completely bypassing a proper GGX solid-angle match.
4. **Prefilter RMSE** evaluates 64-spp against 512-spp at matched roughness levels on an HDR window. It does not compare a production mip against an analytic baseline. The bright sun disc inevitably causes residual fireflies yielding an RMSE between 0.777 and 1.465. This is a documented limitation, not a GL filtering theorem.
5. **Highlight RMS** predictably grows on the first metal rungs before saturating. We rely on mip variance as the true monotone blur meter.
6. **Irradiance blur** introduces a 3-pass presentation filter to $E(\mathbf{n})$ solely to prevent mullions from reprinting as wood grain patterns on dielectrics. The specular prefilter mips remain untouched and unblurred.
7. **Contact** relies on a planar cosine term rather than proper shadow maps or ray tracing.
8. **Env** utilizes a procedural loft HDR rather than a captured EXR, exhibiting a solid-angle mean luma of **1.628**.
9. **Cubemap sampling** runs on llvmpipe RGBA16F with CPU-authored mips. While we request seamless cubemap filtering, face-edge quality remains a known Mesa caveat.
10. **No hardware IBL unit** is present, and we make no claims regarding real-time convolution costs. Prefilter, irradiance, and DFG calculations are strictly CPU-bound.
11. **Residual turned-form spec bands** appearing on the bottle simply reflect the loft windows wrapping across a surface of revolution. This is milder than a marble-chalk urn, not evidence of a rogue second lobe.
12. **JPEG is visualization.** The true measurements exist in the CSV. Do not FFT or energy-integrate the beauty frames.

---

## Mesa / llvmpipe — what this run can claim

| item | value |
| --- | --- |
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| FBO color | **RGBA32F** complete, photo $1920\times 1080$ |
| Specular / irradiance / sky cubes | **RGBA16F**, CPU mips uploaded per level |
| `glGenerateMipmap` | **not** called on the specular chain |
| DFG LUT | RGBA32F $128^2$, CPU GGX |
| `GL_FRAMEBUFFER_SRGB` | disabled (TM + sRGB on CPU) |
| MSAA | disabled |
| `GL_TEXTURE_CUBE_MAP_SEAMLESS` | enabled |
| Exposure / TM | **1.05** / **Khronos PBR Neutral** |

What this run *can* claim: Running on this OSMesa / llvmpipe build, a CPU Karis GGX prefilter processing an authored HDR loft properly conserves white-env energy (**1.000** at all four roughness keys). The CPU DFG LUT accurately targets $S\approx 1$ and $B=0$ at the face-on smooth corner. A GLSL 330 split-sum shader multiplying these tables with a distant-environment irradiance cube reliably produces the provided photographs. Disabling irradiance demonstrably darkens dielectric flanks, yielding a linear crop ratio of **5.11**. Introducing the wrong mip, missing the LUT entirely, or applying an LDR-clipped environment produces obvious, visual failures. Photographs of these failure paths serve as accurate visual documentation of **this** specific software rasterizer.

What this run *cannot* claim: It makes no assertions regarding NVIDIA, AMD, or Intel hardware IBL units, nor does it address real-time convolution costs, occupancy, or bandwidth efficiency. We do not claim that llvmpipe's seamless cubemap filtering matches discrete GPU quality. We cannot assert that `glGenerateMipmap` would successfully create a valid GGX chain, because it does not, and we intentionally avoided calling it. Furthermore, we do not claim that distant $E(\mathbf{n})$ equates to local multi-bounce GI, or that our linear roughness→mip mapping acts as a solid-angle match. Finally, applying an FFT or energy integral against an 8-bit sRGB JPEG is not a valid method for determining the spectrum of the signal. We offer no discrete-GPU metrics or definitive statements on "how the hardware works."

Importantly, the science path remains completely independent of `GALLIVM_PERF`, relying purely on a CPU latlong, CPU prefilter, and CPU DFG.

---

## Assertions

This run logged: **25 pass / 0 fail**.

| check | result |
| --- | --- |
| Required gallery plates + CSV exist and are non-empty | PASS |
| DFG LUT range in $[-0.02,\,1.25]$ | PASS **[0, 1]** |
| DFG $S(\mathbf{n}\cdot\mathbf{v}=1,\,r\approx 0)>0.70$, $B<0.20$ | PASS **$S=1.000$, $B=0$** |
| White-env Karis prefilter energy at $r=0.05,0.20,0.50,1.00$ within 8–12% of 1 | PASS **all 1.000** |
| Flank crop: full luma $>1.08\times$ spec-only | PASS **ratio 5.11** |
| Env mean luma in $(0.15,\,25)$ | PASS **1.628** |
| $+Z$ prefilter luma variance decreases with mip | PASS **70.9 → … → 0** |
| Metal highlight RMS grows on the first ladder rungs | PASS **5.08 → 48.2** |
| Cube upload not `fail` | PASS **RGBA16F** |

We loosened no assertion tolerances to achieve the photoreal plates.

---

## Out of scope

This note strictly ignores local path-traced GI, photon maps, or irradiance caching for *scene* bounce. We do not use DDGI, lightmaps, or SSGI/SSR as substitutes for the cubemap. Multi-bounce local solvers of any variety are entirely out of scope. We also skip anisotropic GGX, Toksvig AA for the NDF, sheen, clearcoat, layered metals, and Area lights/LTC. You will not find a deep tone-map bake-off here; TM acts strictly as one named operator. Shadow-map bias and real-time convolution on dedicated "hardware IBL units" are excluded. Finally, we do not re-derive the mipmaps chirp, the anisotropic ellipse, or the POM height march. We merely cite continuity; this technique is a BRDF-integral approximation, not a novel sampler or geometric breakthrough.

---

## Fragment lock

```glsl
float lod = rough * uMaxMip;                 // linear: r * (mips-1)
vec3 pre  = textureLod(uPrefilter, R, lod).rgb;
vec2 dfg  = texture(uDFG, vec2(Nv, rough)).rg;
spec = pre * (F0 * dfg.x + vec3(dfg.y));     // Karis split
// kD = (1-F)*(1-metal);  diff = kD * albedo/PI * E(n)
