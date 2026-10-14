// The programme in five numbers, all counted from the live data.
// Hairlines between cells come from a 1px grid gap over a line-coloured background,
// so they stay correct however many columns fit.
const StatsStrip=({stats})=>{
    const items=[
        {value:stats.events,label:stats.events===1?'event':'events'},
        {value:stats.days,label:stats.days===1?'day':'days'},
        {value:stats.tracks,label:stats.tracks===1?'track':'tracks'},
        {value:stats.seatsOpen,label:'seats still open'},
        {value:stats.free,label:'free to enter'}
    ];
    const shown=[];
    for(let i=0;i<items.length;i++){
        if(items[i].value>0){
            shown.push(items[i]);
        }
    }
    return (
        <section className="page-gutter" aria-label="The programme in numbers">
            <dl className="mx-auto grid max-w-[1440px] grid-cols-2 gap-px overflow-hidden border-y border-line bg-line sm:grid-cols-5">
                {shown.map((item,index)=>{
                    // On phones (2 columns) an odd last number spans the row, so no empty cell shows.
                    const isLoneLast=shown.length%2===1&&index===shown.length-1;
                    return (
                        <div key={item.label} className={'flex flex-col gap-1.5 bg-ink px-1 py-7 sm:px-5 sm:first:pl-0'+(isLoneLast?' col-span-2 sm:col-span-1':'')}>
                            <dt className="label-mono order-2 text-ash">{item.label}</dt>
                            <dd className="condensed tabular order-1 text-[clamp(2.5rem,5vw,4.25rem)] font-extrabold leading-none tracking-tight">{item.value}</dd>
                        </div>
                    );
                })}
            </dl>
        </section>
    );
};

export default StatsStrip;
