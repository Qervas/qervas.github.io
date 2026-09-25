---
title: "Tone Mapping: Scene-Referred to Display-Referred"
description: "One linear loft still, four named operators. Clip burns 0.13355 of Le to channel-1; Neutral keeps the brass mullions. The curve allocates display codes — it does not create lighting."
date: 2026-09-16
tags:
  - graphics
  - engine
  - lighting
math: true
cover: /assets/journal/tone-mapping/00_hero.jpg
---

In our previous note, we treated environment lighting as a straightforward multiplication—a GGX-prefiltered cube combined with a DFG LUT and distant irradiance. The display phase was just a named footnote:

$$L_{\mathrm{display}}=\mathrm{TM}\bigl(\mathrm{expose}(L_o)\bigr) \quad\text{then sRGB OETF.}$$

For those tests, the tone mapping (TM) operator was **Khronos PBR Neutral** with an exposure of **1.05**. This setup remained identical across every IBL comparison row and was intentionally never baked into the cubemaps. While a deep tone-map bake-off was explicitly out of scope for the IBL breakdown, this post is dedicated entirely to evaluating that operator. The core principle to keep in mind is simple: **tone mapping allocates display codes; it does not create lighting.**

We are using the exact same loft still established in the IBL note. It features cream stoneware (a dielectric with $F_0=0.04$ and glaze roughness between $0.14$–$0.30$) alongside a measured brass sphere ($F_0=(0.910,\,0.778,\,0.423)$). These sit on a board-formed concrete catcher, grounded by contact shadows with a loft window in the background. Using our named operator at an exposure of 1.05, the metal still accurately reflects the window mullions, and the glaze convincingly reads as cream. The HUD explicitly states `Khronos PBR Neutral  exposure=1.05` and `photo-only - no metric`. As the caption on the plate emphasizes, tone mapping allocates display codes rather than creating lighting, so we should not attempt to extract a clip-fraction directly from this photograph.

![Cream stoneware bottle and brass sphere on board-formed concrete, loft window behind. Khronos PBR Neutral, exposure 1.05. Metal still carries mullions; glaze still reads cream. Photograph only — no clip-fraction.](/assets/journal/tone-mapping/00_hero.jpg)

To see the operator's impact, look at a controlled failure on the **identical** float buffer. The left side simply burns any channel $\ge 1$ straight to display white. The right side compresses the peak while preserving the brass hue. Both use the same exposure ($e=1.05$). As noted on the plate, this is not the failure from IBL-10 (which clipped $L_i$ before the prefilter); this clips $L_e$ after shading. Because the full-frame comparison is a quiet product still, the crushed mullions are best observed using the teaching zooms.

![Same RGBA32F buffer, same exposure 1.05, only TM differs. Left: per-channel sat(Le) burns any channel ≥1 to display white. Right: Neutral compresses the peak and keeps brass hue. Photograph only. Full-frame is quiet — use the zooms.](/assets/journal/tone-mapping/01_clip_vs_neutral.jpg)

**Pin this.** This is a tight crop of the brass window specular, using a nearest upscale to preserve pixel truth. On the left, **CLIP — blown**: the highlight is reduced to a channel-1 pancake, completely erasing the mullion grid. In the middle, **NEUTRAL — structure**: the $4\times 5$ window bars and the underlying brass tint remain intact. On the right, $\vert{}\mathrm{diff}\vert{}$: a heat map reveals exactly where the clip and Neutral operators disagree. Even if the left and right panels looked similar from across the room, this tight crop serves as definitive proof of the lost data.

![Teaching zoom of the brass-window specular, nearest upscale, pixel truth. Left CLIP — blown: channel-1 pancake, mullion grid gone. Middle NEUTRAL — structure: 4×5 bars still there, brass tint still there. Right |diff|: heat where clip and Neutral disagree.](/assets/journal/tone-mapping/01_obvious_tight.jpg)

