import {useMemo} from 'react';
import useEvents from './useEvents';
import usePlan from './usePlan';
import {getCachedEventDetail} from '../models/eventModel';
import {getRelatedEvents,getPlanClashes} from '../utils/eventDetail';
import {getPosterNumbers} from '../utils/landing';

const RELATED_COUNT=3;

// The parts of the event page that need the whole programme, not just this event:
// its poster number, related events, and clashes with the visitor's saved plan.
// If the list can't load, these simply stay empty; the event itself still shows.
const useEventExtras=(event)=>{
    const {events}=useEvents();
    const plan=usePlan();

    const posterNumbers=useMemo(()=>{
        return getPosterNumbers(events);
    },[events]);

    const related=useMemo(()=>{
        return getRelatedEvents(events,event,RELATED_COUNT);
    },[events,event]);

    const clashes=useMemo(()=>{
        if(!event||plan.ids.length===0){
            return [];
        }
        const byId={};
        for(let i=0;i<events.length;i++){
            byId[events[i].id]=events[i];
        }
        const planned=[];
        for(let i=0;i<plan.ids.length;i++){
            const id=plan.ids[i];
            if(id===event.id){
                continue;
            }
            // Prefer the full version (real session times) when we have it.
            const detail=getCachedEventDetail(id);
            if(detail){
                planned.push(detail.event);
            }
            else if(byId[id]){
                planned.push(byId[id]);
            }
        }
        return getPlanClashes(event,planned);
    },[event,events,plan.ids]);

    let posterNumber=null;
    if(event&&posterNumbers[event.id]){
        posterNumber=posterNumbers[event.id];
    }

    return {
        posterNumber,
        related,
        posterNumbers,
        clashes,
        isSaved:event?plan.isSaved(event.id):false,
        toggleSave:()=>{
            if(event){
                plan.toggle(event.id);
            }
        },
        isPlanSaved:plan.isSaved,
        togglePlan:plan.toggle
    };
};

export default useEventExtras;
