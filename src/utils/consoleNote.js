// A note for anyone who opens the browser console (judges included):
// how to see the site's failure handling without breaking the real API.

const NOTE_STYLE='font:800 20px/1.2 system-ui,sans-serif;color:#F2EEE6;background:#3355FF;padding:4px 10px;border-radius:6px;';
const TEXT_STYLE='font:13px/1.6 ui-monospace,monospace;color:#9A978F;';

export const printConsoleNote=()=>{
    if(typeof console==='undefined'||typeof console.log!=='function'){
        return;
    }
    console.log('%cRender72',NOTE_STYLE);
    console.log(
        '%cCurious how it copes when things break? Add one of these to any page URL:\n'+
        '  ?simulate=offline     no internet\n'+
        '  ?simulate=500         the server fails\n'+
        '  ?simulate=timeout     the server never answers\n'+
        '  ?simulate=slow        a slow connection\n'+
        '  ?simulate=empty       nothing published yet\n'+
        '  ?simulate=malformed   the server sends garbage\n'+
        '  ?simulate=off         back to normal',
        TEXT_STYLE
    );
};
