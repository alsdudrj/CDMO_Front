import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Table, Modal, Button } from 'react-bootstrap';
import MainLayout from '../layout/MainLayout';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faEye, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getAuditLogs } from '../../api';
import type { AuditLogDto } from '../../api';

// --- 스타일 컴포넌트 정의 ---
const LogCard = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 1.5rem;
`;

const AuditLogPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogDto[]>([]);
    const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);

    //검색 상태
    const [keyword, setKeyword] = useState("");
    const [action, setAction] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    //로딩 상태
    const [loading, setLoading] = useState(false);

    //페이징 상태
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchLogs();
    }, []);

    //API 호출
    const fetchLogs = async (pageNumber: number = page) => {
        setLoading(true);

        try {
            const response = await getAuditLogs({
                keyword: keyword || undefined,
                action: action || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                page: pageNumber,
                size: 10
            });

            setLogs(response.content);
            setTotalPages(response.totalPages);
            setPage(response.number);

        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    //JSON 문자열을 포맷팅
    const parseJson = (jsonStr: string | null) => {
        if (!jsonStr) return null;
        try {
            return JSON.parse(jsonStr);
        } catch {
            return jsonStr; // JSON이 아니면 원본 반환
        }
    };

    //액션에 따른 배지 스타일
    const getActionBadge = (action: string) => {
        switch (action) {
            case 'CREATE': return <Badge bg="success">CREATE</Badge>;
            case 'UPDATE': return <Badge bg="primary">UPDATE</Badge>;
            case 'DELETE': return <Badge bg="danger">DELETE</Badge>;
            case 'SIGNATURE_APPROVED': return <Badge bg="warning">SIGNATURE</Badge>;
            case 'DEVIATION_APPROVED': return <Badge bg="info">DEVIATION</Badge>;
            default: return <Badge bg="secondary">{action}</Badge>;
        }
    };

    //상세보기
    const parseAuditLogToReadable = (beforeJson: string | null, afterJson: string | null) => {
        if (!beforeJson && !afterJson) return "데이터 없음";

        //JSON 파싱
        const before = beforeJson ? JSON.parse(beforeJson) : {};
        const after = afterJson ? JSON.parse(afterJson) : {};
        
        const diffs: React.ReactNode[] = [];

        //모든 키의 합집합을 구하여 비교
        const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

        allKeys.forEach(key => {
            const bVal = before[key];
            const aVal = after[key];

            //Processes(공정) 상세 변경 처리
            if (key === 'processes' && Array.isArray(bVal) && Array.isArray(aVal)) {
                if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
                    
                    //공정 전체가 바뀌었을 때의 헤더
                    diffs.push(<div key="processes-header" className="fw-bold text-primary mt-2">🔄 공정 상세 변경 사항</div>);

                    //Processes 내부 상세 비교 로직 (직접 JSON stringify 비교)
                    diffs.push(
                        <div key="processes-details" className="ms-3 text-muted small" style={{ fontFamily: 'monospace' }}>
                            <div className="text-danger">
                                <FontAwesomeIcon icon={faTimes} className="me-1" />
                                기존: {JSON.stringify(bVal)}
                            </div>
                            <div className="text-success">
                                <FontAwesomeIcon icon={faEye} className="me-1" />
                                변경: {JSON.stringify(aVal)}
                            </div>
                        </div>
                    );
                }
            }
            
            //일반 필드 변경 처리 (CREATE, UPDATE, DELETE 감지)
            else if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
                
                //CREATE (생성)
                if (bVal === undefined || bVal === null) {
                    diffs.push(
                        <div key={`${key}-create`} style={{ paddingLeft: '14px' }}>
                            ✨ <strong>{key}</strong>: 생성됨 ➡️ {JSON.stringify(aVal)}
                        </div>
                    );
                }
                //DELETE (삭제)
                else if (aVal === undefined || aVal === null) {
                    diffs.push(
                        <div key={`${key}-delete`} style={{ paddingLeft: '14px' }}>
                            🗑️ <strong>{key}</strong>: {JSON.stringify(bVal)} ➡️ 삭제됨
                        </div>
                    );
                }
                //UPDATE (변경)
                else {
                    diffs.push(
                        <div key={`${key}-update`} style={{ paddingLeft: '14px' }}>
                            🛠️ <strong>{key}</strong>: {JSON.stringify(bVal)} ➡️ {JSON.stringify(aVal)}
                        </div>
                    );
                }
            }
        });

        return diffs.length > 0 ? diffs : <div>변경된 내용 없음</div>;
    };

    /* ================검색/페이징 관련================== */
    //검색
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLogs();
    };

    const handleReset = () => {
        setKeyword("");
        setAction("");
        setStartDate("");
        setEndDate("");
        fetchLogs();
    };

    //페이지 번호
    const renderPagination = () => {

        const pages = [];

        const start = Math.max(0, page - 2);
        const end = Math.min(totalPages - 1, page + 2);

        for(let i = start; i <= end; i++){
            pages.push(
                <li key={i} className={`page-item ${i === page ? "active" : ""}`}>
                    <button
                        className="page-link"
                        onClick={() => goToPage(i)}
                    >
                        {i + 1}
                    </button>
                </li>
            );
        }

        return pages;
    }

    //페이지 이동
    const goToPage = (pageNumber:number) => {
        fetchLogs(pageNumber);
    }
    //이전 버튼
    const goPrev = () => {
        if(page > 0){
            fetchLogs(page - 1);
        }
    }
    //다음 버튼
    const goNext = () => {
        if(page < totalPages - 1){
            fetchLogs(page + 1);
        }
    }
    //첫 페이지
    const goFirst = () => {
        fetchLogs(0);
    }

    //마지막 페이지
    const goLast = () => {
        fetchLogs(totalPages - 1);
    }
    /* =================================================== */

    return (
        <MainLayout>
            <Container fluid className="px-0">
                <Row className="mb-4">
                    <Col>
                        <h2 className="fw-bold mb-0 text-dark">
                            <FontAwesomeIcon icon={faHistory} className="me-2" />
                            시스템 감사 로그 (Audit Log)
                        </h2>
                    </Col>
                </Row>

                {/* 검색 */}
                <Row className="mb-3">
                    <Col>
                        <Card className="p-3 shadow-sm border-0">
                            <Row className="g-3 align-items-end">

                                {/* 날짜 */}
                                <Col md={4}>
                                    <label className="form-label small fw-bold text-muted">DATE RANGE</label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={startDate}
                                            onChange={(e)=>setStartDate(e.target.value)}
                                        />
                                        <span>~</span>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={endDate}
                                            onChange={(e)=>setEndDate(e.target.value)}
                                        />
                                    </div>
                                </Col>

                                {/* 키워드 */}
                                <Col md={4}>
                                    <label className="form-label small fw-bold text-muted">KEYWORD</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="username, entity..."
                                        value={keyword}
                                        onChange={(e)=>setKeyword(e.target.value)}
                                    />
                                </Col>

                                {/* Action */}
                                <Col md={2}>
                                    <label className="form-label small fw-bold text-muted">ACTION</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={action}
                                        onChange={(e)=>setAction(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        <option value="CREATE">CREATE</option>
                                        <option value="UPDATE">UPDATE</option>
                                        <option value="DELETE">DELETE</option>
                                        <option value="SIGNATURE_APPROVED">SIGNATURE_APPROVED</option>
                                        <option value="DEVIATION_APPROVED">DEVIATION_APPROVED</option>
                                    </select>
                                </Col>

                                {/* 버튼 */}
                                <Col md={2} className="d-flex gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleReset}
                                    >
                                        Reset
                                    </Button>

                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleSearch}
                                    >
                                        Search
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {/* 테이블 */}
                <Row>
                    <Col>
                        <LogCard>
                            <Card.Body className="p-0">
                                <Table 
                                hover 
                                responsive 
                                className="mb-0"
                                style={{ tableLayout: "fixed", width: "100%"}}
                                >
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{width:"15%"}} className="px-4 py-3">일시</th>
                                            <th style={{width:"20%"}} className="px-4 py-3">작업자</th>
                                            <th style={{width:"30%"}} className="px-4 py-3">엔티티</th>
                                            <th style={{width:"10%"}} className="px-4 py-3">ID</th>
                                            <th style={{width:"10%"}} className="px-4 py-3">액션</th>
                                            <th style={{width:"5%"}} className="px-4 py-3 text-center">상세</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {logs.map((log) => (
                                            <tr key={log.id}>
                                                <td className="px-4 py-3 text-sm text-muted">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm fw-medium text-primary">
                                                    {log.username}
                                                </td>
                                                <td className="px-4 py-3 text-sm fw-bold">
                                                    {log.entityName}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {log.entityId}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getActionBadge(log.action)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button 
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => setSelectedLog(log)}
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                {/* 페이징 번호 */}
                                <div className="d-flex justify-content-center mt-3 mb-3">
                                    <nav>
                                        <ul className="pagination">
                                            <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={goFirst}>
                                                    First
                                                </button>
                                            </li>

                                            <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={goPrev}>
                                                    Previous
                                                </button>
                                            </li>

                                            {renderPagination()}

                                            <li className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={goNext}>
                                                    Next
                                                </button>
                                            </li>

                                            <li className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={goLast}>
                                                    Last
                                                </button>
                                            </li>

                                        </ul>
                                    </nav>
                                </div>
                            </Card.Body>
                        </LogCard>
                    </Col>
                </Row>

                {/* 상세 보기 모달 */}
                <Modal 
                    show={!!selectedLog} 
                    onHide={() => setSelectedLog(null)} 
                    size="xl" 
                    centered
                >
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold">
                            변경 이력 상세 ({selectedLog?.entityName} #{selectedLog?.entityId})
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="p-3 bg-light rounded-3 border">
                            <h6 className="fw-bold mb-3">상세 변경 내용</h6>
                            <p className="text-muted small">
                                {parseAuditLogToReadable(selectedLog?.beforeValue || null, selectedLog?.afterValue || null)}
                            </p>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                            닫기
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </MainLayout>
    );
};

export default AuditLogPage;