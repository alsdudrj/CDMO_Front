import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// 1. 데이터 타입 정의 (온도로 변경)
interface TempData {
    time: string;
    temp: number;
}

const TempData: React.FC = () => {
    const [data, setData] = useState<TempData[]>([]);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        // 2. WebSocket 클라이언트 설정
        const client = new Client({
            brokerURL: 'ws://localhost:9500/ws-cdms',
            webSocketFactory: () => new SockJS('http://localhost:9500/ws-cdms'),
            reconnectDelay: 5000,
            heartbeatIncoming: 10000, // 주기가 기므로 하트비트를 조금 여유 있게 조절 가능
            heartbeatOutgoing: 10000,
        });

        client.onConnect = () => {
            console.log('STOMP Connected');
            
            // 3. 온도 데이터 구독 (엔드포인트는 서버 설정에 맞춰 변경하세요)
            // 예: /topic/temperature/1
            client.subscribe('/topic/temperature/1', (message: IMessage) => {
                if (message.body) {
                    const newTemp = parseFloat(message.body); // 온도는 소수점일 수 있으므로 parseFloat
                    const now = new Date().toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    });

                    setData((prevData) => {
                        const newData = [...prevData, { time: now, temp: newTemp }];
                        // 10분 주기라면 24시간 데이터가 144개입니다. 
                        // 최근 20개 정도만 보여주거나 필요에 따라 조절하세요.
                        return newData.slice(-20); 
                    });
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker error: ' + frame.headers['message']);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, []);

    return (
        <div style={{ width: '100%', height: '500px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#2d3436', marginBottom: '10px' }}>🌡️ 실시간 온도 모니터링 (10분 주기)</h2>
            <div style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#636e72' }}>
                현재 온도: <span style={{ color: '#ff7675', fontWeight: 'bold' }}>
                    {data.length > 0 ? data[data.length - 1].temp.toFixed(1) : 0}°C
                </span>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe6e9" />
                    <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 12, fill: '#636e72' }} 
                        padding={{ left: 20, right: 20 }}
                    />
                    <YAxis 
                        domain={['auto', 'auto']} // 온도 범위에 따라 자동 조절되거나 [0, 50] 처럼 고정
                        tick={{ fontSize: 12, fill: '#636e72' }}
                        label={{ value: '(°C)', angle: -90, position: 'insideLeft', offset: 0 }}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dfe6e9' }}
                        formatter={(value: any) => [`${value}°C`, '온도']}
                    />
                    <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#ff7675" // 온도에 어울리는 붉은 계열
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#ff7675', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8 }}
                        isAnimationActive={true} // 10분 주기라면 애니메이션이 있는 게 더 자연스럽습니다
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TempData;