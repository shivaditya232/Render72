// One short confirmation at a time ("Saved to your plan · Undo").
// A tiny store so any part of the site can show one without passing props around.

const SHOW_FOR_MS=4000;

let current=null;
let timer=null;
let counter=0;
const listeners=new Set();

const notify=()=>{
    listeners.forEach((listener)=>{
        listener();
    });
};

export const getToast=()=>{
    return current;
};

export const dismissToast=()=>{
    if(timer){
        clearTimeout(timer);
        timer=null;
    }
    if(current){
        current=null;
        notify();
    }
};

// action: optional { label, run } (e.g. Undo). tone: 'done' (default) or 'warn'.
export const showToast=(message,action,tone)=>{
    if(timer){
        clearTimeout(timer);
    }
    counter=counter+1;
    current={id:counter,message,action:action||null,tone:tone||'done'};
    notify();
    timer=setTimeout(()=>{
        timer=null;
        current=null;
        notify();
    },SHOW_FOR_MS);
};

export const subscribeToToast=(listener)=>{
    listeners.add(listener);
    return ()=>{
        listeners.delete(listener);
    };
};
