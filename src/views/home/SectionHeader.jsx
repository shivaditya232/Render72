import {Link} from 'react-router';
import Icon from '../components/Icon';

// Shared heading for landing sections: small label, big title, optional link on the right.
const SectionHeader=({id,eyebrow,title,linkTo,linkLabel})=>{
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="label-mono text-ash">{eyebrow}</p>
                <h2 id={id} className="condensed mt-3 text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[0.92] tracking-tight">{title}</h2>
            </div>
            {linkTo?(
                <Link to={linkTo} className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-signal-soft underline-offset-4 hover:underline">
                    {linkLabel}
                    <Icon name="arrowRight" size={16}/>
                </Link>
            ):null}
        </div>
    );
};

export default SectionHeader;
