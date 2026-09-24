---
title: "Light Sampling and the Area Jacobian"
description: "Vertical softbox on a night inspection bench. Ω⊥=0.419598441342 sr; (Ec-E)/E=-0.194936551657; jacobian_ratio 37.5654619429."
date: 2026-09-25
tags:
  - graphics
  - engine
  - lighting
math: true
cover: /assets/journal/light-sampling-and-the-area-jacobian/00_hero.jpg
---
光采样与面积雅可比

Our last note, [Solid Angle and the Rendering Equation](/posts/p/solid-angle-and-the-rendering-equation/), focused on the measure. Path tracers sample \(d\omega\), while irradiance and the rendering equation naturally track \(\Omega_\perp\). It turned out that area was the wrong closed form for a disk. In this note, we're drawing uniform area on a **rectangle** and walking through the correct conversion.

At its core, a legal light sample is just an area density pushed onto \(d\omega\). If you use an estimator that casually drops \(r^2\) or the emitter cosine, your result is strictly **biased**. That error does not fall, no matter how high you crank \(N\).

\[
p(\omega)=p(A)\,\frac{\lVert x-y\rVert^2}{n_y\cdot\omega},\qquad d\omega=\frac{(n_y\cdot\omega)}{r^2}\,dA.
\]

Our earlier [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) note (*Importance Sampling: Phong Lobe vs Cosine*) kept two BSDF densities on a single integral, with both already in \(1/\mathrm{sr}\). The key piece there was a finite disk with an angular radius of \(3.600^\circ\). We didn't actually need the solid angle of that disk as a light sample at the time, but for the record, it is

\[
\Omega(3.600^\circ)=0.012398431\,\mathrm{sr}.
\]

We're citing it here, but the actual Phong-versus-cosine comparison stays over in that note. Similarly, the disk irradiance comparison remains in the solid-angle note.

Say hello to our new photographic setup: the **night inspection bench**. It features a vertical rectangular softbox on a stand (with both the diffuser and light in frame), a matte bench, a white Lambert card, and a matte vise for scale, all sitting in a dark, closed shop. We'll leave the loft bottle, the metro colonnade, the gallery lacquer sphere, and the courtyard atrium back in their respective notes.

The Lambert card acts as our instrument here. Uniform draws on the diffuser give us a density per square meter, but the rendering equation still integrates incoming radiance in steradians. So while \(p(A)\) is a perfectly legal area density, it only becomes a valid \(p(\omega)\) after we multiply by the conversion factor above.

**Pin this.** Here's what equal-\(\Omega\) occupancy of the panel footprint actually looks like. On the left, we map an area-uniform distribution. On the right, we draw the exact same count of directions uniformly in \(\Omega\) and keep only the ones that strike the diffuser. The white edge marks our interior mask, and the orange curve traces the footprint outline. The axes are \(\mu=\cos\theta\) and azimuth \(\phi\), with a cell solid angle of \(2\pi/512\,\mathrm{sr}\). We have **35** interior cells. Notice the area occupancy spans **86..952**, while the uniform-in-\(\Omega\) occupancy sits much tighter at **314..400**.

Let's run the hero stats: Mesa 25.0.7 llvmpipe, linear Rec.709, **Khronos PBR Neutral** \(e=\mathbf{1.00}\), seed **20260924**. We get \(\Omega_\perp=\mathbf{0.419598441342}\,\mathrm{sr}\), \(E_Y=\mathbf{1.67839376537}\), and a relative error \((E_c-E)/E=\mathbf{-0.194936551657}\). The centroid plate rounds that relative error to **-0.195**. If we track the legal RMSE across \(K=32\) shared prefixes, it falls steadily as expected: \(0.1644\to 0.1089\to 0.06826\to 0.02638\) at \(N=16/64/256/1024\). The exact tokens are `rmse_legal_N16` **0.164412278931**, `rmse_legal_N64` **0.108928582911**, `rmse_legal_N256` **0.0682573241753**, and `rmse_legal_N1024` **0.0263804488107**.

If we look at the broken estimators: Failure A (dropping \(r^2\)) floors out at `mean_rel_drop_r2_N1024` \(=\mathbf{-0.645746690189}\). Failure B (dropping the emitter cosine) hits its own floor at `mean_rel_drop_cos_N1024` \(=\mathbf{+1.04013072615}\). The Jacobian ratio across the panel is a steep **37.5654619429**. Our panel-over-fill ratio is **22.069** (`panel_over_fill` **22.0690362063**), and the distance ratio \(r_{\max}/r_{\min}\) is **3.349** (`r_ratio` **3.3491112796**). The setup uses \(L_i=(4,4,4)\), \(\rho=0.80\), and \(A=0.448\,\mathrm{m}^2\). All assertions passed smoothly (**72 pass / 0 fail**).

For the visuals: the cover and the shop frames on the centroid plate are drawn at **8×** and box-averaged in linear light down to \(1280\times 720\) before running through Neutral. The occupancy chart, bias chart, and metrics strip are authored directly in sRGB and are not supersampled.

---

## What you are seeing

Our working space is strictly **scene-referred linear Rec.709**. We're dealing with one shop, one rectangle, and one Lambert card. The display mapping on the photographs inherits straight from our [tone-mapping](/posts/p/tone-mapping-scene-referred-to-display-referred/) note: Khronos PBR Neutral, \(e=1.00\), \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\), followed by the standard IEC 61966-2-1 sRGB OETF applied on the CPU. Remember, Neutral just assigns the display code values; it doesn't author the fundamental irradiance \(E\).

