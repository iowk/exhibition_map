import React, { useState, useEffect } from 'react';
import './main.css';
import axios from './axios';
import NavBar from './components/navbar'
import Map from './components/map'
import { getLSItem, jwtVerify } from './auth';
import Landmark from './components/landmark';
import AddLandmark from './components/addLandmark';
import { Content, AddContent } from './components/content';

function Main(props) {
    // Full main page
    const [phase, setPhase] = useState('initial');    
    const [user, setUser] = useState(null);
    const [landmarks, setLandmarks] = useState({});
    const [addedMarker, setAddedMarker] = useState(null); //latlng
    const [curLandmarkId, setCurLandmarkId] = useState(null);
    const [curContent, setCurContent] = useState({}); // Currently clicked content
    const [center, setCenter] = useState({
        lat: 25.04452274013203, 
        lng: 121.52982217234694,
    }); // Map center coordinates
    useEffect(() => {
        // GET all landmarks on the map
        const fetchData = async() => {
            try{                          
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
    useEffect(() => {
        jwtVerify()
        .then((is_valid) => {
            if(is_valid) setUser(JSON.parse(getLSItem('user')));
            else setUser(null);
        })
        .catch((e) => {
            console.log(e);
        });
    }, [props, phase])
    function handleClickLandmark(lmid){
        // Landmark is clicked on
        setCurLandmarkId(lmid);
        setAddedMarker(null);
        setPhase('landmark');
    }
    function handleAddLandmark(latlng){        
        setAddedMarker(latlng);
        setPhase('addLandmark');
    }
    function handleSetUser(usr){
        setUser(usr);
    }
    function handleToInitial() {
        setPhase('initial');
    }
    function handleToLandmark() {
        setPhase('landmark');
    }
    function handleToContent(ct) {
        setPhase('content');
        setCurContent(ct);
    }
    function handleToAddContent() {
        setPhase('addContent');
    }
    var child;
    console.log("Phase:",phase);
    if(phase==='initial'){
        child = <div>
            Please click on a landmark
        </div>;
    }
    else if(phase==='landmark'){
        child = <Landmark
            user = {user}
            handleSetUser = {handleSetUser}
            curLandmarkId = {curLandmarkId}
            handleToInitial = {handleToInitial}
            handleToContent = {handleToContent}
            handleToAddContent = {handleToAddContent}             
        />;
    }
    else if(phase==='content'){
        child = <Content
            user = {user}
            handleSetUser = {handleSetUser}
            curLandmarkId = {curLandmarkId}
            content = {curContent}
            handleToLandmark = {handleToLandmark}
        />;;
    }
    else if(phase==='addLandmark'){
        child = <AddLandmark
            user = {user}
            handleSetUser = {handleSetUser}
            addedMarker = {addedMarker}
        />;;
    }
    else if(phase==='addContent'){
        child = <AddContent
            user = {user}
            handleSetUser = {handleSetUser}
            curLandmarkId = {curLandmarkId}
            handleToLandmark = {handleToLandmark}
        />;;
    }
    return(            
        <div id="main">
            <div id="navbar">
                {<NavBar user = {user}/>}
            </div>
            <div id="infoBlock">
                {/* Block containing landmark information */}
                {child}
            </div>
            <div id="map">
                {/* Map */}
                <Map 
                    center = {center}
                    landmarks = {landmarks}
                    addedMarker = {addedMarker}
                    handleClickLandmark = {handleClickLandmark}
                    handleAddLandmark = {handleAddLandmark}
                />
            </div>
        </div>
    );
}

export default Main;