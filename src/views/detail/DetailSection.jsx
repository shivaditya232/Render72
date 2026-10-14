// One titled section of the event page. The heading is focusable so the pill bar
// can move keyboard and screen-reader focus to it after a jump.
const DetailSection=({id,eyebrow,title,children})=>{
    return (
        <section id={id} aria-labelledby={id+'-title'} className="scroll-mt-36 border-t border-line pt-10">
            {eyebrow?<p className="label-mono text-ash">{eyebrow}</p>:null}
            <h2 id={id+'-title'} tabIndex={-1} className="condensed mt-2 text-[clamp(2rem,4vw,2.75rem)] font-extrabold leading-[0.95] tracking-tight outline-none">{title}</h2>
            <div className="mt-6">{children}</div>
        </section>
    );
};

export default DetailSection;
