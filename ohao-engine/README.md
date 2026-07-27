# OHAO Engine — Demo Booth

Interview-ready **visual pitch** for [OHAO Engine](https://github.com/Qervas/ohao_engine).  
Same format as the Neural Capture demo: scroll story + drag compares + keyboard beats.  
**Not** the visual textbook under `site/`.

## Local

```bash
cd demo
python3 -m http.server 5180
# http://localhost:5180
```

## Sections

| Key | Section |
|-----|---------|
| 1 | Hero — orbit video + metrics |
| 2 | Stack — hybrid architecture + beauty stills |
| 3 | Realtime — ReSTIR / OIDN drag compares |
| 4 | Inverse lab — quality plates + tables |
| 5 | Interview cheat sheet |

## Deploy

```bash
rsync -av --delete ./ /path/to/qervas.github.io/ohao-engine/
```

Target: https://qervas.github.io/ohao-engine/
