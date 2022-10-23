import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import {jwtVerify, getLSItem, getToken} from './auth';
import { CommentPostPopup} from './components/comment';
import axios from './axios';
import Navigation from './components/navbar';
import './userComment.css';
import star from './media/star.png';

function EachUserLandmarkComment(props){
    const [lmname, setLMName] = useState(null);
    useEffect(() => {
        const fetchData = async() => {
            try{
                const res_lm = await axios().get('/map/landmarks/'+props.comment.landmark_id);
                const landmark = await res_lm.data;
                setLMName(landmark.name);
            }
            catch (e) {
                console.log(e);
            }
        }
        fetchData();
    }, [props])

    return(
        <div className='each-user-comment'>
            <div className='title'>
                <span className='name'>{lmname}</span>
                <div className='rating'>
                    <img className='starImage' src={star} alt='Rating:'></img>
                    <span className='ratingNum'>{props.comment.rating}</span>
                </div>
                <CommentPostPopup
                    lmid={props.comment.landmark_id}
                    name={lmname}
                    user={props.user}
                    handleSetUser={props.handleSetUser}
                    buttonName='Modify comment'
                />
            </div>
            <div className='text'>
                {props.comment.text}
            </div>
        </div>
    );
}

function EachUserContentComment(props){
    const [lmname, setLMName] = useState(null);
    const [ctname, setCTName] = useState(null);
    useEffect(() => {
        const fetchData = async() => {
            try{
                const res_ct = await axios().get('/map/contents/'+props.comment.content_id);
                const content = await res_ct.data;
                setCTName(content.name);
                setLMName(content.landmark_name);
            }
            catch (e) {
                console.log(e);
            }
        }
        fetchData();
    }, [props])

    return(
        <div className='each-user-comment'>
            <div className='title'>
                <span className='name'>{lmname}</span>
                <div className='rating'>
                    <img className='starImage' src={star} alt='Rating:'></img>
                    <span className='ratingNum'>{props.comment.rating}</span>
                </div>
                <CommentPostPopup
                    ctid={props.comment.content_id}
                    name={lmname + '-' + ctname}
                    user={props.user}
                    handleSetUser={props.handleSetUser}
                    buttonName='Modify comment'
                />
            </div>
            <div className='text'>
                {props.comment.text}
            </div>
        </div>
    );
}

function UserComment(props){
    const [user, setUser] = useState({});
    const [verifyDone, setVerifyDone] = useState(false);
    const [landmarkComments, setLandmarkComments] = useState({});
    const [contentComments, setContentComments] = useState({});
    useEffect(() => {
        let isMounted = true;
        const fetchData = async() => {
            try{
                const is_valid = await jwtVerify();
                if(isMounted){
                    if(is_valid){
                        setUser(getLSItem('user'));
                        const res = await axios(getToken()).get('/map/users/'+getLSItem('user','id')+'/comments/');
                        const comments = await res.data;
                        setLandmarkComments(comments.landmarkComments);
                        setContentComments(comments.contentComments);
                    }
                    else setUser(null);
                }
            }
            catch (e) {
                console.log(e);
                if(isMounted) setUser(null);
            }
        }
        fetchData().then(() => {
            setVerifyDone(true);
        });
        return () => { isMounted = false };
    }, [props])
    if(!verifyDone){
        return(<></>);
    }
    else if(user) {
        var children = [];
        for(let key in landmarkComments) {
            let ch_key = 'l_' + landmarkComments[key].id
            children.push(<EachUserLandmarkComment
                key={ch_key}
                comment={landmarkComments[key]}
                user={user}
                handleSetUser={setUser}
            />);
        }
        for(let key in contentComments) {
            let ch_key = 'c_' + contentComments[key].id
            children.push(<EachUserContentComment
                key={ch_key}
                comment={contentComments[key]}
                user={user}
                handleSetUser={setUser}
            />);
        }
        return(
            <div className='userPage'>
                {<Navigation user = {user}/>}
                <div className='userComment'>
                    {children}
                </div>
            </div>
        );
    }
    else{
        return(
            <Navigate to="/login/" replace={true} />
        );
    }
}
export default UserComment;