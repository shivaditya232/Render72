import useCountdown from '../../controllers/useCountdown';
import {padTwo} from '../../utils/formatters';

// "Opens in 29 : 23 : 10 : 05". Switches to a plain line once the moment has passed.
// The live digits are hidden from screen readers (they'd be announced every second);
// a calm sentence carries the same information instead.
const Countdown=({targetMs,endMs,label})=>{
    const parts=useCountdown(targetMs);
    if(!parts){
        return null;
    }
    if(parts.isOver){
        const isLive=Number.isFinite(endMs)&&Date.now()<endMs;
        return (
            <p className="inline-flex items-center gap-2.5 text-sm font-medium text-bone">
                <span aria-hidden="true" className={isLive?'pulse-dot h-2 w-2 rounded-full bg-open':'h-2 w-2 rounded-full bg-ash'}/>
                {isLive?'Happening now':'This edition has wrapped up'}
            </p>
        );
    }
    const units=[
        {value:parts.days,label:'Days',show:String(parts.days)},
        {value:parts.hours,label:'Hrs',show:padTwo(parts.hours)},
        {value:parts.minutes,label:'Min',show:padTwo(parts.minutes)},
        {value:parts.seconds,label:'Sec',show:padTwo(parts.seconds)}
    ];
    const spoken=label+' in '+parts.days+' days and '+parts.hours+' hours';
    return (
        <div>
            <p aria-hidden="true" className="label-mono text-ash">{label} in</p>
            <p className="sr-only">{spoken}</p>
            <div aria-hidden="true" className="mt-2 flex items-start gap-1.5 sm:gap-2">
                {units.map((unit,index)=>{
                    return (
                        <div key={unit.label} className="flex items-start gap-1.5 sm:gap-2">
                            {index>0?<span className="condensed pt-1 text-2xl font-bold text-line sm:text-3xl">:</span>:null}
                            <div className="flex flex-col items-center">
                                <span className="condensed tabular min-w-[2ch] text-center text-4xl font-extrabold leading-none tracking-tight text-bone sm:text-5xl">{unit.show}</span>
                                <span className="label-mono mt-1.5 text-ash">{unit.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Countdown;
