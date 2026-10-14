// Grey outlines in the exact shape of the real cards, so nothing jumps when data arrives.
const ResultsSkeleton=({view})=>{
    const items=[0,1,2,3,4,5];
    if(view==='index'){
        return (
            <div aria-hidden="true">
                {items.map((item)=>{
                    return (
                        <div key={item} className="flex items-center gap-6 border-b border-line py-5">
                            <div className="skeleton h-4 w-8 rounded"/>
                            <div className="skeleton hidden h-8 w-28 rounded md:block"/>
                            <div className="flex-1 space-y-2">
                                <div className="skeleton h-4 w-2/3 rounded"/>
                                <div className="skeleton h-3 w-1/3 rounded"/>
                            </div>
                            <div className="skeleton h-9 w-9 rounded-full"/>
                        </div>
                    );
                })}
            </div>
        );
    }
    return (
        <div aria-hidden="true" className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item)=>{
                return (
                    <div key={item} className="space-y-4">
                        <div className="skeleton aspect-[4/5] rounded-2xl"/>
                        <div className="skeleton h-3 w-1/3 rounded"/>
                        <div className="skeleton h-6 w-4/5 rounded"/>
                        <div className="skeleton h-3 w-1/2 rounded"/>
                    </div>
                );
            })}
        </div>
    );
};

export default ResultsSkeleton;
