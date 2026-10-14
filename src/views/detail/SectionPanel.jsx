import {useEffect,useRef} from 'react';
import Dialog from '../components/Dialog';
import Icon from '../components/Icon';
import {InPanelContext} from './DetailSection';
import useMediaQuery from '../../controllers/useMediaQuery';
import {padTwo} from '../../utils/formatters';

// One section of the event, opened from its tile: a panel that slides in from the right
// on wider screens and up from the bottom on phones. Arrows step through the sections
// without closing it.
const SectionPanel=({open,onClose,sections,index,onStep,renderSection})=>{
    const isWide=useMediaQuery('(min-width: 768px)');
    const section=sections[index]||null;
    return (
        <Dialog open={open} onClose={onClose} labelledBy={section?section.id+'-title':undefined} variant={isWide?'panel':'sheet'}>
            {section?(
                <PanelContent
                    key={section.id}
                    section={section}
                    index={index}
                    total={sections.length}
                    onClose={onClose}
                    onStep={onStep}
                    previous={index>0?sections[index-1]:null}
                    next={index<sections.length-1?sections[index+1]:null}
                >
                    {renderSection(section.id)}
                </PanelContent>
            ):null}
        </Dialog>
    );
};

const PanelContent=({section,index,total,onClose,onStep,previous,next,children})=>{
    const bodyRef=useRef(null);

    // A new section starts at its top, with focus on its heading for screen readers.
    useEffect(()=>{
        const body=bodyRef.current;
        if(!body){
            return;
        }
        body.scrollTop=0;
        const heading=body.querySelector('h2');
        if(heading){
            heading.focus({preventScroll:true});
        }
    },[section.id]);

    return (
        <div className="flex h-full max-h-[inherit] flex-col overflow-hidden border-line bg-graphite md:border-l max-md:rounded-t-2xl max-md:border-t">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3 md:px-7">
                <span className="label-mono tabular text-ash">{padTwo(index+1)} / {padTwo(total)}</span>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="fx-fill flex h-10 w-10 items-center justify-center rounded-full border border-line text-bone"
                >
                    <Icon name="close" size={18}/>
                </button>
            </div>
            <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 md:px-7 md:py-8">
                <InPanelContext.Provider value={true}>
                    {children}
                </InPanelContext.Provider>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-line p-3 md:px-5">
                {previous?(
                    <button
                        type="button"
                        onClick={()=>{
                            onStep(index-1);
                        }}
                        className="fx-fill inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-bone"
                    >
                        <Icon name="arrowLeft" size={16}/>
                        <span className="truncate">{previous.label}</span>
                    </button>
                ):<span/>}
                {next?(
                    <button
                        type="button"
                        onClick={()=>{
                            onStep(index+1);
                        }}
                        className="fx-fill inline-flex min-h-11 items-center justify-end gap-2 rounded-full border border-line px-4 text-sm font-medium text-bone"
                    >
                        <span className="truncate">{next.label}</span>
                        <Icon name="arrowRight" size={16}/>
                    </button>
                ):<span/>}
            </div>
        </div>
    );
};

export default SectionPanel;
