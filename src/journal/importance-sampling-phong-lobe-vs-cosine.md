---
title: "Importance Sampling: Phong Lobe vs Cosine"
description: "Same integral, two pdfs, one N. At N=64 s=32, RMSE_H cosine 7.655620 vs Phong 1.999657; RMSE_S 0.140667 vs 0.824834. Cosine fireflies the crescent; Phong starves the surround."
date: 2026-09-20
tags:
  - graphics
  - engine
  - lighting
math: true
cover: /assets/journal/importance-sampling-phong-lobe-vs-cosine/00_hero.jpg
---

Our previous notes focused on correspondence: color clamping checks whether history looks legal, and depth rejection determines whether it is the same surface. Time constraints are out of scope here. While split-sum approaches have already hidden the samples within a prefilter cube $\times$ DFG LUT—allowing production pipelines to simply multiply two tables—this note unhides the estimator. Tone mapping remains inherited, applying Khronos PBR Neutral after resolve rather than re-fitting. This piece is strictly about Monte Carlo sampling mismatch. It is not about VNDF, it is not a MIS bake-off, and it is not a split-sum refresher.

**Same integral, two pdfs, one $N$.** A cosine-weighted hemisphere is the standard approach for Lambertian surfaces. A Phong cosine-power lobe oriented around the reflection vector $R=\mathrm{reflect}(-\omega_o,n)$ is the right tool for highlights. However, on a sharp dielectric surface, these two approaches are fundamentally not interchangeable.

![Gallery spotlight: lacquer dielectric sphere on a short dark-stone plinth, dark slate wall, recessed canvas, painted picture rail. Phong-IS, N=256, s=32. Khronos PBR Neutral. Felt wall sparkles — Lambert sampled by a Phong lobe. Photograph only — no RMSE.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/00_hero.jpg)

To demonstrate this, we introduce a new photographic setup: a gallery spotlight. The scene features a lacquer dielectric sphere resting on a short dark-stone plinth, backed by a dark slate wall, a recessed canvas, and a painted picture rail. Rendered with Phong-IS at $N=256$ and $s=32$, the HUD reads: `Khronos PBR Neutral`, `PHOTO-ONLY`, `Phong-IS  N=256  s=32`. Do not attempt to evaluate $\mathrm{RMSE}_H$ based on this photograph. Notice how the felt wall sparkles; this occurs because a Lambertian surface is being sampled by a tight Phong lobe. This is Failure B shown on the cover, not a denoiser miss. A clean, fully converged version of this gallery is provided as a reference plate below.

![Teaching pin. Same view, same N=64, same seed stream. Uniform | cosine | Phong-IS. Only p differs. Wedge crop of the highlight crescent under each column. Photograph only.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/01_3up.jpg)

**Pin this comparison.** It displays the exact same view, rendered at the same $N=64$ using an identical seed stream. The columns represent **Uniform | cosine | Phong-IS**. Only the pdf $p$ differs between them. The plate includes a wedge crop isolating the highlight crescent beneath each column, captioned: *same view, same N=64, same seed, only p differs*. This is a photograph only.

This sequence was generated using Mesa 25.0.7 llvmpipe in linear Rec.709, tone-mapped with **Khronos PBR Neutral** ($e=\mathbf{1.00}$). The random seed is **329363537**, and the key light has an angular radius of **3.600°**. At $N=64$ and $s=32$, the cosine $\mathrm{RMSE}_H$ is **7.655620**, whereas Phong-IS drops to **1.999657** (passing the condition: phong $<$ cosine). Conversely, the surround's $\mathrm{RMSE}_S$ demonstrates the drawback of Phong-IS: cosine sits at **0.140667** while Phong-IS degrades to **0.824834**—an honest look at how it starves the diffuse surround. Firefly counts ($k=4$) are **21536** for cosine versus just **1653** for Phong. The regions of interest are $\mathrm{ROI}_H=(502,391,555,432)$ and $\mathrm{ROI}_S=(349,133,613,319)$. Overall, the test suite reports **24 pass / 0 fail**.

---

## Two questions, two pdfs

The underlying integral remains perfectly constant. The lighting, geometry, camera, BRDF, exposure, and per-pixel $\xi$ stream are completely unchanged. **Only $p(\omega)$ changes.** Variance is what defines the resulting photograph.

**Cosine.** Does the sampled direction match Lambert $\times$ the projected hemisphere?

**Phong-IS.** Does the sampled direction match the cosine-power highlight oriented around the *reflection vector* $R$? Note that this is not about the half-vector, Blinn, or GGX-VNDF.

