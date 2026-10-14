import {useCallback,useEffect,useState} from 'react';
import {Outlet,ScrollRestoration,useNavigation} from 'react-router';
import Header from './Header';
import Footer from './Footer';
import NetworkBanner from './NetworkBanner';
import NavigationOverlay from './NavigationOverlay';
import PlanDrawer from '../plan/PlanDrawer';
import useNetworkStatus from '../../controllers/useNetworkStatus';
import {preloadPages} from '../../routes/lazyPage';
import {PAGE_IMPORTERS} from '../../routes/pageImporters';

const AppLayout=()=>{
    const navigation=useNavigation();
    const {isOnline,justReconnected}=useNetworkStatus();
    const isPending=navigation.state==='loading';
    const isWaitingOffline=isPending&&!isOnline;
    const [planOpen,setPlanOpen]=useState(false);

    const openPlan=useCallback(()=>{
        setPlanOpen(true);
    },[]);

    const closePlan=useCallback(()=>{
        setPlanOpen(false);
    },[]);

    // Fetch the other pages' code quietly once the first page has settled,
    // so moving around still works if the connection drops later.
    useEffect(()=>{
        preloadPages(PAGE_IMPORTERS);
    },[]);

    return (
        <div className="flex min-h-dvh flex-col">
            <a href="#main" className="sr-only-focusable z-[60] rounded-full bg-bone px-4 py-2 text-sm font-medium text-ink focus:left-4 focus:top-3">
                Skip to content
            </a>
            <Header onOpenPlan={openPlan}/>
            <NetworkBanner isOnline={isOnline} justReconnected={justReconnected}/>
            <main
                id="main"
                tabIndex={-1}
                aria-busy={isPending}
                inert={isWaitingOffline?true:undefined}
                className={isWaitingOffline?'flex-1 opacity-40 blur-[6px] transition-[filter,opacity] duration-300 outline-none':'flex-1 transition-[filter,opacity] duration-300 outline-none'}
            >
                <Outlet/>
            </main>
            <Footer/>
            <NavigationOverlay isPending={isPending} isOnline={isOnline}/>
            <PlanDrawer open={planOpen} onClose={closePlan}/>
            <ScrollRestoration/>
        </div>
    );
};

export default AppLayout;
