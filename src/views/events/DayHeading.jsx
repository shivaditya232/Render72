import {getDateParts,getLongDateParts} from '../../utils/formatters';

// A big printed-programme style day marker: "13  FRIDAY · NOVEMBER  8 events".
// It sticks under the site header while you scroll through that day.
const DayHeading=({start,count,headingId})=>{
    const parts=getDateParts(start);
    const longParts=getLongDateParts(start);
    const countText=count+(count===1?' event':' events');
    if(!parts||!longParts){
        return (
            <div className="sticky top-16 z-20 -mx-4 flex items-end justify-between gap-4 border-b border-line bg-ink/90 px-4 py-4 backdrop-blur-md sm:mx-0 sm:px-0">
                <h2 id={headingId} className="condensed text-4xl font-extrabold leading-none tracking-tight">Date to be announced</h2>
                <p className="tabular text-sm text-ash">{countText}</p>
            </div>
        );
    }
    return (
        <div className="sticky top-16 z-20 -mx-4 flex items-end justify-between gap-4 border-b border-line bg-ink/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0">
            <h2 id={headingId} className="flex items-end gap-4">
                <span className="condensed tabular text-[clamp(3.25rem,7vw,5.5rem)] font-extrabold leading-[0.8] tracking-tight">{parts.day}</span>
                <span className="flex flex-col pb-1">
                    <span className="label-mono text-bone">{longParts.weekday}</span>
                    <span className="label-mono text-ash">{longParts.month} {parts.year}</span>
                </span>
            </h2>
            <p className="tabular pb-1 text-sm text-ash">{countText}</p>
        </div>
    );
};

export default DayHeading;
