import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../layout/Sidebar';

interface SignatureTask {
  id: number;
  targetType: string;
  requesterId: string;
  createdAt: string;
}

const Esignature = () => {
  // 1. 화면 디자인을 바로 확인하기 위해 초기값으로 가짜 데이터(Dummy Data)를 넣었습니다.
  const [queue, setQueue] = useState<SignatureTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<SignatureTask | null>(null);
  const [password, setPassword] = useState('');

  // (실제 데이터 연동 시 사용할 함수 - 현재는 가짜 데이터를 위해 잠시 주석 또는 그대로 둡니다)
  const fetchQueue = async () => {
    try {
      const response = await axios.get('/api/signatures/pending');
 // 🚨 방어 로직 추가: 서버 응답이 '배열'이고, 데이터가 1개 이상 있을 때만 상태를 업데이트합니다.
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setQueue(response.data); 
      } else {
        // 서버 데이터가 비어있다면 콘솔에 알림만 띄우고, 화면의 가짜 데이터(UI)는 붕괴되지 않게 유지합니다.
        console.log("서버에서 받아온 대기열 데이터가 없습니다. UI 확인용 데이터를 유지합니다.");
      }
    } catch (error) {
      console.error('대기열 API 통신 실패:', error);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async () => {
    if (!password) {
      alert('전자서명을 위한 비밀번호를 입력해주세요.');
      return;
    }
    if (!selectedTask) return;

    try {
      await axios.post(`/api/signatures/${selectedTask.id}/approve`, {
        approverId: 'admin123',
        password: password
      });
      alert('승인 및 Audit Log 저장이 완료되었습니다.');
      setPassword('');
      setSelectedTask(null);
      fetchQueue(); 
    } catch (error) {
      alert('승인 실패: 비밀번호를 확인해주세요.');
    }
  };

return (
    // 전체 배경 (flex 적용)
    <div style={{ backgroundColor: '#4c72ec', minHeight: '100vh', display: 'flex' }}>
      
      {/* 사이드바 영역 */}
      <Sidebar />

      {/* 우측 메인 컨텐츠 영역: 사이드바 너비만큼 밀어내고 중앙 정렬 */}
      <div style={{ 
        flex: 1, 
        marginLeft: '260px', /* 🚨 사이드바의 실제 너비에 맞게 조절하세요 (보통 250px ~ 260px) */
        padding: '40px 20px', 
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center', /* 카드 UI를 가로 중앙에 배치 */
        alignItems: 'flex-start'  /* 카드 UI를 위쪽으로 붙임 */
      }}>
        
        {/* 하얀색 카드 UI */}
        <div style={{ 
          width: '100%',          /* 화면이 좁아져도 꽉 차게 */
          maxWidth: '1200px',     /* 너무 넓어지지 않게 최대 너비 제한 */
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: '30px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#0056b3', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginTop: 0 }}>
            Pending Signatures (전자서명 승인 대기열)
          </h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fc', color: '#6e707e', fontSize: '14px' }}>
                <th style={{ padding: '15px', borderBottom: '2px solid #e3e6f0' }}>BATCH / DOC (요청 ID)</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e3e6f0' }}>TYPE (요청 종류)</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e3e6f0' }}>REQUESTER (요청자)</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e3e6f0' }}>WAIT TIME (요청 시간)</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e3e6f0', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {queue.length > 0 ? (
                queue.map((task) => (
                  <tr key={task.id} style={{ borderBottom: '1px solid #e3e6f0', color: '#3a3b45' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>BAT-2024-{task.id}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ backgroundColor: '#eaecf4', padding: '5px 10px', borderRadius: '15px', fontSize: '13px', color: '#4e73df' }}>
                        {task.targetType}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>{task.requesterId}</td>
                    <td style={{ padding: '15px', color: '#e74a3b', fontWeight: 'bold' }}>
                      {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button 
                        onClick={() => setSelectedTask(task)}
                        style={{ 
                          backgroundColor: '#ffffff', color: '#4e73df', border: '1px solid #4e73df', 
                          padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                        }}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#858796' }}>대기 중인 서명 요청이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 전자서명 모달 영역 */}
          {selectedTask && (
            <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #e3e6f0', borderRadius: '8px', backgroundColor: '#f8f9fc' }}>
              <h3 style={{ marginTop: 0, color: '#4e73df' }}>서명 진행 (문서 번호: BAT-2024-{selectedTask.id})</h3>
              <p style={{ color: '#5a5c69' }}>관리자 비밀번호를 입력하여 전자서명을 완료하세요.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="password" 
                  placeholder="비밀번호 입력" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #d1d3e2', borderRadius: '4px', width: '250px' }}
                />
                <button 
                  onClick={handleApprove} 
                  style={{ backgroundColor: '#4e73df', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                  승인 완료
                </button>
                <button 
                  onClick={() => setSelectedTask(null)} 
                  style={{ backgroundColor: '#858796', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Esignature;