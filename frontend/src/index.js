import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './index.css';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const containerStyle = {
    width: '98vw',
    height: '100vh'
};

const center = {
    lat: 38.702153249882926,
    lng: -0.48110166784168
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

const zoom = 15;
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isInitial: true,
            landmarks: {},
            curLandmarkId: 0,
        };
    }
    async componentDidMount() {
        try{
            const res = await fetch('http://localhost:8000/map/landmarks/');            
            const landmarks = await res.json();
            this.setState({landmarks: landmarks});
        } catch (e) {
            console.log(e);
        }
    }
    handleClickLandmark = (landmarkId) => {
        this.setState({curLandmarkId: landmarkId, isInitial: false});    
    }
    render() {
        return(
            <div>
                <div id="infoBlock">
                    <InfoBlock
                        isInitial = {this.state.isInitial}
                        curLandmarkId = {this.state.curLandmarkId}
                    />
                </div>
                <div id="map">
                    <Map 
                        landmarks = {this.state.landmarks}
                        handleClickLandmark = {this.handleClickLandmark}
                    />
                </div>
            </div>
        );
    }
}
class InfoBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isInitial: true,
            curLandmarkId: 0,
            landmark: {},
            contents: {}
        };
    }
    async componentDidUpdate() {
        try{
            if(!(this.props.isInitial) && this.state.curLandmarkId!==this.props.curLandmarkId){
                const res_lm = await fetch('http://localhost:8000/map/landmarks/' + this.props.curLandmarkId.toString() + '/');            
                const landmark = await res_lm.json();
                const res_cons = await fetch('http://localhost:8000/map/landmarks/' + this.props.curLandmarkId.toString() + '/contents/');            
                const contents = await res_cons.json();
                this.setState({curLandmarkId: this.props.curLandmarkId});
                this.setState({isInitial: false});
                this.setState({landmark: landmark});
                this.setState({contents: contents});
            }            
        } catch (e) {
            console.log(e);
        }
    }
    setLandmarkBox(landmark) {
        return <Landmark
            key={landmark['name']}
            name={landmark['name']}
            link={landmark['link']}
            coverImageSrc={landmark['coverImageSrc']}
            avgRating={landmark['avgRating']}
        />;
    }
    setContentBox(content) {
        return <Content
            key={content['name']}
            name={content['name']}
            startDate={content['startDate']}
            endDate={content['endDate']}
            link={content['link']}
            coverImageSrc={content['coverImageSrc']}
            avgRating={content['avgRating']}
        />;
    }
    render() {
        if(this.state.isInitial){
            return(
                <div> InfoBlock </div>
            );
        }
        else{
            var children = [];
            if(Object.keys(this.state.landmark).length > 0){
                children.push(this.setLandmarkBox(this.state.landmark));
            }            
            for(var key in this.state.contents) {
                if(this.state.contents[key]['isGoing']){                    
                    children.push(this.setContentBox(this.state.contents[key]));
                }
            }
            return (
                <div>
                    {children}
                </div>
            );   
        }
         
    }
}
class Map extends Component {
    setMarker(landmark) {
        const onClickMarker = (e) => {
            this.props.handleClickLandmark(landmark['id']);
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
    render() {
        var children = [];
        for(var key in this.props.landmarks) {
            children.push(this.setMarker(this.props.landmarks[key]));
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
                    addChild={this.props.landmarks.length}
                >
                    {children}
                </GoogleMap>
            </LoadScript>
        );
    }
}

class Landmark extends Component{
    render() {
        return (
            <div className="landmarkInfo">
                <h1>{this.props.name}</h1>                
                <img src={this.props.coverImageSrc} alt="Not found"></img>
                <a href={this.props.link}>
                    <div className="link">{this.props.link}</div>
                </a>
                <div className='rating'>
                    <p>Rating: {this.props.avgRating}</p>
                    <Popup trigger={<button className='addCommentButton'>Add comment</button>}
                    position="right center"
                    modal>
                        {close => (
                        <div className="modal">
                            <button className="close" onClick={close}> 
                                &times; 
                            </button>
                            <div className="writeRating">
                                <div className='commentBlockTitle'>Rating</div>
                                <div //TODO
                                ></div>
                            </div>
                            <div className="writeComment">
                                <div className='commentBlockTitle'>Comment</div>
                                <div //TODO
                                ></div>
                            </div>
                            <div className="submitButton">
                            <button 
                                className="button"
                                // TODO
                                onClick={() => {close();}}>
                                Submit
                            </button>
                            </div>
                            <div className="closeButton">
                            <button 
                                className="button"
                                onClick={() => {close();}}>
                                Close
                            </button>
                            </div>
                        </div>)}
                    </Popup>
                </div>
            </div>
        );        
    }
}
class Content extends Component {
    render() {
        return (
            <div className="contentInfo">
                <img src={this.props.coverImageSrc} alt="Not found"></img>
                <div className="des">
                    <h1>{this.props.name}</h1>
                    <p>{this.props.startDate} ~ {this.props.endDate}</p>
                    <a href={this.props.link}>
                        <div className="link">{this.props.link}</div>
                    </a>      
                    <p>Rating: {this.props.avgRating}</p>
                </div>
            </div>
        );        
    }
}
ReactDOM.render(<Index />, document.getElementById('root'));