import React, { useState, useEffect, useCallback } from 'react';
import './main.css';
import axios from './axios';
import Map from './components/map'
import { getLSItem, jwtVerify } from './auth';
import { SearchBar, SearchResultList } from './components/search';
import Landmark from './components/landmark';
import AddLandmark from './components/addLandmark';
import Content from './components/content';
import AddContent from './components/addContent';

function Main(props) {
    // Full main page
    const [phase, setPhase] = useState('initial');
    const [user, setUser] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [addedMarker, setAddedMarker] = useState(null); //latlng
    const [curLandmarkId, setCurLandmarkId] = useState(); // Currently clicked landmark
    const [curContentId, setCurContentId] = useState(); // Currently clicked content
    const [center, setCenter] = useState({
        lat: 25.04452274013203,
        lng: 121.52982217234694,
    }); // Map center coordinates
    const [searchResult, setSearchResult] = useState([]);
    const [initialSearchResult, setInitialSearchResult] = useState([]);
    useEffect(() => {
        // Load center from localstorage if exists
        const ls_center = getLSItem('map_center');
        if(ls_center && ls_center.lat && ls_center.lng) setCenter(ls_center);
    }, [])
    useEffect(() => {
        // Set initial search results
        const fetchData = async() => {
            try{
                const res = await axios().post('/map/search/', JSON.stringify({
                    lat: center.lat,
                    lng: center.lng,
                    pattern: '',
                    count: 10,
                    thres: 0
                }),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                const res_data = await res.data;
                setInitialSearchResult(res_data);
            }
            catch (e) {
                console.log(e);
            }
        }
        if(phase==='initial' && center.lat && center.lng) fetchData();
    }, [center, phase])
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
    useEffect(() => {
        jwtVerify()
        .then((is_valid) => {
            if(is_valid) setUser(getLSItem('user'));
            else setUser(null);
        })
        .catch((e) => {
            console.log(e);
        });
    }, [phase])
    const handleSetCenter = useCallback((center_)=>{
        setCenter(center_);
    },[]);
    const handleAddLandmark = useCallback((added_marker)=>{
        setAddedMarker(added_marker);
        setPhase('addLandmark');
    },[]);
    const handleToInitial = useCallback(()=>{
        setPhase('initial');
    },[]);
    const handleSearch = useCallback((pattern)=>{
        if(pattern===''){
            setPhase('initial');
        }
        else{
            setPhase('search');
            axios().post('/map/search/', JSON.stringify({
                lat: center['lat'],
                lng: center['lng'],
                pattern: pattern,
                count: 10,
                thres: 0.001
            }),
            {
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(res => {
                setSearchResult(res.data);
            })
            .catch(e => {
                console.log(e);
            });
        }
    },[center]);
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
        child = <SearchResultList
            searchResult = {initialSearchResult}
            handleToLandmark = {handleToLandmark}
            handleToContent = {handleToContent}
        />;
    }
    else if(phase==='search'){
        child = <SearchResultList
            searchResult = {searchResult}
            handleToLandmark = {handleToLandmark}
            handleToContent = {handleToContent}
        />;
    }
    else if(phase==='landmark'){
        child = <Landmark
            user = {user}
            handleSetUser = {setUser}
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
            handleSetUser = {setUser}
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
            handleSetUser = {setUser}
            handleSetCenter = {setCenter}
            addedMarker = {addedMarker}
        />;
    }
    else if(phase==='addContent'){
        child = <AddContent
            user = {user}
            handleSetUser = {setUser}
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