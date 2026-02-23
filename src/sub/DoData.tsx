import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface DoData {
    time: string;
    doValue: number;
}

const DoData: React.FC = () => {
    const [data, setData] = useState<DoData[]>([]);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        const client = new Client({
            brokerURL: 'ws://localhost:9500/ws-cdms',
            webSocketFactory: () => new SockJS('http://localhost:9500/ws-cdms'),
            onConnect: () => {
                client.subscribe('/topic/do/1', (message: IMessage) => {
                    const newDo = parseFloat(message.body);
                    const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                    setData((prev) => [...prev, { time: now, doValue: newDo }].slice(-20));
                });
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, []);

    return (
        <div style={{ width: '100%', height: '400px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#2d3436' }}>💧 실시간 DO(용존산소) 모니터링</h2>
            <div style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#0984e3', fontWeight: 'bold' }}>
                현재 수치: {data.length > 0 ? data[data.length - 1].doValue.toFixed(1) : '0.0'}%
            </div>
            <ResponsiveContainer width="100%" height="80%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
                    <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'DO']} />
                    <Line type="monotone" dataKey="doValue" stroke="#0984e3" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={true} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DoData;