For our hero shot, the scene was rendered using Mesa 25.0.7 llvmpipe in a linear working space. Applying **Khronos PBR Neutral** ($F_{90}=0.04$, $K_s=0.76$, $K_d=0.15$) with an exposure of **1.05** yields an environment solid-angle mean luma of **1.628**. The linear plate metrics are $Y_{\max}$ **48.22** and $Y_{\mathrm{mean}}$ **1.302**. Before tone mapping at $e=1.05$, the clip_frac is **0.13355**, the highlight RMS is **7.660**, and the midtone mean is **0.481**. After applying a simple clip/sat function, the sat_frac becomes **0.134**, the highlight RMS drops to **0.686**, and the midtones remain unchanged at **0.481**. After utilizing the Neutral operator, the clip_frac drops safely to **0**, highlight RMS settles at **0.625**, and the midtone mean is **0.441**. Across this entire suite, assertions report **31 pass / 0 fail**.

---

## What you are seeing

Our working space operates entirely in **scene-referred linear Rec.709 radiance**. This relies on a single RGBA32F loft still that has been shaded exactly once. The camera, materials, environment, and split-sum tables remain continuous with our previous IBL tests (`eye (1.30, 0.54, 1.98) → (0.05, 0.25, 0.02)`, fov $30^\circ$). This post will not re-derive Brian Karis's split-sum approximation, the DFG LUT, or distant $E(\mathbf{n})$. Instead, we are exclusively changing the display operator.

We present the visuals in two primary formats:

* **Presentation hook:** A $1920\times 1080$ product still acting as a GL photograph using a CPU tone map. This relies on a named display operator and is strictly intended as a photograph.

* **Controlled failure:** A $1920\times 660$ side-by-side comparison using the identical float buffer and exposure, differing only in the tone mapping operator. Because the full-frame pair is relatively quiet, the structural crush of the brass mullions is best observed in the teaching zooms.

This four-up view uses a $5\times$ nearest upscale on the identical buffer. Panel (1) demonstrates the hard clip/sat, reducing the specular highlight to a flat white pancake. Panel (2) shows the Neutral operator preserving both the mullion bars and the underlying brass hue. Panel (3) explicitly marks the failure pixels of the hard clip in red, indicating where it hits channel-1 white while Neutral successfully maintains the structure. Panel (4) highlights the $\vert{}\mathrm{clip}-\mathrm{Neutral}\vert{}$ heat difference. As the caption states: *if panel 1 vs 2 still looks similar from afar, trust panel 4.*

![Four-up of the same brass-window crop, 5× nearest, same exposure / same buffer. (1) hard clip/sat, specular is a flat white pancake. (2) Neutral, mullion bar + brass hue still there. (3) clip with fail pixels marked: red = channel-1 white where Neutral keeps structure. (4) |clip−Neutral| heat. If panel 1 vs 2 still looks similar from afar, trust panel 4.](/assets/journal/tone-mapping/01_obvious_diff.jpg)

We also include labeled callouts on the brass specular reflection. The left side reinforces how a hard clip/sat crushes the hue to channel-1, while the right side demonstrates how Neutral preserves the mullion detail and brass color. These images are strictly intended as photographs.

![Labeled clip vs Neutral, callouts on the brass specular. Left: hard clip/sat, hue crushed to channel-1. Right: Neutral, mullion / brass color kept. Photograph only.](/assets/journal/tone-mapping/01_callouts.jpg)

There are two foundational facts that must never be conflated:

1. **Beauty plates** (including the hero image, the clip-vs-Neutral comparison, the exposure ladder, and the Reinhard / ACES / luma controls) are GL-rendered split-sums processed through a named CPU TM and then an sRGB OETF. A HUD labeled `photo-only` means you should not attempt to invent a clip-fraction or derive an RMS theorem directly from the JPEG.

2. **Instruments** (such as the false-color $Y(L_o)$, the curve-on-histogram of $Y(L_e)$, the clip-mask targeting $L_e>1$, and the CSV data) represent the underlying float buffer. The teaching zooms are simply nearest-upscale crops of the beauty plates designed to make rendering failures legible.

---

## Scene-referred, display-referred, then 8-bit

There are three distinct color spaces at play here. Mixing them up is typically how developers attempt to "fix lighting" using a tone curve.

1. **Scene-referred linear.** $L_o$ represents the radiance immediately after shading. Values $\gg 1$ are perfectly legal in this space. In our loft plate, $Y_{\max}=48.22$ and $Y_{\mathrm{mean}}=1.302$. At an exposure of $e=1.05$, exactly **276928** pixels contain an $L_e$ channel $>1$, giving us a clip_frac of **0.13355**.

