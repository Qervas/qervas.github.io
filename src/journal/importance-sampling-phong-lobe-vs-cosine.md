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

The last note owned correspondence. Color clamp asks whether history looks legal. Depth reject asks whether it is the same surface. Time is out of scope here. Split-sum already hid the samples in a prefilter cube \(\times\) DFG LUT; production then multiplies two tables. Tone mapping is inherited — Neutral after resolve, not re-fit. This note unhides the estimator. **It owns Monte Carlo sampling mismatch — not VNDF, not a MIS bake-off, not a split-sum re-teach.**

**Same integral, two pdfs, one \(N\).** Cosine-weighted hemisphere is the Lambertian ticket. A Phong cosine-power lobe about \(R=\mathrm{reflect}(-\omega_o,n)\) is the highlight ticket. On a sharp dielectric they are not interchangeable.

![Gallery spotlight: lacquer dielectric sphere on a short dark-stone plinth, dark slate wall, recessed canvas, painted picture rail. Phong-IS, N=256, s=32. Khronos PBR Neutral. Felt wall sparkles — Lambert sampled by a Phong lobe. Photograph only — no RMSE.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/00_hero.jpg)

A new photographic family: gallery spotlight. Lacquer dielectric sphere on a short dark-stone plinth, dark slate wall, recessed canvas, painted picture rail. Phong-IS, \(N=256\), \(s=32\). HUD: `Khronos PBR Neutral`, `PHOTO-ONLY`, `Phong-IS  N=256  s=32`. Do not hang \(\mathrm{RMSE}_H\) on this photograph. The felt wall sparkles: Lambert sampled by a Phong lobe. That is Failure B on the cover, not a denoiser miss. The clean gallery still is the reference plate below.

![Teaching pin. Same view, same N=64, same seed stream. Uniform | cosine | Phong-IS. Only p differs. Wedge crop of the highlight crescent under each column. Photograph only.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/01_3up.jpg)

**Pin this.** Same view, same \(N=64\), same seed stream. **Uniform \| cosine \| Phong-IS.** Only \(p\) differs. Wedge crop of the highlight crescent under each column. Caption on the plate: *same view, same N=64, same seed, only p differs.* Photo only.

Hero, Mesa 25.0.7 llvmpipe, linear Rec.709, **Khronos PBR Neutral** \(e=\mathbf{1.00}\), seed **329363537**, key angular radius **3.600°**, \(N=64\), \(s=32\): \(\mathrm{RMSE}_H\) cosine **7.655620** vs Phong-IS **1.999657** (pass: phong \(<\) cosine). \(\mathrm{RMSE}_S\) cosine **0.140667** vs Phong-IS **0.824834** — surround starve, shown honestly. Fireflies (\(k=4\)) **21536** vs **1653**. \(\mathrm{ROI}_H=(502,391,555,432)\), \(\mathrm{ROI}_S=(349,133,613,319)\). Assertions **24 pass / 0 fail**.

---

## Two questions, two pdfs

The integral does not change. Lighting, geometry, camera, BRDF, exposure, and the per-pixel \(\xi\) stream do not change. **Only \(p(\omega)\) changes.** Variance is the photograph.

**Cosine.** Does this direction match Lambert \(\times\) the projected hemisphere?

**Phong-IS.** Does this direction match the cosine-power highlight about the *reflection vector* \(R\)? Not the half-vector. Not Blinn. Not GGX-VNDF.

On a lacquer dielectric under a **3.600°** gallery disk they are not the same ticket. Cosine spends almost every sample off the lobe. When a sample *does* hit the small key, \(L_i\) is huge and \(p_c\) is only \((n\cdot\omega)/\pi\) — lottery ticket, firefly. Phong-IS puts the inverse-CDF on \(R\). The crescent cleans up. The flanks do not automatically follow.

