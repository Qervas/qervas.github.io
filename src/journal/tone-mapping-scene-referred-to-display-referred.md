---
title: "Tone Mapping: Scene-Referred to Display-Referred"
description: "Scene-referred linear through a named curve to display-referred, then the OETF. Clip, Reinhard, ACES, and Khronos PBR Neutral on one loft plate."
hook: "Why the sun in a photo blows out to flat white, and how renderers squeeze real brightness onto a screen."
date: 2026-09-16
tags:
  - graphics
  - engine
  - lighting
math: true
cover: /assets/journal/tone-mapping/00_hero.jpg
---

In our previous analysis, environment lighting was formalized as a direct multiplication—integrating a GGX-prefiltered cubemap with a DFG lookup table and distant irradiance. The display-phase transformation was documented solely as a named footnote:

\[L_{\mathrm{display}}=\mathrm{TM}\bigl(\mathrm{expose}(L_o)\bigr) \quad\text{then sRGB OETF.}\]

For those initial evaluations, the tone mapping (TM) operator utilized was Khronos PBR Neutral with an exposure value of 1.05. This configuration was held constant across all Image-Based Lighting (IBL) comparisons and was strictly segregated from the cubemap baking process. While a comprehensive tone-map evaluation was explicitly excluded from the IBL breakdown, the current analysis isolates and evaluates this specific operator. The fundamental governing principle is mathematically strict: tone mapping allocates display codes; it does not synthesize lighting data.

We evaluate the identical loft scene established in the prior IBL investigation. The composition features cream stoneware (a dielectric with \(F_0=0.04\) and a glaze roughness ranging from 0.14 to 0.30) alongside a measured brass sphere characterized by \(F_0=(0.910, 0.778, 0.423)\). These objects rest on a board-formed concrete catcher, grounded by contact shadows and illuminated by a background loft window. Under the specified operator at an exposure of 1.05, the metallic surface accurately preserves the window mullion reflections, and the dielectric glaze maintains its cream chromaticity. The instrumentation HUD designates the plate as `Khronos PBR Neutral exposure=1.05` and explicitly flags it as `photo-only - no metric`. Because tone mapping exclusively allocates display codes, clip-fractions cannot and should not be reverse-engineered from this photographic representation.

![Cream stoneware bottle and brass sphere on board-formed concrete, loft window behind. Khronos PBR Neutral, exposure 1.05. Metal still carries mullions; glaze still reads cream. Photograph only — no clip-fraction.](/assets/journal/tone-mapping/00_hero.jpg)

To explicitly isolate the operator's mathematical influence, we construct a controlled failure on the identical underlying float buffer. The left rendering executes a per-channel saturate operation, aggressively burning any channel value \(\ge 1\) directly to display white. The right rendering applies Khronos PBR Neutral, compressing the radiometric peak while preserving the underlying brass chromaticity. Both evaluations utilize the same exposure (\(e=1.05\)). This artifact is fundamentally distinct from the failure documented in IBL-10 (which clipped the incident radiance \(L_i\) prior to prefiltering); this operation clips the exitant radiance \(L_e\) post-shading. Given the low-variance nature of the full-frame product still, the structural degradation of the mullions is most rigorously observed via localized diagnostic crops.

![Same RGBA32F buffer, same exposure 1.05, only TM differs. Left: per-channel sat(Le) burns any channel ≥1 to display white. Right: Neutral compresses the peak and keeps brass hue. Photograph only. Full-frame is quiet — use the zooms.](/assets/journal/tone-mapping/01_clip_vs_neutral.jpg)

This localized evaluation isolates the brass window specular reflection, employing a nearest-neighbor upscale to strictly preserve pixel-level radiometric truth. On the left (CLIP — blown), the specular highlight degenerates into a flat channel-1 pancake, entirely obliterating the mullion grid structure. In the middle (NEUTRAL — structure), the \(4\times 5\) window bars and the foundational brass tint remain structurally intact. On the right (\(\vert{}\mathrm{diff}\vert{}\)), a residual heat map isolates the exact spatial divergence between the clip and Neutral operators. Even if perceptual differences appear marginal at a distance, this diagnostic crop provides definitive mathematical proof of structural data loss under the clipping operator.

![Teaching zoom of the brass-window specular, nearest upscale, pixel truth. Left CLIP — blown: channel-1 pancake, mullion grid gone. Middle NEUTRAL — structure: 4×5 bars still there, brass tint still there. Right |diff|: heat where clip and Neutral disagree.](/assets/journal/tone-mapping/01_obvious_tight.jpg)

The primary hero rendering was generated using Mesa 25.0.7 llvmpipe within a linear working color space. Applying the Khronos PBR Neutral operator (parameterized with \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\)) at an exposure of 1.05 results in an environment solid-angle mean luma of 1.628. The corresponding linear plate metrics report a \(Y_{\max}\) of 48.22 and a \(Y_{\mathrm{mean}}\) of 1.302. Prior to tone mapping at \(e=1.05\), the scene exhibits a clip_frac of 0.13355, a highlight RMS of 7.660, and a midtone mean of 0.481. Executing a naive clip/sat function marginally alters the sat_frac to 0.134, precipitously drops the highlight RMS to 0.686, and leaves the midtones invariant at 0.481. Conversely, the Neutral operator reduces the clip_frac to a mathematically safe 0, stabilizes the highlight RMS at 0.625, and yields a midtone mean of 0.441. The automated assertion suite validates this behavior, reporting 31 pass / 0 fail.


