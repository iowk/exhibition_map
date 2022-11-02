import React from 'react';
import './overview.css';
import star from '../media/star.png';

function LandmarkOverview(props){
    function handleOnClick(){
        props.handleToLandmark(props.landmarkOverview.id);
    }
    return (
        <div className="card-horizontal overview mt-2" style={{height: 9+'rem'}} onClick={handleOnClick}>
            <div className="img-square-wrapper coverImage">
                <img src={props.landmarkOverview.coverImageSrc} alt="Not found"></img>
            </div>
            <div className="card-body des">
                <h5 className="card-title fw-bold">{props.landmarkOverview.name}</h5>
                {props.landmarkOverview.avgRating &&
                    <div className='rating mt-1'>
                        <img className='starImage' src={star} alt='Rating:'></img>
                        <span className='ratingNum'>{props.landmarkOverview.avgRating.toFixed(1)}</span>
                    </div>}
            </div>
        </div>
    );
}

function ContentOverview(props){
    function handleOnClick(){
        props.handleToContent(props.contentOverview.id);
    }
    return (
        <div className="card-horizontal overview mt-2" style={{height: 9+'rem'}} onClick={handleOnClick}>
            <div className="img-square-wrapper coverImage">
                <img src={props.contentOverview.coverImageSrc} alt="Not found"></img>
            </div>
            <div className="card-body des">
                <h5 className="card-title fw-bold">{props.contentOverview.name}</h5>
                {props.showLandmarkName && <h6 className="card-subtitle mt-1">{props.contentOverview.landmark_name}</h6>}
                {props.contentOverview.avgRating &&
                    <div className='rating mt-1'>
                        <img className='starImage' src={star} alt='Rating:'></img>
                        <span className='ratingNum'>{props.contentOverview.avgRating.toFixed(1)}</span>
                    </div>}
                <p className="card-text mt-1">{props.contentOverview.startDate} ~ {props.contentOverview.endDate}</p>
            </div>
        </div>
    );
}

export {LandmarkOverview, ContentOverview}