Uniform hemisphere (\(p=1/(2\pi)\)) is the loud third arm: any-hemisphere sample is not cosine importance. At \(N=64\), \(s=32\), \(\mathrm{RMSE}_H=\mathbf{9.900829}\) vs cosine \(\mathbf{7.655620}\); \(\mathrm{var}_H=\mathbf{90.04}\) vs \(\mathbf{56.93}\). It is not a replacement for cosine. Firefly *count* at the same row is cosine **21536**, uniform **14400**, Phong-IS **1653** — quote \(\mathrm{RMSE}_H\), not that count, as the loudness ranking.

The scientific claim is narrow: **pdf–integrand mismatch is a measurable variance, not a taste.** Cosine matches Lambert \(\times\) projected hemisphere. Phong-IS matches a cosine-power highlight. Neither matches both at once.

Two facts, never mixed:

1. **Beauty plates** (hero, 3-up, \(N\) ladders, exponent, surround) are CPU MC, Neutral then sRGB OETF. HUD `photo-only` means do not invent RMSE, firefly count, or \(\mathrm{Y_{mean}}\) from the JPEG. 8-bit Neutral+sRGB clips fireflies.
2. **Instruments** (variance heat, pdf rose, metrics strip, reference) are the float buffer: linear Rec.709 \(Y\) residual, pdf rose, RMSE, fireflies, horizon fraction. Quote the metrics.

---

## Why: the estimator, then the two pdfs

Working space is **scene-referred linear Rec.709**. Domain \(\Omega^+=\{\omega:n\cdot\omega>0\}\). Below-horizon samples contribute **0** and still count in \(N\). Do **not** renormalize \(p\) after a horizon reject.

### Same integral

\[
L_o(\omega_o)=\int_{\Omega^+} f_r(\omega,\omega_o)\,L_i(\omega)\,(n\cdot\omega)\,d\omega.
\]

### Unbiased solid-angle estimator

\[
\hat L_o=\frac1N\sum_{k=1}^N\frac{f_r(\omega_k,\omega_o)\,L_i(\omega_k)\,(n\cdot\omega_k)}{p(\omega_k)}.
\]

Same \(f_r\), same \(L_i\), same camera, same geometry for every arm. Cosine stays in the **numerator**. It is not folded into \(p_p\).

### BRDF (Lambert + Lafortune-normalized Phong)

\[
f_r(\omega,\omega_o)=\frac{\rho_d}{\pi}+\rho_s\frac{s+2}{2\pi}\,(\omega\cdot R)_+^{\,s},
\qquad
R=2(n\cdot\omega_o)\,n-\omega_o.
\]

Dielectric body, not a metal. This run: \(\rho_d=(0.155,0.175,0.188)\), \(\rho_s=0.12\), default \(s=32\). Metal (\(\rho_d=0\)) would hide Failure B.

\((s+2)\) is the **BRDF energy** constant. \((s+1)\) is the **solid-angle pdf** constant. Mixing them biases \(\hat L\). White-furnace assert (\(L_i\equiv 1\), lobe well above the horizon): \(\hat L_o\approx\rho_d+\rho_s\) within a stated band. Science assert, not a hero plate.

No Fresnel, no GGX \(D/G\), no Smith. This is not a microfacet product note.

### Pdfs (1/sr)

| Arm | Name | \(p(\omega)\) | Inverse CDF |
|---|---|---|---|
| C | Uniform hemisphere | \(1/(2\pi)\) on \(\Omega^+\) | \(\cos\theta=\xi_1\), \(\varphi=2\pi\xi_2\), ONB around \(n\) |
| A | Cosine hemisphere | \((n\cdot\omega)/\pi\) on \(\Omega^+\) | \(\cos\theta=\sqrt{\xi_1}\), \(\varphi=2\pi\xi_2\), ONB around \(n\) |
| B | Phong lobe about \(R\) | \((s+1)/(2\pi)\,(\omega\cdot R)^s\) if \(\omega\cdot R>0\), else \(0\) | \(\cos\theta=\xi_1^{1/(s+1)}\), \(\varphi=2\pi\xi_2\), ONB around \(R\) |

