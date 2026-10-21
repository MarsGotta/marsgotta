/* GLSL ES 1.0 shaders, copied unchanged from the prototype (MG_VS, MG_BAKE_FS and MG_FS).
   The texture is procedural: albedo and relief approximate Syrtis Major, Hellas, Valles Marineris,
   Tharsis and Olympus Mons at their real coordinates, so nothing is downloaded. */

/** Full-screen quad. */
export const VERTEX_SHADER = `attribute vec2 aPos; varying vec2 vUv; void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.0,1.0); }`;

/** Bakes the equirectangular map once: RGB is albedo, alpha is height. */
export const BAKE_FRAGMENT_SHADER = `precision highp float;
varying vec2 vUv;
float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453123); }
vec3 h33(vec3 p){ return fract(sin(vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6))))*43758.5453); }
float vn(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); vec3 u=f*f*f*(f*(f*6.0-15.0)+10.0);
  float a=h3(i), b=h3(i+vec3(1.,0.,0.)), c=h3(i+vec3(0.,1.,0.)), d=h3(i+vec3(1.,1.,0.));
  float e=h3(i+vec3(0.,0.,1.)), f1=h3(i+vec3(1.,0.,1.)), g=h3(i+vec3(0.,1.,1.)), h=h3(i+vec3(1.,1.,1.));
  return mix(mix(mix(a,b,u.x),mix(c,d,u.x),u.y), mix(mix(e,f1,u.x),mix(g,h,u.x),u.y), u.z)*2.0-1.0; }
float fbm(vec3 p){ float s=0.0, a=0.5; for(int i=0;i<6;i++){ s+=a*vn(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=0.5; } return s; }
float fbm3(vec3 p){ float s=0.0, a=0.5; for(int i=0;i<3;i++){ s+=a*vn(p); p=p*2.03+vec3(4.1,2.7,7.3); a*=0.5; } return s; }
vec3 sph(float la, float lo){ la=radians(la); lo=radians(lo); return vec3(cos(la)*sin(lo), sin(la), cos(la)*cos(lo)); }
float adist(vec3 p, float la, float lo){ return degrees(acos(clamp(dot(p,sph(la,lo)),-1.0,1.0))); }
float blob(vec3 p, float la, float lo, float r){ float d=adist(p,la,lo)/r; return exp(-d*d); }
float ring(vec3 p, float la, float lo, float r, float w){ float d=adist(p,la,lo); return exp(-pow((d-r)/w,2.0)); }
float craters(vec3 p, float seed, float dens){ vec3 i=floor(p); vec3 f=fract(p); float h=0.0;
  for(int z=-1;z<=1;z++) for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){
    vec3 g=vec3(float(x),float(y),float(z)); vec3 o=h33(i+g+seed); vec3 r=g+o-f; float d=length(r);
    float rad=0.14+0.24*o.x*o.x; float t=d/rad; float ex=step(1.0-dens,o.y);
    float bowl=(t<1.0)?(t*t-1.0)*0.5:0.0; float rim=exp(-pow((t-1.0)*4.0,2.0))*0.30;
    h+=ex*(bowl+rim)*smoothstep(1.9,1.0,t); }
  return h; }
vec3 ramp(float a){
  vec3 c0=vec3(0.15,0.06,0.06), c1=vec3(0.32,0.11,0.09), c2=vec3(0.60,0.18,0.12), c3=vec3(0.84,0.29,0.18), c4=vec3(0.92,0.44,0.27), c5=vec3(0.96,0.64,0.45);
  a=clamp(a,0.0,1.0);
  if(a<0.18) return mix(c0,c1,a/0.18);
  if(a<0.38) return mix(c1,c2,(a-0.18)/0.20);
  if(a<0.58) return mix(c2,c3,(a-0.38)/0.20);
  if(a<0.78) return mix(c3,c4,(a-0.58)/0.20);
  return mix(c4,c5,(a-0.78)/0.22); }
void main(){
  float lon=(vUv.x-0.5)*6.2831853; float lat=(vUv.y-0.5)*3.1415926;
  vec3 p=vec3(cos(lat)*sin(lon), sin(lat), cos(lat)*cos(lon));
  float latd=degrees(lat), lond=degrees(lon);
  vec3 w=vec3(fbm3(p*2.1+1.3), fbm3(p*2.1+7.9), fbm3(p*2.1+4.6));
  vec3 q=normalize(p+0.13*w);
  float n1=fbm(q*3.0), n2=fbm(q*8.5), n3=vn(q*30.0), n4=vn(q*70.0);
  float streak=fbm3(vec3(q.x*6.0,q.y*26.0,q.z*6.0));
  float df=0.0;
  df+=1.15*blob(q,10.0,69.0,9.0)+0.75*blob(q,22.0,66.0,5.5)+0.6*blob(q,0.0,74.0,7.0);
  df+=0.95*blob(q,-3.0,-1.0,7.0)+0.95*blob(q,-9.0,22.0,8.0)+0.7*blob(q,-12.0,42.0,8.0);
  df+=0.85*blob(q,-16.0,104.0,11.0)+0.95*blob(q,-24.0,140.0,13.0)+0.75*blob(q,-28.0,170.0,11.0);
  df+=0.85*blob(q,-32.0,-152.0,13.0)+0.6*blob(q,-38.0,-125.0,9.0);
  df+=0.95*blob(q,-24.0,-38.0,13.0)+0.75*blob(q,-14.0,-52.0,7.0)+0.8*blob(q,-26.0,-89.0,4.5);
  df+=1.05*blob(q,46.0,-28.0,12.0)+0.55*blob(q,58.0,-10.0,10.0);
  df+=0.55*blob(q,47.0,118.0,15.0)+0.40*blob(q,63.0,-160.0,20.0)+0.35*blob(q,55.0,40.0,16.0);
  float belt=exp(-pow((latd+19.0)/14.0,2.0))*(0.60+0.55*n1+0.25*streak);
  belt*=(1.0-0.85*blob(p,0.0,-112.0,24.0))*(1.0-0.95*blob(p,-42.0,70.0,16.0))*(1.0-0.9*blob(p,-50.0,-44.0,10.0));
  df+=0.70*belt;
  float dm=smoothstep(0.12,1.05,df+0.42*n1+0.24*n2+0.16*streak);
  float inner=0.70+0.38*n2+0.18*n3+0.12*streak;
  float bf=0.0;
  bf+=1.0*blob(p,-42.0,70.0,12.0)+0.9*blob(p,-50.0,-44.0,7.0)+0.75*blob(p,21.0,5.0,16.0);
  bf+=0.9*blob(p,4.0,-112.0,19.0)+0.9*blob(p,16.0,-160.0,17.0)+0.6*blob(p,25.0,147.0,9.0)+0.45*blob(p,13.0,88.0,7.0);
  float a=0.66+0.12*n1+0.07*n2+0.03*n3+0.015*n4+0.05*streak;
  a-=0.34*dm*inner+0.07*df;
  a+=0.12*smoothstep(0.2,0.9,bf+0.2*n1);
  float vl=smoothstep(-103.0,-94.0,lond)*(1.0-smoothstep(-46.0,-38.0,lond));
  float vc=-9.0+0.07*(lond+75.0)+0.9*sin(radians(lond*8.0))+0.7*n2;
  float dv=(latd-vc);
  float vw=2.0+0.7*n3+1.2*blob(p,-7.0,-72.0,6.0);
  float valles=vl*exp(-pow(dv/(vw*1.1),2.0))*(0.80+0.30*n3);
  float vall2=vl*smoothstep(-80.0,-70.0,lond)*(1.0-smoothstep(-58.0,-52.0,lond))*smoothstep(1.0,0.0,abs(dv-3.2)/1.3);
  float noctis=smoothstep(0.35,0.85,blob(q,-7.0,-102.0,3.2)*(0.7+0.9*vn(q*60.0)));
  float vv=max(max(valles,vall2*0.8),noctis*0.7);
  a-=0.28*vv;
  float oly=ring(p,18.65,-133.8,2.9,0.7); float olyC=blob(p,18.65,-133.8,0.7);
  float th=ring(p,-8.3,-120.1,1.5,0.5)+ring(p,1.5,-113.0,1.4,0.5)+ring(p,11.8,-104.5,1.4,0.5)+ring(p,24.8,147.2,1.2,0.5);
  a+=0.06*blob(p,18.65,-133.8,7.0)-0.10*oly-0.08*olyC-0.06*th;
  float hl=smoothstep(12.0,-22.0,latd+9.0*n1);
  float cr=craters(p*11.0,0.0,0.42)*hl+craters(p*27.0,7.0,0.55)*(0.30+0.70*hl)*0.7+craters(p*60.0,3.0,0.5)*0.35*hl;
  a+=0.05*cr;
  vec3 col=ramp(a);
  col*=vec3(1.0,0.97+0.04*n2,0.95);
  col=mix(col, col*vec3(0.80,0.86,0.95), 0.45*dm);
  float capN=smoothstep(77.5,81.5,latd+2.6*n2+1.6*sin(radians(lond*3.0+30.0))+1.5*n3);
  float capS=smoothstep(84.0,87.5,-latd+1.6*n2-2.0*cos(radians(lond+45.0)));
  float frost=smoothstep(66.0,80.0,latd+6.0*n1)*0.35;
  float trough=smoothstep(0.25,0.75,vn(q*22.0)+0.5*n2);
  vec3 ice=mix(vec3(0.98,0.95,0.93), vec3(0.78,0.62,0.60), 0.55*trough*capN);
  col=mix(col, mix(col,vec3(0.93,0.84,0.80),0.6), frost);
  col=mix(col, ice, max(capN,capS));
  float hgt=0.50+0.09*smoothstep(15.0,-20.0,latd+10.0*n1)+0.05*n1+0.02*n2;
  hgt+=0.28*blob(p,18.65,-133.8,3.0)+0.10*blob(p,4.0,-112.0,13.0)+0.12*(blob(p,-8.3,-120.1,1.3)+blob(p,1.5,-113.0,1.2)+blob(p,11.8,-104.5,1.2));
  hgt-=0.16*blob(p,-42.0,70.0,10.0)+0.24*vv;
  hgt+=0.08*cr;
  gl_FragColor=vec4(col, clamp(hgt,0.0,1.0));
}`;

