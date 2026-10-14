// The API's cover images come from Pexels, which can resize on the fly and
// automatically serves AVIF/WebP. So instead of always downloading the
// 1200px image, we ask for the size that the screen actually needs.

const PEXELS_HOST='images.pexels.com';

export const isSafeImageUrl=(url)=>{
    if(typeof url!=='string'||url===''){
        return false;
    }
    try{
        const parsed=new URL(url);
        return parsed.protocol==='https:'||parsed.protocol==='http:';
    }
    catch(error){
        return false;
    }
};

export const getSizedImageUrl=(url,width,height)=>{
    if(!isSafeImageUrl(url)){
        return null;
    }
    const parsed=new URL(url);
    if(parsed.hostname!==PEXELS_HOST){
        return url;
    }
    parsed.searchParams.set('auto','compress');
    parsed.searchParams.set('cs','tinysrgb');
    parsed.searchParams.set('w',String(width));
    if(height){
        parsed.searchParams.set('h',String(height));
        parsed.searchParams.set('fit','crop');
    }
    else{
        parsed.searchParams.delete('h');
        parsed.searchParams.delete('fit');
    }
    return parsed.toString();
};

// ratio is height/width, e.g. 2/3 for the API's 1200x800 covers.
export const buildSrcSet=(url,widths,ratio)=>{
    if(!isSafeImageUrl(url)){
        return undefined;
    }
    const parts=[];
    for(let i=0;i<widths.length;i++){
        const width=widths[i];
        const height=ratio?Math.round(width*ratio):null;
        const sized=getSizedImageUrl(url,width,height);
        if(sized){
            parts.push(sized+' '+width+'w');
        }
    }
    if(parts.length===0){
        return undefined;
    }
    return parts.join(', ');
};
