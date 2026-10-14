import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {normalizeEventList,normalizeEvent} from '../src/models/eventModel';
import {getFestWindow,getTrackSummaries,getClosingSoon,getFeatured,getProgrammeStats,toHeadlineNumber} from '../src/utils/landing';

const payload=JSON.parse(readFileSync(path.join(process.cwd(),'public','fallback','events.json'),'utf8'));
const NOW=Date.parse('2026-10-14T10:00:00+05:30');
const events=normalizeEventList({events:payload.events},NOW);

describe('fest window',()=>{
    it('finds the three fest days and leaves one-off events out',()=>{
        const fest=getFestWindow(events);
        expect(fest.days.map((d)=>d.key)).toEqual(['2026-11-13','2026-11-14','2026-11-15']);
        expect(fest.eventCount).toBe(27);
        expect(fest.start).toBe(Date.parse('2026-11-13T09:00:00+05:30'));
        expect(fest.end).toBe(Date.parse('2026-11-15T21:30:00+05:30'));
        for(let i=1;i<fest.days[1].events.length;i++){
            expect(fest.days[1].events[i].start).toBeGreaterThanOrEqual(fest.days[1].events[i-1].start);
        }
    });

    it('returns null when no day is busy enough',()=>{
        expect(getFestWindow(events.slice(0,3))).toBe(null);
        expect(getFestWindow([])).toBe(null);
    });
});

describe('track summaries',()=>{
    it('counts upcoming events per track and prefers a featured cover',()=>{
        const summaries=getTrackSummaries(events);
        expect(summaries.length).toBe(6);
        let total=0;
        for(let i=0;i<summaries.length;i++){
            total=total+summaries[i].count;
        }
        expect(total).toBe(28);
        const machines=summaries.find((s)=>s.track.id==='machines');
        expect(machines.cover.name).toContain('TrackTact');
        const visual=summaries.find((s)=>s.track.id==='visual');
        expect(visual.cover.isFeatured).toBe(false);
        expect(visual.cover.cover.url).toBeTruthy();
    });

    it('still gives every track a photo once the fest is over',()=>{
        const later=normalizeEventList({events:payload.events},Date.parse('2026-12-01T10:00:00+05:30'));
        const summaries=getTrackSummaries(later);
        for(let i=0;i<summaries.length;i++){
            expect(summaries[i].count).toBe(0);
            expect(summaries[i].cover).not.toBeNull();
        }
        expect(getClosingSoon(later,4).length).toBe(0);
        expect(getFeatured(later).length).toBe(0);
    });
});

describe('closing soon and featured',()=>{
    it('lists registrable events by nearest deadline',()=>{
        const closing=getClosingSoon(events,4);
        expect(closing.length).toBe(4);
        expect(closing[0].name).toContain('Ampersand');
        for(let i=0;i<closing.length;i++){
            expect(closing[i].canRegister).toBe(true);
        }
        for(let i=1;i<closing.length;i++){
            expect(closing[i].registrationDeadline).toBeGreaterThanOrEqual(closing[i-1].registrationDeadline);
        }
    });

    it('lists the six featured events soonest first',()=>{
        const featured=getFeatured(events);
        expect(featured.length).toBe(6);
        expect(featured[0].name).toContain('TrackTact');
    });
});

describe('stats',()=>{
    it('counts the fest window',()=>{
        const stats=getProgrammeStats(events,getFestWindow(events));
        expect(stats.events).toBe(27);
        expect(stats.days).toBe(3);
        expect(stats.tracks).toBe(6);
        expect(stats.free).toBe(4);
        expect(stats.workshops).toBe(6);
        expect(stats.seatsOpen).toBeGreaterThan(100);
    });

    it('falls back to everything when there is no fest window',()=>{
        const few=[normalizeEvent({id:'a',price:0,total_seats:10,seats_filled:2,registration_status:'OPEN',event_status:'ACTIVE'},NOW)];
        const stats=getProgrammeStats(few,null);
        expect(stats.events).toBe(1);
        expect(stats.days).toBe(0);
        expect(stats.free).toBe(1);
        expect(stats.seatsOpen).toBe(8);
    });

    it('spells small headline numbers',()=>{
        expect(toHeadlineNumber(3)).toBe('Three');
        expect(toHeadlineNumber(27)).toBe('27');
        expect(toHeadlineNumber(-1)).toBe('-1');
    });
});
