import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {normalizeEvent,normalizeEventList} from '../src/models/eventModel';
import {getSessions,getSlots} from '../src/utils/schedule';
import {splitParagraphs,getDetailSections,getPrizeLayout,getGalleryFacts,getRelatedEvents,getPlanClashes,getContactLink,getCalendarFileName,getTimeSummary,getVenueText,getDisplaySessions} from '../src/utils/eventDetail';
import {buildCalendarFile} from '../src/utils/calendarFile';

const payload=JSON.parse(readFileSync(path.join(process.cwd(),'public','fallback','events.json'),'utf8'));
const NOW=Date.parse('2026-10-14T10:00:00+05:30');
const raw=(prefix)=>{
    for(let i=0;i<payload.events.length;i++){
        if(payload.events[i].name.startsWith(prefix)){
            return payload.events[i];
        }
    }
    return null;
};

const civic=normalizeEvent({...raw('CivicForge'),description:'x',schedules:[
    {event_date:'2026-11-13',start_time:'18:00',end_time:'23:59',venue:'Innovation Lab'},
    {event_date:'2026-11-14',start_time:'00:00',end_time:'18:00',venue:'Innovation Lab'}
],prizes:[{rank:1,title:'Champion',amount:25000},{rank:2,title:'Runner-up',amount:12000},{rank:3,title:'Access',amount:5000}]},NOW);

const film=normalizeEvent({...raw('Frame'),description:'One.\n\nTwo.\n\n\n  Three.  ',schedules:[
    {event_date:'2026-11-13',start_time:'10:00',end_time:'17:00',venue:'Media Lab'},
    {event_date:'2026-11-14',start_time:'10:00',end_time:'17:00',venue:'Media Lab'},
    {event_date:'2026-11-15',start_time:'10:00',end_time:'17:00',venue:'Media Lab'}
],prizes:[{rank:null,title:'Sound citation',amount:3000},{rank:2,title:'Runner-up',amount:9000},{rank:1,title:'Best film',amount:18000}],
gallery_images:['https://images.pexels.com/photos/1/a.jpeg','https://images.pexels.com/photos/2/b.jpeg'],
rules:['Be kind'],faqs:[{question:'Q?',answer:'A.'}],eligibility:['Students'],
coordinators:[{name:'Devika',role:'Lead',contact:'devika@example.org'}]},NOW);

describe('sessions',()=>{
    it('joins the midnight split of an overnight run into one session',()=>{
        const sessions=getSessions(civic);
        expect(sessions.length).toBe(1);
        expect(sessions[0].isOvernight).toBe(true);
        expect(sessions[0].start).toBe(Date.parse('2026-11-13T18:00:00+05:30'));
        expect(sessions[0].end).toBe(Date.parse('2026-11-14T18:00:00+05:30'));
        expect(getSlots(civic).length).toBe(1);
    });

    it('keeps separate days separate',()=>{
        expect(getSessions(film).length).toBe(3);
    });

    it('does not join sessions in different rooms',()=>{
        const event=normalizeEvent({id:'x',name:'X',schedules:[
            {event_date:'2026-11-13',start_time:'18:00',end_time:'23:59',venue:'A'},
            {event_date:'2026-11-14',start_time:'00:00',end_time:'02:00',venue:'B'}
        ]},NOW);
        expect(getSessions(event).length).toBe(2);
    });

    it('falls back to the overall span for summaries, and to nothing without dates',()=>{
        const summary=normalizeEvent(raw('TrackTact'),NOW);
        expect(getDisplaySessions(summary).length).toBe(1);
        expect(getDisplaySessions(normalizeEvent({id:'x',name:'X'},NOW))).toEqual([]);
    });

    it('calendar file has one entry for the overnight run',()=>{
        const ics=buildCalendarFile([civic],'https://example.org');
        expect(ics.split('BEGIN:VEVENT').length-1).toBe(1);
        expect(ics).toContain('DTEND:20261114T123000Z');
    });
});

describe('time summary and venue',()=>{
    it('says daily hours for a multi-day event',()=>{
        expect(getTimeSummary(film)).toBe('10:00 AM – 5:00 PM IST, 3 days');
    });
    it('shows the full span for an overnight run',()=>{
        expect(getTimeSummary(civic)).toBe('Fri 6:00 PM – Sat 6:00 PM IST');
    });
    it('is empty with no dates',()=>{
        expect(getTimeSummary(normalizeEvent({id:'x',name:'X'},NOW))).toBe('');
    });
    it('venue: first session room, Online, or On campus',()=>{
        expect(getVenueText(film)).toBe('Media Lab');
        expect(getVenueText(normalizeEvent({id:'x',name:'X',event_mode:'ONLINE'},NOW))).toBe('Online');
        expect(getVenueText(normalizeEvent({id:'x',name:'X'},NOW))).toBe('On campus');
    });
});