On a lacquer dielectric under a **3.600°** gallery disk light, these two PDFs yield vastly different results. Cosine sampling wastes almost every sample outside the primary lobe. When a sample *does* manage to hit the small key light, the incoming radiance $L_i$ is enormous, but the probability $p_c$ is only $(n\cdot\omega)/\pi$. This creates a lottery-ticket effect, resulting in severe fireflies. In contrast, Phong-IS centers its inverse-CDF directly on $R$, which elegantly cleans up the highlight crescent. However, the flanking diffuse areas do not automatically receive the same benefit.

A uniform hemisphere ($p=1/(2\pi)$) acts as a loud, inefficient third option: a generic hemisphere sample does not equate to cosine importance sampling. At $N=64$ and $s=32$, uniform sampling yields an $\mathrm{RMSE}_H=\mathbf{9.900829}$ compared to cosine's $\mathbf{7.655620}$, and a variance ($\mathrm{var}_H$) of $\mathbf{90.04}$ versus $\mathbf{56.93}$. It is simply not a valid replacement for cosine. Looking at the firefly *count* in that same row, cosine hits **21536**, uniform hits **14400**, and Phong-IS drops to **1653**. When discussing the visual noise and ranking these methods, always quote $\mathrm{RMSE}_H$ rather than just the firefly count.

The core scientific claim here is narrow but vital: **pdf–integrand mismatch manifests as a measurable variance, not merely an aesthetic preference**. Cosine perfectly matches Lambert $\times$ the projected hemisphere, while Phong-IS perfectly matches a cosine-power highlight. Neither PDF can efficiently match both simultaneously.

Keep these two facts distinct and never mix them:

1. **Beauty plates** (including the hero image, 3-up comparisons, $N$ ladders, exponent tests, and surround crops) are generated via CPU Monte Carlo, then processed through Neutral and an sRGB OETF. A HUD reading `photo-only` means you should not attempt to extract RMSE, firefly counts, or $\mathrm{Y_{mean}}$ from the resulting JPEG. The 8-bit Neutral+sRGB pipeline inherently clips fireflies.

2. **Instruments** (such as the variance heat map, pdf rose, metrics strip, and reference image) evaluate the raw float buffer. These rely on linear Rec.709 $Y$ residuals, pdf roses, RMSE, fireflies, and horizon fractions. When discussing performance, always quote the metrics.

---

## Why: the estimator, then the two pdfs

Our working color space is **scene-referred linear Rec.709**. The domain is defined as $\Omega^+=\{\omega:n\cdot\omega>0\}$. Any samples falling below the horizon contribute **0** to the result, yet they still count toward the total $N$. Crucially, do **not** renormalize $p$ after rejecting a horizon sample.

### Same integral

$$L_o(\omega_o)=\int_{\Omega^+} f_r(\omega,\omega_o)\,L_i(\omega)\,(n\cdot\omega)\,d\omega.$$

### Unbiased solid-angle estimator

$$\hat L_o=\frac1N\sum_{k=1}^N\frac{f_r(\omega_k,\omega_o)\,L_i(\omega_k)\,(n\cdot\omega_k)}{p(\omega_k)}.$$

Every sampling arm utilizes the exact same $f_r$, $L_i$, camera, and geometry. The cosine term stays in the **numerator**. It is not folded into $p_p$.

### BRDF (Lambert + Lafortune-normalized Phong)

$$f_r(\omega,\omega_o)=\frac{\rho_d}{\pi}+\rho_s\frac{s+2}{2\pi}\,(\omega\cdot R)_+^{\,s}, \qquad R=2(n\cdot\omega_o)\,n-\omega_o.$$

We are evaluating a dielectric body, not a metal. For this run, the parameters are $\rho_d=(0.155,0.175,0.188)$, $\rho_s=0.12$, and a default of $s=32$. Using a purely metallic surface ($\rho_d=0$) would artificially hide Failure B.

The $(s+2)$ term acts as the **BRDF energy** constant, while $(s+1)$ is the **solid-angle pdf** constant. Mixing these up will bias $\hat L$. In our white-furnace assertion (where $L_i\equiv 1$ and the lobe is well above the horizon), we verify that $\hat L_o\approx\rho_d+\rho_s$ within a stated tolerance band. This is a scientific assertion, not a hero plate.

Note that there is no Fresnel, no GGX $D/G$, and no Smith terms applied. This post is not a product note about microfacet models.

### Pdfs (1/sr)