Phong generation is in the \(R\)-frame. If \(n\cdot\omega\le 0\): weight \(=0\), increment `horizon_frac`. RNG is a PCG integer hash, seed **329363537**.

### Light (analytic; no HDRI)

1-bounce direct. Finite disk key, upper-front-right, angular radius **3.600°** from the highlight point, \(\mathrm{disk}_r=0.1372\). \(L_{\mathrm{key}}=(980,880,720)\) warm. Dim cool fill \(L_{\mathrm{fill}}=(1.20,1.38,1.62)\) over \(\Omega^+\) so flanks and wall remain measurable.

\(L_i(\omega)=L_{\mathrm{key}}\) if the ray hits the disk and is not occluded by sphere or plinth, else \(L_{\mathrm{fill}}\). This note samples the **reflection pdf only**. Do not sample the light pdf. Do not MIS. A Dirac directional is illegal — hemisphere MC cannot hit a delta, and the note would collapse into NEE. Tiny key solid angle is what makes cosine firefly, and what a too-sharp \(s\) can miss.

### Jacobian / solid angle

The inverse-CDF maps \((\xi_1,\xi_2)\in[0,1)^2\) to \(\omega\in\mathbb{S}^2\). \(p\) above is already in solid angle. Do not multiply by an extra \(d\omega/d\xi\). A half-vector sampler *would* need the \(h\to\omega\) Jacobian \(\partial\Omega_h/\partial\Omega_\omega=4(\omega\cdot h)\). That Jacobian is why Blinn / GGX-VNDF is a different note. Cite it. Do not derive it. VNDF is how production samples *this* family of lobes. It is not the A/B.

### Variance used on plates

All of these are **linear Rec.709 \(Y\)**, scene-referred, never JPEG, never after Neutral.

\[
\mathrm{RMSE}_{\mathrm{ROI}}
=\sqrt{\frac1{\lvert\mathrm{ROI}\rvert}\sum_{x\in\mathrm{ROI}}\bigl(Y(\hat L_N(x))-Y(L_{\mathrm{ref}}(x))\bigr)^2}.
\]

Two named ROIs, inclusive pixel rects at beauty \(960\times 540\) (bottom-up):

- **H** — highlight crescent the key paints: \((502,391,555,432)\).
- **S** — diffuse flank / plinth / foot: \((349,133,613,319)\).

Per-pixel variance of the mean (no ref required):

\[
\widehat{\mathrm{Var}}(x)=\frac1{N(N-1)}\sum_{k=1}^N\bigl(X_k(x)-\bar X(x)\bigr)^2.
\]

