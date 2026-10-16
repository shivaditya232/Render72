// Link text that rolls on hover: each letter slides up and an identical copy slides in
// from below, a few milliseconds apart. The hover lives on the parent link or button.
// Screen readers get the plain text once; both rolling copies are hidden from them
// (letters in separate boxes would otherwise be read out one by one).
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
        <>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true" className="fx-roll">
                <span>{splitLetters(text)}</span>
                <span>{splitLetters(text)}</span>
            </span>
        </>
    );
};

export default RollText;
