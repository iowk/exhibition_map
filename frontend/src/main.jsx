import React, { Component } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './main.css';
import Popup from 'reactjs-popup';
import {backendPath} from './settings';

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

const zoom = 15;
class Main extends Component {
    // Full main page
    constructor(props) {
        super(props);
        this.state = {
            isInitial: true, // Initial main page without landmark clicked
            landmarks: {}, // All landmarks on the map
            curLandmarkId: 0, // ID of currently clicked landmark
        };
    }
    async componentDidMount() {
        // GET all landmarks on the map
        try{
            const res = await fetch(backendPath+'/map/landmarks/');            
            const landmarks = await res.json();
            this.setState({landmarks: landmarks});
        } catch (e) {
            console.log(e);
        }
    }
    handleClickLandmark = (landmarkId) => {
        // Landmark is clicked on
        this.setState({curLandmarkId: landmarkId, isInitial: false});    
    }
    render() {
        return(
            <div>
                <div id="infoBlock">
                    {/* Block containing landmark information */}
                    <InfoBlock
                        isInitial = {this.state.isInitial}
                        curLandmarkId = {this.state.curLandmarkId}
                    />
                </div>
                <div id="map">
                    {/* Map */}
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
    // Block containing landmark information 
    constructor(props) {
        super(props);
        this.state = {
            isInitial: true, // Initial main page without landmark clicked
            curLandmarkId: 0, // ID of currently clicked landmark
            landmark: {}, // Currently clicked landmark
            contents: {}, // Contents of the currently clicked landmark
        };
    }
    async componentDidUpdate() {
        try{
            if(!(this.props.isInitial) && this.state.curLandmarkId!==this.props.curLandmarkId){
                // GET landmarks
                const res_lm = await fetch(backendPath+'/map/landmarks/'+this.props.curLandmarkId.toString()+'/');            
                const landmark = await res_lm.json();
                // GET contents
                const res_cons = await fetch(backendPath+'/map/landmarks/'+this.props.curLandmarkId.toString()+'/contents/');            
                const contents = await res_cons.json();
                // Set state for InfoBlock
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
            lmid={landmark['id']}
            key={landmark['name']}
            name={landmark['name']}
            link={landmark['link']}
            coverImageSrc={landmark['coverImageSrc']}
            avgRating={landmark['avgRating']}
        />;
    }
    setContentBox(lmid, content) {
        return <Content
            lmid={lmid}
            ctid={content['id']}
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
            // Initial main page without landmark clicked
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
                    // Ongoing event content       
                    children.push(this.setContentBox(this.state.curLandmarkId,this.state.contents[key]));
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
                    <div><PopupBlock
                    lmid={this.props.lmid}
                    name={this.props.name}
                    /></div>
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
class WriteRatingBlock extends Component {
    // Inside PopupBlock
    setRatingBox() {
        var children = [];
        children.push(<div className='ratingTitle' key='ratingTitle'>Rating</div>)
        // There are (this.props.rating) filled rating icons
        for(let i = 1 ; i <= this.props.rating ; ++i){
            let cur=i;
            children.push(<div className='button' key={cur}><button 
            onClick={() => this.props.handleClickRating(cur)}
            className='filledRating'>
                </button></div>);
        }
        // There are (maxRating - this.props.rating) empty rating icons
        for(let i = this.props.rating+1 ; i <= this.props.maxRating ; ++i){
            let cur=i;
            children.push(<div className='button' key={cur}><button 
            onClick={() => this.props.handleClickRating(cur)}
            className='emptyRating'>
                </button></div>);
        }
        return (
            <div className='ratingBox'>{children}</div>
        );
    }
    render() {
        return(
            this.setRatingBox()
        );
    }
}
class WriteCommentBlock extends Component {
    // Inside PopupBlock
    setCommentBox() {
        return (
            <textarea
                placeholder='Add comment'
                value={this.props.comment}
                onChange={this.props.handleWriteComment}
                className='commentBox'
            />
        );
    }
    render() {
        return(
            this.setCommentBox()
        );
    }
}
class PopupBlock extends Component {
    // Pop up when user clicks the comment button for landmark or content
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            lmid: 0,
            rating: 0,
            maxRating: 5,
            comment: ''
        };
    }
    handleClickRating = (rating) => {
        console.log("Rating:", rating);
        this.setState({rating: rating});
    }
    handleWriteComment = (event) => {
        console.log(event.target.value);
        this.setState({comment: event.target.value});
    }
    _handleSubmit = (event) => {
        // POST rating and comment
        fetch(backendPath+'/map/landmarks/'+this.props.lmid+'/comments/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rating: this.state.rating,
                comment: this.state.comment
            })
        });
        event.preventDefault();
        console.log("Submit");
    }
    render() {
        return(
        <Popup trigger={<button className='addCommentButton'>Add comment</button>}
        position="right center"
        modal>
            {close => (
            <div className="modal">
                <button className="close" onClick={close}> 
                    &times; 
                </button>
                <div className="title">
                    {this.props.name}
                </div>
                <form onSubmit={this._handleSubmit.bind(this)}
                className='popupForm'>
                <WriteRatingBlock
                    rating={this.state.rating}
                    maxRating={this.state.maxRating}
                    handleClickRating={this.handleClickRating}
                />
                <WriteCommentBlock
                    comment={this.state.comment}
                    handleWriteComment={this.handleWriteComment}
                />
                <button type="submit" className='popupSubmitButton'>
                    Submit
                </button>
                </form>
            </div>)}
        </Popup>
        );
    }
}
export default Main;