---
title: "Multiple Importance Sampling and the Balance Heuristic"
description: "Kiln-mouth glaze shelf. Balance wi=pi/(p_bsdf+p_light). Lip light disk stderr 0.308; winners lip=bsdf, miss=light. Lo,Y lip 0.8922731625666653. 53 pass / 0 fail."
date: 2026-09-26
tags:
  - graphics
  - engine
  - lighting
math: true
cover: /assets/journal/multiple-importance-sampling-and-the-balance-heuristic/00_hero.jpg
---
多重重要性采样与平衡启发式

Our last note, [Light Sampling and the Area Jacobian](/posts/p/light-sampling-and-the-area-jacobian/), put a legal light density on \(d\omega\). The note before that, [Importance Sampling: Phong Lobe vs Cosine](/posts/p/importance-sampling-phong-lobe-vs-cosine/), kept two BSDF pdfs on one integral, both already in \(1/\mathrm{sr}\). This note puts the two ideas on the same mouth.

Two legal densities estimate one direct-light integral. One is a Phong–Lambert BSDF. The other draws a point uniformly on a rectangle and pushes that area density through the area Jacobian. Each arm, divided by the density it actually sampled, is unbiased. Each one is noisy where the other one is quiet. The balance heuristic weights the sample by its own pdf over the sum of the two:

\[
w_i=\frac{p_i}{p_{\mathrm{bsdf}}+p_{\mathrm{light}}}.
\]

The variance moves. The estimator stays unbiased. With equal technique counts the \(n_i\) cancel, and the weight on the page is \(w_i=p_i/(p_{\mathrm{bsdf}}+p_{\mathrm{light}})\). The light weight still carries \(r^2\). Dropping \(r^2\), or dropping the emitter cosine, is a biased floor, and that floor belongs to the area-Jacobian note. This note does not put the omission on a plate.

[Importance Sampling: Phong Lobe vs Cosine](/posts/p/importance-sampling-phong-lobe-vs-cosine/) owns variance as the photograph for two BSDF pdfs, and the split that puts \((s+1)\) in the pdf and \((s+2)\) in the BRDF. We keep that split and that horizon rule. We do not rematch Phong against cosine, and we do not reprint that note's RMSE pair. [Light Sampling and the Area Jacobian](/posts/p/light-sampling-and-the-area-jacobian/) owns

\[
p(\omega)=p(A)\,\frac{r^2}{n_y\cdot\omega}.
\]

We reimplement that factor as \(p_{\mathrm{light}}\). [Solid Angle and the Rendering Equation](/posts/p/solid-angle-and-the-rendering-equation/) owns the projected solid angle a diffuse term integrates. The Lambert piece here uses that same signed contour. The disk ratios and the omission floors stay in their own notes.

Say hello to the **kiln-mouth glaze shelf**. A rectangular muffle mouth sits flush in firebrick. One pale glaze tile lies flat on a stoneware shelf. Two matte pyrometric cones and one wooden rib give scale. The camera is inside the kiln, low along the shelf, looking at the mouth. The loft bottle, the metro colonnade, the gallery lacquer sphere, the courtyard atrium, and the night inspection bench stay in their own notes.

![Cover. Kiln-mouth glaze shelf: a rectangular muffle mouth flush in firebrick, one pale glaze tile on a stoneware shelf, two matte pyrometric cones and a wooden rib for scale. Balance arm at N=1024 plus the analytic diffuse fill. Khronos PBR Neutral e=1.00. Photograph only — Lo,Y and the RMSE are not this frame.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/00_hero.jpg)

Let's run the hero stats. Mesa 25.0.7 llvmpipe, linear Rec.709, **Khronos PBR Neutral** \(e=\mathbf{1.00}\), seed **20260926**. \(k_d=0.34\), \(k_s=0.28\), \(s=160\). \(L_i=(7.5,\,4.8,\,2.2)\), so \(L_{i,Y}=5.186299999999999\). Mouth area \(0.2596\,\mathrm{m}^2\). The bound product in the metrics table is \(0.2595999999999999\).

Lip \(x_L=(0.04,\,0.90,\,0.40)\): \(\Omega_\perp=\mathbf{0.3212572527424995}\,\mathrm{sr}\), \(L_{o,Y}=\mathbf{0.8922731625666653}\), specular over diffuse \(\mathbf{3.948324937768523}\). Miss \(x_M=(-0.28,\,0.90,\,0.28)\): \(\Omega_\perp=\mathbf{0.2742559005975028}\,\mathrm{sr}\), \(L_{o,Y}=\mathbf{0.1539368726945163}\), specular over diffuse \(2.114893779357608\times 10^{-10}\). That miss ratio is zero beside the Lambert term.

Winners, the single arm with the smaller RMSE: lip **bsdf** at \(N=64\) and at \(N=1024\); miss **light** at both (`winner_lip_N64`, `winner_lip_N1024`, `winner_miss_N64`, `winner_miss_N1024`). Lip RMSE from \(N=16\) to \(N=1024\): BSDF \(0.2140099356194824\to 0.03737322030225639\), light \(0.7304631415769416\to 0.07772808316858408\), balance \(0.2677916704168401\to 0.0394574853759122\). Miss: BSDF \(1.127800620513927\to 0.121007411701054\), light \(0.1665406649163094\to 0.02502486831590404\), balance \(0.2027174941744856\to 0.03449795333963287\).

Disk standard error on the \(N=64\) variance plate: at the lip, light \(\mathbf{0.3079049113038804}\) (lede **0.308**) above BSDF \(0.1197899661872358\), with balance at \(0.1312898735904618\); at the miss, BSDF \(0.0772988573354273\) above light \(0.01309165077371938\), with balance at \(0.01779797833390362\). At the lip's mirror hit, \(p_{\mathrm{bsdf}}=11.65879108669897\), \(p_{\mathrm{light}}=0.956701082414125\), \(w_{\mathrm{bsdf}}=0.9241645851315697\), \(w_{\mathrm{light}}=0.07583541486843028\). Assertions **53 pass / 0 fail**.

