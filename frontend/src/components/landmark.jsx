import React, {useState, useEffect} from 'react';
import './landmark.css';
import { CommentListPopup, CommentPostPopup} from './comment';
import { ImageListPopup, ImagePostPopup } from './image';
import { ReportPostPopup } from './report';
import { jwtVerify, getToken } from './../auth';
import {ContentOverview} from './overview';
import axios from './../axios';
import star from '../media/star.png';
import ClipLoader from "react-spinners/ClipLoader";

function Landmark({user, lmid, handleToInitial, handleToContent, handleToAddContent, handleSetCenter}){
    const [landmark, setLandmark] = useState({});
    const [loading, setLoading] = useState(false);
    const [contentsOverview, setContentsOverview] = useState(null); // Contents of the currently clicked landmark
    useEffect(() => {
        let isMounted = true;
        const fetchData = async() => {
            setLoading(true)
            try{
                // GET landmarks
                const res_lm = await axios().get('/map/landmarks/'+lmid);
                const lm = await res_lm.data;
                // GET contents
                const res_cts = await axios().get('/map/landmarks/'+lmid+'/contents_overview/');
                const cts = await res_cts.data;
                // Set state
                if(isMounted){
                    setLandmark(lm);
                    setContentsOverview(cts);
                    handleSetCenter({lat: lm.lat, lng: lm.lng});
                }
            } catch (e) {
                console.log(e);
            } finally{
                setLoading(false);
            }
        }
        if(lmid && lmid!==landmark.id) fetchData();
        return () => {
            isMounted = false;
        };
    }, [handleSetCenter, lmid, landmark.id])
    function handleDeleteLandmark(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getToken()).delete('/map/landmarks/'+landmark.id+'/')
                .then(() => {
                    alert("Landmark deleted");
                    handleToInitial();
                })
                .catch((e) => {
                    console.log(e);
                });
            }
        })
        .catch((e) => {
            console.log(e);
        });
    }
    function genLandmark(){
        return (
            <div className="landmarkInfo" key='lm'>
                <h1>{landmark.name}</h1>
                <img src={landmark.coverImageSrc} alt=""></img>
                <div className='link-rating'>
                    {landmark.link && <a className="link" href={landmark.link}>
                        <div>Source</div>
                    </a>}
                    {landmark.avgRating &&
                        <div className='rating'>
                        <img className='starImage' src={star} alt='Rating:'></img>
                        <span className='ratingNum'>{landmark.avgRating.toFixed(1)}</span></div>}
                </div>
            </div>
        );
    }

    if(landmark){
        var children = [];
        children.push(genLandmark());
        var buttons = [];
        buttons.push(<CommentListPopup
            key='commentListPopup'
            lmid={landmark.id}
            name={landmark.name}
            buttonName='Show comments'
        />)
        if(user && user.is_verified){
            buttons.push(<CommentPostPopup
                key='commentPostPopup'
                lmid={landmark.id}
                name={landmark.name}
                user={user}
                buttonName='Write comment'
            />)
        }
        buttons.push(<ImageListPopup
            key='ImageListPopup'
            lmid={landmark.id}
            name={landmark.name}
            buttonName='Show photos'
        />)
        if(user && user.is_verified){
            buttons.push(<ImagePostPopup
                key='ImagePostPopup'
                lmid={landmark.id}
                name={landmark.name}
                user={user}
                buttonName='Upload photo'
            />)
        }
        if(user && user.is_verified){
            buttons.push(<ReportPostPopup
                key='ReportPostPopup'
                lmid={landmark.id}
                name={landmark.name}
                user={user}
                buttonName='Report landmark'
            />)
        }
        if(user && user.is_verified){
            buttons.push(
                <button className="btn btn-primary" key='AddContentButton' onClick={handleToAddContent}>
                    Suggest content
                </button>)
        }
        if(user && (user.is_staff)){
            buttons.push(
                <button className="btn btn-primary" key='DeleteLandmarkButton' onClick={handleDeleteLandmark}>
                    Delete landmark
                </button>)
        }
        children.push(
            <div key='landmarkButtons' className='landmarkButtons'>
                {buttons}
            </div>
        )
        for(let key in contentsOverview) {
            if(contentsOverview[key]['isGoing'] && contentsOverview[key]['is_visible']){
                // Ongoing and visible content
                children.push(<ContentOverview
                    key={contentsOverview[key].id}
                    contentOverview={contentsOverview[key]}
                    handleToContent={() => handleToContent(contentsOverview[key].id)}
                    showLandmarkName={false}/>);
            }
        }
        return (
            <>
                <div>
                    {children}
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
            </>
        );
    }
    else{
        return(<></>);
    }
}

export default Landmark;