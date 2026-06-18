from PIL import Image, ImageDraw, ImageFont
W,H=1200,630
top=(16,36,58); bot=(12,86,80)
img=Image.new('RGB',(W,H)); dr=ImageDraw.Draw(img)
for y in range(H):
    t=y/(H-1); c=tuple(int(top[i]+(bot[i]-top[i])*t) for i in range(3)); dr.line([(0,y),(W,y)],fill=c)
def F(sz,bold=True): return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf'%('-Bold' if bold else ''),sz)
PADX=82
dr.text((PADX,64),'FIELD PLAN   ·   PHOTOGRAPHERS',font=F(22),fill=(140,196,202))
dr.text((PADX,96),'Venezuela',font=F(106),fill=(255,255,255))
dr.text((PADX,226),'Photography Expedition',font=F(50),fill=(127,209,192))
dr.text((PADX,300),'23 June – 8 July 2026    ·    16 days',font=F(29,False),fill=(203,214,218))
nodes=[('Caracas',(108,92,231)),('Orinoco Delta',(46,139,87)),('Angel Falls',(232,130,12)),('Los Roques',(11,179,201))]
xs=[210,470,742,1008]; ys=[455,505,455,505]
dr.line(list(zip(xs,ys)),fill=(96,124,134),width=2)
for (label,col),x,y in zip(nodes,xs,ys):
    dr.ellipse([x-15,y-15,x+15,y+15],fill=tuple(int(col[i]*.5+(16,40,50)[i]*.5) for i in range(3)))
    dr.ellipse([x-11,y-11,x+11,y+11],fill=col); dr.ellipse([x-4,y-4,x+4,y+4],fill=(255,255,255))
    f=F(20); w=dr.textlength(label,font=f); dr.text((x-w/2,y+20),label,font=f,fill=(226,233,237))
dr.text((PADX,582),'Angel Falls   ·   Orinoco Delta   ·   Los Roques   ·   hour-by-hour field plan',font=F(20,False),fill=(150,172,180))
img.save('cover.png'); print('cover.png', img.size)
