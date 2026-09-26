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

Our last note, [Light Sampling and the Area Jacobian](/posts/p/light-sampling-and-the-area-jacobian/), put a legal light density on \(d\omega\). The one before that, [Importance Sampling: Phong Lobe vs Cosine](/posts/p/importance-sampling-phong-lobe-vs-cosine/), kept two BSDF pdfs on a single integral, both already in \(1/\mathrm{sr}\). This time, we're bringing both ideas together on the same kiln mouth.

We have two legal densities estimating one direct-light integral. One is a Phong–Lambert BSDF. The other draws a point uniformly on a rectangle and pushes that area density through the area Jacobian. Each arm—when divided by the density it actually sampled—is strictly unbiased, and each happens to be noisy exactly where the other is quiet. The balance heuristic weights a given sample by its own pdf over the sum of the two:

\[w_i=\frac{p_i}{p_{\mathrm{bsdf}}+p_{\mathrm{light}}}.\]

The variance shifts around, but the estimator itself remains unbiased. If we use equal technique counts, the \(n_i\) terms cancel out, leaving the weight exactly as written on the page: \(w_i=p_i/(p_{\mathrm{bsdf}}+p_{\mathrm{light}})\). Notice that the light weight still carries \(r^2\). Dropping that \(r^2\), or forgetting the emitter cosine, creates a biased floor—a pitfall we covered thoroughly in the area-Jacobian note, so we won't re-litigate that omission here.

[Importance Sampling: Phong Lobe vs Cosine](/posts/p/importance-sampling-phong-lobe-vs-cosine/) owns the variance photograph for two BSDF pdfs, as well as the split that puts \((s+1)\) in the pdf and \((s+2)\) in the BRDF. We're keeping that split and that horizon rule. We aren't going to rematch Phong against cosine, and we aren't reprinting that note's RMSE pair. [Light Sampling and the Area Jacobian](/posts/p/light-sampling-and-the-area-jacobian/) owns:

\[p(\omega)=p(A)\,\frac{r^2}{n_y\cdot\omega}.\]

We are reimplementing that exact factor here as \(p_{\mathrm{light}}\). [Solid Angle and the Rendering Equation](/posts/p/solid-angle-and-the-rendering-equation/) owns the projected solid angle that a diffuse term integrates, and the Lambert piece here uses that same signed contour. The disk ratios and the omission floors belong in their own notes.

Say hello to the **kiln-mouth glaze shelf**. Imagine a rectangular muffle mouth sitting flush in firebrick, with a single pale glaze tile lying flat on a stoneware shelf. We've got two matte pyrometric cones and a wooden rib in there for scale. The camera is inside the kiln, positioned low along the shelf, looking straight at the mouth. (The loft bottle, the metro colonnade, the gallery lacquer sphere, the courtyard atrium, and the night inspection bench are all staying in their respective notes.)

![Cover. Kiln-mouth glaze shelf: a rectangular muffle mouth flush in firebrick, one pale glaze tile on a stoneware shelf, two matte pyrometric cones and a wooden rib for scale. Balance arm at N=1024 plus the analytic diffuse fill. Khronos PBR Neutral e=1.00. Photograph only — Lo,Y and the RMSE are not this frame.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/00_hero.jpg)

