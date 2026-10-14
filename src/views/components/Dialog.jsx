import {useEffect,useRef} from 'react';

// Wrapper around the browser's own <dialog>: it already traps focus, closes on Esc
// and returns focus to the button that opened it — no library needed.
// variant: 'drawer' (slides in from the right) | 'sheet' (slides up from the bottom)
const Dialog=({open,onClose,labelledBy,variant,children})=>{
    const dialogRef=useRef(null);

    useEffect(()=>{
        const dialog=dialogRef.current;
        if(!dialog){
            return;
        }
        if(open&&!dialog.open){
            if(typeof dialog.showModal==='function'){
                dialog.showModal();
            }
            else{
                dialog.setAttribute('open','');
            }
        }
        if(!open&&dialog.open){
            dialog.close();
        }
    },[open]);

    useEffect(()=>{
        const dialog=dialogRef.current;
        if(!dialog){
            return undefined;
        }
        const onNativeClose=()=>{
            onClose();
        };
        dialog.addEventListener('close',onNativeClose);
        return ()=>{
            dialog.removeEventListener('close',onNativeClose);
        };
    },[onClose]);

    // A click on the dark backdrop (the dialog element itself, outside the panel) closes it.
    const onClick=(event)=>{
        if(event.target===dialogRef.current){
            onClose();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            className={'r72-dialog '+(variant||'drawer')}
            aria-labelledby={labelledBy}
            onClick={onClick}
        >
            {open?children:null}
        </dialog>
    );
};

export default Dialog;
