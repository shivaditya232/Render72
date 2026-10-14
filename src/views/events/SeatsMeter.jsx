import {TONE_DOT,TONE_TEXT} from '../../utils/availability';

// Availability in words + a thin bar of how full the room is.
const SeatsMeter=({event,availability})=>{
    const hasSeats=event.totalSeats!==null&&event.seatsLeft!==null;
    let percent=0;
    if(hasSeats){
        percent=Math.round(event.fillRatio*100);
    }
    let detail='';
    if(hasSeats&&!event.isPast){
        detail=event.seatsLeft+' of '+event.totalSeats+' left';
    }
    else if(hasSeats&&event.isPast){
        detail=event.seatsFilled+' took part';
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-[0.8125rem]">
                <span className={'inline-flex items-center gap-2 font-medium '+TONE_TEXT[availability.tone]}>
                    <span aria-hidden="true" className={'h-1.5 w-1.5 rounded-full '+TONE_DOT[availability.tone]}/>
                    {availability.label}
                </span>
                {detail?<span className="tabular text-ash">{detail}</span>:null}
            </div>
            {hasSeats?(
                <div className="h-[3px] overflow-hidden rounded-full bg-line" aria-hidden="true">
                    <div className={'h-full rounded-full '+TONE_DOT[availability.tone]} style={{width:percent+'%'}}/>
                </div>
            ):null}
        </div>
    );
};

export default SeatsMeter;
