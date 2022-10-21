import React, { useState, useRef } from 'react';
import { Navigate } from "react-router-dom";
import './addLandmark.css';
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';
import { UploadImage } from './image'

function AddLandmark(props) {
    const nameRef = useRef();
    const linkRef = useRef();
    const latRef = useRef();
    const lngRef = useRef();
    const [image, setImage] = useState(null);
    function handleSubmit(){
        if(!latRef.current.value || !lngRef.current.value) alert("Please specify the coordinates of the landmark");
        else if(latRef.current.value<-90 || latRef.current.value>90) alert("Latitude should be between -90 and 90");
        else if(latRef.current.value<-180 || latRef.current.value>180) alert("Longitude should be between -90 and 90");
        else{
            jwtVerify()
            .then((is_valid) => {
                if(is_valid){
                    let form_data = new FormData();
                    if(image) form_data.append('coverImageSrc', image, image.name);
                    form_data.append('name', nameRef.current.value);
                    form_data.append('link', linkRef.current.value);
                    form_data.append('lat', parseFloat(latRef.current.value));
                    form_data.append('lng', parseFloat(lngRef.current.value));
                    axios(getToken()).post('/map/landmarks/', form_data,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                    })
                    .then(() => {
                        alert("Your request will be validated soon.\nThank you for your contribution.");
                        props.handleSetCenter({
                            lat: parseFloat(latRef.current.value),
                            lng: parseFloat(lngRef.current.value)
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
    }
    if(props.addedMarker && props.user && props.user.is_verified){
        return(
            <div className='addLandmark'>
                <div className='dtop'>
                    <span>Suggest a new landmark at: <br/></span>
                    (<input
                        type='number'
                        defaultValue={props.addedMarker.lat()}
                        ref={latRef}
                    />,
                    <input
                        type='number'
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