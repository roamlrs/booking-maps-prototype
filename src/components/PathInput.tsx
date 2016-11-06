import * as React from "react";
import * as toGeoJson from 'togeojson';

export interface PathInputProps {
    onTrack?: (track: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>) => void;
}

export class PathInputComponent extends React.Component<PathInputProps, {}> {

    public static defaultProps: PathInputProps = {
        onTrack: (track) => { console.log(track)}
    };

    componentDidMount(){
        this.refs.fileInput.onchange = (e: Event) => {
            const file = this.refs.fileInput.files[0];
            console.log(file);
            if (file) {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = (evt) => {
                    let track: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>
                    const rawText = reader.result;
                    if (file.name.endsWith('geojson')){
                        track = JSON.parse(rawText);
                    } else if( file.name.endsWith('gpx') ) {
                        let gpxDom = (new DOMParser()).parseFromString(rawText, 'text/xml');
                        track = toGeoJson.gpx(gpxDom);
                    } else if (file.name.endsWith('kml') ) {
                        let kmlDom = (new DOMParser()).parseFromString(rawText, 'text/xml');
                        track = toGeoJson.kml(kmlDom);
                        console.log(track);
                    } else {
                        console.error(`unknow file extension ${file.name}`);
                    }

                    this.props.onTrack(track);
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