import {useEffect} from 'react';
import {Link,isRouteErrorResponse,useRouteError} from 'react-router';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Icon from '../components/Icon';
import useDocumentTitle from '../../controllers/useDocumentTitle';
import {isChunkLoadError} from '../../routes/lazyPage';
import {isOnlineNow} from '../../models/connection';

const RELOAD_FLAG='r72:chunk-reload:';

// If the only problem was a page file that failed to download (usually a dropped
// connection), reload once by ourselves. The flag stops it from looping.
const tryAutoReload=(error)=>{
    if(!isChunkLoadError(error)||!isOnlineNow()){
        return false;
    }
    try{
        const key=RELOAD_FLAG+window.location.pathname;
        if(window.sessionStorage.getItem(key)){
            window.sessionStorage.removeItem(key);
            return false;
        }
        window.sessionStorage.setItem(key,'1');
        window.location.reload();
        return true;
    }
    catch(storageError){
        // Without storage we can't guard against a loop, so leave it to the Reload button.
        return false;
    }
};

// Last line of defence: if a whole page crashes, the visitor still gets
// the header, a plain explanation and a way back — never a blank screen.
const RouteErrorPage=()=>{
    const error=useRouteError();
    const isNotFound=isRouteErrorResponse(error)&&error.status===404;
    useDocumentTitle(isNotFound?'Not found':'Something went wrong');

    useEffect(()=>{
        if(isNotFound){
            return;
        }
        const reloading=tryAutoReload(error);
        if(!reloading&&error&&typeof console!=='undefined'){
            console.error('[Render72] Page error:',error);
        }
    },[error,isNotFound]);

    return (
        <div className="flex min-h-dvh flex-col">
            <Header/>
            <main id="main" className="page-gutter flex-1">
                <div className="mx-auto flex max-w-xl flex-col items-start gap-5 py-24">
                    <p className="label-mono text-ash">{isNotFound?'404':'Error'}</p>
                    <h1 className="text-4xl font-bold leading-tight">
                        {isNotFound?'This page isn’t on the programme.':'This page tripped over something.'}
                    </h1>
                    <p className="text-base leading-relaxed text-ash">
                        {isNotFound?'The link may be old or mistyped.':'It’s on our side. Reloading usually fixes it, and the rest of the site still works.'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {!isNotFound?(
                            <button
                                type="button"
                                onClick={()=>{
                                    window.location.reload();
                                }}
                                className="inline-flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-bone transition-colors hover:bg-[#2747E6]"
                            >
                                <Icon name="refresh" size={16}/>
                                Reload
                            </button>
                        ):null}
                        <Link to="/events" className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-bone transition-colors hover:border-ash">
                            See all events
                            <Icon name="arrowRight" size={16}/>
                        </Link>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default RouteErrorPage;
