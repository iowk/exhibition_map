import React from 'react';
import './content.css';
import Button from 'react-bootstrap/Button';
import { CommentListPopup, CommentPostPopup} from './comment';
import { ImageListPopup, ImagePostPopup } from './image';
import { DesPostPopup } from './description';
import { jwtVerify, getToken } from '../auth';
import axios from '../axios';
import star from '../media/star.png';

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
            <Button variant="secondary" onClick={handleBack} className='backButton'>
                {props.landmark.name}
            </Button>
            <h1>{props.content.name}</h1>
            <img src={props.content.coverImageSrc} alt="Not found"></img>
            <p className='date'>{props.content.startDate} ~ {props.content.endDate}</p>
            <div className='link-rating'>
                <a className="link" href={props.content.link}>
                    <div>Source</div>
                </a>
                {props.content.avgRating &&
                    <div className='rating'>
                    <img className='starImage' src={star} alt='Rating:'></img>
                    <span className='ratingNum'>{props.content.avgRating.toFixed(1)}</span></div>}
            </div>
            <div className='contentButtons'>
                <CommentListPopup
                    key='CommentListPopup'
                    ctid={props.content.id}
                    name={props.content.name}
                    buttonName='Show comments'
                />
                {props.user && props.user.is_verified && (
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
                    name={props.content.name}
                    buttonName='Show photos'
                />
                {props.user && props.user.is_verified &&
                <ImagePostPopup
                    key='ImagePostPopup'
                    ctid={props.content.id}
                    name={props.content.name}
                    user={props.user}
                    handleSetUser={props.handleSetUser}
                    buttonName='Upload photo'
                />}
                {props.user && (props.user.is_staff) &&
                <DesPostPopup
                    key='DesPostPopup'
                    ctid={props.content.id}
                    name={props.content.name}
                    user={props.user}
                    description={props.content.description}
                    handleSetUser={props.handleSetUser}
                    buttonName='Modify description'
                />}
                {props.user && (props.user.is_staff) &&
                <Button variant="primary" onClick={handleDeleteContent}>
                    Delete content
                </Button>}
            </div>
            <div className='contentDescription'>
                {props.content.description}
            </div>
        </div>
    );
}

export default Content;
