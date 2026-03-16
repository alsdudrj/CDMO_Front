import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { useDeviation } from '../../context/DeviationContext'; // 경로 확인 필요

const Esignature: React.FC = () => {
  // Context를 통해 상태와 선택된 일탈 데이터를 공유받습니다.
  const { 
      selectedDeviation, setSelectedDeviation, 
      isSignatureModalOpen, setSignatureModalOpen 
    } = useDeviation();

  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

// 모달 닫기 및 상태 초기화 함수
  const handleClose = () => {
    setSignatureModalOpen(false);
    setSelectedDeviation(null);
    setPassword('');
  };  

// 일탈 전용 전자서명 승인 처리 함수  
  const handleApprove = async () => {
    if (!password) {
      alert('전자서명을 위한 비밀번호를 입력해주세요.');
      return;
    }
    if (!selectedDeviation) return;

    try {
      setIsSubmitting(true);
      // 이전에 작성한 백엔드 '일탈-전자서명 연동 API' 호출
      await axios.post(`http://localhost:9500/api/deviations/${selectedDeviation.id}/approve`, {      
        approverId: 'admin123', // 실제 환경에서는 로그인된 세션의 사용자 ID로 변경
        password: password,
        comments: '일탈 승인 검토 완료'        
      });

      alert('일탈 승인 및 전자서명이 성공적으로 완료되었습니다.');
      handleClose();

      // 상태 업데이트를 위해 페이지 새로고침 (또는 Context의 fetch 함수 재호출)
      window.location.reload(); 
    } catch (error) {
      console.error('전자서명 승인 실패:', error);
      alert('승인 실패: 비밀번호를 확인하거나 서버 상태를 점검해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };


return (
<Modal show={isSignatureModalOpen} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white border-0">
        <Modal.Title className="h5 fw-bold">
          전자서명 (E-Signature)
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4 bg-light">
        {/* 파라미터 전달: 선택된 일탈 정보 표시 */}
        {selectedDeviation && (
          <div className="mb-4 bg-white p-3 border rounded shadow-sm">
            <h6 className="fw-bold text-primary mb-3">승인 대상 일탈 정보</h6>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small fw-bold text-uppercase">Batch ID</span>
              <span className="fw-semibold">{selectedDeviation.batchId}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small fw-bold text-uppercase">Parameter</span>
              <span className="fw-semibold">{selectedDeviation.parameter}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted small fw-bold text-uppercase">Deviation Value</span>
              <span className="fw-bold text-danger">{selectedDeviation.recordedValue}</span>
            </div>
          </div>
        )}

        <Form.Group className="bg-white p-3 border rounded shadow-sm">
          <Form.Label className="fw-bold text-dark small">관리자 인증</Form.Label>
          <Form.Control
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      
      <Modal.Footer className="bg-white border-top-0 pt-0">
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting} className="fw-bold">
          취소
        </Button>
        <Button variant="primary" onClick={handleApprove} disabled={isSubmitting} className="fw-bold">
          {isSubmitting ? '서명 진행 중...' : '서명 및 승인 완료'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Esignature;