2. **Display-referred linear.** After tone mapping, the values are compressed into $L_d\in[0,1]$. Both the Neutral operator and the per-channel Reinhard operator land directly in this space. A luma-ratio Reinhard, however, can still overshoot a single channel and will require a final saturate operation. For the purposes of this post, this is what a display code of 1 represents.

3. **8-bit sRGB PNG.** The Opto-Electronic Transfer Function (OETF) used here is the piecewise IEC 61966-2-1 standard, which is **not** a simple $\gamma=2.2$ curve. A PNG value of 255 does not equate to a linear value of 1. Proper measurement must always be done on the float buffer or CSV data; do not attempt to run an FFT or energy-integrate the resulting JPEG.

It is vital to distinguish this scenario from the failure shown in IBL-10. In that previous note, the plate authored $L_i\le 1$ *before* the prefilter step, meaning the environment never actually possessed high dynamic range. Consequently, metals lost their visual punch and the interior lighting collapsed. In contrast, the plates in this post clip $L_e$ *after* shading, utilizing a float loft environment that genuinely contains HDR data (with an environment mean luma of **1.628**). They belong to the same visual family but illustrate an entirely different theorem, a fact stated plainly on the L/R pair and the clip-mask.

---

## Why: expose, then a named curve, then OETF

We shade the scene exactly once into an RGBA32F buffer. The different operator rows only modify the tone mapping and encoding phases. Here, $e$ represents a stated gain—it is not Neutral’s $F_{90}$ parameter, nor is it an auto-exposure meter.

### Exposure is a separate pre-TM gain

Exposure is applied simply as:

$$L_e = e\,L_o.$$

We lock $e=1.05$ by default on every operator comparison to maintain IBL continuity. For our exposure ladder, we vary $e\in\{0.50,\,1.05,\,2.00\}$ while keeping **one** fixed curve. Neutral’s $K_s$ parameter is not retuned during this process.

### Clip / saturate — controlled failure

A standard clip or saturate function operates per-channel:

$$L_d = \mathrm{sat}(L_e)=\min\bigl(\max(L_e,0),1\bigr) \quad\text{(per channel).}$$

Because this operator lacks a shoulder, any channel $\ge 1$ is immediately clamped to display white. The hue of a clipped brass highlight is dictated solely by whichever color channel survives the clamp, causing shiny white and matte white to merge into the exact same code. This destroys the visual integrity of the product still. This is the blown-out left panel of our L/R comparison and the flat pancake effect seen in the teaching zooms.

### Reinhard — labeled control

The global form of Reinhard is:

$$L'=\frac{L}{1+L}.$$

This curve never mathematically reaches 1. We demonstrate two application modes along with one control plate:

* **Per-channel.** Applied independently to $R,G,B$, this causes highlights to desaturate toward grey and the brass hue to shift. On our midtone crop, this pulls the value down to **0.325**, compared to Neutral’s relatively linear 1:1-ish band.

