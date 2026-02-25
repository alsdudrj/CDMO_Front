import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Label, Tooltip } from 'recharts';
import type { IDeviationStat } from '../../types';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

const StyledCard = styled(Card)`
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  height: 100%;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: #6c757d;
`;

const ColorDot = styled.span<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 8px;
  display: inline-block;
`;

interface Props {
  data: IDeviationStat[];
}

const DeviationChart: React.FC<Props> = ({ data }) => {
  const totalOpen = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <StyledCard>
      <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">Deviation Status</h5>
        <div className="d-flex align-items-center gap-2">
            <span className="text-muted small" style={{fontSize: '0.7rem', fontWeight: 600}}>REAL-TIME</span>
             <Button variant="link" className="text-decoration-none text-muted p-0 ms-2">
                 <FontAwesomeIcon icon={faEllipsisV} />
            </Button>
        </div>
      </Card.Header>
      <Card.Body className="d-flex flex-column justify-content-center">
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <Label
                  value={totalOpen}
                  position="center"
                  dy={-10}
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    fill: '#333',
                  }}
                />
                <Label
                  value="OPEN"
                  position="center"
                  dy={15}
                  style={{
                    fontSize: '0.8rem',
                    fill: '#999',
                    fontWeight: 600
                  }}
                />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 px-2">
            {data.map((item, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <LegendItem>
                        <ColorDot color={item.color} />
                        {item.name}
                    </LegendItem>
                    <span className="fw-bold text-dark">{item.value}</span>
                </div>
            ))}
        </div>
      </Card.Body>
    </StyledCard>
  );
};

export default DeviationChart;
