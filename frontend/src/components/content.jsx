import React from 'react';
import './content.css';

function Content(props){
    return (
        <div className="contentInfo">
            <img src={props.coverImageSrc} alt="Not found"></img>
            <div className="des">
                <h1>{props.name}</h1>
                <p>{props.startDate} ~ {props.endDate}</p>
                <a href={props.link}>
                    <div className="link">{props.link}</div>
                </a>      
                <p>Rating: {props.avgRating}</p>             
            </div>
        </div>
    );
}

export default Content;