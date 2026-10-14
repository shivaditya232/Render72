// Vite plugin: start downloading the current page's code together with the app's main file.
// Pages are lazy-loaded, so normally the browser only learns it needs e.g. HomePage.js after
// main.js has downloaded and run, one round trip later. This adds a tiny inline script to
// index.html that looks at the URL and preloads that page's files straight away.

const ROUTES=[
    {test:'^/$',page:'src/views/pages/HomePage.jsx'},
    {test:'^/events/?$',page:'src/views/pages/EventsPage.jsx'},
    {test:'^/events/[^/]+/?$',page:'src/views/pages/EventDetailPage.jsx'}
];

const collectFiles=(bundle,fileName,files,skip)=>{
    if(files.includes(fileName)||skip.includes(fileName)){
        return;
    }
    const chunk=bundle[fileName];
    if(!chunk||chunk.type!=='chunk'){
        return;
    }
    files.push(fileName);
    for(let i=0;i<chunk.imports.length;i++){
        collectFiles(bundle,chunk.imports[i],files,skip);
    }
};

const routePreload=()=>{
    return {
        name:'render72-route-preload',
        apply:'build',
        transformIndexHtml:{
            order:'post',
            handler:(html,context)=>{
                const bundle=context.bundle;
                if(!bundle){
                    return html;
                }
                // Files the entry already loads don't need preloading again.
                const skip=[];
                const names=Object.keys(bundle);
                for(let i=0;i<names.length;i++){
                    const chunk=bundle[names[i]];
                    if(chunk.type==='chunk'&&chunk.isEntry){
                        collectFiles(bundle,names[i],skip,[]);
                    }
                }
                const table=[];
                for(let r=0;r<ROUTES.length;r++){
                    let pageFile=null;
                    for(let i=0;i<names.length;i++){
                        const chunk=bundle[names[i]];
                        if(chunk.type==='chunk'&&chunk.facadeModuleId&&chunk.facadeModuleId.replace(/\\/g,'/').endsWith(ROUTES[r].page)){
                            pageFile=names[i];
                        }
                    }
                    if(!pageFile){
                        continue;
                    }
                    const files=[];
                    collectFiles(bundle,pageFile,files,skip);
                    table.push([ROUTES[r].test,files.map((file)=>{
                        return '/'+file;
                    })]);
                }
                const script='(function(){var t='+JSON.stringify(table)+',p=location.pathname;for(var i=0;i<t.length;i++){if(new RegExp(t[i][0]).test(p)){for(var j=0;j<t[i][1].length;j++){var l=document.createElement("link");l.rel="modulepreload";l.href=t[i][1][j];document.head.appendChild(l);}break;}}})();';
                return {
                    html,
                    // First in <head>: an inline script placed after the stylesheet would wait for it to download.
                    tags:[{tag:'script',children:script,injectTo:'head-prepend'}]
                };
            }
        }
    };
};

export default routePreload;

// Vite plugin: put the (small, ~12 KB compressed) stylesheet straight into index.html.
// A linked stylesheet blocks the first paint until it has downloaded; inline, the page
// shell can paint as soon as the HTML arrives.
export const inlineCss=()=>{
    return {
        name:'render72-inline-css',
        apply:'build',
        enforce:'post',
        generateBundle:(options,bundle)=>{
            const html=bundle['index.html'];
            if(!html||html.type!=='asset'){
                return;
            }
            let source=String(html.source);
            const names=Object.keys(bundle);
            for(let i=0;i<names.length;i++){
                const asset=bundle[names[i]];
                if(asset.type!=='asset'||!names[i].endsWith('.css')){
                    continue;
                }
                const pattern=new RegExp('<link rel="stylesheet"[^>]*href="/'+names[i].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'"[^>]*>');
                if(pattern.test(source)){
                    // The stylesheet's own text can't close the style tag early.
                    const css=String(asset.source).replace(/<\/style/gi,'<\\/style');
                    source=source.replace(pattern,()=>{
                        return '<style>'+css+'</style>';
                    });
                }
            }
            html.source=source;
        }
    };
};
