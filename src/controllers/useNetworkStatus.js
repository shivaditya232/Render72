import {useEffect,useState} from 'react';
import {isOnlineNow} from '../models/connection';

const BACK_ONLINE_NOTICE_MS=3500;

// { isOnline, justReconnected }
// justReconnected stays true for a few seconds after the connection returns,
// so the layout can show a short "You're back online" note.
const useNetworkStatus=()=>{
    const [isOnline,setIsOnline]=useState(isOnlineNow);
    const [justReconnected,setJustReconnected]=useState(false);

    useEffect(()=>{
        let timer=null;
        const onOnline=()=>{
            if(!isOnlineNow()){
                return;
            }
            setIsOnline(true);
            setJustReconnected(true);
            clearTimeout(timer);
            timer=setTimeout(()=>{
                setJustReconnected(false);
            },BACK_ONLINE_NOTICE_MS);
        };
        const onOffline=()=>{
            clearTimeout(timer);
            setJustReconnected(false);
            setIsOnline(false);
        };
        window.addEventListener('online',onOnline);
        window.addEventListener('offline',onOffline);
        return ()=>{
            clearTimeout(timer);
            window.removeEventListener('online',onOnline);
            window.removeEventListener('offline',onOffline);
        };
    },[]);

    return {isOnline,justReconnected};
};

export default useNetworkStatus;