**Pin this.** The variance plate is the teaching figure. It is the standard error of those same \(N=64\) draws, one shared scale, authored in sRGB. The screen-right ring is the lip. The screen-left ring is the miss. The light panel is hot on the lip ring and quiet on the miss ring. The BSDF panel is hotter on the miss ring than on the lip ring. Balance sits under the hot ring in both places, and a little over the quiet ring in both places. Balance does not have to beat the arm that already matched the integrand. On this run it does not.

![Teaching pin. Shared-scale standard error of the N=64 draws on the glaze tile. Left bsdf, middle light, right balance. Turbo on the tile; the room is a flat dark field outside the scale. Two 12 mm rings: screen-left is the miss at x=-0.28, screen-right is the lip at x=0.04. Lip light disk mean 0.3079049113038804 against BSDF 0.1197899661872358; miss BSDF 0.0772988573354273 against light 0.01309165077371938. Balance sits below the hot ring at both points. Scale maximum 0.9246898237889386 is one tile pixel, not the disk mean. Authored sRGB. Not Neutral. Not a photograph of radiance.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/02_variance.jpg)

![Three legal arms at one N. Left bsdf, middle light, right balance. Each panel is 640 by 720, assembled to 1920 by 720, N=64, same eye, same target, same 46 degree vertical field. Khronos PBR Neutral e=1.00 on every panel. The BSDF panel carries grain where the highlight has left the mouth. The light panel carries bright specks on the reflected mouth. Balance keeps the reflection and quiets both failures. A light-arm speck at this N can shoulder to white; the size of that speck is the standard error on the variance plate. Photograph only.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/01_three_arms.jpg)

---

## What you are seeing

The working space is **scene-referred linear Rec.709**. One kiln, one rectangle, one glaze tile. The display path on the photographs is the one from the [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) note: Khronos PBR Neutral, \(e=1.00\), \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\), then the IEC 61966-2-1 sRGB OETF on the CPU. Neutral assigns code values. It does not author \(L_o\).

**Cover — the kiln.** Balance at \(N=1024\), plus the named diffuse fill, \(1280\times 720\). Mouth, brick, shelf, cones, rib. No labels and no digits. The JPEG is the photograph. It is not the meter.

**Three arms — the control.** BSDF, light, and balance at \(N=64\). The mouth, the brick, and the shelf match across the panels before Neutral. Only tile pixels change with the arm. The cones and the rib are cropped by these narrow frames; the cover shows them whole, to the right of the tile.

**Variance plate — teaching pin.** Per-pixel standard error of the \(N=64\) terms that drew the three-arm photograph. One shared scale. The scale maximum is the hottest tile pixel of the three arms, `stderr_scale_max` \(=0.9246898237889386\). The lip light disk mean, \(0.3079049113038804\), is about a third of that maximum. The maximum is one pixel. The disk is an average. Non-tile pixels sit outside the scale. This plate does not go through Neutral.

**Ladder — the RMSE.** Relative RMSE against the quadrature \(L_o\), lip row on top, miss row below. BSDF in blue, light in orange, balance in green. \(N\in\{16,64,256,1024\}\) is categorical, so the four rungs are equally spaced, and RMSE is linear. Each row scales to its own maximum. A tall mark on the miss row and a tall mark on the lip row are not the same number. The chart prints no RMSE digits. The table below is the quote.

![Ladder. Relative RMSE against N at the lip (top) and the miss (bottom). Blue bsdf, orange light, green balance. N is categorical: 16, 64, 256, 1024 equally spaced. Each row has its own vertical scale, so the tall marks are not one number. At the lip the light arm is the high curve and balance tracks just above bsdf. At the miss the BSDF arm is the high curve and balance tracks just above light. Every series falls. The digits live in the table, not on the chart.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/03_ladder.jpg)

**Metrics strip — snapshot.** A \(1280\times 720\) picture of the metrics table, two columns. If a glyph on that JPEG is soft or clipped, the table in the text wins.

