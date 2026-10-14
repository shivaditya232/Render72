import {describe,it,expect,beforeEach} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {normalizeEventList,normalizeEvent} from '../src/models/eventModel';
import {getAvailability} from '../src/utils/availability';
import {parseFilterState,serializeFilterState,createDefaultState,applyFilters,getFacetCounts,getWhenCounts,getDateBuckets,suggestRelaxation,toggleFacetValue,getActiveFilters,removeActiveFilter,normalizeSearchText} from '../src/utils/filterEvents';
import {findClashes,groupByDay,getSlots} from '../src/utils/schedule';
import {buildCalendarFile,escapeIcsText,foldIcsLine} from '../src/utils/calendarFile';
import {getPlanIds,togglePlan,isInPlan,clearPlan,resetPlanForTests,subscribeToPlan} from '../src/models/planStore';

const payload=JSON.parse(readFileSync(path.join(process.cwd(),'public','fallback','events.json'),'utf8'));
const NOW=Date.parse('2026-10-14T10:00:00+05:30');
const events=normalizeEventList({events:payload.events},NOW);
const byName=(start)=>events.find((event)=>event.name.startsWith(start));

describe('availability',()=>{
    it('labels every state correctly',()=>{
        expect(getAvailability(byName('CodeCurrent'),NOW).key).toBe('ended');
        expect(getAvailability(byName('Second Life'),NOW).key).toBe('closed');
        expect(getAvailability(byName('Grounded Answers'),NOW).key).toBe('sold_out');
        // 22/24 filled → 2 left → "Only 2 seats left"
        const track=getAvailability(byName('TrackTact'),NOW);
        expect(track.key).toBe('few');
        expect(track.label).toBe('Only 2 seats left');
        expect(getAvailability(byName('Earth in Your Hands'),NOW).label).toBe('Only 1 seat left');
        expect(getAvailability(byName('Access by Design'),NOW).key).toBe('open');
    });

    it('says closing soon inside the last week before the deadline',()=>{
        const event=byName('Access by Design');
        const weekBefore=Date.parse('2026-11-08T12:00:00+05:30');
        const fresh=normalizeEvent(payload.events.find((e)=>e.id===event.id),weekBefore);
        expect(getAvailability(fresh,weekBefore).key).toBe('closing');
    });

    it('treats a passed deadline as registration closed',()=>{
        const raw=payload.events.find((e)=>e.id===byName('Access by Design').id);
        const after=Date.parse('2026-11-14T00:00:00+05:30');
        expect(getAvailability(normalizeEvent(raw,after),after).key).toBe('reg_closed');
    });
});

describe('filter state and URL',()=>{
    it('round-trips through the URL and ignores junk',()=>{
        const params=new URLSearchParams('q=robot&when=past&date=2026-11-13&sort=price&track=code,stage,bogus&price=free&open=yes&evil=<script>');
        const state=parseFilterState(params);
        expect(state.q).toBe('robot');
        expect(state.when).toBe('past');
        expect(state.date).toBe('2026-11-13');
        expect(state.sort).toBe('price');
        expect(state.facets.track).toEqual(['code','stage']);
        expect(state.facets.price).toEqual(['free']);
        expect(state.facets.open).toEqual(['yes']);
        const back=serializeFilterState(state);
        expect(back).toEqual({q:'robot',when:'past',date:'2026-11-13',sort:'price',track:'code,stage',price:'free',open:'yes'});
    });

    it('rejects bad dates, sorts and tabs',()=>{
        const state=parseFilterState(new URLSearchParams('date=13-11-2026&sort=random&when=later'));
        expect(state).toEqual(createDefaultState());
        expect(serializeFilterState(createDefaultState())).toEqual({});
    });

    it('caps very long search text',()=>{
        const state=parseFilterState(new URLSearchParams('q='+'a'.repeat(500)));
        expect(state.q.length).toBe(80);
    });
});

