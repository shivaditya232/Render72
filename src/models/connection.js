// Is the visitor online? Combines the browser's own signal with the failure simulator,
// so "?simulate=offline" behaves exactly like real offline everywhere in the app.

import {getSimulateMode} from './simulator';
import {createRequestError} from './httpClient';

export const isOnlineNow=()=>{
    if(getSimulateMode()==='offline'){
        return false;
    }
    if(typeof navigator==='undefined'){
        return true;
    }
    return navigator.onLine!==false;
};

// Resolves when the browser comes back online. Rejects with 'aborted' if the signal fires first.
export const waitForOnline=(signal)=>{
    return new Promise((resolve,reject)=>{
        if(signal&&signal.aborted){
            reject(createRequestError('aborted','Waiting was cancelled'));
            return;
        }
        // A simulated offline never "comes back" by itself.
        if(getSimulateMode()!=='offline'&&isOnlineNow()){
            resolve();
            return;
        }
        const cleanUp=()=>{
            window.removeEventListener('online',onOnline);
            if(signal){
                signal.removeEventListener('abort',onAbort);
            }
        };
        const onOnline=()=>{
            if(getSimulateMode()==='offline'){
                return;
            }
            cleanUp();
            resolve();
        };
        const onAbort=()=>{
            cleanUp();
            reject(createRequestError('aborted','Waiting was cancelled'));
        };
        window.addEventListener('online',onOnline);
        if(signal){
            signal.addEventListener('abort',onAbort,{once:true});
        }
    });
};