![Metrics strip. A two-column picture of this run's table: seed 20260926, mouth area, Omega_perp, Lo,Y, the RMSE ladder, disk standard errors, winners bsdf / bsdf / light / light, furnace mean, Lambert residual, 53 pass / 0 fail. Quote the table in the text. Not a cover.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/04_metrics.jpg)

Keep two facts separate.

1. **Photographs** (the cover and the three-arm panels) are the room, passed through Neutral, then sRGB. \(\Omega_\perp\), \(L_o\), RMSE, and the disk standard errors are not values you read off those JPEGs. An \(N=64\) light-arm firefly can shoulder to white under Neutral. The estimator is not clamped before the standard error is formed.
2. **Instruments** (the variance plate, the ladder, the metrics strip, and the tables) are the CPU double estimator. Quote the tables.

---

## Two legal arms on one mouth

The rendering equation at a shade point on the tile asks for an integral in steradians. The BSDF arm draws those steradians from one mixture: with probability \(\pi_d\) a cosine hemisphere about the tile normal, otherwise a Phong lobe about the reflection of the view. The light arm draws a point uniformly on the mouth and converts that area density with the Jacobian. Both arms estimate outgoing radiance \(L_o\), specular included. The diffuse closed form \(E=L_i\Omega_\perp\) is the ground truth of the Lambert piece only. Reading a glossy estimator against \(L_i\Omega_\perp\) and calling the gap bias misreads the meter. At the lip the specular is about four times the diffuse. At the miss the two agree.

**Lip.** The mirror ray from \(x_L\) hits the mouth at \((0,\,1.13,\,0)\). The metrics table prints that hit as \((1.387778780781446\times 10^{-17},\,1.13,\,0)\). It sits 80 mm above the sill and 0.22 m from either side edge. The Phong lobe of exponent 160 sits on that hit, so most specular samples land on the emitter. The mouth is \(0.3212572527424995\,\mathrm{sr}\). A lobe of this exponent concentrates on a cap of order \(2\pi/(s+1)\approx 0.039\,\mathrm{sr}\), and the mouth is about eight times that cap, so a uniform area draw usually misses the peak and occasionally lands in it. Those rare hits are the fireflies. The BSDF arm already aims at the peak, and its variance stays lower. The photograph of this failure is the lower lip of the reflected mouth, speckled on the light panel.

**Miss.** The mirror ray from \(x_M\) misses the mouth. The hit prints as \((-0.3814786798045011,\,1.044538867186654,\,0)\), past the left edge and below the sill. The largest \(R\cdot\omega\) on the rectangle is \(0.8789249543972235\), about \(28^\circ\) off the mirror axis. This view is the more grazing of the two: \(n\cdot\omega_o=0.4366167162249477\) at the miss, against \(0.4966085446506598\) at the lip. The specular integral is numerically zero. What remains is the Lambert term, spread over the whole mouth. The mixture still spends \(\pi_s\) of its samples in a lobe that never meets the emitter. A cosine sample hits the mouth with probability \(\Omega_\perp/\pi\), about \(0.087\) at this point. The light arm draws the mouth on every sample. The Lambert integrand varies smoothly across the rectangle, and that arm is quiet. The photograph of this failure is grain on the lit tile where the highlight has slid off the mouth.

**Balance.** On each sample the weight is that sample's pdf divided by the sum of the two pdfs. A light sample that lands in the lobe, where \(p_{\mathrm{bsdf}}\) is large, is down-weighted. That is what cuts the lip firefly. At the mirror hit the light sample is kept at \(w_{\mathrm{light}}=0.07583541486843028\), and the BSDF sample, already where that arm aimed, stays at \(w_{\mathrm{bsdf}}=0.9241645851315697\). A BSDF sample that hits the mouth out on the Lambert flank, where \(p_{\mathrm{light}}\) is the density that covers the emitter, is down-weighted the other way. Where one pdf is zero the other weight is 1. Off the mouth the integrand is already zero. The combined estimator stays unbiased when each technique is unbiased and the weights partition unity on the support of the integrand.

Balance sits below the worse single arm at both points, at every rung from \(N=16\) to \(N=1024\), and inside both disks on the variance plate. It may sit above the better arm. On this run it does, in those same places. At the lip the winner is the BSDF arm. At the miss the winner is the light arm. The lip's balance series tracks the BSDF arm, a little above it, and stays well below the light arm. The miss's balance series tracks the light arm the same way.

All three arms are legal. Neutral is on every panel of the three-arm photograph because none of them is a broken weight.

---

## The balance weight

One shade point \(x\), one outgoing direction \(\omega_o\) toward the eye, one rectangle.

| symbol | meaning | unit |
| --- | --- | --- |
| \(x\) | shade point on the tile | \(\mathrm{m}\) |
| \(y\) | point on the mouth | \(\mathrm{m}\) |
| \(r\) | \(\lVert y-x\rVert\) | \(\mathrm{m}\) |
| \(\omega_i\) | \((y-x)/r\), tile toward the mouth | unitless |
| \(\omega_o\) | direction from \(x\) toward the eye | unitless |
| \(n_x\) | tile normal, \(+Y\) | unitless |
| \(n_y\) | mouth normal, \(+Z\), into the room | unitless |
| \(\cos_x\) | \(n_x\cdot\omega_i\) | unitless |
| \(\cos_y\) | \(n_y\cdot(x-y)/r=x_z/r\) | unitless |
| \(A\) | mouth area | \(\mathrm{m}^2\) |
| \(p(A)\) | \(1/A\) on the mouth, else 0 | \(\mathrm{m}^{-2}\) |
| \(R\) | \(2(n_x\cdot\omega_o)\,n_x-\omega_o\) | unitless |
| \(s\) | Phong exponent, 160 on the hero | unitless |
| \(k_d,\,k_s\) | Lambert weight, Phong weight | unitless |
| \(\pi_d,\,\pi_s\) | \(k_d/(k_d+k_s)\), \(k_s/(k_d+k_s)\) | unitless |
| \(L_i\) | constant one-sided mouth radiance | linear Rec.709 |
| \(\ell\) | mouth integrand | linear Rec.709 |
| \(L_o\) | outgoing radiance from the mouth | linear Rec.709 |
| \(\Omega_\perp\) | projected solid angle of the mouth | \(\mathrm{sr}\) |
| \(p_{\mathrm{bsdf}},\,p_{\mathrm{light}}\) | the two densities | \(\mathrm{sr}^{-1}\) |
| \(N\) | integrand evaluations in one estimate | count |
| \(n\) | \(N/2\), the count of each technique inside balance | count |

\(\cos_y\) uses the direction from the mouth toward the tile. \(\cos_x\) uses the direction from the tile toward the mouth. One shared \(\omega\) dotted into both normals would flip a sign. Both cosines are positive for every mouth point at both instrument points. The printed minima are \(\min\cos_x=0.2999400179940021\) at the lip and \(0.2532209156959798\) at the miss, and \(\min\cos_y=0.4543108504242547\) at the lip and \(0.2991616902194818\) at the miss.

**BSDF.** Lambert plus a Lafortune Phong lobe about \(R\). Achromatic. The same split as the importance-sampling note.

\[
f_r(\omega_i)=\frac{k_d}{\pi}+k_s\frac{s+2}{2\pi}\,(R\cdot\omega_i)_+^{\,s}.
\]

\[
\begin{aligned}
p_{\cos}(\omega)&=\frac{n_x\cdot\omega}{\pi}, & n_x\cdot\omega>0,\\
p_{\mathrm{phong}}(\omega)&=\frac{s+1}{2\pi}\,(R\cdot\omega)_+^{\,s}, & R\cdot\omega>0,\\
p_{\mathrm{bsdf}}(\omega)&=\pi_d\,p_{\cos}(\omega)+\pi_s\,p_{\mathrm{phong}}(\omega).
\end{aligned}
\]

Locked values: \(k_d=0.34\), \(k_s=0.28\), \(s=160\). Then \(\pi_d=0.34/0.62\) and \(\pi_s=0.28/0.62\). The metrics table prints \(\pi_d=0.5483870967741935\) and \(\pi_s=0.4516129032258064\).

\((s+2)\) is the BRDF constant. \((s+1)\) is the pdf constant. At \(s=160\) they differ by \(1/161\), so a white furnace at the hero exponent will not show a swap. The ratio \(f_{\mathrm{spec}}/p_{\mathrm{phong}}=k_s(s+2)/(s+1)\) is an algebraic check. The furnace that can see a swap runs at \(s=8\). Its mean is \(0.619901030295896\) against \(k_d+k_s=0.62\), a relative gap of about \(1.6\times 10^{-4}\).

Sampling the BSDF arm is one technique. Draw \(\xi_c,\xi_1,\xi_2\). If \(\xi_c<\pi_d\), draw the cosine hemisphere (\(\cos\theta=\sqrt{\xi_1}\), \(\phi=2\pi\xi_2\)). Otherwise draw the Phong lobe about \(R\) (\(\cos\theta=\xi_1^{1/(s+1)}\), \(\phi=2\pi\xi_2\)). The contribution divides by the mixture \(p_{\mathrm{bsdf}}(\omega)\). The balance weight has to see that marginal density. Dividing by the component density alone would be a different estimator. If \(n_x\cdot\omega\le 0\), the integrand is 0, the sample still counts, and \(p_{\mathrm{phong}}\) is not renormalized. That is the importance-sampling horizon rule. At both locked points the lobe axis is above the horizon, and both horizon fractions print 0.

**Light density.** Mouth in the front half-space, and the ray hits the rectangle:

\[
p_{\mathrm{light}}(\omega)=\frac{1}{A}\,\frac{r^2}{\cos_y}.
\]

Otherwise \(p_{\mathrm{light}}=0\). This is the area-Jacobian factor. A sample that misses the rectangle contributes 0 because \(L_i=0\) there. The area draw, with \(u,v\in[0,1)\), is

\[
y=\bigl(X_0+u(X_1-X_0),\; Y_0+v(Y_1-Y_0),\; 0\bigr).
\]

**Integrand**, mouth only. The analytic fill is outside the three arms.

\[
\ell(\omega_i)=f_r(\omega_i)\,L_i\,\cos_x
\]

when the ray hits the mouth and both cosines are positive, and \(\ell=0\) otherwise.

\[
L_o=\int_{\Omega^+}\ell(\omega)\,d\omega.
\]

The light-arm term has two writings of the same quantity:

\[
\frac{\ell}{p_{\mathrm{light}}}=f_r\,L_i\,\cos_x\,\cos_y\,\frac{A}{r^2}.
\]

The emitter cosine in the numerator is the geometry term. It is the Jacobian undone, not a second copy of it. An extra \(\cos_y\), or a missing \(r^2\), fails the Lambert reduction. That failure is a check. It has no frame. The measured omission floors from the inspection-bench note are not this note's result.

**Balance, equal counts.** The general weight for technique \(i\) with \(n_i\) samples is \(n_i p_i\big/\sum_j n_j p_j\). This note gives the two techniques the same count \(n=N/2\), so the counts cancel:

\[
w_{\mathrm{bsdf}}=\frac{p_{\mathrm{bsdf}}}{p_{\mathrm{bsdf}}+p_{\mathrm{light}}},\qquad
w_{\mathrm{light}}=\frac{p_{\mathrm{light}}}{p_{\mathrm{bsdf}}+p_{\mathrm{light}}}.
\]

On the support of \(\ell\), both densities are positive at the locked points. The mouth lies in the front hemisphere, so the cosine piece of \(p_{\mathrm{bsdf}}\) is positive, and \(p_{\mathrm{light}}\) is positive on the mouth. There \(w_{\mathrm{bsdf}}+w_{\mathrm{light}}=1\). The lip-direction pair sums to 1 within the \(10^{-12}\) check.

Off the mouth, \(p_{\mathrm{light}}=0\). A BSDF sample that misses has \(w_{\mathrm{bsdf}}=1\) and an integrand that is already 0. A direction with \(p_{\mathrm{bsdf}}=0\) and \(p_{\mathrm{light}}>0\) carries \(w_{\mathrm{light}}=1\). The weights partition unity wherever the integrand can be nonzero.

Stable evaluation, used when \(p_{\mathrm{light}}>0\): \(w_{\mathrm{light}}=1/(1+p_{\mathrm{bsdf}}/p_{\mathrm{light}})\). Same number as the ratio.

**Three arms, budget \(N\).** \(N\in\{16,64,256,1024\}\). Budget means integrand evaluations. Evaluating the other pdf for a balance weight is not a second sample. The single arms do not receive extra samples to pay for that pdf.

\[
\begin{aligned}
\widehat L_{\mathrm{bsdf}}&=\frac1N\sum_{j=1}^{N}\frac{\ell(\omega_j)}{p_{\mathrm{bsdf}}(\omega_j)},\\[4pt]
\widehat L_{\mathrm{light}}&=\frac1N\sum_{j=1}^{N}\frac{\ell(\omega_j)}{p_{\mathrm{light}}(\omega_j)},\\[4pt]
\widehat L_{\mathrm{bal}}
&=\frac1n\sum_{j=1}^{n} w_{\mathrm{bsdf}}(\omega_j)\,\frac{\ell(\omega_j)}{p_{\mathrm{bsdf}}(\omega_j)}
+\frac1n\sum_{j=1}^{n} w_{\mathrm{light}}(y_j)\,\frac{\ell(y_j)}{p_{\mathrm{light}}(y_j)}.
\end{aligned}
\]

The \(1/n\) is required. A factor \(1/N\) in front of each balance sum cuts the estimator in half. The technique split is deterministic: the first \(n\) draws of the BSDF stream and the first \(n\) of the light stream.

**Fill**, after the arm, diffuse only. The Phong term does not see it. Both instruments have the mouth fully in the front hemisphere, so

\[
L_{o,\mathrm{fill}}=\frac{k_d}{\pi}\,L_{\mathrm{fill}}\,(\pi-\Omega_\perp).
\]

The ladder and the signed means compare the mouth integral to the quadrature \(L_o\). Fill is not inside those numbers. The photographs add this one analytic term, the same term on every arm. Matte surfaces use the analytic Lambert expression with their own albedo in place of \(k_d\), and they never take a Phong sample. Fill radiance is \((0.012,\,0.014,\,0.018)\), \(Y=1.3863600000\times 10^{-2}\).

**Truth.** The diffuse piece is the signed four-corner projected solid angle. Vertex order is part of the sign. The run prints \(\Omega_\perp>0\) at both points.

\[
E=L_i\,\Omega_\perp,\qquad L_{o,d}=\frac{k_d}{\pi}\,E.
\]

The specular piece has no four-corner form for this Phong. The truth of \(L_o\), specular included, is a tensor-product Gauss–Legendre rule on the mouth's parameter square, \(8\times 8\) cells, order 40 in each cell. The metrics table names it `gauss_legendre_8x40`. A \(6\times 32\) rule agrees with it within a relative \(10^{-8}\) on \(Y\) at both points. The diffuse-only quadrature agrees with the contour \(L_{o,d,Y}\) within a relative \(10^{-9}\). The published \(L_{o,Y}\) is the order-40 value.

**Why \(s=160\).** The Phong mass sits on a cap of order \(2\pi/(s+1)\approx 0.039\,\mathrm{sr}\). At the lip the mouth is several times that cap, so area samples miss the peak while Phong samples aimed at the inset hit land on the mouth. At the miss, \((R\cdot\omega)^{160}\) on the whole rectangle is negligible beside the Lambert term, which is what the miss specular/diffuse ratio records. An exponent wide enough to cover this mouth would stop the light arm from fireflying. One exponent. No exponent plate.

**Error.** \(K=32\) independent prefixes, seed **20260926**, SplitMix64, the top 53 bits mapped to \([0,1)\). Stream 0 opens at \(0.7466817377103402\), \(0.669510631620856\), \(0.5708748435191999\). The estimate at \(N\) is the prefix. Error is on Rec.709 \(Y\) (coefficients \(0.2126\), \(0.7152\), \(0.0722\)) against the quadrature:

\[
\mathrm{rel}_k(N)=\frac{\widehat L_{k,Y}(N)-L_{o,Y}}{L_{o,Y}},
\qquad
\mathrm{rmse}(N)=\sqrt{\frac1K\sum_k\mathrm{rel}_k(N)^2}.
\]

The draws are IID. The statistic that has to fall is the RMSE across the \(K\) prefixes. One prefix of a heavy-tailed light arm can wiggle while the estimator is unbiased.

**Standard error on the variance plate**, from the same \(N=64\) draws as the three-arm photograph. For a single arm, the sample variance of the Rec.709 \(Y\) terms uses \(N-1\), and \(\mathrm{stderr}=\sqrt{s^2/N}\). For balance, \(n=32\) terms from each technique, each term already multiplied by its balance weight, and

\[
\mathrm{stderr}=\sqrt{\frac{s_b^2}{n}+\frac{s_l^2}{n}}.
\]

The two techniques stay separate. They are not one population of \(N\) numbers, and the variance is not divided by \(N\) a second time. Fill is a constant on a pixel and sits outside this accumulator. The quoted disk figures are the mean of that per-pixel standard error inside a 12 mm radius.

---

## The kiln mouth

World in meters, \(Y\) up, right-handed. The only emitter is the muffle mouth: plane \(z=0\), \(x\in[-0.22,\,0.22]\), \(y\in[1.05,\,1.64]\), outward normal \(+Z\). Width \(0.44\,\mathrm{m}\), height \(0.59\,\mathrm{m}\), \(A=0.2596\,\mathrm{m}^2\). One-sided: \(z<0\) emits nothing. Exposure \(1.00\).

The eye is the reflection construction that puts the lip's mirror ray on the chosen hit, so the inset is an identity.

| | value |
| --- | --- |
| eye | \((0.1453673781693574,\; 1.505862424473805,\; 1.453673781693575)\) |
| target | \((0,\; 1.18,\; 0.28)\) |
| vertical FOV | \(46^\circ\) |

| | lip | miss |
| --- | --- | --- |
| \(\Omega_\perp\) | \(0.3212572527424995\,\mathrm{sr}\) | \(0.2742559005975028\,\mathrm{sr}\) |
| \(E_Y\) | \(1.666136489898425\) | \(1.422373377268829\) |
| \(L_{o,d,Y}\) | \(0.1803182235985176\) | \(0.1539368726619603\) |
| \(L_{o,Y}\) | \(0.8922731625666653\) | \(0.1539368726945163\) |
| specular / diffuse | \(3.948324937768523\) | \(2.114893779357608\times 10^{-10}\) |
| \(E_Y/E_{\mathrm{fill},Y}\) | \(42.61218441186641\) | \(35.78152895218164\) |
| \(n\cdot\omega_o\) | \(0.4966085446506598\) | \(0.4366167162249477\) |

\(f_r\) is achromatic, so \(L_o\) and \(E\) share one scalar across channels with \(L_i\). The mouth dominates the fill at both points. The glaze tile is the only Phong surface. Its top is \(y=0.900\). Both instruments and the 12 mm disks around them lie on that top. The shelf, the cones, the rib, the firebrick, and the floor are matte. The cones and the rib sit on the camera side of both instruments, so a segment from either instrument to the mouth does not meet them. The estimator is unoccluded. Corners the mouth does not face are dark, because the back wall is the mouth's own plane and fill is a constant Lambert ambient. Nothing bounces. There is no contact shadow under a cone.

The distance ratios \(r_{\max}/r_{\mathrm{closest}}\) are \(2.06098792642672\) at the lip and \(2.89530225013162\) at the miss. They say the Jacobian is not a constant on this mouth. They are not an omission floor, and this note does not plot one.

---

## The ladder

Lip, relative RMSE against \(L_{o,Y}=0.8922731625666653\):

| \(N\) | BSDF | light | balance |
| --- | --- | --- | --- |
| 16 | \(0.2140099356194824\) | \(0.7304631415769416\) | \(0.2677916704168401\) |
| 64 | \(0.08843426554976692\) | \(0.4514279104903152\) | \(0.1654913366919019\) |
| 256 | \(0.05961818706512619\) | \(0.1422980316823544\) | \(0.07342216607057826\) |
| 1024 | \(0.03737322030225639\) | \(0.07772808316858408\) | \(0.0394574853759122\) |

Miss, against \(L_{o,Y}=0.1539368726945163\):

| \(N\) | BSDF | light | balance |
| --- | --- | --- | --- |
| 16 | \(1.127800620513927\) | \(0.1665406649163094\) | \(0.2027174941744856\) |
| 64 | \(0.6061904264789479\) | \(0.0866628181189508\) | \(0.1117390659993689\) |
| 256 | \(0.2255597833559149\) | \(0.04945588327264005\) | \(0.06214339069118716\) |
| 1024 | \(0.121007411701054\) | \(0.02502486831590404\) | \(0.03449795333963287\) |

Every series falls at every rung. Each \(N=16\) value is more than five times the matching \(N=1024\) value. The check was a fall at every rung and a factor of at least three. No numeric RMSE target was set in advance. The table is the result.

Dividing the printed keys, light over BSDF at the lip is about \(5.10\) at \(N=64\) and about \(2.08\) at \(N=1024\). BSDF over light at the miss is about \(7.00\) at \(N=64\) and about \(4.84\) at \(N=1024\). The same direction, without that numeric factor, holds at \(N=16\) and at \(N=256\): the light arm is the worse one at the lip, the BSDF arm is the worse one at the miss, and balance is below that worse arm. The winners are the literals `bsdf`, `bsdf`, `light`, `light`.

Balance stays above the better arm on every rung. At the lip at \(N=1024\) it is \(0.0394574853759122\) against the BSDF arm's \(0.03737322030225639\). At the miss at \(N=1024\) it is \(0.03449795333963287\) against the light arm's \(0.02502486831590404\). The gap to the worse arm is the one the weight is there to close.

The lip light arm is the heavy tail. A few area samples carry the lobe. Its RMSE falls from \(0.7304631415769416\) to \(0.07772808316858408\), faster than the BSDF arm, and it is still the worse of the two at \(N=1024\). The miss BSDF arm is the other heavy tail, and it is still the worse arm at the top of the ladder.

Signed means at \(N=1024\):

| arm | lip | miss |
| --- | --- | --- |
| BSDF | \(-0.002731905356039808\) | \(+0.02759449102141028\) |
| light | \(-0.003899555994426759\) | \(-0.008199037159731746\) |
| balance | \(-0.01277686469507701\) | \(-0.01175426953620759\) |

The unbiasedness check is \(\lvert\mathrm{mean\_rel}(1024)\rvert\le 5\,\mathrm{rmse}(1024)/\sqrt{K}\) with \(K=32\). A bias floor would put the absolute mean on the scale of the RMSE. Every arm at both points sits inside the gate. The largest absolute mean at the lip is the balance arm, about a third of its RMSE. The largest at the miss is the BSDF arm, just under a quarter of its RMSE.

Disk means of the \(N=64\) standard error, the numbers drawn on the teaching pin:

| disk | BSDF | light | balance |
| --- | --- | --- | --- |
| lip | \(0.1197899661872358\) | \(0.3079049113038804\) | \(0.1312898735904618\) |
| miss | \(0.0772988573354273\) | \(0.01309165077371938\) | \(0.01779797833390362\) |

---

## Quote the metrics. Do not quote the beauty photographs as meters.

CPU double, before Neutral. Seed **20260926**. Beauty display is Khronos PBR Neutral, \(e=1.00\), constants not re-fit. The RMSE series are the tables in the previous section.

| item | value |
| --- | --- |
| seed / \(K\) / \(N\) | **20260926** / **32** / **16, 64, 256, 1024** |
| \(N\) on the three-arm and variance plates / \(N\) on the cover | **64** / **1024** |
| \(s\) / \(k_d\) / \(k_s\) | **160** / **0.34** / **0.28** |
| \(\pi_d\) / \(\pi_s\) | **0.5483870967741935** / **0.4516129032258064** |
| stream 0, first three uniforms | **0.7466817377103402**, **0.669510631620856**, **0.5708748435191999** |
| \(L_i\) RGB / \(Y\) | **(7.5, 4.8, 2.2)** / **5.186299999999999** |
| \(L_{\mathrm{fill}}\) RGB / \(Y\) | **(0.012, 0.014, 0.018)** / **1.3863600000e-02** |
| exposure / Neutral | **1.00** / \(e=1.00\), \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\) |
| eye | **(0.1453673781693574, 1.505862424473805, 1.453673781693575)** |
| target / vertical FOV | **(0, 1.18, 0.28)** / **46°** |
| lip / miss | **(0.04, 0.90, 0.40)** / **(−0.28, 0.90, 0.28)** |
| mouth \(x\) / \(y\) / \(A\) | **[−0.22, 0.22]** / **[1.05, 1.64]** / **0.2595999999999999 m²** |
| \(\Omega_\perp\) lip / miss | **0.3212572527424995** / **0.2742559005975028 sr** |
| \(E_Y\) lip / miss | **1.666136489898425** / **1.422373377268829** |
| \(L_{o,d,Y}\) lip / miss | **0.1803182235985176** / **0.1539368726619603** |
| \(L_{o,Y}\) lip / miss | **0.8922731625666653** / **0.1539368726945163** |
| specular / diffuse lip / miss | **3.948324937768523** / **2.114893779357608e-10** |
| panel / fill lip / miss | **42.61218441186641** / **35.78152895218164** |
| \(r_{\max}/r_{\mathrm{closest}}\) lip / miss | **2.06098792642672** / **2.89530225013162** |
| \(n\cdot\omega_o\) lip / miss | **0.4966085446506598** / **0.4366167162249477** |
| \(\max(R\cdot\omega)\) on the mouth, miss | **0.8789249543972235** |
| \(p_{\mathrm{bsdf}}\) / \(p_{\mathrm{light}}\) at the lip hit | **11.65879108669897** / **0.956701082414125** |
| \(w_{\mathrm{bsdf}}\) / \(w_{\mathrm{light}}\) at the lip hit | **0.9241645851315697** / **0.07583541486843028** |
| winners, lip \(N=64\) / \(N=1024\) | **bsdf** / **bsdf** |
| winners, miss \(N=64\) / \(N=1024\) | **light** / **light** |
| disk stderr lip, BSDF / light / balance | **0.1197899661872358** / **0.3079049113038804** / **0.1312898735904618** |
| disk stderr miss, BSDF / light / balance | **0.0772988573354273** / **0.01309165077371938** / **0.01779797833390362** |
| `stderr_scale_max` | **0.9246898237889386** |
| horizon fraction, lip / miss | **0** / **0** |
| fixture S, \(\Omega_\perp\) | **0.002397921970815975 sr** |
| furnace, \(s=8\), mean | **0.619901030295896** against \(k_d+k_s=0.62\) |
| Lambert reduction, max \(\lvert\mathrm{mean\_rel}\rvert\) | **0.002711173413998751** |
| ground truth | **gauss_legendre_8x40** |
| asserts | **53 pass / 0 fail** |

