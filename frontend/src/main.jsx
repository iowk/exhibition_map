import React, { Component } from 'react';
import './main.css';
import axios from './axios';
import NavBar from './components/navbar'
import Map from './components/map'
import InfoBlock from './components/infoblock'
import { jwtVerify } from './auth';

class Main extends Component {
    // Full main page
    constructor(props) {
        super(props);
        this.state = {
            isInitial: true, // Initial main page without landmark clicked
            isVerified: true,
            landmarks: {}, // All landmarks on the map
            curLandmarkId: 0, // ID of currently clicked landmark
        };
    }
    async componentDidMount() {
        // GET all landmarks on the map
        try{
            await jwtVerify();
            this.setState({isVerified: true});
            const res = await axios().get('/map/landmarks/');  
            const landmarks = await res.data;
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
                {this.state.isVerified && <NavBar></NavBar>}            
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

export default Main;