describe('applyFilters',()=>{
    it('shows upcoming by default and past on the past tab',()=>{
        const state=createDefaultState();
        expect(applyFilters(events,state).length).toBe(28);
        const past=applyFilters(events,{...state,when:'past'});
        expect(past.map((e)=>e.name)).toEqual(['Between Lectures: Campus Photo Walk','CodeCurrent: Monsoon Algorithm Round']);
    });

    it('searches name, category, track and tags, ignoring case and accents',()=>{
        const state=createDefaultState();
        expect(applyFilters(events,{...state,q:'cafe'}).length).toBe(1);
        expect(applyFilters(events,{...state,q:'VALORANT'})[0].name).toContain('SpikeCircuit');
        expect(applyFilters(events,{...state,q:'  robotics  '}).length).toBeGreaterThan(0);
        expect(applyFilters(events,{...state,q:'robot drone'}).length).toBe(1);
        expect(applyFilters(events,{...state,q:'zzzz'}).length).toBe(0);
        expect(normalizeSearchText('Café')).toBe('cafe');
    });

    it('ORs options within a facet and ANDs across facets',()=>{
        let state=createDefaultState();
        state=toggleFacetValue(state,'track','stage');
        const stage=applyFilters(events,state).length;
        state=toggleFacetValue(state,'track','words');
        const stageOrWords=applyFilters(events,state).length;
        expect(stageOrWords).toBeGreaterThan(stage);
        state=toggleFacetValue(state,'price','free');
        const freeOnes=applyFilters(events,state);
        for(let i=0;i<freeOnes.length;i++){
            expect(freeOnes[i].price).toBe(0);
            expect(['stage','words']).toContain(freeOnes[i].track.id);
        }
    });

    it('filters by day in IST',()=>{
        const state={...createDefaultState(),date:'2026-11-13'};
        const result=applyFilters(events,state);
        expect(result.length).toBe(8);
    });

    it('"Open to register" hides sold out and closed events',()=>{
        const state=toggleFacetValue(createDefaultState(),'open','yes');
        const result=applyFilters(events,state);
        for(let i=0;i<result.length;i++){
            expect(result[i].canRegister).toBe(true);
        }
        expect(result.find((e)=>e.name.startsWith('Grounded'))).toBeUndefined();
    });

    it('team filters match what people actually mean',()=>{
        const solo=applyFilters(events,toggleFacetValue(createDefaultState(),'team','solo'));
        for(let i=0;i<solo.length;i++){
            expect(solo[i].minTeam).toBe(1);
        }
        const duo=applyFilters(events,toggleFacetValue(createDefaultState(),'team','duo'));
        expect(duo.find((e)=>e.name.startsWith('Chowk'))).toBeDefined();
        expect(duo.find((e)=>e.name.startsWith('Concrete Counts'))).toBeUndefined();
    });

    it('sorts by every option without losing events',()=>{
        const base=createDefaultState();
        const soonest=applyFilters(events,base);
        const closing=applyFilters(events,{...base,sort:'closing'});
        const seats=applyFilters(events,{...base,sort:'seats'});
        const price=applyFilters(events,{...base,sort:'price'});
        expect(closing.length).toBe(soonest.length);
        expect(seats.length).toBe(soonest.length);
        expect(price[0].price).toBe(0);
        for(let i=1;i<price.length;i++){
            expect(price[i].price).toBeGreaterThanOrEqual(price[i-1].price);
        }
        // Registrable events with the fewest seats come first.
        expect(seats[0].canRegister).toBe(true);
        expect(seats[0].seatsLeft).toBe(1);
        // Closing soonest: the first registrable deadline.
        expect(closing[0].canRegister).toBe(true);
        expect(closing[0].name).toContain('Ampersand');
    });
});

describe('live counts',()=>{
    it('counts each option as if it were the only one chosen in its facet',()=>{
        const state=toggleFacetValue(createDefaultState(),'price','free');
        const counts=getFacetCounts(events,state);
        // Track counts respect the Free filter…
        let trackTotal=0;
        const trackCounts=Object.values(counts.track);
        for(let i=0;i<trackCounts.length;i++){
            trackTotal=trackTotal+trackCounts[i];
        }
        expect(trackTotal).toBe(applyFilters(events,state).length);
        // …but price counts ignore their own facet, so "Under ₹500" stays clickable.
        expect(counts.price.under500).toBeGreaterThan(counts.price.free);
    });

    it('counts upcoming vs past and builds the date strip',()=>{
        const state=createDefaultState();
        expect(getWhenCounts(events,state)).toEqual({upcoming:28,past:2});
        const buckets=getDateBuckets(events,state);
        expect(buckets.map((b)=>b.key)).toEqual(['2026-10-18','2026-11-13','2026-11-14','2026-11-15']);
        expect(buckets.map((b)=>b.count)).toEqual([1,8,10,9]);
        const pastBuckets=getDateBuckets(events,{...state,when:'past'});
        expect(pastBuckets.map((b)=>b.key)).toEqual(['2026-09-27','2026-09-26']);
    });
});

describe('empty state suggestion',()=>{
    it('suggests the one filter whose removal brings back the most events',()=>{
        let state=createDefaultState();
        state=toggleFacetValue(state,'track','stage');
        state=toggleFacetValue(state,'mode','online');
        expect(applyFilters(events,state).length).toBe(0);
        const suggestion=suggestRelaxation(events,state);
        expect(suggestion.filter.label).toBe('Online');
        expect(suggestion.count).toBe(4);
        expect(applyFilters(events,suggestion.nextState).length).toBe(4);
    });

    it('returns null when nothing is active',()=>{
        expect(suggestRelaxation(events,createDefaultState())).toBe(null);
    });

    it('lists and removes active filters',()=>{
        let state={...createDefaultState(),q:'robot',date:'2026-11-13'};
        state=toggleFacetValue(state,'kind','technical');
        const active=getActiveFilters(state);
        expect(active.map((a)=>a.type)).toEqual(['q','date','facet']);
        const cleared=removeActiveFilter(state,active[2]);
        expect(cleared.facets.kind).toEqual([]);
        expect(state.facets.kind).toEqual(['technical']);
    });

    it('ignores toggles for unknown facets or values',()=>{
        const state=createDefaultState();
        expect(toggleFacetValue(state,'nope','x')).toBe(state);
        expect(toggleFacetValue(state,'price','gold')).toBe(state);
    });
});