| Arm | Name | $p(\omega)$ | Inverse CDF |
| --- | --- | --- | --- |
| C | Uniform hemisphere | $1/(2\pi)$ on $\Omega^+$ | $\cos\theta=\xi_1$, $\varphi=2\pi\xi_2$, ONB around $n$ |
| A | Cosine hemisphere | $(n\cdot\omega)/\pi$ on $\Omega^+$ | $\cos\theta=\sqrt{\xi_1}$, $\varphi=2\pi\xi_2$, ONB around $n$ |
| B | Phong lobe about $R$ | $(s+1)/(2\pi)\,(\omega\cdot R)^s$ if $\omega\cdot R>0$, else $0$ | $\cos\theta=\xi_1^{1/(s+1)}$, $\varphi=2\pi\xi_2$, ONB around $R$ |

Phong sample generation occurs within the $R$-frame. If $n\cdot\omega\le 0$, the weight evaluates to $0$, and we increment `horizon_frac`. The RNG relies on a PCG integer hash, using the seed **329363537**.

### Light (analytic; no HDRI)

This scene utilizes 1-bounce direct lighting. We use a finite disk key light positioned upper-front-right, with an angular radius of **3.600°** from the highlight point and $\mathrm{disk}_r=0.1372$. The key light is warm: $L_{\mathrm{key}}=(980,880,720)$. To ensure the flanks and walls remain measurable, a dim cool fill light of $L_{\mathrm{fill}}=(1.20,1.38,1.62)$ is applied over $\Omega^+$.

The incoming radiance $L_i(\omega)=L_{\mathrm{key}}$ if the ray successfully hits the disk without being occluded by the sphere or plinth; otherwise, it evaluates to $L_{\mathrm{fill}}$. This note exclusively samples the **reflection pdf**. We do not sample the light pdf, nor do we employ MIS. Using a Dirac directional light would be mathematically invalid since hemisphere MC cannot hit a delta distribution, collapsing the experiment into Next Event Estimation (NEE). The tiny solid angle of the key light is precisely what causes cosine sampling to generate fireflies, and it highlights how a too-sharp $s$ value can miss the target entirely.

### Jacobian / solid angle

The inverse-CDF maps $(\xi_1,\xi_2)\in[0,1)^2$ to $\omega\in\mathbb{S}^2$. The $p$ detailed above is already expressed in solid angle, so do not multiply it by an extra $d\omega/d\xi$. A half-vector sampler *would* necessitate the $h\to\omega$ Jacobian mapping: $\partial\Omega_h/\partial\Omega_\omega=4(\omega\cdot h)$. That specific Jacobian is the reason Blinn or GGX-VNDF requires its own separate deep dive. We cite it here, but we do not derive it. While VNDF is the production standard for sampling this family of lobes, it is not part of this specific A/B comparison.

### Variance used on plates

All variance measurements operate in **linear Rec.709 $Y$**. They are scene-referred and never evaluated on a JPEG or after Neutral tone mapping is applied.

$$\mathrm{RMSE}_{\mathrm{ROI}} =\sqrt{\frac1{\lvert\mathrm{ROI}\rvert}\sum_{x\in\mathrm{ROI}}\bigl(Y(\hat L_N(x))-Y(L_{\mathrm{ref}}(x))\bigr)^2}.$$

We track two named ROIs, defined as inclusive pixel rectangles at our beauty resolution of $960\times 540$ (measured bottom-up):

* **H** — the highlight crescent painted by the key light: $(502,391,555,432)$.

* **S** — the diffuse flank, plinth, and foot: $(349,133,613,319)$.

Per-pixel variance of the mean (which does not require a reference image) is calculated as:

$$\widehat{\mathrm{Var}}(x)=\frac1{N(N-1)}\sum_{k=1}^N\bigl(X_k(x)-\bar X(x)\bigr)^2.$$

The heat plate visualizes $\lvert Y_{64}-Y_{\mathrm{ref}}\rvert$ in the turbo colormap, comparing cosine against Phong, utilizing the **same highlight-rim crop and a shared p98 scale**. Firefly count is calculated as $\#\{x:\vert{}Y_N-Y_{\mathrm{ref}}\vert{}>k\,Y_{\mathrm{ref}}\}$ with $k=4$ strictly on hit pixels. Whole-frame RMSE is relegated to a footnote because it averages H and S together, effectively obscuring the primary lesson of the post.

### Display (inherited, not re-derived)

$$L_{\mathrm{display}} = \mathrm{TM}\bigl(\mathrm{expose}(\hat L_o)\bigr) \quad\text{then IEC 61966-2-1 sRGB OETF for PNG.}$$

