import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";

import { Button, Col, Container, Form, Modal, Pagination, Row, Table } from "react-bootstrap";
import { Content, Ctap, DflexColumn, Wrapper } from "../styled/Sales.styles";
import Top from "../include/Top";
import { Center, Dflex, PageTotal, SpaceBetween } from "../styled/Component.styles";
import Lnb from "../include/Lnb";

const API_BASE = "http://localhost:9500";

type KpiItem = {
    id: number;
    kpiName: string;
    kpiGroup?: string;
    owner?: string;
    periodType: "MONTH" | "QUARTER" | "YEAR";
    periodValue: string;
    targetValue: number;
    actualValue: number;
    unit?: string;
    status?: "ON_TRACK" | "RISK" | "OFF_TRACK";
    useYn: "Y" | "N";
    remark?: string;
}

type PageResponse<T> = {
    content: T[]; //실제 데이터 목록 (T는 어떤 데이터도 가능하다는 의미)
    totalElements: number; //전체 데이터 개수
    totalPages: number; //전체 페이지 수
    number: number; //현재 페이지 번호 (0부터)
    size: number; //한 페이지당 개수
}

//테이블 상단에 들어가는 헤더
//KpiItem에 들어있는 속성 중 하나를 key로 쓰고, 화면에 보여줄 이름(label)을 같이 묶은 목록이다
//key: keyof KpiItem KpiItem 안에 실제로 존재하는 필드 이름만 key로 쓸 수 있다
const TABLE_HEADERS: {key: keyof KpiItem; label: string;}[] = [
    { key: "kpiName", label: "KPI명" },
    { key: "kpiGroup", label: "그룹" },
    { key: "owner", label: "담당자" },
    { key: "periodType", label: "기간유형" },
    { key: "periodValue", label: "기간" },
    { key: "targetValue", label: "목표" },
    { key: "actualValue", label: "실적" },
    { key: "unit", label: "단위" },
    { key: "status", label: "상태" },
    { key: "useYn", label: "사용여부" },
    { key: "remark", label: "비고" },
];

