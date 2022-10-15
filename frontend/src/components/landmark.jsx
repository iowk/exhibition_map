import React, {useState, useEffect} from 'react';
import './landmark.css';
import { CommentListPopup, CommentPostPopup} from './comment';
import { ImageListPopup, ImagePostPopup } from './image';
import { jwtVerify, getToken } from './../auth';
import {ContentOverview} from './overview'
import axios from './../axios';
import star from '../media/star.png'

function Landmark(props){
    const [contents, setContents] = useState(null); // Contents of the currently clicked landmark
    useEffect(() => {
        const fetchData = async() => {
            try{
                // GET contents
                const res_cons = await axios().get('/map/landmarks/'+props.landmark.id+'/contents/');            
                const ct = await res_cons.data;
                // Set state
                setContents(ct);
            } catch (e) {
                console.log(e);
            }
        }
        if(props.landmark.id) fetchData();
        if(props.user){
            jwtVerify()
            .then((is_valid) => {
                if(!is_valid) props.handleSetUser(null);
            })
            .catch((e) => {
                console.log(e);
            });
        }        
    }, [props])
    function handleDeleteLandmark(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getToken()).delete('/map/landmarks/'+props.landmark.id+'/')
                .then(() => {
                    alert("Landmark deleted");
                    props.handleToInitial();
                })
                .catch((e) => {
                    console.log(e);
                });
            }
            else props.handleSetUser(null);
        })
        .catch((e) => {
            console.log(e);
        });        
    }
    function genLandmark(){
        return (
            <div className="landmarkInfo" key='lm'>
                <h1>{props.landmark.name}</h1>         
                <img src={props.landmark.coverImageSrc} alt=""></img>
                <div className='link-rating'>
                    <a href={props.landmark.link}>
                        <div className="link">Website</div>
                    </a>
                    {props.landmark.avgRating &&
                        <div className='rating'>
                        <img className='starImage' src={star} alt='Rating:'></img>
                        <span className='ratingNum'>{props.landmark.avgRating.toFixed(1)}</span></div>}
                </div>                
            </div>
        );
    }
    
    if(props.landmark){
        var children = [];
        children.push(genLandmark());
        var buttons = [];
        buttons.push(<CommentListPopup
            key='commentListPopup'
            lmid={props.landmark.id}
            name={props.landmark.name}
            buttonName='Show comments'
        />)
        if(props.user && props.user.is_verified){
            buttons.push(<CommentPostPopup
                key='commentPostPopup'
                lmid={props.landmark.id}
                name={props.landmark.name}
                user={props.user}
                handleSetUser={props.handleSetUser}
                buttonName='Write comment'
            />)
        }
        buttons.push(<ImageListPopup
            key='ImageListPopup'
            lmid={props.landmark.id}
            buttonName='Show photos'
        />)
        if(props.user && props.user.is_verified){
            buttons.push(<ImagePostPopup
                key='ImagePostPopup'
                lmid={props.landmark.id}
                user={props.user}
                handleSetUser={props.handleSetUser}
                buttonName='Upload photo'
            />)
        }        
        if(props.user && (props.user.is_staff)){
            buttons.push(
                <div key='deleteLandmarkButton'><button className='deleteLandmarkButton' onClick={handleDeleteLandmark}>
                    Delete landmark
                </button></div>)
        }
        if(props.user && (props.user.is_staff || props.user.id===props.landmark.owner)){
            buttons.push(
                <div key='addContentButton'><button className='addContentButton' onClick={props.handleToAddContent}>
                    Add content
                </button></div>)
        }
        children.push(
            <div key='landmarkButtons' className='landmarkButtons'>
                {buttons}
            </div>
        )        
        for(let key in contents) {
            if(contents[key]['isGoing']){ 
                // Ongoing event content       
                children.push(<ContentOverview 
                    key={contents[key].id}
                    content={contents[key]}
                    handleToContent={props.handleToContent}
                    showLandmarkName={false}/>);
            }
        }
        return (
            <div>
                {children}
            </div>
        );
    }
    else{
        return(<></>);
    }
}

export default Landmark;