import * as React from "react";
import * as ReactDOM from 'react-dom';
import { HotelProps } from './Hotel';

const style = {
    width: '100vw',
    height: '100vh'
};

export interface SimpleMapProps {
    zoom?: number;
    initialCenter?: google.maps.LatLng;
    children?: any;
    onMove?: (center: google.maps.LatLng) => void;
    onClick?: (latLng: google.maps.LatLng) => void;
}

export interface SimpleMapState {
    currentZoom?: number;
    currentLocation: google.maps.LatLng;
}

export class SimpleMap extends React.Component<SimpleMapProps, SimpleMapState> {

    private map: google.maps.Map;

    public static defaultProps: SimpleMapProps = {
        zoom: 14,
        initialCenter: new google.maps.LatLng(37.774929, -122.419416),
        onMove: (map) => {},
        onClick: (latLng) => {}
    };

    constructor(props: SimpleMapProps) {
        super(props);

        this.state = {
            currentLocation: props.initialCenter,
            currentZoom: props.zoom
        }
    }

    refs: {
        map: Element;
    };

    componentDidMount(){

        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const coords = pos.coords;
                this.setState({
                    currentLocation: new google.maps.LatLng(coords.latitude, coords.longitude)
                });
            })
        }


        const node = ReactDOM.findDOMNode(this.refs.map);

        const mapConfig = {
            center: this.state.currentLocation,
            zoom: this.state.currentZoom
        };
        this.map = new google.maps.Map(node, mapConfig);

        // set the initial center position
        this.props.onMove(this.map.getCenter());
        this.map.addListener('dragend', (evt) => {
            this.props.onMove(this.map.getCenter());
        });

        this.map.addListener('click', (evt) => {
            this.props.onClick(evt.latLng);
        });
    }

    componentDidUpdate(prevProps: SimpleMapProps, prevState: SimpleMapState) {
        if (prevState.currentLocation !== this.state.currentLocation) {
            this.map.panTo(this.state.currentLocation);
            // set the center position if moved programmatocally
            this.props.onMove(this.map.getCenter());
        }
    }

    renderChildren() {

        const {children} = this.props;
        if (!children) return;

        console.log('render children', this.props.children);

        return React.Children.map(children, (c: React.ReactElement<HotelProps>) => {

            const hotelElm =  React.cloneElement<HotelProps, {}>(c, {
                map: this.map
            });
            console.log(hotelElm);
            return hotelElm;
        })

    }

    render() {
        return <div style={style} ref='map'>{this.renderChildren()}</div>;
    }

}