The Tone Mapping (TM) utilized is **Khronos PBR Neutral**, set to $e=1.00$, and frozen uniformly across arms A, B, and C. The constants are deliberately not re-fit. For further context, cite the [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) and [split-sum IBL](/posts/p/split-sum-image-based-lighting/) notes. `GL_FRAMEBUFFER_SRGB` is turned off, ensuring the encode happens on the CPU. All measurements strictly evaluate the float buffer, never the JPEG.

### Reference (not a sampling arm)

The reference $L_{\mathrm{ref}}$ is constructed from analytic Lambert $\times$ fill, plus Phong-IS of the specular component $\times$ fill (at 32 spp), plus **disk NEE** (at 96 spp). It utilizes an independent random seed: **1374605335**. Crucially, the standard testing arms never sample the light pdf. This hybrid approach is how we secure a high-$N$-quality reference image without forcing llvmpipe to churn through 4096 spp hemisphere MC. The reference plate visibly outlines ROI H and S, and it is not used as the cover image.

![Science reference. Disk NEE plus analytic Lambert fill. ROI H (highlight crescent) and ROI S (flank / plinth / foot) outlined. Not a sampling arm. Not the cover.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/09_ref.jpg)

---

## Teaching pin: three pdfs, one view

The 3-up comparison serves as our definitive policy check. It uses identical camera settings, geometry, materials, lights, exposure, an $N=64$ sample count, and the seed **329363537**. The only varying factor is $p$.

| Column | pdf | What the wedge does |
| --- | --- | --- |
| Uniform | $1/(2\pi)$ | Grain. No crescent. Highest $\mathrm{RMSE}_H$. |
| Cosine | $(n\cdot\omega)/\pi$ | Body fills. Rim still a lottery. |
| Phong-IS | $(s+1)/(2\pi)\,(\omega\cdot R)^s$ | Crescent appears. Surround goes dark. |

If viewing the full-frame columns casually leads you to think "Phong is universally better," the surround plate exists to correct that assumption. Trust the wedge crop to reveal Failure A, and trust the honesty crop to reveal Failure B. Always quote $\mathrm{RMSE}_H$ and $\mathrm{RMSE}_S$ directly from the metrics, rather than eyeballing the 8-bit panel.

---

## Unique artifact: variance heat on the highlight rim

![Unique artifact. False-color |Y_64−Y_ref|, linear Rec.709 Y, turbo. Cosine vs Phong-IS, same highlight-rim crop, shared p98 scale. Heat leaves the rim under Phong. Instrument — not PNG.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/04_var_heat.jpg)

This specific visualization is the reason this note exists. It displays a false-color $\lvert Y_{64}-Y_{\mathrm{ref}}\rvert$ map in linear Rec.709 $Y$ using the turbo colormap, featuring the **same rim crop and a shared p98 scale**. The HUD reads: `INSTRUMENT  FINGERPRINT`, `linear Rec.709 Y residual  not PNG`.

Under cosine sampling, heat intensely rings the crescent, creating a yellow-green residual blob peppered with red firefly speckles. When switching to Phong-IS, the heat entirely drops from that area—turning mostly blue with sparse specks—perfectly outlining a lobe that effectively received samples. As heat leaves the rim, it shifts onto the flank. That distinct swap is the fingerprint of the sampling mismatch. It is not just another RGB triangle or a DFG LUT remake.

![Instrument. Hemisphere overlay, linear pdf in 1/sr, turbo: cosine about n vs Phong about the same R, s=32. Polar insets under each. Not Blinn, not GGX VNDF.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/05_pdf_rose.jpg)

The pdf rose acts as our secondary scientific plate. It overlays the hemisphere with a linear pdf in 1/sr using the turbo colormap, comparing cosine about $n$ versus Phong about the exact same $R$ at $s=32$. Polar insets are provided beneath each. The plate's caption firmly notes: *not Blinn, not GGX VNDF.*. It is meant to sit beside the photograph and should never be used as the cover.

Always quote the metrics, never the JPEG.

---

## Ladders: $N$, then $s$

![Failure A. Cosine at N=4 / 16 / 64 / 256, same seed-stream prefixes. Fireflies decay slowly on the rim. Photograph only.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/02_cosine_ladder.jpg)

**Failure A.** We examine cosine at $N=4/16/64/256$, maintaining the same seed-stream prefixes. Fireflies decay remarkably slowly along the rim. By $N=256$, the body becomes quieter, but the crescent still fails to resolve into a clean Phong crescent. The $\mathrm{RMSE}_H$ progression is: **27.886635 / 15.989179 / 7.655620 / 3.837384**.

![Contrast. Phong-IS at the same N rungs, matching pdf. Rim cleans earlier. Surround stays dark with sparkles. Photograph only.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/03_phong_ladder.jpg)

