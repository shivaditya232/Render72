import {useEffect,useState} from 'react';
import {useLocation,useNavigate} from 'react-router';
import {WAITING_FOR_CONNECTION} from '../../config/loadingPhrases';

const PROGRESS_DELAY_MS=250;

// While a page change is pending:
//  - online:  a thin progress line at the top (only if it takes over 250 ms)
//  - offline: the current page is blurred (by AppLayout) and this card explains why,
//             with a way out. The page opens by itself when the connection returns.
const NavigationOverlay=({isPending,isOnline})=>{
    const navigate=useNavigate();
    const location=useLocation();
    const [showProgress,setShowProgress]=useState(false);

    useEffect(()=>{
        if(!isPending){
            setShowProgress(false);
            return undefined;
        }
        const timer=setTimeout(()=>{
            setShowProgress(true);
        },PROGRESS_DELAY_MS);
        return ()=>{
            clearTimeout(timer);
        };
    },[isPending]);

    const stayHere=()=>{
        // Navigating to where we already are cancels the pending page change.
        navigate(location.pathname+location.search+location.hash,{replace:true,preventScrollReset:true});
    };

    if(!isPending){
        return null;
    }

    if(!isOnline){
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-labelledby="waiting-title">
                <div className="w-full max-w-sm rounded-2xl border border-line bg-graphite/95 p-6 shadow-2xl shadow-black/60">
                    <div className="flex items-center gap-3">
                        <span aria-hidden="true" className="pulse-dot h-2.5 w-2.5 rounded-full bg-few"/>
                        <h2 id="waiting-title" className="text-lg font-semibold text-bone">{WAITING_FOR_CONNECTION}</h2>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ash">
                        This page hasn’t been loaded yet. It will open as soon as you’re back online.
                    </p>
                    <button
                        type="button"
                        onClick={stayHere}
                        autoFocus
                        className="mt-5 w-full rounded-full border border-line px-4 py-2.5 text-sm font-medium text-bone transition-colors hover:border-ash"
                    >
                        Stay on this page
                    </button>
                </div>
            </div>
        );
    }

    if(!showProgress){
        return null;
    }
    return (
        <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden" role="progressbar" aria-label="Loading page">
            <div className="h-full w-1/3 animate-[progress-slide_1.1s_ease-in-out_infinite] bg-signal"/>
        </div>
    );
};

export default NavigationOverlay;