/** Draws the lit sphere with relief, terminator, twilight and atmosphere halo. */
export const RENDER_FRAGMENT_SHADER = `precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform sampler2D uTex; uniform vec2 uTexel;
uniform float uLon0; uniform float uTilt; uniform vec3 uSunP; uniform float uR; uniform float uBump;
void main(){
  vec2 p=vUv*2.0-1.0; vec2 q=p/uR; float r=length(q);
  float pix=2.0/(uRes.x*uR);
  float ct=cos(uTilt), st=sin(uTilt);
  vec3 col=vec3(0.0); float alpha=0.0;
  if(r<1.0+pix){
    float z=sqrt(max(0.0,1.0-min(r*r,1.0)));
    vec3 nV=vec3(q,z);
    vec3 nP=vec3(nV.x, ct*nV.y+st*nV.z, -st*nV.y+ct*nV.z);
    float lam=atan(nP.x,nP.z); float phi=asin(clamp(nP.y,-1.0,1.0));
    vec2 uv=vec2(fract((lam+uLon0)/6.2831853+0.5), phi/3.1415926+0.5);
    vec4 tx=texture2D(uTex,uv);
    float hE=texture2D(uTex,uv+vec2(uTexel.x,0.0)).a-texture2D(uTex,uv-vec2(uTexel.x,0.0)).a;
    float hN=texture2D(uTex,uv+vec2(0.0,uTexel.y)).a-texture2D(uTex,uv-vec2(0.0,uTexel.y)).a;
    vec3 E=vec3(cos(lam),0.0,-sin(lam)); vec3 N=vec3(-sin(phi)*sin(lam),cos(phi),-sin(phi)*cos(lam));
    float cphi=max(cos(phi),0.2);
    vec3 n=normalize(nP-uBump*(hE/cphi*E+hN*N));
    float ndl=dot(n,uSunP); float ndl0=dot(nP,uSunP);
    float term=smoothstep(-0.035,0.10,ndl0);
    float diff=clamp(ndl,0.0,1.0); diff=pow(diff,0.78)*term;
    vec3 alb=tx.rgb;
    vec3 c=alb*1.18*diff;
    c+=alb*vec3(0.30,0.20,0.42)*0.045;
    float tw=smoothstep(-0.16,-0.01,ndl0)*(1.0-smoothstep(0.0,0.20,ndl0));
    c+=vec3(0.82,0.09,0.45)*tw*0.085;
    float fr=pow(1.0-z,2.4);
    float dayL=smoothstep(-0.10,0.35,ndl0);
    c=mix(c, vec3(1.0,0.56,0.40)*(0.35+0.75*clamp(ndl0,0.0,1.0)), fr*0.50*dayL);
    c+=vec3(1.0,0.45,0.42)*pow(1.0-z,7.0)*0.55*dayL;
    c=c/(1.0+0.12*c);
    float cov=clamp((1.0-r)/pix+0.5,0.0,1.0);
    col=c*cov; alpha=cov;
  }
  if(r>1.0-pix*2.0){
    vec2 dir=q/max(r,1e-4);
    vec3 lV=vec3(dir,0.0); vec3 lP=vec3(lV.x, ct*lV.y+st*lV.z, -st*lV.y+ct*lV.z);
    float sl=dot(lP,uSunP);
    float lit=smoothstep(-0.45,0.75,sl);
    float dr=max(r-1.0,0.0);
    float g1=exp(-dr*80.0), g2=exp(-dr*16.0), g3=exp(-dr*5.0);
    vec3 hc=mix(mix(vec3(0.52,0.35,0.75),vec3(0.82,0.09,0.45),smoothstep(0.0,0.45,lit)), vec3(1.0,0.50,0.29), smoothstep(0.45,1.0,lit));
    float I=(g1*0.95+g2*0.30+g3*0.07)*(0.10+0.90*lit);
    I*=1.0-smoothstep(1.0/uR-0.07,1.0/uR,r);
    float ha=clamp(I,0.0,1.0)*(1.0-alpha);
    col+=hc*I*(1.0-alpha); alpha=alpha+ha*0.85;
  }
  float dith=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)/255.0;
  gl_FragColor=vec4(col+dith*alpha, clamp(alpha,0.0,1.0));
}`;