**Contrast.** Applying Phong-IS at the exact same $N$ rungs with a matching pdf shows the rim cleaning up much earlier. The crescent is easily readable by $N=16$ and grows exceptionally tight at 64 and 256. Meanwhile, the surround stays dark and retains its sparkles—meaning Failure B is riding right along with it. The $\mathrm{RMSE}_H$ progression is: **8.377738 / 4.037456 / 1.999657 / 1.010789**.

![Exponent control. Phong-IS, fixed N=64, s=8 / 32 / 128, matching pdf. Wide ≈ cosine on H; sharp starves the s=32 crescent and S. Photograph only.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/06_exponent.jpg)

**Exponent control.** Holding Phong-IS fixed at $N=64$, we test exponents of $s=8/32/128$ with a matching pdf. A wide lobe roughly approximates cosine on H (at $s=8$, $\mathrm{RMSE}_H=1.783442$, which still outperforms cosine). The default $s=32$ serves as our successful pass plate. A sharp $s=128$ evaluated against this **3.600°** key light yields an $\mathrm{RMSE}_H=7.367447$. Because ROI H isolates the $s=32$ crescent, the sharper exponent starves the extra rim area. This demonstrates exponent control, not a failed pass predicate. Pushing $s$ too high also severely degrades S.

Do not attempt to retune exposure or Neutral tone mapping just to hide cosine fireflies on a beauty plate. The fireflies are the fundamental lesson here. The heat plate is exactly where they must be measured.

---

## Failure B: Phong-IS starves the surround

![Honesty plate. Tight crop of flank / plinth / foot. Cosine N=64 | Phong-IS s=32 | Phong-IS s=128. Starve is allowed to win the crop. Photograph only — RMSE from float Y.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/07_surround.jpg)

This is our honesty plate. It features a tight crop of the flank, plinth, and foot. Comparing Cosine $N=64$ | Phong-IS $s=32$ | Phong-IS $s=128$, the starvation effect is permitted to visually dominate the crop. The HUD reads: `PHOTO-ONLY ON BEAUTY  RMSE FROM FLOAT Y`, and the caption clearly states: *Failure B  flank / plinth / foot  starve is allowed.*.

At $N=64$ and $s=32$, the cosine $\mathrm{RMSE}_S$ is **0.140667**, while Phong-IS worsens to **0.824834**. Pushing the exponent to $s=128$ yields **0.860317**. Both Phong results are significantly **above** the cosine error. Because the pdf heavily concentrates around $R$, the Lambertian component still desperately needs samples across the rest of $\Omega^+$. A high $s$ value simply will not feed the plinth.

This precise starvation explains why the Phong $\mathrm{Y_{mean}}\approx 0.059$ compared to the cosine $\approx 0.146$ at $N=64$. The combined Phong white furnace test ($\rho_d+\rho_s$) noticeably undershoots: it measured **0.1930** against an expected **0.2917**. At $s=32$, the inverse-CDF essentially never places the Lambert tail into standard float32 precision (the $\xi=\mu^{s+1}$ operation underflows). However, a spec-only Phong furnace nails $\rho_s=\mathbf{0.1200}$ perfectly—verifying the mathematical $s+1$ vs $s+2$ check. The cosine combined approach cleanly hits **0.2923** vs **0.2917**. This is explicitly logged, not hidden. While it is unbiased in pure theory, the float inverse-CDF acts as a poor full-hemisphere Lambert sampler at this specific $s$ value.

Interestingly, the Phong $\mathrm{RMSE}_S$ does not scale monotonically with $N$ on this particular random seed: it measures **0.824834** at 64, but jumps to **1.754730** at 256. This is caused by rare, high-leverage disk hits striking the plinth. It represents residual heat, not the discovery of a second theorem.

The hero image uses Phong-IS, which is exactly why the felt wall sparkles. That sparkling artifact is this specific failure proudly displayed on the cover. The clean gallery photograph serves as the true reference plate.

Employing Veach / MIS is how production engines avoid having to make this harsh choice. We offer that as one closing sentence, not as an excuse to generate a bake-off hero image.

---

## Quote the metrics. Do not quote the beauty photographs as meters.

![Instrument. Snapshot of the float-buffer table. RMSE / var / fireflies from linear Rec.709 Y, never JPEG. Not a cover.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/08_metrics.jpg)

The following data is extracted from the float buffer running on Mesa llvmpipe. All RMSE, variance, and firefly metrics are calculated from linear Rec.709 $Y$, never from the JPEG. Fireflies are thresholded at $k=4$. The primary seed is **329363537**, and the reference seed is **1374605335**, utilizing the pcg hash.