A few shortenings are for the eye only. Lip light disk standard error **0.308** is \(0.3079049113038804\). Mouth area **0.2596** is the bound product \(0.2595999999999999\). None of these shortenings replaces the table.

---

## Honesty gaps

1. **The meter is the CPU double contour, the double Gauss–Legendre rule, and the double estimator.** The room drawn for the photograph is float32. The metrics table is not read off a JPEG. \((R\cdot\omega)^{160}\) stays in double. A float32 evaluation of that power underflows on the lobe shoulder and would bias the lip. A mouth pixel reads back \(R=7.5\) before Neutral. The framebuffer is linear. One front-facing shelf pixel agrees between the CPU double Lambert value and the float32 shading to \(2.8\times 10^{-6}\) relative on \(Y\). The build's linear reading of the hero pixel nearest the lip is the balance sample, \(Y\,0.902\), against an analytic Lambert stand-in \(Y\,0.184\). Those two readings are not keys in the metrics table.

2. **Neutral may shoulder an \(N=64\) light-arm firefly to white.** The estimator is not clamped before the standard error is formed. The size of the firefly is the standard error on the variance plate. Energy after Neutral is not a claim. The constants are the tone-mapping note's, \(e=1.00\), \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\), not re-fit.

3. **The variance plate is float standard error, authored in sRGB.** It shares one scale, \(0.9246898237889386\). A per-panel autoscale would still pass the disk inequalities and would still be the wrong plate. The disk means are averages. The scale maximum is one tile pixel.

