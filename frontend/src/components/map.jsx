import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './map.css';

const zoom = 15;

const containerStyle = {
    // Map container style
    width: '98vw',
    height: '100vh'
};

const center = {
    // Map center coordinate
    lat: 25.04452274013203, 
    lng: 121.52982217234694,
};

const mapOptions = {
    styles: [
        {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]  // Turn off points of interest.
        },
        {
            featureType: 'landscape',
            stylers: [{ visibility: 'off' }]  // Turn off landscapes.
        },
        {
            featureType: 'road',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }]  // Turn off landscapes.
        },
    ],
    disableDoubleClickZoom: true,
    mapTypeControl: false,
    streetViewControl: false,
}

function Map(props) {
    function setMarker(landmark) {
        const onClickMarker = (e) => {
            props.handleClickLandmark(landmark['id']);
        };
        return <Marker
            key={landmark['name']}
            position={{lat: landmark['lat'], lng: landmark['lng']}}
            title={landmark['name']}
            zIndex={landmark['zIndex']}
            label={
                {text: landmark['contentCount'].toString(), color: "white", fontWeight: 'bold'}
            }
            onClick={onClickMarker}
        />;
    }
    var children = [];
    for(var key in props.landmarks) {
        children.push(setMarker(props.landmarks[key]));
    }        
    return (
        <LoadScript
            googleMapsApiKey="AIzaSyCD6M5vVw8HLQ0O-xk2uqIbKYYlgoCicpI"
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                options={mapOptions}
                addChild={props.landmarks.length}
            >
                {children}
            </GoogleMap>
        </LoadScript>
    );
}

export default Map;