const KpiManagement = () => {
    const [rows, setRows] = useState<KpiItem[]>([]);
    const [page, setPage] = useState(0);    //페이지 번호
    const [size] = useState(10);   //한페이지의 크기
    const [totalPages, setTotalPages] = useState(0);    //전체 페이지 크기
    const [totalElements, setTotalElements] = useState(0);  //전체 데이터
    //모달
    const [showCreate, setShowCreate] = useState(false);

    //상세 모달
    const [showDetail, setShowDetail] = useState(false);
    const [selected, setSelected] = useState<KpiItem | null>(null);
    const [createForm, setCreateForm] = useState({
        kpiName: "",
        kpiGroup: "",
        owner: "",
        periodType: "MONTH" as "MONTH" | "QUARTER" | "YEAR",
        periodValue: "",
        targetValue: "",
        actualValue: "",
        unit: "",
        status: "ON_TRACK" as "ON_TRACK" | "RISK" | "OFF_TRACK",
        useYn: "Y" as "Y" | "N",
        remark: "",
    });

    const [editForm, setEditForm] = useState({ ...createForm });

    const onCreateChange = (e:React.ChangeEvent<any>) => { //등록폼 변경 함수
        //e : 이벤트 객체 (input에서 값이 바뀔 때 React가 주는 정보)
        //React.ChangeEvent<any> : changeEvent라는 타입을 붙인것

        const {name, value} = e.target;
        setCreateForm((prev) => ({...prev, [name]:value})); //( )안에 기존 값이 있고 ...으로 복사 후 그 중 name의 value만 변경
    }

    //수정
    const onEditChange = (e:React.ChangeEvent<any>) => {
        const {name, value} = e.target;
        setEditForm((prev) => ({...prev, [name]:value}));
    }

    //목록조회 페이징
    const fetchList = async (p:number) => {
        try{
            const res = await fetch(`${API_BASE}/api/kpis?page=${p}&size=${size}`);
            if(!res.ok) { throw new Error("서버 오류"); }

            const data:PageResponse<KpiItem> = await res.json(); //응답 body를 JSON으로 변환해서 data에 넣음 (PageResponse<KpiItem>로 형태지정)

            setRows(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        }catch(err){
            console.error("KPI 목록조회 실패", err);
        }
    };

    useEffect(() => {
        fetchList(page);
    }, [page]);

    const goPage = (p:number) => {
        /* 
        p를 안전한 범위로 강제로 맞춰주는 계산
        목표 범위
        최소값: 0 (맨 첫 페이지)
        최대값: totalPages - 1 (맨 마지막 페이지)
        */
        const next = Math.max(0, Math.min(p, totalPages - 1)); //next값이 0 ~ (totalPAges - 1)의 값이 돼도록 설정하기 위해 사용
        //Math.min을 사용하면 p의값이 totalPages - 1의 값을 넘어서면 totalPages - 1 의 값으로 바꿔줌
        //max는 반대로 값이 낮아지면 0으로 보냄

        setPage(next);
    }

    //엑셀 저장
    const handleExcelDownload = () => {
        const excelData = [
            ["#", ...TABLE_HEADERS.map((h) => h.label)],
            ...rows.map((r, i) => [
                i + 1 + page * size,
                r.kpiName,
                r.kpiGroup ?? "",
                r.owner ?? "",
                r.periodType,
                r.periodValue,
                r.targetValue,
                r.actualValue,
                r.unit ?? "",
                r.status ?? "",
                r.useYn,
                r.remark ?? "",
            ]),
        ];

        const ws = XLSX.utils.aoa_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "KPI관리");

        const file = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([file]), "KPI관리.xlsx");
    };

    //등록저장
    const handleSave = async () => {
        const targetValue = Number(createForm.targetValue || 0);
        const actualValue = Number(createForm.actualValue || 0);

        const res = await fetch(`${API_BASE}/api/kpis`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...createForm,
                targetValue: Number(createForm.targetValue || 0),
                actualValue: Number(createForm.actualValue || 0),
            }),
        });

        if (!res.ok) {
            alert("등록 실패");
            return;
        }

        setShowCreate(false); //성공시 모달 닫기 + 목록 다시 불러오기
        fetchList(page); //현재 페이지 기준으로 목록을 다시 조회

        setCreateForm({
            kpiName: "",
            kpiGroup: "",
            owner: "",
            periodType: "MONTH",
            periodValue: "",
            targetValue: "",
            actualValue: "",
            unit: "",
            status: "ON_TRACK",
            useYn: "Y",
            remark: "",
        });
    }

    //상세 열기
    const openDetail = async(id:number) => {
        const res = await fetch(`${API_BASE}/api/kpis/${id}`);
        if(!res.ok) { throw new Error("상세조회 실패") }
        const data:KpiItem = await res.json(); //서버가 내려준 JSON응답을 자바스크립트 객체로 변환

        setSelected(data);
        setEditForm({   //수정폼에 넣을 값들을 한꺼번에 세팅 시작
            kpiName: data.kpiName || "",
            kpiGroup: data.kpiGroup || "",
            owner: data.owner || "",
            periodType: (data.periodType || "MONTH") as "MONTH" | "QUARTER" | "YEAR", //이 값은 이 3개중 하나라고 타입을 지정
            periodValue: data.periodValue || "",
            targetValue: String(data.targetValue ?? ""),
            actualValue: String(data.actualValue ?? ""),
            unit: data.unit || "",
            status: (data.status || "ON_TRACK") as "ON_TRACK" | "RISK" | "OFF_TRACK",
            useYn: (data.useYn || "Y") as "Y" | "N",
            remark: data.remark || "",
        });
        setShowDetail(true); //상세 모달 띄움
    }

    //수정
    const handleUpdate = async () => {
        if(!selected) return;

        const targetValue = Number(editForm.targetValue || 0);
        const actualValue = Number(editForm.actualValue || 0);

        const res = await fetch(`${API_BASE}/api/kpis/${selected.id}`, {
            method: "PUT",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                ...editForm, targetValue, actualValue,
            }),
        });

        if(!res.ok){
            const raw = await res.text().catch(() => "");
            alert(raw || "수정 실패");
            return ;
        }
        
        setShowDetail(false);
        fetchList(page);
        //성공처리 상세창을 닫고 목록을 새로고침
    }

    //삭제
    const handleDelete = async () => {
        if(!selected) return;   //삭제할 대상이 있는지 확인

        const ok = window.confirm("정말 삭제 할까요");
        if (!ok) return;

        //서버에 삭제 요청 보내기
        const res = await fetch(`${API_BASE}/api/kpis/${selected.id}`, {
            method: "DELETE",
        })

        if(!res.ok){
            const raw = await res.text().catch(() => "");
            alert(raw || "삭제 실패");
            return;
        }

        setShowDetail(false);
        fetchList(page);
    }

    return(
        <>
        <Wrapper>
            <Lnb/>
            <DflexColumn>
                <Content>
                    <Top/>
                </Content>

                <Container fluid className="p-0">
                    <Row>
                        <Col>
                            <Ctap>
                                <SpaceBetween>
                                    <h4>KPI관리</h4>
                                    <Dflex>
                                        <Button className="mx-2 my-3" onClick={handleExcelDownload} variant="success">엑셀다운로드</Button>
                                        <Button className="my-3" onClick={() => setShowCreate(true)} variant="primary">KPI등록</Button>
                                    </Dflex>
                                </SpaceBetween>
                                <Table bordered hover>
                                    <thead>
                                        <tr className="text-center">
                                            <th>#</th>
                                            {TABLE_HEADERS.map((h) => (
                                                <th key={h.key as string}>{h.label}</th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {(rows || []).map((r, i) => (
                                            <tr key={r.id ?? i} className="text-center">
                                                <td>{i + 1 + page * size}</td>
                                                <td onClick={() => openDetail(r.id)}>
                                                    {r.kpiName}
                                                </td>
                                                <td>{r.kpiGroup ?? ""}</td>
                                                <td>{r.owner ?? ""}</td>
                                                <td>{r.periodType}</td>
                                                <td>{r.periodValue}</td>
                                                <td>{r.targetValue}</td>
                                                <td>{r.actualValue}</td>
                                                <td>{r.unit ?? ""}</td>
                                                <td>{r.status ?? ""}</td>
                                                <td>{r.useYn}</td>
                                                <td>{r.remark ?? ""}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                
                                <Center>
                                    <Pagination>
                                      <Pagination.Prev disabled={page === 0} onClick={() => goPage(page - 1)} />
                                      {Array.from({ length: totalPages }).map((_, i) => (
                                        <Pagination.Item key={i} active={i === page} onClick={() => goPage(i)}>
                                          {i + 1}
                                        </Pagination.Item>
                                      ))}
                                      <Pagination.Next disabled={page >= totalPages - 1} onClick={() => goPage(page + 1)} />
                                    </Pagination>
                                    <PageTotal>
                                      총 {totalElements}건 / {page + 1}페이지
                                    </PageTotal>
                                </Center>
                            </Ctap>
                        </Col>
                    </Row>
                </Container>
            </DflexColumn>
        </Wrapper>

        {/*모달*/}
        <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    KPI 정보
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Control className="mb-2" name="kpiName" placeholder="KPI명" value={createForm.kpiName} onChange={onCreateChange} />
                    <Form.Control className="mb-2" name="kpiGroup" placeholder="그룹" value={createForm.kpiGroup} onChange={onCreateChange} />
                    <Form.Control className="mb-2" name="owner" placeholder="담당자" value={createForm.owner} onChange={onCreateChange} />

                    <Form.Select className="mb-2" name="periodType" value={createForm.periodType} onChange={onCreateChange}>
                        <option value="MONTH">월</option>
                        <option value="QUARTER">분기</option>
                        <option value="YEAR">연</option>
                    </Form.Select>

                    <Form.Control className="mb-2" name="periodValue" placeholder="기간" value={createForm.periodValue} onChange={onCreateChange} />

                    <Form.Control className="mb-2" type="number" name="targetValue" placeholder="목표" value={createForm.targetValue} onChange={onCreateChange} />
                    <Form.Control className="mb-2" type="number" name="actualValue" placeholder="실적" value={createForm.actualValue} onChange={onCreateChange} />
                    <Form.Control className="mb-2" name="unit" placeholder="단위" value={createForm.unit} onChange={onCreateChange} />

                    <Form.Select className="mb-2" name="status" value={createForm.status} onChange={onCreateChange}>
                    <option value="ON_TRACK">정상</option>
                    <option value="RISK">주의</option>
                    <option value="OFF_TRACK">위험</option>
                    </Form.Select>

                    <Form.Select className="mb-2" name="useYn" value={createForm.useYn} onChange={onCreateChange}>
                    <option value="Y">사용</option>
                    <option value="N">미사용</option>
                    </Form.Select>

                    <Form.Control className="mb-2" name="remark" placeholder="비고" value={createForm.remark} onChange={onCreateChange} />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowCreate(false)}>
                    닫기
                </Button>
                <Button onClick={handleSave}>저장</Button>
            </Modal.Footer>
        </Modal>

        {/* 상세(수정/삭제) 모달 */}
        <Modal show={showDetail} onHide={() => setShowDetail(false)} centered>
            <Modal.Header closeButton>
            <Modal.Title>KPI 상세</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Control className="mb-2" name="kpiName" placeholder="KPI명" value={editForm.kpiName} onChange={onEditChange} />
                    <Form.Control className="mb-2" name="kpiGroup" placeholder="그룹" value={editForm.kpiGroup} onChange={onEditChange} />
                    <Form.Control className="mb-2" name="owner" placeholder="담당자" value={editForm.owner} onChange={onEditChange} />

                    <Form.Select className="mb-2" name="periodType" value={editForm.periodType} onChange={onEditChange}>
                    <option value="MONTH">월</option>
                    <option value="QUARTER">분기</option>
                    <option value="YEAR">연</option>
                    </Form.Select>

                    <Form.Control className="mb-2" name="periodValue" placeholder="기간" value={editForm.periodValue} onChange={onEditChange} />

                    <Form.Control className="mb-2" type="number" name="targetValue" placeholder="목표" value={editForm.targetValue} onChange={onEditChange} />
                    <Form.Control className="mb-2" type="number" name="actualValue" placeholder="실적" value={editForm.actualValue} onChange={onEditChange} />
                    <Form.Control className="mb-2" name="unit" placeholder="단위" value={editForm.unit} onChange={onEditChange} />

                    <Form.Select className="mb-2" name="status" value={editForm.status} onChange={onEditChange}>
                    <option value="ON_TRACK">정상</option>
                    <option value="RISK">주의</option>
                    <option value="OFF_TRACK">위험</option>
                    </Form.Select>

                    <Form.Select className="mb-2" name="useYn" value={editForm.useYn} onChange={onEditChange}>
                    <option value="Y">사용</option>
                    <option value="N">미사용</option>
                    </Form.Select>

                    <Form.Control className="mb-2" name="remark" placeholder="비고" value={editForm.remark} onChange={onEditChange} />
                </Form>
            </Modal.Body>

            <Modal.Footer>
            <Button variant="danger" onClick={handleDelete}>
                삭제
            </Button>
            <Button variant="success" onClick={handleUpdate}>
                수정
            </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
}
export default KpiManagement;