Let's run the hero stats. We're on Mesa 25.0.7 llvmpipe, linear Rec.709, **Khronos PBR Neutral** (\(e=\mathbf{1.00}\)), with seed **20260926**. Parameters are \(k_d=0.34\), \(k_s=0.28\), \(s=160\). Radiance \(L_i=(7.5,\,4.8,\,2.2)\), giving us \(L_{i,Y}=5.186299999999999\). The mouth area is \(0.2596\,\mathrm{m}^2\). (The bound product you'll see in the metrics table is \(0.2595999999999999\)).

For the lip \(x_L=(0.04,\,0.90,\,0.40)\): \(\Omega_\perp=\mathbf{0.3212572527424995}\,\mathrm{sr}\), \(L_{o,Y}=\mathbf{0.8922731625666653}\), and the specular-over-diffuse ratio is \(\mathbf{3.948324937768523}\).
For the miss \(x_M=(-0.28,\,0.90,\,0.28)\): \(\Omega_\perp=\mathbf{0.2742559005975028}\,\mathrm{sr}\), \(L_{o,Y}=\mathbf{0.1539368726945163}\), and the specular-over-diffuse ratio is a tiny \(2.114893779357608\times 10^{-10}\). That miss ratio is effectively zero next to the Lambert term.

Now for the winners (the single arm with the smaller RMSE): at the lip, it's **bsdf** at both \(N=64\) and \(N=1024\); at the miss, it's **light** at both (`winner_lip_N64`, `winner_lip_N1024`, `winner_miss_N64`, `winner_miss_N1024`).
Look at how the lip RMSE drops from \(N=16\) to \(N=1024\): the BSDF goes \(0.2140099356194824\to 0.03737322030225639\), light goes \(0.7304631415769416\to 0.07772808316858408\), and balance goes \(0.2677916704168401\to 0.0394574853759122\).
For the miss: BSDF drops \(1.127800620513927\to 0.121007411701054\), light drops \(0.1665406649163094\to 0.02502486831590404\), and balance drops \(0.2027174941744856\to 0.03449795333963287\).

Let's check the disk standard error on the \(N=64\) variance plate. At the lip, the light arm sits at \(\mathbf{0.3079049113038804}\) (our lede **0.308**) compared to the BSDF arm's \(0.1197899661872358\), with balance at \(0.1312898735904618\). Over at the miss, the BSDF arm sits at \(0.0772988573354273\) compared to the light arm's \(0.01309165077371938\), with balance at \(0.01779797833390362\).
Right at the lip's mirror hit, we have \(p_{\mathrm{bsdf}}=11.65879108669897\), \(p_{\mathrm{light}}=0.956701082414125\), \(w_{\mathrm{bsdf}}=0.9241645851315697\), and \(w_{\mathrm{light}}=0.07583541486843028\). Assertions: **53 pass / 0 fail**.

**Pin this.** The variance plate is our primary teaching figure here. It maps the standard error of those exact \(N=64\) draws using a shared scale, authored in sRGB. The ring on the right of the screen is the lip; the left ring is the miss. Notice how the light panel runs hot on the lip ring but quiet on the miss ring. Conversely, the BSDF panel is hotter on the miss ring than on the lip ring. Balance comfortably sits under the hot ring in both places, and just a little over the quiet ring in both places. Keep in mind: the balance heuristic doesn't *have* to beat the single arm that already perfectly matched the integrand. On this particular run, it doesn't.

![Teaching pin. Shared-scale standard error of the N=64 draws on the glaze tile. Left bsdf, middle light, right balance. Turbo on the tile; the room is a flat dark field outside the scale. Two 12 mm rings: screen-left is the miss at x=-0.28, screen-right is the lip at x=0.04. Lip light disk mean 0.3079049113038804 against BSDF 0.1197899661872358; miss BSDF 0.0772988573354273 against light 0.01309165077371938. Balance sits below the hot ring at both points. Scale maximum 0.9246898237889386 is one tile pixel, not the disk mean. Authored sRGB. Not Neutral. Not a photograph of radiance.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/02_variance.jpg)

---

## What you are seeing

The working space is **scene-referred linear Rec.709**. We have one kiln, one rectangle, one glaze tile. For the photographs, the display path matches the one from the [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) note: Khronos PBR Neutral, \(e=1.00\), \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\), followed by the IEC 61966-2-1 sRGB OETF applied on the CPU. Remember, Neutral assigns code values; it doesn't author \(L_o\).

**Cover — the kiln.** This is the balance arm at \(N=1024\), plus the named diffuse fill, rendered at \(1280\times 720\). You can see the mouth, brick, shelf, cones, and rib. There are no labels and no digits here. Treat the JPEG strictly as a photograph—it's not the meter.

**Three arms — the control.** BSDF, light, and balance evaluated at \(N=64\). The mouth, the brick, and the shelf all match across the panels before Neutral is applied. Only the tile pixels actually change with the arm. The cones and the rib are cropped out by these narrow frames, but you can see them whole on the right side of the tile in the cover image.

![Three legal arms at one N. Left bsdf, middle light, right balance. Each panel is 640 by 720, assembled to 1920 by 720, N=64, same eye, same target, same 46 degree vertical field. Khronos PBR Neutral e=1.00 on every panel. The BSDF panel carries grain where the highlight has left the mouth. The light panel carries bright specks on the reflected mouth. Balance keeps the reflection and quiets both failures. A light-arm speck at this N can shoulder to white; the size of that speck is the standard error on the variance plate. Photograph only.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/01_three_arms.jpg)

**Variance plate — teaching pin.** This maps the per-pixel standard error of the \(N=64\) terms that drew the three-arm photograph. It uses one shared scale. The scale maximum is anchored by the hottest tile pixel across all three arms, `stderr_scale_max` \(=0.9246898237889386\). The lip's light disk mean, \(0.3079049113038804\), is roughly a third of that maximum. Keep in mind that the maximum is a single pixel, while the disk is an average. Non-tile pixels fall outside the scale entirely, and this plate skips Neutral completely.

**Ladder — the RMSE.** Here's the relative RMSE plotted against the quadrature \(L_o\), with the lip row on top and the miss row below. BSDF is blue, light is orange, and balance is green. Because \(N\in\{16,64,256,1024\}\) is categorical, the four rungs are spaced equally, making the RMSE linear. Each row scales to its own local maximum, meaning a tall mark on the miss row and a tall mark on the lip row represent completely different numbers. We don't print RMSE digits on the chart itself; quote the table below for the actual numbers.

![Ladder. Relative RMSE against N at the lip (top) and the miss (bottom). Blue bsdf, orange light, green balance. N is categorical: 16, 64, 256, 1024 equally spaced. Each row has its own vertical scale, so the tall marks are not one number. At the lip the light arm is the high curve and balance tracks just above bsdf. At the miss the BSDF arm is the high curve and balance tracks just above light. Every series falls. The digits live in the table, not on the chart.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/03_ladder.jpg)

