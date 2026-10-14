import DetailSection from './DetailSection';
import Icon from '../components/Icon';

// Native <details>: works without JavaScript, keyboard and screen readers for free.
const FaqSection=({event})=>{
    return (
        <DetailSection id="faq" eyebrow="Asked before" title="FAQ">
            <div className="divide-y divide-line border-y border-line">
                {event.faqs.map((faq,index)=>{
                    return (
                        <details key={index} className="faq-item group">
                            <summary className="flex cursor-pointer items-start justify-between gap-4 py-5 text-[1.0625rem] font-semibold text-bone">
                                <span>{faq.question}</span>
                                <Icon name="plus" size={18} className="faq-plus mt-1 shrink-0 text-ash transition-transform"/>
                            </summary>
                            <p className="max-w-[65ch] pb-5 leading-relaxed text-bone/80">{faq.answer}</p>
                        </details>
                    );
                })}
            </div>
        </DetailSection>
    );
};

export default FaqSection;
