import DetailSection from './DetailSection';
import {padTwo} from '../../utils/formatters';

// Numbered like a rulebook, so people can say "rule 04" when they ask about it.
const RulesSection=({event})=>{
    return (
        <DetailSection id="rules" eyebrow={event.rules.length+(event.rules.length===1?' rule':' rules')} title="Rules">
            <ol className="divide-y divide-line border-y border-line">
                {event.rules.map((rule,index)=>{
                    return (
                        <li key={index} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-4">
                            <span className="label-mono pt-1 tabular" style={{color:event.track.color}}>{padTwo(index+1)}</span>
                            <p className="max-w-[65ch] leading-relaxed text-bone/90">{rule}</p>
                        </li>
                    );
                })}
            </ol>
        </DetailSection>
    );
};

export default RulesSection;
