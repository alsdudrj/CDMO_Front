import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../layout/MainLayout';
import SummaryCards from './SummaryCards';
import BatchProgress from './BatchProgress';
import DeviationChart from './DeviationChart';
import SignatureTable from './SignatureTable';
import SystemStatus from './SystemStatus';
import { useDeviation } from '../../context/DeviationContext';

import {
  summaryData,
  batchData,
  signatureData,
  alertData,
  statusData
} from '../../data/mockData';

const MESDashboard: React.FC = () => {
  const { deviations } = useDeviation();

  // Calculate deviation data dynamically for the chart
  const openDeviations = deviations.filter(d => d.status === 'OPEN');

  const criticalCount = openDeviations.filter(d => d.severity === 'CRITICAL').length;
  const majorCount = openDeviations.filter(d => d.severity === 'MAJOR').length;
  const minorCount = openDeviations.filter(d => d.severity === 'MINOR').length;

  const dynamicDeviationData = [
    { name: 'Critical', value: criticalCount, color: '#dc3545' },
    { name: 'Major', value: majorCount, color: '#ffc107' },
    { name: 'Minor', value: minorCount, color: '#0dcaf0' }
  ];

  // If there's no data yet, we can optionally use a default/empty state or show zeros.
  // It will render zeros smoothly.

  return (
    <MainLayout>
      <Container fluid className="px-0">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0 text-dark">Dashboard</h2>
          <Button variant="primary" className="fw-semibold shadow-sm">
            <FontAwesomeIcon icon={faFileDownload} className="me-2" />
            Generate Report
          </Button>
        </div>

        <SummaryCards data={summaryData} />

        <Row className="g-4 mb-4">
          <Col xl={8} lg={12}>
            <BatchProgress data={batchData} />
          </Col>
          <Col xl={4} lg={12}>
            <DeviationChart data={dynamicDeviationData} />
          </Col>
        </Row>

        <Row className="g-4">
          <Col xl={8} lg={12}>
            <SignatureTable data={signatureData} />
          </Col>
          <Col xl={4} lg={12}>
            <SystemStatus alert={alertData} status={statusData} />
          </Col>
        </Row>

        <footer className="mt-5 text-center text-muted small pb-4">
            Copyright © BioTrak MES 2024
        </footer>
      </Container>
    </MainLayout>
  );
};

export default MESDashboard;
