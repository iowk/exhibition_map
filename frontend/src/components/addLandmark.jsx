import React, { useState } from 'react';
import { Navigate } from "react-router-dom";
import './addLandmark.css';
import axios from '../axios';
import { jwtVerify, getLSItem } from '../auth';
import { createCoverImageEntry } from '../utils';

function AddLandmark(props) {
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [image, setImage] = useState(null);
    function handleSubmit(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getLSItem('jwt','access')).post('/map/landmarks/', JSON.stringify({
                    name: name,
                    lat: props.addedMarker.lat(),
                    lng: props.addedMarker.lng(),
                    link: link,
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
                            axios(getLSItem('jwt','access')).patch('/map/landmarks/'+res.data.id+'/', createCoverImageEntry(image),
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
                <div>
                    <div>Add a new landmark</div>
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
                    <input type="file" name="image_url"
                        accept="image/jpeg,image/png,image/gif" onChange={(e) => {setImage(e.target.files[0])}} />
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