**Cover — presentation.** A clean view of the night bench: softbox in frame, white card, vise, complete with legal rectangle lighting and the named shop fill. There's no HUD here. It's just the photograph—the actual numeric meter is not embedded in this JPEG.

**Occupancy — teaching pin.** You've already seen this on the page. We're looking at equal-\(\Omega\) cells, placing the area-uniform distribution right next to the uniform-in-\(\Omega\) one. The interior mask provides our baseline comparison.

**Bias chart — the floors.** This chart plots relative RMSE for \(K=32\) on a log axis for \(N\), keeping the RMSE scale linear. You can watch the legal error fall cleanly, while the estimators dropping \(r^2\) or the cosine just flatline on their respective floors. We've printed the signed means at \(N=1024\) directly under the chart. Keep in mind, this chart illustrates the broken weights—it's not a spatial render of the room.

**Centroid plate — Failure C.** The upper band shows the legal and centroid full frames side-by-side from the exact same eye, with gold boxes marking the card's location. The text overlay reads `CENTROID_SIGNED_REL` **-0.195**, explicitly showing `(EC-E)/E = -0.194937` and `FROM THIS RUN`. The lower band opens up a card-and-bench crop for each, displaying the headers `Y 0.446` and `Y 0.362`, followed by a linear \(\vert{}\mathrm{legal}-\mathrm{centroid}\vert{}\) heat map of that specific crop. This heat map shows Rec.709 \(Y\) pulled straight from the float buffers *before* Neutral touches them. The card itself sits at the bright end of the ramp.

**Metrics strip — snapshot.** This is literally a picture of the current run's metrics table, laid out in two columns. The actual markdown table in the text is the definitive quote. If a clipped glyph on the strip looks ambiguous, trust the table.

Let's keep two facts strictly separate:

1. **Photographs** (like the cover and the framed shop on the centroid plate) are the GLSL room running on this llvmpipe stack, passed through Neutral, and then sRGB. The shader correctly shades the shop using a rectangle form factor. \(\Omega_\perp\), \(E\), and the relative error are not values you can just read off the JPEG.
2. **Instruments** (the occupancy chart, bias chart, centroid plate heat map, metrics strip, and the text table below) represent the raw float identities, occupancy counts, and CPU estimator results. When citing numbers, quote the table.

---

## Three failures

Radiance \(L_i\) is constant across the diffuser and exactly zero on its back face. Irradiance at the card is simply that radiance multiplied by a geometry term. The correct, legal term inherently carries both foreshortening effects and the \(1/r^2\) falloff. There are three common ways to completely break this term. The first two act as Monte Carlo branches using shared samples, while the third relies on an analytic stand-in evaluated at the same point.

**Failure A — drop \(r^2\).** Here, we keep both cosines and \(p(A)\), but omit \(1/r^2\). The sample mean ends up converging to \(\int L_i\,\cos_x\,\cos_y\,dA\), which is an entirely different integral—and the weight inadvertently picks up an extra \(\mathrm{m}^2\). On this specific seed, the \(N=1024\) mean hovers at **-0.645746690189** relative to \(E_Y\). Because \(1/r^2\) is largest at the near edge of the panel, dropping it pulls our estimate aggressively low. You'll find this arm plotted directly on the bias chart.

**Failure B — drop the emitter cosine.** This time, we keep \(1/r^2\), the receiver cosine, and \(p(A)\), but we omit \(\cos_y\). The limit now converges to \(\int L_i\,\cos_x/r^2\,dA\). Keep in mind that \(\cos_y\) belongs to the change of measure. Since our constant \(L_i\) already represents the emitter's radiance, \(\cos_y\) isn't just a second Lambert lobe painted onto the panel. Even though the weight dimensionally looks like irradiance, it's still calculating the *wrong* irradiance. The \(N=1024\) mean sits high at **+1.04013072615** relative to \(E_Y\)—establishing a completely different floor than Failure A. This arm is also tracked on the bias chart.

**Failure C — centroid stand-in.** Let's replace the full integral with a geometry term evaluated purely at the diffuser's centroid: one single distance \(r\), one pair of cosines, keeping the same area and the same \(L_i\). That is essentially taking a point-light reading of a rectangle. Because the card sits much closer to the panel's near lower edge than its center (and off the panel's \(z=0\) line), this shortcut severely diverges from the true four-corner sum. We get \((E_c-E)/E=\mathbf{-0.194936551657}\). The visual plate rounds this to **-0.195**. This arm is completely analytic, so it has no \(N\), and it only lives on the centroid plate.

Notice that the receiver cosine \(\cos_x\) stays inside every single arm, including the broken ones and the double-count bug below. Taking it out entirely would just mean missing the projected factor we already established back in the solid-angle note.

We also tested a fourth arm that counts \(\cos_y\) twice. Since constant radiance already handles the emitter side, throwing in an extra cosine is a dimensionless bug that drags the mean artificially low: `mean_rel_double_N1024` \(=\mathbf{-0.458986283232}\). We only included this in the metrics table; it doesn't get a frame, and it never enters Neutral.

Failures A and B are not beauty renders. Once Neutral and sRGB compress a unit-wrong weight, the resulting JPEG can easily be misread as valid irradiance. We apply the same rule here as we did for the fireflies on the importance-sampling cover: the visual record of a broken weight is strictly a chart of the float error. That chart is our bias plate. The centroid stand-in, however, is dimensionally correct as an irradiance, so it gets visualized on the centroid plate, and only there.

