import LoadingPhrase from '../components/LoadingPhrase';

// Same shapes as the real page (banner first on phones, poster on the right on desktop),
// and at least a screen tall, so the footer never shows and then jumps away.
const DetailSkeleton=()=>{
    return (
        <div className="min-h-[100dvh] space-y-8" aria-busy="true">
            <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="skeleton aspect-[4/3] rounded-2xl sm:aspect-[16/9] lg:col-start-2 lg:row-start-1 lg:aspect-[4/5]"/>
                <div className="space-y-4 lg:col-start-1 lg:row-start-1 lg:self-end">
                    <LoadingPhrase active={true}/>
                    <div className="skeleton h-4 w-48 rounded-md"/>
                    <div className="skeleton h-14 w-full max-w-3xl rounded-xl"/>
                    <div className="skeleton h-14 w-2/3 max-w-2xl rounded-xl"/>
                </div>
                <div className="skeleton h-72 rounded-2xl lg:col-start-2 lg:row-start-2"/>
                <div className="space-y-3 lg:col-start-1 lg:row-start-2">
                    <div className="skeleton h-4 w-full rounded"/>
                    <div className="skeleton h-4 w-11/12 rounded"/>
                    <div className="skeleton h-4 w-4/5 rounded"/>
                </div>
            </div>
        </div>
    );
};

export default DetailSkeleton;
