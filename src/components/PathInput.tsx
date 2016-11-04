import * as React from "react";

export interface PathInputProps {
    onPath?: (path: google.maps.Polyline) => void;
}

export class PathInputComponent extends React.Component<PathInputProps, {}> {

    public static defaultProps: PathInputProps = {
        onPath: (path) => { console.log(path)}
    };

    componentDidMount(){
        this.refs.fileInput.onchange = (e: Event) => {
            const file = this.refs.fileInput.files[0];
            if (file) {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = (evt) => {
                    const jsonText = reader.result;
                    const track: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> = JSON.parse(jsonText);

                    console.log(track.features[0].geometry.coordinates);

                    let pathCoordinates: google.maps.LatLngLiteral[] = [];
                    track.features[0].geometry.coordinates.forEach( (coordinate: any) => {
                        const latLngLiteral = {lng: coordinate[0], lat: coordinate[1]};
                        pathCoordinates.push(latLngLiteral);
                    })

                    const path = new google.maps.Polyline({
                        path: pathCoordinates,
                        strokeColor: '#FF0000',
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                    });

                    this.props.onPath(path);

                }
                reader.onerror = function (evt) {
                    console.log(evt);
                }
            }
        };
    }

    render() {
        return <div>
            <label htmlFor="geojsonfile">GEOJson File:</label>
            <input type="file" id="geojsonfile" ref="fileInput"></input>
        </div>;
    }

    refs: {
        fileInput: HTMLInputElement;
    };
}