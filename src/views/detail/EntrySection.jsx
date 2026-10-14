import DetailSection from './DetailSection';
import Icon from '../components/Icon';

const CheckList=({title,items,icon})=>{
    if(items.length===0){
        return null;
    }
    return (
        <div className="rounded-2xl border border-line bg-graphite p-5 sm:p-6">
            <h3 className="label-mono text-ash">{title}</h3>
            <ul className="mt-4 space-y-3">
                {items.map((item,index)=>{
                    return (
                        <li key={index} className="flex gap-3 text-[0.9375rem] leading-relaxed text-bone/90">
                            <Icon name={icon} size={16} className="mt-1 shrink-0 text-ash"/>
                            {item}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

// Eligibility and what to bring, side by side from tablets up.
const EntrySection=({event})=>{
    return (
        <DetailSection id="entry" eyebrow="Before you sign up" title="Who can enter">
            <div className="grid gap-3 md:grid-cols-2">
                <CheckList title="Eligibility" items={event.eligibility} icon="check"/>
                <CheckList title="Bring and prepare" items={event.prerequisites} icon="arrowRight"/>
            </div>
        </DetailSection>
    );
};

export default EntrySection;