Pass predicate, $N=64$, $s=32$:

| pdf | $\mathrm{RMSE}_H$ | $\mathrm{RMSE}_S$ | fireflies | $\mathrm{var}_H$ | `horizon_frac` | $\mathrm{Y_{mean}}$ |
| --- | --- | --- | --- | --- | --- | --- |
| uniform | 9.900829 | 0.133294 | 14400 | 90.03990936 | 0 | 0.145754 |
| **cosine** | **7.655620** | **0.140667** | 21536 | 56.92735672 | 0 | 0.146241 |
| **phong** | **1.999657** | **0.824834** | 1653 | 3.95137548 | 0.025246 | 0.059415 |

**$\mathrm{RMSE}_H(\mathrm{phong})<\mathrm{RMSE}_H(\mathrm{cosine})$: 1.999657 $<$ 7.655620. PASS.**

$N$ ladder, $s=32$, $\mathrm{RMSE}_H$:

| $N$ | cosine | phong |
| --- | --- | --- |
| 4 | 27.886635 | 8.377738 |
| 16 | 15.989179 | 4.037456 |
| 64 | 7.655620 | 1.999657 |
| 256 | 3.837384 | 1.010789 |

Exponent, Phong-IS, $N=64$:

| $s$ | $\mathrm{RMSE}_H$ | $\mathrm{RMSE}_S$ | fireflies | `horizon_frac` | $\mathrm{Y_{mean}}$ |
| --- | --- | --- | --- | --- | --- |
| 8 | 1.783442 | 0.879714 | 2897 | 0.084079 | 0.102782 |
| 32 | 1.999657 | 0.824834 | 1653 | 0.025246 | 0.059415 |
| 128 | 7.367447 | 0.860317 | 587 | 0.002089 | 0.030926 |

White furnace ($L_i\equiv 1$, $R=n$, lobe off-horizon):

| Sampler | Measured $Y$ | Expected | Band |
| --- | --- | --- | --- |
| Cosine, $\rho_d+\rho_s$ | **0.2923** | 0.2917 | PASS ($<0.04$) |
| Phong, $\rho_s$ only | **0.1200** | 0.1200 | PASS ($<0.03$) — $s+1$ vs $s+2$ |
| Phong, $\rho_d+\rho_s$ | 0.1930 | 0.2917 | short; inverse-CDF tail, see Failure B |

Header constants, exactly as written:

| item | value |
| --- | --- |
| seed / ref_seed | **329363537** / **1374605335** |
| exposure / TM | **1.000** / Khronos PBR Neutral (not re-fit) |
| firefly $k$ | **4.0** |
| key angular radius / $\mathrm{disk}_r$ | **3.600°** / **0.1372** |
| $L_{\mathrm{key}}$ / $L_{\mathrm{fill}}$ | $(980.0,880.0,720.0)$ / $(1.200,1.380,1.620)$ |
| $\rho_d$ / $\rho_s$ / $s$ | $(0.155,0.175,0.188)$ / **0.120** / **32** |
| $\mathrm{ROI}_H$ / $\mathrm{ROI}_S$ | $(502,391,555,432)$ / $(349,133,613,319)$ inclusive, beauty $960\times 540$ |

Hero rounding applied in the introduction: $\mathrm{RMSE}_H$ **7.66 / 2.00**; $\mathrm{RMSE}_S$ **0.141 / 0.825**; fireflies **21536 / 1653**; key **3.600°**; seed **329363537**; **24 pass / 0 fail**. Do **not** invent RMSE numbers from the hero image, the 3-up, or the surround crop. Those specific frames are marked `photo-only`. The metrics strip represents a scientific snapshot of the exact same table, and all quoted numbers are derived purely from the float buffer.

---

## Controls

Every single A/B/C plate shares bit-identical camera, geometry, materials, lights, exposure, and per-pixel $\xi$ streams. Only the inverse-CDF differs, resulting in different sample directions. Crucially, do not reuse a direction sampled via cosine under a Phong weight.

### Seed

We publish a single integer seed: **329363537**. This same stream is utilized across all arms. If a residual flips entirely upon re-seeding, it represents random noise (RNG), not a solid mathematical theorem.

### Horizon

Samples below the horizon receive a weight of 0 but are still counted in $N$, and we explicitly log the `horizon_frac`. There is no pdf renormalization. Renormalizing would artificially bias the estimator toward the upper hemisphere. For Phong at $s=32$, the fraction is **0.025246**. For cosine and uniform samplers (generated in the $n$-frame), it is **0**. A wider lobe ($s=8$) pushes the fraction to **0.084079**, while a sharper lobe ($s=128$) drops it to **0.002089**.

