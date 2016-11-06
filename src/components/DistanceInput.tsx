import * as React from "react";
import * as toGeoJson from 'togeojson';

export interface DistantInputProps {
  onDistance?: (distance:number) => void;
}

export interface DistantInputState {
  selectedValue?: number;
}

export class DistantInputComponent extends React.Component<DistantInputProps, DistantInputState> {

    public static defaultProps: DistantInputProps = {
      onDistance: (distance: number) => {}
    };

    constructor(props: DistantInputProps){
      super(props);
      this.state = {
        selectedValue: 2000
      };
    }

    componentDidMount(){
      this.props.onDistance(this.state.selectedValue);
    }

  change(event: React.FormEvent<HTMLInputElement>) {
    this.setState({
      selectedValue: (event.target as HTMLInputElement).valueAsNumber
    });
    this.props.onDistance(this.state.selectedValue);
  }


  render() {
        return <div>
            <label htmlFor="distance">Distance (metre):</label>
            <input type="number" id="distance"
                   onChange={ (e) => { this.change(e);} }
                   value={ this.state.selectedValue }></input>
        </div>;
    }

    refs: {
        fileInput: HTMLInputElement;
    };
}