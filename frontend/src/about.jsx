import React from 'react';
import Card from 'react-bootstrap/Card';
import Navigation from './components/navbar';
import { getLSItem } from './auth';
import './about.css'

function About(props){
    return (
        <>
        <Navigation user={getLSItem('user')}/>
        <div className='about'>
            <Card className="about-card bg-dark text-white">
                <Card.Body>
                    <Card.Title>About EXmap</Card.Title>
                        <Card.Text>
                            EXmap is a non-profit website that displays museums and exhibitions mainly in Taiwan.
                        </Card.Text>
                </Card.Body>
            </Card>
            <Card className="about-card bg-dark text-white">
                <Card.Body>
                    <Card.Title>Collaboration</Card.Title>
                        <Card.Text>
                            <p>Users are welcome to contribute to the website by suggesting museums and exhibitions.
                                After the contents are verified by the administrator, they will be shown publicly.</p>
                            <p> If you are the administrator of a museum, you can contact exhibitionmap@gmail.com
                                to grant access on managing the museum's information.</p>
                        </Card.Text>
                </Card.Body>
            </Card>
            <Card className="about-card bg-dark text-white">
                <Card.Body>
                    <Card.Title>Copyright</Card.Title>
                        <Card.Text>
                            All contents on the website are authorized by the <i>Disclaimer on Openning Government Website Information</i> (政府網站資料開放宣告).
                            The link to of each museum or exhibition can be accessed by clicking "Source" in the information panel.
                            Explicit database sources are listed in the section below.
                        </Card.Text>
                </Card.Body>
            </Card>
            <Card className="about-card bg-dark text-white">
                <Card.Body>
                    <Card.Title>Source</Card.Title>
                        <Card.Text>
                            <ul>
                                <li><a href="https://data.gov.tw/">政府資料開放平台</a></li>
                            </ul>
                        </Card.Text>
                </Card.Body>
            </Card>
        </div>
        </>
    );
}

export default About;