* **Luminance-ratio.** Based on the Rec.709 luma $Y=0.2126R+0.7152G+0.0722B$, we calculate $Y'=Y/(1+Y)$ and apply $RGB'=RGB\cdot(Y'/Y)$. While this preserves hue, a color channel can still exceed 1 before the final saturate operation (leaving a clip_frac of **0.056** on $L_d$).

The extended white-point Reinhard formula, $L(1+L/L_w^2)/(1+L)$, is only mentioned for context and is not featured as a hero operator here.

### Narkowicz ACES — labeled control (album continuity)

Older sampling notes in this series were displayed using Narkowicz ACES followed by a $\gamma=2.2$ curve. We retain this operator strictly as a **labeled control** for album continuity, not as the hero. We intentionally omit any silent $0.6$ pre-scale:

$$x_{\mathrm{out}}=\mathrm{sat}\!\left(\frac{x\,(2.51x+0.03)}{x\,(2.43x+0.59)+0.14}\right).$$

This is applied per-channel. On our midtone crop, the ACES mean of **0.604** sits notably higher than Neutral's **0.441**, and even exceeds the raw $L_e$ value of **0.481**. At a luminance around $Y\approx 0.48$, the Narkowicz fit inherently applies a gain $>1$. This produces a pleasing filmic contrast—it is not a defect of the Neutral operator, nor does it imply that ACES is mathematically wrong.

### Khronos PBR Neutral — named hero

The Khronos PBR Neutral operator takes linear Rec.709 in and outputs linear Rec.709 bounded to $[0,1]$. We use the exact constants provided by the Khronos spec (`pbrNeutral.glsl`), without refitting them. We cite KhronosGroup/ToneMapping `PBR_Neutral` directly. Gamut mapping is excluded from this note.

$$F_{90}=0.04,\qquad K_s=0.8-F_{90}=0.76,\qquad K_d=0.15.$$

The operator runs in three stages:

* **Toe.** It begins with an offset applied from $x=\min(R,G,B)$ to ensure that dark regions do not suffer from a raw 1:1 mapping that appears overly desaturated under Fresnel-aware PBR. The operator is built around a default dielectric normal-incidence term of $F_{90}=0.04$:

$$o=\begin{cases} x-6.25\,x^{2} & x<0.08\\ F_{90} & \text{otherwise.} \end{cases} \qquad c \leftarrow c-o.$$

* **Mid.** Following the offset, base colors falling within the band of $0.08\le RGB\le 0.8$ (corresponding roughly to sRGB 80–231 under unitary white) remain mostly 1:1-ish. If the peak channel $P=\max(c)$ is less than $K_s$, the modified color $c$ is returned. This reliable midtone band is exactly why Neutral excels as a product-still operator. On our ceramic/catcher crop, the midtone is precisely the $L_e$ mean minus the $0.04$ offset: **0.4815 − 0.04 = 0.4415**. We verified this with a gray slice assertion: Neutral$(0.50,0.50,0.50)\to 0.46$.

* **Shoulder.** Peak compression engages at $K_s=0.76$. Letting $d=1-K_s$:

$$P'=1-\frac{d^{2}}{P+d-K_s},\qquad c\leftarrow c\cdot\frac{P'}{P},\qquad g=1-\frac{1}{K_d(P-P')+1}.$$

The color $c$ is then mixed toward $(P',P',P')$ based on a mix factor $g$, which controls the desaturation toward the compressed peak at a rate of $K_d=0.15$.

Ultimately, Neutral is designated as the named product-still display operator; it does not aim to emulate "correct cinematography".

### Display-referred range, then OETF

After tone mapping, our output $L_d\in[0,1]$ resides in **display-referred linear** space. We then apply the standard sRGB OETF (IEC 61966-2-1 piecewise):

$$u'=\begin{cases} 12.92\,u & u\le 0.0031308\\ 1.055\,u^{1/2.4}-0.055 & u>0.0031308. \end{cases}$$

This encoding dictates our PNG write process. Note that `GL_FRAMEBUFFER_SRGB` is disabled. All measurements in this note are strictly taken from the float buffer, never the resulting PNG.

---

## Unique artifact: this plate’s histogram, these curves

This histogram is the primary reason this document exists. It plots the log-$x$ scene-referred $Y(L_e)$ using the same loft buffer as the beauty renders, displaying the hard clip as a rigid wall at 1. The overlay includes the clip/sat (which hits 1 and stays), Neutral (shown in gold, remaining 1:1-ish through the midtones with a smooth shoulder after $K_s$), Narkowicz ACES (in magenta, exhibiting a gain $>1$ in the midtones), and Reinhard $L/(1+L)$ (in cyan, which never fully reaches 1). A thumbnail of **this** specific still is included to prove it is not a generic stock filmic screenshot.

![Log-Y histogram of this Le plate (e=1.05×Lo), clip wall at 1, Neutral / Reinhard / ACES / clip curves, thumbnail of this still. Not an RGB triangle. Not a stock filmic screenshot from another scene.](/assets/journal/tone-mapping/03_curve_on_hist.jpg)

To maintain complete honesty: while Neutral's peak compression and desaturation target white are evaluated in RGB, the overlaid curve is a grayscale pass `Neutral(Y,Y,Y)`. This is explicitly labeled on the plate. The gold band in the legend highlights the $0.08\ldots 0.8$ range, visually confirming the 1:1-ish behavior.

This false-color rendering is an analytical instrument, not a hero plate. It visualizes $\log_{10} Y(L_o)$ prior to exposure and tone mapping using a turbo colormap, accompanied by a linear $Y$ color bar ranging from 0.01 to 31.6, with a specific tick at $Y=1$. As shown, the window glass and the brass reflection sit comfortably above 1, demonstrating that values $\gg 1$ are perfectly legal within scene-referred radiance.

Crucially, the false-color map displays $Y(L_o)$ **before** exposure. The histogram plots $Y(L_e)$ at $e=1.05$ so that the data wall aligns accurately with the clip operator at 1. Do not conflate these two variations of $Y$.

![Instrument: log10 Y(Lo) before exposure and TM, turbo, color bar in linear Y from 0.01 to 31.6, tick at Y=1. Window glass and the brass reflection sit well above 1. Values ≫1 are legal scene-referred radiance. Not a beauty plate.](/assets/journal/tone-mapping/02_falsecolor_hdr.jpg)

This instrument combines a Neutral photograph with a stark red overlay highlighting any pixel where an $L_e$ channel is $>1$, paired with a brass/window crop. The clip operator aggressively flattens the mullions, whereas Neutral skillfully preserves the highlight structure. The red overlay precisely identifies the pixels that the $\mathrm{sat}()$ function forces down to channel-1. Neutral successfully compresses this peak. This illustrates the exact same theorem as our teaching zoom, but applied globally across the entire plate.

![Instrument: Neutral photograph plus red overlay where any Le channel >1, plus a brass/window crop. Clip flattens the mullions; Neutral keeps highlight structure. Red is the pixels sat() burns to channel-1.](/assets/journal/tone-mapping/08_clip_mask.jpg)

---

## Quote the CSV. Do not quote the beauty photographs as meters.

All data is pulled from the float buffer rendered via Mesa llvmpipe. For our metrics, the highlight crop bounds the brass window specular from $(1125,475)$ to $(1345,635)$ yielding $n=35200$. The midtone crop isolates the ceramic and catcher away from the bright window specular from $(421,239)$ to $(601,399)$ with $n=28800$. Unless exploring the Neutral ladder, exposure remains fixed at $e=1.05$.

| stage | operator | clip_frac | sat_frac | highlight RMS | midtone mean |
| --- | --- | --- | --- | --- | --- |
| before TM | identity $L_e$ | **0.13355** | 0.13362 | **7.660** | **0.4815** |
| after TM | clip/sat | 0 | **0.13362** | 0.686 | **0.4815** |
| after TM | Reinhard per-channel | 0 | 0 | 0.562 | **0.325** |
| after TM | Reinhard luma-ratio | **0.05607** | 0.05657 | 0.564 | 0.325 |
| after TM | Narkowicz ACES | 0 | 0.06453 | 0.717 | 0.604 |
| after TM | **PBR Neutral** | **0** | 0.00004 | **0.625** | **0.4415** |

Neutral exposure ladder (curve fixed, $K_s$ not retuned):

| $e$ | highlight RMS | midtone mean | clip_frac after Neutral |
| --- | --- | --- | --- |
| 0.50 | 0.530 | **0.189** | 0 |
| 1.05 | 0.625 | **0.441** | 0 |
| 2.00 | 0.758 | **0.817** | 0 |

The environment’s solid-angle mean luma evaluates to **1.628**. The linear plate peaks at a $Y_{\max}$ of **48.22** and averages a $Y_{\mathrm{mean}}$ of **1.302**. The FBO is processed in **RGBA32F** at $1920\times 1080$; the 8-bit fallback is **not hit**.

When discussing these renders, rely on the specific hero rounding used in the lede: clip_frac is **0.13355**; highlight RMS drops from **7.660 → 0.686** (clip) / **0.625** (Neutral); midtones shift from **0.481** (clip, unchanged) to **0.441** (Neutral) to **0.325** (Reinhard RGB); the exposure ladder hits **0.189 / 0.441 / 0.817**. Do **not** attempt to invent a clip-fraction or derive an RMS theorem directly from the hero, the L/R pair, or the Reinhard plate. Those frames are strictly `photo-only`.

Furthermore, highlight RMS serves as a photometric measurement, not an evaluation of structure. After a hard clip, the crop RMS registers at **0.686** due to a massive cluster of pixels parked exactly at 1. After processing through Neutral, it drops to **0.625** because the shoulder gently compresses below 1. The fact that the clip RMS is greater than the Neutral RMS does not mean that Neutral is "losing" highlight data. For structural validation—such as the mullions reflecting in the brass—you must consult the clip-mask and the teaching zoom, not the RMS rankings.

---

## Failures / controls

### Clip vs Neutral

Our primary analysis tools here are the L/R pair, the teaching zooms, and the clip-mask. The core input fact is the **0.13355** clip-fraction of $L_e$. After the clip is applied, that entire fraction of data is burned into channel-1, yielding a sat_frac of **0.134** while the midtones remain completely untouched at **0.481**. When routed through Neutral, the clip-fraction on the resulting $L_d$ is successfully reduced to **0**; the sat_frac is a negligible $4.2\times 10^{-5}$ (representing merely a handful of pixels parked at the compressed peak of $\ge 0.999$), and highlight structure is preserved. This clip operator represents our controlled failure, not a viable contestant.

Because the full-frame L/R pair presents as a relatively quiet product still, we provide the zooms to make the failure readable. The tight crop isolates the mullion grid in the brass window reflection: the clip reduces it to a flat white rectangle, whereas Neutral retains the distinct bars. Panel 4 of our four-up comparison provides the heat proof, demonstrating the massive delta even if the standard photos look deceptively similar. The clip-mask visually confirms this by painting the exact same $L_e>1$ pixels red directly over the Neutral plate (targeting the window, glaze rims, and brass spec) while repeating the crop.

### Exposure ladder under one curve

This sequence demonstrates Neutral operating exclusively across three distinct exposures. Dropping to $e=0.50$ underexposes the glaze, pulling the midtone down to **0.189**. The standard lock at $e=1.05$ provides our baseline midtone of **0.441**. Pushing the exposure to $e=2.00$ forces much more of the window data into Neutral's shoulder, raising the midtone to **0.817** and the highlight RMS to **0.758**. Across all three gain adjustments, the clip-frac post-Neutral stays at 0. This is not auto-exposure, and $K_s$ is never retuned. The scientific point is the strict split: gain is applied first, and the curve handles the rest.

![Neutral only, e∈{0.50, 1.05, 2.00}. Curve fixed, Ks not retuned. Not auto-exposure. Photograph only.](/assets/journal/tone-mapping/04_exposure_ladder.jpg)

### Reinhard vs Neutral

Comparing Reinhard to Neutral on the identical buffer at $e=1.05$ reveals a stark difference. The Reinhard $L/(1+L)$ curve applied per RGB asymptotically approaches but never reaches 1, inherently dragging the cream glaze and concrete midtones down to **0.325** (compared to Neutral's **0.441** and the raw $L_e$ average of **0.481**). In contrast, Neutral preserves those base colors through its 1:1-ish band. Reinhard is provided purely as a labeled control, not as a second hero operator.

![Same buffer, same e=1.05. Left: Reinhard L/(1+L) per RGB. Right: Neutral. Reinhard pulls cream glaze / concrete midtones down. Photograph only.](/assets/journal/tone-mapping/05_reinhard_vs_neutral.jpg)

### ACES vs Neutral

Running Narkowicz ACES against Neutral on the same buffer provides continuity with older albums where ACES was the default. As stated on the plate, this comparison is *not a claim that ACES produces incorrect cinematography*. The resulting midtone mean of **0.604** clearly illustrates the filmic contrast previously discussed. This was tested directly, without employing a $0.6$ input pre-scale.

![Same buffer, same e. Left: Narkowicz ACES. Right: Neutral. Older album default, labeled control, no 0.6 pre-scale. Not a claim that ACES is wrong cinematography. Photograph only.](/assets/journal/tone-mapping/06_aces_vs_neutral.jpg)

### Per-channel vs luminance Reinhard (brass hue)

This control plate contrasts a per-channel Reinhard against a luma-ratio Reinhard specifically on the colored $F_0$ brass highlight; neither is considered a second hero. The measured brass $F_0$ is distinctly colored. When applied per-channel, Reinhard severely greys out the highlight, pushing the crop towards a white-grey. The luma-ratio variant successfully maintains the $F_0$ hue, though individual channels can still eclipse 1 before the final display saturate (yielding a clip_frac of **0.056**). Ultimately, a per-channel tone mapper acts as an unintentional hue operator. Neutral intentionally takes a different, explicitly stated approach: peak-based compression combined with a calculated desaturation toward white.

![Reinhard per-channel vs luma-ratio, brass highlight crop. Per-channel greys the highlight; luma-ratio keeps F0 hue. Control plate, not a second hero. Photograph only.](/assets/journal/tone-mapping/07_perchannel_vs_luma.jpg)

---

## Two paths, do not mix the instruments

| path | frames | instrument |
| --- | --- | --- |
| **Photograph** | hero, L/R pair, exposure ladder, Reinhard / ACES / luma controls | GLSL 330 split-sum on this llvmpipe into RGBA32F, then CPU TM + sRGB OETF. HUD `photo-only`. |
| **Instrument** | false-color, curve-on-hist, clip-mask, CSV | false-color $Y(L_o)$, curve-on-hist of $Y(L_e)$, clip-mask of $L_e>1$, linear-crop meters. |
| **Teaching zoom** | callouts, tight crop, four-up | nearest-upscale of the brass-window specular so the mullion crush is readable. |
| **Display** | every plate | expose $e$ → named TM → sRGB OETF. One linear $L_o$. Operator is the knob. |

The side-by-side L/R pair acts simultaneously as a photograph of the control *and* the source imagery for our teaching zooms. Always quote the CSV when discussing the clip-fraction and RMS. Do not point at an 8-bit visual panel and attempt to extract a precision metric like 0.13355.

---

## Honesty gaps

1. **Neutral is the named product-still display operator, not “correct cinematography.”** ACES and Reinhard both serve strictly as labeled controls (ACES being an older album default). The hard clip acts only as our controlled failure.

2. **Highlight RMS is photometric, not a structure meter.** A clip RMS of **0.686** versus a Neutral RMS of **0.625** does not rank highlight quality in a structural sense. To properly evaluate structure, you must consult the clip-mask and the teaching zoom.

3. **ACES midtone mean (0.604)** inherently sits higher than Neutral (0.441) and the unmapped $L_e$ (0.481) on this specific crop. Because Narkowicz ACES has a gain $>1$ around $Y\approx 0.48$, this produces strong filmic contrast rather than indicating a defect in Neutral.

4. **Neutral sat_frac is $4.2\times 10^{-5}$, not identically 0.** While tiny, a handful of pixels do hit the compressed peak of $\ge 0.999$. The true `clip_frac` (any channel $>1$), however, is a mathematically pure 0.

5. **Reinhard luma-ratio still needs a final display sat** for PNG encoding (resulting in a clip_frac of **0.056** on $L_d$ before sat). Per-channel Reinhard never reaches 1.

6. **Curve overlay on the histogram is grayscale `TM(Y,Y,Y)`.** While Neutral’s actual peak compression and desaturation toward white are evaluated in RGB, the overlaid visualization is purely grayscale, clearly labeled as `Neutral(Y,Y,Y)`.

7. **False-color is $Y(L_o)$ before exposure.** Conversely, the histogram visualizes $Y(L_e)$ with $e=1.05$ so the data wall physically matches the clip operator at 1.

8. **This clip is post-shading $L_e$, not IBL-10.** Our previous IBL-10 demonstration clipped $L_i$ before the prefilter, meaning the source lacked actual HDR. Although visually similar, these two failures represent entirely different theorems.

9. **TM does not create lighting.** The scene radiance $L_o$, environment, and materials are identical across all tests. The curve simply dictates how to allocate display codes.

10. **Contact AO** relies on a planar cosine term rather than a standard shadow map. The **Env** is generated as a procedural loft HDR rather than a captured EXR image.

11. **No hardware tonemap unit, no PQ/HDR10, no OCIO cinema LUT, no local adaptive TM as hero.** The current specification for Neutral is strictly targeted at sRGB. While local adaptive tone mapping certainly exists, it is not utilized on this plate.

12. **JPEG / PNG is 8-bit display-referred.** Do not attempt to run an FFT or energy-integrate the resulting file. Midtone mean and highlight RMS are derived exclusively from linear-crop meters.

13. **IBL tables are reused, not proven here.** All details regarding seamless-cube face edges, `glGenerateMipmap`, and prefilter sample counts (spp) caveats remain scoped to the original IBL note.

---

## Mesa / llvmpipe — what this run can claim

| item | value |
| --- | --- |
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| FBO color | **RGBA32F** complete, $1920\times 1080$. 8-bit fallback **not hit** |
| Specular / irradiance / sky cubes | **RGBA16F** cubemaps, CPU mips uploaded per level. `glGenerateMipmap` **not** called |
| DFG LUT | RGBA32F $128^{2}$, CPU GGX (reused IBL integrator, not re-derived as a theorem) |
| `GL_FRAMEBUFFER_SRGB` | disabled (TM + sRGB OETF on CPU) |
| MSAA | disabled |
| Neutral gamut | Rec.709 in, Rec.709 out, no gamut mapping |
| Exposure / TM | **1.05** / **Khronos PBR Neutral** ($F_{90}=0.04$, $K_s=0.76$, $K_d=0.15$) |

Can claim: Operating on this specific llvmpipe build with a single linear HDR loft buffer, exposed via a stated gain, we can reliably produce these exact photographs using clip, Reinhard, ACES, and Neutral operators. The clip-fraction, highlight RMS, and midtone mean fluctuate exactly as documented in the CSV. Furthermore, Neutral serves efficiently as the named display operator carried forward from our IBL experiments.

Cannot claim: We cannot assert that Neutral represents "correct cinematography," nor can we claim that ACES is mathematically wrong. We cannot claim that a JPEG histogram accurately reflects the underlying scene histogram, or that a PNG value of 255 cleanly equates to a linear 1. Modifying a curve does not miraculously invent lighting, and our software implementation does not necessarily mirror the inner workings of a dedicated hardware display chip's tonemap unit. Discrete-GPU metrics, occupancy, bandwidth concerns, HDR10/PQ encoding, and OCIO cinema LUTs fall entirely outside the scope of these claims.

---

## Assertions

This run: **31 pass / 0 fail**.

| check | result |
| --- | --- |
| Required gallery plates + CSV exist and are non-empty | PASS |
| FBO is RGBA32F; 8-bit fallback not hit | PASS |
| No NaNs in $L_o$ | PASS |
| Env mean luma in $(0.15,\,25)$ | PASS **1.628** |
| Cube upload not `fail` | PASS **RGBA16F** |
| $L_e$ clip-frac $>0.002$ | PASS **0.13355** |
| Neutral clip-frac $<10^{-4}$ | PASS **0** |
| Clip sat-frac tracks input clip-frac | PASS **0.13362** |
| Highlight RMS drops under clip and Neutral vs $L_e$ | PASS **7.660 → 0.686 / 0.625** |
| Reinhard per-channel midtones below Neutral in the 1:1 band | PASS **0.325 < 0.441** |
| Neutral gray slice $0.50\to 0.46$ (F90 offset, not re-fit) | PASS |
| Neutral constants not re-fit | PASS |

No assert tolerances were loosened to accommodate the photoreal plates.

---

## Out of scope

This note explicitly ignores full cinema LUT pipelines, OCIO show configurations, film print emulations, and alternative hero operators like AgX, Hable, or Uncharted2. We are not addressing HDR10, PQ, HLG, or Rec.2020 mastering workflows, as Neutral’s current spec targets sRGB. Local adaptive tone mapping, operator-based TMOs, bilateral filtering, and photographic-zone mapping are completely evaluated. Auto-exposure metering, key-value targeting, and histogram-centering are excluded because $e$ is treated strictly as a manual, stated gain. Color-management ICC profiling and the display-profile rabbit hole are avoided entirely. We also skip sRGB-vs-linear texture decoding, TAA, temporal accumulation, and firefly-suppression. Re-deriving foundational IBL mathematics—such as the Karis prefilter, the DFG LUT, roughness-to-mip mapping, or distant $E(\mathbf{n})$—belongs in the live IBL note, not here. We skip Toksvig integration, anisotropic GGX, sheen, clearcoat layers, and layered metals. Shadow-map bias is not covered. Finally, hardware tonemap units, real-time computational cost, GPU occupancy, and memory bandwidth are completely out of bounds.

---

## Display lock

```text
Le = e * Lo
Ld = TM(Le)          // Neutral hero; clip / Reinhard / ACES are labeled
sRGB = OETF(sat(Ld))

```

We maintain locked Neutral constants without re-fitting them: $F_{90}=0.04$, $K_s=0.76$, and $K_d=0.15$. Input and output both remain in Rec.709. Pin the hero image as our presentation standard. Pin the tight crop to visualize the structural failure. Pin the histogram as the definitive, unique artifact of this evaluation. The formula block above essentially serves as the ultimate caption. Across all these variations, the scene radiance $L_o$ never changes. The curve simply dictates how to allocate display codes.
