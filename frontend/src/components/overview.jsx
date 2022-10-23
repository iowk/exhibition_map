import React from 'react';
import './overview.css';
import star from '../media/star.png';

function LandmarkOverview(props){
    function handleOnClick(){
        props.handleToLandmark(props.landmark);
    }
    return (
        <div className="card-horizontal overview mt-2" style={{height: 9+'rem'}} onClick={handleOnClick}>
            <div className="img-square-wrapper coverImage">
                <img src={props.landmark.coverImageSrc} alt="Not found"></img>
            </div>
            <div className="card-body des">
                <h5 className="card-title fw-bold">{props.landmark.name}</h5>
                {props.landmark.avgRating &&
                    <div className='rating mt-1'>
                        <img className='starImage' src={star} alt='Rating:'></img>
                        <span className='ratingNum'>{props.landmark.avgRating.toFixed(1)}</span>
                    </div>}
            </div>
        </div>
    );
}

function ContentOverview(props){
    function handleOnClick(){
        props.handleToContent(props.content);
    }
    return (
        <div className="card-horizontal overview mt-2" style={{height: 9+'rem'}} onClick={handleOnClick}>
            <div className="img-square-wrapper coverImage">
                <img src={props.content.coverImageSrc} alt="Not found"></img>
            </div>
            <div className="card-body des">
                <h5 className="card-title fw-bold">{props.content.name}</h5>
                {props.showLandmarkName && <h6 className="card-subtitle mt-1">{props.content.landmark_name}</h6>}
                {props.content.avgRating &&
                    <div className='rating mt-1'>
                        <img className='starImage' src={star} alt='Rating:'></img>
                        <span className='ratingNum'>{props.content.avgRating.toFixed(1)}</span>
                    </div>}
                <p className="card-text mt-1">{props.content.startDate} ~ {props.content.endDate}</p>
            </div>
        </div>
    );
}

export {LandmarkOverview, ContentOverview}