import json,subprocess,re,os,glob,sys
SITE='/workspace/qervas-rc'; N='/workspace/cg-album/notes'
MAP={'shadow-bias-explainer-n2':'shadow-bias','aniso-explainer-n2':'anisotropic','solid-angle-explainer-n2':'solid-angle-re',
'mip-explainer-n2':'mipmaps','area-jacobian-explainer-n2':'area-jacobian','is-explainer-n2':'importance-sampling',
'ibl-explainer-n2':'ibl-split-sum','mis-explainer-n2':'mis-balance','taa-explainer-n2':'taa-ghosting','ggx-vndf-explainer-n3':'ggx-vndf',
'radiance-cascades-v2':'radiance-cascades/video-v2','pom-explainer-n2':'parallax-occlusion','tm-explainer-n2':'tone-mapping',
'toksvig-explainer-n2':'toksvig','rp-explainer-n2':'reprojection'}
TITLES={
'aniso-explainer-n2':['Blurry floors far away','A pixel lands as a stretch','How mipmaps pick blur','Circle versus ellipse','Footprints across the floor','Testing with ring patterns','Two sanity checks','Limits of this test','What to remember'],
'area-jacobian-explainer-n2':['Moving the softbox closer','Equal area, unequal sky','Measuring the stretch','Reweighting each point','Forgetting a factor','Watching the error shrink','The single-point shortcut','Limits of this test','What to remember'],
'ggx-vndf-explainer-n3':['Glare on a wet road','Two samplers, one scene','Surfaces as tiny mirrors','The textbook sampler','From half vectors to light','Samples wasted at grazing','Sampling only visible facets','Building the visible sampler','Keeping the weights tame','Measuring the noise drop','The real-scene catch','What to remember'],
'ibl-explainer-n2':['A room in the brass','Light from every direction','Splitting the integral','Blurring the room','Climbing the roughness ladder','The material lookup table','Adding soft room light','Breaking the recipe','Limits of this test','What to remember'],
'is-explainer-n2':['Grainy previews and fireflies','Guessing light with rays','Two ways to aim','Where fireflies come from','Mapping the error','Starving the matte surfaces','More rays, slow gains','Limits of this test','What to remember'],
'mip-explainer-n2':['Sparkling distant textures','Same room, two filters','Texels per pixel','The sampling speed limit','Ring pattern test','Mipmaps as a legal limit','Measuring the fake patterns','The close-up check','Limits of this test','What to remember'],
'mis-explainer-n2':['Fireflies that never fade','How renderers guess light','Two ways to pick directions','Where each one fails','Combining both strategies','Comparing the noise','Error as samples grow','Limits of this test','What to remember'],
'pom-explainer-n2':['Bricks that look deep','Three ways to paint','Faking depth with heights','Marching into the wall','Too few steps','The face-on check','Flat at the edges','Shadows inside the grooves','Limits of this test','What to remember'],
'radiance-cascades-v2':['The neon laundromat','A rolling drum’s shadow','Why shadows go soft','Stacking probe layers','Merging the layers','Looking through a window','What it costs','Light leaking through walls','Fixing the leak','Limits of this test','What to remember'],
'rp-explainer-n2':['Ghosts along moving edges','Reusing the last frame','Where was this pixel?','Newly revealed wall','The colour clamp','Checking the depth instead','Mapping the failures','Changing the threshold','Limits of this test','What to remember'],
'shadow-bias-explainer-n2':['Striped and floating shadows','How shadow maps work','Where the stripes come from','Nudging toward the sun','Shadows that float away','Sweeping the bias','Finding the sweet spot','Bias that follows slope','Limits of this test','What to remember'],
'solid-angle-explainer-n2':['Noon sun, evening sun','How big a light looks','Widening the skylight','Light at a slant','Light versus sky covered','Tilting the card','Where pi comes from','Averaging random rays','Limits of this test','What to remember'],
'taa-explainer-n2':['Ghost trails in games','Blending past frames','How memory fades','A clean ghost test','Trusting the new frame','Faster means longer trails','Clamping the history','Back in the loft','Limits of this test','What to remember'],
'toksvig-explainer-n2':['Sparkling distant metal','Bumps inside one pixel','Averaging the normals','How tight the highlight is','Fixes that fall short','Toksvig’s shrinking power','Reading it as roughness','Measuring the highlight','Calm across the roller','Limits of this test','What to remember'],
'tm-explainer-n2':['The blown-out window','Real amounts of light','Just clipping to white','Bending instead of cutting','What clipping destroys','Comparing tone curves','Curves that shift colour','Setting the exposure','Limits of this test','What to remember'],
}
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
  names=TITLES[base]; assert len(names)==len(segs),(base,len(names),len(segs))
  for i,(s,dd) in enumerate(zip(segs,ds)):
    a=t*scale; t+=dd; b=total if i==len(segs)-1 else t*scale
    out+= [f'{ts(a)} --> {ts(b)}', names[i], '']
  vp=SITE+'/src'+os.path.splitext(src)[0]+'.chapters.vtt'
  open(vp,'w').write('\n'.join(out))
  print(f'{base:28} segs={len(segs):2} sum={sum(ds):7.2f} mp4={total:7.2f} drift={total-sum(ds):+.2f}', names[:3])
