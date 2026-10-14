import {useEffect,useRef} from 'react';
import Icon from '../components/Icon';
import {MAX_QUERY_LENGTH} from '../../config/filterOptions';

// Search box. Press "/" anywhere on the page to jump into it, Esc to clear.
const SearchField=({value,onChange})=>{
    const inputRef=useRef(null);

    useEffect(()=>{
        const onKeyDown=(event)=>{
            if(event.key!=='/'||event.metaKey||event.ctrlKey||event.altKey){
                return;
            }
            const target=event.target;
            const tag=target&&target.tagName;
            if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(target&&target.isContentEditable)){
                return;
            }
            event.preventDefault();
            if(inputRef.current){
                inputRef.current.focus();
            }
        };
        window.addEventListener('keydown',onKeyDown);
        return ()=>{
            window.removeEventListener('keydown',onKeyDown);
        };
    },[]);

    return (
        <div className="relative flex-1">
            <label htmlFor="event-search" className="sr-only">Search events</label>
            <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash"/>
            <input
                ref={inputRef}
                id="event-search"
                type="search"
                inputMode="search"
                autoComplete="off"
                spellCheck={false}
                maxLength={MAX_QUERY_LENGTH}
                value={value}
                placeholder="Search events or tags"
                onChange={(event)=>{
                    onChange(event.target.value);
                }}
                onKeyDown={(event)=>{
                    if(event.key==='Escape'&&value!==''){
                        event.preventDefault();
                        onChange('');
                    }
                }}
                className="h-12 w-full rounded-full border border-line bg-graphite pl-11 pr-12 text-[0.9375rem] text-bone placeholder:text-ash focus:border-ash focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {value!==''?(
                <button
                    type="button"
                    aria-label="Clear search"
                    onClick={()=>{
                        onChange('');
                        if(inputRef.current){
                            inputRef.current.focus();
                        }
                    }}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ash hover:text-bone"
                >
                    <Icon name="close" size={16}/>
                </button>
            ):(
                <kbd aria-hidden="true" className="label-mono pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 py-0.5 text-ash md:block">/</kbd>
            )}
        </div>
    );
};

export default SearchField;
