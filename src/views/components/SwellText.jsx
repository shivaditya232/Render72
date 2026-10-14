import useSwell from '../../controllers/useSwell';

// A big headline whose letters respond to the cursor (see controllers/useSwell.js).
// lines: one string, or several for a headline set on separate lines.
// Words never break apart; screen readers get the plain text once.
const splitWords=(line,lineIndex)=>{
    const words=line.split(' ');
    const result=[];
    for(let w=0;w<words.length;w++){
        const chars=Array.from(words[w]);
        const letters=[];
        for(let c=0;c<chars.length;c++){
            letters.push(<span key={c} className="swell-ch">{chars[c]}</span>);
        }
        result.push(<span key={lineIndex+'-'+w} className="swell-word">{letters}</span>);
        if(w<words.length-1){
            result.push(' ');
        }
    }
    return result;
};

const SwellText=({as,id,className,lines})=>{
    const Tag=as||'h1';
    const list=Array.isArray(lines)?lines:[lines];
    const plain=list.join(' ');
    const rootRef=useSwell(plain);
    const visual=[];
    for(let i=0;i<list.length;i++){
        if(i>0){
            visual.push(<br key={'br'+i}/>);
        }
        const parts=splitWords(list[i],i);
        for(let p=0;p<parts.length;p++){
            visual.push(parts[p]);
        }
    }
    return (
        <Tag id={id} ref={rootRef} className={className}>
            <span className="sr-only">{plain}</span>
            <span aria-hidden="true">{visual}</span>
        </Tag>
    );
};

export default SwellText;
