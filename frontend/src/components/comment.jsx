import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import { Navigate } from "react-router-dom";
import './comment.css';
import axios from './../axios';
import { jwtVerify, getLSItem } from './../auth';

class WriteRatingBlock extends Component {
    // Inside PopupBlock
    setRatingBox() {
        var children = [];
        children.push(<div className='ratingTitle' key='ratingTitle'>Rating</div>)
        // There are (this.props.rating) filled rating icons
        for(let i = 1 ; i <= this.props.rating ; ++i){
            let cur=i;
            children.push(<div className='button' key={cur}><button 
            onClick={() => this.props.handleClickRating(cur)}
            className='filledRating'>
                </button></div>);
        }
        // There are (maxRating - this.props.rating) empty rating icons
        for(let i = this.props.rating+1 ; i <= this.props.maxRating ; ++i){
            let cur=i;
            children.push(<div className='button' key={cur}><button 
            onClick={() => this.props.handleClickRating(cur)}
            className='emptyRating'>
                </button></div>);
        }
        return (
            <div className='ratingBox'>{children}</div>
        );
    }
    render() {
        return(
            this.setRatingBox()
        );
    }
}
class WriteCommentBlock extends Component {
    // Inside CommentPopup
    setCommentBox() {
        return (
            <textarea
                placeholder='Write comment'
                value={this.props.comment}
                onChange={this.props.handleWriteComment}
                className='commentBox'
            />
        );
    }
    render() {
        return(
            this.setCommentBox()
        );
    }
}
class CommentPostPopup extends Component {
    // Pop up when user clicks the comment button for landmark or content
    constructor(props) {
        super(props);
        this.state = {
            isPatch: false,
            rating: 0,
            maxRating: 5,
            comment: '',
            apiPath: '',
        };
    }
    componentDidMount = () => {
        jwtVerify()
        .then(is_valid => {
            if(is_valid){
                if(this.props.ctid) this.setState({apiPath: '/map/landmarks/'+this.props.lmid+'/contents/'+this.props.ctid+'/comments/'});
                else this.setState({apiPath: '/map/landmarks/'+this.props.lmid+'/comments/'});
                axios(getLSItem('jwt','access'))
                .get(this.state.apiPath+getLSItem('user','id')+'/')
                .then(res => {
                    // This user already had a comment
                    this.setState({isPatch: true});
                    this.setState({rating: res.data['rating']});
                    this.setState({comment: res.data['text']});
                })
                .catch(e => {
                    // New comment
                    this.setState({isPatch: false});
                })
            }
            else{
                <Navigate to = '/login/'/>;
            }
        })
        .catch(e => {
            console.log(e);
            alert(e);
        })
    }
    handleClickRating = (rating) => {
        this.setState({rating: rating});
    }
    handleWriteComment = (event) => {
        this.setState({comment: event.target.value});
    }
    _handleSubmit = (event) => {
        jwtVerify()
        .then(is_valid => {
            if(is_valid){
                if(this.state.isPatch){
                    axios(getLSItem('jwt','access')).patch(this.state.apiPath+getLSItem('user','id')+'/', JSON.stringify({
                        rating: this.state.rating,
                        text: this.state.comment
                    }),
                    {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                    });
                    alert("Comment updated");
                }
                else{
                    axios(getLSItem('jwt','access')).post(this.state.apiPath, JSON.stringify({
                        rating: this.state.rating,
                        comment: this.state.comment
                    }),
                    {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                    });
                    alert("Comment submitted");
                }                
            }
            else{
                <Navigate to = '/login/'/>;
            }
        })
        .catch(e => {
            console.log(e);
            alert(e);
        })
    }
    render() {
        return(
        <Popup trigger={<button className='addCommentButton'>Write comment</button>}
        position="right center"
        modal>
            {close => (
            <div className="modal">
                <button className="close" onClick={close}> 
                    &times; 
                </button>
                <div className="title">
                    {this.props.name}
                </div>
                <div className='popupForm'>
                    <WriteRatingBlock
                        rating={this.state.rating}
                        maxRating={this.state.maxRating}
                        handleClickRating={this.handleClickRating}
                    />
                    <WriteCommentBlock
                        comment={this.state.comment}
                        handleWriteComment={this.handleWriteComment}
                    />
                    <button onClick={this._handleSubmit} className='popupSubmitButton'>
                        Submit
                    </button>
                </div>
            </div>)}
        </Popup>
        );
    }
}

export default CommentPostPopup;