import axios from './axios';

export async function login(username, password){
    return new Promise((resolve, reject) => {
        logout();
        axios().post('/map/login/', JSON.stringify({
            username: username,
            password: password,
        }),
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            localStorage.setItem('jwt_access', res.data.access);
            localStorage.setItem('jwt_refresh', res.data.refresh);
            axios(res.data.access).get('/map/current_user/')
            .then(res => {
                localStorage.setItem('user', JSON.stringify(res.data));
                resolve();
            })
            .catch(e => {
                alert(e);
                reject();
            })
        })
        .catch (e => {
            reject();
        });
    });    
}

export function logout(){
    localStorage.removeItem('jwt_access');
    localStorage.removeItem('jwt_refresh');
    localStorage.removeItem('user');
}
export function getLSItem(key1, key2){
    const dict = localStorage.getItem(key1);
    if(dict === null) return null;
    if(!key2) return JSON.parse(dict);
    return JSON.parse(dict)[key2];
}
export function getToken(){
    return localStorage.getItem('jwt_access');
}
export async function jwtRefresh(){    
    return new Promise((resolve, reject) => {  
        console.log("Refresh");      
        let r_jwt = localStorage.getItem('jwt_refresh');
        if(!r_jwt){
            logout();
            resolve(false);
        }
        else{
            axios().post('/map/token/refresh/', JSON.stringify({
                refresh: r_jwt,
            }),
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(res => {
                console.log("Refresh success");
                localStorage.setItem('jwt_access', res.data.access);        
                resolve(true);
            })
            .catch (e => {
                console.log("Refresh fail");                
                logout();
                resolve(false);
            })
        }        
    });
}
export async function jwtVerify(){
    return new Promise((resolve) => {
        let a_jwt = getToken();
        if(!a_jwt){
            logout();
            resolve(false);
        }
        else{
            axios(a_jwt).post('/map/token/verify/', JSON.stringify({
                token: a_jwt,
            }),
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(() => {
                resolve(true);
            })
            .catch (() => {
                resolve(jwtRefresh());                
            });
        }        
    });    
}