### White furnace

Evaluated with $L_i=1$ and the lobe situated safely off-horizon. Both the cosine combined approach and the Phong spec-only approach serve as gated asserts. The observed shortfall in the combined Phong test is strictly due to the float inverse-CDF tail underflowing, not because we loosened the passing band.

### Firefly $k$

Defined as $k=4$ strictly on linear $Y$. Never attempt to score fireflies on the final JPEG, as the Neutral+OETF pass heavily masks them.

### Light angular size

Firmly stated as **3.600°**. This is small enough that standard cosine sampling severely misses it, yet large enough that a Phong lobe at $s=32$ successfully hits it. If we used a delta light, the experiment would collapse into trivial NEE. If we used a fat, broad light, cosine sampling would look perfectly acceptable and the fundamental premise of this note would die.

### Material

We evaluate a dielectric surface, ensuring both $\rho_d$ and $\rho_s$ are active. The plinth, wall, and floor are Lambertian. Testing on a purely metallic surface would completely hide the surround starvation issue.

### ROI

H defines the specific crescent that the key light paints. S covers the flank and plinth, deliberately excluding any highlight pixels. Whole-frame RMSE is not an acceptable substitute, as it indiscriminately averages H and S together.

---

## Two paths, do not mix the instruments

| path | frames | instrument |
| --- | --- | --- |
| **Photograph** | hero, 3-up, $N$ ladders, exponent, surround | CPU MC of reflection pdfs on this llvmpipe, Neutral $e=1.00$, sRGB OETF. HUD `photo-only`. |
| **Instrument** | variance heat, pdf rose, metrics strip, reference | $\lvert Y_N-Y_{\mathrm{ref}}\rvert$ heat, pdf rose, RMSE / fireflies / horizon, NEE reference. |
| **Display** | every plate | expose $e=1.00$ $\to$ Neutral $\to$ sRGB OETF. Resolve is linear. Operator is inherited. |

The 3-up graphic acts as both a photograph of our control methodology *and* the primary source of the teaching. Always quote the metrics for RMSE and firefly counts. Do not look at the 8-bit panel and mistakenly quote it as 7.655620.

---

## Honesty gaps

1. **Offline spp strip on OSMesa / llvmpipe.** This test uses named $N$ values on a static still image. It is not running at 60 Hz. It is not an "interactive 1 spp" showcase, a real-time path tracer, hardware RT, or a production IBL baker.

2. **JPEG is 8-bit display-referred.** The Neutral+OETF pipeline inherently clips fireflies. Proper RMSE, variance, and firefly counts are strictly linear $Y$ evaluated on the raw float buffer.

3. **Hero is Phong-IS.** This is why the felt wall sparkles. This is Failure B intentionally placed on the cover, not a denoiser miss. The truly clean still is relegated to the reference plate.

4. **$L_{\mathrm{ref}}$ uses disk NEE.** It is **not** part of the standard A/B/C testing arms. The core note still exclusively samples reflection pdfs.

5. **Combined Phong white furnace undershoots** (scoring 0.1930 vs the expected 0.2917). The inverse-CDF calculated at $s=32$ simply cannot place the Lambert tail correctly within float32 precision. The spec-only test nails $\rho_s$ exactly, while the cosine combined test successfully hits $\rho_d+\rho_s$.

6. **Phong $\mathrm{RMSE}_S$ is not monotone in $N$** on this specific seed (measuring 0.824834 at 64, but 1.754730 at 256). This anomaly is caused by rare disk hits on the plinth. It is merely residual heat, not a hidden second theorem.

7. **$s=128$ $\mathrm{RMSE}_H=7.367447$** acts as an exponent control against a 3.600° key light and an $s=32$ optimized ROI H. It is not a failed pass predicate.

8. **Beauty $960\times 540$** (which scales to $\le 1280\times 720$). The final composites are $1280\times 720$. This is not a full-frame 4k spp render.

9. **Analytic sphere.** The normal $n$ is derived from the implicit mathematical surface, not from a faceted mesh that would sparkle inappropriately under a sharp lobe. The scene is constrained to one sphere and one plinth in a dark gallery.

10. **No Fresnel, no GGX, no Smith, no HDRI, no MIS arm.** The scene uses purely 1-bounce disk lighting plus a constant fill.

11. **Whole-frame RMSE is not the lesson.** Relying on it would erroneously average H and S.

12. **Not DLSS / OIDN / SVGF / ReSTIR.** This is an offline spp strip, not an evaluation of a 1-spp denoised product.

13. **Neutral constants copied from the tone-mapping note / Khronos PBR Neutral.** They are deliberately not re-fit.