## Scene
The rendering pipeline operates strictly within a scene-referred linear Rec.709 radiance space. The analysis relies on a singular RGBA32F loft still, evaluated exactly once per shading pass. Camera extrinsics, material properties, environment maps, and split-sum integration tables remain strictly continuous with the preceding IBL evaluations (`eye (1.30, 0.54, 1.98) → (0.05, 0.25, 0.02)`, fov \(30^\circ\)). This note will not re-derive the foundational split-sum approximation established by Karis, nor the DFG lookup table, nor the distant environment irradiance \(E(\mathbf{n})\). The sole independent variable across these evaluations is the display tone mapping operator.

Visual evidence is presented in two distinct formats:

* **Presentation hook:** A \(1920\times 1080\) product still functioning as an OpenGL rendering processed through a specific CPU-side tone mapper. This visual serves strictly as a photographic representation of a named display operator.
* **Controlled failure:** A \(1920\times 660\) side-by-side diagnostic evaluated on the identical float buffer at the identical exposure, varying only the tone mapping operator. Because structural degradation is easily masked in a full-frame product still, the destruction of the brass mullions requires evaluation via localized diagnostic crops.

This four-up diagnostic utilizes a \(5\times\) nearest-neighbor upscale of the shared RGBA32F buffer. Panel (1) evaluates the hard clip/saturate function, which compresses the specular highlight into an unstructured white pancake. Panel (2) evaluates the Neutral operator, demonstrating the preservation of both the mullion structure and the underlying brass hue. Panel (3) isolates the failure domain of the hard clip, marking pixels in red that clamp to channel-1 white while the Neutral operator successfully preserves local structure. Panel (4) quantifies the absolute residual \(\vert{}\mathrm{clip}-\mathrm{Neutral}\vert{}\) as a heat map. If panels (1) and (2) are perceptually indistinguishable at typical viewing distances, panel (4) provides objective verification of the variance.

![Four-up of the same brass-window crop, 5× nearest, same exposure / same buffer. (1) hard clip/sat, specular is a flat white pancake. (2) Neutral, mullion bar + brass hue still there. (3) clip with fail pixels marked: red = channel-1 white where Neutral keeps structure. (4) |clip−Neutral| heat. If panel 1 vs 2 still looks similar from afar, trust panel 4.](/assets/journal/tone-mapping/01_obvious_diff.jpg)

Further evaluation is provided via labeled callouts on the brass specular reflection. The left evaluation confirms that a hard clip/saturate operation crushes the intrinsic material hue into a flat channel-1 response, whereas the right evaluation confirms that the Neutral operator preserves both geometric mullion detail and the baseline brass chromaticity. These plates function exclusively as qualitative photographic evidence.

![Labeled clip vs Neutral, callouts on the brass specular. Left: hard clip/sat, hue crushed to channel-1. Right: Neutral, mullion / brass color kept. Photograph only.](/assets/journal/tone-mapping/01_callouts.jpg)

Scientific rigor requires strict separation of two fundamental concepts:

1. **Beauty plates** (encompassing the hero image, the comparative clip-vs-Neutral rendering, the exposure ladder, and the Reinhard / ACES / luma controls) represent GL-rendered split-sum integrations subsequently processed via a named CPU tone mapping operator and finalized through an sRGB OETF. A visual explicitly flagged `photo-only` must not be used to derive a mathematical clip-fraction or estimate an RMS theorem from the encoded JPEG.
2. **Instruments** (including the false-color \(Y(L_o)\) mapping, the curve-on-histogram distribution of \(Y(L_e)\), the binary clip-mask isolating \(L_e>1\), and all tabulated CSV data) represent direct evaluations of the underlying float buffer. The diagnostic crops serve solely as nearest-neighbor magnifications of the beauty plates, designed to explicitly visualize structural rendering failures.

---

## Method

### Scene-referred, display-referred, then 8-bit
This evaluation spans three mathematically distinct color spaces. Conflating these domains is a common source of error when attempting to correct lighting anomalies via post-process tone curves.

1. **Scene-referred linear.** The vector \(L_o\) represents the exitant radiance immediately following the shading evaluation. Radiometric values \(\gg 1\) are mathematically valid within this domain. In the baseline loft plate, the maximum luminance is \(Y_{\max}=48.22\), with a mean of \(Y_{\mathrm{mean}}=1.302\). Scaling by an exposure of \(e=1.05\) results in exactly 276928 pixels where at least one channel of \(L_e\) exceeds 1, yielding an aggregate clip_frac of 0.13355.
2. **Display-referred linear.** The tone mapping operator compresses the unbounded radiance into the bounded domain \(L_d\in[0,1]\). Both the Khronos PBR Neutral operator and the per-channel Reinhard operator map directly into this space. However, a luminance-ratio Reinhard operator can still produce single-channel values exceeding 1, necessitating a final saturate clamp. In this context, a display code of 1 defines the upper bound.
3. **8-bit sRGB PNG.** The Opto-Electronic Transfer Function (OETF) applied here is the piecewise IEC 61966-2-1 standard, which diverges significantly from a simplistic \(\gamma=2.2\) power function. An encoded PNG integer of 255 is not numerically equivalent to a linear float of 1. Quantitative analysis must always target the uncompressed float buffer or the extracted CSV data; applying an FFT or energy integration to the non-linear JPEG is mathematically invalid.

