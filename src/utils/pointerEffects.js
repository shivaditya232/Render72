// Two small pointer effects, wired once for the whole site (event delegation),
// so no component has to manage its own listeners:
//   .fx-fill    remembers where the cursor came in (--fx/--fy), so the colour fill
//               can start from that exact point.
//   .fx-magnet  leans slightly towards the cursor while it's over the button.
// Only on devices with a real mouse, and never when reduced motion is requested.

const MAGNET_PULL=0.22;      // share of the cursor's offset the button follows
const MAGNET_MAX_PX=8;        // never moves further than this

const canUseEffects=()=>{
    try{
        const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        return finePointer&&!reduced;
    }
    catch(error){
        return false;
    }
};

const clamp=(value,limit)=>{
    if(value>limit){
        return limit;
    }
    if(value< -limit){
        return -limit;
    }
    return value;
};

const onPointerOver=(event)=>{
    if(event.pointerType!=='mouse'||!(event.target instanceof Element)){
        return;
    }
    const fill=event.target.closest('.fx-fill');
    if(!fill){
        return;
    }
    // Only on entry: moving between the pill's own children doesn't restart the fill.
    if(event.relatedTarget instanceof Node&&fill.contains(event.relatedTarget)){
        return;
    }
    const rect=fill.getBoundingClientRect();
    fill.style.setProperty('--fx',(event.clientX-rect.left)+'px');
    fill.style.setProperty('--fy',(event.clientY-rect.top)+'px');
};

let magnetFrame=0;
let magnetTarget=null;
let magnetX=0;
let magnetY=0;

const applyMagnet=()=>{
    magnetFrame=0;
    if(!magnetTarget){
        return;
    }
    magnetTarget.style.transform='translate('+magnetX.toFixed(1)+'px,'+magnetY.toFixed(1)+'px)';
};

const releaseMagnet=(element)=>{
    if(element){
        element.style.transform='';
    }
};

const onPointerMove=(event)=>{
    if(event.pointerType!=='mouse'||!(event.target instanceof Element)){
        return;
    }
    const magnet=event.target.closest('.fx-magnet');
    if(magnet!==magnetTarget){
        releaseMagnet(magnetTarget);
        magnetTarget=magnet;
    }
    if(!magnet){
        return;
    }
    const rect=magnet.getBoundingClientRect();
    magnetX=clamp((event.clientX-(rect.left+rect.width/2))*MAGNET_PULL,MAGNET_MAX_PX);
    magnetY=clamp((event.clientY-(rect.top+rect.height/2))*MAGNET_PULL,MAGNET_MAX_PX);
    if(!magnetFrame){
        magnetFrame=requestAnimationFrame(applyMagnet);
    }
};

const onPointerLeaveWindow=()=>{
    releaseMagnet(magnetTarget);
    magnetTarget=null;
};

export const installPointerEffects=()=>{
    if(typeof window==='undefined'||!canUseEffects()){
        return;
    }
    document.addEventListener('pointerover',onPointerOver,{passive:true});
    document.addEventListener('pointermove',onPointerMove,{passive:true});
    document.documentElement.addEventListener('pointerleave',onPointerLeaveWindow);
};
