// Tiny inline icons (no icon library, no extra download).
// Drawn on a 24px grid with a 1.75 stroke so they sit well next to Bricolage.

const PATHS={
    arrowRight:'M5 12h14M13 6l6 6-6 6',
    arrowLeft:'M19 12H5M11 6l-6 6 6 6',
    arrowUpRight:'M7 17L17 7M8 7h9v9',
    refresh:'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
    wifiOff:'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M19 13a10 10 0 0 0-2.5-1.8M2 9.5a15 15 0 0 1 4.5-2.9M12 20h.01',
    wifi:'M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M2 9.5a15 15 0 0 1 20 0M12 20h.01',
    close:'M6 6l12 12M18 6L6 18',
    search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    check:'M5 12l5 5 9-10',
    alert:'M12 8v5M12 16.5h.01M10.3 3.9L2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    calendar:'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
    pin:'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    users:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7.5M22 21v-1a6 6 0 0 0-4-5.6',
    clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
    bookmark:'M6 4h12v17l-6-4-6 4V4z',
    grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'
};

const Icon=({name,size,className,label})=>{
    const path=PATHS[name];
    if(!path){
        return null;
    }
    const finalSize=size||18;
    return (
        <svg
            width={finalSize}
            height={finalSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden={label?undefined:'true'}
            role={label?'img':undefined}
            aria-label={label}
            focusable="false"
        >
            <path d={path}/>
        </svg>
    );
};

export default Icon;