14. **Cousin only:** VNDF represents how modern production engines actually sample this family of lobes, while Veach represents how we stop starving the Lambertian terms.

---

## Mesa / llvmpipe — what this run can claim

| item | value |
| --- | --- |
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| OSMesa | core 3.3 request; driver reports 4.5 core |
| FBO color | **RGBA32F** complete, $1280\times 720$. 8-bit fallback **not hit** |
| `GL_FRAMEBUFFER_SRGB` | disabled (Neutral + sRGB OETF on CPU) |
| MSAA | disabled |
| Beauty / composite | $960\times 540$ / $1280\times 720$ |
| Neutral $e$ | **1.00** |
| seed / hash | **329363537** / pcg |
| key | finite disk, **3.600°** from the highlight point |

**Can claim:** On this specific OSMesa / llvmpipe build, evaluating the same integral under cosine versus Phong-IS at the published $N$ and $s$ settings produces these exact $\mathrm{RMSE}_H$, $\mathrm{RMSE}_S$, and firefly metrics. The heat plate accurately maps that residual, and the 3-up demonstrates the identical view when only $p$ is changed.

**Cannot claim:** This is not hardware RT, a real-time performance budget, or proof that "Phong is the correct production sampler". It does not prove energy identity after Neutral tone mapping, nor does it make claims based on JPEG measurements. It is entirely divorced from discrete-GPU metrics, warp occupancy, bandwidth analysis, or broad hardware behavior claims.

---

## Assertions

This run: **24 pass / 0 fail**.

| check | result |
| --- | --- |
| FBO is RGBA32F | PASS |
| Required gallery plates exist and are non-empty | PASS |
| No NaNs in the estimator | PASS |
| Sphere / plinth pixel counts | PASS ($>2000$ / $>200$) |
| White-furnace cosine $\lvert Y-(\rho_d+\rho_s)\rvert<0.04$ | PASS **0.2923 vs 0.2917** |
| White-furnace Phong spec-only $\lvert Y-\rho_s\rvert<0.03$ | PASS **0.1200** |
| ROI H/S non-empty | PASS **$(502,391,555,432)$ / $(349,133,613,319)$** |
| $\mathrm{RMSE}_H(\mathrm{phong})<\mathrm{RMSE}_H(\mathrm{cosine})$ at $N=64$, $s=32$ | PASS **1.999657 $<$ 7.655620** |

Absolutely no assert tolerances were loosened to artificially hide cosine fireflies or mask Phong surround starvation.

---

## Out of scope

We are explicitly excluding a full MIS product bake-off as a hero piece; Veach is merely a closing thought, and there are no balance-heuristic plates included here. A GGX VNDF deep dive is also excluded—treated only as a cousin concept—meaning no Smith $G$, no half-vector Jacobian derivation, and no roughness $\to$ mip mapping. We are not re-deriving Neutral TM, the Karis prefilter, the DFG LUT, or split-sum energy tables. Refer instead to the existing IBL and TM citations. Additionally out of scope: spectral path tracing, evaluating DLSS / SVGF / OIDN / ReSTIR as denoisers for this still image, multi-bounce GI, utilizing next-event estimation as a true *sampling arm*, and area-light LTC. We also skip shadow-map bias, Toksvig, anisotropic GGX, and sRGB-vs-linear texture decoding. Developing a second photographic family for the cover or journal hero is excluded. Finally, any real-time path-tracer claims, hardware RT core usage, occupancy, and bandwidth analysis are strictly outside the bounds of this note.

---

## Estimator lock

```text
Lo   = (1/N) sum  f_r(w_k, w_o) * L_i(w_k) * (n·w_k) / p(w_k)
p_c  = (n·ω)/π                         // ONB around n
p_p  = (s+1)/(2π) (ω·R)^s              // ONB around R; n·ω≤0 → weight 0, still in N
f_r  = ρd/π + ρs (s+2)/(2π) (ω·R)_+^s  // s+1 is pdf; s+2 is BRDF
PNG  = sRGB_OETF( Neutral(e * Lo) )    // e=1.00, inherited

```

Locked fundamentals: we maintain the exact same integral, two varying pdfs, and a single $N$. Cosine firmly remains in the numerator. Horizon weight correctly hits 0 while still counting in $N$. The Neutral tone mapper is inherited exactly as-is, not re-fit. We pin the gallery still as the final visual presentation. We pin the 3-up as the core teaching mechanism. We pin the variance heat map as the distinct mathematical fingerprint. We pin the surround crop as our definitive honesty plate. These sampling tickets are simply not interchangeable.
