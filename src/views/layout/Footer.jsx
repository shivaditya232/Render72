import {Link} from 'react-router';
import Wordmark from '../components/Wordmark';

const Footer=()=>{
    return (
        <footer className="page-gutter mt-24 border-t border-line">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
                <div className="space-y-3">
                    <Wordmark/>
                    <p className="max-w-sm text-sm leading-relaxed text-ash">
                        Thirty events, one programme. All times are in Indian Standard Time.
                    </p>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                    <nav aria-label="Footer">
                        <ul className="flex gap-6 text-sm">
                            <li><Link to="/" className="text-ash transition-colors hover:text-bone">Programme</Link></li>
                            <li><Link to="/events" className="text-ash transition-colors hover:text-bone">All events</Link></li>
                        </ul>
                    </nav>
                    <p className="label-mono text-ash">Built for Render72 · CORE Lab</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
