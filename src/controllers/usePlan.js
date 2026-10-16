import {useCallback,useSyncExternalStore} from 'react';
import {getPlanIds,subscribeToPlan,togglePlan,clearPlan} from '../models/planStore';

const getServerSnapshot=()=>{
    return [];
};

// Every component using this sees the same saved list and updates together.
const usePlan=()=>{
    const ids=useSyncExternalStore(subscribeToPlan,getPlanIds,getServerSnapshot);

    const isSaved=useCallback((id)=>{
        return ids.includes(id);
    },[ids]);

    const toggle=useCallback((id)=>{
        return togglePlan(id);
    },[]);

    const clear=useCallback(()=>{
        clearPlan();
    },[]);

    return {ids,count:ids.length,isSaved,toggle,clear};
};

export default usePlan;
