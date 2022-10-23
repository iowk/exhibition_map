import React, { useState } from 'react';
import {jwtVerify, getToken} from './auth';
import Button from 'react-bootstrap/Button';
import axios from './axios';

function AdminPostJson(props){
    const [file, setFile] = useState({});
    function handleOnChange(e){
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
            const ls = JSON.parse(e.target.result)
            setFile(ls);
            console.log(ls.length,"items");
        }
    }
    function delay(milliseconds){
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }
    async function handleSubmit(){
        for(let i = 0; i < file.length; ++i){
            let item = file[i];
            console.log("Posting", item.name);
            await delay(100);
            let is_valid = await jwtVerify();
            if(is_valid){
                try{
                    await axios(getToken()).post('/map/landmarks/', JSON.stringify(item),
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });
                }
                catch(e){
                    console.log(e);
                }
            }
            else{
                console.log("Please login again");
            }
        }
    }
    return(
        <div>
            Upload json file:
            <input type='file' onChange={handleOnChange}/>
            <Button variant="primary" onClick={handleSubmit}>Submit</Button>
        </div>
    );
}
export default AdminPostJson;