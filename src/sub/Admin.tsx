import React from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import { Row, Col, Button, Table, ProgressBar } from "react-bootstrap";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  DashboardContainer,
  SectionTitle,
  MetricCard,
  DashboardCard,
  StatusCard,
  AlertBox,
  ChartWrapper,
  DonutLabel,
  ProgressLabel,
  Badge
} from "../styled/Dashboard.styles";

// Mock Data
const metrics = [
  { title: "ACTIVE BATCHES (MONTHLY)", value: "12", icon: "fa-clipboard-list", color: "#4e73df" },
  { title: "OVERALL YIELD (ANNUAL)", value: "94.2%", icon: "fa-tint", color: "#1cc88a" },
  { title: "SCHEDULED TASKS", value: "50%", icon: "fa-check-square", color: "#36b9cc" },
  { title: "PENDING DEVIATIONS", value: "18", icon: "fa-exclamation-triangle", color: "#f6c23e" },
];

const batchProgress = [
  { name: "Monoclonal Antibody A (mAb-A)", batch: "BAT-2024-101", stage: "Cell Culture (Bioreactor)", progress: 65, eta: "4h 15m", color: "primary" },
  { name: "Recombinant Protein B", batch: "BAT-2024-104", stage: "Purification (Chromatography)", progress: 30, eta: "12h 00m", color: "info" },
  { name: "Vaccine Adjuvant C", batch: "BAT-2024-108", stage: "Fill & Finish", progress: 88, eta: "1h 10m", color: "success" },
];

const deviationData = [
  { name: 'Critical', value: 3, color: '#e74a3b' },
  { name: 'Major', value: 5, color: '#fd7e14' },
  { name: 'Minor', value: 12, color: '#f6c23e' },
];

const signatures = [
  { batch: "BAT-2024-089", desc: "mAb-A Production", type: "MFR Review", waitTime: "4h 30m", typeColor: "#e0f2fe", typeTextColor: "#4e73df", waitTimeColor: "#e74a3b" },
  { batch: "BAT-2024-092", desc: "Buffer Prep", type: "QA Release", waitTime: "1h 15m", typeColor: "#e0f2fe", typeTextColor: "#4e73df", waitTimeColor: "#f6c23e" },
  { batch: "EQP-BIO-004", desc: "Bioreactor Log", type: "Equip Log", waitTime: "20m", typeColor: "#f3f4f6", typeTextColor: "#5a5c69", waitTimeColor: "#1cc88a" },
];

