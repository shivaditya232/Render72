import {useCallback,useSyncExternalStore} from 'react';
import {getPlanIds,subscribeToPlan,togglePlan,clearPlan,isInPlan} from '../models/planStore';
import {showToast} from '../models/toastStore';

const getServerSnapshot=()=>{
    return [];
};

// Every component using this sees the same saved list and updates together.
const usePlan=()=>{
    const ids=useSyncExternalStore(subscribeToPlan,getPlanIds,getServerSnapshot);

    const isSaved=useCallback((id)=>{
        return ids.includes(id);
    },[ids]);

    // Every save and un-save is confirmed with a short message that can be undone.
    const toggle=useCallback((id)=>{
        const wasSaved=isInPlan(id);
        const result=togglePlan(id);
        const isSaved=isInPlan(id);
        const undo={label:'Undo',run:()=>{
            togglePlan(id);
        }};
        if(!wasSaved&&isSaved){
            showToast('Saved to your plan',undo);
        }
        else if(wasSaved&&!isSaved){
            showToast('Removed from your plan',undo);
        }
        else if(!wasSaved&&!isSaved){
            showToast('Your plan is full. Remove an event to add another.',null,'warn');
        }
        return result;
    },[]);

    const clear=useCallback(()=>{
        clearPlan();
    },[]);

    return {ids,count:ids.length,isSaved,toggle,clear};
};

export default usePlan;
