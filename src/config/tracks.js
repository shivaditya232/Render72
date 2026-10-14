// The API has ~27 free-text categories. That's too many chips to filter by,
// so we group them into a few tracks. Matching is by keyword, so a new
// category from the API still lands in a sensible track.
// ORDER MATTERS: the first track whose keyword matches wins.
// ("Artificial Intelligence" must hit Code & AI before "art" hits Art & Design.)

export const TRACKS=[
    {
        id:'code',
        label:'Code & AI',
        keywords:['coding','code','hackathon','artificial','intelligence',' ai','web','cyber','security','software','data','machine learning','programming']
    },
    {
        id:'machines',
        label:'Robotics & Engineering',
        keywords:['robot','aerial','drone','electronic','engineering','hardware','mechanical','civil']
    },
    {
        id:'stage',
        label:'Stage',
        keywords:['dance','music','theatre','theater','drama','band','perform']
    },
    {
        id:'words',
        label:'Words & Ideas',
        keywords:['debate','literary','poetry','quiz','entrepreneur','business','speaking','writing']
    },
    {
        id:'visual',
        label:'Art & Design',
        keywords:['design','art','photo','film','media','craft','illustration','visual']
    },
    {
        id:'explore',
        label:'Play & Explore',
        keywords:['gaming','esports','food','culture','sustainab','astronomy','science','nature']
    }
];

export const OTHER_TRACK={id:'other',label:'More',keywords:[]};

export const getTrackForCategory=(category)=>{
    if(typeof category!=='string'||category.trim()===''){
        return OTHER_TRACK;
    }
    // Pad with spaces so ' ai' only matches the word "AI", not "rain".
    const text=' '+category.toLowerCase()+' ';
    for(let i=0;i<TRACKS.length;i++){
        const track=TRACKS[i];
        for(let j=0;j<track.keywords.length;j++){
            if(text.includes(track.keywords[j])){
                return track;
            }
        }
    }
    return OTHER_TRACK;
};

export const getTrackById=(id)=>{
    for(let i=0;i<TRACKS.length;i++){
        if(TRACKS[i].id===id){
            return TRACKS[i];
        }
    }
    if(id===OTHER_TRACK.id){
        return OTHER_TRACK;
    }
    return null;
};
