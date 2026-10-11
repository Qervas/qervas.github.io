import json,subprocess,re,os,glob,sys
SITE='/workspace/qervas-rc'; N='/workspace/cg-album/notes'
MAP={'shadow-bias-explainer-n2':'shadow-bias','aniso-explainer-n2':'anisotropic','solid-angle-explainer-n2':'solid-angle-re',
'mip-explainer-n2':'mipmaps','area-jacobian-explainer-n2':'area-jacobian','is-explainer-n2':'importance-sampling',
'ibl-explainer-n2':'ibl-split-sum','mis-explainer-n2':'mis-balance','taa-explainer-n2':'taa-ghosting','ggx-vndf-explainer-n3':'ggx-vndf',
'radiance-cascades-v2':'radiance-cascades/video-v2','pom-explainer-n2':'parallax-occlusion','tm-explainer-n2':'tone-mapping',
'toksvig-explainer-n2':'toksvig','rp-explainer-n2':'reprojection'}
def dur(p): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]))
def ts(t):
  ms=int(round(t*1000));h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000);return f"{h:02}:{m:02}:{s:02}.{ms:03}"
def title(name):
  n=re.sub(r'^seg_S\d+_?','',name); n=re.sub(r'([a-z])([A-Z])',r'\1 \2',n).replace('_',' ').strip()
  n={'Hook':'Intro','Everyday':'Intro','Aha':'Key idea','Honest':'What the numbers say','Takeaway':'Takeaway','LUT':'The LUT','Pi':'Where π comes from','What If':'What if…','Wrong Fixes':'Wrong fixes','Face On':'Face-on view','Peter Pan':'Peter-panning'}.get(n,n)
  return n[:1].upper()+n[1:]
for md in sorted(glob.glob(SITE+'/src/journal/*.md')):
  src=re.search(r'^  src: (.*)$',open(md).read(),re.M).group(1).strip()
  base=os.path.splitext(os.path.basename(src))[0]; nd=MAP[base]
  d=f'{N}/{nd}/manim' if 'video' in nd else f'{N}/{nd}/video/manim'
  segs=[os.path.join(d,l.split("'")[1]) for l in open(d+'/concat.txt') if l.startswith('file')]
  ds=[dur(s) for s in segs]; total=dur(SITE+'/src'+src)
  scale=total/sum(ds)
  out=['WEBVTT','']; t=0
  for i,(s,dd) in enumerate(zip(segs,ds)):
    a=t*scale; t+=dd; b=total if i==len(segs)-1 else t*scale
    out+= [f'{ts(a)} --> {ts(b)}', title(os.path.splitext(os.path.basename(s))[0]), '']
  vp=SITE+'/src'+os.path.splitext(src)[0]+'.chapters.vtt'
  open(vp,'w').write('\n'.join(out))
  print(f'{base:28} segs={len(segs):2} sum={sum(ds):7.2f} mp4={total:7.2f} drift={total-sum(ds):+.2f}', [title(os.path.basename(s)[:-4]) for s in segs])
