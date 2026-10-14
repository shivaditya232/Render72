// One answer to "can I still get in?", used by every card, row and the booking panel.
// tone drives the colour: open | few | full | muted

const FEW_SEATS_RATIO=0.15;
const FEW_SEATS_MIN=3;
const CLOSING_SOON_MS=7*24*60*60*1000;

export const getAvailability=(event,nowMs)=>{
    const now=Number.isFinite(nowMs)?nowMs:Date.now();
    if(!event){
        return {key:'unknown',label:'',tone:'muted'};
    }
    if(event.isPast){
        return {key:'ended',label:'Ended',tone:'muted'};
    }
    if(event.status==='CLOSED'){
        return {key:'closed',label:'Closed by organisers',tone:'muted'};
    }
    if(event.registrationStatus==='SOLD_OUT'){
        return {key:'sold_out',label:'Sold out',tone:'full'};
    }
    if(event.registrationStatus==='CLOSED'||event.deadlinePassed){
        return {key:'reg_closed',label:'Registration closed',tone:'muted'};
    }
    if(event.seatsLeft!==null&&event.totalSeats){
        const threshold=Math.max(FEW_SEATS_MIN,Math.ceil(event.totalSeats*FEW_SEATS_RATIO));
        if(event.seatsLeft<=threshold){
            const word=event.seatsLeft===1?' seat left':' seats left';
            return {key:'few',label:'Only '+event.seatsLeft+word,tone:'few'};
        }
    }
    if(event.registrationDeadline!==null&&event.registrationDeadline-now<CLOSING_SOON_MS){
        return {key:'closing',label:'Closing soon',tone:'few'};
    }
    return {key:'open',label:'Open',tone:'open'};
};

// Tailwind classes per tone, kept here so every component uses the same colours.
export const TONE_TEXT={
    open:'text-open',
    few:'text-few',
    full:'text-full',
    muted:'text-ash'
};

export const TONE_DOT={
    open:'bg-open',
    few:'bg-few',
    full:'bg-full',
    muted:'bg-ash'
};
