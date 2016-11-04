import * as React from "react";

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
            if (file) {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = (evt) => {
                    const jsonText = reader.result;
                    const track: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> = JSON.parse(jsonText);
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