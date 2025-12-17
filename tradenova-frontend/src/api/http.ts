import axios from "axios";

const http = axios.create({ //const는 재하달 불가 변수. 하지만 http 내부 속성은 바뀔 수 있음 / axios.create()는 'axios 인스턴스(=커스텀 axios 객체)'를 만듦
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

http.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");  //브라우저에 저장된 문자열을 꺼내옴
    if (token) config.headers.Authorization = 'Bearer ${token}'; //Authorization 헤더에 'Bearer 토큰값' 형태로 넣어줌.
    return config;
})

export default http;
