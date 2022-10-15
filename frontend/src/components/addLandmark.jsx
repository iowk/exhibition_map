import React, { useState, useRef } from 'react';
import { Navigate } from "react-router-dom";
import './addLandmark.css';
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';
import { createCoverImageEntry } from '../utils';
import { UploadImage } from './image'

function AddLandmark(props) {
    const nameRef = useRef();
    const linkRef = useRef();
    const [image, setImage] = useState(null);
    function handleSubmit(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getToken()).post('/map/landmarks/', JSON.stringify({
                    name: nameRef.current.value,
                    lat: props.addedMarker.lat(),
                    lng: props.addedMarker.lng(),
                    link: linkRef.current.value,
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
                            axios(getToken()).patch('/map/landmarks/'+res.data.id+'/', createCoverImageEntry(image),
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                },
                            })
                            .then(() => {
                                alert("Landmark added");
                                window.location.reload(false);
                            })
                            .catch((e) => {
                                console.log(e);
                                alert(e);
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
                        alert("Landmark added");
                        window.location.reload(false);
                    }
                })
                .catch((e) =>{
                    console.log(e);
                    alert(e);
                });
            }
            else{
                props.handleSetUser(null);
                <Navigate to = '/login/'/>;
            }
        })
        .catch(e => {
            console.log(e);            
        })
    }    
    if(props.user){
        if(props.user.is_verified){
            return(
                <div className='addLandmark'>
                    <div className='dtop'>Add a new landmark</div>
                    <div>
                        <textarea
                            placeholder='Name'
                            ref={nameRef}
                            className='nameBox'
                        />
                    </div>
                    <div>
                        <textarea
                            placeholder='Link'
                            ref={linkRef}
                            className='linkBox'
                        />
                    </div>
                    <div id='uploadImageBox'>
                        <UploadImage handleSetImage={setImage}/>
                    </div>
                    <div className='buttonDiv'>
                        <button onClick={handleSubmit} className='submitButton'>
                            Upload
                        </button>
                    </div>
                </div>
            );
        }
        else{
            return(
                <div>Please activate your account to add a landmark</div>
            );
        }            
    }
    else{
        return(
            <div>Please login to add a landmark</div>
        );
    }
}

export default AddLandmark;