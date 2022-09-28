import React, { Component } from 'react';
import './landmark.css'
import CommentPostPopup from './comment'
import { getLSItem } from './../auth';

class Landmark extends Component{
    render() {
        return (
            <div className="landmarkInfo">
                <h1>{this.props.name}</h1>                
                <img src={this.props.coverImageSrc} alt="Not found"></img>
                <a href={this.props.link}>
                    <div className="link">{this.props.link}</div>
                </a>
                <div className='rating'>
                    <p>Rating: {this.props.avgRating}</p>                                      
                    {getLSItem('user','is_verified') && (
                        // Comment button for activated user                         
                        <div><CommentPostPopup
                            lmid={this.props.lmid}
                            ctid={this.props.ctid}
                            name={this.props.name}
                        /></div>
                    )}
                </div>
                {/*<div><ImageListPopup
                    lmid={this.props.lmid}
                    ctid={this.props.ctid}
                    name={this.props.name}
                /></div>
                <div><ImagePostPopup
                    lmid={this.props.lmid}
                    ctid={this.props.ctid}
                    name={this.props.name}
                /></div>
                    <button></button>*/}
            </div>
        );        
    }
}

export default Landmark;