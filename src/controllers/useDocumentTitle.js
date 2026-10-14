import {useEffect} from 'react';

const SITE_NAME='Render72';

// Sets the browser tab title, e.g. "Events · Render72".
const useDocumentTitle=(title)=>{
    useEffect(()=>{
        if(title){
            document.title=title+' · '+SITE_NAME;
        }
        else{
            document.title=SITE_NAME+' · The Programme';
        }
    },[title]);
};

export default useDocumentTitle;
