---
title: "Video: The Penumbra Condition — Radiance Cascades in Flatland"
description: "An animated walkthrough of radiance cascades on a neon-lit laundromat floor plan: why shadows are sharp near an object and soft far away, how stacked probe shells exploit that, and where this run honestly falls short."
hook: "Why a shadow is crisp at the washer drum and blurry down the aisle, and the global-illumination trick built on that."
date: 2026-10-11
tags:
  - graphics
  - global-illumination
  - video
math: true
video:
  src: /assets/journal/radiance-cascades-in-flatland/radiance-cascades-v2.mp4
  poster: /assets/journal/radiance-cascades-in-flatland/poster.jpg
  vtt: /assets/journal/radiance-cascades-in-flatland/radiance-cascades-v2.vtt
cover: /assets/journal/radiance-cascades-in-flatland/00_cover.jpg
---


## Abstract

The video now uses live simulated footage: the same C++ cascade renderer re-lights the laundromat every frame while a neon tube flickers, a drum rolls down the aisle and a lamp slides along the wall, with optional overlays of each layer's probe grid and ray intervals as the layers build up and merge. (Simulated offline on the CPU at roughly a quarter second per frame; not real-time.)

An all-night coin laundry seen from above, lit only by neon tubes. Washer drums cast shadows that are sharp right at the drum and soft further down the aisle. That is a spatial-versus-angular tradeoff: near an occluder you need fine spacing between probes but few directions; far away, coarse spacing but many directions. Radiance cascades store exactly that as a stack of shells, each with twice the probe spacing and four times the rays, so every shell costs the same (\(204800\) probe-rays here). Near and far intervals merge through transmittance, \(L_{a,c}=L_{a,b}+\beta_{a,b}L_{b,c}\): merging is looking through a window. The six cascades march \(0.68\%\) as many rays as a 256-ray reference. This run is honest about what did not work: 8 of 12 gates pass. Bilinear-fix misses the reference by a relative error of \(0.165\) (target \(0.15\)), the angular half of the penumbra test stays flat (128 rays at every station, because the whole room's neon sets the angular detail), and the thin partition never leaked, so there was no leak for the fix to beat.

## Key figures

![Bilinear-fix cascades, six shells. Not the reference: the error gate fails.](/assets/journal/radiance-cascades-in-flatland/00_cover.jpg)

![South aisle at native resolution. Reference on the left, bilinear-fix on the right.](/assets/journal/radiance-cascades-in-flatland/02_pair.jpg)

![Penumbra cut and the two measured curves against the guides.](/assets/journal/radiance-cascades-in-flatland/10_penumbra.jpg)

![Near interval, four weights, merge against a march, and the partition bin whose probes disagree.](/assets/journal/radiance-cascades-in-flatland/12_merge.jpg)

![Ray count and step count for one gather, logarithmic.](/assets/journal/radiance-cascades-in-flatland/13_cost.jpg)

![The partition band. Vanilla on the left, bilinear-fix on the right, reference as the dashed profile. Excess is zero on both.](/assets/journal/radiance-cascades-in-flatland/14_leak.jpg)

## References

- A. Sannikov. Radiance Cascades: A Novel Approach to Calculating Global Illumination (WIP preprint), 2023.
- A. Sannikov. Rendering Path of Exile 2, ExileCon 2023.
- C. M. J. Osborne, A. Sannikov. Radiance Cascades: A Novel High-Resolution Formal Solution for Multidimensional Non-LTE Radiative Transfer. arXiv:2408.14425, 2024.
