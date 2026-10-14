import Icon from '../components/Icon';

const OPTIONS=[
    {value:'posters',label:'Poster view',icon:'grid'},
    {value:'index',label:'List view',icon:'list'}
];

const ViewToggle=({value,onChange})=>{
    return (
        <div role="group" aria-label="Layout" className="flex shrink-0 rounded-full border border-line p-1">
            {OPTIONS.map((option)=>{
                const isOn=value===option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={isOn}
                        aria-label={option.label}
                        title={option.label}
                        onClick={()=>{
                            onChange(option.value);
                        }}
                        className={isOn?'flex h-9 w-9 items-center justify-center rounded-full bg-bone text-ink':'flex h-9 w-9 items-center justify-center rounded-full text-ash transition-colors hover:text-bone'}
                    >
                        <Icon name={option.icon} size={17}/>
                    </button>
                );
            })}
        </div>
    );
};

export default ViewToggle;
