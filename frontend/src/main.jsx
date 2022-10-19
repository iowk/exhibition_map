import React, { useState, useEffect } from 'react';
import './main.css';
import axios from './axios';
import NavBar from './components/navbar'
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
    const [landmarks, setLandmarks] = useState({});
    const [addedMarker, setAddedMarker] = useState(null); //latlng
    const [curLandmark, setCurLandmark] = useState({});
    const [curContent, setCurContent] = useState({}); // Currently clicked content
    const [center, setCenter] = useState({
        lat: 25.04452274013203,
        lng: 121.52982217234694,
    }); // Map center coordinates
    const [searchResult, setSearchResult] = useState([]);
    const [initialSearchResult, setInitialSearchResult] = useState([]);
    useEffect(() => {
        // Set initial search results
        const fetchData = async() => {
            try{
                const res = await axios().post('/map/search/', JSON.stringify({
                    lat: center['lat'],
                    lng: center['lng'],
                    pattern: '',
                    count: 100,
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
        if(phase==='initial') fetchData();
    }, [center, phase])
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
        if(phase==='initial' || phase==='landmark') fetchData();
    }, [phase])
    useEffect(() => {
        jwtVerify()
        .then((is_valid) => {
            if(is_valid) setUser(JSON.parse(getLSItem('user')));
            else setUser(null);
        })
        .catch((e) => {
            console.log(e);
        });
    }, [phase])
    useEffect(() => {
        if(Object.keys(curLandmark).length > 0){
            setCenter({lat: curLandmark.lat, lng: curLandmark.lng});
        }
    }, [curLandmark])
    function handleClickLandmark(lmid){
        // Landmark is clicked on
        setPhase('landmark');
        if(lmid!==curLandmark.id){
            axios().get('/map/landmarks/'+lmid)
            .then(res => {
                setCurLandmark(res.data);
            })
            .catch(e => {
                console.log(e);
            });
        }
    }
    function handleAddLandmark(added_marker){
        setAddedMarker(added_marker);
        setPhase('addLandmark');
    }
    function handleToInitial() {
        setPhase('initial');
    }
    function handleSearch(pattern) {
        if(pattern===''){
            setPhase('initial');
        }
        else{
            setPhase('search');
            axios().post('/map/search/', JSON.stringify({
                lat: center['lat'],
                lng: center['lng'],
                pattern: pattern,
                count: 100,
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
    }
    function handleToLandmark(lm) {
        setCurLandmark(lm);
        setCenter({lat: lm.lat, lng: lm.lng});
        setPhase('landmark');
    }
    function handleToContent(ct) {
        setCurContent(ct);
        if(ct.landmark_id!==curLandmark.id){
            axios().get('/map/landmarks/'+ct.landmark_id)
            .then(res => {
                setCurLandmark(res.data);
            })
            .catch(e => {
                console.log(e);
            });
        }
        setCenter({lat: ct.lat, lng: ct.lng});
        setPhase('content');
    }
    function handleToAddContent() {
        setPhase('addContent');
    }
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
            landmark = {curLandmark}
            handleToInitial = {handleToInitial}
            handleToContent = {handleToContent}
            handleToAddContent = {handleToAddContent}
        />;
    }
    else if(phase==='content'){
        child = <Content
            user = {user}
            handleSetUser = {setUser}
            landmark = {curLandmark}
            content = {curContent}
            handleToLandmark = {handleToLandmark}
        />;
    }
    else if(phase==='addLandmark'){
        child = <AddLandmark
            user = {user}
            handleSetUser = {setUser}
            handleSetCenter = {setCenter}
            addedMarker = {addedMarker}
        />;
    }
    else if(phase==='addContent'){
        child = <AddContent
            user = {user}
            handleSetUser = {setUser}
            landmark = {curLandmark}
            handleToLandmark = {handleToLandmark}
        />;
    }
    return(
        <div id="main">
            <div id="navbar">
                {<NavBar user = {user}/>}
            </div>
            <div id='searchBar'>
                <SearchBar
                    handleSearch = {handleSearch}
                />
            </div>
            <div id="infoBlock">
                {/* Block containing landmark information */}
                {child}
            </div>
            <div id="map">
                {/* Map */}
                <Map
                    phase = {phase}
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