import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ISummaryCard } from '../../types';
import { faBox, faFlask, faCalendarCheck, faExclamationTriangle, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

const StyledCard = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  height: 100%;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #0d6efd; // Default primary
  font-size: 1.25rem;
`;

const ValueText = styled.h3`
  font-weight: 700;
  margin-bottom: 0;
  color: #212529;
`;

const TitleText = styled.div`
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const TrendBadge = styled.span<{ $positive?: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$positive ? '#198754' : '#dc3545'};
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-weight: 600;
`;

interface Props {
  data: ISummaryCard[];
}

const getIcon = (iconName: string | undefined) => {
    switch(iconName) {
        case 'box': return faBox;
        case 'flask': return faFlask;
        case 'calendar-check': return faCalendarCheck;
        case 'triangle-exclamation': return faExclamationTriangle;
        default: return faBox;
    }
}

const SummaryCards: React.FC<Props> = ({ data }) => {
  return (
    <Row className="g-4 mb-4">
      {data.map((item, index) => (
        <Col key={index} xs={12} sm={6} xl={3}>
          <StyledCard>
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <TitleText>{item.title}</TitleText>
                <ValueText>{item.value}</ValueText>
                {/*
                  Trend is optional, assuming it might be added to ISummaryCard later or reused.
                  Currently ISummaryCard has trend?: string
                */}
                {item.trend && (
                    <TrendBadge $positive={item.trend.startsWith('+')}>
                        <FontAwesomeIcon icon={item.trend.startsWith('+') ? faArrowUp : faArrowDown} />
                        {item.trend}
                    </TrendBadge>
                )}
              </div>
              <IconContainer>
                <FontAwesomeIcon icon={getIcon(item.icon)} />
              </IconContainer>
            </Card.Body>
          </StyledCard>
        </Col>
      ))}
    </Row>
  );
};

export default SummaryCards;
