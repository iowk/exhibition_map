import axios from './axios';

export async function login(username, password){
    return new Promise((resolve) => {
        logout();
        axios.post('/map/login/', JSON.stringify({
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
            localStorage.setItem('access_jwt', res.data['access']);
            localStorage.setItem('refresh_jwt', res.data['refresh']);
            resolve();
        })
        .catch (e => {
            console.log(e.message);
            resolve();
        });
    });    
}

export function logout(){
    localStorage.setItem('access_jwt', '');
    localStorage.setItem('refresh_jwt', '');
}

export async function jwtVerify(){
    return new Promise((resolve) => {
        let a_jwt = localStorage.getItem('access_jwt');
        if(!a_jwt) resolve(false);
        axios.post('/map/token/verify/', JSON.stringify({
            token: a_jwt,
        }),
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            resolve(true);
        })
        .catch (e => {
            let r_jwt = localStorage.getItem('refresh_jwt');
            if(!r_jwt) resolve(false);
            axios.post('/map/token/refresh/', JSON.stringify({
                token: r_jwt,
            }),
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(res => {
                localStorage.setItem('access_jwt', res.data['access']);
                resolve(true);
            })
            .catch (e => {
                resolve(false);
            })
        });
    });    
}