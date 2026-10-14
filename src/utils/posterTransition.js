// The poster you click on the events wall grows into the poster at the top of the event
// page. Both carry the same view-transition name for that one navigation, and the browser
// morphs between them (React Router runs the navigation inside a view transition).
// A name may only be used once per page, so it is taken off every other poster first.

export const POSTER_TRANSITION_NAME='event-poster';

export const markPosterForTransition=(element)=>{
    if(!element||typeof document==='undefined'){
        return;
    }
    const named=document.querySelectorAll('.vt-poster');
    for(let i=0;i<named.length;i++){
        if(named[i]!==element){
            named[i].style.viewTransitionName='';
            named[i].classList.remove('vt-poster');
        }
    }
    element.classList.add('vt-poster');
    element.style.viewTransitionName=POSTER_TRANSITION_NAME;
};
