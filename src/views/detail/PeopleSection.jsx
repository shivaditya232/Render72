import DetailSection from './DetailSection';
import Icon from '../components/Icon';
import {getContactLink} from '../../utils/eventDetail';

const ORG_TYPE_LABELS={
    CLUB:'Student club',
    DEPARTMENT:'Department',
    SOCIETY:'Society',
    COMMITTEE:'Committee'
};

const getInitials=(name)=>{
    const words=name.split(/\s+/);
    let initials='';
    for(let i=0;i<words.length&&initials.length<2;i++){
        if(words[i]!==''){
            initials=initials+words[i][0].toUpperCase();
        }
    }
    return initials;
};

// Who runs it, and who to ask.
const PeopleSection=({event})=>{
    return (
        <DetailSection id="people" eyebrow="Questions? Ask them" title="Organisers">
            <ul className="grid gap-3 sm:grid-cols-2">
                {event.organizers.map((organizer,index)=>{
                    return (
                        <li key={'o'+index} className="flex items-center gap-4 rounded-2xl border border-line bg-graphite p-5 sm:col-span-2">
                            <span aria-hidden="true" className="condensed flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-ink" style={{backgroundColor:event.track.color}}>
                                {getInitials(organizer.name)}
                            </span>
                            <div className="min-w-0">
                                <p className="font-semibold text-bone">{organizer.name}</p>
                                <p className="text-sm text-ash">{ORG_TYPE_LABELS[organizer.type.toUpperCase()]||'Organiser'}</p>
                            </div>
                        </li>
                    );
                })}
                {event.coordinators.map((person,index)=>{
                    const contact=getContactLink(person.contact);
                    return (
                        <li key={'c'+index} className="flex flex-col gap-3 rounded-2xl border border-line p-5">
                            <div className="flex items-center gap-3">
                                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-sm font-semibold text-bone">
                                    {getInitials(person.name)}
                                </span>
                                <div className="min-w-0">
                                    <p className="font-semibold text-bone">{person.name}</p>
                                    {person.role?<p className="text-sm text-ash">{person.role}</p>:null}
                                </div>
                            </div>
                            {contact&&contact.href?(
                                <a href={contact.href} className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-signal-soft transition-colors hover:text-bone">
                                    <Icon name={contact.href.startsWith('mailto:')?'mail':'phone'} size={15} className="shrink-0"/>
                                    <span className="truncate">{contact.label}</span>
                                </a>
                            ):null}
                            {contact&&!contact.href?<p className="text-sm text-ash">{contact.label}</p>:null}
                        </li>
                    );
                })}
            </ul>
        </DetailSection>
    );
};

export default PeopleSection;
