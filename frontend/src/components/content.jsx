import React, {useState, useEffect} from 'react';
import './content.css';
import Button from 'react-bootstrap/Button';
import ClipLoader from "react-spinners/ClipLoader";
import { CommentListPopup, CommentPostPopup} from './comment';
import { ImageListPopup, ImagePostPopup } from './image';
import { ReportPostPopup } from './report';
import { DesPostPopup } from './description';
import { jwtVerify, getToken } from '../auth';
import axios from '../axios';
import star from '../media/star.png';

function Content(props){
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        let isMounted = true;
        const fetchData = async() => {
            setLoading(true);
            try{
                // GET content
                const res_ct = await axios().get('/map/contents/'+props.ctid+'/');
                const ct = await res_ct.data;
                // Set state
                if(isMounted){
                    setContent(ct);
                    props.handleSetCenter({lat: ct.lat, lng: ct.lng});
                }
            } catch (e) {
                console.log(e);
            } finally{
                setLoading(false);
            }
        }
        if(props.ctid && props.ctid!==content.id) fetchData();
        return () => {
            isMounted = false;
        };
    }, [props.handleSetCenter, props.ctid, content.id])
    function handleDeleteContent(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getToken()).delete('/map/contents/'+content.id+'/')
                .then(() => {
                    alert("Content deleted");
                    props.handleToLandmark(props.lmid);
                })
                .catch((e) => {
                    console.log(e);
                });
            }
            else alert("Please login again");
        })
        .catch((e) => {
            console.log(e);
        });
    }
    function handleBack(){
        props.handleToLandmark(props.lmid);
    }
    return(
        <div className='contentDetail'>
            <Button variant="secondary" onClick={handleBack} className='backButton'>
                {content.landmark_name}
            </Button>
            <h1>{content.name}</h1>
            <img src={content.coverImageSrc} alt="Not found"></img>
            <p className='date'>{content.startDate} ~ {content.endDate}</p>
            <div className='link-rating'>
                {content.link &&<a className="link" href={content.link}>
                    <div>Source</div>
                </a>}
                {content.avgRating &&
                    <div className='rating'>
                    <img className='starImage' src={star} alt='Rating:'></img>
                    <span className='ratingNum'>{content.avgRating.toFixed(1)}</span></div>}
            </div>
            <div className='contentButtons'>
                <CommentListPopup
                    key='CommentListPopup'
                    ctid={content.id}
                    name={content.name}
                    buttonName='Show comments'
                />
                {props.user && props.user.is_verified && (
                    // Comment button for activated user
                    <CommentPostPopup
                        key='CommentPostPopup'
                        user={props.user}
                        ctid={content.id}
                        name={content.name}
                        buttonName='Write comment'
                    />
                )}
                <ImageListPopup
                    key='ImageListPopup'
                    ctid={content.id}
                    name={content.name}
                    buttonName='Show photos'
                />
                {props.user && props.user.is_verified &&
                <ImagePostPopup
                    key='ImagePostPopup'
                    user={props.user}
                    ctid={content.id}
                    name={content.name}
                    buttonName='Upload photo'
                />}
                {props.user && props.user.is_verified &&
                <ReportPostPopup
                    key='ReportPostPopup'
                    user={props.user}
                    ctid={content.id}
                    name={content.name}
                    buttonName='Report content'
                />}
                {props.user && (props.user.is_staff) &&
                <DesPostPopup
                    key='DesPostPopup'
                    user={props.user}
                    ctid={content.id}
                    name={content.name}
                    description={content.description}
                    buttonName='Modify description'
                />}
                {props.user && (props.user.is_staff) &&
                <Button variant="primary" onClick={handleDeleteContent}>
                    Delete content
                </Button>}
            </div>
            <div className='contentDescription'>
                {content.description}
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

export default Content;
