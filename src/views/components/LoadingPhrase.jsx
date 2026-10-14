import useLoadingPhrase from '../../controllers/useLoadingPhrase';

// The small line under a skeleton. Invisible for the first 0.8 s,
// so it only appears when a wait is actually noticeable.
const LoadingPhrase=({active,category})=>{
    const {visible,phrase,isSlow}=useLoadingPhrase(active,category);
    return (
        <p aria-live="polite" className={visible?'label-mono min-h-[1.4em] text-ash transition-opacity duration-300':'label-mono min-h-[1.4em] text-ash opacity-0'}>
            {visible?phrase:''}
            {visible&&isSlow?<span className="sr-only"> Still loading.</span>:null}
        </p>
    );
};

export default LoadingPhrase;
