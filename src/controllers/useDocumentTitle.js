import {useEffect} from 'react';

const SITE_NAME='Render72';

// The description written in index.html, kept so pages without their own can put it back.
let defaultDescription=null;

const getDescriptionTag=()=>{
    return document.querySelector('meta[name="description"]');
};

// Sets the browser tab title ("Events · Render72") and, if given, the page's
// search-result description (Google runs the JavaScript and reads both).
const useDocumentTitle=(title,description)=>{
    useEffect(()=>{
        if(title){
            document.title=title+' · '+SITE_NAME;
        }
        else{
            document.title=SITE_NAME+' · The Programme';
        }
    },[title]);

    useEffect(()=>{
        const tag=getDescriptionTag();
        if(!tag){
            return;
        }
        if(defaultDescription===null){
            defaultDescription=tag.getAttribute('content')||'';
        }
        if(description){
            tag.setAttribute('content',description);
        }
        else{
            tag.setAttribute('content',defaultDescription);
        }
    },[description]);
};

export default useDocumentTitle;
