// Small lines shown only when a wait is long enough to notice (see LOADING_PHRASE_DELAY_MS).
// They match what's being opened, and the joke is always on us, never on the user.

export const LOADING_PHRASE_DELAY_MS=800;
export const LOADING_PHRASE_ROTATE_MS=2200;

export const GENERAL_PHRASES=[
    'Rolling out the programme…',
    'Counting seats in the auditorium…',
    'Pinning the posters up straight…',
    'Asking the organisers for the final list…'
];

// Checked against the event's category, first match wins.
const CATEGORY_PHRASES=[
    {keywords:['hackathon'],phrases:['Brewing the 3 AM coffee…','Plugging in forty laptops…']},
    {keywords:['coding','programming'],phrases:['Compiling the problem set…','Warming up the judge server…']},
    {keywords:['artificial','intelligence'],phrases:['Training on the event details…','Checking the model’s homework…']},
    {keywords:['cyber','security'],phrases:['Hiding the flags…','Decrypting the details…']},
    {keywords:['web'],phrases:['Clearing the cache (ironically)…']},
    {keywords:['aerial','drone'],phrases:['Waiting for clear airspace…']},
    {keywords:['robot','electronic'],phrases:['Charging the batteries…','Calibrating the sensors…']},
    {keywords:['engineering'],phrases:['Load-testing the details…']},
    {keywords:['dance'],phrases:['Warming up backstage…','Counting the eight-counts…']},
    {keywords:['music','band'],phrases:['Running the sound check…','Tuning the last string…']},
    {keywords:['theatre','drama'],phrases:['Waiting for the curtain…']},
    {keywords:['photo'],phrases:['Developing the photos…','Waiting for golden hour…']},
    {keywords:['film','media'],phrases:['Rolling camera…','Syncing the clapperboard…']},
    // Words before art: "Literary Arts" should get a words phrase, not a pencil one.
    {keywords:['debate','literary','poetry'],phrases:['Choosing the right words…']},
    {keywords:['quiz'],phrases:['Shuffling the question cards…']},
    {keywords:['entrepreneur'],phrases:['Polishing the pitch deck…']},
    {keywords:['design','art','craft','illustration'],phrases:['Sharpening the pencils…','Picking the right shade…']},
    {keywords:['gaming','esports'],phrases:['Waiting in the lobby…','Loading the map…']},
    {keywords:['food'],phrases:['Tasting for salt…','Heating the tawa…']},
    {keywords:['astronomy'],phrases:['Waiting for the clouds to clear…']},
    {keywords:['sustainab'],phrases:['Fixing it instead of replacing it…']}
];

export const getPhrasesForCategory=(category)=>{
    if(typeof category!=='string'||category===''){
        return GENERAL_PHRASES;
    }
    const text=category.toLowerCase();
    for(let i=0;i<CATEGORY_PHRASES.length;i++){
        const entry=CATEGORY_PHRASES[i];
        for(let j=0;j<entry.keywords.length;j++){
            if(text.includes(entry.keywords[j])){
                return entry.phrases;
            }
        }
    }
    return GENERAL_PHRASES;
};

export const SLOW_MESSAGE='This is taking longer than usual.';
export const WAITING_FOR_CONNECTION='Waiting for connection';
