import * as React from "react";
import { SimpleMap } from './SimpleMap';
import { HotelComponent } from './Hotel';
import { PathInputComponent } from './PathInput';
import { PathComponent } from './Path';
import * as  simplify from 'simplify-geojson';

export interface BackendHotel {
    _id: string;
    location: {
       coordinates: number[];
    };
    name: string;
    photo_url: string;
    hotel_url: string;
}

export interface Hotel {
    id: string;
    position: google.maps.LatLng;
}

export interface AppProps {
}

export interface AppState {
    hotels: Hotel[];
    track: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;
}

export class App extends React.Component<AppProps, AppState> {

    private mapCenter: google.maps.LatLng;

    constructor(props: AppProps){
        super(props);
        this.state = {
            hotels: [],
            track: null
        };
    }

    setBackendHotels(hotelsArray: [BackendHotel]){
        console.log(hotelsArray);
        const hotels: Hotel[] = hotelsArray.map( (hotel) => {
            return {
                id: hotel._id,
                position: new google.maps.LatLng(hotel.location.coordinates[1], hotel.location.coordinates[0])
            }
        });

        this.setState({hotels: hotels, track: this.state.track});
    }

    setTrack(track: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>){
        // load hotels with lower precision
        const minTrack = simplify(track, 0.004);

        // draw with full precision
        this.setState({hotels: [], track: track});



        let path:number[][] = [];
        const coordinates = minTrack.features[0].geometry.coordinates;
        coordinates.forEach( (coord: any) => {
            path.push([coord[0], coord[1]]);
        });

        fetch(`http://localhost:8080/hotels/alongPath?distance=2000`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(path)
        }).then( (response)  => {
            return response.json()
        }).then((hotelsArray) => {
            this.setBackendHotels(hotelsArray);
        });
    }

    searchHotels(){
        const location = this.mapCenter;
        this.setState({hotels: [], track: this.state.track});
        fetch(`http://localhost:8080/hotels/aroundlocation?point=${location.lng()},${location.lat()}&distance=15000`)
            .then( (response)  => {
                return response.json()
            }).then((hotelsArray) => {
                this.setBackendHotels(hotelsArray);
            });
    }

    render(){
        return (
            <div>
                <button onClick={ () => {this.searchHotels()}}>Show Hotels in center of the map</button>

                <PathInputComponent onTrack={ (track) => this.setTrack(track)}/>

                <SimpleMap
                    zoom={5}
                    onMove={ (center: google.maps.LatLng) => { this.mapCenter = center}}
                    onClick={ (latLng: google.maps.LatLng) => { console.log(latLng.lat(), latLng.lng())} }
                >
                    {
                        this.state.hotels.map((hotel: Hotel) => (
                            <HotelComponent key={ hotel.id } position={ hotel.position } />
                        ))
                    }

                    <PathComponent track={ this.state.track } />

                </SimpleMap>
            </div>
        );
    }

}