import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// 1. 데이터 타입 정의
interface ChartData {
    time: string;
    value: number;
}

const TestPage: React.FC = () => {
    const [data, setData] = useState<ChartData[]>([]);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        // 2. WebSocket 클라이언트 설정
        const client = new Client({
            brokerURL: 'ws://localhost:9500/ws-cdms',
            webSocketFactory: () => new SockJS('http://localhost:9500/ws-cdms'),
            reconnectDelay: 5000, // 연결 끊겼을 때 5초 후 자동 재연결
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('STOMP Connected');
            
            // 3. 구독 (메시지 타입 정의: IMessage)
            client.subscribe('/topic/progress/1', (message: IMessage) => {
                if (message.body) {
                    const newValue = parseInt(message.body);
                    const now = new Date().toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });

                    // 최신 15개 데이터 유지
                    setData((prevData) => {
                        const newData = [...prevData, { time: now, value: newValue }];
                        return newData.slice(-15);
                    });
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
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
        <div style={{ width: '100%', height: '500px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ color: '#333' }}>실시간 공정 모니터링 (TypeScript)</h2>
            <div style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                현재 진행률: <span style={{ color: '#8884d8', fontWeight: 'bold' }}>
                    {data.length > 0 ? data[data.length - 1].value : 0}%
                </span>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 12 }} 
                        interval="preserveStartEnd"
                    />
                    <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 12 }}
                        label={{ value: '(%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#8884d8' }}
                        activeDot={{ r: 8 }}
                        isAnimationActive={false} // 실시간성을 위해 애니메이션 OFF 권장
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
export default TestPage;