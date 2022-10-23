import React from 'react';
import { GoogleMap, LoadScript, Marker, MarkerClusterer } from '@react-google-maps/api';
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

function ClusterCalculator(markers, numStyles){
    let count = 0;
    markers.forEach((marker) => {
        count += parseInt(marker.label.text);
        //console.log("Marker",marker.contentCount);
    })
    const numberOfDigits = count.toString().length;

    let index = 1;
    if(count > 0) index = Math.min(numberOfDigits+1, numStyles)

    return {
        text: count.toString(),
        index,
        title: '',
    }
  }
const markerClusterOptions = {
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m', // so you must have m1.png, m2.png, m3.png, m4.png, m5.png and m6.png in that folder
    calculator: ClusterCalculator
}

function Map(props) {
    return (
        <LoadScript
            googleMapsApiKey={GOOGLE_MAP_API_KEY}//{process.env.REACT_APP_GOOGLE_MAP_API_KEY}
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={props.center}
                zoom={zoom}
                options={mapOptions}
                onClick={(e)=>{props.handleAddLandmark(e.latLng)}}
            >
                {props.phase==='addLandmark' && props.addedMarker && <Marker
                    key='-1'
                    position={{lat: props.addedMarker.lat(), lng:props.addedMarker.lng()}}
                />}
                <MarkerClusterer options={markerClusterOptions}>
                {(clusterer) =>
                    props.markers.map((marker) => (
                    <Marker key={marker['id']}
                        position={{lat: marker['lat'], lng: marker['lng']}}
                        title={marker['name']}
                        zIndex={marker['zIndex']}
                        label={
                            {text: marker['contentCount'].toString(), color: "white", fontWeight: 'bold'}
                        }
                        onClick={() => {props.handleClickLandmark(marker['id'])}}
                        clusterer={clusterer} />
                    ))
                }
                </MarkerClusterer>
            </GoogleMap>
        </LoadScript>
    );
}

export default Map;