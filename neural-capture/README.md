# Neural Capture — Implementation Monograph

OHAO-style multipage visual textbook for **CamMatrixCapture** + the thesis evaluation pipeline
(*Neural Rendering Dataset Collection*, LiU TQDV30, 2025).

## Local

```bash
cd site
python3 -m http.server 8799
# http://127.0.0.1:8799/
```

## Tests

```bash
python3 tests/test_monograph_structure.py
```

## Chapters

| # | File | Depth focus |
|---|------|-------------|
| 00 | `index.html` | Cover + map |
| 01 | `m/architecture.html` | Spine, boundaries, threads |
| 02 | `m/hardware.html` | Sapera Snap/Wait bandwidth contract |
| 03 | `m/bluetooth.html` | BLE turntable settle |
| 04 | `m/capture.html` | **Flagship** state machine + worker loop |
| 05 | `m/session.html` | On-disk layout |
| 06 | `m/gui.html` | Wizard + P/Invoke |
| 07 | `m/protocol.html` | Studio V1–V3 + ArUco |
| 08 | `m/outdoor.html` | Gränsö |
| 09 | `m/evaluation.html` | Metrics + materials |
| 10 | `m/status.html` | Evidence matrix |
| 11 | `m/build.html` | Build/run |
| G | `m/glossary.html` | Hover glossary source |

## Scope

**In:** acquisition stack, protocols, RC/Nerfstudio evaluation.  
**Out of public claims:** unfinished inverse-rendering slide experiments.
