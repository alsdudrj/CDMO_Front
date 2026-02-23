import styled from "styled-components";
import { Card } from "react-bootstrap";

export const DashboardContainer = styled.div`
  padding: 1.5rem;
  background-color: #f8f9fc;
  min-height: 100vh;
`;

export const SectionTitle = styled.h6`
  font-weight: 700;
  color: #4e73df;
  margin-bottom: 0;
`;

export const MetricCard = styled(Card)`
  border-left: 0.25rem solid;
  border-left-color: ${(props) => props.color || "#4e73df"};
  margin-bottom: 1.5rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
  border-radius: 0.35rem;

  .card-body {
    padding: 1.25rem;
  }

  .text-xs {
    font-size: 0.7rem;
  }

  .font-weight-bold {
    font-weight: 700 !important;
  }

  .h5 {
    font-size: 1.25rem;
  }
`;

export const DashboardCard = styled(Card)`
  margin-bottom: 1.5rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
  border: none;
  border-radius: 0.35rem;

  .card-header {
    background-color: #f8f9fc;
    border-bottom: 1px solid #e3e6f0;
    padding: 0.75rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-body {
    padding: 1.25rem;
  }
`;

export const StatusCard = styled.div<{ bg: string }>`
  background-color: ${(props) => props.bg};
  color: white;
  padding: 1.25rem;
  border-radius: 0.35rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
  margin-bottom: 1.5rem;
  height: 100%;

  h6 {
    font-size: 0.8rem;
    opacity: 0.8;
    margin-bottom: 0.5rem;
  }

  .value {
    font-size: 1.25rem;
    font-weight: 700;
  }
`;

export const AlertBox = styled.div`
  background-color: #fff;
  border-radius: 0.35rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
  position: relative;
  overflow: hidden;

  h6 {
    color: #4e73df;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1rem;
    color: #5a5c69;
  }

  a {
    font-weight: 700;
    text-decoration: none;
    color: #4e73df;
    &:hover {
      text-decoration: underline;
    }
  }

  &::after {
     /* content: ""; */
     /* Placeholder for decorative circle if needed */
  }
`;

export const ChartWrapper = styled.div`
  position: relative;
  height: 250px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const DonutLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;

  .value {
    font-size: 1.5rem;
    font-weight: 800;
    color: #5a5c69;
    line-height: 1;
  }

  .label {
    font-size: 0.8rem;
    color: #858796;
    text-transform: uppercase;
  }
`;

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;

  .title {
    font-weight: 700;
    color: #5a5c69;
  }

  .subtitle {
    font-size: 0.8rem;
    color: #858796;
  }

  .meta {
    text-align: right;
    font-size: 0.8rem;
    color: #858796;

    .percentage {
        font-weight: 700;
        color: #4e73df;
    }
  }
`;

export const Badge = styled.span<{ bg: string }>`
    background-color: ${(props) => props.bg};
    color: white;
    padding: 0.25em 0.6em;
    font-size: 75%;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.35rem;
`;
