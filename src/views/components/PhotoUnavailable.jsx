import Icon from './Icon';

// Shown in place of a photo that couldn't load (usually because the connection dropped).
// A quiet panel in the event's colour, not a broken-image icon; the photo comes back by
// itself when the connection does.
const PhotoUnavailable=({tint,compact})=>{
    return (
        <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center"
            style={{backgroundColor:'color-mix(in srgb,'+(tint||'#3355FF')+' 14%,#151518)'}}
        >
            <Icon name="imageOff" size={compact?18:22} className="text-ash"/>
            {compact?null:<span className="label-mono text-ash">Photo unavailable</span>}
        </div>
    );
};

export default PhotoUnavailable;
