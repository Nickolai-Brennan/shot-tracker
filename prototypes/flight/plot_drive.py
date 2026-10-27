"""Draw the first recorded drive using its radar polynomial, not an invented arc."""
import json
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec

source = Path('/workspace/scratch/c12dfd50aa47/upload/R2026011_57366_r1 (1).json')
data = json.loads(source.read_text())['decoded']
hole = data['holes'][0]
shot = hole['strokes'][0]
radar = shot.get('radarData') or {}
segments = radar.get('ballTrajectory') or []
if not segments:
    raise ValueError('This shot has no radar flight trajectory.')
flight = next(s for s in segments if s.get('kind') == 'Flight')
# Coefficients are in ascending powers: c0 + c1*t + c2*t**2 + ... .
# Radar y is vertical; x is downrange; z is lateral in the radar frame.
t = np.linspace(*flight['timeInterval'], 500)
x, height, lateral = [np.polynomial.polynomial.polyval(t, flight[k]) for k in ('xFit','yFit','zFit')]
# Meter interpretation is supported by the fitted height (~27.94 m)
# matching the separate apexHeight field (~91.47 ft). No schema units supplied.
down = (x-x[0])/0.9144
side = (lateral-lateral[0])/0.9144
feet = (height-height[0])/0.3048
apex = int(np.argmax(feet))
plt.rcParams.update({'font.family':'DejaVu Sans','text.color':'#e7eef7','axes.labelcolor':'#c3cede',
 'xtick.color':'#97aac0','ytick.color':'#97aac0','axes.edgecolor':'#38495f',
 'axes.facecolor':'#111e2e','figure.facecolor':'#0a1320','font.size':10})
fig = plt.figure(figsize=(15,10),dpi=170)
gs=GridSpec(2,2,figure=fig,left=.065,right=.95,top=.78,bottom=.17,wspace=.24,hspace=.42,width_ratios=[1.25,1])
fig.text(.065,.94,'DRIVE / SHOT PATH',fontsize=25,weight='bold')
fig.text(.065,.90,f'Hole {hole["holeNumber"]}  •  Shot 1  •  Round {data["round"]}  •  Player ID {data["playerId"]}',color='#9bb0c9',fontsize=12)
fig.text(.065,.84,'260 yd recorded distance     /     91.47 ft reported apex     /     Left bunker',fontsize=13,color='#73e2cf')
ax=fig.add_subplot(gs[:,0],projection='3d')
ax.set_facecolor('#0a1320')
ax.plot(down,side,feet,lw=3.5,color='#4cd8f0')
ax.plot(down,side,np.zeros_like(feet),lw=1.5,color='#4cd8f0',alpha=.28)
ax.scatter([down[0]],[side[0]],[feet[0]],color='#73e2cf',s=45)
ax.scatter([down[-1]],[side[-1]],[feet[-1]],color='#ffbf73',s=45)
ax.plot([down[apex]]*2,[side[apex]]*2,[0,feet[apex]],color='#8397b3',ls=':',lw=1.2)
ax.set(xlabel='Downrange (yd)',ylabel='Lateral offset (yd)',zlabel='Height above launch (ft)',title='3D radar flight reconstruction')
ax.set_zlim(-3,105)
ax.view_init(elev=22,azim=-65)
ax.set_box_aspect((2.4,.8,1.15))
for axis in [ax.xaxis,ax.yaxis,ax.zaxis]:
 axis.pane.fill=False
 axis._axinfo['grid']['color']=(.3,.4,.55,.22)
ax2=fig.add_subplot(gs[0,1])
ax2.plot(down,feet,color='#4cd8f0',lw=2.7)
ax2.fill_between(down,feet,0,color='#4cd8f0',alpha=.09)
ax2.scatter(down[apex],feet[apex],s=35,color='#73e2cf',zorder=3)
ax2.annotate(f'Fitted apex ≈ {feet[apex]:.1f} ft',xy=(down[apex],feet[apex]),xytext=(72,108),arrowprops={'arrowstyle':'-','color':'#73e2cf'},color='#73e2cf')
ax2.set(title='Side view',xlabel='Downrange from launch (yd)',ylabel='Height above launch (ft)',ylim=(-5,122),xlim=(0,270))
ax3=fig.add_subplot(gs[1,1])
ax3.plot(down,side,color='#4cd8f0',lw=2.7)
ax3.scatter(0,0,s=45,color='#73e2cf',zorder=3)
ax3.scatter(down[-1],side[-1],s=45,color='#ffbf73',zorder=3)
ax3.annotate('Launch',xy=(0,0),xytext=(12,3),color='#73e2cf')
ax3.annotate('End of fitted flight',xy=(down[-1],side[-1]),xytext=(115,-10),arrowprops={'arrowstyle':'-','color':'#ffbf73'},color='#ffbf73')
ax3.axhline(0,color='#72849b',lw=.8,ls='--',alpha=.5)
ax3.set(title='Overhead flight view • lateral scale enlarged',xlabel='Downrange from launch (yd)',ylabel='Radar lateral offset (yd)',xlim=(0,270),ylim=(-20,6))
for a in [ax2,ax3]:
 a.grid(alpha=.13); a.spines[['top','right']].set_visible(False)
fig.text(.065,.105,f'Flight curve: {t[-1]:.3f} seconds  •  Fitted forward displacement: {down[-1]:.1f} yd  •  Bounce / roll: not reconstructed',fontsize=10,color='#bdcadd')
fig.text(.065,.075,'Method: evaluate radarData.ballTrajectory polynomial fits over timeInterval; shift the launch point to zero.',fontsize=9,color='#8fa4be')
fig.text(.065,.05,'Units inferred from the apex cross-check. Local radar frame; no course-map alignment or verified left/right sign.',fontsize=9,color='#8fa4be')
fig.text(.065,.025,'Source: uploaded R2026011_57366_r1 (1).json • decoded.holes[0].strokes[0].radarData',fontsize=8,color='#788da8')
output=Path('/workspace/scratch/c12dfd50aa47/output/drive-shot-path.png')
fig.savefig(output,facecolor=fig.get_facecolor())
print(output)
print({'fitted_apex_ft':round(float(feet[apex]),2),'fitted_forward_yd':round(float(down[-1]),2),'time_s':float(t[-1])})
