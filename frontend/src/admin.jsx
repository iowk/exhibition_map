import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import Navigation from './components/navbar'
import {jwtVerify, getLSItem, getToken} from './auth';
import axios from './axios';
import './admin.css';

function AdminLandmark(props){
    const [user, setUser] = useState({});
    const [verifyDone, setVerifyDone] = useState(false);
    const [landmarks, setLandmarks] = useState([]);
    const [children, setChildren] = useState([]);
    useEffect(() =>{
        let isMounted = true;
        const fetchUser = async() => {
            try{
                const is_valid = await jwtVerify();
                if(isMounted){
                    if(is_valid){
                        setUser(getLSItem('user'));
                    }
                    else{
                        setUser(null);
                    }
                }
            }
            catch (e) {
                console.log(e);
                if(isMounted) setUser(null);
            }
        };
        fetchUser().then(() => {
            setVerifyDone(true);
        });
        return () => { isMounted = false };
    }, [props])
    useEffect(() => {
        // GET all landmarks on the map
        const fetchData = async() => {
            try{
                const res = await axios().get('/map/landmarks/');
                const landmarks = await res.data;
                let landmarks_nv = [];
                for(const landmark of landmarks){
                    if(!landmark.is_visible) landmarks_nv.push(landmark);
                }
                setLandmarks(landmarks_nv);
            }
            catch (e) {
                console.log(e);
            }
        }
        fetchData();
    }, [])
    useEffect(() => {
        function setLandmarkBox(landmark){
            return(
                <div key={landmark.id} className='landmarkBox'>
                    <div className='imageDiv'>
                        <img src={landmark.coverImageSrc} alt=""></img>
                    </div>
                    <div className='titleDiv'>
                        <span className='landmarkName'>{landmark.name}</span>
                        <span>Contributor: {landmark.owner}</span>
                    </div>
                    <div className='infoDiv'>
                        <span>lat: {landmark.lat}</span>
                        <span>lng: {landmark.lng}</span>
                        <a href={landmark.link}>
                            <div className="link">{landmark.link}</div>
                        </a>
                    </div>
                    <div className='buttonDiv'>
                        <button className='buttonVerify' onClick={() => handleChangeVisibility(landmark.id, true)}>Verify</button>
                        <button className='buttonDelete' onClick={() => handleChangeVisibility(landmark.id, false)}>Delete</button>
                    </div>
                </div>
            );
        }
        let chs = [];
        for(let key in landmarks) {
            chs.push(setLandmarkBox(landmarks[key]));
        }
        setChildren(chs);
    }, [landmarks]);
    function handleChangeVisibility(lmid, is_verify){
        jwtVerify()
        .then(() => {
            if(is_verify){
                axios(getToken()).patch('/map/landmarks/'+lmid+'/', JSON.stringify({
                    is_visible: true
                }),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                .then(() => {
                    alert("Landmark verified");
                    setLandmarks((current) =>
                        current.filter((landmark) => landmark.id!==lmid)
                    );
                })
                .catch((e) => {
                    console.log(e);
                    alert(e.response.data);
                })
            }
            else{
                axios(getToken()).delete('/map/landmarks/'+lmid+'/',
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                .then(() => {
                    alert("Landmark deleted");
                    setLandmarks((current) =>
                        current.filter((landmark) => landmark.id!==lmid)
                    );
                })
                .catch((e) => {
                    console.log(e);
                    alert(e.response.data);
                })
            }
        })
        .catch((e) => {
            console.log(e);
        });
    }
    if(!verifyDone){
        return(<Navigation user = {user}/>);
    }
    else if(user && user.is_staff) {
        if(children.length === 0){
            return(
                <div>
                    <Navigation user = {user}/>
                    No pending suggestion
                </div>
            );
        }
        return(
            <div>
                <Navigation user = {user}/>
                <div className='adminLandmark'>
                    {children}
                </div>
            </div>
        );
    }
    else{
        if(user) alert("Only staffs are allowed to access this page");
        return(
            <Navigate to="/login/" replace={true} />
        );
    }
}
function AdminContent(props){
    const [user, setUser] = useState({});
    const [verifyDone, setVerifyDone] = useState(false);
    const [contents, setContents] = useState([]);
    const [children, setChildren] = useState([]);
    useEffect(() =>{
        let isMounted = true;
        const fetchUser = async() => {
            try{
                const is_valid = await jwtVerify();
                if(isMounted){
                    if(is_valid){
                        setUser(getLSItem('user'));
                    }
                    else{
                        setUser(null);
                    }
                }
            }
            catch (e) {
                console.log(e);
                if(isMounted) setUser(null);
            }
        };
        fetchUser().then(() => {
            setVerifyDone(true);
        });
        return () => { isMounted = false };
    }, [props])
    useEffect(() => {
        // GET all contents on the map
        const fetchData = async() => {
            try{
                const res = await axios().get('/map/contents/');
                const contents = await res.data;
                let contents_nv = [];
                for(const content of contents){
                    if(!content.is_visible) contents_nv.push(content);
                }
                setContents(contents_nv);
            }
            catch (e) {
                console.log(e);
            }
        }
        fetchData();
    }, [])
    useEffect(() => {
        function setContentBox(content){
            return(
                <div key={content.id} className='contentBox'>
                    <div className='imageDiv'>
                        <img src={content.coverImageSrc} alt=""></img>
                    </div>
                    <div className='titleDiv'>
                        <span className='contentName'>{content.landmark_name}-{content.name}</span>
                        <span>Contributor: {content.owner}</span>
                    </div>
                    <div className='infoDiv'>
                        <span>{content.startDate} ~ {content.endDate}</span>
                        <a href={content.link}>
                            <span className="link">{content.link}</span>
                        </a>
                    </div>
                    <div className='desDiv'>
                        <span>{content.description}</span>
                    </div>
                    <div className='buttonDiv'>
                        <button className='buttonVerify' onClick={() => handleChangeVisibility(content.id, true)}>Verify</button>
                        <button className='buttonDelete' onClick={() => handleChangeVisibility(content.id, false)}>Delete</button>
                    </div>
                </div>
            );
        }
        let chs = [];
        for(let key in contents) {
            chs.push(setContentBox(contents[key]));
        }
        setChildren(chs);
    }, [contents]);
    function handleChangeVisibility(ctid, is_verify){
        jwtVerify()
        .then(() => {
            if(is_verify){
                axios(getToken()).patch('/map/contents/'+ctid+'/', JSON.stringify({
                    is_visible: true
                }),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                .then(() => {
                    alert("Content verified");
                    setContents((current) =>
                        current.filter((content) => content.id!==ctid)
                    );
                })
                .catch((e) => {
                    console.log(e);
                    alert(e.response.data);
                })
            }
            else{
                axios(getToken()).delete('/map/contents/'+ctid+'/',
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                .then(() => {
                    alert("Content deleted");
                    setContents((current) =>
                        current.filter((content) => content.id!==ctid)
                    );
                })
                .catch((e) => {
                    console.log(e);
                    alert(e.response.data);
                })
            }
        })
        .catch((e) => {
            console.log(e);
        });
    }
    if(!verifyDone){
        return(<Navigation user = {user}/>);
    }
    else if(user && user.is_staff) {
        if(children.length === 0){
            return(
                <div>
                    <Navigation user = {user}/>
                    No pending suggestion
                </div>
            );
        }
        return(
            <div>
                <Navigation user = {user}/>
                <div className='adminContent'>
                    {children}
                </div>
            </div>
        );
    }
    else{
        if(user) alert("Only staffs are allowed to access this page");
        return(
            <Navigate to="/login/" replace={true} />
        );
    }
}
export {AdminLandmark, AdminContent};