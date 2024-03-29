import React, { useState, useRef } from 'react';
import { Navigate } from "react-router-dom";
import './addLandmark.css';
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';
import Button from 'react-bootstrap/Button';
import ClipLoader from "react-spinners/ClipLoader";
import { UploadImage } from './image'

function AddLandmark(props) {
    const nameRef = useRef();
    const linkRef = useRef();
    const [lat, setLat] = useState(props.addedMarker.lat());
    const [lng, setLng] = useState(props.addedMarker.lng());
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    function handleSubmit(){
        if(!lat || !lng) alert("Please specify the coordinates of the landmark");
        else if(lat<-90 || lat>90) alert("Latitude should be between -90 and 90");
        else if(lng<-180 || lng>180) alert("Longitude should be between -90 and 90");
        else{
            jwtVerify()
            .then((is_valid) => {
                if(is_valid){
                    setLoading(true);
                    let form_data = new FormData();
                    if(image) form_data.append('coverImageSrc', image, image.name);
                    form_data.append('name', nameRef.current.value);
                    form_data.append('link', linkRef.current.value);
                    form_data.append('lat', parseFloat(lat));
                    form_data.append('lng', parseFloat(lng));
                    axios(getToken()).post('/map/landmarks/', form_data,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                    })
                    .then(() => {
                        alert("Your request will be validated soon.\nThank you for your contribution.");
                        props.handleSetCenter({
                            lat: parseFloat(lat),
                            lng: parseFloat(lng)
                        });
                        setLoading(false);
                        props.handleToInitial();

                    })
                    .catch((e) =>{
                        console.log(e);
                        alert(JSON.stringify(e.response.data));
                        setLoading(false);
                    });
                }
                else{
                    alert("Please login again");
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
                        value={lat}
                        onChange={(e)=>(setLat(e.target.value))}
                    />,
                    <input
                        type='number'
                        value={lng}
                        onChange={(e)=>(setLng(e.target.value))}
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
                    <Button onClick={handleSubmit} variant="primary">
                        Upload
                    </Button>
                </div>
                <div className='loader'>
                    <ClipLoader
                        color='blue'
                        loading={loading}
                        size={50}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
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