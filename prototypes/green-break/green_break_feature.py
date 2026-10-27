"""Green path prototype. Run with --help for reusable hole selection.
Paths labeled simulation remain simulations; this feature never invents contours.
"""
import argparse,json
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image

def analyze(path):
    """Use course coordinates (feet), retaining the provider's path classification."""
    pts=np.array([[p[k] for k in ('x','y','z')] for p in path['path']],float)
    if len(pts)<2 or not np.isfinite(pts).all():
        raise ValueError('A path needs at least two finite coordinate samples.')
    xy=pts[:,:2]; delta=xy-xy[0]; chord=xy[-1]-xy[0]
    length=np.linalg.norm(chord)
    if length<=0: raise ValueError('Coincident endpoints cannot define the reference line.')
    along=chord/length; lateral=np.array([-along[1],along[0]])
    distance=np.r_[0,np.cumsum(np.linalg.norm(np.diff(xy,axis=0),axis=1))]
    return dict(pts=pts,along=delta@along,cross=12*(delta@lateral),distance=distance,
        elevation=12*(pts[:,2]-pts[0,2]),grade=100*(pts[-1,2]-pts[0,2])/length,
        duration=path['path'][-1]['secondsSinceStart'],length=length,
        classification=path.get('reconstructionType','unspecified'))

