// The Event model: fetches events, cleans every field, adds derived values,
// and decides where data comes from (network → cache → bundled copy).
// Views never see raw API data, so a missing or odd field can't crash a page.

import {API_BASE_URL,FALLBACK_LIST_URL,FALLBACK_DETAIL_URL,IST_OFFSET} from '../config/apiConfig';
import {getTrackForCategory} from '../config/tracks';
import {requestJson,createRequestError} from './httpClient';
import {readCache,writeCache,readDetailCache,writeDetailCache} from './cacheStore';
import {getSimulateMode} from './simulator';

const LIST_CACHE_KEY='events';

const EVENT_TYPES=['EVENT','WORKSHOP'];
const EVENT_MODES=['ONLINE','OFFLINE'];
const EVENT_STATUSES=['ACTIVE','COMPLETED','CLOSED'];
const REGISTRATION_STATUSES=['OPEN','CLOSED','SOLD_OUT'];

// ---------- small cleaning helpers ----------

const cleanText=(value,fallback)=>{
    if(typeof value==='string'){
        const trimmed=value.trim();
        if(trimmed!==''){
            return trimmed;
        }
    }
    if(typeof value==='number'&&Number.isFinite(value)){
        return String(value);
    }
    return fallback===undefined?'':fallback;
};

const cleanNumber=(value)=>{
    if(typeof value==='number'&&Number.isFinite(value)){
        return value;
    }
    if(typeof value==='string'&&value.trim()!==''){
        const parsed=Number(value);
        if(Number.isFinite(parsed)){
            return parsed;
        }
    }
    return null;
};

const cleanBoolean=(value)=>{
    return value===true||value==='true';
};

const cleanEnum=(value,allowed,fallback)=>{
    if(typeof value==='string'){
        const upper=value.trim().toUpperCase();
        if(allowed.includes(upper)){
            return upper;
        }
    }
    return fallback;
};

const cleanTextList=(value)=>{
    if(!Array.isArray(value)){
        return [];
    }
    const result=[];
    for(let i=0;i<value.length;i++){
        const text=cleanText(value[i]);
        if(text!==''){
            result.push(text);
        }
    }
    return result;
};

const cleanUrl=(value)=>{
    if(typeof value!=='string'){
        return null;
    }
    try{
        const parsed=new URL(value.trim());
        if(parsed.protocol==='https:'||parsed.protocol==='http:'){
            return parsed.toString();
        }
        return null;
    }
    catch(error){
        return null;
    }
};

const DATE_PATTERN=/^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN=/^([01]\d|2[0-3]):[0-5]\d$/;

// '2026-11-13' + '18:00' → milliseconds, read as IST.
export const toIstTime=(date,time)=>{
    if(typeof date!=='string'||!DATE_PATTERN.test(date)){
        return null;
    }
    // Reject impossible dates like 2026-02-30 (JavaScript would quietly roll them into March).
    const year=Number(date.slice(0,4));
    const month=Number(date.slice(5,7));
    const day=Number(date.slice(8,10));
    const daysInMonth=new Date(Date.UTC(year,month,0)).getUTCDate();
    if(month<1||month>12||day<1||day>daysInMonth){
        return null;
    }
    let safeTime='00:00';
    if(typeof time==='string'&&TIME_PATTERN.test(time)){
        safeTime=time;
    }
    const ms=Date.parse(date+'T'+safeTime+':00'+IST_OFFSET);
    if(Number.isFinite(ms)){
        return ms;
    }
    return null;
};

const parseDateTime=(value)=>{
    if(typeof value!=='string'||value.trim()===''){
        return null;
    }
    const ms=Date.parse(value);
    if(Number.isFinite(ms)){
        return ms;
    }
    return null;
};

const cleanPrizes=(value)=>{
    if(!Array.isArray(value)){
        return [];
    }
    const result=[];
    for(let i=0;i<value.length;i++){
        const prize=value[i];
        if(!prize||typeof prize!=='object'){
            continue;
        }
        const title=cleanText(prize.title);
        const amount=cleanNumber(prize.amount);
        if(title===''&&amount===null){
            continue;
        }
        result.push({
            rank:cleanNumber(prize.rank)||i+1,
            title:title||'Prize',
            amount:amount!==null&&amount>=0?amount:null,
            description:cleanText(prize.description)
        });
    }
    result.sort((a,b)=>{
        return a.rank-b.rank;
    });
    return result;
};

const cleanFaqs=(value)=>{
    if(!Array.isArray(value)){
        return [];
    }
    const result=[];
    for(let i=0;i<value.length;i++){
        const faq=value[i];
        if(!faq||typeof faq!=='object'){
            continue;
        }
        const question=cleanText(faq.question);
        const answer=cleanText(faq.answer);
        if(question!==''&&answer!==''){
            result.push({question,answer});
        }
    }
    return result;
};

