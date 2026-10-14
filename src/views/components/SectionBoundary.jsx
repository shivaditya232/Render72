import {Component} from 'react';

// If one section of a page throws while rendering, only that section is replaced
// with a quiet note. The rest of the page keeps working.
class SectionBoundary extends Component{
    constructor(props){
        super(props);
        this.state={hasError:false};
        this.reset=this.reset.bind(this);
    }

    static getDerivedStateFromError(){
        return {hasError:true};
    }

    componentDidCatch(error){
        if(typeof console!=='undefined'){
            console.error('[Render72] A section failed to render:',error);
        }
    }

    reset(){
        this.setState({hasError:false});
    }

    render(){
        if(this.state.hasError){
            return (
                <div role="alert" className="rounded-xl border border-line px-5 py-4 text-sm text-ash">
                    {this.props.label?this.props.label+' couldn’t be shown.':'This part couldn’t be shown.'}{' '}
                    <button type="button" onClick={this.reset} className="font-semibold text-signal-soft transition-colors hover:text-bone">
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default SectionBoundary;