4. **Balance sits below the worse arm and above the better arm.** At the lip it tracks the BSDF series. At the miss it tracks the light series. The weight is doing the mixture. It is not a claim that balance beats the arm that already matched the integrand.

5. **The integral is unoccluded.** The back wall is the mouth's plane, so it does not see the emitter. Corners are dark because fill is a constant Lambert ambient and nothing bounces. Specular fill is omitted on purpose: a Phong lobe over a constant dome would add a highlight that is not the mouth. There is no contact shadow under a cone. There is no visibility term.

6. **One prefix is not the monotone statistic.** The locked meter is RMSE over \(K=32\). The lip light arm is heavy-tailed. A single walk of length 1024 can wiggle while the weight is right.

7. **The Lambert residual is the band at a final count of 16384.** `lambert_reduction_max_abs_mean_rel` \(=0.002711173413998751\). The check is \(k_s=0\) at the lip, eight replicates, truth the contour \(L_{o,d}\), and the printed number is the largest absolute mean relative error of the three arms at that final count. On these replicates the cosine arm is a hit-or-miss draw, \(\Omega_\perp/\pi\) about a tenth. The absolute mean relative error was \(0.024\) at 512 and \(0.017\) at 4096, both outside \(10^{-2}\), while the light arm stayed quiet. The fall from a prefix of 32 to a prefix of 512 is a separate check, and it still holds. A dropped \(r^2\), an extra \(\cos_y\), or a balance average that puts \(1/N\) in front of each sum still misses the band by a wide margin. The count 16384 is the sample count behind this one residual. It is not a beauty rung and not a second ladder.

