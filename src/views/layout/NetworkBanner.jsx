import Icon from '../components/Icon';
import {OFFLINE_BANNER,BACK_ONLINE} from '../../config/messages';

// A thin strip under the header. Never blocks the page: whatever is loaded stays usable.
// The live region is always in the DOM so screen readers announce the change.
const NetworkBanner=({isOnline,justReconnected})=>{
    let content=null;
    if(!isOnline){
        content=(
            <div className="page-gutter border-b border-few/25 bg-[#1A160E]">
                <p className="mx-auto flex max-w-[1440px] items-center gap-2.5 py-2.5 text-sm text-bone">
                    <Icon name="wifiOff" size={16} className="shrink-0 text-few"/>
                    {OFFLINE_BANNER}
                </p>
            </div>
        );
    }
    else if(justReconnected){
        content=(
            <div className="page-gutter border-b border-open/25 bg-[#0E1A14]">
                <p className="mx-auto flex max-w-[1440px] items-center gap-2.5 py-2.5 text-sm text-bone">
                    <Icon name="wifi" size={16} className="shrink-0 text-open"/>
                    {BACK_ONLINE}
                </p>
            </div>
        );
    }
    return (
        <div role="status" aria-live="polite">
            {content}
        </div>
    );
};

export default NetworkBanner;
