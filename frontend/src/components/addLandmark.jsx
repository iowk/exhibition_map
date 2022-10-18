import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from "react-router-dom";
import './addLandmark.css';
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';
import { UploadImage } from './image'

function AddLandmark(props) {
    const nameRef = useRef();
    const linkRef = useRef();
    const [image, setImage] = useState(null);
    useEffect(() => {
        return() => {            
            props.handleSetAddedMarker(null);
        };
    }, []);
    function handleSubmit(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                let form_data = new FormData();
                if(image) form_data.append('coverImageSrc', image, image.name);
                form_data.append('name', nameRef.current.value);
                form_data.append('link', linkRef.current.value);
                form_data.append('lat', props.addedMarker.lat());
                form_data.append('lng', props.addedMarker.lng());
                axios(getToken()).post('/map/landmarks/', form_data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                })
                .then((res) => {
                    alert("Landmark added");
                    window.location.reload(false);
                })
                .catch((e) =>{
                    console.log(e);
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
    if(props.addedMarker && props.user && props.user.is_verified){
        return(
            <div className='addLandmark'>
                <div className='dtop'>Add a new landmark at <br/> ({props.addedMarker.lat()}, {props.addedMarker.lng()})</div>
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
    else if(!props.addedMarker){
        return(
            <div>Please click on the map to add a landmark</div>
        );
    }
    else if(!props.user){
        return(
            <div>Please login to add a landmark</div>
        );
    }
    else{
        return(
            <div>Please actvate your account to add a landmark</div>
        );
    }
}

export default AddLandmark;