import DetailSection from './DetailSection';
import {getPrizeLayout} from '../../utils/eventDetail';

const PLACE_HEIGHT={1:'h-44 sm:h-56',2:'h-32 sm:h-40',3:'h-24 sm:h-28'};
const PLACE_WORD={1:'1st',2:'2nd',3:'3rd'};

const formatAmount=(amount)=>{
    if(amount===null){
        return 'Award';
    }
    return '₹'+amount.toLocaleString('en-IN');
};

// The prize podium: 2nd, 1st, 3rd, with block heights by place.
// Places past third and unranked awards are listed underneath.
const PrizeSection=({event})=>{
    const layout=getPrizeLayout(event.prizes);
    const others=layout.rest.concat(layout.special);
    // Podium descriptions read in place order (1st, 2nd, 3rd), not screen order.
    const byPlace=[];
    for(let place=1;place<=3;place++){
        for(let i=0;i<layout.podium.length;i++){
            const entry=layout.podium[i];
            if(entry.place===place&&entry.prize.description){
                byPlace.push(entry);
            }
        }
    }
    let eyebrow='Prizes';
    if(layout.pool>0){
        eyebrow='₹'+layout.pool.toLocaleString('en-IN')+' in prizes';
    }
    return (
        <DetailSection id="prizes" eyebrow={eyebrow} title={event.isPast?'What was won':'What you can win'}>
            {layout.podium.length>0?(
                <ol className="grid max-w-2xl items-end gap-2 sm:gap-3" style={{gridTemplateColumns:'repeat('+layout.podium.length+',minmax(0,1fr))'}}>
                    {layout.podium.map((entry)=>{
                        const isWinner=entry.place===1;
                        return (
                            <li key={entry.place} className="flex min-w-0 flex-col">
                                <div className="space-y-1 pb-3">
                                    <p className="tabular text-[clamp(1.125rem,3.2vw,1.75rem)] font-bold leading-none text-bone">{formatAmount(entry.prize.amount)}</p>
                                    <p className="line-clamp-2 text-xs leading-snug text-ash sm:text-sm">{entry.prize.title}</p>
                                </div>
                                <div
                                    className={'flex items-start rounded-t-xl p-3 sm:p-4 '+PLACE_HEIGHT[entry.place]}
                                    style={isWinner?{backgroundColor:event.track.color}:{backgroundColor:'var(--color-raised)',boxShadow:'inset 0 1px 0 '+event.track.color}}
                                >
                                    <span className={'condensed text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-[0.8] '+(isWinner?'text-ink':'text-bone')}>
                                        {PLACE_WORD[entry.place]}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            ):null}
            {byPlace.length>0?(
                <ul className="mt-6 space-y-3">
                    {byPlace.map((entry)=>{
                        return (
                            <li key={entry.place} className="flex gap-3 text-sm leading-relaxed">
                                <span className="label-mono w-8 shrink-0 pt-0.5 text-ash">{PLACE_WORD[entry.place]}</span>
                                <span className="text-bone/80">{entry.prize.description}</span>
                            </li>
                        );
                    })}
                </ul>
            ):null}
            {others.length>0?(
                <div className="mt-8">
                    <h3 className="label-mono text-ash">{layout.podium.length>0?'Also up for grabs':'Awards'}</h3>
                    <ul className="mt-3 divide-y divide-line border-y border-line">
                        {others.map((prize,index)=>{
                            return (
                                <li key={index} className="flex items-start justify-between gap-4 py-4">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-bone">{prize.title}</p>
                                        {prize.description?<p className="mt-1 text-sm leading-relaxed text-ash">{prize.description}</p>:null}
                                    </div>
                                    <p className="tabular shrink-0 font-bold text-bone">{formatAmount(prize.amount)}</p>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ):null}
        </DetailSection>
    );
};

export default PrizeSection;
