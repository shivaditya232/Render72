// First-load placeholder while the page's code downloads.
// Same header height as the real one, so nothing jumps when it swaps in.
const PageSkeleton=()=>{
    return (
        <div className="flex min-h-dvh flex-col" aria-busy="true" aria-label="Loading the programme">
            <div className="page-gutter h-16 border-b border-line/60">
                <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between">
                    <div className="skeleton h-6 w-32 rounded-md"/>
                    <div className="skeleton h-4 w-40 rounded-md"/>
                </div>
            </div>
            <div className="page-gutter flex-1">
                <div className="mx-auto max-w-[1440px] space-y-6 pt-16">
                    <div className="skeleton h-4 w-56 rounded-md"/>
                    <div className="skeleton h-20 w-full max-w-3xl rounded-xl"/>
                    <div className="skeleton h-20 w-2/3 max-w-2xl rounded-xl"/>
                </div>
            </div>
        </div>
    );
};

export default PageSkeleton;
