import React, { Component } from 'react';
import './landmark.css';
import CommentPostPopup from './comment';
import { ImageListPopup, ImagePostPopup } from './image';
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
                            name={this.props.name}
                        /></div>
                    )}
                </div>
                <div className='image'>
                    <div><ImageListPopup
                        lmid={this.props.lmid}
                    /></div>
                    {getLSItem('user','is_verified') &&      
                    <div><ImagePostPopup
                        lmid={this.props.lmid}
                    /></div>}
                </div>  
            </div>
        );        
    }
}

export default Landmark;