---

## Change of measure

Let's establish our symbols upfront so we can rely on them clearly in the later sections.

| symbol | meaning | unit |
| --- | --- | --- |
| \(x\) | instrument point on the card, \((0.280,\,0.908,\,-0.200)\) | \(\mathrm{m}\) |
| \(y\) | sample point on the diffuser | \(\mathrm{m}\) |
| \(y_c\) | diffuser centroid, \((0,\,1.50,\,0)\) | \(\mathrm{m}\) |
| \(r\) | \(\lVert y-x\rVert\) | \(\mathrm{m}\) |
| \(\omega_i\) | \((y-x)/r\), from the card toward the panel | unitless |
| \(n_x\) | card normal, \(+Y\) | unitless |
| \(n_y\) | diffuser outward normal, \(+X\) | unitless |
| \(\cos_x\) | \(n_x\cdot\omega_i\) | unitless |
| \(\cos_y\) | \(n_y\cdot(x-y)/r\) | unitless |
| \((n_x\cdot\omega)\) | means \(\cos_x\) in the opening formula |  |
| \((n_y\cdot\omega)\) | means \(\cos_y\) in the opening formula |  |
| \(A\) | diffuser area, \(0.448\) | \(\mathrm{m}^2\) |
| \(p(A)\) | \(1/A\) on the diffuser, else \(0\) | \(\mathrm{m}^{-2}\) |
| \(L_i\) | constant one-sided radiance, \((4,4,4)\) | linear Rec.709 |
| \(L_{\mathrm{fill}}\) | shop fill on the rest of the hemisphere, \((0.025,\,0.028,\,0.036)\) | linear Rec.709 |
| \(\rho\) | card albedo, \(0.80\) | unitless |
| \(E\) | irradiance at \(x\) from the diffuser alone | \(L\cdot\mathrm{sr}\) |
| \(L_o\) | outgoing radiance of the Lambert card, \(\rho E/\pi\) | linear Rec.709 |

Those two cosines represent two distinct foreshortenings. \(\cos_x\) uses the direction from the card looking toward the emitter, while \(\cos_y\) uses the direction from the emitter looking toward the card. When we dot one shared \(\omega\) into both normals, it naturally flips a sign. For this specific panel and card placement, both cosines remain positive at every corner and for every legal sample. The exact printed minima are \(\min\cos_y=\mathbf{0.246253045359}\) and \(\min\cos_x=\mathbf{0.326568395956}\).

Our diffuser sits on the plane \(x=0\), \(y\in[1.10,\,1.90]\), \(z\in[-0.28,\,0.28]\). It has a width of \(0.56\,\mathrm{m}\), a height of \(0.80\,\mathrm{m}\), and \(A=0.448\,\mathrm{m}^2\). It's strictly one-sided, and the sampling logic doesn't depend on the exact contour order:

\[
y=(0,\;1.10+v\cdot 0.80,\;-0.28+u\cdot 0.56),\qquad u,v\in[0,1).
\]

When we change the measure (with the panel firmly in the front half-space), we get:

\[
d\omega=\frac{\cos_y}{r^2}\,dA,\qquad p(\omega)=p(A)\,\frac{r^2}{\cos_y}.
\]

For the irradiance at the card—assuming constant \(L_i\), a single unoccluded bounce, and leaving the ambient fill out of our estimator arms—the math looks like this:

\[
E=\int_{\mathrm{panel}} L_i\,\cos_x\,d\omega=\int_{A} L_i\,\frac{\cos_x\,\cos_y}{r^2}\,dA.
\]

And for the Lambert card itself, with \(L_e=0\) and \(f_r=\rho/\pi\):

\[
L_o=\frac{\rho}{\pi}\,E.
\]

Our ground truth is simply the planar rectangle's projected solid angle multiplied by \(L_i\). We evaluate this using a signed four-corner sum:

\[
\Omega_\perp(x)=\frac12\sum_{i=0}^{3}\gamma_i\,(n_x\cdot\hat\nu_i),\qquad \gamma_i=\arccos(\hat r_i\cdot\hat r_{i+1}),\qquad \hat\nu_i=\mathrm{normalize}(\hat r_i\times\hat r_{i+1}),\qquad r_i=v_i-x.
\]

\[
E=L_i\,\Omega_\perp.
\]

The vertex order is effectively part of the sign. To ensure \(\Omega_\perp>0\) at our instrument, the loop runs as follows:

|  | \(x\) | \(y\) | \(z\) |
| --- | --- | --- | --- |
| \(v_0\) | 0 | 1.90 | +0.28 |
| \(v_1\) | 0 | 1.90 | -0.28 |
| \(v_2\) | 0 | 1.10 | -0.28 |
| \(v_3\) | 0 | 1.10 | +0.28 |

This sum is signed. Simply slapping an absolute value on it to hide a reversed card normal would fail our checks. For this run, the code prints \(\Omega_\perp=\mathbf{0.419598441342}\,\mathrm{sr}\) and \(E_Y=\mathbf{1.67839376537}\). Since \(L_i\) is completely achromatic, the three channels of \(E\) perfectly match: each is exactly **1.67839376537**.

**Arms.** Let's pull one sample \(y\sim p(A)\). We're going to feed that exact same \(y\) into every arm to see what happens. Here, \(p(A)=1/A\).

