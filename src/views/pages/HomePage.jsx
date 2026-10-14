import {Link} from 'react-router';
import Icon from '../components/Icon';
import useEvents from '../../controllers/useEvents';
import useDocumentTitle from '../../controllers/useDocumentTitle';

// Session 1: a simple landing page to prove the data flow.
// The real landing page is built in Session 3.
const HomePage=()=>{
    useDocumentTitle(null);
    const {status,events}=useEvents();
    const count=status==='ready'?events.length:null;

    return (
        <section className="page-gutter">
            <div className="mx-auto max-w-[1440px] py-20 md:py-28">
                <p className="label-mono text-ash">The programme</p>
                <h1 className="condensed mt-4 max-w-4xl text-[clamp(2.75rem,8vw,6.5rem)] font-extrabold leading-[0.92] tracking-tight">
                    {count!==null?count+' events.':'Thirty events.'}
                    <br/>
                    <span className="text-signal-soft">One programme.</span>
                </h1>
                <Link to="/events" className="mt-10 inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-bone transition-colors hover:bg-[#2747E6]">
                    Browse all events
                    <Icon name="arrowRight" size={16}/>
                </Link>
            </div>
        </section>
    );
};

export default HomePage;