This condition must be rigorously distinguished from the failure state detailed in IBL-10. In that prior analysis, the environment map was clamped to \(L_i\le 1\) prior to prefiltering, ensuring the lighting domain lacked genuine high dynamic range data. As a direct consequence, metallic reflections lacked specular intensity and the interior lighting distribution collapsed. Conversely, the plates evaluated here clip the exitant radiance \(L_e\) post-shading, operating on a float environment that intrinsically preserves HDR data (characterized by an environment mean luma of 1.628). While visually similar, they demonstrate a fundamentally different theoretical failure, a distinction explicitly noted on the comparative pair and the associated clip-mask.

---

### Why: expose, then a named curve, then OETF
The shading pass evaluates the scene exactly once, outputting to an RGBA32F buffer. Subsequent operator evaluations modify solely the tone mapping and encoding stages. The scalar \(e\) denotes a strict pre-TM gain—it does not represent Neutral’s \(F_{90}\) parameter, nor does it function as an automated exposure heuristic.

### Exposure is a separate pre-TM gain

The exposure scalar is applied as a direct linear multiplier:

\[L_e = e\,L_o.\]

We strictly fix \(e=1.05\) across all baseline operator comparisons to ensure continuity with prior IBL tests. For the exposure ladder evaluation, we sweep \(e\in\{0.50, 1.05, 2.00\}\) while locking the tone mapping curve. The Neutral operator's \(K_s\) compression parameter is not recalibrated during this sweep.

### Clip / saturate — controlled failure

A standard clipping or saturate function operates independently per channel:

\[L_d = \mathrm{sat}(L_e)=\min\bigl(\max(L_e,0),1\bigr) \quad\text{(per channel).}\]

Because this function lacks a smooth compressive shoulder, any channel value \(\ge 1\) clamps immediately to the display maximum. Consequently, the hue of a high-intensity brass specular reflection is determined solely by the channels that survive the clamp, causing high-energy specular reflections and matte white surfaces to degenerate into identical display codes. This artifact destroys the visual integrity of the final rendering, manifesting as the blown-out left panel in the comparative rendering and the flat, unstructured pancake in the diagnostic crops.

### Reinhard — labeled control

The standard global Reinhard operator is defined as:

