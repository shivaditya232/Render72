// The site name as a typographic mark: condensed "Render" + "72" in a signal-blue tab.

const Wordmark=({size})=>{
    const isLarge=size==='large';
    return (
        <span role="img" className="inline-flex items-center gap-1.5 select-none" aria-label="Render72">
            <span
                aria-hidden="true"
                className={isLarge?'condensed font-extrabold tracking-tight text-[clamp(3.5rem,14vw,11rem)] leading-[0.82]':'condensed font-extrabold tracking-tight text-[1.375rem] leading-none'}
            >
                Render
            </span>
            <span
                aria-hidden="true"
                className={isLarge?'tabular rounded-[0.12em] bg-signal px-[0.12em] font-extrabold text-[clamp(3.5rem,14vw,11rem)] leading-[0.82] text-bone':'tabular rounded-[5px] bg-signal px-1.5 py-0.5 font-bold text-[0.8125rem] leading-none text-bone'}
            >
                72
            </span>
        </span>
    );
};

export default Wordmark;
