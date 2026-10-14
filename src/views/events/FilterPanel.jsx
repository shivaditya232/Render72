import {FACETS} from '../../config/filterOptions';

const CHIP_ON='inline-flex items-center gap-1.5 rounded-full border border-bone bg-bone px-3 py-1.5 text-[0.8125rem] font-semibold text-ink';
const CHIP_OFF='inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.8125rem] font-medium text-bone transition-colors hover:border-ash disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line';
const ROW_ON='flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm font-semibold text-bone';
const ROW_OFF='flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm text-ash transition-colors hover:bg-graphite hover:text-bone disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ash';

// All filter groups. Every option shows how many events it would give you,
// and options that would lead to zero results are dimmed (unless already on).
// layout: 'chips' (mobile sheet) | 'list' (desktop sidebar, one tidy row per option)
const FilterPanel=({facets,counts,onToggle,idPrefix,layout})=>{
    const isList=layout==='list';
    return (
        <div className={isList?'space-y-7':'space-y-6'}>
            {FACETS.map((facet)=>{
                const headingId=(idPrefix||'filters')+'-'+facet.key;
                return (
                    <section key={facet.key} aria-labelledby={headingId}>
                        <h3 id={headingId} className={isList?'label-mono mb-2 px-2 text-ash':'label-mono mb-2.5 text-ash'}>{facet.label}</h3>
                        <div role="group" aria-labelledby={headingId} className={isList?'space-y-0.5':'flex flex-wrap gap-2'}>
                            {facet.options.map((option)=>{
                                const isOn=facets[facet.key].includes(option.value);
                                const count=counts[facet.key]?counts[facet.key][option.value]:0;
                                const isDead=count===0&&!isOn;
                                const onClick=()=>{
                                    onToggle(facet.key,option.value);
                                };
                                if(isList){
                                    return (
                                        <button key={option.value} type="button" aria-pressed={isOn} disabled={isDead} onClick={onClick} className={isOn?ROW_ON:ROW_OFF}>
                                            <span aria-hidden="true" className={isOn?'flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] bg-bone text-ink':'h-4 w-4 shrink-0 rounded-[5px] border border-line'}>
                                                {isOn?(
                                                    <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5.2l2 2L8 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                ):null}
                                            </span>
                                            <span className="flex-1 truncate">{option.label}</span>
                                            <span className="tabular text-xs text-ash">{count}</span>
                                        </button>
                                    );
                                }
                                return (
                                    <button key={option.value} type="button" aria-pressed={isOn} disabled={isDead} onClick={onClick} className={isOn?CHIP_ON:CHIP_OFF}>
                                        {option.label}
                                        <span className={isOn?'tabular text-ink/55':'tabular text-ash'}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

export default FilterPanel;
