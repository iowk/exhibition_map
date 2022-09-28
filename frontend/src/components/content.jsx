import React, { Component } from 'react';
import './content.css';

class Content extends Component {
    render() {
        return (
            <div className="contentInfo">
                <img src={this.props.coverImageSrc} alt="Not found"></img>
                <div className="des">
                    <h1>{this.props.name}</h1>
                    <p>{this.props.startDate} ~ {this.props.endDate}</p>
                    <a href={this.props.link}>
                        <div className="link">{this.props.link}</div>
                    </a>      
                    <p>Rating: {this.props.avgRating}</p>             
                </div>
            </div>
        );        
    }
}

export default Content;