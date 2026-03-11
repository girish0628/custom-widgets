import { css } from 'jimu-core'

export const getStyle = () => css`
  .analysis-widget {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--light-100);
  }

  .analysis-scroll {
    overflow: auto;
    padding: 12px;
    height: 100%;
  }

  .analysis-section {
    background: white;
    border: 1px solid var(--light-300);
    border-radius: 10px;
    margin-bottom: 12px;
    padding: 12px;
  }

  .analysis-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .analysis-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }

  .analysis-inline {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .analysis-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .analysis-kpi {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .analysis-pill {
    padding: 8px 10px;
    border: 1px solid var(--light-300);
    border-radius: 8px;
    background: var(--light-50);
    font-size: 12px;
  }

  .analysis-message {
    padding: 10px;
    border-radius: 8px;
    font-size: 12px;
    line-height: 1.4;
  }

  .analysis-message.info {
    background: #eef6ff;
    border: 1px solid #bdd8ff;
  }

  .analysis-message.success {
    background: #edf9f1;
    border: 1px solid #b8e7c7;
  }

  .analysis-message.warning {
    background: #fff7e8;
    border: 1px solid #f8d58c;
  }

  .analysis-message.error {
    background: #fff0f0;
    border: 1px solid #efb4b4;
  }

  .analysis-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 24px;
    color: var(--dark-400);
  }
`