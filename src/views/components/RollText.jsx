// Link text that rolls on hover: each letter slides up and an identical copy slides in
// from below, a few milliseconds apart. The hover lives on the parent link or button.
// Screen readers read the text once (the second copy is hidden from them).
const splitLetters=(text)=>{
    const letters=[];
    const chars=Array.from(String(text));
    for(let i=0;i<chars.length;i++){
        letters.push(<span key={i} className="fx-ch" style={{'--i':i}}>{chars[i]}</span>);
    }
    return letters;
};

const RollText=({text})=>{
    return (
        <span className="fx-roll">
            <span>{splitLetters(text)}</span>
            <span aria-hidden="true">{splitLetters(text)}</span>
        </span>
    );
};

export default RollText;
