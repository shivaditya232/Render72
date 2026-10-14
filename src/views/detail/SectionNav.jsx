import {useEffect,useRef} from 'react';

const prefersReducedMotion=()=>{
    return typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// The pill bar: jump to a section, and see which one you're reading.
// Sticks under the header; scrolls sideways on phones.
const SectionNav=({sections,activeId})=>{
    const listRef=useRef(null);

    // Keep the active pill in view on narrow screens.
    useEffect(()=>{
        const list=listRef.current;
        if(!list||!activeId){
            return;
        }
        const pill=list.querySelector('[data-section="'+activeId+'"]');
        if(!pill){
            return;
        }
        const left=pill.offsetLeft-16;
        if(left<list.scrollLeft||pill.offsetLeft+pill.offsetWidth>list.scrollLeft+list.clientWidth){
            list.scrollTo({left,behavior:prefersReducedMotion()?'auto':'smooth'});
        }
    },[activeId]);

    if(sections.length<2){
        return null;
    }

    const onJump=(clickEvent,id)=>{
        const target=document.getElementById(id);
        if(!target){
            return;
        }
        // In-page jump without touching the router.
        clickEvent.preventDefault();
        target.scrollIntoView({behavior:prefersReducedMotion()?'auto':'smooth',block:'start'});
        const heading=target.querySelector('h2');
        if(heading){
            heading.focus({preventScroll:true});
        }
    };

    return (
        <nav aria-label="On this page" className="sticky top-16 z-30 -mx-[clamp(1rem,4vw,3rem)] border-b border-line/60 bg-ink/85 px-[clamp(1rem,4vw,3rem)] backdrop-blur-md lg:mx-0 lg:px-0">
            <ul ref={listRef} className="scroll-row flex gap-2 py-3">
                {sections.map((section)=>{
                    const isActive=section.id===activeId;
                    return (
                        <li key={section.id} className="shrink-0">
                            <a
                                href={'#'+section.id}
                                data-section={section.id}
                                aria-current={isActive?'location':undefined}
                                onClick={(clickEvent)=>{
                                    onJump(clickEvent,section.id);
                                }}
                                className={isActive?'inline-flex h-9 items-center rounded-full bg-bone px-4 text-sm font-medium text-ink transition-colors':'inline-flex h-9 items-center rounded-full border border-line px-4 text-sm font-medium text-ash transition-colors hover:border-ash hover:text-bone'}
                            >
                                {section.label}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default SectionNav;