const Admin: React.FC = () => {
  return (
    <div id="wrapper">
      <Lnb />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Top />
          <DashboardContainer>
            {/* Header */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
              <Button variant="primary" size="sm" className="d-none d-sm-inline-block shadow-sm">
                <i className="fas fa-download fa-sm text-white-50 mr-2"></i> Generate Report
              </Button>
            </div>

            {/* Metrics Row */}
            <Row>
              {metrics.map((item, index) => (
                <Col xl={3} md={6} className="mb-4" key={index}>
                  <MetricCard color={item.color}>
                    <div className="card-body">
                      <Row className="no-gutters align-items-center">
                        <Col className="mr-2">
                          <div className="text-xs font-weight-bold text-uppercase mb-1" style={{ color: item.color }}>
                            {item.title}
                          </div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">{item.value}</div>
                        </Col>
                        <Col className="col-auto">
                          <i className={`fas ${item.icon} fa-2x text-gray-300`}></i>
                        </Col>
                      </Row>
                    </div>
                  </MetricCard>
                </Col>
              ))}
            </Row>

            {/* Main Content Row */}
            <Row>
              {/* Active Batch Progress */}
              <Col xl={8} lg={7}>
                <DashboardCard>
                  <div className="card-header">
                    <SectionTitle><i className="fas fa-chart-line mr-2"></i>Active Batch Progress</SectionTitle>
                    <a href="#" className="small font-weight-bold" style={{textDecoration:'none'}}>View All Batches</a>
                  </div>
                  <div className="card-body">
                    {batchProgress.map((batch, index) => (
                      <div className="mb-4" key={index}>
                         <ProgressLabel>
                             <div>
                                <div className="title">{batch.name}</div>
                                <Badge bg="#f8f9fc" style={{color: '#858796', border: '1px solid #e3e6f0'}}>{batch.batch}</Badge>
                             </div>
                             <div className="meta">
                                 <div>{batch.stage}</div>
                                 {batch.eta && <div>ETA: <span style={{backgroundColor: '#4e73df', color: 'white', padding: '0 4px', borderRadius: '4px'}}>{batch.eta}</span></div>}
                             </div>
                         </ProgressLabel>
                         <ProgressBar now={batch.progress} variant={batch.color} style={{height: '0.5rem'}} />
                         <div className="text-right mt-1 small font-weight-bold" style={{color: batch.color === 'primary' ? '#4e73df' : batch.color === 'info' ? '#36b9cc' : '#1cc88a'}}>{batch.progress}%</div>
                      </div>
                    ))}
                  </div>
                </DashboardCard>
              </Col>

              {/* Deviation Status */}
              <Col xl={4} lg={5}>
                <DashboardCard>
                  <div className="card-header">
                      <SectionTitle><i className="fas fa-exclamation-circle mr-2"></i>Deviation Status</SectionTitle>
                      <span className="small text-muted">REAL-TIME</span>
                  </div>
                  <div className="card-body">
                    <ChartWrapper>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deviationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          >
                            {deviationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <DonutLabel>
                          <div className="value">20</div>
                          <div className="label">OPEN</div>
                      </DonutLabel>
                    </ChartWrapper>
                    <div className="mt-4">
                        {deviationData.map((item, index) => (
                            <div className="d-flex justify-content-between align-items-center mb-2 small" key={index}>
                                <span><i className="fas fa-circle mr-2" style={{color: item.color}}></i>{item.name}</span>
                                <span className="font-weight-bold">{item.value}</span>
                            </div>
                        ))}
                    </div>
                  </div>
                </DashboardCard>
              </Col>
            </Row>

            {/* Bottom Content Row */}
            <Row>
              {/* Pending Signatures */}
              <Col xl={8} lg={7}>
                 <DashboardCard>
                    <div className="card-header">
                        <SectionTitle>Pending Signatures</SectionTitle>
                    </div>
                    <div className="card-body p-0">
                        <Table hover responsive className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 small font-weight-bold text-muted text-uppercase">BATCH / DOC</th>
                                    <th className="border-0 small font-weight-bold text-muted text-uppercase">TYPE</th>
                                    <th className="border-0 small font-weight-bold text-muted text-uppercase">WAIT TIME</th>
                                    <th className="border-0 small font-weight-bold text-muted text-uppercase text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {signatures.map((sig, index) => (
                                    <tr key={index}>
                                        <td className="align-middle">
                                            <div className="font-weight-bold text-dark">{sig.batch}</div>
                                            <div className="small text-muted">{sig.desc}</div>
                                        </td>
                                        <td className="align-middle">
                                            <Badge bg={sig.typeColor} style={{color: sig.typeTextColor}}>{sig.type}</Badge>
                                        </td>
                                        <td className="align-middle font-weight-bold" style={{color: sig.waitTimeColor}}>
                                            {sig.waitTime}
                                        </td>
                                        <td className="align-middle text-right">
                                            <Button variant="outline-primary" size="sm">Review</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                 </DashboardCard>
              </Col>

              {/* System Alerts & Status Cards */}
              <Col xl={4} lg={5}>
                 <div className="mb-4">
                     <SectionTitle className="mb-3">System Alerts</SectionTitle>
                     <AlertBox>
                         <p>You have 2 critical maintenance alerts pending for Bioreactor B-02.</p>
                         <a href="#">View Maintenance Schedule →</a>
                     </AlertBox>
                 </div>

                 <Row>
                     <Col md={6}>
                         <StatusCard bg="#4e73df">
                             <h6>Material Status</h6>
                             <div className="value">Normal</div>
                         </StatusCard>
                     </Col>
                     <Col md={6}>
                         <StatusCard bg="#1cc88a">
                             <h6>System Uptime</h6>
                             <div className="value">99.9%</div>
                         </StatusCard>
                     </Col>
                     <Col md={6}>
                         <StatusCard bg="#36b9cc">
                             <h6>Network</h6>
                             <div className="value">Secure</div>
                         </StatusCard>
                     </Col>
                     <Col md={6}>
                         <StatusCard bg="#f6c23e">
                             <h6>Audit Trail</h6>
                             <div className="value">Active</div>
                         </StatusCard>
                     </Col>
                 </Row>
              </Col>
            </Row>

            <div className="text-center text-muted small my-4">
                Copyright &copy; BioTrak MES 2024
            </div>

          </DashboardContainer>
        </div>
      </div>
    </div>
  );
};

export default Admin;
