import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Form } from 'react-bootstrap';
import MainLayout from '../layout/MainLayout';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar, Cell } from 'recharts';
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
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);  //레시피 id 저장
  const [simulationId, setSimulationId] = useState<number | null>(null);  //시뮬레이션 id 저장
  const [realTimeData, setRealTimeData] = useState<any[]>([]);  //시뮬레이션 데이터 저장
  const [isLoading, setIsLoading] = useState(false);  //데이터 로딩 체크
  const clientRef = useRef<Client | null>(null);

  const [processStatus, setProcessStatus] = useState<"RUNNING" | "FINISHED">("RUNNING"); //공정 진행상태 체크

  //초기 레시피 로드
  useEffect(() => {
    fetch("http://localhost:9500/api/recipes")
      .then(res => res.json())
      .then(setRecipes)
      .catch(err => console.error("레시피 로드 실패:", err));
  }, []);

  //레시피 선택 시 Simulation ID 조회
  useEffect(() => {
    if (!selectedRecipeId) return;
    
    console.log("레시피 선택됨 ID:", selectedRecipeId);
    setIsLoading(true); // 로딩 시작

    fetch(`http://localhost:9500/api/simulation/by-recipe/${selectedRecipeId}`)
      .then(res => {
        if (!res.ok) throw new Error("시뮬레이션 정보가 없습니다.");
        return res.json();
      })
      .then(sim => {
        console.log("조회된 시뮬레이션 ID:", sim.id);
        setSimulationId(sim.id);

        if (sim.status === "FINISHED") {
          setProcessStatus("FINISHED");
        } else {
          setProcessStatus("RUNNING");
        }
      })
      .catch(err => {
        console.error("Simulation 조회 실패:", err);
        setIsLoading(false); // 에러 시 로딩 해제
        alert("해당 레시피에 진행 중인 시뮬레이션이 없습니다.");
      });
  }, [selectedRecipeId]);

  //Simulation ID 결정 후 데이터 및 웹소켓 처리
  useEffect(() => {
    if (!simulationId) return;

    const initSession = async () => {
      try {
        console.log(`세션 초기화 시작 (ID: ${simulationId})`);
        
        //데이터 로드
        const response = await fetch(`http://localhost:9500/api/simulation/${simulationId}/logs`);
        if (!response.ok) throw new Error("로그 데이터 응답 에러");
        
        const logs = await response.json();
        console.log("초기 로그 수신 완료:", logs.length);

        const formattedLogs = logs.map((log: any) => {
          const rawDate = log.timeStamp || log.timestamp; 
          
          return {
            time: rawDate 
              ? new Date(rawDate).toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })
              : "00:00:00", // 데이터가 없을 경우 기본값
            temp: log.tempPh,
            ph: log.phValue,
            do: log.doValue,
            progress: log.progressRate !== undefined ? log.progressRate : 100
          };
        });
        setRealTimeData(formattedLogs);

        //웹소켓 연결
        const handleIncomingData = (type: string, body: string) => {
          const value = parseFloat(body);
          const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setRealTimeData((prev) => {
            const lastData = prev.length > 0 ? prev[prev.length - 1] : null;
            if (lastData && lastData.time === now) {
              return [...prev.slice(0, -1), { ...lastData, [type]: value }];
            }
            const baseData = lastData ? { ...lastData } : { temp: 0, ph: 7.0, do: 80, progress: 0 };
            return [...prev, { ...baseData, time: now, [type]: value }].slice(-30);
          });
        };

        //웹소켓 내용 구독
        const client = new Client({
          brokerURL: 'ws://localhost:9500/ws-cdms',
          webSocketFactory: () => new SockJS('http://localhost:9500/ws-cdms'),
          onConnect: () => {
            client.subscribe(`/topic/temperature/${simulationId}`, (msg) => handleIncomingData('temp', msg.body));
            client.subscribe(`/topic/ph/${simulationId}`, (msg) => handleIncomingData('ph', msg.body));
            client.subscribe(`/topic/do/${simulationId}`, (msg) => handleIncomingData('do', msg.body));
            client.subscribe(`/topic/progress/${simulationId}`, (msg) => handleIncomingData('progress', msg.body));

            //완료 상태 구독
            client.subscribe(`/topic/status/${simulationId}`, (msg) => {
              console.log("상태 수신 원본:", msg.body);

              const status = msg.body.replaceAll('"', '').trim();
              console.log("파싱된 상태:", status);

              if (status === "FINISHED") {
                setProcessStatus("FINISHED");
              }
            });
          },
        });

        client.activate();
        clientRef.current = client;

      } catch (error) {
        console.error("세션 초기화 중 치명적 에러:", error);
      } finally {
        console.log("로딩 상태 해제");
        setIsLoading(false);
      }
    };

    initSession();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [simulationId]);

  // 최신 데이터 추출
  const latest = realTimeData.length > 0 
    ? realTimeData[realTimeData.length - 1] 
    : { temp: 0, ph: 0, do: 0, progress: 0 };
  //FINISHED 후 progress를 100으로 유지
  const displayProgress = processStatus === "FINISHED" ? 100 : (latest.progress || 0);


  /* JSX 구간 */
  return (
    <MainLayout>
      {isLoading ? 
      (  <div>데이터를 불러오는 중입니다...</div> ) 
    : 
      (
      <Container fluid className="px-0">
        {/* 요약 카드 영역 */}
        <Row className="g-4 mb-2">
          <Col md={3}>
            <MetricCard><Card.Body>
              <div className="text-muted small fw-bold"><FontAwesomeIcon icon={faThermometerHalf} className="me-1"/> TEMPERATURE</div>
              <h3 className="fw-bold mb-0 text-danger">{latest.temp?.toFixed(1)}°C</h3>
            </Card.Body></MetricCard>
          </Col>
          <Col md={3}>
            <MetricCard><Card.Body>
              <div className="text-muted small fw-bold"><FontAwesomeIcon icon={faVial} className="me-1"/> pH LEVEL</div>
              <h3 className="fw-bold mb-0 text-success">{latest.ph?.toFixed(2)}</h3>
            </Card.Body></MetricCard>
          </Col>
          <Col md={3}>
            <MetricCard><Card.Body>
              <div className="text-muted small fw-bold"><FontAwesomeIcon icon={faWind} className="me-1"/> DISSOLVED OXYGEN</div>
              <h3 className="fw-bold mb-0 text-primary">{latest.do?.toFixed(1)}%</h3>
            </Card.Body></MetricCard>
          </Col>
          {/* ProgressBar */}
          <Col md={3}>
            <MetricCard>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="text-muted small fw-bold">
                    <FontAwesomeIcon icon={faSync} spin={processStatus === "RUNNING"} className="me-1"/> 
                    TOTAL PROCESS PROGRESS
                  </div>
                  <span className="fw-bold text-primary">{displayProgress.toFixed(1)}%</span>
                </div>
                
                <div style={{ height: '20px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#e9ecef' }}>
                  <div 
                    style={{ 
                      width: `${displayProgress}%`, 
                      height: '100%', 
                      backgroundColor: latest.progress >= 100 ? '#2ecc71' : '#3498db',
                      transition: 'width 0.5s ease-in-out',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {displayProgress >= 5 && `${displayProgress.toFixed(0)}%`}
                  </div>
                </div>
              </Card.Body>
            </MetricCard>
          </Col>
        </Row>

        {/* 그래프 */}
        <Row className="g-4">
          <Col xl={8}>
            <MetricCard style={{ height: '520px' }}>
              <Card.Body>
                <h5 className="fw-bold mb-4">Real-time Parameter Trend</h5>
                <ResponsiveContainer width="100%" height="90%">
                  <ComposedChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />

                    {/* 온도 */}
                    <Line 
                      yAxisId="left" 
                      name="Temp (°C)" 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#ff7675" 
                      strokeWidth={2} 
                      dot={false} 
                      isAnimationActive={false} 
                    />

                    {/* pH */}
                    <Bar 
                      yAxisId="left" 
                      name="pH" 
                      dataKey="ph" 
                      barSize={20} 
                      fill="#55efc4"
                      isAnimationActive={false}
                    >
                      {/* pH 값에 따른 색상 변경*/}
                      {realTimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.ph > 7 ? '#00cec9' : '#55efc4'} />
                      ))}
                    </Bar>

                    {/* DO */}
                    <Line 
                      yAxisId="right" 
                      name="DO (%)" 
                      type="monotone" 
                      dataKey="do" 
                      stroke="#74b9ff" 
                      strokeWidth={2} 
                      dot={false} 
                      isAnimationActive={false} 
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card.Body>
            </MetricCard>
          </Col>

          <Col xl={4}>
            <Form.Select 
              value={selectedRecipeId ?? ""} 
              onChange={e => setSelectedRecipeId(Number(e.target.value))}
            >
              <option value="">레시피 선택</option>
              {recipes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Form.Select>

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

        <div className="text-center mt-3">
          {latest.progress >= 100 || processStatus === "FINISHED" ? (
            <Badge 
              bg="success" 
              style={{
                fontSize: "1.1rem",
                padding: "10px 25px",
                borderRadius: "20px",
                boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)"
              }}
            >
              COMPLETED
            </Badge>
          ) : (
            <Badge bg="info" className="px-3 py-2">PROCESSING...</Badge>
          )}
        </div>
      </Container>
    )}
    </MainLayout>
  );
};

export default ProcessRealTime;