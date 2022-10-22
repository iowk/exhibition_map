import React, { useState, useRef } from 'react';
import { Navigate } from "react-router-dom";
import './description.css';
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';

function DesPostPopup(props){
    // Pop up when user clicks the add description button for landmark or content
    const [open, setOpen] = useState(false);
    const desRef = useRef();

    let apiPath = '';
    if(props.ctid) apiPath = '/map/contents/'+props.ctid+'/';
    else apiPath = '/map/landmarks/'+props.lmid+'/';

    function handleOpen(){
        setOpen(true);
    }
    function handleSubmit(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getToken()).patch(apiPath,JSON.stringify({description: desRef.current.value}),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                .then(() => {
                    alert("Description added");
                })
                .catch((e) => {
                    console.log(e);
                    alert(JSON.stringify(e.response.data));
                })
            }
            else{
                props.handleSetUser(null);
                <Navigate to = '/login/'/>;
            }
        })
        .catch((e) => {
            console.log(e);
        });
    }
    const closeModal = () => setOpen(false);
    return(
        <></>
        /*
        <div id='desPost'>
            <button className='addDesButton' onClick={handleOpen}>{props.buttonName}</button>
            <Popup
            open={open}
            position="right center"
            closeOnDocumentClick
            onClose={closeModal}
            modal>
                <div className="modal">
                    <button className="close" onClick={closeModal}>
                        &times;
                    </button>
                    <div className="name">
                        {props.name}
                    </div>
                    <div className='popupForm'>
                        <textarea
                            placeholder='Write description'
                            ref={desRef}
                            defaultValue={props.description}
                            className='desBox'
                        />
                        <div className='buttonDiv'>
                            <button onClick={handleSubmit} className='popupSubmitButton'>
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </Popup>
        </div>*/
    );
}

export {DesPostPopup};