\[L'=\frac{L}{1+L}.\]

This rational function asymptotically approaches, but never reaches, 1. We evaluate two specific application modes, accompanied by a control plate:

* **Per-channel.** Applying the operator independently across the \(R, G\), and \(B\) channels causes high-intensity values to desaturate toward achromatic grey, inducing severe hue shifts in the brass. On the evaluated midtone crop, this pulls the mean value down to 0.325, contrasting sharply with Neutral’s near-linear 1:1 mapping in the same region.
* **Luminance-ratio.** Operating on the Rec.709 luma, defined as \(Y=0.2126R+0.7152G+0.0722B\), the curve evaluates \(Y'=Y/(1+Y)\) and scales the color vector via \(RGB'=RGB\cdot(Y'/Y)\). While this formulation preserves hue, an individual color channel may still exceed 1 prior to a mandatory final saturate operation (resulting in a residual clip_frac of 0.056 on the mapped \(L_d\)).

The extended white-point formulation, \(L(1+L/L_w^2)/(1+L)\), is cited strictly for theoretical completeness and is not evaluated as a primary operator in this analysis.

### Narkowicz ACES — labeled control (album continuity)

Previous evaluations within this sampling series utilized the Narkowicz ACES approximation followed by a \(\gamma=2.2\) encoding. This operator is retained strictly as a labeled control to preserve longitudinal album continuity, not as the recommended hero operator. We explicitly omit any implicit 0.6 pre-scale:

\[x_{\mathrm{out}}=\mathrm{sat}\!\left(\frac{x\,(2.51x+0.03)}{x\,(2.43x+0.59)+0.14}\right).\]

This rational polynomial is applied per-channel. Within our designated midtone crop, the ACES evaluation yields a mean of 0.604, significantly higher than Neutral's 0.441, and notably exceeding the raw \(L_e\) input value of 0.481. At an input luminance of \(Y\approx 0.48\), the Narkowicz fit applies a mathematical gain \(>1\). This produces a characteristic filmic contrast curve—it does not indicate a flaw in the Neutral operator, nor does it imply the ACES fit is mathematically invalid.

### Khronos PBR Neutral — named hero

The Khronos PBR Neutral operator maps linear Rec.709 input to linear Rec.709 output bounded within \([0,1]\). The evaluation utilizes the exact constants specified by the Khronos standard (`pbrNeutral.glsl`), without arbitrary refitting. We formally cite the KhronosGroup/ToneMapping `PBR_Neutral` implementation. Gamut mapping techniques are explicitly excluded from this analysis.

\[F_{90}=0.04,\qquad K_s=0.8-F_{90}=0.76,\qquad K_d=0.15.\]

The operator executes in three sequential stages:

* **Toe.** An initial offset is subtracted from \(x=\min(R,G,B)\) to prevent dark regions from exhibiting an overly desaturated appearance when mapped 1:1 under Fresnel-aware Physically Based Rendering (PBR). The formulation assumes a baseline dielectric normal-incidence reflectance of \(F_{90}=0.04\):

\[o=\begin{cases} x-6.25\,x^{2} & x<0.08\\ F_{90} & \text{otherwise.} \end{cases} \qquad c \leftarrow c-o.\]

* **Mid.** Subsequent to the offset, base chromaticities within the interval \(0.08\le RGB\le 0.8\) (roughly mapping to sRGB codes 80–231 under a unitary white point) undergo a near-linear 1:1 mapping. If the peak channel \(P=\max(c)\) remains below the compression threshold \(K_s\), the adjusted color \(c\) is returned unmodified. This structurally invariant midtone band validates Neutral as a superior operator for product rendering. On the ceramic/catcher crop, the evaluated midtone is exactly the \(L_e\) mean minus the 0.04 offset: 0.4815 − 0.04 = 0.4415. This behavior is verified via a discrete gray-slice assertion: Neutral\((0.50,0.50,0.50)\to 0.46\).
* **Shoulder.** Peak compression initiates at the threshold \(K_s=0.76\). Defining \(d=1-K_s\):

\[P'=1-\frac{d^{2}}{P+d-K_s},\qquad c\leftarrow c\cdot\frac{P'}{P},\qquad g=1-\frac{1}{K_d(P-P')+1}.\]

The intermediate color \(c\) is interpolated toward an achromatic peak \((P',P',P')\) via the mix factor \(g\), which dictates the desaturation rate toward the compressed upper bound governed by \(K_d=0.15\).

Conclusively, Khronos PBR Neutral is designated as the optimal display operator for product-still rendering; it explicitly does not attempt to emulate complex cinematographic film responses.

### Display-referred range, then OETF

Following tone mapping, the bounded radiance \(L_d\in[0,1]\) resides in display-referred linear space. The final transformation applies the standard sRGB OETF, defined by the IEC 61966-2-1 piecewise function:

\[u'=\begin{cases} 12.92\,u & u\le 0.0031308\\ 1.055\,u^{1/2.4}-0.055 & u>0.0031308. \end{cases}\]

This non-linear encoding governs the final PNG write operation. The OpenGL state `GL_FRAMEBUFFER_SRGB` is explicitly disabled to ensure the encoding executes entirely on the CPU. All quantitative measurements in this analysis are evaluated strictly on the underlying float buffer, never on the encoded PNG output.

---

### Two paths, do not mix the instruments
| path | frames | instrument |
| --- | --- | --- |
| **Photograph** | hero, L/R pair, exposure ladder, Reinhard / ACES / luma controls | GLSL 330 split-sum on this llvmpipe into RGBA32F, then CPU TM + sRGB OETF. HUD `photo-only`. |
| **Instrument** | false-color, curve-on-hist, clip-mask, CSV | false-color \(Y(L_o)\), curve-on-hist of \(Y(L_e)\), clip-mask of \(L_e>1\), linear-crop meters. |
| **Teaching zoom** | callouts, tight crop, four-up | nearest-upscale of the brass-window specular so the mullion crush is readable. |
| **Display** | every plate | expose \(e\) → named TM → sRGB OETF. One linear \(L_o\). Operator is the knob. |

The side-by-side L/R pair functions simultaneously as a photographic record of the control state and as the source data for the localized teaching zooms. When analyzing clip-fractions and RMS metrics, one must exclusively reference the exported CSV data. It is methodologically invalid to point at an 8-bit visual panel and attempt to extract a high-precision metric such as 0.13355.

---

## Discussion

### Unique artifact: this plate’s histogram, these curves
The generation of this histogram constitutes the primary motivation for this analysis. The plot visualizes the log-domain scene-referred luminance \(Y(L_e)\) computed from the identical loft buffer utilized for the beauty renderings. The hard clip operator is strictly defined by an absolute vertical wall at \(L_d=1\). Superimposed curves characterize the mathematical behavior of the evaluated operators: the clip/saturate function (which clamps strictly at 1), Khronos PBR Neutral (rendered in gold, exhibiting near 1:1 linearity through the midtones before smoothly transitioning into a compressive shoulder at \(K_s\)), the Narkowicz ACES approximation (rendered in magenta, demonstrating an intrinsic gain \(>1\) across the midtone regime), and the Reinhard \(L/(1+L)\) function (rendered in cyan, which asymptotically approaches but never reaches 1). A thumbnail inset of this specific rendering confirms the histogram characterizes the exact scene under evaluation, explicitly distinguishing it from a generic, uncalibrated stock filmic reference.

![Log-Y histogram of this Le plate (e=1.05×Lo), clip wall at 1, Neutral / Reinhard / ACES / clip curves, thumbnail of this still. Not an RGB triangle. Not a stock filmic screenshot from another scene.](/assets/journal/tone-mapping/03_curve_on_hist.jpg)

To preserve mathematical precision: while the Khronos PBR Neutral operator executes peak compression and desaturation toward white within the RGB domain, the plotted overlay strictly evaluates a one-dimensional grayscale input via `Neutral(Y,Y,Y)`. This methodological constraint is explicitly documented on the plate. The highlighted gold band traversing the domain from 0.08 to 0.8 provides visual confirmation of the operator’s designated 1:1-ish behavior.

The accompanying false-color mapping serves as an analytical instrument rather than an aesthetic rendering. It quantifies the base-10 logarithmic luminance \(\log_{10} Y(L_o)\) strictly prior to exposure scaling and tone mapping. The visualization employs a turbo colormap corresponding to a linear \(Y\) color bar bounded from 0.01 to 31.6, with a discrete tick demarcating \(Y=1\). As visualized, radiometric returns from the window glass and the brass specular reflection reside significantly above 1, confirming that high-dynamic-range values (\(\gg 1\)) represent geometrically and radiometrically valid evaluations within a scene-referred rendering space.

![Instrument: log10 Y(Lo) before exposure and TM, turbo, color bar in linear Y from 0.01 to 31.6, tick at Y=1. Window glass and the brass reflection sit well above 1. Values ≫1 are legal scene-referred radiance. Not a beauty plate.](/assets/journal/tone-mapping/02_falsecolor_hdr.jpg)

It is imperative to maintain the distinction that the false-color map evaluates \(Y(L_o)\) before any exposure modifications. Conversely, the histogram visualizes \(Y(L_e)\) following the application of the scalar exposure \(e=1.05\), correctly aligning the unmapped data distribution with the rigid clip threshold at 1. These two distinct luminance metrics must not be conflated.

This specific diagnostic instrument composites a Neutral photograph with a binary red overlay, explicitly marking any pixel where an individual \(L_e\) channel strictly exceeds 1, supplemented by a localized diagnostic crop of the brass-window interaction. The clip operator destructively flattens the mullion geometry into a featureless region, whereas the Neutral operator preserves the critical spatial frequencies of the highlight structure. The red mask identifies the exact spatial distribution of pixels that the \(\mathrm{sat}()\) function irreversibly clamps to channel-1. The Khronos PBR Neutral operator successfully compresses this high-energy peak. This plate globally validates the structural failure formalized in the localized teaching zoom.

![Instrument: Neutral photograph plus red overlay where any Le channel >1, plus a brass/window crop. Clip flattens the mullions; Neutral keeps highlight structure. Red is the pixels sat() burns to channel-1.](/assets/journal/tone-mapping/08_clip_mask.jpg)

---

### What-if failures and controls
### What if: Clip vs Neutral

The primary diagnostic methodologies for this comparison rely on the L/R rendering pair, the localized teaching zooms, and the binary clip-mask. The foundational metric is the initial 0.13355 clip-fraction measured on \(L_e\). Application of the clip operator destructively compresses this entire data fraction into channel-1, yielding a sat_frac of 0.134, while leaving the midtones mathematically invariant at 0.481. Processing the identical input through the Khronos PBR Neutral operator successfully reduces the post-TM clip-fraction on \(L_d\) to 0; the residual sat_frac is an inconsequential 0.00004 (corresponding to a sparse distribution of pixels constrained at the compressed peak of \(\ge 0.999\)), maintaining full structural integrity within the highlight. The clip operator serves exclusively as a controlled failure baseline, not a structurally viable production operator.

Because the full-frame L/R comparison minimizes the perceptual impact of this failure, localized diagnostic crops are necessary to quantify the structural degradation. The tight crop targets the mullion grid reflected in the brass; the clip operator flattens this complex geometry into a featureless white rectangle, while Neutral preserves the high-frequency structural bars. Panel 4 of the four-up diagnostic confirms this mathematically via the heat map, establishing significant quantitative variance even where qualitative photographic assessments might suggest equivalence. The clip-mask visualization corroborates this by mapping the precise \(L_e>1\) pixels in red directly over the Neutral rendering (localizing strictly to the window, ceramic glaze rims, and brass specular lobe).

### What if: Exposure ladder under one curve

This evaluation isolates the behavior of the Neutral operator across a parameter sweep of three discrete exposures. Reducing the exposure to \(e=0.50\) intentionally underexposes the dielectric glaze, shifting the midtone mean to 0.189. The baseline configuration locked at \(e=1.05\) establishes the reference midtone at 0.441. Elevating the exposure to \(e=2.00\) forces a significantly larger proportion of the window radiance into the operator's compressive shoulder, elevating the midtone mean to 0.817 and the associated highlight RMS to 0.758. Critically, across all applied scalar gains, the post-Neutral clip-frac remains analytically 0. This evaluation is a static parameter sweep, not an automated exposure heuristic, and the compression threshold \(K_s\) remains strictly untuned. The mathematical objective is to validate the strict sequence of operations: a linear scalar gain is evaluated first, followed by the non-linear tone mapping function.

![Neutral only, e∈{0.50, 1.05, 2.00}. Curve fixed, Ks not retuned. Not auto-exposure. Photograph only.](/assets/journal/tone-mapping/04_exposure_ladder.jpg)

### What if: Reinhard vs Neutral

Evaluating the global Reinhard operator against Khronos PBR Neutral on the identical float buffer at \(e=1.05\) isolates severe radiometric divergence. The rational function \(L/(1+L)\) applied independently per RGB channel asymptotically approaches 1 without reaching it, inherently compressing the cream glaze and concrete midtones to a mean of 0.325 (deviating significantly from Neutral's 0.441 and the unmapped \(L_e\) mean of 0.481). By contrast, Neutral explicitly maintains these fundamental base colors within its designated 1:1 linear mapping band. Reinhard is included strictly as a labeled historical control, not as an alternative hero operator.

![Same buffer, same e=1.05. Left: Reinhard L/(1+L) per RGB. Right: Neutral. Reinhard pulls cream glaze / concrete midtones down. Photograph only.](/assets/journal/tone-mapping/05_reinhard_vs_neutral.jpg)

### What if: ACES vs Neutral

Evaluating the Narkowicz ACES approximation against Neutral on the identical buffer ensures methodological continuity with preceding documentation where ACES served as the default operator. As explicitly stated on the presentation plate, this comparison does not constitute an assertion that ACES generates incorrect cinematographic responses. The evaluated midtone mean of 0.604 mathematically confirms the characteristic filmic contrast curve. This evaluation was executed directly, specifically omitting any 0.6 input pre-scale adjustment.

![Same buffer, same e. Left: Narkowicz ACES. Right: Neutral. Older album default, labeled control, no 0.6 pre-scale. Not a claim that ACES is wrong cinematography. Photograph only.](/assets/journal/tone-mapping/06_aces_vs_neutral.jpg)

### What if: Per-channel vs luminance Reinhard (brass hue)

This control evaluation contrasts a per-channel Reinhard application against a luma-ratio Reinhard variant, explicitly isolated on the colored brass \(F_0\) highlight; neither function operates as a secondary hero. The measured brass \(F_0\) exhibits distinct chromaticity. Evaluated per-channel, the Reinhard operator introduces severe achromatic desaturation, shifting the resulting crop toward a non-physical white-grey. The luma-ratio implementation successfully preserves the intrinsic \(F_0\) chromaticity, although this mathematical formulation permits individual channels to exceed 1 prior to the requisite final display saturation step (producing a measured clip_frac of 0.056). Analytically, any per-channel compressive tone mapping function operates simultaneously as an unintentional chromaticity transformation. The Khronos PBR Neutral operator formally adopts a fundamentally distinct, mathematically explicit methodology: it applies peak-based luminance compression coupled with a rigorously formulated, parameterized desaturation trajectory toward white.

![Reinhard per-channel vs luma-ratio, brass highlight crop. Per-channel greys the highlight; luma-ratio keeps F0 hue. Control plate, not a second hero. Photograph only.](/assets/journal/tone-mapping/07_perchannel_vs_luma.jpg)

---

## Limits

### Honesty gaps
1. **Neutral is the named product-still display operator, not “correct cinematography.”** The Narkowicz ACES and Reinhard functions act strictly as labeled controls (ACES representing an older historical default). The hard clip is employed exclusively as a controlled failure state.
2. **Highlight RMS is photometric, not a structure meter.** A post-clip RMS of 0.686 compared to a Neutral RMS of 0.625 does not structurally rank highlight quality. To rigorously evaluate geometric preservation, analysis must rely on the clip-mask and the localized teaching zoom.
3. **ACES midtone mean (0.604).** Within this designated crop, the Narkowicz ACES mean resides significantly above the Neutral mean (0.441) and the unmapped \(L_e\) input (0.481). Because the Narkowicz fit applies a gain \(>1\) near \(Y\approx 0.48\), it yields strong filmic contrast. This is an intended characteristic, not a mathematical defect in the Neutral operator.
4. **Neutral sat_frac is \(4.2\times 10^{-5}\), not identically 0.** While mathematically negligible, a sparse subset of pixels does reach the fully compressed peak of \(\ge 0.999\). However, the operationally critical `clip_frac` (defined as any channel strictly \(>1\)) remains analytically 0.
5. **Reinhard luma-ratio still needs a final display sat.** Prior to PNG encoding, a luma-ratio Reinhard can produce out-of-bounds channels, resulting in a pre-saturate clip_frac of 0.056 on \(L_d\). In contrast, the per-channel Reinhard variant asymptotically bounds below 1.
6. **Curve overlay on the histogram is grayscale `TM(Y,Y,Y)`.** Although the Khronos PBR Neutral operator executes peak compression and desaturation within the RGB domain, the overlaid curve plotted on the histogram is evaluated purely as a scalar grayscale function, explicitly labeled `Neutral(Y,Y,Y)`.
7. **False-color is \(Y(L_o)\) before exposure.** In contrast, the plotted histogram evaluates \(Y(L_e)\) utilizing \(e=1.05\), ensuring the data wall physically aligns with the absolute clip threshold at 1.
8. **This clip is post-shading \(L_e\), not IBL-10.** The failure documented in our previous IBL-10 analysis clamped the incident radiance \(L_i\) prior to environment prefiltering, stripping genuine HDR data from the source. While visually analogous, the post-shading \(L_e\) clip demonstrated here represents an entirely distinct mathematical theorem.
9. **TM does not create lighting.** The evaluated scene radiance \(L_o\), environment distribution, and material BRDFs remain strictly invariant across all evaluations. The tone mapping curve acts solely as a transfer function allocating bounded display codes.
10. **Contact AO.** Local occlusion is evaluated via a planar cosine heuristic rather than a formalized shadow map. Furthermore, the environment (Env) is procedurally generated as an HDR loft rather than sampled from an empirical EXR capture.
11. **Excluded display hardware paths.** This implementation utilizes software CPU-side tone mapping. It does not employ dedicated hardware tonemap units, HDR10/PQ encodings, OCIO cinema LUT configurations, or local adaptive tone mapping algorithms. The current Neutral specification targets sRGB outputs strictly.
12. **JPEG / PNG is 8-bit display-referred.** It is fundamentally invalid to apply Fourier analysis (FFT) or perform energy integration directly on the non-linear encoded file. The reported midtone means and highlight RMS values are derived exclusively from the uncompressed linear-crop meters.
13. **IBL tables are reused, not proven here.** Technical methodologies regarding seamless cubemap boundaries, `glGenerateMipmap` invocations, and prefilter sample count (spp) constraints remain fully scoped to the original foundational IBL note.

---

### Mesa / llvmpipe — what this run can claim
| item | value |
| --- | --- |
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| FBO color | RGBA32F complete, \(1920\times 1080\). 8-bit fallback not hit |
| Specular / irradiance / sky cubes | RGBA16F cubemaps, CPU mips uploaded per level. `glGenerateMipmap` not called |
| DFG LUT | RGBA32F \(128^{2}\), CPU GGX (reused IBL integrator, not re-derived as a theorem) |
| `GL_FRAMEBUFFER_SRGB` | disabled (TM + sRGB OETF on CPU) |
| MSAA | disabled |
| Neutral gamut | Rec.709 in, Rec.709 out, no gamut mapping |
| Exposure / TM | 1.05 / Khronos PBR Neutral (\(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\)) |

**Can claim:** Executing on this specific llvmpipe architecture with a singular linear HDR scene buffer, scaled by a stated scalar gain, we consistently produce these documented photographic outputs employing the clip, Reinhard, ACES, and Neutral operators. The measured clip-fraction, highlight RMS, and midtone mean fluctuate exactly as tabulated in the CSV. Furthermore, the Khronos PBR Neutral function operates deterministically as the designated display operator inherited from prior IBL experiments.

**Cannot claim:** We make no assertion that the Neutral operator constitutes "correct cinematography," nor do we claim the ACES fit is mathematically erroneous. We do not assert that a histogram derived from a JPEG accurately represents the radiometric distribution of the underlying scene, nor that a PNG integer of 255 maps linearly to a radiometric 1. Modifying a transfer curve cannot synthesize missing illumination data, and this software implementation makes no structural claims regarding the operation of dedicated hardware tonemap silicon. Metrics pertaining to discrete-GPU performance, hardware occupancy, memory bandwidth, HDR10/PQ stream encoding, and OCIO cinema LUT integration fall strictly outside the boundaries of these claims.

---

## Out of scope

This analysis explicitly excludes comprehensive cinema LUT pipelines, OCIO show configuration management, film print emulation (FPE) workflows, and alternative hero tone mapping operators such as AgX, Hable, or Uncharted2. We do not evaluate HDR10, PQ, HLG, or Rec.2020 wide-gamut mastering constraints, as the evaluated Neutral specification is strictly constrained to the sRGB domain. Furthermore, local adaptive tone mapping architectures, spatial operator-based TMOs, bilateral filtering techniques, and photographic-zone mapping are excluded. Algorithmic auto-exposure metering, heuristic key-value targeting, and automated histogram-centering are bypassed, as \(e\) is treated strictly as a manually parameterized scalar gain. Color-management via ICC profiling and OS-level display mapping are avoided entirely. We similarly omit discussions of sRGB-vs-linear texture decoding, Temporal Anti-Aliasing (TAA), temporal frame accumulation, and spatial firefly-suppression filters. The re-derivation of foundational IBL mathematics—including the Karis prefilter, the DFG LUT integration, roughness-to-mip mapping distributions, and the distant irradiance integral \(E(\mathbf{n})\)—is scoped strictly to the foundational IBL documentation. We omit evaluations of Toksvig mapping, anisotropic GGX models, sheen terms, clearcoat BRDF layers, and multi-layered metallic systems. Shadow-map biasing techniques are not addressed. Finally, hardware tonemap units, real-time computational cost analysis, GPU warp occupancy, and memory bandwidth utilization fall completely outside the scope of this evaluation.

---

Dense meters follow.

---

## Appendix A — Meters (quote tables, not photographs)

All tabulated metrics are extracted directly from the uncompressed float buffer evaluated via Mesa llvmpipe. For localized analysis, the highlight crop bounds the brass window specular reflection between coordinates (1125, 475) and (1345, 635), defining an evaluation area of \(n=35200\) pixels. The midtone crop isolates the ceramic objects and concrete catcher, deliberately excluding the high-intensity window reflection, bounded from (421, 239) to (601, 399), yielding \(n=28800\) pixels. Except where the exposure ladder is explicitly evaluated, the global exposure scalar is fixed at \(e=1.05\).

| stage | operator | clip_frac | sat_frac | highlight RMS | midtone mean |
| --- | --- | --- | --- | --- | --- |
| before TM | identity \(L_e\) | **0.13355** | 0.13362 | **7.660** | **0.4815** |
| after TM | clip/sat | 0 | **0.13362** | 0.686 | **0.4815** |
| after TM | Reinhard per-channel | 0 | 0 | 0.562 | **0.325** |
| after TM | Reinhard luma-ratio | **0.05607** | 0.05657 | 0.564 | 0.325 |
| after TM | Narkowicz ACES | 0 | 0.06453 | 0.717 | 0.604 |
| after TM | **PBR Neutral** | **0** | 0.00004 | **0.625** | **0.4415** |

Neutral exposure ladder (curve fixed, \(K_s\) not retuned):

| \(e\) | highlight RMS | midtone mean | clip_frac after Neutral |
| --- | --- | --- | --- |
| 0.50 | 0.530 | **0.189** | 0 |
| 1.05 | 0.625 | **0.441** | 0 |
| 2.00 | 0.758 | **0.817** | 0 |

The environment irradiance integrates to a solid-angle mean luma of 1.628. Global evaluation of the linear plate identifies a maximum luminance of \(Y_{\max}=48.22\) and a spatial mean of \(Y_{\mathrm{mean}}=1.302\). The rendering pipeline resolves to an RGBA32F framebuffer at a resolution of \(1920\times 1080\); the driver's 8-bit fallback path is explicitly not hit.

When synthesizing these results for high-level technical summaries, adhere strictly to the established hero rounding: the baseline clip_frac is 0.13355; the localized highlight RMS decreases from 7.660 to 0.686 under the clip operator, and stabilizes at 0.625 under Neutral; the localized midtone mean transitions from 0.481 (invariant under clip) to 0.441 (Neutral) and drops significantly to 0.325 under per-channel Reinhard; the exposure ladder generates respective midtone means of 0.189, 0.441, and 0.817. Do not attempt to reverse-engineer a clip-fraction or derive an RMS evaluation visually from the hero image, the comparative L/R plate, or the Reinhard control. Such frames are explicitly designated `photo-only`.

Furthermore, it is critical to interpret the highlight RMS as a purely photometric metric, distinct from a spatial structural evaluator. Applying a hard clip yields an RMS of 0.686, heavily weighted by a dense cluster of pixels rigidly clamped to 1. Evaluation through Neutral yields a lower RMS of 0.625 due to the progressive compression enforced by the shoulder function operating below 1. The higher RMS of the clip operator does not imply the Neutral operator is destructively losing highlight data. Evaluating structural preservation—such as the discrete mullions reflecting off the brass—requires direct visual analysis of the clip-mask and diagnostic zooms rather than relying on aggregated RMS statistics.

---

## Appendix B — Assertions

This run: 31 pass / 0 fail.

| check | result |
| --- | --- |
| Required gallery plates + CSV exist and are non-empty | PASS |
| FBO is RGBA32F; 8-bit fallback not hit | PASS |
| No NaNs in \(L_o\) | PASS |
| Env mean luma in \((0.15, 25)\) | PASS 1.628 |
| Cube upload not `fail` | PASS RGBA16F |
| \(L_e\) clip-frac \(>0.002\) | PASS 0.13355 |
| Neutral clip-frac \(<10^{-4}\) | PASS 0 |
| Clip sat-frac tracks input clip-frac | PASS 0.13362 |
| Highlight RMS drops under clip and Neutral vs \(L_e\) | PASS 7.660 → 0.686 / 0.625 |
| Reinhard per-channel midtones below Neutral in the 1:1 band | PASS 0.325 < 0.441 |
| Neutral gray slice \(0.50\to 0.46\) (F90 offset, not re-fit) | PASS |
| Neutral constants not re-fit | PASS |

Assertion tolerances were strictly maintained and not artificially widened to accommodate photoreal rendering variance.

---

## Appendix C — Display lock

```text
Le = e * Lo
Ld = TM(Le)          // Neutral hero; clip / Reinhard / ACES are labeled
sRGB = OETF(sat(Ld))

```

We maintain strictly locked Neutral parameter constants without per-evaluation refitting: \(F_{90}=0.04\), \(K_s=0.76\), and \(K_d=0.15\). Both input radiance and output display coordinates remain bounded within the Rec.709 gamut. The primary hero rendering serves as the visual presentation standard. The localized tight crop provides the analytical visualization of structural degradation. The log-domain histogram stands as the definitive, unique quantitative artifact of this analysis. The sequential formula block provided above acts as the fundamental mathematical caption governing the evaluation. Across all tested variations, the pre-tone-mapped scene radiance \(L_o\) remains strictly invariant. The transfer curve functions exclusively to allocate finite display codes.
