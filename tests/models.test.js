import {describe,it,expect,beforeEach,afterEach,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {getTrackForCategory} from '../src/config/tracks';
import {getPhrasesForCategory,GENERAL_PHRASES} from '../src/config/loadingPhrases';
import {normalizeEvent,normalizeEventList,normalizeEventDetail,getAllEvents,getEventById,getCachedEvents,isValidEventId,toIstTime} from '../src/models/eventModel';
import {requestJson} from '../src/models/httpClient';
import {clearAllCaches,readCache,writeCache} from '../src/models/cacheStore';
import {setSimulateModeForTests} from '../src/models/simulator';
import {formatPrice,formatTeamSize,formatDateRange,formatTime,formatShortDate,getIstDateKey,formatRelative,getCountdownParts} from '../src/utils/formatters';
import {getSizedImageUrl,buildSrcSet} from '../src/utils/images';

const fallbackPayload=JSON.parse(readFileSync(path.join(process.cwd(),'public','fallback','events.json'),'utf8'));
const listPayload={events:fallbackPayload.events};
const NOW=Date.parse('2026-10-14T10:00:00+05:30');

const jsonResponse=(body,status)=>{
    return new Response(JSON.stringify(body),{status:status||200,headers:{'Content-Type':'application/json'}});
};

const setOnline=(value)=>{
    Object.defineProperty(window.navigator,'onLine',{configurable:true,get:()=>value});
};

beforeEach(()=>{
    clearAllCaches();
    setSimulateModeForTests(null);
    setOnline(true);
});

afterEach(()=>{
    vi.restoreAllMocks();
    vi.useRealTimers();
});

describe('tracks',()=>{
    it('puts every real category into the intended track',()=>{
        const expected={
            'Coding':'code','Hackathon':'code','Artificial Intelligence':'code','Web Development':'code','Cybersecurity':'code',
            'Robotics':'machines','Engineering':'machines','Aerial Robotics':'machines','Robotics & Electronics':'machines',
            'Dance':'stage','Music':'stage','Theatre':'stage',
            'Debate & Literary':'words','Literary Arts':'words','Entrepreneurship':'words','Quiz & Culture':'words',
            'Photography':'visual','Design & Product':'visual','Visual Arts':'visual','Film & Media':'visual','Art & Design':'visual','Arts & Craft':'visual','Design':'visual',
            'Sustainability':'explore','Gaming':'explore','Food & Culture':'explore','Astronomy':'explore'
        };
        const categories=Object.keys(expected);
        for(let i=0;i<categories.length;i++){
            expect(getTrackForCategory(categories[i]).id,categories[i]).toBe(expected[categories[i]]);
        }
    });

    it('sends unknown or empty categories to "More"',()=>{
        expect(getTrackForCategory('Underwater Basket Weaving').id).toBe('other');
        expect(getTrackForCategory('').id).toBe('other');
        expect(getTrackForCategory(null).id).toBe('other');
        expect(getTrackForCategory(42).id).toBe('other');
    });

    it('covers all 30 events with no event left in "More"',()=>{
        const events=normalizeEventList(listPayload,NOW);
        for(let i=0;i<events.length;i++){
            expect(events[i].track.id,events[i].category).not.toBe('other');
        }
    });
});

describe('loading phrases',()=>{
    it('matches categories and falls back to general lines',()=>{
        expect(getPhrasesForCategory('Hackathon')[0]).toContain('coffee');
        expect(getPhrasesForCategory('Literary Arts')[0]).toContain('words');
        expect(getPhrasesForCategory('Aerial Robotics')[0]).toContain('airspace');
        expect(getPhrasesForCategory('Something new')).toBe(GENERAL_PHRASES);
        expect(getPhrasesForCategory(undefined)).toBe(GENERAL_PHRASES);
    });
});

describe('normalizeEvent',()=>{
    it('cleans all 30 real events and sorts them by start time',()=>{
        const events=normalizeEventList(listPayload,NOW);
        expect(events.length).toBe(30);
        for(let i=1;i<events.length;i++){
            expect(events[i].start).toBeGreaterThanOrEqual(events[i-1].start);
        }
        expect(events[0].name).toBe('CodeCurrent: Monsoon Algorithm Round');
    });

    it('works out seats, sold-out and past correctly',()=>{
        const events=normalizeEventList(listPayload,NOW);
        const byName={};
        for(let i=0;i<events.length;i++){
            byName[events[i].name]=events[i];
        }
        const civic=byName['CivicForge 24: Build for the City'];
        expect(civic.seatsLeft).toBe(6);
        expect(civic.canRegister).toBe(true);
        expect(civic.isPast).toBe(false);
        expect(civic.end-civic.start).toBe(24*60*60*1000);

        const rag=byName['Grounded Answers: Build Your First RAG Assistant'];
        expect(rag.registrationStatus).toBe('SOLD_OUT');
        expect(rag.canRegister).toBe(false);

        expect(byName['CodeCurrent: Monsoon Algorithm Round'].isPast).toBe(true);
        // Closed by organisers but still in the future: not past, but can't register.
        const repair=byName['Second Life: Campus Repair Café'];
        expect(repair.isPast).toBe(false);
        expect(repair.canRegister).toBe(false);
    });

    it('marks an event past once it has ended, even if the API still says ACTIVE',()=>{
        const raw=listPayload.events[3];
        const afterFest=Date.parse('2026-12-01T00:00:00+05:30');
        expect(normalizeEvent(raw,NOW).isPast).toBe(false);
        expect(normalizeEvent(raw,afterFest).isPast).toBe(true);
        expect(normalizeEvent(raw,afterFest).canRegister).toBe(false);
    });

    it('closes registration once the deadline passes',()=>{
        const raw=listPayload.events[3];
        const afterDeadline=Date.parse('2026-11-11T00:00:00+05:30');
        const event=normalizeEvent(raw,afterDeadline);
        expect(event.deadlinePassed).toBe(true);
        expect(event.canRegister).toBe(false);
    });

    it('never crashes on garbage and drops events without an id',()=>{
        expect(normalizeEvent(null)).toBe(null);
        expect(normalizeEvent('hello')).toBe(null);
        expect(normalizeEvent({})).toBe(null);
        expect(normalizeEvent({id:'  '})).toBe(null);
        const minimal=normalizeEvent({id:'abc'},NOW);
        expect(minimal.name).toBe('Untitled event');
        expect(minimal.start).toBe(null);
        expect(minimal.price).toBe(null);
        expect(minimal.seatsLeft).toBe(null);
        expect(minimal.tags).toEqual([]);
        expect(minimal.track.id).toBe('other');
        expect(minimal.cover.url).toBe(null);
        expect(minimal.isPast).toBe(false);
    });

    it('repairs odd values instead of trusting them',()=>{
        const event=normalizeEvent({
            id:'x1',
            name:'  Spaced  ',
            price:-50,
            total_seats:10,
            seats_filled:99,
            min_teamsize:4,
            max_teamsize:2,
            registration_status:'open',
            event_status:'weird',
            cover_image_url:'javascript:alert(1)',
            tags:['ok','',null,5,'  '],
            schedule_summary:{start_date:'2026-13-45',start_time:'99:99'}
        },NOW);
        expect(event.name).toBe('Spaced');
        expect(event.price).toBe(null);
        expect(event.seatsFilled).toBe(10);
        expect(event.seatsLeft).toBe(0);
        // OPEN with no seats left is really sold out.
        expect(event.registrationStatus).toBe('SOLD_OUT');
        expect(event.maxTeam).toBe(4);
        expect(event.status).toBe('ACTIVE');
        expect(event.cover.url).toBe(null);
        expect(event.tags).toEqual(['ok','5']);
    });

    it('reads strings that hold numbers',()=>{
        const event=normalizeEvent({id:'n1',price:'300',total_seats:'20',seats_filled:'5'},NOW);
        expect(event.price).toBe(300);
        expect(event.seatsLeft).toBe(15);
    });

    it('rejects impossible dates instead of rolling them over',()=>{
        expect(toIstTime('2026-02-30','10:00')).toBe(null);
        expect(toIstTime('2028-02-29','10:00')).toBe(Date.parse('2028-02-29T10:00:00+05:30'));
        expect(toIstTime('2026-13-01','10:00')).toBe(null);
        expect(toIstTime('not-a-date','10:00')).toBe(null);
        expect(toIstTime('2026-11-13','25:00')).toBe(Date.parse('2026-11-13T00:00:00+05:30'));
    });

    it('uses schedules when the summary has no dates, and keeps overnight slots sane',()=>{
        const event=normalizeEvent({
            id:'s1',
            description:'x',
            schedules:[
                {event_date:'2026-11-14',start_time:'00:00',end_time:'18:00',venue:'Lab'},
                {event_date:'2026-11-13',start_time:'18:00',end_time:'23:59',venue:'Lab'},
                {event_date:'bad',start_time:'10:00'},
                null
            ]
        },NOW);
        expect(event.schedules.length).toBe(2);
        expect(event.schedules[0].date).toBe('2026-11-13');
        expect(event.start).toBe(Date.parse('2026-11-13T18:00:00+05:30'));
        expect(event.end).toBe(Date.parse('2026-11-14T18:00:00+05:30'));
        expect(event.hasDetails).toBe(true);
    });

    it('removes duplicate ids from the list',()=>{
        const events=normalizeEventList({events:[listPayload.events[0],listPayload.events[0],listPayload.events[1]]},NOW);
        expect(events.length).toBe(2);
    });

    it('throws bad_data for the wrong payload shape',()=>{
        expect(()=>normalizeEventList(null)).toThrow();
        expect(()=>normalizeEventList({events:'nope'})).toThrow();
        try{
            normalizeEventList({data:[]});
        }
        catch(error){
            expect(error.kind).toBe('bad_data');
        }
        expect(()=>normalizeEventDetail({events:[]})).toThrow();
    });

    it('cleans prizes, faqs and people from a detail payload',()=>{
        const event=normalizeEventDetail({event:{
            id:'d1',
            description:'Long text',
            prizes:[{rank:2,title:'Second',amount:4000},{rank:1,title:'First',amount:8000},{title:'',amount:null},'junk'],
            faqs:[{question:'Q?',answer:'A.'},{question:'',answer:'x'}],
            organizers:[{id:'o',name:'Club',org_type:'CLUB'},{name:''}],
            coordinators:[{id:'c',name:'Kavya',role:'Lead',contact:'k@example.org'}],
            gallery_images:['https://images.pexels.com/a.jpg','ftp://bad']
        }},NOW);
        expect(event.prizes.map((p)=>p.title)).toEqual(['First','Second']);
        expect(event.prizePool).toBe(12000);
        expect(event.faqs.length).toBe(1);
        expect(event.organizers.length).toBe(1);
        expect(event.coordinators[0].contact).toBe('k@example.org');
        expect(event.gallery).toEqual(['https://images.pexels.com/a.jpg']);
    });

    it('validates ids',()=>{
        expect(isValidEventId('dff53692-cd0c-5464-9282-d90b791d9ecb')).toBe(true);
        expect(isValidEventId('../../etc')).toBe(false);
        expect(isValidEventId('')).toBe(false);
        expect(isValidEventId('a b')).toBe(false);
        expect(isValidEventId(undefined)).toBe(false);
    });
});

describe('formatters',()=>{
    it('formats prices with the right unit',()=>{
        expect(formatPrice(0,true,1)).toEqual({amount:'Free',unit:'',isFree:true});
        expect(formatPrice(800,false,4)).toEqual({amount:'₹800',unit:'per team',isFree:false});
        expect(formatPrice(250,true,3).unit).toBe('per person');
        expect(formatPrice(1200,false,1)).toEqual({amount:'₹1,200',unit:'',isFree:false});
        expect(formatPrice(100000,false,2).amount).toBe('₹1,00,000');
        expect(formatPrice(null,false,2).amount).toBe('Fee TBA');
    });

    it('describes team sizes in plain words',()=>{
        expect(formatTeamSize(1,1)).toBe('Solo');
        expect(formatTeamSize(2,2)).toBe('Duo');
        expect(formatTeamSize(3,3)).toBe('Teams of 3');
        expect(formatTeamSize(2,4)).toBe('Teams of 2–4');
        expect(formatTeamSize(1,3)).toBe('Solo or teams up to 3');
        expect(formatTeamSize(null,null)).toBe('');
        expect(formatTeamSize(null,5)).toBe('Teams of 5');
    });

    it('always shows IST, whatever the visitor’s timezone',()=>{
        const start=Date.parse('2026-11-13T18:00:00+05:30');
        const end=Date.parse('2026-11-15T17:00:00+05:30');
        expect(formatShortDate(start)).toBe('Fri 13 Nov');
        expect(formatTime(start)).toMatch(/^6:00\s?PM$/);
        expect(getIstDateKey(Date.parse('2026-11-13T23:30:00+05:30'))).toBe('2026-11-13');
        expect(formatDateRange(start,end)).toBe('Fri 13 – Sun 15 Nov');
        expect(formatDateRange(start,start)).toBe('Fri 13 Nov');
        expect(formatDateRange(Date.parse('2026-10-31T10:00:00+05:30'),Date.parse('2026-11-02T10:00:00+05:30'))).toBe('Sat 31 Oct – Mon 2 Nov');
        expect(formatDateRange(null,null)).toBe('Date to be announced');
    });

    it('describes relative time and countdowns',()=>{
        const now=NOW;
        expect(formatRelative(now+3*24*60*60*1000,now)).toBe('in 3 days');
        expect(formatRelative(now-2*60*1000,now)).toBe('2 min ago');
        expect(formatRelative(now+10*1000,now)).toBe('just now');
        expect(formatRelative(now+60*60*1000,now)).toBe('in 1 hour');
        const parts=getCountdownParts(now+(2*24+3)*60*60*1000+65*1000,now);
        expect(parts).toEqual({days:2,hours:3,minutes:1,seconds:5,isOver:false});
        expect(getCountdownParts(now-1000,now).isOver).toBe(true);
    });
});

describe('images',()=>{
    it('asks Pexels for the size we need and leaves other hosts alone',()=>{
        const url='https://images.pexels.com/photos/1/p.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop';
        const sized=new URL(getSizedImageUrl(url,400,267));
        expect(sized.searchParams.get('w')).toBe('400');
        expect(sized.searchParams.get('h')).toBe('267');
        expect(getSizedImageUrl('https://example.com/a.jpg',400,200)).toBe('https://example.com/a.jpg');
        expect(getSizedImageUrl('javascript:alert(1)',400,200)).toBe(null);
        expect(buildSrcSet(url,[400,800],2/3)).toContain('400w');
        expect(buildSrcSet(null,[400],1)).toBe(undefined);
    });
});

describe('requestJson',()=>{
    it('retries server errors and succeeds on the third try',async ()=>{
        vi.useFakeTimers();
        const fetchMock=vi.fn()
            .mockResolvedValueOnce(jsonResponse({},500))
            .mockResolvedValueOnce(jsonResponse({},503))
            .mockResolvedValueOnce(jsonResponse({ok:true}));
        vi.stubGlobal('fetch',fetchMock);
        const attempts=[];
        const promise=requestJson('https://api.test/x',{onAttempt:(n,max)=>attempts.push(n+'/'+max)});
        await vi.runAllTimersAsync();
        await expect(promise).resolves.toEqual({ok:true});
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(attempts).toEqual(['1/3','2/3','3/3']);
    });

    it('gives up after 3 failed tries with the right error kind',async ()=>{
        vi.useFakeTimers();
        const fetchMock=vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
        vi.stubGlobal('fetch',fetchMock);
        const promise=requestJson('https://api.test/x');
        const assertion=expect(promise).rejects.toMatchObject({kind:'network'});
        await vi.runAllTimersAsync();
        await assertion;
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('does not retry a 404',async ()=>{
        const fetchMock=vi.fn().mockResolvedValue(jsonResponse({error:'not_found'},404));
        vi.stubGlobal('fetch',fetchMock);
        await expect(requestJson('https://api.test/x')).rejects.toMatchObject({kind:'not_found',status:404});
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('times out a request that never answers',async ()=>{
        vi.useFakeTimers();
        const fetchMock=vi.fn((url,init)=>{
            return new Promise((resolve,reject)=>{
                init.signal.addEventListener('abort',()=>{
                    reject(new DOMException('Aborted','AbortError'));
                });
            });
        });
        vi.stubGlobal('fetch',fetchMock);
        const promise=requestJson('https://api.test/x');
        const assertion=expect(promise).rejects.toMatchObject({kind:'timeout'});
        await vi.runAllTimersAsync();
        await assertion;
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('fails instantly when the browser is offline (no waiting, no retries)',async ()=>{
        setOnline(false);
        const fetchMock=vi.fn();
        vi.stubGlobal('fetch',fetchMock);
        await expect(requestJson('https://api.test/x')).rejects.toMatchObject({kind:'offline'});
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('stops quietly when the caller cancels',async ()=>{
        const controller=new AbortController();
        const fetchMock=vi.fn((url,init)=>{
            return new Promise((resolve,reject)=>{
                init.signal.addEventListener('abort',()=>{
                    reject(new DOMException('Aborted','AbortError'));
                });
            });
        });
        vi.stubGlobal('fetch',fetchMock);
        const promise=requestJson('https://api.test/x',{signal:controller.signal});
        controller.abort();
        await expect(promise).rejects.toMatchObject({kind:'aborted'});
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('treats broken JSON as bad_data and retries it',async ()=>{
        vi.useFakeTimers();
        const fetchMock=vi.fn()
            .mockResolvedValueOnce(new Response('<html>oops',{status:200}))
            .mockResolvedValueOnce(jsonResponse({fine:1}));
        vi.stubGlobal('fetch',fetchMock);
        const promise=requestJson('https://api.test/x');
        await vi.runAllTimersAsync();
        await expect(promise).resolves.toEqual({fine:1});
    });

    it('obeys the simulator',async ()=>{
        const fetchMock=vi.fn();
        vi.stubGlobal('fetch',fetchMock);
        setSimulateModeForTests('offline');
        await expect(requestJson('https://api.test/x')).rejects.toMatchObject({kind:'offline'});
        setSimulateModeForTests('empty');
        await expect(requestJson('https://api.test/x',{simulateEmpty:{events:[]}})).resolves.toEqual({events:[]});
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe('getAllEvents',()=>{
    it('loads from the network, then serves the cache',async ()=>{
        const fetchMock=vi.fn().mockResolvedValue(jsonResponse(listPayload));
        vi.stubGlobal('fetch',fetchMock);
        const first=await getAllEvents();
        expect(first.source).toBe('network');
        expect(first.events.length).toBe(30);
        const second=await getAllEvents();
        expect(second.source).toBe('cache');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('shares one request when asked several times at once',async ()=>{
        const fetchMock=vi.fn().mockResolvedValue(jsonResponse(listPayload));
        vi.stubGlobal('fetch',fetchMock);
        const results=await Promise.all([getAllEvents(),getAllEvents(),getAllEvents()]);
        expect(results[2].events.length).toBe(30);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('falls back to the last good copy when the API fails',async ()=>{
        writeCache('events',listPayload);
        const fetchMock=vi.fn().mockResolvedValue(jsonResponse({},500));
        vi.stubGlobal('fetch',fetchMock);
        vi.useFakeTimers();
        const promise=getAllEvents({force:true});
        await vi.runAllTimersAsync();
        const result=await promise;
        expect(result.source).toBe('cache');
        expect(result.error.kind).toBe('server');
        expect(result.events.length).toBe(30);
    });

    it('uses the bundled copy on a first visit when the API is down',async ()=>{
        const fetchMock=vi.fn((url)=>{
            if(String(url).includes('/fallback/')){
                return Promise.resolve(jsonResponse(fallbackPayload));
            }
            return Promise.reject(new TypeError('Failed to fetch'));
        });
        vi.stubGlobal('fetch',fetchMock);
        vi.useFakeTimers();
        const promise=getAllEvents();
        await vi.runAllTimersAsync();
        const result=await promise;
        expect(result.source).toBe('fallback');
        expect(result.savedAt).toBe(Date.parse(fallbackPayload.generatedAt));
        expect(result.events.length).toBe(30);
    });

    it('throws when there is truly nothing to show',async ()=>{
        vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
        vi.useFakeTimers();
        const promise=getAllEvents();
        const assertion=expect(promise).rejects.toMatchObject({kind:'network'});
        await vi.runAllTimersAsync();
        await assertion;
    });

    it('never lets a simulated empty answer overwrite the real cache',async ()=>{
        writeCache('events',listPayload);
        setSimulateModeForTests('empty');
        vi.stubGlobal('fetch',vi.fn());
        const result=await getAllEvents();
        expect(result.events.length).toBe(0);
        setSimulateModeForTests(null);
        expect(getCachedEvents().events.length).toBe(30);
    });

    it('keeps working when localStorage is blocked',async ()=>{
        vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{
            throw new Error('QuotaExceededError');
        });
        vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{
            throw new Error('SecurityError');
        });
        vi.stubGlobal('fetch',vi.fn().mockResolvedValue(jsonResponse(listPayload)));
        const result=await getAllEvents();
        expect(result.events.length).toBe(30);
        expect(readCache('events')).not.toBe(null);
    });

    it('ignores a corrupted cache entry',async ()=>{
        window.localStorage.setItem('r72:v1:events','{not json');
        vi.stubGlobal('fetch',vi.fn().mockResolvedValue(jsonResponse(listPayload)));
        const result=await getAllEvents();
        expect(result.source).toBe('network');
    });
});

describe('getEventById',()=>{
    const id=listPayload.events[10].id;

    it('rejects invalid ids without touching the network',async ()=>{
        const fetchMock=vi.fn();
        vi.stubGlobal('fetch',fetchMock);
        await expect(getEventById('../secret')).rejects.toMatchObject({kind:'not_found'});
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('passes a real 404 through as not_found',async ()=>{
        vi.stubGlobal('fetch',vi.fn().mockResolvedValue(jsonResponse({error:'not_found'},404)));
        await expect(getEventById('nope-123')).rejects.toMatchObject({kind:'not_found'});
    });

    it('loads and caches the full event',async ()=>{
        const detail={event:{...listPayload.events[10],description:'Full text',schedules:[]}};
        const fetchMock=vi.fn().mockResolvedValue(jsonResponse(detail));
        vi.stubGlobal('fetch',fetchMock);
        const first=await getEventById(id);
        expect(first.source).toBe('network');
        expect(first.event.description).toBe('Full text');
        const second=await getEventById(id);
        expect(second.source).toBe('cache');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('shows the short summary when details fail but the list is known',async ()=>{
        writeCache('events',listPayload);
        vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
        vi.useFakeTimers();
        const promise=getEventById(id);
        await vi.runAllTimersAsync();
        const result=await promise;
        expect(result.partial).toBe(true);
        expect(result.event.id).toBe(id);
        expect(result.error.kind).toBe('network');
    });
});
