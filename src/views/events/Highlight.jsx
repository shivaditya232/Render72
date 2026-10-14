import {normalizeSearchText} from '../../utils/filterEvents';

// Underlines the searched words inside a title ("robot" in "Autonomous Robots").
// Works on the accent-free version so "cafe" still highlights "Café".
const Highlight=({text,tokens})=>{
    if(!tokens||tokens.length===0){
        return text;
    }
    const plain=normalizeSearchText(text);
    if(plain.length!==text.length){
        // Rare characters change length when normalised; skip highlighting rather than misalign.
        return text;
    }
    const marked=new Array(text.length).fill(false);
    for(let t=0;t<tokens.length;t++){
        const token=tokens[t];
        let from=plain.indexOf(token);
        while(from!==-1){
            for(let i=from;i<from+token.length;i++){
                marked[i]=true;
            }
            from=plain.indexOf(token,from+token.length);
        }
    }
    const parts=[];
    let start=0;
    for(let i=1;i<=text.length;i++){
        if(i===text.length||marked[i]!==marked[start]){
            const piece=text.slice(start,i);
            if(marked[start]){
                parts.push(<mark key={start} className="r72-mark">{piece}</mark>);
            }
            else{
                parts.push(piece);
            }
            start=i;
        }
    }
    return parts;
};

export default Highlight;
