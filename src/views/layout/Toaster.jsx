import {useSyncExternalStore} from 'react';
import Icon from '../components/Icon';
import {getToast,dismissToast,subscribeToToast} from '../../models/toastStore';

const getServerSnapshot=()=>{
    return null;
};

// The confirmation pill at the bottom of the screen. The live region is always in the
// page, so screen readers announce each message as it appears.
const Toaster=()=>{
    const toast=useSyncExternalStore(subscribeToToast,getToast,getServerSnapshot);
    return (
        <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
            {toast?(
                <div key={toast.id} className="pointer-events-auto flex animate-[toast-in_0.35s_cubic-bezier(0.22,1,0.36,1)] items-center gap-3 rounded-full border border-line bg-raised py-2 pl-4 pr-2 text-sm text-bone shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)]">
                    <span className={'flex h-5 w-5 items-center justify-center rounded-full text-ink '+(toast.tone==='warn'?'bg-few':'bg-open')}>
                        <Icon name={toast.tone==='warn'?'alert':'check'} size={13}/>
                    </span>
                    <span>{toast.message}</span>
                    {toast.action?(
                        <button
                            type="button"
                            onClick={()=>{
                                const action=toast.action;
                                dismissToast();
                                action.run();
                            }}
                            className="fx-fill rounded-full border border-line px-3 py-1 text-[0.8125rem] font-semibold text-bone"
                        >
                            {toast.action.label}
                        </button>
                    ):(
                        <span className="w-2"/>
                    )}
                </div>
            ):null}
        </div>
    );
};

export default Toaster;
