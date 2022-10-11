import React, {useState} from 'react';
import { Navigate } from "react-router-dom";
import DatePicker from 'react-date-picker';
import './content.css';
import { CommentListPopup, CommentPostPopup} from './comment';
import { ImageListPopup, ImagePostPopup } from './image';
import { jwtVerify, getToken } from '../auth';
import { createCoverImageEntry, formatDate } from '../utils';
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

function AddContent(props){
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [image, setImage] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    function handleBack(){
        props.handleToLandmark(props.landmark);
    }
    function handleSubmit(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getToken()).post('/map/landmarks/'+props.landmark.id+'/contents/', JSON.stringify({
                    name: name,
                    link: link,
                    startDate: formatDate(startDate),
                    endDate: formatDate(endDate)
                }),
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                })
                .then((res) => {
                    if(image){
                        jwtVerify()
                        .then(() => {
                            axios(getToken()).patch('/map/contents/'+res.data.id+'/', createCoverImageEntry(image),
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                },
                            })
                            .then(() => {
                                alert("Content added");
                                props.handleToLandmark(props.landmark);
                            })
                            .catch((e) => {
                                console.log(e);
                                alert(JSON.stringify(e.response.data));
                            })
                        })
                        .catch((e) => {
                            console.log(e);
                            alert("Please login again");
                            props.handleSetUser(null);
                            <Navigate to = '/login/'/>;
                        })
                    }
                    else{
                        alert("Content added");
                        props.handleToLandmark(props.landmark);
                    }
                })
                .catch((e) =>{
                    console.log(e);
                    alert(JSON.stringify(e.response.data));
                });
            }
            else{
                props.handleSetUser(null);
                <Navigate to = '/login/'/>;
            }
        })
        .catch(e => {
            console.log(e);
            alert(JSON.stringify(e.response.data));
        })
    }
    var child;
    if(props.user){
        child = 
            <div>
                <div>Add a new content</div>
                <textarea
                    placeholder='Name'
                    value={name}
                    onChange={(e) => {setName(e.target.value)}}
                    className='nameBox'
                />
                <textarea
                    placeholder='Link'
                    value={link}
                    onChange={(e) => {setLink(e.target.value)}}
                    className='linkBox'
                />                    
                <div>
                    <DatePicker onChange={setStartDate} format='yyyy-MM-dd' value={startDate} />
                    <DatePicker onChange={setEndDate} format='yyyy-MM-dd' value={endDate} />
                </div>
                <input type="file" name="image_url"
                    accept="image/jpeg,image/png,image/gif" onChange={(e) => {setImage(e.target.files[0])}} />
                <div className='buttonDiv'>
                    <button onClick={handleSubmit} className='submitButton'>
                        Upload
                    </button>
                </div>
            </div>;
    }
    else{
        child = <div>Please login to add a content</div>;
    }
    return(
    <div>
        <button onClick={handleBack}>
            {props.landmark.name}
        </button>
        {child}
     </div>);
}

export {Content, AddContent};