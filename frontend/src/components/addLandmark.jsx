import React, { useState, useRef } from 'react';
import { Navigate } from "react-router-dom";
import './addLandmark.css';
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';
import { UploadImage } from './image'

function AddLandmark(props) {
    const nameRef = useRef();
    const linkRef = useRef();
    const latRef = useRef(props.addedMarker.lat());
    const lngRef = useRef(props.addedMarker.lng());
    const [image, setImage] = useState(null);
    function handleSubmit(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                let form_data = new FormData();
                if(image) form_data.append('coverImageSrc', image, image.name);
                form_data.append('name', nameRef.current.value);
                form_data.append('link', linkRef.current.value);
                form_data.append('lat', latRef.current.value);
                form_data.append('lng', lngRef.current.value);
                axios(getToken()).post('/map/landmarks/', form_data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                })
                .then(() => {
                    alert("Your request will be validated soon.\nThank you for your contribution.");
                    props.handleSetCenter({
                        lat: latRef.current.value,
                        lng: lngRef.current.value
                    });
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
        })
    }
    if(props.addedMarker && props.user && props.user.is_verified){
        return(
            <div className='addLandmark'>
                <div className='dtop'>
                    <span>Suggest a new landmark at: <br/></span>
                    (<input
                        defaultValue={props.addedMarker.lat()}
                        ref={latRef}
                    />,
                    <input
                        defaultValue={props.addedMarker.lng()}
                        ref={lngRef}
                    />)
                </div>
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
            <div>Please click on the map to suggest a landmark</div>
        );
    }
    else if(!props.user){
        return(
            <div>Please login to suggest a landmark</div>
        );
    }
    else{
        return(
            <div>Please actvate your account to suggest a landmark</div>
        );
    }
}

export default AddLandmark;