describe('prizes',()=>{
    it('keeps unranked prizes as special awards after the ranked ones',()=>{
        expect(film.prizes.map((p)=>p.title)).toEqual(['Best film','Runner-up','Sound citation']);
        expect(film.prizes[2].isSpecial).toBe(true);
        expect(film.prizes[2].rank).toBe(null);
    });

    it('treats zero, negative or fractional ranks as unranked',()=>{
        const event=normalizeEvent({id:'x',name:'X',prizes:[{rank:0,title:'A',amount:1},{rank:-2,title:'B',amount:1},{rank:1.5,title:'C',amount:1},{rank:'1',title:'D',amount:1}]},NOW);
        expect(event.prizes.map((p)=>p.title)).toEqual(['D','A','B','C']);
    });

    it('podium order is 2nd, 1st, 3rd',()=>{
        const layout=getPrizeLayout(civic.prizes);
        expect(layout.podium.map((e)=>e.place)).toEqual([2,1,3]);
        expect(layout.podium[1].prize.title).toBe('Champion');
        expect(layout.pool).toBe(42000);
    });

    it('two ranked prizes: 2nd then 1st, special award listed separately',()=>{
        const layout=getPrizeLayout(film.prizes);
        expect(layout.podium.map((e)=>e.place)).toEqual([2,1]);
        expect(layout.special.map((p)=>p.title)).toEqual(['Sound citation']);
        expect(layout.pool).toBe(30000);
    });

    it('one prize, many prizes, only special awards',()=>{
        const many=normalizeEvent({id:'x',name:'X',prizes:[1,2,3,4,5].map((n)=>({rank:n,title:'P'+n,amount:n*100}))},NOW);
        const layout=getPrizeLayout(many.prizes);
        expect(layout.podium.length).toBe(3);
        expect(layout.rest.map((p)=>p.title)).toEqual(['P4','P5']);
        expect(getPrizeLayout([many.prizes[0]]).podium.map((e)=>e.place)).toEqual([1]);
        const onlySpecial=normalizeEvent({id:'x',name:'X',prizes:[{title:'Spirit award',amount:null}]},NOW);
        const special=getPrizeLayout(onlySpecial.prizes);
        expect(special.podium).toEqual([]);
        expect(special.special.length).toBe(1);
        expect(special.pool).toBe(0);
    });
});

describe('sections',()=>{
    it('lists only sections that have content, in page order',()=>{
        expect(getDetailSections(film).map((s)=>s.id)).toEqual(['about','schedule','prizes','entry','rules','gallery','faq','people']);
    });
    it('a list summary only has about and schedule',()=>{
        expect(getDetailSections(normalizeEvent(raw('TrackTact'),NOW)).map((s)=>s.id)).toEqual(['about','schedule']);
    });
    it('a bare event only has about',()=>{
        expect(getDetailSections(normalizeEvent({id:'x',name:'X'},NOW)).map((s)=>s.id)).toEqual(['about']);
    });
    it('splits the description into paragraphs',()=>{
        expect(splitParagraphs(film.description)).toEqual(['One.','Two.','Three.']);
        expect(splitParagraphs('')).toEqual([]);
        expect(splitParagraphs(null)).toEqual([]);
    });
});

describe('gallery facts',()=>{
    it('prize pool first, then sessions',()=>{
        expect(getGalleryFacts(film)).toEqual([{value:'₹30,000',label:'in prizes'},{value:'3',label:'sessions over the fest'}]);
    });
    it('overnight run is called out',()=>{
        expect(getGalleryFacts(civic)[1]).toEqual({value:'Overnight',label:'one long session'});
    });
    it('never more than two',()=>{
        expect(getGalleryFacts(civic).length).toBe(2);
        expect(getGalleryFacts(normalizeEvent({id:'x',name:'X'},NOW))).toEqual([]);
    });
});

describe('related events and clashes',()=>{
    const events=normalizeEventList(payload,NOW);
    it('same track first, upcoming only, never the event itself',()=>{
        const related=getRelatedEvents(events,film,3);
        expect(related.length).toBe(3);
        for(let i=0;i<related.length;i++){
            expect(related[i].id).not.toBe(film.id);
            expect(related[i].isPast).toBe(false);
            expect(related[i].track.id).toBe('visual');
        }
    });
    it('fills up with other tracks when the track is small',()=>{
        const lonely={...film,id:'lonely',track:{id:'other',label:'More',color:'#fff'}};
        const related=getRelatedEvents(events,lonely,3);
        expect(related.length).toBe(3);
    });
    it('handles no list',()=>{
        expect(getRelatedEvents([],film,3)).toEqual([]);
        expect(getRelatedEvents(null,film,3)).toEqual([]);
    });
    it('finds clashes with saved events using real sessions',()=>{
        const chowk=normalizeEvent(raw('Chowk'),NOW);
        const sky=normalizeEvent(raw('SkyLedger'),NOW);
        const clashes=getPlanClashes(film,[chowk,sky,film]);
        expect(clashes.map((e)=>e.name)).toEqual([chowk.name]);
    });
    it('a past event never warns',()=>{
        const past=normalizeEvent(raw('CodeCurrent'),NOW);
        expect(getPlanClashes(past,[past])).toEqual([]);
    });
});

describe('contacts and file names',()=>{
    it('recognises email and phone',()=>{
        expect(getContactLink('a@b.org')).toEqual({href:'mailto:a@b.org',label:'a@b.org'});
        expect(getContactLink('+91 98765 43210')).toEqual({href:'tel:+919876543210',label:'+91 98765 43210'});
        expect(getContactLink('Find us at the desk')).toEqual({href:null,label:'Find us at the desk'});
        expect(getContactLink('')).toBe(null);
        expect(getContactLink(null)).toBe(null);
    });
    it('makes a safe calendar file name',()=>{
        expect(getCalendarFileName('Frame / Forty-Eight: Short Film Sprint')).toBe('frame-forty-eight-short-film-sprint.ics');
        expect(getCalendarFileName('!!!')).toBe('event.ics');
    });
});
