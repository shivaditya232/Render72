import {useEffect,useState} from 'react';

// Which section is being read right now: the last one whose top has passed
// the upper third of the screen. Drives the active pill in the section bar.
const useScrollSpy=(ids)=>{
    const key=ids.join('|');
    const [activeId,setActiveId]=useState(ids.length>0?ids[0]:null);

    useEffect(()=>{
        const list=key===''?[]:key.split('|');
        if(list.length===0||typeof IntersectionObserver!=='function'){
            return undefined;
        }
        const visible={};
        const observer=new IntersectionObserver((entries)=>{
            for(let i=0;i<entries.length;i++){
                visible[entries[i].target.id]=entries[i].isIntersecting;
            }
            for(let i=list.length-1;i>=0;i--){
                if(visible[list[i]]){
                    setActiveId(list[i]);
                    return;
                }
            }
        },{rootMargin:'-30% 0px -60% 0px'});
        for(let i=0;i<list.length;i++){
            const element=document.getElementById(list[i]);
            if(element){
                observer.observe(element);
            }
        }
        return ()=>{
            observer.disconnect();
        };
    },[key]);

    return activeId;
};

export default useScrollSpy;