\[
w_{\mathrm{legal}}=L_i\,\frac{\cos_x\,\cos_y}{r^2\,p(A)}=L_i\,\cos_x\,\cos_y\,\frac{A}{r^2},
\]

\[
w_{r^2}=L_i\,\cos_x\,\cos_y\,A,
\]

\[
w_{\cos}=L_i\,\cos_x\,\frac{A}{r^2},
\]

\[
w_{\mathrm{dbl}}=L_i\,\cos_x\,\cos_y\,\cos_y\,\frac{A}{r^2}.
\]

\[
\widehat E=\frac1N\sum_{k=1}^{N} w(y_k).
\]

Notice that \(w_{\mathrm{legal}}\) is just \(L_i\cos_x/p(\omega)\): the integrand divided by the density we actually sampled. \(w_{r^2}\) is Failure A. \(w_{\cos}\) is Failure B. \(w_{\mathrm{dbl}}\) is our double-count bug. And crucially, \(\cos_x\) remains present inside all four weights.

**Centroid.** For the centroid approach, we evaluate it analytically using the same \(L_i\) and the same total area:

\[
E_c=L_i\,A\,\frac{\cos_x(y_c)\,\cos_y(y_c)}{r_c^2},\qquad r_c=\lVert y_c-x\rVert.
\]

For this run, \(E_{c,Y}=\mathbf{1.35121347243}\).

**Fill.** As for the ambient fill at the instrument (keeping the panel within the front hemisphere):

\[
E_{\mathrm{fill}}=L_{\mathrm{fill}}\,(\pi-\Omega_\perp),\qquad E_{\mathrm{total}}=E+E_{\mathrm{fill}}.
\]

Keep in mind that our estimator arms isolate \(E\), the diffuser term. They aren't trying to estimate \(E_{\mathrm{total}}\). If we folded the fill into our broken weights, it would just incorrectly pin their error floors to the room's ambient light level. The printed fill stats are \(L_{\mathrm{fill},Y}=\mathbf{0.0279398000}\), \(E_{\mathrm{fill},Y}=\mathbf{0.0760519738914}\), and \(E_Y/E_{\mathrm{fill},Y}=\mathbf{22.0690362063}\). Card outgoing, panel alone, is \(L_{o,Y}=\mathbf{0.427399462741}\). For panel plus fill, we get \(L_{o,Y}=\mathbf{0.446765938864}\).

Here is the Jacobian of the measure, which effectively acts as our geometry term:

\[
\frac{d\omega}{dA}=\frac{\cos_y}{r^2}.
\]

Because \(\cos_y=\Delta x/r\) with \(\Delta x=0.280\,\mathrm{m}\) fixed on this plane, the ratio of the extrema simplifies to \((r_{\max}/r_{\min})^3\). The run prints \(r_{\max}/r_{\min}=\mathbf{3.3491112796}\), \((d\omega/dA)_{\max}=\mathbf{7.15512954475}\,\mathrm{m}^{-2}\), and \((d\omega/dA)_{\min}=\mathbf{0.190470958553}\,\mathrm{m}^{-2}\), yielding a steep ratio of **37.5654619429**. The near lower edge forms the high end, while the far corner sits at the low end. Distance runs from \(r_{\min}=\mathbf{0.339505522783}\,\mathrm{m}\) to \(r_{\max}=\mathbf{1.13704177584}\,\mathrm{m}\).

