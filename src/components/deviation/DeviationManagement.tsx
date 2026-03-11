import React, { useState, useRef } from 'react';
import MainLayout from '../layout/MainLayout';
//import { useDeviation, Deviation } from '../../context/DeviationContext';
// 추가: 모달 상태 제어를 위해 Context에서 필요한 함수 가져오기
import { useDeviation } from '../../context/DeviationContext';
import type { Deviation } from '../../context/DeviationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faRotateLeft,
  faMagic,
  faExclamationTriangle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { Modal, Button } from 'react-bootstrap';
// 추가: 모달 상태 제어를 위해 Context에서 필요한 함수 가져오기
import SignatureModal from '../esignature/SignatureModal';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// Injected from environment or empty

const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 5) => {
  let retries = 0;
  let delay = 1000;

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
      // 1s, 2s, 4s, 8s, 16s
    }
  }
};

const DeviationManagement: React.FC = () => {
// 수정: Context에서 모달 제어 함수와 선택된 일탈 상태 변경 함수를 가져옵니다.  
  const { 
    deviations, 
    selectedDeviation, //Context에서 가져옴
    setSelectedDeviation, //Context에서 가져옴
    setSignatureModalOpen 
  } = useDeviation();

  // Filter Drag Logic
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [filterDragHeight, setFilterDragHeight] = useState<number | null>(null);
  const filterIsDragging = useRef(false);
  const filterStartY = useRef(0);
  const FILTER_MAX_HEIGHT = 280;

  const currentFilterHeight = filterDragHeight !== null ?
    filterDragHeight : (isFilterCollapsed ? 0 : FILTER_MAX_HEIGHT);
  const currentFilterOpacity = filterDragHeight !== null ?
    filterDragHeight / FILTER_MAX_HEIGHT : (isFilterCollapsed ? 0 : 1);

  // AI Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleFilterPointerDown = (e: React.PointerEvent) => {
    filterIsDragging.current = true;
    filterStartY.current = e.clientY;
    setFilterDragHeight(isFilterCollapsed ? 0 : FILTER_MAX_HEIGHT);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleFilterPointerMove = (e: React.PointerEvent) => {
    if (!filterIsDragging.current) return;
    const deltaY = e.clientY - filterStartY.current;
    if (!isFilterCollapsed) {
      // Dragging Up
      const newH = Math.min(FILTER_MAX_HEIGHT, Math.max(0, FILTER_MAX_HEIGHT + deltaY));
      setFilterDragHeight(newH);
    } else {
      // Dragging Down
      const newH = Math.min(FILTER_MAX_HEIGHT, Math.max(0, 0 + deltaY));
      setFilterDragHeight(newH);
    }
  };

  const handleFilterPointerUp = (e: React.PointerEvent) => {
    if (!filterIsDragging.current) return;
    filterIsDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (filterDragHeight !== null) {
      if (!isFilterCollapsed && filterDragHeight < FILTER_MAX_HEIGHT - 60) {
        setIsFilterCollapsed(true);
      } else if (isFilterCollapsed && filterDragHeight > 60) {
        setIsFilterCollapsed(false);
      }
    }
    setFilterDragHeight(null);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-danger text-white';
      case 'MAJOR': return 'bg-warning text-dark';
      case 'MINOR': return 'bg-info text-white';
      default: return 'bg-light text-dark';
    }
  };

  const handleAIAnalysis = async (dev: Deviation) => {
    setSelectedDeviation(dev);
    setIsModalOpen(true);
    setIsAiLoading(true);
    setAiResponse('');
    setAiError('');

    const prompt = `당신은 제약/제조 산업의 수석 품질보증(QA) 전문가입니다. 다음 제조 공정 일탈(Deviation) 기록을 분석해주세요:

- 배치 ID: ${dev.batchId}
- 파라미터: ${dev.parameter}
- 측정값: ${dev.recordedValue}
- 기준값: ${dev.limitValue}
- 심각도: ${dev.severity}

위 데이터를 바탕으로 다음 세 가지 항목을 체계적으로 분석해주세요:
1. 잠재적 근본 원인 (Potential Root Causes) - 최소 2가지 제안
2. 품질에 미치는 영향 평가 (Quality Impact Assessment)
3. 권장 시정 및 예방 조치 (CAPA - Corrective and Preventive Actions)

전문적인 제조/품질 용어를 사용하여 가독성 좋은 한국어로 작성해주세요.`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [{ text: "당신은 문제를 분석하고 실행 가능한 해결책을 제시하는 전문적인 제조 품질 관리 AI 조수입니다." }]
        }
      };

      const result = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setAiResponse(text);
      } else {
        throw new Error('응답을 파싱할 수 없습니다.');
      }
    } catch (error) {
      setAiError('AI 분석을 불러오는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDeviation(null);
  };

  return (
    <MainLayout>
      {/* Toast Notification Container */}
      {/* We will implement a global toast container in MainLayout or App, but for now we rely on the context to trigger them.
          The requirement mentions "Trigger a visible Toast notification".
          Ideally, this should be handled at a higher level (App.tsx) so it persists across navigation,
          but if it's page-specific, we can 
          add it here. However, alerts should be global.
          We will handle Toast display in step 6.
      */}

      <div className="d-flex flex-column h-100 p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark m-0">Deviation Status</h2>
            <p className="text-muted small m-0">Track and manage parameter deviations occurring during the process.</p>
          </div>
          <button className="btn btn-primary shadow-sm fw-bold">
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Register Deviation
          </button>
        </div>

        <div className="flex-grow-1 d-flex flex-column overflow-hidden bg-white rounded-3 shadow-lg">

            {/* Filter Section */}
            <div className="bg-light rounded-top border-bottom d-flex flex-column flex-shrink-0">
              <div
                className="overflow-hidden position-relative"
                style={{
                  height: `${currentFilterHeight}px`,
                  transition: filterDragHeight === null ? 'height 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
                }}
              >
                <div
                  className="p-4 d-flex flex-column gap-3 w-100 position-absolute top-0 start-0"
                  style={{
                    height: `${FILTER_MAX_HEIGHT}px`,
                    opacity: currentFilterOpacity,
                    transition: filterDragHeight === null ? 'opacity 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
                  }}
                >
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">DATE RANGE</label>
                      <div className="d-flex align-items-center gap-2">
                        <input type="date" className="form-control form-control-sm" defaultValue="2026-02-20" />
                        <span className="text-muted">~</span>
                        <input type="date" className="form-control form-control-sm" defaultValue="2026-02-27" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">KEYWORD SEARCH</label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
                        <input type="text" className="form-control" placeholder="Search by ID, Parameter, etc." />
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">BATCH</label>
                      <select className="form-select form-select-sm">
                        <option>All Batches...</option>
                        <option>Batch #50021</option>
                        <option>Batch #50022</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">PROCESS</label>
                      <select className="form-select form-select-sm">
                        <option>All Processes...</option>
                        <option>Dispensing</option>
                        <option>Mixing</option>
                        <option>Filling</option>
                        <option>Packaging</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">STATUS</label>
                      <select className="form-select form-select-sm">
                        <option>All Statuses...</option>
                        <option>Initial Report</option>
                        <option>Under Investigation</option>
                        <option>Pending QA Review</option>
                        <option>Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 pt-2 mt-auto border-top border-dashed">
                    <button className="btn btn-outline-secondary btn-sm fw-bold">
                      <FontAwesomeIcon icon={faRotateLeft} className="me-1" /> Reset
                    </button>
                    <button className="btn btn-primary btn-sm fw-bold">
                      <FontAwesomeIcon icon={faSearch} className="me-1" /> Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Drag Handle */}
              <div
                className="d-flex justify-content-center align-items-center py-2 bg-light border-top"
                style={{ cursor: 'ns-resize', touchAction: 'none' }}
                onPointerDown={handleFilterPointerDown}
                onPointerMove={handleFilterPointerMove}
                onPointerUp={handleFilterPointerUp}
                onPointerCancel={handleFilterPointerUp}
                title={isFilterCollapsed ? "Drag down to open filters" : "Drag up to close filters"}
              >
                <div className="rounded-pill bg-secondary" style={{ width: '40px', height: '4px', opacity: 0.5 }}></div>
              </div>
            </div>

            {/* Table Section */}
            <div className="flex-grow-1 overflow-auto">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light sticky-top" style={{ zIndex: 1 }}>
                  <tr>
                    <th className="px-4 py-3 small fw-bold text-muted text-uppercase">ID</th>
                    <th className="px-4 py-3 small fw-bold text-muted text-uppercase">Batch ID</th>
                    <th className="px-4 py-3 small fw-bold text-muted text-uppercase">Parameter</th>
                    <th className="px-4 py-3 small fw-bold text-muted text-uppercase">Recorded / Limit</th>
                    <th className="px-4 py-3 small fw-bold text-muted text-center text-uppercase">Severity</th>
                    <th className="px-4 py-3 small fw-bold text-muted text-uppercase">Status</th>
                    <th className="px-4 py-3 small fw-bold text-muted text-uppercase">Occurred At</th>
                    <th className="px-4 py-3 small fw-bold text-muted text-end text-uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deviations.map((dev) => (
                    <tr key={dev.id}>
                      <td className="px-4 fw-bold text-secondary text-truncate" style={{maxWidth: '100px'}} title={String(dev.id)}>
                        #{String(dev.id).substring(0, 8)}...
                        </td>
                      <td className="px-4 text-dark fw-medium">{dev.batchId}</td>
                      <td className="px-4 fw-semibold text-primary">{dev.parameter}</td>
                      <td className="px-4">
                        <span className={`fw-bold ${dev.severity === 'CRITICAL' ? 'text-danger' : dev.severity === 'MAJOR' ? 'text-warning' : 'text-dark'}`}>
                          {dev.recordedValue}
                        </span>
                        <span className="text-muted small ms-1">/ {dev.limitValue}</span>
                      </td>
                      <td className="px-4 text-center">
                        <span className={`badge rounded-pill ${getSeverityBadge(dev.severity)} px-3 py-2`}>
                          {dev.severity}
                        </span>
                      </td>
                      <td className="px-4">
                        <div className="d-flex flex-column">
                          <span className="fw-semibold small text-dark">{dev.status}</span>
                          <span className={`small ${dev.isClosed ? 'text-success' : 'text-warning'}`}>
                            {dev.isClosed ? 'Closed' : 'Open'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 text-muted small">{new Date(dev.createdAt).toLocaleString()}</td>
                      <td className="px-4 text-end">
                        {/* 추가: 일탈 상태가 OPEN일 때만 전자서명 버튼 노출 */}
                        {dev.status === 'OPEN' && (
                          <button
                            className="btn btn-sm btn-primary fw-bold me-2"
                            onClick={() => {
                              setSelectedDeviation(dev); // 클릭한 일탈 데이터 저장
                              setSignatureModalOpen(true); // 전자서명 모달 열기
                            }}
                          >
                            전자서명 승인
                          </button>
                          )}
                       
                        {/* AI Analysis 버튼 */}
                          <button
                            className="btn btn-sm btn-outline-primary fw-bold me-2"
                            onClick={() => handleAIAnalysis(dev)}
                            >
                          <FontAwesomeIcon icon={faMagic} className="me-1" /> AI Analysis
                        </button>
                        
                        <button className="btn btn-sm btn-light fw-bold text-muted">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {deviations.length === 0 && (
                      <tr>
                          <td colSpan={8} className="text-center py-5 text-muted">
                              <FontAwesomeIcon icon={faSpinner} spin className="me-2"/>
                              Waiting for data...
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>

      {/* AI Analysis Modal */}
      <Modal show={isModalOpen} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-white border-0">
            <Modal.Title className="d-flex align-items-center gap-2 h5 fw-bold">
                <FontAwesomeIcon icon={faMagic} className="text-warning" />
                Gemini AI Deep Analysis
            </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light p-4">
            {selectedDeviation && (
                <div className="bg-white border rounded p-3 mb-4 shadow-sm d-flex gap-4">
                    <div>
                        <small className="d-block text-muted fw-bold text-uppercase mb-1">Batch ID</small>
                        <span className="fw-semibold">{selectedDeviation.batchId}</span>
                    </div>
                    <div>
                        <small className="d-block text-muted fw-bold text-uppercase mb-1">Parameter</small>
                        <span className="fw-semibold text-primary">{selectedDeviation.parameter}</span>
                    </div>
                    <div>
                        <small className="d-block text-muted fw-bold text-uppercase mb-1">Deviation Value</small>
                        <span className="fw-bold text-danger">{selectedDeviation.recordedValue}</span>
                        <small className="text-muted ms-1">(Limit: {selectedDeviation.limitValue})</small>
                    </div>
                </div>
            )}

            <div className="bg-white border rounded p-4 shadow-sm" style={{ minHeight: '200px' }}>
                {isAiLoading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 py-4 text-primary">
                        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-3" />
                        <p className="fw-bold mb-0">Analyzing QA data and generating solutions...</p>
                        <small className="text-muted mt-2">Powered by Gemini AI</small>
                    </div>
                ) : aiError ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 py-4 text-danger">
                        <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-2" />
                        <p className="fw-bold">{aiError}</p>
                    </div>
                ) : (
                    <div className="prose text-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {aiResponse}
                    </div>
                )}
            </div>
        </Modal.Body>
        <Modal.Footer className="bg-white border-top-0">
            <Button variant="secondary" onClick={closeModal} className="fw-bold">
                Close
            </Button>
        </Modal.Footer>
      </Modal>
      {/* 추가: 전자서명 연동 모달 컴포넌트 삽입 */}
      <SignatureModal />      
    </MainLayout>
  );
};

export default DeviationManagement;