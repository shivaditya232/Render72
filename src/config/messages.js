// Every user-facing error message in one place, keyed by the error "kind"
// that httpClient produces. Say what happened, then what happens next.

const ERROR_COPY={
    offline:{
        title:'You’re offline.',
        body:'Connect to the internet and the programme will load by itself.'
    },
    timeout:{
        title:'The programme server is taking too long.',
        body:'It might be busy. Try again in a moment.'
    },
    server:{
        title:'The programme server is having a moment.',
        body:'This one is on our side, not yours. Try again in a moment.'
    },
    network:{
        title:'We couldn’t reach the programme server.',
        body:'Check your connection and try again.'
    },
    bad_data:{
        title:'The programme came back garbled.',
        body:'The server sent something we couldn’t read. Try again in a moment.'
    },
    client:{
        title:'That request didn’t work.',
        body:'Try again, or head back to the full programme.'
    },
    slow:{
        title:'The programme server is taking too long.',
        body:'We’re still trying. Try again in a moment.'
    },
    not_found:{
        title:'This one isn’t on the programme.',
        body:'It may have been removed, or the link has a typo.'
    }
};

const DEFAULT_COPY={
    title:'Something went wrong.',
    body:'Try again in a moment.'
};

export const getErrorCopy=(error)=>{
    if(error&&error.kind&&ERROR_COPY[error.kind]){
        return ERROR_COPY[error.kind];
    }
    return DEFAULT_COPY;
};

export const OFFLINE_BANNER='You’re offline. Showing what’s already loaded.';
export const BACK_ONLINE='You’re back online. Programme refreshed.';
