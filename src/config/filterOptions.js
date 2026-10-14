// Every filter on the events page, defined once.
// Each facet allows several options; options inside one facet are OR-ed,
// different facets are AND-ed (e.g. "Code & AI or Stage" AND "Free").

import {TRACKS} from './tracks';

const buildTrackOptions=()=>{
    const options=[];
    for(let i=0;i<TRACKS.length;i++){
        const track=TRACKS[i];
        options.push({
            value:track.id,
            label:track.label,
            test:(event)=>{
                return event.track.id===track.id;
            }
        });
    }
    return options;
};

export const FACETS=[
    {
        key:'track',
        label:'Track',
        options:buildTrackOptions()
    },
    {
        key:'kind',
        label:'Type',
        options:[
            {value:'technical',label:'Technical',test:(event)=>event.isTechnical},
            {value:'cultural',label:'Cultural',test:(event)=>!event.isTechnical}
        ]
    },
    {
        key:'format',
        label:'Format',
        options:[
            {value:'event',label:'Competitions',test:(event)=>event.type==='EVENT'},
            {value:'workshop',label:'Workshops',test:(event)=>event.type==='WORKSHOP'}
        ]
    },
    {
        key:'mode',
        label:'Where',
        options:[
            {value:'offline',label:'On campus',test:(event)=>event.mode==='OFFLINE'},
            {value:'online',label:'Online',test:(event)=>event.mode==='ONLINE'}
        ]
    },
    {
        key:'price',
        label:'Fee',
        options:[
            {value:'free',label:'Free',test:(event)=>event.price===0},
            {value:'under500',label:'Under ₹500',test:(event)=>event.price!==null&&event.price<500}
        ]
    },
    {
        key:'team',
        label:'Team',
        options:[
            {value:'solo',label:'Solo',test:(event)=>event.minTeam===null||event.minTeam<=1},
            {value:'duo',label:'Duo',test:(event)=>{
                const min=event.minTeam===null?1:event.minTeam;
                const max=event.maxTeam===null?min:event.maxTeam;
                return min<=2&&max>=2;
            }},
            {value:'group',label:'3 or more',test:(event)=>event.maxTeam!==null&&event.maxTeam>=3}
        ]
    },
    {
        key:'open',
        label:'Registration',
        options:[
            {value:'yes',label:'Open to register',test:(event)=>event.canRegister}
        ]
    }
];

export const SORTS=[
    {value:'soonest',label:'Soonest'},
    {value:'closing',label:'Closing soon'},
    {value:'seats',label:'Fewest seats'},
    {value:'price',label:'Lowest fee'}
];

export const WHEN_OPTIONS=[
    {value:'upcoming',label:'Upcoming'},
    {value:'past',label:'Past'}
];

export const DEFAULT_SORT='soonest';
export const DEFAULT_WHEN='upcoming';
export const MAX_QUERY_LENGTH=80;
