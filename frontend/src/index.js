import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './index.css';

const containerStyle = {
    width: '99vw',
    height: '100vh'
};

const center = {
    lat: 38.702153249882926,
    lng: -0.48110166784168
};

const landmarks = [
    {name: "Consum", position: {lat: 38.70039599319901, lng: -0.4797770029944214}, zIndex: 1, content: ['Apple', 'Banana']},
    {name: "CADA", position: {lat: 38.69562896821003, lng: -0.4758602179038965}, zIndex: 1, content: ['Show']},
]

function updateContent(content) {
    this.setState({isInitial: false, content: content})
}

class InfoBlock extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isInitial: true,
            content: {},
        }
        updateContent = updateContent.bind(this)
    }
    render() {
        if(this.state.isInitial){
            return(
                <div>
                    InfoBlock
                </div>
            );
        }
        return(
            <div>
                Content: {this.state.content[0]}
            </div>
        );     
    }
}

class Map extends Component {
    setMarker(landmark) {
        var contentCount = landmark['content'].length;
        /*for(content in landmark['content']){
            if("{{content.isGoing}}" == "True") contentCount+=1;
        }*/
        const onClickMarker = (e) => {
            updateContent(landmark['content']);
        };
        return <Marker
            position={landmark['position']}
            title={landmark['name']}
            zIndex={landmark['zIndex']}
            label={
                {text: contentCount.toString(), color: "white", fontWeight: 'bold'}
            }
            onClick={onClickMarker}
        />;
    }
    render() {
        const children = [];
        for(let landmark of landmarks){            
            children.push(
                this.setMarker(landmark)
            );
        }
        return (
            <LoadScript
                googleMapsApiKey="AIzaSyCD6M5vVw8HLQ0O-xk2uqIbKYYlgoCicpI"
            >
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={15}
                    addChild={landmarks.length}
                >
                    {children}
                </GoogleMap>
            </LoadScript>
        );
    }
}

class Index extends Component {
    render() {
        return(
            <div>
                <div id="infoBlock">
                    <InfoBlock />
                </div>
                <div id="map">
                    <Map />
                </div>
            </div>
        );
    }
}

ReactDOM.render(<Index />, document.getElementById('root'));