describe('clashes and days',()=>{
    it('finds overlapping events and leaves separate ones alone',()=>{
        const dance=byName('Concrete Counts');
        const darkroom=byName('Silver & Shadow');
        const sky=byName('SkyLedger');
        const clashes=findClashes([dance,darkroom,sky]);
        expect(clashes[dance.id].map((e)=>e.id)).toEqual([darkroom.id]);
        expect(clashes[sky.id]).toEqual([]);
    });

    it('uses real sessions when known, so a 3-day 10–5 sprint does not clash with an evening event',()=>{
        const film=normalizeEvent({...payload.events.find((e)=>e.name.startsWith('Frame')),description:'x',schedules:[
            {event_date:'2026-11-13',start_time:'10:00',end_time:'17:00',venue:'Lab'},
            {event_date:'2026-11-14',start_time:'10:00',end_time:'17:00',venue:'Lab'},
            {event_date:'2026-11-15',start_time:'10:00',end_time:'17:00',venue:'Lab'}
        ]},NOW);
        const civic=byName('CivicForge');
        const civicDetailed=normalizeEvent({...payload.events.find((e)=>e.id===civic.id),description:'x',schedules:[
            {event_date:'2026-11-13',start_time:'18:00',end_time:'23:59',venue:'Lab'},
            {event_date:'2026-11-14',start_time:'00:00',end_time:'18:00',venue:'Lab'}
        ]},NOW);
        expect(getSlots(film).length).toBe(3);
        // Day 2 overlaps (10–5 vs midnight–6pm) — a real clash.
        expect(findClashes([film,civicDetailed])[film.id].length).toBe(1);
        const sky=byName('SkyLedger');
        expect(findClashes([film,sky])[film.id].length).toBe(0);
    });

    it('groups by IST day in order',()=>{
        const groups=groupByDay([byName('SkyLedger'),byName('TrackTact'),byName('Ampersand')]);
        expect(groups.map((g)=>g.key)).toEqual(['2026-11-13','2026-11-14','2026-11-15']);
    });
});

describe('calendar file',()=>{
    it('builds a valid iCalendar file with escaped text and UTC times',()=>{
        const ics=buildCalendarFile([byName('Chowk & Colour')],'https://render72.test');
        expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
        expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
        expect(ics).toContain('DTSTART:20261113T043000Z');
        expect(ics).toContain('DTEND:20261113T083000Z');
        expect(ics).toContain('SUMMARY:Chowk & Colour: Rangoli Duet');
        const lines=ics.split('\r\n');
        const encoder=new TextEncoder();
        for(let i=0;i<lines.length;i++){
            expect(encoder.encode(lines[i]).length).toBeLessThanOrEqual(75);
        }
        expect(ics.split('BEGIN:VEVENT').length-1).toBe(1);
    });

    it('escapes special characters and folds long lines',()=>{
        expect(escapeIcsText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
        const folded=foldIcsLine('DESCRIPTION:'+'x'.repeat(200));
        expect(folded.split('\r\n ').join('')).toBe('DESCRIPTION:'+'x'.repeat(200));
    });
});

describe('plan store',()=>{
    beforeEach(()=>{
        window.localStorage.clear();
        resetPlanForTests();
    });

    it('saves, removes and notifies',()=>{
        let calls=0;
        const unsubscribe=subscribeToPlan(()=>{
            calls=calls+1;
        });
        const first=getPlanIds();
        expect(togglePlan('abc-1')).toBe(true);
        expect(isInPlan('abc-1')).toBe(true);
        expect(getPlanIds()).not.toBe(first);
        expect(JSON.parse(window.localStorage.getItem('r72:v1:plan'))).toEqual(['abc-1']);
        expect(togglePlan('abc-1')).toBe(false);
        expect(isInPlan('abc-1')).toBe(false);
        expect(calls).toBe(2);
        unsubscribe();
    });

    it('keeps the same array between reads (stable for React)',()=>{
        togglePlan('x1');
        expect(getPlanIds()).toBe(getPlanIds());
    });

    it('ignores corrupted storage and invalid ids',()=>{
        window.localStorage.setItem('r72:v1:plan','{"not":"an array"}');
        resetPlanForTests();
        expect(getPlanIds()).toEqual([]);
        window.localStorage.setItem('r72:v1:plan','["ok-1","../bad",5,"ok-1"]');
        resetPlanForTests();
        expect(getPlanIds()).toEqual(['ok-1']);
        expect(togglePlan('<script>')).toBe(false);
        clearPlan();
        expect(getPlanIds()).toEqual([]);
    });
});
