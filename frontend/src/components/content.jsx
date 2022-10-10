import React, {useState} from 'react';
import { Navigate } from "react-router-dom";
import DatePicker from 'react-date-picker';
import './content.css';
import { CommentListPopup, CommentPostPopup} from './comment';
import { ImageListPopup, ImagePostPopup } from './image';
import { jwtVerify, getToken } from '../auth';
import { createCoverImageEntry, formatDate } from '../utils';
import axios from '../axios';
import '../general.css';

function Content(props){
    function handleDeleteContent(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getToken()).delete('/map/contents/'+props.content.id+'/')
                .then(() => {
                    alert("Content deleted");
                    props.handleToLandmark();
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
    return(
        <div className='contentDetail'>            
            <button onClick={props.handleToLandmark} className='backButton'>
                Back
            </button>
            <h1>{props.content.name}</h1>
            <img src={props.content.coverImageSrc} alt="Not found"></img>    
            <p className='date'>{props.content.startDate} ~ {props.content.endDate}</p>
            <a href={props.content.link}>
                <div className="link">Website</div>
            </a>
            {props.content.avgRating && 
                <p className='rating'>Rating: {props.content.avgRating}</p>}
            <div className='comment'>                
                <CommentListPopup
                    ctid={props.content.id}
                    name={props.content.name}
                    buttonName='Show comments'
                />
                {props.user.is_verified && (
                    // Comment button for activated user                         
                    <CommentPostPopup
                        ctid={props.content.id}
                        name={props.content.name}
                        user={props.user}
                        handleSetUser={props.handleSetUser}
                        buttonName='Write comment'
                    />
                )}
            </div>
            <div className='image'>
                <ImageListPopup
                    ctid={props.content.id}
                    buttonName='Show photos'
                />
                {props.user.is_verified &&      
                <ImagePostPopup
                    ctid={props.content.id}
                    user={props.user}
                    handleSetUser={props.handleSetUser}
                    buttonName='Upload photo'
                />}
            </div>
            {props.user && (props.user.is_staff) &&
                <div><button className='contentDetailButton' onClick={handleDeleteContent}>
                    Delete content
                </button></div>}            
        </div>
    );
}

function AddContent(props){
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [image, setImage] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    function handleSubmit(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getToken()).post('/map/landmarks/'+props.curLandmarkId+'/contents/', JSON.stringify({
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
                            axios(getToken()).patch('/map/landmarks/'+props.curLandmarkId+'/contents/'+res.data.id+'/', createCoverImageEntry(image),
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                },
                            })
                            .then(() => {
                                alert("Content added");
                                window.location.reload(false);
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
                        window.location.reload(false);
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
        <button onClick={props.handleToLandmark}>
            Back
        </button>
        {child}
     </div>);
}

export {Content, AddContent};