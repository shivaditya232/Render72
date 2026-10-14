// Route loaders run before React Router switches to a new page.
// While a loader is waiting, the PREVIOUS page stays on screen — that's what lets us
// blur it and show "Waiting for connection" when someone goes offline mid-browse.

import {getCachedEventDetail,getEventSummaryById,isValidEventId} from '../models/eventModel';
import {isOnlineNow,waitForOnline} from '../models/connection';

// Returns { id, initial } where initial is something we can draw instantly (or null).
export const eventDetailLoader=async ({params,request})=>{
    const id=params.id||'';

    // Bad ids go straight to the page, which shows "not on the programme".
    if(!isValidEventId(id)){
        return {id,initial:null};
    }

    const cachedDetail=getCachedEventDetail(id);
    if(cachedDetail){
        return {id,initial:{event:cachedDetail.event,partial:false,source:'cache'}};
    }

    const summary=getEventSummaryById(id);
    if(summary){
        return {id,initial:{event:summary,partial:true,source:'summary'}};
    }

    // Nothing to show and no internet: hold the navigation (previous page stays,
    // blurred) until the connection returns or the visitor goes elsewhere.
    if(!isOnlineNow()){
        try{
            await waitForOnline(request.signal);
        }
        catch(error){
            // Navigation was cancelled; React Router ignores this result anyway.
            return {id,initial:null};
        }
    }
    return {id,initial:null};
};
