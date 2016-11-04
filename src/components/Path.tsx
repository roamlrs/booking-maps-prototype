import * as React from "react";

export interface PathProps {
    map?: google.maps.Map;
    path?:google.maps.Polyline;
}

export class PathComponent extends React.Component<PathProps, {}> {


    constructor(props: PathProps){
        super(props);
    }

    componentWillUnmount() {
        console.log('componentWillUnmount - path', this);
        if (this.props.path) {
            this.props.path.setMap(null);
        }
    }

    componentDidUpdate(prevProps: PathProps) {
        console.log('componentDidUpdate path', prevProps, this.props);
        if ((this.props.map !== prevProps.map) ||
            (this.props.path !== prevProps.path)) {
            if(this.props.path && this.props.map){
                this.props.path.setMap(this.props.map);

                var bounds = new google.maps.LatLngBounds();
                this.props.path.getPath().forEach( (coord) => {
                    bounds.extend(coord);
                })
                this.props.map.fitBounds(bounds);
            }
        }
    }

    render(): null {
        return null;
    }
}