8. **The white furnace is \(s=8\), not the hero exponent.** Mean \(0.619901030295896\) against \(0.62\). Fixture S, \(\Omega_\perp=0.002397921970815975\,\mathrm{sr}\), is the on-axis contour. Neither test is a frame.

9. **The JPEG is 8-bit display-referred.** \(\Omega_\perp\), \(L_o\), RMSE, signed means, and standard errors live in the double estimator and in the table above. The room is one fragment shader on llvmpipe. There is no GPU, wavefront, or frame-time claim.

---

## What this run can claim

| item | value |
| --- | --- |
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| OSMesa | core 3.3 request |
| FBO color | **RGBA32F**, \(1280\times 720\) and \(640\times 720\), nearest |
| `GL_FRAMEBUFFER_SRGB` | disabled |
| MSAA | disabled |
| RNG | SplitMix64, seed **20260926**. Top 53 bits to \([0,1)\). Not a sin-hash |
| Neutral \(e\) | **1.00** |
| Estimator | CPU double. The shader draws the analytic room. The CPU overwrites tile pixels. |

**Can claim:** on this OSMesa / llvmpipe build, a CPU double estimator drew a Phong–Lambert mixture and a uniform area on one unoccluded rectangle, converted the area draw with the legal Jacobian, and combined the two with the balance weight at equal technique counts. At both locked points, all three arms' \(K=32\) relative RMSE fell from \(N=16\) to \(N=1024\) against the quadrature \(L_o\), and the balance RMSE sat below the worse single arm at every rung. The lip's winner was the BSDF arm at \(N=64\) and at \(N=1024\). The miss's winner was the light arm at both. The variance plate is the per-pixel standard error of those terms at \(N=64\), one shared scale, with the lip light disk at \(0.3079049113038804\). The cover is the balance estimator at \(N=1024\), plus the named diffuse fill, under Neutral \(e=1.00\). The run prints **53 pass / 0 fail**.

