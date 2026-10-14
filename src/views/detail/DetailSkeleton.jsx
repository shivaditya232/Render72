import LoadingPhrase from '../components/LoadingPhrase';

// Same shapes as the real page, so nothing jumps when the event arrives.
const DetailSkeleton=()=>{
    return (
        <div className="space-y-8" aria-busy="true">
            <div className="skeleton aspect-[4/3] rounded-2xl sm:aspect-[16/9] lg:hidden"/>
            <LoadingPhrase active={true}/>
            <div className="space-y-4">
                <div className="skeleton h-4 w-48 rounded-md"/>
                <div className="skeleton h-14 w-full max-w-3xl rounded-xl"/>
                <div className="skeleton h-14 w-2/3 max-w-2xl rounded-xl"/>
            </div>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-3">
                    <div className="skeleton h-4 w-full rounded"/>
                    <div className="skeleton h-4 w-11/12 rounded"/>
                    <div className="skeleton h-4 w-4/5 rounded"/>
                </div>
                <div className="skeleton h-72 rounded-2xl"/>
            </div>
        </div>
    );
};

export default DetailSkeleton;
