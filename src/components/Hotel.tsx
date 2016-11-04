import * as React from "react";

export interface HotelProps {
    map?: google.maps.Map;
    position?:google.maps.LatLng;
}

export class HotelComponent extends React.Component<HotelProps, {}> {

    private marker: google.maps.Marker;

    constructor(props: HotelProps){
        super(props);
    }

    componentWillUnmount() {
        console.log('componentWillUnmount', this);
        if (this.marker) {
            this.marker.setMap(null);
        }
    }

    componentDidMount(){
        console.log('componentDidMount', this);
        this.renderMarker();
    }

    componentDidUpdate(prevProps: HotelProps) {
        console.log('componentDidUpdate', prevProps, this.props);
        if ((this.props.map !== prevProps.map) ||
            (this.props.position !== prevProps.position)) {
            this.renderMarker();
        }
    }
    renderMarker() {
        console.log('render marker', this.props.position.lat(), this.props.position.lng());
        const pref = {
            map: this.props.map,
            position: this.props.position
        };
        this.marker = new google.maps.Marker(pref);
    }

    render(): null {
        return null;
    }
}