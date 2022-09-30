import React, { useState, useEffect } from 'react';
import './main.css';
import axios from './axios';
import NavBar from './components/navbar'
import Map from './components/map'
import InfoBlock from './components/infoblock'
import { jwtVerify } from './auth';

function Main(props) {
    // Full main page
    const [isInitial, setIsInitial] = useState(true);
    const [isVerified, setIsVerified] = useState(true);
    const [landmarks, setLandmarks] = useState({});
    const [curLandmarkId, setCurLandmarkId] = useState(0);
    useEffect(() => {
        // GET all landmarks on the map
        const fetchData = async() => {
            try{
                await jwtVerify();
                setIsVerified(true);
                const res = await axios().get('/map/landmarks/');  
                const landmarks = await res.data;
                setLandmarks(landmarks);
            }
            catch (e) {
                console.log(e);
            }
        }
        fetchData();        
    }, [props])
    function handleClickLandmark(landmarkId){
        // Landmark is clicked on
        setCurLandmarkId(landmarkId);
        setIsInitial(false);    
    }
    return(            
        <div>    
            {isVerified && <NavBar></NavBar>}            
            <div id="infoBlock">
                {/* Block containing landmark information */}
                <InfoBlock
                    isInitial = {isInitial}
                    curLandmarkId = {curLandmarkId}
                />
            </div>
            <div id="map">
                {/* Map */}
                <Map 
                    landmarks = {landmarks}
                    handleClickLandmark = {handleClickLandmark}
                />
            </div>
        </div>
    );
}

export default Main;