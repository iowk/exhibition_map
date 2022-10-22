import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './map.css';
import { GOOGLE_MAP_API_KEY } from '../settings';

const zoom = 15;

const containerStyle = {
    // Map container style
    width: '100%',
    height: '100%'
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
    function setAddedMarker(latlng) {
        return <Marker
            key='-1'
            position={{lat: latlng.lat(), lng:latlng.lng()}}
        />;
    }
    function setMarker(landmark) {
        const onClickMarker = (e) => {
            props.handleClickLandmark(landmark['id']);
        };
        return <Marker
            key={landmark['id']}
            position={{lat: landmark['lat'], lng: landmark['lng']}}
            title={landmark['name']}
            zIndex={landmark['zIndex']}
            label={
                {text: landmark['contentCount'].toString(), color: "white", fontWeight: 'bold'}
            }
            onClick={onClickMarker}
        />;
    }
    function handleClick(e){
        props.handleAddLandmark(e.latLng);
    }
    var children = [];
    if(props.phase==='addLandmark' && props.addedMarker) {
        children.push(setAddedMarker(props.addedMarker));
    }
    for(var key in props.landmarks) {
        if(props.landmarks[key]['is_visible']){
            children.push(setMarker(props.landmarks[key]));
        }
    }
    return (
        <LoadScript
            googleMapsApiKey={GOOGLE_MAP_API_KEY}//{process.env.REACT_APP_GOOGLE_MAP_API_KEY}
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={props.center}
                zoom={zoom}
                options={mapOptions}
                addChild={props.landmarks.length}
                onClick={(e)=>{handleClick(e)}}
            >
                {children}
            </GoogleMap>
        </LoadScript>
    );
}

export default Map;