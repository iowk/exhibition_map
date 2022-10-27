import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from "react-router-dom";
import {jwtVerify, getLSItem, getToken} from './auth';
import Button from 'react-bootstrap/Button';
import axios from './axios';
import './admin.css';

function VerifyLandmark(props){
    const nameRef = useRef();
    const nameEngRef = useRef();
    const latRef = useRef();
    const lngRef = useRef();
    const linkRef = useRef();
    const priceRef  = useRef();
    return(
        <div key={props.landmark.id} className='adminBox'>
            <div className='imageDiv'>
                <img src={props.landmark.coverImageSrc} alt=""></img>
            </div>
            <div className='titleDiv'>
                <div>Name:</div><input ref={nameRef} defaultValue={props.landmark.name}/>
                <div>English name:</div><input ref={nameEngRef} defaultValue={props.landmark.name_eng}/>
                <div>Contributor: {props.landmark.owner}</div>
            </div>
            <div className='infoDiv'>
                <div>lat: </div><input ref={latRef} defaultValue={props.landmark.lat}/>
                <div>lng: </div><input ref={lngRef} defaultValue={props.landmark.lng}/>
                <div>Source: </div><input className="link" ref={linkRef} defaultValue={props.landmark.link}/>
            </div>
            <div className='desDiv'>
                <div className='name'>Price:</div><textarea ref={priceRef} defaultValue={props.landmark.price}/>
            </div>
            <div className='buttonDiv'>
                <Button variant="primary" className='buttonVerify' onClick={() => props.handleSubmit(props.landmark.id,
                    {name: nameRef.current.value,
                    name_eng: nameEngRef.current.value,
                    lat: latRef.current.value,
                    lng: lngRef.current.value,
                    link: linkRef.current.value,
                    price: priceRef.current.value,
                    is_visible: true}, true)}>Verify</Button>
                <Button variant="primary" className='buttonDelete' onClick={() => props.handleSubmit(props.landmark.id, {}, false)}>Delete</Button>
            </div>
        </div>
    );
}
function VerifyContent(props){
    const nameRef = useRef();
    const nameEngRef = useRef();
    const startDateRef = useRef();
    const endDateRef = useRef();
    const linkRef = useRef();
    const priceRef  = useRef();
    const desRef  = useRef();
    return(
        <div key={props.content.id} className='adminBox'>
            <div className='imageDiv'>
                <img src={props.content.coverImageSrc} alt=""></img>
            </div>
            <div className='titleDiv'>
                <div>Name:</div><input ref={nameRef} defaultValue={props.content.name}/>
                <div>English name:</div><input ref={nameEngRef} defaultValue={props.content.name_eng}/>
                <div>Contributor: {props.content.owner}</div>
            </div>
            <div className='infoDiv'>
                <div>Start date: </div><input ref={startDateRef} defaultValue={props.content.startDate}/>
                <div>End date: </div><input ref={endDateRef} defaultValue={props.content.endDate}/>
                <div>Source: </div><input className="link" ref={linkRef} defaultValue={props.content.link}/>
            </div>
            <div className='desDiv'>
                <div className='name'>Description:</div><textarea ref={desRef} defaultValue={props.content.des}/>
                <div className='name'>Price:</div><textarea ref={priceRef} defaultValue={props.content.price}/>
            </div>
            <div className='buttonDiv'>
                <Button variant="primary" className='buttonVerify' onClick={() => props.handleSubmit(props.content.id,
                    {name: nameRef.current.value,
                    name_eng: nameEngRef.current.value,
                    startDate: startDateRef.current.value,
                    endDate: endDateRef.current.value,
                    link: linkRef.current.value,
                    price: priceRef.current.value,
                    description: desRef.current.value,
                    is_visible: true}, true)}>Verify</Button>
                <Button variant="primary" className='buttonDelete' onClick={() => props.handleSubmit(props.content.id, {}, false)}>Delete</Button>
            </div>
        </div>
    );
}
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
        let chs = [];
        for(let key in landmarks) {
            chs.push(<VerifyLandmark key={key} landmark={landmarks[key]} handleSubmit={handleSubmit}/>);
        }
        setChildren(chs);
    }, [landmarks]);
    function handleSubmit(lmid, dic, is_verify){
        jwtVerify()
        .then(() => {
            if(is_verify){
                axios(getToken()).patch('/map/landmarks/'+lmid+'/', JSON.stringify(dic),
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
        return(<></>);
    }
    else if(user && user.is_staff) {
        if(children.length === 0){
            return(
                <div>
                    No pending suggestion
                </div>
            );
        }
        return(
            <div>
                <div className='admin'>
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
        let chs = [];
        for(let key in contents) {
            chs.push(<VerifyContent key={key} content={contents[key]} handleSubmit={handleSubmit}/>);
        }
        setChildren(chs);
    }, [contents]);
    function handleSubmit(ctid, dic, is_verify){
        jwtVerify()
        .then(() => {
            if(is_verify){
                axios(getToken()).patch('/map/contents/'+ctid+'/', JSON.stringify(dic),
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
        return(<></>);
    }
    else if(user && user.is_staff) {
        if(children.length === 0){
            return(
                <div>
                    No pending suggestion
                </div>
            );
        }
        return(
            <div>
                <div className='admin'>
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