**Cannot claim:** a GPU, a wavefront, a ray-tracing core, or a frame-time budget. The meter never reads the shader's tile pixels back as \(L_o\). Energy after Neutral. Anything measured by sampling the JPEG of the cover or the three-arm plate. Interreflection. A shadow under a cone. That one prefix is monotone. That balance beats the better arm. That this weight has been ranked against a power heuristic, against VNDF, or against a multi-light survey. That \((R\cdot\omega)^{160}\) was evaluated in float32.

For this run: **53 pass / 0 fail**. Geometry, the signed contour, the Gauss–Legendre agreement, the lip-direction pdf, and both balance weights were checked before the photographs were treated as meters. The RMSE fell on every arm at both points. The disk inequalities hold on one shared scale. The horizon fraction is 0 at both points. The Lambert band at its final count prints \(0.002711173413998751\).

---

## Out of scope

A power of \(p_i\), including a point marked \(\beta=2\), is a different weight. Balance here is the weight proportional to \(p_i\). A second mouth, an environment, a mesh light, and a three-strategy balance that splits cosine and Phong into separate arms are out. One rectangle already makes the two single arms fail in different places.

Occlusion, a cone casting on the tile, multi-bounce, Russian roulette, and any path longer than the direct mouth are out. The half-vector Jacobian, Smith \(G\), VNDF, GGX, and Fresnel stay out. A balance weight can be written for a Phong lobe about \(R\) because that lobe is already a density in \(d\omega\).