def render(source,hole_number,map_path,reference,output):
    """Fit course XY to provider green-image coordinates using endpoint control points."""
    raw=json.loads(Path(source).read_text()); data=raw.get('decoded',raw)
    hole=next((h for h in data['holes'] if h['holeNumber']==hole_number),None)
    if hole is None: raise ValueError(f'Hole {hole_number} is absent.')
    putts=[s for s in hole['strokes'] if s.get('fromLocation')=='Green' and s.get('ballPath',{}).get('path')]
    if not putts: raise ValueError('No sampled putting paths available for this hole.')
    shot=putts[0]; path=shot['ballPath']; a=analyze(path)
    controls=[]; targets=[]
    for s in hole['strokes']:
        for key in ('fromCoords','toCoords'):
            c=s['green']['leftToRightCoords'][key]
            controls.append([c['tourcastX'],c['tourcastY'],1]); targets.append([c['x'],c['y']])
    controls=np.array(controls); targets=np.array(targets)
    transform,_,rank,_=np.linalg.lstsq(controls,targets,rcond=None)
    if rank<3: raise ValueError('Not enough distinct points to align the green map.')
    residual=float(np.max(np.linalg.norm(controls@transform-targets,axis=1)))
    mapped=np.c_[a['pts'][:,:2],np.ones(len(a['pts']))]@transform
    image=np.asarray(Image.open(map_path)); H,W=image.shape[:2]; mapped*=np.array([W,H])
    plt.rcParams.update({'font.family':'DejaVu Sans','figure.facecolor':'#0b1420','axes.facecolor':'#122132',
        'text.color':'#edf4fa','axes.labelcolor':'#c0ccda','xtick.color':'#a0b1c3','ytick.color':'#a0b1c3',
        'axes.edgecolor':'#415067','font.size':10})
    fig=plt.figure(figsize=(16,11),dpi=160)
    gs=fig.add_gridspec(2,2,left=.065,right=.95,bottom=.18,top=.79,height_ratios=[1.3,1],wspace=.24,hspace=.42)
    fig.text(.065,.945,f'GREEN MAP / HOLE {hole_number}',fontsize=26,weight='bold')
    fig.text(.065,.907,f'Round {data["round"]} • Player {data["playerId"]} • Shot {shot["strokeNumber"]} • {a["classification"].upper()} path',color='#a4b6cc',fontsize=12)
    fig.text(.065,.853,f'{shot["distance"]} recorded     /     {max(abs(a["cross"])):.2f} in maximum chord deviation     /     {abs(a["elevation"][-1]):.2f} in downhill',color='#78dfc8',fontsize=13)
    ax=fig.add_subplot(gs[0,0]); ax.imshow(image)
    ax.plot(mapped[:,0],mapped[:,1],color='#37dafa',lw=3,label='Simulated putt')
    ax.scatter(*mapped[0],s=65,color='#ffcf7a',edgecolor='white',zorder=5)
    ax.scatter(*mapped[-1],s=55,color='white',edgecolor='#0c1420',zorder=6)
    ax.annotate('Shot 4 → cup\nSmall at true map scale',xy=mapped[-1],xytext=(W*.56,H*.3),color='white',arrowprops={'arrowstyle':'->','color':'white'},bbox={'facecolor':'#10202e','alpha':.8,'pad':5})
    ax.set_title('Our overlay on the provider’s green image',loc='left',pad=12); ax.set_axis_off()
    ref=fig.add_subplot(gs[0,1])
    if reference:
        screenshot=Image.open(reference)
        # Crop supplied full-hole screenshot to the golf scene; exclude device/browser chrome.
        if screenshot.height > 1500:
            screenshot=screenshot.crop((90,660,660,1320))
        ref.imshow(screenshot)
    ref.set_title('TOURCAST putt close-up • perspective view',loc='left',pad=12); ref.set_axis_off()
    ref.text(0,-.05,'Visible curvature only; no calibrated scale or surveyed elevations.',transform=ref.transAxes,color='#a4b6cc',fontsize=9)
    br=fig.add_subplot(gs[1,0]); br.plot(a['along'],a['cross'],color='#37dafa',lw=3,marker='o',ms=3,label='Provider simulated path')
    br.axhline(0,color='#d3dce7',ls='--',lw=1,label='Straight start → finish reference')
    br.set(xlabel='Progress along start–finish line (ft)',ylabel='Lateral deviation (in)',title='Break detail • lateral scale enlarged')
    br.set_ylim(min(-.25,min(a['cross'])-.2),max(1.1,max(a['cross'])+.2)); br.grid(alpha=.12)
    br.legend(fontsize=8,loc='upper right',facecolor='#142536',labelcolor='#d7e2ef')
    el=fig.add_subplot(gs[1,1]); el.plot(a['distance'],a['elevation'],color='#78dfc8',lw=3,marker='o',ms=3)
    el.set(xlabel='Distance along simulated path (ft)',ylabel='Elevation relative to start (in)',title='Along-path elevation • not a green contour map')
    el.grid(alpha=.12)
    el.text(.05,.10,f'Endpoint grade ≈ {a["grade"]:.2f}%\nOne sampled route; no cross-slope estimate',transform=el.transAxes,color='#78dfc8',fontsize=10)
    fig.text(.065,.12,f'Distance check: recorded {shot["distance"]}; sampled XY path {a["distance"][-1]:.2f} ft ({a["distance"][-1]*12:.2f} in). They differ.',fontsize=10,color='#ffcf7a')
    fig.text(.065,.087,'Evidence limit: this simulation replays the provider path. It does not independently predict or validate actual break.',fontsize=10,color='#bac9da')
    fig.text(.065,.058,'No slope heatmap: one short putt cannot determine a 2D green surface. Course XY/Z assumed feet from distance cross-check.',fontsize=9,color='#91a5be')
    fig.text(.065,.03,f'Source: supplied shot JSON, provider green asset, and supplied TOURCAST screenshot. Map-coordinate fit residual: {residual:.2g}.',fontsize=8,color='#8198b4')
    fig.savefig(output,facecolor=fig.get_facecolor())
    metrics={k:a[k] for k in ('grade','duration','length','classification')}
    metrics.update(max_chord_deviation_inches=float(max(abs(a['cross']))),elevation_change_inches=float(a['elevation'][-1]),path_length_feet=float(a['distance'][-1]),map_fit_residual=residual)
    Path(output).with_suffix('.json').write_text(json.dumps(metrics,indent=2))
    print(json.dumps(metrics,indent=2))

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',required=True); parser.add_argument('--hole',type=int,default=14)
    parser.add_argument('--map',required=True); parser.add_argument('--reference'); parser.add_argument('--output',default='green-comparison.png')
    args=parser.parse_args()
    try: render(args.source,args.hole,args.map,args.reference,args.output)
    except (ValueError,KeyError,OSError) as exc: parser.exit(1,f'Cannot render green comparison: {exc}\n')
