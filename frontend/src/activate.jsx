import { useParams } from 'react-router-dom';
import {backendPath} from './settings';

function Activate(){
    const { uidb64, token } = useParams();
    try{
        fetch(backendPath+'/map/activate/'+uidb64+'/'+token+'/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res=> {
            return res.json()
            .then(res_json => {
                if(res_json['is_active']) alert("Activation success");
                else alert("Activation fail");
            });
        });
        
    } catch (e) {
        alert(e);
    }     
    return(<div></div>);
}
export default Activate;