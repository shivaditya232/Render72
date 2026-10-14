import {Link} from 'react-router';
import Icon from './Icon';

// Friendly 404 used for unknown pages and unknown event ids.
const NotOnProgramme=()=>{
    return (
        <section className="page-gutter">
            <div className="mx-auto flex max-w-xl flex-col items-start gap-5 py-24">
                <p className="label-mono text-ash">404</p>
                <h1 className="text-4xl font-bold leading-tight">This one isn’t on the programme.</h1>
                <p className="text-base leading-relaxed text-ash">It may have been removed, or the link has a typo.</p>
                <Link to="/events" className="inline-flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-bone transition-colors hover:bg-[#2747E6]">
                    See all events
                    <Icon name="arrowRight" size={16}/>
                </Link>
            </div>
        </section>
    );
};

export default NotOnProgramme;
