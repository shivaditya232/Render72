import Icon from './Icon';
import {getErrorCopy} from '../../config/messages';

// Shown when there is nothing at all to display (no cache, no bundled copy).
const ErrorState=({error,onRetry,isRetrying})=>{
    const copy=getErrorCopy(error);
    const isOffline=error&&error.kind==='offline';
    return (
        <div role="alert" className="flex max-w-xl flex-col items-start gap-5 py-16">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ash">
                <Icon name={isOffline?'wifiOff':'alert'} size={20}/>
            </span>
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold leading-tight text-bone">{copy.title}</h2>
                <p className="text-base leading-relaxed text-ash">{copy.body}</p>
            </div>
            {onRetry?(
                <button
                    type="button"
                    onClick={onRetry}
                    disabled={isRetrying}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-bone transition-colors hover:border-ash disabled:opacity-60"
                >
                    <Icon name="refresh" size={16} className={isRetrying?'animate-spin':''}/>
                    {isRetrying?'Trying again…':'Try again'}
                </button>
            ):null}
        </div>
    );
};

export default ErrorState;
