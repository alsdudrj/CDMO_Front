import React, {useEffect, useState} from 'react'
//리액트 hook을 사용해서 컴포넌트 상태 관리와 생명주기를 제어

//api 함수들
import { getProductionStatus, getWorkOrder, getEquipmentStatus, getInventoryStatus } from '../api.tsx';
import ProductionStatus from './ProductionStatus';
import WorkOrderStatus from './WorkOrderStatus';
import EquipmentStatus from './EquipmentStatus';
import InventoryStatus from './InventoryStatus';

interface ProductionData{
    id:number;
    name:string;
    status:string;
}
interface WorkOrderData{}
interface EquipmentData{}
interface InventoryData{}

const DashBoard: React.FC = () => {   //함수형 컴포넌트 Function Component
    //각 데이터 카테고리에 대해 별도의 상태(state)를 선언
    //초기값은 빈 배열
    const[production, setProduction] = useState<ProductionData[]>([]);
    const[workOrders, setWorkOrders] = useState<WorkOrderData[]>([]);
    const[equipment, setEquipment] = useState<EquipmentData[]>([]);
    const[inventory, setInventory] = useState<InventoryData[]>([]);

    //컴포넌트가 처음 렌더링 될때 한번만 실행(의존성 배열에 의해)
    useEffect(() => { 
        fetchData();
    }, []);

    const fetchData = async () => {
        try{//Promise.all 4개의 api를 병렬로 호출 -> 모든 요청이 끝날때까지 기다려줌(네트워크 효율성 향상)
            const[prodRes, workRes, equipRes, invRes] = await Promise.all([
                getProductionStatus(),
                getWorkOrder(),
                getEquipmentStatus(),
                getInventoryStatus()
            ]);
            setProduction(prodRes.data);
            setWorkOrders(workRes.data);
            setEquipment(equipRes.data);
            setInventory(invRes.data);
        } catch(error){//에러가 생길경우
            console.error('니 잘못 : ', error);
        }
    }

    return(
        <>
            <h1>Smart MES DashBoard</h1>
            <div className="">
                <ProductionStatus data={production}/>
                <WorkOrderStatus data={workOrders}/>
                <EquipmentStatus data={equipment}/>
                <InventoryStatus data={inventory}/>
            </div>
        </>
    )
}

export default DashBoard;