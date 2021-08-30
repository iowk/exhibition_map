import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import './index.css';

const containerStyle = {
    width: '400px',
    height: '400px'
};
  
const center = {
    lat: 38.702153249882926,
    lng: -0.48110166784168
};

class InfoBlock extends Component{
    render(){
        return(
            <div id="infoBlock">InfoBlock</div>
        )
    }
}
class Map extends Component{
    render(){        
        return(
            <div id="map"> Map
            <LoadScript googleMapsApiKey="AIzaSyCD6M5vVw8HLQ0O-xk2uqIbKYYlgoCicpI">
                <GoogleMap
                containerStyle={containerStyle}
                center={center}
                zoom={15}
                >
                </GoogleMap>
            </LoadScript>
            </div>
        )
    }
}
class Index extends Component{
    render(){        
        return(
            <div>
                <InfoBlock />
                <Map />
            </div>
        )
    }
}

ReactDOM.render(<Index />, document.getElementById('root'));
