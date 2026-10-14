import DetailSection from './DetailSection';
import Icon from '../components/Icon';
import {getDateParts,formatSpan} from '../../utils/formatters';
import {getDisplaySessions} from '../../utils/eventDetail';

// Every session as a row: the day set large, then the hours and the room.
const ScheduleSection=({event})=>{
    const sessions=getDisplaySessions(event);
    let venueFallback='On campus';
    if(event.mode==='ONLINE'){
        venueFallback='Online';
    }
    return (
        <DetailSection id="schedule" eyebrow={sessions.length===1?'One session':sessions.length+' sessions'} title="Schedule">
            <ol className="divide-y divide-line border-y border-line">
                {sessions.map((session,index)=>{
                    const date=getDateParts(session.start);
                    return (
                        <li key={index} className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-4 py-5 sm:grid-cols-[6rem_minmax(0,1fr)]">
                            <div className="flex items-end gap-2">
                                <span className="condensed tabular text-[2.75rem] font-extrabold leading-[0.8] sm:text-[3.25rem]">{date?date.day:'—'}</span>
                                <span className="label-mono pb-0.5 leading-tight text-ash">
                                    {date?date.month:''}
                                    <br/>
                                    {date?date.weekday:''}
                                </span>
                            </div>
                            <div className="min-w-0 space-y-1.5">
                                <p className="tabular font-semibold text-bone">
                                    {formatSpan(session.start,session.end)} IST
                                    {session.isOvernight?<span className="label-mono ml-2 rounded px-1.5 py-0.5 align-middle text-ink" style={{backgroundColor:event.track.color}}>Overnight</span>:null}
                                </p>
                                <p className="flex items-start gap-1.5 text-sm text-ash">
                                    <Icon name={event.mode==='ONLINE'?'wifi':'pin'} size={15} className="mt-0.5 shrink-0"/>
                                    {session.venue||venueFallback}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </DetailSection>
    );
};

export default ScheduleSection;