const cleanSchedules=(value)=>{
    if(!Array.isArray(value)){
        return [];
    }
    const result=[];
    for(let i=0;i<value.length;i++){
        const slot=value[i];
        if(!slot||typeof slot!=='object'){
            continue;
        }
        const start=toIstTime(slot.event_date,slot.start_time);
        if(start===null){
            continue;
        }
        let end=toIstTime(slot.event_date,slot.end_time);
        if(end!==null&&end<=start){
            // e.g. 18:00–00:00 means it runs past midnight; never let end be before start.
            end=null;
        }
        result.push({
            date:slot.event_date,
            start,
            end,
            venue:cleanText(slot.venue,'Venue to be announced')
        });
    }
    result.sort((a,b)=>{
        return a.start-b.start;
    });
    return result;
};

const cleanPeople=(value,mapper)=>{
    if(!Array.isArray(value)){
        return [];
    }
    const result=[];
    for(let i=0;i<value.length;i++){
        const item=value[i];
        if(!item||typeof item!=='object'){
            continue;
        }
        const mapped=mapper(item,i);
        if(mapped&&mapped.name!==''){
            result.push(mapped);
        }
    }
    return result;
};

// ---------- the main cleaner ----------

// Takes one raw event from the API (summary or full detail) and returns a clean,
// predictable object — or null if it's unusable (no id).
export const normalizeEvent=(raw,nowMs)=>{
    if(!raw||typeof raw!=='object'){
        return null;
    }
    const id=cleanText(raw.id);
    if(id===''){
        return null;
    }
    const now=Number.isFinite(nowMs)?nowMs:Date.now();
    const summary=raw.schedule_summary&&typeof raw.schedule_summary==='object'?raw.schedule_summary:{};
    const schedules=cleanSchedules(raw.schedules);

    let start=toIstTime(summary.start_date,summary.start_time);
    let end=toIstTime(summary.end_date,summary.end_time);
    if(start===null&&schedules.length>0){
        start=schedules[0].start;
    }
    if(end===null&&schedules.length>0){
        const lastSlot=schedules[schedules.length-1];
        end=lastSlot.end||lastSlot.start;
    }
    if(start!==null&&end!==null&&end<start){
        end=null;
    }

    const totalSeats=cleanNumber(raw.total_seats);
    const rawFilled=cleanNumber(raw.seats_filled);
    let seatsFilled=null;
    let seatsLeft=null;
    let fillRatio=null;
    if(totalSeats!==null&&totalSeats>0){
        seatsFilled=Math.min(Math.max(rawFilled||0,0),totalSeats);
        seatsLeft=totalSeats-seatsFilled;
        fillRatio=seatsFilled/totalSeats;
    }

    let minTeam=cleanNumber(raw.min_teamsize);
    let maxTeam=cleanNumber(raw.max_teamsize);
    if(minTeam!==null&&minTeam<1){
        minTeam=1;
    }
    if(minTeam!==null&&maxTeam!==null&&maxTeam<minTeam){
        maxTeam=minTeam;
    }

    let price=cleanNumber(raw.price);
    if(price!==null&&price<0){
        price=null;
    }

    const category=cleanText(raw.category,'General');
    const track=getTrackForCategory(category);
    const status=cleanEnum(raw.event_status,EVENT_STATUSES,'ACTIVE');
    let registrationStatus=cleanEnum(raw.registration_status,REGISTRATION_STATUSES,'CLOSED');
    if(registrationStatus==='OPEN'&&seatsLeft===0){
        registrationStatus='SOLD_OUT';
    }
    const registrationDeadline=parseDateTime(raw.registration_deadline);

    // Past = organisers marked it completed, or it has already ended.
    let isPast=status==='COMPLETED';
    if(!isPast&&end!==null&&end<now){
        isPast=true;
    }
    if(!isPast&&end===null&&start!==null&&start<now-24*60*60*1000){
        isPast=true;
    }

    const deadlinePassed=registrationDeadline!==null&&registrationDeadline<now;
    const canRegister=status==='ACTIVE'&&!isPast&&registrationStatus==='OPEN'&&!deadlinePassed;

    const coverUrl=cleanUrl(raw.cover_image_url);
    const bannerUrl=cleanUrl(raw.banner_image_url)||coverUrl;
    const name=cleanText(raw.name,'Untitled event');
    const blurb=cleanText(raw.blurb);
    const tags=cleanTextList(raw.tags);

    const event={
        id,
        name,
        blurb,
        description:cleanText(raw.description),
        category,
        track:{id:track.id,label:track.label},
        tags,
        type:cleanEnum(raw.event_type,EVENT_TYPES,'EVENT'),
        mode:cleanEnum(raw.event_mode,EVENT_MODES,'OFFLINE'),
        status,
        isFeatured:cleanBoolean(raw.is_featured),
        isTechnical:cleanBoolean(raw.is_technical),
        price,
        isPerHead:cleanBoolean(raw.is_per_head),
        minTeam,
        maxTeam,
        totalSeats,
        seatsFilled,
        seatsLeft,
        fillRatio,
        registrationStatus,
        registrationDeadline,
        deadlinePassed,
        canRegister,
        isPast,
        start,
        end,
        cover:{url:coverUrl,alt:cleanText(raw.cover_image_alt,name)},
        banner:{url:bannerUrl,alt:cleanText(raw.banner_image_alt,cleanText(raw.cover_image_alt,name))},
        gallery:[],
        highlights:cleanTextList(raw.highlights),
        whatToExpect:cleanTextList(raw.what_to_expect),
        eligibility:cleanTextList(raw.eligibility),
        prerequisites:cleanTextList(raw.prerequisites),
        rules:cleanTextList(raw.rules),
        prizes:cleanPrizes(raw.prizes),
        faqs:cleanFaqs(raw.faqs),
        schedules,
        organizers:cleanPeople(raw.organizers,(item)=>{
            return {id:cleanText(item.id),name:cleanText(item.name),type:cleanText(item.org_type)};
        }),
        coordinators:cleanPeople(raw.coordinators,(item)=>{
            return {id:cleanText(item.id),name:cleanText(item.name),role:cleanText(item.role),contact:cleanText(item.contact)};
        }),
        // True once we have the full detail payload (description, rules, …).
        hasDetails:typeof raw.description==='string'||Array.isArray(raw.schedules),
        searchText:(name+' '+category+' '+track.label+' '+tags.join(' ')+' '+blurb).toLowerCase()
    };

    if(Array.isArray(raw.gallery_images)){
        for(let i=0;i<raw.gallery_images.length;i++){
            const url=cleanUrl(raw.gallery_images[i]);
            if(url){
                event.gallery.push(url);
            }
        }
    }

    let prizePool=0;
    for(let i=0;i<event.prizes.length;i++){
        prizePool=prizePool+(event.prizes[i].amount||0);
    }
    event.prizePool=prizePool;

    return event;
};

