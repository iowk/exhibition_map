import React from 'react';
import './overview.css';
import star from '../media/star.png'

function LandmarkOverview(props){
    function handleOnClick(){
        props.handleToLandmark(props.landmark);
    }
    return (
        <div className="overview" id="landmark-overview" onClick={handleOnClick}>
            <div className='contentImage'>
                <img src={props.landmark.coverImageSrc} alt="Not found"></img>
            </div>
            <div className="des">
                <h2>{props.landmark.name}</h2>
                {props.landmark.avgRating && 
                    <div className='rating'>
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
        <div className="overview" id="content-overview" onClick={handleOnClick}>
            <div className='contentImage'>
                <img src={props.content.coverImageSrc} alt="Not found"></img>
            </div>
            <div className="des">
                {!props.showLandmarkName && <h2>{props.content.name}</h2>}
                {props.showLandmarkName && <h2>{props.content.landmark_name}-{props.content.name}</h2>}
                <p>{props.content.startDate} ~ {props.content.endDate}</p>
                {props.content.avgRating && 
                    <div className='rating'>
                        <img className='starImage' src={star} alt='Rating:'></img>
                        <span className='ratingNum'>{props.content.avgRating.toFixed(1)}</span>
                    </div>}      
            </div>
        </div>
    );
}

export {LandmarkOverview, ContentOverview}