Our estimator draws \(K=32\) independent streams from seed **20260924** using SplitMix64, each running to a length of 1024. The estimate at \(N\in\{16,64,256,1024\}\) is simply the mean of the prefix of length \(N\). We have one generator feeding four prefixes and four weights. Stream 0 reliably opens at \(u_0=\mathbf{0.0549755345579}\), \(v_0=\mathbf{0.190148106104}\). The draws are IID in area. (Stratification would obviously change the variance, but that's a topic for a different note.)

We measure error on Rec.709 \(Y\), against our exact closed form:

\[
\mathrm{rel}_k(N)=\frac{\widehat E_{k,Y}(N)-E_Y}{E_Y},\qquad \mathrm{mean\_rel}(N)=\frac1K\sum_k\mathrm{rel}_k(N),\qquad \mathrm{rmse}(N)=\sqrt{\frac1K\sum_k\mathrm{rel}_k(N)^2}.
\]

The bias chart plots exactly that \(\mathrm{rmse}(N)\). If you're trying to call the fall, the signed mean of the legal arm is the wrong curve to look at. At \(N=1024\), that mean wanders around \(+\mathbf{0.00775270607151}\), which is quite small compared to the legal RMSE itself.

---

## Equal-\(\Omega\) histogram

The occupancy plate is honestly the whole reason I wrote this note. We're looking at the receiver hemisphere centered about \(n_x\), plotting \(\mu=\cos\theta=n_x\cdot\omega_i\) against an azimuth \(\phi\) wrapped to \([0,2\pi)\). We use sixteen equal steps of \(\mu\) and thirty-two equal steps of \(\phi\):

\[
\Delta\omega=\frac{2\pi}{16\cdot 32}=\frac{2\pi}{512}\,\mathrm{sr}.
\]

That's exactly the grid from the solid-angle note—equal \(\Delta\phi\) and equal \(\Delta\cos\theta\)—just redrawn here at \(16\times 32\) so the footprint has enough interior cells to actually count. The sky-cap solid angles we derived in that note still apply here.

We're looking at two series of \(N_{\mathrm{hist}}=16384\) samples each, and neither is an estimator prefix. Series A drops 16384 area-uniform points onto the diffuser and bins their resulting \(\omega_i\) directions. Series B directly draws \(\mu=U\), \(\phi=2\pi U\), rejects the samples until the ray from \(x\) physically hits the diffuser, and stops once it accumulates 16384 accepts. A cell is marked "interior" only when all four \((\mu,\phi)\) corners hit the diffuser. Partial cells are drawn, but the quoted extrema ignore them. The white edge on the plate is exactly that mask. For this run, we have **35** interior cells, with an area occupancy spanning **86..952** and a uniform-\(\Omega\) occupancy staying tight at **314..400**.

The near lower edge is the high end of \(d\omega/dA\). An equal-\(\Omega\) cell located there covers very little physical diffuser area, so an area-uniform draw inherently leaves it thin. When a hit *does* land, the legal weight

\[
w_{\mathrm{legal}}=L_i\,\cos_x\,A\,\frac{d\omega}{dA}
\]

has to be correspondingly massive. Conversely, the far corner is the low end of the Jacobian: it covers far more area per steradian, pulls in more area-uniform hits per cell, and applies a much smaller weight on each hit. Across the interior mask, the area-uniform counts swing aggressively from 86 to 952. Those exact same cells, when filled uniformly in \(\Omega\), remain stable between 314 and 400. Each chart is colored relative to its own local maximum, which is why the right-hand interior visually reads as one flat field while the left-hand interior clearly doesn't. The boundary cells look a bit lumpy because the polygon naturally cuts through them—that lumpiness isn't the Jacobian. That's why the interior mask is our definitive comparison.

The weight is massive where the panel is near simply because \(r\) is small there. The factor \(\cos_y/r^2\) swings by **37.5654619429** across this rectangle. If your estimator forgets that factor, it will reliably converge to the wrong irradiance.

---

## Bias floors

Think of the bias plate as our primary meter. The gold line represents the legal estimator. Red drops \(r^2\), and blue drops the emitter cosine. These are computed over \(K=32\) shared prefixes. (We left the double-count arm off this chart.)

Here is the exact relative RMSE from this run:

| \(N\) | legal | drop \(r^2\) | drop \(\cos_y\) |
| --- | --- | --- | --- |
| 16 | **0.164412278931** | 0.646465572668 | 1.05231399133 |
| 64 | **0.108928582911** | 0.644735526234 | 1.06914370379 |
| 256 | **0.0682573241753** | 0.645666437568 | 1.05028736473 |
| 1024 | **0.0263804488107** | 0.645750980439 | 1.04059885976 |

Those legal entries correspond to `rmse_legal_N16`, `rmse_legal_N64`, `rmse_legal_N256`, and `rmse_legal_N1024`. As expected, the legal RMSE falls nicely at every single rung. The opening text rounds that column to \(0.1644\to 0.1089\to 0.06826\to 0.02638\). If you divide the printed \(N=64\) value by the printed \(N=1024\) value, you get a quotient of about **4.13**. (Though that quotient isn't a tracked key of its own.)

The omission columns, however, remain stuck on the scale of the bias. Drop \(r^2\) stays bolted near 0.646 from the first rung to the last. Drop cosine stubbornly hovers between 1.04059885976 and 1.06914370379. Any small drift in those columns is just noise along a hard floor. The signed means truly represent those floors, and they are massive compared to the legal noise at \(N=1024\).

| arm | `mean_rel` at \(N=1024\) |
| --- | --- |
| legal | \(+\mathbf{0.00775270607151}\) |
| drop \(r^2\) | \(\mathbf{-0.645746690189}\) |
| drop \(\cos_y\) | \(\mathbf{+1.04013072615}\) |
| double-count \(\cos_y\) | \(\mathbf{-0.458986283232}\) |

The visual chart prints those first three means to six decimals: legal \(+0.007753\), drop \(r^2\) \(-0.645747\), drop cosine \(+1.040131\). It's just a six-digit rounding of this table, but the table remains the definitive quote.

Given that the Jacobian on this panel spans **37.5654619429**, a single nested prefix of length 1024 can still wiggle around even while the estimator is perfectly right. That's why the locked meter is the RMSE computed over \(K=32\) independent prefixes. We don't assert that a single walk will be perfectly monotone. The plate correctly draws that RMSE, while the legal signed mean at \(N=1024\) manages to stay small beside it.

For completeness, the double-count RMSE (tracked in metrics only, using the same prefixes) runs: 0.476232581495, 0.452992595682, 0.45710934368, and 0.459388011928. The signed means at those four \(N\) rungs are -0.459580193104, -0.445824837954, -0.454300420772, and -0.458986283232. Again, no frame, and it never touches Neutral.

---

## Centroid plate

The centroid plate is where Failure C finally becomes visible. Since the full frames make it hard to read the card, we've marked the crop with a gold box and opened it up in the lower row.

Both shop frames share the exact same eye \((1.70,\,1.45,\,0.70)\), target \((0.10,\,1.40,\,-0.02)\), \(46^\circ\) vertical field, \(L_i\), shop fill, \(\rho=0.80\), exposure \(1.00\), and Neutral \(e=1.00\). The legal shading strictly uses \(L_i\,\Omega_\perp\), while the centroid shading uses \(E_c\) evaluated at the shaded point, sharing the exact same fill rule. We apply no per-half gain.

The callout highlights this run's centroid relative error. You can clearly read the large type **-0.195**, sitting directly above `(EC-E)/E = -0.194937`. If you check the metrics token, it is exactly **-0.194936551657**. \(E_c\) is coming in about a fifth too low. Waving it off as "a few percent" just doesn't describe the reality.

The crop headers print the instrument pixel's linear Rec.709 \(Y\) pulled straight from the float buffers, before Neutral steps in: legal is **0.446**, and centroid is **0.362**. If you check the analytic card (panel plus fill), you get `Lo_total_Y` **0.446765938864**. The legal header and the analytic card naturally meet at the plate's three digits. The centroid pixel doesn't have a finer key in the metrics table. The third panel maps a linear \(\vert{}\Delta Y\vert{}\) heat of that exact same crop, also rendered before Neutral. The ramp tops out at roughly **0.115**, with the card acting as the bright end. Sure, bench pixels shift too, but the card is the specific instrument the caption is talking about.

At a quick glance, the full-frame pair almost looks like one solid photograph. The heat map reveals the stark disagreement. And remember, broken arms A and B are still absent from both halves.

The small-angle limit—where the centroid term and the true contour actually agree—is an entirely separate check. Fixture S reliably prints \(\Omega_\perp=\mathbf{0.000399946674132}\,\mathrm{sr}\). Fixture M prints \(\Omega_\perp=\mathbf{0.752274688454}\,\mathrm{sr}\), effectively demonstrating the rectangle where a single differential term has safely left the contour. The card lives squarely in that second regime. The hero gate requires \(\vert{}(E_c-E)/E\vert{}\ge 0.10\), and this run comfortably clears it at 0.194936551657. We require both agreement on the small fixture and explicit disagreement on the card. The small-angle stand-in is exactly the limit that the solid-angle note previously refused to accept as a meter.

---

## Quote the metrics. Do not quote the beauty photographs as meters.

Everything is processed as CPU double before hitting Neutral. The seed is strictly **20260924**. The beauty display is Khronos PBR Neutral, \(e=1.00\), and it is purposely not re-fit. The RMSE ladder is precisely the table outlined in the previous section; we repeat the exact tokens here so this summary sheet can stand completely alone.

| item | value |
| --- | --- |
| seed / \(K\) / \(N\) | **20260924** / **32** / **16, 64, 256, 1024** |
| \(N_{\mathrm{hist}}\) / \(n_\mu\) / \(n_\phi\) | **16384** / **16** / **32** |
| \(u_0\) / \(v_0\) | **0.0549755345579** / **0.190148106104** |
| \(L_i\) RGB / \(Y\) | **(4, 4, 4)** / **4** |
| \(L_{\mathrm{fill}}\) RGB / \(Y\) | **(0.025, 0.028, 0.036)** / **0.0279398000** |
| \(\rho\) / exposure / Neutral | **0.80** / **1.00** / \(e=1.00\), \(F_{90}=0.04\), \(K_s=0.76\), \(K_d=0.15\) |
| instrument | **(0.280, 0.908, -0.200)** |
| panel \(y\) / \(z\) / \(A\) | **[1.10, 1.90]** / **[-0.28, 0.28]** / **0.448 m²** |
| \(\Omega_\perp\) | **0.419598441342 sr** |
| \(E_Y\) / \(E\) RGB | **1.67839376537** / three channels **1.67839376537** |
| \(E_{c,Y}\) | **1.35121347243** |
| \((E_c-E)/E\) | **-0.194936551657** |
| \(r_{\min}\) / \(r_{\max}\) / `r_ratio` | **0.339505522783** / **1.13704177584** / **3.3491112796** |
| \(\min\cos_y\) / \(\min\cos_x\) | **0.246253045359** / **0.326568395956** |
| \((d\omega/dA)_{\max}\) / min / `jacobian_ratio` | **7.15512954475** / **0.190470958553** / **37.5654619429** |
| \(E_{\mathrm{fill},Y}\) / `panel_over_fill` | **0.0760519738914** / **22.0690362063** |
| \(L_{o,Y}\) panel / panel+fill | **0.427399462741** / **0.446765938864** |
| `rmse_legal_N16` / `N64` / `N256` / `N1024` | **0.164412278931** / **0.108928582911** / **0.0682573241753** / **0.0263804488107** |
| `mean_rel_legal_N1024` | **0.00775270607151** |
| drop-\(r^2\) RMSE \(16/64/256/1024\) | **0.646465572668** / **0.644735526234** / **0.645666437568** / **0.645750980439** |
| `mean_rel_drop_r2_N1024` | **-0.645746690189** |
| drop-\(\cos_y\) RMSE \(16/64/256/1024\) | **1.05231399133** / **1.06914370379** / **1.05028736473** / **1.04059885976** |
| `mean_rel_drop_cos_N1024` | **1.04013072615** |
| double `mean_rel` \(16/64/256/1024\) | **-0.459580193104** / **-0.445824837954** / **-0.454300420772** / **-0.458986283232** |
| double RMSE \(16/64/256/1024\) | **0.476232581495** / **0.452992595682** / **0.45710934368** / **0.459388011928** |
| interior cells | **35** |
| area occupancy min / max | **86** / **952** |
| uniform-\(\Omega\) occupancy min / max | **314** / **400** |
| fixture S / fixture M \(\Omega_\perp\) | **0.000399946674132** / **0.752274688454 sr** |
| asserts | **72 pass / 0 fail** |

We do some plate rounding purely for the eye. The bias chart's six-decimal means are printed as: \(+0.007753\), \(-0.645747\), \(+1.040131\). The centroid callout reads: **-0.195** and `-0.194937`. The crop headers display: legal **0.446**, centroid **0.362**. The heat map peaks at roughly **0.115**. Our opening RMSE lists: \(0.1644\), \(0.1089\), \(0.06826\), \(0.02638\). The opening panel/fill is **22.069**, and the distance ratio is **3.349**. Let me be clear: none of these shortenings replace the full precision of the table.

Those instrument-pixel headers strictly measure the float-buffer luma corresponding to the photograph. The `Lo_total_Y` value belongs to the analytic card. Always quote the table for \(E\), \(\Omega_\perp\), and the broken floors. The visual strip is merely a picture of that exact data.

---

## Honesty gaps

1. **The true meter is the CPU double-precision contour and the shared-sample estimator.** We don't read the four-corner evaluation in the photograph at float32 precision. The metrics table is absolutely not derived from reading a JPEG. The hero float max is 4 (the emitter), intentionally left unclamped.
2. **Failures A and B never pass through Neutral onto a beauty plate.** You'll only find them as curves on the bias chart and as rows in our table. The centroid stand-in is the one shortcut that actually forms an image, and it stays strictly on the centroid plate. As for the double-count arm, it has no frame at all and never touches Neutral.
3. **Mind the softbox edge under Neutral, after the 8× box.** We left MSAA completely off. Our photographs target an RGBA32F buffer at 8× (\(10240\times 5760\)), run through an 8×8 linear box filter down to \(1280\times 720\), and only then apply exposure and Neutral. A standard 8× box will naturally leave roughly a one-eighth coverage fringe wherever the vertical emitter edge crosses a sample column. The bench and vise edges sit comfortably in the linear range, taking the box filter perfectly well directly. Remember, the occupancy chart, bias chart, and metrics strip are strictly not supersampled.
4. **Any shading point that fails the four-corner front test contributes exactly zero for the panel term.** We drop partial polygons; we do not clip them. This means horizon pixels might render darker than a properly clipped rectangle would. However, our instrument safely passes the front test, leaving the meter completely unaffected.
5. **Shop surfaces behind the diffuser, including the stand itself, receive only the ambient fill.** They won't separate visually from the unlit wall because we are strictly missing the bounce light. It doesn't act as a second practical light. You'll notice the corners of the cover are dark simply because nothing interreflects.
6. **The vise casts no shadow.** Our integral remains fully unoccluded. The vise is strictly there for scale.
7. **Neutral at exposure 1.00 solely assigns code values.** It does not author the underlying \(E\). The constants are borrowed exactly from the tone-mapping note and are not re-fit. Consequently, energy *after* Neutral is not a claim we are making.
8. **The locked meter relies on RMSE computed over \(K=32\) prefixes.** We don't assert that any single nested walk will remain perfectly monotone. A single prefix can absolutely wiggle even while the weight itself is mathematically sound.
9. **Our panel-over-fill is precisely this run's 22.0690362063.** That's \(E_Y/E_{\mathrm{fill},Y}\) computed for the locked \(L_i\), the specified fill, and this exact \(\Omega_\perp\). The atrium's fill ratio remains tucked away in the solid-angle note.
10. **The omission floors reflect this specific seed's measured means.** We recorded drop \(r^2\) at -0.645746690189 and drop cosine at +1.04013072615. These aren't just one bug printed twice; they are fundamentally different failures.
11. **Uniform area scaled by the legal weight forms our scalar Jacobian.** It is certainly not a production light sampler, and we make no claims ranking it against VNDF or env-MIS.
12. **The crop headers (0.446 and 0.362) measure instrument-pixel linear \(Y\).** The heat peak lands around 0.115, centered right on the card, mapped in linear \(\vert{}\Delta Y\vert{}\) before Neutral applies. These three specific plate figures aren't extra, separate keys in the metrics table. The analytic panel-plus-fill card is exactly `Lo_total_Y` 0.446765938864.
13. **The final JPEG is strictly 8-bit display-referred.** Everything important—\(\Omega_\perp\), \(E\), RMSE, and the signed floors—lives directly in the float estimator and is accurately quoted in the table above.

---

## Mesa / llvmpipe — what this run can claim

| item | value |
| --- | --- |
| `GL_VERSION` | 4.5 (Core Profile) Mesa 25.0.7-2+deb13u1 |
| `GL_RENDERER` | llvmpipe (LLVM 19.1.7, 256 bits) |
| OSMesa | core 3.3 request |
| FBO color | **RGBA32F**, \(10240\times 5760\) (8× of \(1280\times 720\)) |
| Encode | \(1280\times 720\) after an 8×8 linear box, then Neutral, then sRGB OETF |
| `GL_FRAMEBUFFER_SRGB` | disabled |
| MSAA | disabled |
| SSAA | **8×** box on the cover and on the shop frames inside the centroid plate. `GL_MAX_TEXTURE_SIZE` 16384 |
| RNG | SplitMix64, seed **20260924**. Top 53 bits mapped to \([0,1)\). Strictly not a sin-hash |
| Neutral \(e\) | **1.00** |

**What we can claim:** Running on this specific OSMesa / llvmpipe build, a CPU double estimator drew uniform area samples on a single unoccluded rectangle, properly converted them using the legal Jacobian, and the resulting \(K=32\) RMSE fell smoothly from \(N=16\) all the way to \(N=1024\) when tested against the exact four-corner \(E\). Two broken estimators sharing those exact same samples (dropping \(r^2\) or \(\cos_y\)) got stuck on the signed floors detailed in the metrics table. We demonstrated that an equal-\(\Omega\) histogram of area samples lands very unevenly across the panel footprint compared to drawing that same count uniformly in \(\Omega\). The centroid geometry term taken at the locked instrument point deviates from the true four-corner \(E\) by -0.194936551657. Finally, the cover is a straightforward photograph of the legal form factor combined with the named shop fill, processed under Neutral \(e=1.00\) directly after an 8× linear box downsample.

**What we cannot claim:** A GPU, a wavefront architecture, a hardware ray-tracing core, or meeting any frame-time budget. Our room is literally just one fragment shader. At no point does the meter read that shader's output back as a definitive \(E\). We make no claims on energy conservation after applying Neutral, nor anything you measure by simply sampling the JPEG of the cover or the centroid plate. We don't handle interreflection. There is no shadow rendered under the vise. We don't claim that any single prefix is strictly monotone, or that this weighting scheme has been ranked against modern VNDF or env-MIS. And we make no claim that the softbox silhouette is fully resolved past the 8× fringe mentioned earlier.

---

## Assertions

For this run: **72 pass / 0 fail**.

Our geometry checks fire before we ever issue a draw. Signed \(\Omega_\perp\), \(E_Y\), the centroid ratio, both distance extrema, both minimum cosines, both Jacobian extrema, and the total Jacobian ratio all perfectly match the closed form of this scene. The minimum cosine on the panel sits reliably at or above 0.20. \(r_{\max}/r_{\min}\) is confidently at least 2. Our card rests 0.28 m off the diffuser plane—safely past 0.25 m—and the panel geometry doesn't encompass the shading point. The closest point of the rectangle lies cleanly on \(y=1.10\), making it visibly nearer than the centroid itself. Every single corner cosine remains firmly positive. Panel-over-fill hits at least 10. \(L_i\) is perfectly achromatic, \(\rho=0.80\), and the exposure holds at 1.00.

Fixture S smoothly matches its on-axis contour. Fixture M matches its contour as well, proving that the contour there has safely left the single differential term behind. Our hero shortcut comfortably clears the \(\vert{}(E_c-E)/E\vert{}\ge 0.10\) threshold.

Legal RMSE drops correctly at all four evaluated rungs, and the error at \(N=64\) is at least double the error at \(N=1024\). Each omission mean measured at \(N=1024\) remains huge compared to the legal RMSE. The two omission means fundamentally differ from each other, and crucially, they have effectively stopped moving between \(N=256\) and \(N=1024\). (Note: the double-count row was added after those particular checks were written.) The histogram's interior clearly holds 35 cells, with the area occupancy visibly spreading wider than the uniform-\(\Omega\) occupancy. Both \(E\) and the \(K\)-mean legal estimate at \(N=1024\) stay achromatic. All five rendered frames correctly target \(1280\times 720\). And finally, the photographs on both the cover and the centroid plate are exactly the Neutral outputs.

---

## Out of scope

Balance and power heuristics, adding a second light, or doing a full Veach survey are out of scope. We fundamentally needed to get the light density safely onto the page first before a balance weight would even mean anything. Consider that the sequel.

The half-vector Jacobian, Smith \(G\), and VNDF are also out. They continue the BSDF side established in the [importance-sampling](/posts/p/importance-sampling-phong-lobe-vs-cosine/) note, but they don't continue the measure discussed here.

We won't cover LTC, or polygonal solid-angle sampling as a production feature. The four-corner sum serves as our strict ground truth here. Clipping a partially visible rectangle is its own separate problem, just as sampling proportional to the polygon's exact solid angle is a completely different problem.

We leave out Phong against cosine, firefly counts, and the importance-sampling note's \(\mathrm{RMSE}_H\). We skip the disk irradiance ratios from the [solid-angle](/posts/p/solid-angle-and-the-rendering-equation/) note. And you won't find a second practical light, a shadow map, a vise shadow, multi-bounce integration, Russian roulette, or ReSTIR here. We also aren't claiming stratified area samples as a variance win. We strictly refuse to read \(E\) off a JPEG, and we certainly aren't publishing beauty plates of \(w_{r^2}\), \(w_{\cos}\), or \(w_{\mathrm{dbl}}\).

```text
d omega          = cos_y / r^2 * dA
p(omega)         = p(A) * r^2 / cos_y          # p(A) = 1/A
w_legal          = Li * cos_x * cos_y * A / r^2
w_drop_r2        = Li * cos_x * cos_y * A
w_drop_cos       = Li * cos_x * A / r^2
w_double         = Li * cos_x * cos_y^2 * A / r^2    # metrics only, no frame
E                = Li * Omega_perp                   # signed four-corner
Ec               = Li * A * cos_x(yc) * cos_y(yc) / rc^2
(Ec - E) / E     = -0.194936551657
Omega_perp       = 0.419598441342 sr
jacobian ratio   = 37.5654619429
mean_rel drop r  = -0.645746690189                  # N=1024, K=32
mean_rel drop cos= +1.04013072615
beauty           = sRGB_OETF(Neutral(e * Lo))       # e=1.00, after 8x linear box

```

Pin the cover as our visual presentation. Pin the occupancy plate as the definitive teaching figure. Pin the bias chart as the irrefutable floors. Pin the centroid plate as the callout. To get a legal light sample, you have to push an area density cleanly onto \(d\omega\). If you drop \(r^2\), or if you drop the emitter cosine, that error is staying put.