// Soonest first; events without a date go last; ties broken by name.
export const compareByStart=(a,b)=>{
    if(a.start===null&&b.start===null){
        return a.name.localeCompare(b.name);
    }
    if(a.start===null){
        return 1;
    }
    if(b.start===null){
        return -1;
    }
    if(a.start!==b.start){
        return a.start-b.start;
    }
    return a.name.localeCompare(b.name);
};

// Raw list payload → clean array. Throws bad_data if the shape is wrong.
export const normalizeEventList=(payload,nowMs)=>{
    if(!payload||typeof payload!=='object'||!Array.isArray(payload.events)){
        throw createRequestError('bad_data','The events list was not in the expected format');
    }
    const result=[];
    const seen=new Set();
    for(let i=0;i<payload.events.length;i++){
        const event=normalizeEvent(payload.events[i],nowMs);
        if(event&&!seen.has(event.id)){
            seen.add(event.id);
            result.push(event);
        }
    }
    result.sort(compareByStart);
    return result;
};

export const normalizeEventDetail=(payload,nowMs)=>{
    if(!payload||typeof payload!=='object'||!payload.event||typeof payload.event!=='object'){
        throw createRequestError('bad_data','The event was not in the expected format');
    }
    const event=normalizeEvent(payload.event,nowMs);
    if(!event){
        throw createRequestError('bad_data','The event was not in the expected format');
    }
    return event;
};

// ---------- loading: list ----------

// Raw API payloads are what we cache, so cleaning (and "is it past?") is
// always recomputed against the current time when read back.
let listRequest=null;

const loadFallbackList=async ()=>{
    try{
        const payload=await requestJson(FALLBACK_LIST_URL,{simulate:false});
        const events=normalizeEventList(payload);
        if(events.length===0){
            return null;
        }
        let generatedAt=null;
        if(payload&&typeof payload.generatedAt==='string'){
            generatedAt=parseDateTime(payload.generatedAt);
        }
        return {events,generatedAt};
    }
    catch(error){
        return null;
    }
};

const fetchListFromNetwork=(onAttempt)=>{
    // Several parts of the page may ask at once: share one request.
    if(listRequest){
        return listRequest;
    }
    listRequest=requestJson(API_BASE_URL+'/events',{onAttempt,simulateEmpty:{events:[]}})
        .then((payload)=>{
            const events=normalizeEventList(payload);
            // A simulated empty answer must never overwrite the real cached list.
            if(getSimulateMode()!=='empty'){
                writeCache(LIST_CACHE_KEY,payload);
            }
            return events;
        })
        .finally(()=>{
            listRequest=null;
        });
    return listRequest;
};

