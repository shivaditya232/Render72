import {Link,NavLink} from 'react-router';
import Wordmark from '../components/Wordmark';

const NAV_ITEMS=[
    {to:'/',label:'Programme',end:true},
    {to:'/events',label:'All events',end:false}
];

const getNavClass=({isActive})=>{
    if(isActive){
        return 'relative py-1 text-sm font-medium text-bone after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-bone';
    }
    return 'relative py-1 text-sm font-medium text-ash transition-colors hover:text-bone';
};

const Header=()=>{
    return (
        <header className="page-gutter sticky top-0 z-40 border-b border-line/60 bg-ink/85 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6">
                <Link to="/" className="rounded-md" aria-label="Render72, back to the programme">
                    <Wordmark/>
                </Link>
                <nav aria-label="Main">
                    <ul className="flex items-center gap-6">
                        {NAV_ITEMS.map((item)=>{
                            return (
                                <li key={item.to}>
                                    <NavLink to={item.to} end={item.end} className={getNavClass}>
                                        {item.label}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