**Metrics strip — snapshot.** A \(1280\times 720\) capture of our metrics table across two columns. If any glyph on that JPEG looks soft or gets clipped, trust the markdown table in the text.

![Metrics strip. A two-column picture of this run's table: seed 20260926, mouth area, Omega_perp, Lo,Y, the RMSE ladder, disk standard errors, winners bsdf / bsdf / light / light, furnace mean, Lambert residual, 53 pass / 0 fail. Quote the table in the text. Not a cover.](/assets/journal/multiple-importance-sampling-and-the-balance-heuristic/04_metrics.jpg)

Keep two facts completely separate:

1. **Photographs** (like the cover and the three-arm panels) show the room passed through Neutral, then sRGB. You cannot read \(\Omega_\perp\), \(L_o\), RMSE, or the disk standard errors off those JPEGs. At \(N=64\), a light-arm firefly can easily shoulder to white under Neutral. The estimator isn't clamped before we form the standard error.
2. **Instruments** (like the variance plate, the ladder, the metrics strip, and the tables) come straight from the CPU double estimator. Always quote the tables.

---

## Two legal arms on one mouth

The rendering equation at a shade point on our tile asks for an integral in steradians. The BSDF arm draws those steradians from a mixture: with probability \(\pi_d\) it uses a cosine hemisphere around the tile normal, and otherwise it uses a Phong lobe around the reflection of the view vector. The light arm, meanwhile, draws a point uniformly on the mouth and converts that area density using the Jacobian. Both arms are estimating outgoing radiance \(L_o\), specular included. The diffuse closed form \(E=L_i\Omega_\perp\) acts as the ground truth strictly for the Lambert piece. If you try reading a glossy estimator against \(L_i\Omega_\perp\) and call the gap "bias", you're misreading the meter. Down at the lip, the specular is roughly four times the diffuse. Over at the miss, the two agree perfectly.

**Lip.** The mirror ray cast from \(x_L\) hits the mouth exactly at \((0,\,1.13,\,0)\). (Our metrics table prints that hit exactly as \((1.387778780781446\times 10^{-17},\,1.13,\,0)\)). This sits 80 mm above the sill and 0.22 m from either side edge. Because our Phong lobe of exponent 160 sits right on that hit, most specular samples land directly on the emitter. The mouth covers \(0.3212572527424995\,\mathrm{sr}\). A lobe with this tight an exponent concentrates on a cap of order \(2\pi/(s+1)\approx 0.039\,\mathrm{sr}\), making the mouth about eight times larger than that cap. As a result, a uniform area draw usually misses the peak entirely, but occasionally lands right inside it. Those rare, lucky hits? Those are your fireflies. The BSDF arm is already aimed at the peak, which is why its variance stays lower. In the photograph, this failure mode looks like speckling on the light panel right across the lower lip of the reflected mouth.

**Miss.** Cast the mirror ray from \(x_M\) and it misses the mouth entirely. The actual hit prints as \((-0.3814786798045011,\,1.044538867186654,\,0)\), missing past the left edge and dropping below the sill. The largest \(R\cdot\omega\) value we find anywhere on the rectangle is \(0.8789249543972235\), sitting roughly \(28^\circ\) off the mirror axis. This view is notably more grazing than the other: \(n\cdot\omega_o=0.4366167162249477\) at the miss, compared to \(0.4966085446506598\) at the lip. Numerically, the specular integral here is zero. All we have left is the Lambert term, spread cleanly across the whole mouth. However, the mixture still burns \(\pi_s\) of its samples on a lobe that never even touches the emitter. A cosine sample hits the mouth with probability \(\Omega_\perp/\pi\), which works out to about \(0.087\) at this point. The light arm, by contrast, draws the mouth flawlessly on every single sample. Because the Lambert integrand varies so smoothly across the rectangle, that arm runs incredibly quiet. In the photograph, this failure mode shows up as grain on the lit tile exactly where the highlight slid off the mouth.

**Balance.** On every sample, the weight is just that sample's pdf divided by the sum of the two pdfs. If a light sample manages to land directly inside the lobe—where \(p_{\mathrm{bsdf}}\) is enormous—it gets heavily down-weighted. That mechanic is exactly what cuts out the lip firefly. Right at the mirror hit, the light sample gets throttled to \(w_{\mathrm{light}}=0.07583541486843028\), while the BSDF sample, which was already aiming where the arm needed it to, stays dominant at \(w_{\mathrm{bsdf}}=0.9241645851315697\). Conversely, if a BSDF sample hits the mouth way out on the Lambert flank—where \(p_{\mathrm{light}}\) represents the density faithfully covering the emitter—it gets down-weighted in the other direction. Wherever one pdf hits zero, the other weight simply becomes 1. Off the mouth entirely, the integrand is already zero anyway. The combined estimator remains unbiased as long as each technique is unbiased on its own, and the weights cleanly partition unity wherever the integrand is nonzero.

Notice that balance comfortably sits below the worse single arm at both points, across every single rung from \(N=16\) all the way to \(N=1024\), and sits inside both disks on the variance plate. It *might* sit above the better arm, and on this run, it actually does in those exact places. At the lip, the BSDF arm wins. At the miss, the light arm wins. The balance series for the lip tracks the BSDF arm (hovering just above it) while staying well below the light arm. The miss's balance series tracks the light arm the exact same way.

All three arms are entirely legal. Neutral is applied on every panel of the three-arm photograph because none of these represents a broken weight.

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

Just to clarify the vectors: \(\cos_y\) uses the direction from the mouth pointing toward the tile. \(\cos_x\) uses the direction from the tile pointing toward the mouth. If we used one shared \(\omega\) dotted into both normals, we'd end up flipping a sign. Fortunately, both cosines are positive for every mouth point across both instrument points. The printed minima are \(\min\cos_x=0.2999400179940021\) at the lip and \(0.2532209156959798\) at the miss, alongside \(\min\cos_y=0.4543108504242547\) at the lip and \(0.2991616902194818\) at the miss.

**BSDF.** This is Lambert plus a Lafortune Phong lobe aligned around \(R\). It's achromatic, using the exact same split we detailed in the importance-sampling note.

\[f_r(\omega_i)=\frac{k_d}{\pi}+k_s\frac{s+2}{2\pi}\,(R\cdot\omega_i)_+^{\,s}.\]

\[\begin{aligned} p_{\cos}(\omega)&=\frac{n_x\cdot\omega}{\pi}, & n_x\cdot\omega>0,\\ p_{\mathrm{phong}}(\omega)&=\frac{s+1}{2\pi}\,(R\cdot\omega)_+^{\,s}, & R\cdot\omega>0,\\ p_{\mathrm{bsdf}}(\omega)&=\pi_d\,p_{\cos}(\omega)+\pi_s\,p_{\mathrm{phong}}(\omega). \end{aligned}\]

Our locked values for the run are \(k_d=0.34\), \(k_s=0.28\), and \(s=160\). That puts \(\pi_d=0.34/0.62\) and \(\pi_s=0.28/0.62\). Our metrics table prints these explicitly as \(\pi_d=0.5483870967741935\) and \(\pi_s=0.4516129032258064\).

Notice that \((s+2)\) is the BRDF constant, while \((s+1)\) is the pdf constant. At \(s=160\), they only differ by \(1/161\), so testing a white furnace at our hero exponent won't easily catch a swap bug. The ratio \(f_{\mathrm{spec}}/p_{\mathrm{phong}}=k_s(s+2)/(s+1)\) serves as an algebraic check. If you want a furnace that actually exposes a swap, run it at \(s=8\). At that exponent, the mean is \(0.619901030295896\) against \(k_d+k_s=0.62\), exposing a relative gap of about \(1.6\times 10^{-4}\).

Sampling the BSDF arm acts as a single technique. We draw \(\xi_c,\xi_1,\xi_2\). If \(\xi_c<\pi_d\), we draw from the cosine hemisphere (\(\cos\theta=\sqrt{\xi_1}\), \(\phi=2\pi\xi_2\)). Otherwise, we draw from the Phong lobe around \(R\) (\(\cos\theta=\xi_1^{1/(s+1)}\), \(\phi=2\pi\xi_2\)). The contribution is then divided by the full mixture \(p_{\mathrm{bsdf}}(\omega)\). It's critical that the balance weight sees that marginal density—if we just divided by the individual component density, we'd be building a completely different estimator. If \(n_x\cdot\omega\le 0\), the integrand goes to 0, the sample still counts, and \(p_{\mathrm{phong}}\) isn't renormalized. That's our importance-sampling horizon rule at work. At both of our locked points, the lobe axis sits above the horizon, so both horizon fractions safely print as 0.

**Light density.** Assuming the mouth sits in the front half-space and the ray actually hits the rectangle:

\[p_{\mathrm{light}}(\omega)=\frac{1}{A}\,\frac{r^2}{\cos_y}.\]

Otherwise, \(p_{\mathrm{light}}=0\). This is simply our area-Jacobian factor. A sample missing the rectangle contributes exactly 0 because \(L_i=0\) there. The area draw itself, using \(u,v\in[0,1)\), looks like this:

\[y=\bigl(X_0+u(X_1-X_0),\; Y_0+v(Y_1-Y_0),\; 0\bigr).\]

**Integrand**, mouth only. (The analytic fill sits completely outside these three arms).

\[\ell(\omega_i)=f_r(\omega_i)\,L_i\,\cos_x\]

when the ray successfully hits the mouth and both cosines are positive. Otherwise, \(\ell=0\).

\[L_o=\int_{\Omega^+}\ell(\omega)\,d\omega.\]

The light-arm term gives us two ways to write the exact same quantity:

\[\frac{\ell}{p_{\mathrm{light}}}=f_r\,L_i\,\cos_x\,\cos_y\,\frac{A}{r^2}.\]

That emitter cosine in the numerator is just the geometry term. It's the Jacobian undone, not a second copy of it. If you throw in an extra \(\cos_y\), or forget the \(r^2\), the Lambert reduction breaks immediately. We rely on that failure as a check. It doesn't get a frame. The measured omission floors from the inspection-bench note are not the result of this note.

**Balance, equal counts.** For any technique \(i\) taking \(n_i\) samples, the general weight is \(n_i p_i\big/\sum_j n_j p_j\). Because this note gives both techniques the exact same count \(n=N/2\), those counts gracefully cancel out:

\[w_{\mathrm{bsdf}}=\frac{p_{\mathrm{bsdf}}}{p_{\mathrm{bsdf}}+p_{\mathrm{light}}},\qquad w_{\mathrm{light}}=\frac{p_{\mathrm{light}}}{p_{\mathrm{bsdf}}+p_{\mathrm{light}}}.\]

Everywhere on the support of \(\ell\), both densities are strictly positive at our locked points. Because the mouth sits in the front hemisphere, the cosine piece of \(p_{\mathrm{bsdf}}\) stays positive, and \(p_{\mathrm{light}}\) is positive on the mouth. Right there, \(w_{\mathrm{bsdf}}+w_{\mathrm{light}}=1\). The lip-direction pair sums perfectly to 1 within our \(10^{-12}\) check.

Off the mouth entirely, \(p_{\mathrm{light}}=0\). If a BSDF sample misses, it gets \(w_{\mathrm{bsdf}}=1\), but its integrand is already 0. Conversely, any direction where \(p_{\mathrm{bsdf}}=0\) and \(p_{\mathrm{light}}>0\) simply gets \(w_{\mathrm{light}}=1\). The weights cleanly partition unity anywhere the integrand has a chance to be nonzero.

For stable evaluation (used whenever \(p_{\mathrm{light}}>0\)): just use \(w_{\mathrm{light}}=1/(1+p_{\mathrm{bsdf}}/p_{\mathrm{light}})\). It yields the exact same number as the raw ratio.

**Three arms, budget \(N\).** We're looking at \(N\in\{16,64,256,1024\}\). By "budget", we mean strictly the number of integrand evaluations. Evaluating the *other* pdf to build a balance weight doesn't count as a second sample. We don't give the single arms extra samples to pay for calculating that pdf.

\[\begin{aligned} \widehat L_{\mathrm{bsdf}}&=\frac1N\sum_{j=1}^{N}\frac{\ell(\omega_j)}{p_{\mathrm{bsdf}}(\omega_j)},\\ \widehat L_{\mathrm{light}}&=\frac1N\sum_{j=1}^{N}\frac{\ell(\omega_j)}{p_{\mathrm{light}}(\omega_j)},\\ \widehat L_{\mathrm{bal}} &=\frac1n\sum_{j=1}^{n} w_{\mathrm{bsdf}}(\omega_j)\,\frac{\ell(\omega_j)}{p_{\mathrm{bsdf}}(\omega_j)} +\frac1n\sum_{j=1}^{n} w_{\mathrm{light}}(y_j)\,\frac{\ell(y_j)}{p_{\mathrm{light}}(y_j)}. \end{aligned}\]

That \(1/n\) is absolutely required. If you put a \(1/N\) in front of each balance sum, you accidentally cut the estimator in half. The technique split is purely deterministic: the first \(n\) draws come from the BSDF stream, and the first \(n\) come from the light stream.

**Fill**, computed after the arm, diffuse only. The Phong term never sees it. Because both instruments keep the mouth fully in the front hemisphere, we get:

\[L_{o,\mathrm{fill}}=\frac{k_d}{\pi}\,L_{\mathrm{fill}}\,(\pi-\Omega_\perp).\]

When you look at the ladder and the signed means, they're comparing the mouth integral strictly against the quadrature \(L_o\). The fill is not inside those numbers. The photographs add this one analytic term—the exact same term across every arm. Matte surfaces fall back to the analytic Lambert expression using their own albedo in place of \(k_d\), and they never take a Phong sample. Fill radiance sits at \((0.012,\,0.014,\,0.018)\), with \(Y=1.3863600000\times 10^{-2}\).

**Truth.** The diffuse piece is just the signed four-corner projected solid angle. Vertex order inherently handles the sign. Our run prints \(\Omega_\perp>0\) at both points.

\[E=L_i\,\Omega_\perp,\qquad L_{o,d}=\frac{k_d}{\pi}\,E.\]

As for the specular piece, there is no tidy four-corner form for this specific Phong model. The absolute truth of \(L_o\), specular included, is computed via a tensor-product Gauss–Legendre rule across the mouth's parameter square, using \(8\times 8\) cells with order 40 in each cell. The metrics table refers to this as `gauss_legendre_8x40`. A lighter \(6\times 32\) rule agrees with it to within a relative \(10^{-8}\) on \(Y\) at both points. The diffuse-only quadrature agrees with the contour \(L_{o,d,Y}\) to within a relative \(10^{-9}\). The published \(L_{o,Y}\) you see here is the heavy order-40 value.

**Why \(s=160\).** The Phong mass is concentrated tightly on a cap of order \(2\pi/(s+1)\approx 0.039\,\mathrm{sr}\). At the lip, the mouth is several times larger than that cap, so area samples mostly miss the peak, while Phong samples aimed right at the inset hit comfortably land on the mouth. Down at the miss, evaluating \((R\cdot\omega)^{160}\) over the whole rectangle is utterly negligible compared to the Lambert term, which is exactly what the miss specular/diffuse ratio is telling us. If we used an exponent wide enough to cover this mouth, it would stop the light arm from fireflying entirely. We're using one exponent, so there is no exponent plate.

**Error.** We use \(K=32\) independent prefixes, seeded at **20260926** via SplitMix64, mapping the top 53 bits directly to \([0,1)\). Stream 0 opens with \(0.7466817377103402\), \(0.669510631620856\), \(0.5708748435191999\). The estimate at \(N\) is simply the prefix. We measure error on Rec.709 \(Y\) (coefficients \(0.2126\), \(0.7152\), \(0.0722\)) directly against the quadrature:

\[\mathrm{rel}_k(N)=\frac{\widehat L_{k,Y}(N)-L_{o,Y}}{L_{o,Y}}, \qquad \mathrm{rmse}(N)=\sqrt{\frac1K\sum_k\mathrm{rel}_k(N)^2}.\]

The draws are IID. The statistic we actually need to see fall is the RMSE across the \(K\) prefixes. A single prefix of a heavy-tailed light arm can wiggle wildly while the overall estimator remains completely unbiased.

**Standard error on the variance plate**, pulled from the same \(N=64\) draws as the three-arm photograph. For a single arm, the sample variance of the Rec.709 \(Y\) terms uses \(N-1\), giving us \(\mathrm{stderr}=\sqrt{s^2/N}\). For balance, we pull \(n=32\) terms from each technique, with each term already multiplied by its respective balance weight, yielding:

\[\mathrm{stderr}=\sqrt{\frac{s_b^2}{n}+\frac{s_l^2}{n}}.\]

The two techniques are strictly kept separate. They aren't treated as one giant population of \(N\) numbers, and the variance isn't divided by \(N\) a second time. Since fill is a constant on a given pixel, it sits outside this accumulator. The quoted disk figures are simply the mean of that per-pixel standard error evaluated inside a 12 mm radius.

---

## The kiln mouth

World in meters, \(Y\) up, right-handed. The only emitter in the scene is the muffle mouth: bounded by plane \(z=0\), \(x\in[-0.22,\,0.22]\), \(y\in[1.05,\,1.64]\), with an outward normal of \(+Z\). That gives a width of \(0.44\,\mathrm{m}\), height of \(0.59\,\mathrm{m}\), and \(A=0.2596\,\mathrm{m}^2\). It's one-sided, so \(z<0\) emits nothing. Exposure is set to \(1.00\).

The eye is just the reflection construction that maps the lip's mirror ray cleanly onto the chosen hit, making the inset an identity.

|  | value |
| --- | --- |
| eye | \((0.1453673781693574,\; 1.505862424473805,\; 1.453673781693575)\) |
| target | \((0,\; 1.18,\; 0.28)\) |
| vertical FOV | \(46^\circ\) |

|  | lip | miss |
| --- | --- | --- |
| \(\Omega_\perp\) | \(0.3212572527424995\,\mathrm{sr}\) | \(0.2742559005975028\,\mathrm{sr}\) |
| \(E_Y\) | \(1.666136489898425\) | \(1.422373377268829\) |
| \(L_{o,d,Y}\) | \(0.1803182235985176\) | \(0.1539368726619603\) |
| \(L_{o,Y}\) | \(0.8922731625666653\) | \(0.1539368726945163\) |
| specular / diffuse | \(3.948324937768523\) | \(2.114893779357608\times 10^{-10}\) |
| \(E_Y/E_{\mathrm{fill},Y}\) | \(42.61218441186641\) | \(35.78152895218164\) |
| \(n\cdot\omega_o\) | \(0.4966085446506598\) | \(0.4366167162249477\) |

Because \(f_r\) is achromatic, \(L_o\) and \(E\) share a single scalar across all channels with \(L_i\). The mouth easily dominates the fill at both sample points. The glaze tile is the only Phong surface in the entire scene, and its top surface sits at \(y=0.900\). Both of our instruments—and the 12 mm disks drawn around them—lie flush on that top surface. Everything else (the shelf, cones, rib, firebrick, and floor) is purely matte. The cones and rib sit strictly on the camera side of both instruments, so a line segment drawn from either instrument straight to the mouth will never intersect them. The estimator runs completely unoccluded. Corners facing away from the mouth are dark simply because the back wall sits exactly on the mouth's own plane, and our fill is just a constant Lambert ambient. Nothing bounces. There are no contact shadows beneath the cones.

The distance ratios \(r_{\max}/r_{\mathrm{closest}}\) sit at \(2.06098792642672\) for the lip and \(2.89530225013162\) for the miss. That tells us the Jacobian isn't just a constant across this mouth. But to be clear, they aren't an omission floor, and we aren't plotting one here.

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

Look at how every series cleanly falls at every rung. Each \(N=16\) value is more than five times higher than its matching \(N=1024\) value. Our check was simply that it falls at every rung and drops by a factor of at least three. We didn't set a hard numeric RMSE target in advance—the table you see is just the raw result.

If you divide the printed keys, light over BSDF at the lip runs about \(5.10\) at \(N=64\) and about \(2.08\) at \(N=1024\). Over at the miss, BSDF over light is roughly \(7.00\) at \(N=64\) and \(4.84\) at \(N=1024\). The same dynamic, even without those exact numeric factors, holds true at \(N=16\) and \(N=256\): the light arm is consistently the worse one at the lip, the BSDF arm is the worse one at the miss, and balance comfortably tucks itself below whichever arm is failing. The winners are exactly the literals `bsdf`, `bsdf`, `light`, `light`.

Notice that balance stays above the better arm on every single rung. At the lip at \(N=1024\), it's \(0.0394574853759122\) against the BSDF arm's \(0.03737322030225639\). At the miss at \(N=1024\), it hits \(0.03449795333963287\) against the light arm's superior \(0.02502486831590404\). That gap to the worse arm is precisely what the weight is designed to close.

The lip light arm is our heavy tail. Just a few lucky area samples end up carrying the lobe. Its RMSE plummets from \(0.7304631415769416\) down to \(0.07772808316858408\)—dropping faster than the BSDF arm—but it's still definitively the worse of the two at \(N=1024\). The miss BSDF arm is our other heavy tail, and it remains the worse arm even at the top of the ladder.

Signed means at \(N=1024\):

| arm | lip | miss |
| --- | --- | --- |
| BSDF | \(-0.002731905356039808\) | \(+0.02759449102141028\) |
| light | \(-0.003899555994426759\) | \(-0.008199037159731746\) |
| balance | \(-0.01277686469507701\) | \(-0.01175426953620759\) |

The unbiasedness check we use is \(\lvert\mathrm{mean\_rel}(1024)\rvert\le 5\,\mathrm{rmse}(1024)/\sqrt{K}\) with \(K=32\). If there were a bias floor, the absolute mean would land on the same scale as the RMSE. Every arm at both sample points comfortably clears the gate. The largest absolute mean at the lip is from the balance arm, sitting at about a third of its RMSE. The largest at the miss is the BSDF arm, hovering just under a quarter of its RMSE.

Here are the disk means of the \(N=64\) standard error, the exact numbers drawn on the teaching pin:

| disk | BSDF | light | balance |
| --- | --- | --- | --- |
| lip | \(0.1197899661872358\) | \(0.3079049113038804\) | \(0.1312898735904618\) |
| miss | \(0.0772988573354273\) | \(0.01309165077371938\) | \(0.01779797833390362\) |

---

## Quote the metrics. Do not quote the beauty photographs as meters.

CPU double, before Neutral. Seed **20260926**. Beauty display is Khronos PBR Neutral, \(e=1.00\), with constants not re-fit. The RMSE series are the tables in the previous section.

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

A few shortenings are strictly for the eye. Lip light disk standard error **0.308** translates to \(0.3079049113038804\). Mouth area **0.2596** is actually the bound product \(0.2595999999999999\). Keep in mind, none of these quick visual shortenings replace the full precision table.

---

## Honesty gaps

1. **The actual meter is the CPU double contour, the double Gauss–Legendre rule, and the double estimator.** The room we render for the photograph uses float32. The metrics table isn't read off a JPEG. We keep \((R\cdot\omega)^{160}\) in double precision because a float32 evaluation of that power would aggressively underflow on the lobe shoulder, heavily biasing the lip. A mouth pixel reads back \(R=7.5\) before Neutral even touches it. The framebuffer is perfectly linear. One front-facing shelf pixel cleanly agrees between the CPU double Lambert value and the float32 shading to a relative \(2.8\times 10^{-6}\) on \(Y\). Our build's linear reading of the hero pixel nearest the lip is the balance sample at \(Y\,0.902\), against an analytic Lambert stand-in at \(Y\,0.184\). Those two readings are not keys in our metrics table.
2. **Neutral might easily shoulder an \(N=64\) light-arm firefly right to white.** We do not clamp the estimator before forming the standard error. The absolute size of the firefly is simply the standard error on the variance plate. We aren't making claims about energy *after* Neutral is applied. The constants are exactly from the tone-mapping note: \(e=1.00\), \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\), and they are not re-fit.
3. **The variance plate maps float standard error, authored in sRGB.** It shares a single scale anchored at \(0.9246898237889386\). If we used a per-panel autoscale, it would still technically pass the disk inequalities, but it would fundamentally be the wrong plate. The disk means are strictly averages, while the scale maximum is drawn from one single tile pixel.
4. **Balance sits below the worse arm and above the better arm.** At the lip, it tracks the BSDF series. At the miss, it tracks the light series. The weight handles the mixture exactly as designed, but this is not a claim that balance somehow beats the arm that already perfectly matched the integrand.
5. **The integral is completely unoccluded.** Because the back wall is coplanar with the mouth, it doesn't see the emitter at all. Corners stay dark because the fill is a constant Lambert ambient and absolutely nothing bounces. We intentionally omitted specular fill: if we put a Phong lobe over a constant dome, we'd add a highlight that isn't the mouth. You won't find a contact shadow under a cone, and there is no visibility term.
6. **A single prefix is not a monotone statistic.** The locked meter relies on RMSE over \(K=32\). The lip light arm has a notoriously heavy tail. A single walk of length 1024 can wiggle wildly while the underlying weight remains perfectly correct.
7. **The Lambert residual is the band evaluated at a final count of 16384.** We have `lambert_reduction_max_abs_mean_rel` \(=0.002711173413998751\). The check uses \(k_s=0\) at the lip across eight replicates, treating the contour \(L_{o,d}\) as truth. The printed number is the largest absolute mean relative error of the three arms at that final count. On these specific replicates, the cosine arm acts as a hit-or-miss draw, with \(\Omega_\perp/\pi\) sitting around a tenth. The absolute mean relative error was \(0.024\) at 512 and \(0.017\) at 4096—both landing outside \(10^{-2}\)—while the light arm stayed perfectly quiet. The fall from a prefix of 32 down to a prefix of 512 serves as a separate check, and it safely holds. If you drop \(r^2\), add an extra \(\cos_y\), or build a balance average that mistakenly puts \(1/N\) in front of each sum, you will miss the band by a massive margin. The count of 16384 is just the sample count behind this single residual; it's not a beauty rung and certainly not a second ladder.
8. **The white furnace runs at \(s=8\), not the hero exponent.** Mean \(0.619901030295896\) against \(0.62\). Fixture S, with \(\Omega_\perp=0.002397921970815975\,\mathrm{sr}\), acts as the on-axis contour. To be clear, neither test constitutes a frame.
9. **The JPEG is simply 8-bit display-referred.** Everything that matters—\(\Omega_\perp\), \(L_o\), RMSE, signed means, and standard errors—lives directly inside the double estimator and in the table above. The room is drawn via a single fragment shader on llvmpipe. We make zero GPU, wavefront, or frame-time claims here.

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

**Can claim:** On this specific OSMesa / llvmpipe build, a CPU double estimator successfully drew a Phong–Lambert mixture and a uniform area on a single unoccluded rectangle, accurately converted the area draw using the legal Jacobian, and neatly combined the two with the balance weight using equal technique counts. At both locked points, all three arms' \(K=32\) relative RMSE successfully fell from \(N=16\) to \(N=1024\) against the quadrature \(L_o\), and the balance RMSE securely sat below the worse single arm at every single rung. At the lip, the BSDF arm won at \(N=64\) and at \(N=1024\). Over at the miss, the light arm won at both. The variance plate cleanly shows the per-pixel standard error of those terms at \(N=64\) on one shared scale, placing the lip light disk at \(0.3079049113038804\). The cover genuinely shows the balance estimator at \(N=1024\), backed by the named diffuse fill, under Neutral \(e=1.00\). The run proudly prints **53 pass / 0 fail**.

**Cannot claim:** Any GPU, wavefront, ray-tracing core, or frame-time budget. The meter absolutely never reads the shader's tile pixels back as \(L_o\). We claim nothing regarding energy after Neutral. You cannot safely measure anything by sampling the JPEG of the cover or the three-arm plate. We make no claims about interreflection or shadows cast under cones. We do not claim that one prefix acts monotone, or that balance magically beats the better arm. Finally, this weight hasn't been ranked against a power heuristic, VNDF, or a complex multi-light survey, and we definitely didn't evaluate \((R\cdot\omega)^{160}\) in float32.

For this specific run: **53 pass / 0 fail**. We rigorously checked the geometry, the signed contour, the Gauss–Legendre agreement, the lip-direction pdf, and both balance weights *before* treating the photographs as meters. The RMSE successfully fell on every arm at both sample points. The disk inequalities consistently hold on one shared scale, and the horizon fraction safely reports 0 at both points. At its final count, the Lambert band prints exactly \(0.002711173413998751\).

---

## Out of scope

Tweaking a power of \(p_i\), including targeting a point marked \(\beta=2\), creates a completely different weight. Balance in this context strictly refers to the weight proportional to \(p_i\). Adding a second mouth, an environment map, a mesh light, or a three-strategy balance that tears cosine and Phong into totally separate arms is strictly out of scope. We intentionally use one rectangle because it already forces the two single arms to fail in distinct, useful places.

We're keeping occlusion, a cone casting shadows on the tile, multi-bounce, Russian roulette, and any path longer than the direct mouth out of bounds. The half-vector Jacobian, Smith \(G\), VNDF, GGX, and Fresnel all stay out as well. We can easily write a balance weight for a Phong lobe aligned around \(R\) simply because that lobe is already formulated as a density in \(d\omega\).

Pitting Phong directly against cosine as competing arms, tracking firefly counts, and running an exponent sweep stay firmly in the importance-sampling note. Cosine only shows up here as a basic component inside \(p_{\mathrm{bsdf}}\). Dropping \(r^2\), omitting the emitter cosine, reviewing the equal-\(\Omega\) histogram, and discussing the centroid shortcut all live in the area-Jacobian note. The Jacobian's only role here is serving as the legal \(p_{\mathrm{light}}\).

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

Pin the cover as the kiln evaluated at balance, \(N=1024\). Pin the variance plate as our teaching figure. Pin the three-arm photograph to show two legal densities evaluated at a single \(N\). Pin the ladder to track the RMSE. That's two legal densities on one mouth. The balance weight successfully shifts the variance, and the estimator stays perfectly unbiased.