// Instant, no network: whatever we already have (or null).
export const getCachedEvents=()=>{
    const cached=readCache(LIST_CACHE_KEY);
    if(!cached){
        return null;
    }
    try{
        return {events:normalizeEventList(cached.data),savedAt:cached.savedAt,isFresh:cached.isFresh};
    }
    catch(error){
        return null;
    }
};

// Returns { events, source:'network'|'cache'|'fallback', savedAt, error }
// Only throws if there is truly nothing to show.
export const getAllEvents=async (options)=>{
    const settings=options||{};
    const cached=getCachedEvents();
    // While the failure simulator is on, always hit the (simulated) network,
    // otherwise a fresh cache would hide the simulated failure.
    const mustAskNetwork=settings.force||getSimulateMode()!==null;

    if(cached&&cached.isFresh&&!mustAskNetwork){
        return {events:cached.events,source:'cache',savedAt:cached.savedAt,error:null};
    }

    try{
        const events=await fetchListFromNetwork(settings.onAttempt);
        return {events,source:'network',savedAt:Date.now(),error:null};
    }
    catch(error){
        if(cached){
            return {events:cached.events,source:'cache',savedAt:cached.savedAt,error};
        }
        const fallback=await loadFallbackList();
        if(fallback){
            return {events:fallback.events,source:'fallback',savedAt:fallback.generatedAt,error};
        }
        throw error;
    }
};

// ---------- loading: one event ----------

const ID_PATTERN=/^[A-Za-z0-9-]{1,80}$/;

export const isValidEventId=(id)=>{
    return typeof id==='string'&&ID_PATTERN.test(id);
};

// The short version from the list, if we have one. Lets the page show something instantly.
export const getEventSummaryById=(id)=>{
    const cached=getCachedEvents();
    if(!cached){
        return null;
    }
    for(let i=0;i<cached.events.length;i++){
        if(cached.events[i].id===id){
            return cached.events[i];
        }
    }
    return null;
};

export const getCachedEventDetail=(id)=>{
    if(!isValidEventId(id)){
        return null;
    }
    const cached=readDetailCache(id);
    if(!cached){
        return null;
    }
    try{
        return {event:normalizeEventDetail(cached.data),savedAt:cached.savedAt,isFresh:cached.isFresh};
    }
    catch(error){
        return null;
    }
};

const loadFallbackDetail=async (id)=>{
    try{
        const payload=await requestJson(FALLBACK_DETAIL_URL+id+'.json',{simulate:false});
        return normalizeEventDetail(payload);
    }
    catch(error){
        return null;
    }
};

const findInFallbackList=async (id)=>{
    const fallback=await loadFallbackList();
    if(!fallback){
        return null;
    }
    for(let i=0;i<fallback.events.length;i++){
        if(fallback.events[i].id===id){
            return fallback.events[i];
        }
    }
    return null;
};

// Returns { event, source, savedAt, partial, error }.
// partial=true means only the short summary is available (details failed to load).
// Throws not_found for unknown ids, or the network error if there's nothing at all to show.
export const getEventById=async (id,options)=>{
    const settings=options||{};
    if(!isValidEventId(id)){
        throw createRequestError('not_found','This event id is not valid',404);
    }
    const cached=getCachedEventDetail(id);
    const mustAskNetwork=settings.force||getSimulateMode()!==null;
    if(cached&&cached.isFresh&&!mustAskNetwork){
        return {event:cached.event,source:'cache',savedAt:cached.savedAt,partial:false,error:null};
    }

    try{
        const payload=await requestJson(API_BASE_URL+'/events/'+encodeURIComponent(id),{
            signal:settings.signal,
            onAttempt:settings.onAttempt
        });
        const event=normalizeEventDetail(payload);
        writeDetailCache(id,payload);
        return {event,source:'network',savedAt:Date.now(),partial:false,error:null};
    }
    catch(error){
        if(error.kind==='aborted'||error.kind==='not_found'){
            throw error;
        }
        if(cached){
            return {event:cached.event,source:'cache',savedAt:cached.savedAt,partial:false,error};
        }
        const fallbackDetail=await loadFallbackDetail(id);
        if(fallbackDetail){
            return {event:fallbackDetail,source:'fallback',savedAt:null,partial:false,error};
        }
        let summary=getEventSummaryById(id);
        if(!summary){
            summary=await findInFallbackList(id);
        }
        if(summary){
            return {event:summary,source:'summary',savedAt:null,partial:true,error};
        }
        throw error;
    }
};
