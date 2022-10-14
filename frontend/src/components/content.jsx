import React from 'react';
import './content.css';
import { CommentListPopup, CommentPostPopup} from './comment';
import { ImageListPopup, ImagePostPopup } from './image';
import { jwtVerify, getToken } from '../auth';
import axios from '../axios';
import star from '../media/star.png'
import '../general.css';


function Content(props){
    function handleDeleteContent(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getToken()).delete('/map/contents/'+props.content.id+'/')
                .then(() => {
                    alert("Content deleted");
                    props.handleToLandmark(props.landmark);
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
    function handleBack(){
        props.handleToLandmark(props.landmark);
    }
    return(
        <div className='contentDetail'>            
            <button onClick={handleBack} className='backButton'>
                {props.landmark.name}
            </button>
            <h1>{props.content.name}</h1>
            <img src={props.content.coverImageSrc} alt="Not found"></img>    
            <p className='date'>{props.content.startDate} ~ {props.content.endDate}</p>
            <div className='link-rating'>
                <a href={props.content.link}>
                    <div className="link">Website</div>
                </a>
                {props.content.avgRating &&
                    <div className='rating'>
                    <img className='starImage' src={star} alt='Rating:'></img>
                    <span className='ratingNum'>{props.content.avgRating}</span></div>}
            </div>
            <div className='contentButtons'>
                <CommentListPopup
                    key='CommentListPopup'
                    ctid={props.content.id}
                    name={props.content.name}
                    buttonName='Show comments'
                />
                {props.user.is_verified && (
                    // Comment button for activated user                         
                    <CommentPostPopup
                        key='CommentPostPopup'
                        ctid={props.content.id}
                        name={props.content.name}
                        user={props.user}
                        handleSetUser={props.handleSetUser}
                        buttonName='Write comment'
                    />
                )}
                <ImageListPopup
                    key='ImageListPopup'
                    ctid={props.content.id}
                    buttonName='Show photos'
                />
                {props.user.is_verified &&      
                <ImagePostPopup
                    key='ImagePostPopup'
                    ctid={props.content.id}
                    user={props.user}
                    handleSetUser={props.handleSetUser}
                    buttonName='Upload photo'
                />}
            {props.user && (props.user.is_staff) &&
                <div className='contentDelete'><button className='contentDeleteButton' onClick={handleDeleteContent}>
                    Delete content
                </button></div>}            
            </div>
        </div>                
    );
}

export default Content;