import React, { useState, useEffect, useCallback } from 'react';
import './main.css';
import axios from './axios';
import Map from './components/map'
import { getLSItem } from './auth';
import { SearchBar, SearchResultList } from './components/search';
import Landmark from './components/landmark';
import AddLandmark from './components/addLandmark';
import Content from './components/content';
import AddContent from './components/addContent';

function Main(props) {
    // Full main page
    const user = getLSItem('user');
    const [phase, setPhase] = useState('initial');
    const [markers, setMarkers] = useState([]);
    const [addedMarker, setAddedMarker] = useState(null); //latlng
    const [curLandmarkId, setCurLandmarkId] = useState(); // Currently clicked landmark
    const [curContentId, setCurContentId] = useState(); // Currently clicked content
    const [searchPattern, setSearchPattern] = useState('');
    const [center, setCenter] = useState({
        lat: 25.04452274013203,
        lng: 121.52982217234694,
    }); // Map center coordinates
    useEffect(() => {
        // Load center from localstorage if exists
        const ls_center = getLSItem('map_center');
        if(ls_center && ls_center.lat && ls_center.lng) setCenter(ls_center);
    }, [])
    useEffect(() => {
        // GET all landmarks on the map
        const fetchData = async() => {
            try{
                const res = await axios().get('/map/markers/');
                const markers_data = await res.data;
                setMarkers(markers_data);
            }
            catch (e) {
                console.log(e);
            }
        }
        fetchData();
    }, [])
    const handleSetCenter = useCallback((center_)=>{
        setCenter(center_);
        localStorage.setItem('map_center', JSON.stringify(center_));
    },[]);
    const handleAddLandmark = useCallback((added_marker)=>{
        setAddedMarker(added_marker);
        setPhase('addLandmark');
    },[]);
    const handleToInitial = useCallback(()=>{
        setPhase('initial');
    },[]);
    const handleSearch = useCallback((pattern)=>{
        setSearchPattern(pattern);
        if(pattern===''){
            setPhase('initial');
        }
        else{
            setPhase('search');
        }
    },[]);
    const handleToLandmark = useCallback((lmid)=>{
        setCurLandmarkId(lmid);
        setPhase('landmark');
    },[]);
    const handleToContent = useCallback((ctid)=>{
        setCurContentId(ctid);
        setPhase('content');
    },[]);
    const handleToAddContent = useCallback(()=>{
        setPhase('addContent');
    },[]);
    var child;
    if(phase==='initial'){
        // Might be changed
        child = <SearchResultList
            searchPattern = ''
            thres = {0}
            count = {10}
            center = {center}
            handleToLandmark = {handleToLandmark}
            handleToContent = {handleToContent}
        />;
    }
    else if(phase==='search'){
        child = <SearchResultList
            searchPattern = {searchPattern}
            thres = {0.001}
            count = {10}
            center = {center}
            handleToLandmark = {handleToLandmark}
            handleToContent = {handleToContent}
        />;
    }
    else if(phase==='landmark'){
        child = <Landmark
            user = {user}
            lmid = {curLandmarkId}
            handleToInitial = {handleToInitial}
            handleToContent = {handleToContent}
            handleToAddContent = {handleToAddContent}
            handleSetCenter = {handleSetCenter}
        />;
    }
    else if(phase==='content'){
        child = <Content
            user = {user}
            lmid = {curLandmarkId}
            ctid = {curContentId}
            handleToLandmark = {handleToLandmark}
            handleSetCenter = {handleSetCenter}
        />;
    }
    else if(phase==='addLandmark'){
        child = <AddLandmark
            user = {user}
            handleToInitial = {handleToInitial}
            handleSetCenter = {handleSetCenter}
            addedMarker = {addedMarker}
        />;
    }
    else if(phase==='addContent'){
        child = <AddContent
            user = {user}
            lmid = {curLandmarkId}
            handleToLandmark = {handleToLandmark}
        />;
    }
    return(
        <div id="main">
            <div id='searchBar'>
                <SearchBar
                    handleSearch = {handleSearch}
                />
            </div>
            <div id="infoBlock">
                {/* Block containing information */}
                {child}
            </div>
            <div id="map">
                {/* Map */}
                <Map
                    phase = {phase}
                    center = {center}
                    markers = {markers}
                    addedMarker = {addedMarker}
                    handleClickLandmark = {handleToLandmark}
                    handleAddLandmark = {handleAddLandmark}
                />
            </div>
        </div>
    );
}

export default Main;