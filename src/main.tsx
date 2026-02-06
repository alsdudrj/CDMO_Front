import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./assets/scss/style.scss";
import "./assets/css/mes.scss";
//부트스트랩의 기본 베이스 cdn
//리액트 1:1 경로는 ./
//타입스크립트 사용시 자바스크립트를 제외하고는 ;을 붙여줘야함
import 'bootstrap/dist/css/bootstrap.min.css';
/*
*타입스크립트는 변수 함수 코드의 타입을 컴파일시점에서 미리 지정하고 검사하여 오류를 잡는다.
*자바스크립트는 타입이 실행되는 시점에 결정되는 동적 타입

타입스크립트는 자바스크립트의 상위 언어 (Superset)
정적타입(Static Type)을 추가하여 코드의 안정성과 유지보수성을 높여준다.

자바스크립트, 파이썬은 인터프리터 언어(1줄씩 해석)
타입스크립트는 컴파일러(기계어 번역)
*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
