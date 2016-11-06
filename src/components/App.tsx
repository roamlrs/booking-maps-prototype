import * as React from "react";
import { SimpleMap } from './SimpleMap';
import { HotelComponent } from './Hotel';
import { PathInputComponent } from './PathInput';
import { PathComponent } from './Path';
import { DistantInputComponent } from './DistanceInput';
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
    hotels?: Hotel[];
    track?: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;
    minTrack?:  GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;
    distance?: number;
}

export class App extends React.Component<AppProps, AppState> {

    private mapCenter: google.maps.LatLng;

    constructor(props: AppProps){
        super(props);
        this.state = {
            hotels: []
        };
    }

  componentDidUpdate(prevProps: AppProps, prevState: AppState) {
    if (prevState.minTrack !== this.state.minTrack || prevState.distance !== this.state.distance) {
      let path:number[][] = [];
      this.state.minTrack.features.forEach( (feature) => {
        const coordinates = feature.geometry.coordinates;
        if (feature.geometry.type === 'LineString') {
          coordinates.forEach((coord: any) => {
            if (Array.isArray(coord)) {
              path.push([coord[0], coord[1]]);
            }
          });
        } else if (feature.geometry.type === 'MultiLineString') {
          coordinates.forEach((lineStringCoords: any) => {
            if (Array.isArray(lineStringCoords)) {
              lineStringCoords.forEach( (pointArray) => {
                if (Array.isArray(pointArray)) {
                  path.push([pointArray[0], pointArray[1]]);
                }
              })
            }
          });
        }
      });

      fetch(`http://localhost:8080/hotels/alongPath?distance=${this.state.distance}`, {
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
  }

    setBackendHotels(hotelsArray: [BackendHotel]){
      const hotels: Hotel[] = hotelsArray.map( (hotel) => {
            return {
                id: hotel._id,
                position: new google.maps.LatLng(hotel.location.coordinates[1], hotel.location.coordinates[0])
            }
        });
        this.setState({hotels: hotels});
    }

    onDistance(distance: number){
      this.setState({distance: distance});
    }

    setTrack(track: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>){
        // load hotels with lower precision
        const minTrack: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> = simplify(track, 0.004);

        // draw with full precision
        this.setState({hotels: [], track: track, minTrack: minTrack});
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
                <div style={ {position: 'absolute', zIndex: 1, background: 'white', padding: '0.5em'} }>
                  <button onClick={ () => {this.searchHotels()}}>Show Hotels in center of the map</button>

                  <PathInputComponent onTrack={ (track) => this.setTrack(track)}/>

                  <DistantInputComponent onDistance={ (distance) => this.onDistance(distance)}/>
                </div>
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