Phong against cosine as competing arms, firefly counts, and an exponent sweep stay in the importance-sampling note. Cosine exists here only as a component inside \(p_{\mathrm{bsdf}}\). Dropped \(r^2\), dropped emitter cosine, the equal-\(\Omega\) histogram, and the centroid shortcut stay in the area-Jacobian note. The Jacobian appears here only as the legal \(p_{\mathrm{light}}\).

```text
w_i            = p_i / (p_bsdf + p_light)          # n_bsdf = n_light, so n_i cancels
p_bsdf         = pi_d * (n·ω)/π + pi_s * (s+1)/(2π) (R·ω)_+^s
p_light        = (1/A) * r^2 / cos_y               # on the mouth, else 0
f_r            = kd/π + ks * (s+2)/(2π) (R·ω)_+^s  # s+1 is the pdf; s+2 is the BRDF
ell / p_light  = f_r * Li * cos_x * cos_y * A / r^2
Lhat_bsdf      = (1/N) sum ell / p_bsdf
Lhat_light     = (1/N) sum ell / p_light
Lhat_bal       = (1/n) sum w_bsdf  * ell / p_bsdf
               + (1/n) sum w_light * ell / p_light  # n = N/2
E              = Li * Omega_perp                    # diffuse truth, signed contour
Lo             = Gauss-Legendre 8x40                # mouth integral, specular included
Lo,Y lip       = 0.8922731625666653
winner lip     = bsdf                               # N=64 and N=1024
winner miss    = light
stderr lip, light arm = 0.3079049113038804          # disk mean, N=64; lede 0.308
asserts        = 53 pass / 0 fail
beauty 00, 01  = sRGB_OETF(Neutral(e * Lo))         # e=1.00
variance plate = authored sRGB of float stderr
```

Pin the cover as the kiln at balance, \(N=1024\). Pin the variance plate as the teaching figure. Pin the three-arm photograph as the two legal densities at one \(N\). Pin the ladder as the RMSE. Two legal densities on one mouth. The balance weight moves the variance. The estimator stays unbiased.
