import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Form } from 'react-bootstrap';
import MainLayout from '../layout/MainLayout';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThermometerHalf, faVial, faWind, faSync, faHistory } from '@fortawesome/free-solid-svg-icons';

// --- 스타일 컴포넌트 정의 ---
const MetricCard = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 1.5rem;
`;

const LogContainer = styled.div`
  background: #2d3436;      /* 다크 모드 터미널 느낌 */
  color: #00ff00;            /* 형광 초록 글씨 */
  border-radius: 8px;
  height: 350px;
  overflow-y: auto;
  padding: 1.2rem;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.85rem;
  border: 1px solid #1e272e;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #636e72; border-radius: 3px; }
`;

const LiveIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: #00ff00;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 8px #00ff00;
  animation: blink 1.5s infinite;
  @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.2; } 100% { opacity: 1; } }
`;

// --- 메인 컴포넌트 ---
const ProcessRealTime: React.FC = () => {
  const [recipes] = useState([
    { id: 1, name: 'Cell Culture A' },
    { id: 2, name: 'Purification B' },
    { id: 3, name: 'Fermentation C' }
  ]);
  const [selectedId, setSelectedId] = useState<number>(1);
  
  // 데이터 구조를 temp, ph, doValue를 포함하도록 변경
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const clientRef = useRef<Client | null>(null);

  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true); // 로딩 시작
      try {
        const response = await fetch(`http://localhost:9500/api/process/${selectedId}/logs`);
        const logs = await response.json();
        
        // 데이터 변환 (백엔드 필드명에 주의: tempPh, phValue 등)
        const formattedLogs = logs.map((log: any) => ({
          time: new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          temp: log.tempPh,
          ph: log.phValue,
          do: log.doValue,
          progress: log.progressRate
        }));
        
        setRealTimeData(formattedLogs);
      } catch (error) {
        console.error("초기 데이터 로드 실패:", error);
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };

  fetchInitialData().then(() => {
    // 그 다음 웹소켓 연결
    const client = new Client({
      brokerURL: 'ws://localhost:9500/ws-cdms',
      webSocketFactory: () => new SockJS('http://localhost:9500/ws-cdms'),
      reconnectDelay: 5000,
      onConnect: (frame) => {
        console.log(`STOMP Connected to Recipe #${selectedId}`, frame);

        const handleIncomingData = (type: string, body: string) => {
          const value = parseFloat(body);
          const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          setRealTimeData((prev) => {
            const lastData = prev.length > 0 ? prev[prev.length - 1] : null;

            if (lastData && lastData.time === now) {
              const updatedItem = { ...lastData, [type]: value };
              return [...prev.slice(0, -1), updatedItem];
            } 

            const baseData = lastData ? { ...lastData } : { temp: 0, ph: 7.0, do: 80, progress: 0 };
            const newItem = { ...baseData, time: now, [type]: value };
            
            return [...prev, newItem].slice(-30);
          });
        };

        client.subscribe(`/topic/temperature/${selectedId}`, (msg) => handleIncomingData('temp', msg.body));
        client.subscribe(`/topic/ph/${selectedId}`, (msg) => handleIncomingData('ph', msg.body));
        client.subscribe(`/topic/do/${selectedId}`, (msg) => handleIncomingData('do', msg.body));
        client.subscribe(`/topic/progress/${selectedId}`, (msg) => handleIncomingData('progress', msg.body));
      },
    });

    client.activate();
    clientRef.current = client;
  });

  return () => {
    if (clientRef.current) {
      clientRef.current.deactivate();
    }
  };
}, [selectedId]);

  // 최신 데이터 추출
  // const latest = realTimeData[realTimeData.length - 1] || { temp: 0, ph: 0, do: 0 };
  // 이 부분이 realTimeData가 채워지기 전에는 0으로 보임
  const latest = realTimeData.length > 0 
    ? realTimeData[realTimeData.length - 1] 
    : { temp: 0, ph: 0, do: 0, progress: 0 };

  return (
    <MainLayout>
      {isLoading ? 
      (  <div>데이터를 불러오는 중입니다...</div> ) 
    : 
      (
      <Container fluid className="px-0">
        {/* 헤더 및 상태표시 생략 (기존과 동일) */}

        {/* 요약 카드 영역 (실시간 연동) */}
        <Row className="g-4 mb-2">
          <Col md={4}>
            <MetricCard><Card.Body>
              <div className="text-muted small fw-bold"><FontAwesomeIcon icon={faThermometerHalf} className="me-1"/> TEMPERATURE</div>
              <h3 className="fw-bold mb-0 text-danger">{latest.temp?.toFixed(1)}°C</h3>
            </Card.Body></MetricCard>
          </Col>
          <Col md={4}>
            <MetricCard><Card.Body>
              <div className="text-muted small fw-bold"><FontAwesomeIcon icon={faVial} className="me-1"/> pH LEVEL</div>
              <h3 className="fw-bold mb-0 text-success">{latest.ph?.toFixed(2)}</h3>
            </Card.Body></MetricCard>
          </Col>
          <Col md={4}>
            <MetricCard><Card.Body>
              <div className="text-muted small fw-bold"><FontAwesomeIcon icon={faWind} className="me-1"/> DISSOLVED OXYGEN</div>
              <h3 className="fw-bold mb-0 text-primary">{latest.do?.toFixed(1)}%</h3>
            </Card.Body></MetricCard>
          </Col>
        </Row>

        <Row className="g-4">
          <Col xl={8}>
            <MetricCard style={{ height: '520px' }}>
              <Card.Body>
                <h5 className="fw-bold mb-4">Real-time Parameter Trend</h5>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    {/* 세 개의 라인 표시 */}
                    <Line yAxisId="left" name="Temp (°C)" type="monotone" dataKey="temp" stroke="#ff7675" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line yAxisId="left" name="pH" type="monotone" dataKey="ph" stroke="#55efc4" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line yAxisId="right" name="DO (%)" type="monotone" dataKey="do" stroke="#74b9ff" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card.Body>
            </MetricCard>
          </Col>

          <Col xl={4}>
            {/* 레시피 선택 카드 생략 (기존과 동일) */}

            <MetricCard>
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold"><FontAwesomeIcon icon={faHistory} className="me-2" />Process Log</h5>
              </Card.Header>
              <Card.Body className="pt-0">
                <LogContainer>
                  {realTimeData.slice().reverse().map((d, i) => (
                    <div key={i} className="mb-2 pb-1 border-bottom border-secondary" style={{fontSize: '0.8rem'}}>
                      <span className="text-info">[{d.time}]</span><br/>
                      T: {d.temp?.toFixed(1)}°C | pH: {d.ph?.toFixed(2)} | DO: {d.do?.toFixed(1)}%
                    </div>
                  ))}
                </LogContainer>
              </Card.Body>
            </MetricCard>
          </Col>
        </Row>
      </Container>
    )}
    </MainLayout>
  );
};

export default ProcessRealTime;