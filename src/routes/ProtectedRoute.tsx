import { useEffect } from 'react';
import type { ReactNode } from 'react';
//리액트에서 화면에 그릴 수 있는 모든것 div, 문자열 컴포넌트

import { Navigate, useLocation } from 'react-router-dom';
//{이동, 현재 주소정보}

//Props(Properties) 인터페이스 (타입 정의)
interface Props{//이 컴포넌트는 children을 받는다.
    children: ReactNode;
}

const ProtectedRoute = ({children}:Props) => {//children을 Props로 받음
    //현재 위치정보 가져오기 > 지금주소가 예시로 admin일 때 로그인 이 후 여기로 다시 돌아오게 하기 위해
    const location = useLocation();
    const token = localStorage.getItem("token");

    /*로컬스토리지에서 토큰 꺼내기
    what? localStorage [브라우저에 저장되는 간단한 저장소 => 로컬스토리지]
    로그인 성공시에 보통 localStorage.setItem("token", "abc123");
    */
    const isValidToken =
    !!token && token !== "null" && token !== "undefined" && token.trim() !== "";//값이 있으면 true, 그 외에 로그인 처리 x

    useEffect(() => { //화면이 바뀌거나 값이 바뀔 때 실행되는 코드 > 여기선 토큰이 없을때 한번만 알림을 띄우고 싶어 useEffect 사용
        //useEffect처리를 안하면 무한루프의 alert창이 계속 뜸
        if(!isValidToken){
            alert("로그인이 필요합니다.");
        }
    }, [isValidToken]);

    //토큰이 없으면 강제이동
    if(!isValidToken){
        return<Navigate to = "/login" replace state = {{from: location}}/>
        /*
        replace : 뒤로가기를 눌러도 못돌아오게 막음
        state = {{from: location}} : 원래 가려던 주소 저장
        */
    }

    return <>{children}</>//토큰이 있으면 정상출력
}
export default ProtectedRoute;

