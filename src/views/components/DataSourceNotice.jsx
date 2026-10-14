import Icon from './Icon';
import {formatRelative,formatShortDate} from '../../utils/formatters';

// A slim, honest line when what's on screen isn't live:
// either the last good copy (cache) or the copy bundled with the site (fallback).
// Shows nothing when data is live.
const DataSourceNotice=({source,savedAt,error,onRetry,isRefreshing})=>{
    // Only for data that is actually on screen. If nothing loaded, ErrorState explains instead.
    if(!error||!source||source==='network'){
        return null;
    }
    let text='';
    if(source==='fallback'){
        text='The live programme couldn’t load, so this is the copy saved with the site';
        if(savedAt){
            text=text+' on '+formatShortDate(savedAt);
        }
        text=text+'. Seats may have changed.';
    }
    else if(source==='summary'){
        text='Showing the short version. The full details couldn’t load yet.';
    }
    else{
        text='The live programme couldn’t load. Showing the copy from '+(savedAt?formatRelative(savedAt):'earlier')+'.';
    }
    return (
        <div role="status" className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-few/30 bg-few/[0.06] px-4 py-3 text-sm text-bone">
            <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-few"/>
                {text}
            </span>
            {onRetry?(
                <button
                    type="button"
                    onClick={onRetry}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1.5 font-medium text-few underline-offset-4 hover:underline disabled:opacity-60"
                >
                    <Icon name="refresh" size={14} className={isRefreshing?'animate-spin':''}/>
                    {isRefreshing?'Checking…':'Try live again'}
                </button>
            ):null}
        </div>
    );
};

export default DataSourceNotice;