The heat plate is \(\lvert Y_{64}-Y_{\mathrm{ref}}\rvert\) in turbo, cosine vs Phong, **same highlight-rim crop, shared p98 scale**. Firefly count: \(\#\{x:|Y_N-Y_{\mathrm{ref}}|>k\,Y_{\mathrm{ref}}\}\) with \(k=4\) on hit pixels. Whole-frame RMSE is a footnote. It averages H and S and hides the lesson.

### Display (inherited, not re-derived)

\[
L_{\mathrm{display}}
=
\mathrm{TM}\bigl(\mathrm{expose}(\hat L_o)\bigr)
\quad\text{then IEC 61966-2-1 sRGB OETF for PNG.}
\]

TM is **Khronos PBR Neutral**, \(e=1.00\), frozen across A/B/C. Constants not re-fit. Cite the [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) and [split-sum IBL](/posts/p/split-sum-image-based-lighting/) notes. `GL_FRAMEBUFFER_SRGB` is off; encode is CPU. Measurement is the float buffer, not the JPEG.

### Reference (not a sampling arm)

\(L_{\mathrm{ref}}\) = analytic Lambert \(\times\) fill + Phong-IS of specular \(\times\) fill (32 spp) + **disk NEE** (96 spp). Independent seed **1374605335**. Arms never sample the light pdf. This is how the box gets a high-\(N\)-quality ref without 4096 spp hemisphere MC on llvmpipe. The reference plate outlines ROI H/S. Not the cover.

![Science reference. Disk NEE plus analytic Lambert fill. ROI H (highlight crescent) and ROI S (flank / plinth / foot) outlined. Not a sampling arm. Not the cover.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/09_ref.jpg)

---

## Teaching pin: three pdfs, one view

The 3-up is the policy compare. Identical camera, geometry, materials, lights, exposure, \(N=64\), seed **329363537**. Only \(p\) differs.

| Column | pdf | What the wedge does |
|---|---|---|
| Uniform | \(1/(2\pi)\) | Grain. No crescent. Highest \(\mathrm{RMSE}_H\). |
| Cosine | \((n\cdot\omega)/\pi\) | Body fills. Rim still a lottery. |
| Phong-IS | \((s+1)/(2\pi)\,(\omega\cdot R)^s\) | Crescent appears. Surround goes dark. |

If the full-frame columns look like “Phong is better,” the surround plate is the correction. Trust the wedge for Failure A. Trust the honesty crop for Failure B. Quote \(\mathrm{RMSE}_H\) / \(\mathrm{RMSE}_S\) from the metrics, not from the 8-bit panel.

---

## Unique artifact: variance heat on the highlight rim

![Unique artifact. False-color |Y_64−Y_ref|, linear Rec.709 Y, turbo. Cosine vs Phong-IS, same highlight-rim crop, shared p98 scale. Heat leaves the rim under Phong. Instrument — not PNG.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/04_var_heat.jpg)

This is the thing this note exists to draw. False-color \(\lvert Y_{64}-Y_{\mathrm{ref}}\rvert\), linear Rec.709 \(Y\), turbo, **same rim crop, shared p98 scale**. HUD: `INSTRUMENT  FINGERPRINT`, `linear Rec.709 Y residual  not PNG`.

Cosine heat rings the crescent: a yellow-green residual blob with red firefly speckles. Phong-IS drops there — mostly blue, sparse specks, the outline of a lobe that actually got samples. Heat leaves the rim and may appear on the flank. That swap is the fingerprint. Not another RGB triangle. Not a DFG LUT remake.

![Instrument. Hemisphere overlay, linear pdf in 1/sr, turbo: cosine about n vs Phong about the same R, s=32. Polar insets under each. Not Blinn, not GGX VNDF.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/05_pdf_rose.jpg)

The pdf rose is the secondary science plate. Hemisphere overlay, linear pdf in 1/sr, turbo: cosine about \(n\) vs Phong about the same \(R\), \(s=32\). Polar insets under each. Caption on the plate: *not Blinn, not GGX VNDF.* Beside the photo, never the cover.

Quote the metrics, not the JPEG.

---

## Ladders: \(N\), then \(s\)

![Failure A. Cosine at N=4 / 16 / 64 / 256, same seed-stream prefixes. Fireflies decay slowly on the rim. Photograph only.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/02_cosine_ladder.jpg)

**Failure A.** Cosine at \(N=4/16/64/256\), same seed-stream prefixes. Fireflies decay slowly on the rim. At \(N=256\) the body is quieter; the crescent is still not a Phong crescent. \(\mathrm{RMSE}_H\): **27.886635 / 15.989179 / 7.655620 / 3.837384**.

![Contrast. Phong-IS at the same N rungs, matching pdf. Rim cleans earlier. Surround stays dark with sparkles. Photograph only.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/03_phong_ladder.jpg)

**Contrast.** Phong-IS at the same \(N\) rungs, matching pdf. The rim cleans earlier. Crescent readable by \(N=16\), tighter at 64/256. Surround stays dark with sparkles — Failure B riding along. \(\mathrm{RMSE}_H\): **8.377738 / 4.037456 / 1.999657 / 1.010789**.

![Exponent control. Phong-IS, fixed N=64, s=8 / 32 / 128, matching pdf. Wide ≈ cosine on H; sharp starves the s=32 crescent and S. Photograph only.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/06_exponent.jpg)

**Exponent control.** Phong-IS, fixed \(N=64\), \(s=8/32/128\), matching pdf. Wide lobe \(\approx\) cosine on H (\(s=8\), \(\mathrm{RMSE}_H=1.783442\), still beats cosine). Default \(s=32\) is the pass plate. Sharp \(s=128\) vs this **3.600°** key: \(\mathrm{RMSE}_H=7.367447\) — ROI H is the \(s=32\) crescent, so the extra rim is starved. That is the exponent control, not the pass predicate. High \(s\) also hurts S.

Do not retune exposure or Neutral to hide cosine fireflies on a beauty plate. Fireflies are the lesson. The heat plate is where they are measured.

---

## Failure B: Phong-IS starves the surround

![Honesty plate. Tight crop of flank / plinth / foot. Cosine N=64 | Phong-IS s=32 | Phong-IS s=128. Starve is allowed to win the crop. Photograph only — RMSE from float Y.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/07_surround.jpg)

This is the honesty plate. Tight crop of flank / plinth / foot. Cosine \(N=64\) \| Phong-IS \(s=32\) \| Phong-IS \(s=128\). Starve is allowed to win the crop. HUD: `PHOTO-ONLY ON BEAUTY  RMSE FROM FLOAT Y`. Caption: *Failure B  flank / plinth / foot  starve is allowed.*

At \(N=64\), \(s=32\): \(\mathrm{RMSE}_S\) cosine **0.140667** vs Phong-IS **0.824834**. At \(s=128\): **0.860317**. Both **above** cosine. The pdf lives around \(R\). Lambert still needs samples on the rest of \(\Omega^+\). High \(s\) will not feed the plinth.

The same starve is why Phong \(\mathrm{Y_{mean}}\approx 0.059\) vs cosine \(\approx 0.146\) at \(N=64\). Combined Phong white furnace (\(\rho_d+\rho_s\)) undershoots: measured **0.1930** vs expect **0.2917**. At \(s=32\) the inverse-CDF never places the Lambert tail in float32 (\(\xi=\mu^{s+1}\) underflows). Spec-only Phong furnace hits \(\rho_s=\mathbf{0.1200}\) exactly — that is the \(s+1\) vs \(s+2\) check. Cosine combined hits **0.2923** vs **0.2917**. Logged, not hidden. Unbiased in theory; float inverse-CDF is not a full-hemisphere Lambert sampler at this \(s\).

Phong \(\mathrm{RMSE}_S\) is not monotone in \(N\) on this one seed: **0.824834** at 64, **1.754730** at 256. Rare disk hits on the plinth are high-leverage. Residual heat, not a second theorem.

Hero is Phong-IS, so the felt wall sparkles. That is this failure on the cover. The clean gallery photograph is the reference plate.

Veach / MIS is how you stop choosing. One closer sentence, not a bake-off hero.

---

## Quote the metrics. Do not quote the beauty photographs as meters.

![Instrument. Snapshot of the float-buffer table. RMSE / var / fireflies from linear Rec.709 Y, never JPEG. Not a cover.](/assets/journal/importance-sampling-phong-lobe-vs-cosine/08_metrics.jpg)

Float buffer, Mesa llvmpipe. RMSE / var / fireflies from linear Rec.709 \(Y\), never JPEG. Firefly \(k=4\). Seed **329363537**. Ref seed **1374605335**. Hash = pcg.

Pass predicate, \(N=64\), \(s=32\):

| pdf | \(\mathrm{RMSE}_H\) | \(\mathrm{RMSE}_S\) | fireflies | \(\mathrm{var}_H\) | `horizon_frac` | \(\mathrm{Y_{mean}}\) |
|---|---|---|---|---|---|---|
| uniform | 9.900829 | 0.133294 | 14400 | 90.03990936 | 0 | 0.145754 |
| **cosine** | **7.655620** | **0.140667** | 21536 | 56.92735672 | 0 | 0.146241 |
| **phong** | **1.999657** | **0.824834** | 1653 | 3.95137548 | 0.025246 | 0.059415 |

**\(\mathrm{RMSE}_H(\mathrm{phong})<\mathrm{RMSE}_H(\mathrm{cosine})\): 1.999657 \(<\) 7.655620. PASS.**

\(N\) ladder, \(s=32\), \(\mathrm{RMSE}_H\):

| \(N\) | cosine | phong |
|---|---|---|
| 4 | 27.886635 | 8.377738 |
| 16 | 15.989179 | 4.037456 |
| 64 | 7.655620 | 1.999657 |
| 256 | 3.837384 | 1.010789 |

Exponent, Phong-IS, \(N=64\):

| \(s\) | \(\mathrm{RMSE}_H\) | \(\mathrm{RMSE}_S\) | fireflies | `horizon_frac` | \(\mathrm{Y_{mean}}\) |
|---|---|---|---|---|---|
| 8 | 1.783442 | 0.879714 | 2897 | 0.084079 | 0.102782 |
| 32 | 1.999657 | 0.824834 | 1653 | 0.025246 | 0.059415 |
| 128 | 7.367447 | 0.860317 | 587 | 0.002089 | 0.030926 |

White furnace (\(L_i\equiv 1\), \(R=n\), lobe off-horizon):

| Sampler | Measured \(Y\) | Expected | Band |
|---|---|---|---|
| Cosine, \(\rho_d+\rho_s\) | **0.2923** | 0.2917 | PASS (\(<0.04\)) |
| Phong, \(\rho_s\) only | **0.1200** | 0.1200 | PASS (\(<0.03\)) — \(s+1\) vs \(s+2\) |
| Phong, \(\rho_d+\rho_s\) | 0.1930 | 0.2917 | short; inverse-CDF tail, see Failure B |

Header constants, as written:

| item | value |
|---|---|
| seed / ref_seed | **329363537** / **1374605335** |
| exposure / TM | **1.000** / Khronos PBR Neutral (not re-fit) |
| firefly \(k\) | **4.0** |
| key angular radius / \(\mathrm{disk}_r\) | **3.600°** / **0.1372** |
| \(L_{\mathrm{key}}\) / \(L_{\mathrm{fill}}\) | \((980.0,880.0,720.0)\) / \((1.200,1.380,1.620)\) |
| \(\rho_d\) / \(\rho_s\) / \(s\) | \((0.155,0.175,0.188)\) / **0.120** / **32** |
| \(\mathrm{ROI}_H\) / \(\mathrm{ROI}_S\) | \((502,391,555,432)\) / \((349,133,613,319)\) inclusive, beauty \(960\times 540\) |

Hero rounding used in the lede: \(\mathrm{RMSE}_H\) **7.66 / 2.00**; \(\mathrm{RMSE}_S\) **0.141 / 0.825**; fireflies **21536 / 1653**; key **3.600°**; seed **329363537**; **24 pass / 0 fail**. Do **not** invent RMSE from the hero, the 3-up, or the surround crop. Those frames are `photo-only`. The metrics strip is a science snapshot of the same table; quoted numbers are the float buffer.

---

## Controls

Every A/B/C plate shares bit-identical camera, geometry, materials, lights, exposure, and per-pixel \(\xi\) stream. Inverse-CDF differs; directions differ. Do not reuse a cosine direction under a Phong weight.

### Seed

One published integer: **329363537**. Same stream across arms. A residual that flips with a re-seed is RNG, not a theorem.

### Horizon

Weight 0, count in \(N\), log `horizon_frac`. No pdf renormalize. Renormalizing biases the estimator toward the upper hemisphere. Phong \(s=32\): **0.025246**. Cosine / uniform: **0** (generation in the \(n\)-frame). Wider lobe (\(s=8\)) \(\to\) **0.084079**; sharper (\(s=128\)) \(\to\) **0.002089**.

### White furnace

\(L_i=1\), lobe off-horizon. Cosine combined and Phong spec-only are the gated asserts. Combined Phong shortfall is the float inverse-CDF tail, not a loosened band.

### Firefly \(k\)

\(k=4\) on linear \(Y\). Do not score fireflies on the JPEG. Neutral+OETF hides them.

### Light angular size

Stated **3.600°**. Small enough that cosine misses, large enough that Phong-\(s=32\) hits. Delta light \(\to\) experiment becomes NEE. Fat light \(\to\) cosine looks fine and the note dies.

### Material

Dielectric, both \(\rho_d\) and \(\rho_s\) live. Plinth / wall / floor are Lambert. Metal-only hides surround starve.

### ROI

H = crescent the key actually paints. S = flank + plinth, no highlight pixels. Whole-frame RMSE is not a substitute.

---

## Two paths, do not mix the instruments

| path | frames | instrument |
|---|---|---|
| **Photograph** | hero, 3-up, \(N\) ladders, exponent, surround | CPU MC of reflection pdfs on this llvmpipe, Neutral \(e=1.00\), sRGB OETF. HUD `photo-only`. |
| **Instrument** | variance heat, pdf rose, metrics strip, reference | \(\lvert Y_N-Y_{\mathrm{ref}}\rvert\) heat, pdf rose, RMSE / fireflies / horizon, NEE reference. |
| **Display** | every plate | expose \(e=1.00\) \(\to\) Neutral \(\to\) sRGB OETF. Resolve is linear. Operator is inherited. |

The 3-up is a photograph of the control *and* the source of the teaching. Quote the metrics for RMSE and fireflies. Do not quote the 8-bit panel as 7.655620.

---

## Honesty gaps

1. **Offline spp strip on OSMesa / llvmpipe.** Named \(N\) on a still. Not 60 Hz. Not “interactive 1 spp.” Not a real-time path tracer. Not hardware RT. Not a production IBL baker.
2. **JPEG is 8-bit display-referred.** Neutral+OETF clips fireflies. RMSE / var / firefly count are linear \(Y\) on the float buffer.
3. **Hero is Phong-IS.** Felt wall sparkles. Failure B on the cover, not a denoiser miss. Clean still is the reference plate.
4. **\(L_{\mathrm{ref}}\) uses disk NEE.** That is **not** an A/B/C arm. The note still samples reflection pdfs only.
5. **Combined Phong white furnace undershoots** (0.1930 vs 0.2917). Inverse-CDF at \(s=32\) cannot place the Lambert tail in float32. Spec-only hits \(\rho_s\) exactly; cosine combined hits \(\rho_d+\rho_s\).
6. **Phong \(\mathrm{RMSE}_S\) is not monotone in \(N\)** on this seed (64: 0.824834, 256: 1.754730). Rare disk hits on the plinth. Residual heat, not a second theorem.
7. **\(s=128\) \(\mathrm{RMSE}_H=7.367447\)** is the exponent control against a 3.600° key and an \(s=32\) ROI H, not a failed pass predicate.
8. **Beauty \(960\times 540\)** (\(\le 1280\times 720\)). Composites \(1280\times 720\). Not full-frame 4k spp.
9. **Analytic sphere.** \(n\) from the implicit surface, not a faceted mesh that sparkles under a sharp lobe. One sphere, one plinth, dark gallery.
10. **No Fresnel, no GGX, no Smith, no HDRI, no MIS arm.** 1-bounce disk + constant fill.
11. **Whole-frame RMSE is not the lesson.** It would average H and S.
12. **Not DLSS / OIDN / SVGF / ReSTIR.** Offline spp strip, not a 1-spp product.
13. **Neutral constants copied from the tone-mapping note / Khronos PBR Neutral.** Not re-fit.
14. **Cousin only:** VNDF is how production samples this family of lobes; Veach is how you stop starving Lambert.

---

## Mesa / llvmpipe — what this run can claim

| item | value |
|---|---|
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| OSMesa | core 3.3 request; driver reports 4.5 core |
| FBO color | **RGBA32F** complete, \(1280\times 720\). 8-bit fallback **not hit** |
| `GL_FRAMEBUFFER_SRGB` | disabled (Neutral + sRGB OETF on CPU) |
| MSAA | disabled |
| Beauty / composite | \(960\times 540\) / \(1280\times 720\) |
| Neutral \(e\) | **1.00** |
| seed / hash | **329363537** / pcg |
| key | finite disk, **3.600°** from the highlight point |

**Can claim:** on this OSMesa / llvmpipe build, the same integral under cosine vs Phong-IS at published \(N\) and \(s\) produces these \(\mathrm{RMSE}_H\) / \(\mathrm{RMSE}_S\) / firefly numbers; the heat plate is that residual; the 3-up is the same view with only \(p\) changed.

**Cannot claim:** hardware RT, a real-time budget, “Phong is the correct production sampler,” energy identity after Neutral, anything measured off the JPEG. Discrete-GPU metrics, occupancy, bandwidth, or “this is how the hardware works.”

---

## Assertions

This run: **24 pass / 0 fail**.

| check | result |
|---|---|
| FBO is RGBA32F | PASS |
| Required gallery plates exist and are non-empty | PASS |
| No NaNs in the estimator | PASS |
| Sphere / plinth pixel counts | PASS (\(>2000\) / \(>200\)) |
| White-furnace cosine \(\lvert Y-(\rho_d+\rho_s)\rvert<0.04\) | PASS **0.2923 vs 0.2917** |
| White-furnace Phong spec-only \(\lvert Y-\rho_s\rvert<0.03\) | PASS **0.1200** |
| ROI H/S non-empty | PASS **\((502,391,555,432)\) / \((349,133,613,319)\)** |
| \(\mathrm{RMSE}_H(\mathrm{phong})<\mathrm{RMSE}_H(\mathrm{cosine})\) at \(N=64\), \(s=32\) | PASS **1.999657 \(<\) 7.655620** |

No assert tolerances were loosened to hide cosine fireflies or Phong surround starve.

---

## Out of scope

Full MIS product bake-off as hero — Veach is one closer sentence, no balance-heuristic plates. GGX VNDF deep dive — cousin sentence only; no Smith \(G\), no half-vector Jacobian derivation, no roughness \(\to\) mip. Re-deriving Neutral TM, Karis prefilter, DFG LUT, split-sum energy tables — cite IBL + TM. Spectral path tracer. DLSS / SVGF / OIDN / ReSTIR as the denoiser of this still. Multi-bounce GI, next-event estimation as a *sampling arm*, area-light LTC. Shadow-map bias. Toksvig / anisotropic GGX / sRGB-vs-linear texture decode. A second photographic family as cover or journal hero. Real-time path-tracer claims, hardware RT cores, occupancy, bandwidth.

---

## Estimator lock

```text
Lo   = (1/N) sum  f_r(w_k, w_o) * L_i(w_k) * (n·w_k) / p(w_k)
p_c  = (n·ω)/π                         // ONB around n
p_p  = (s+1)/(2π) (ω·R)^s              // ONB around R; n·ω≤0 → weight 0, still in N
f_r  = ρd/π + ρs (s+2)/(2π) (ω·R)_+^s  // s+1 is pdf; s+2 is BRDF
PNG  = sRGB_OETF( Neutral(e * Lo) )    // e=1.00, inherited
```

Locked: same integral, two pdfs, one \(N\); cosine in the numerator; horizon weight 0 and still in \(N\); Neutral inherited, not re-fit. Pin the gallery still as the presentation. Pin the 3-up as the teaching. Pin the variance heat as the fingerprint. Pin the surround crop as the honesty plate. The tickets are not interchangeable.
