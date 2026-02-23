/** @jsx jsx */
import { React, jsx, AllWidgetProps, css } from 'jimu-core';
import { useTheme2 } from 'jimu-theme';
import { Select, Option, Label } from 'jimu-ui';
import { Config, StyleConfig, DEFAULT_STYLE_CONFIG } from '../config';
import RPASElevation from './RPASElevation';
import TLSElevation from './TLSElevation';
import SmallProjectImagery from './SmallProjectImagery';
import './styles.css';

const Widget = (props: AllWidgetProps<Config>) => {
  const { config, style } = props;
  const theme = useTheme2();
  const [selectedType, setSelectedType] = React.useState<string>('rpas');

  const styleConfig: StyleConfig = config?.style || {};
  const palette = theme?.colors?.palette;

  const padding = styleConfig.padding ?? DEFAULT_STYLE_CONFIG.padding;
  const formGroupSpacing = styleConfig.formGroupSpacing ?? DEFAULT_STYLE_CONFIG.formGroupSpacing;
  const labelFontSize = styleConfig.labelFontSize ?? DEFAULT_STYLE_CONFIG.labelFontSize;
  const inputFontSize = styleConfig.inputFontSize ?? DEFAULT_STYLE_CONFIG.inputFontSize;
  const borderRadius = styleConfig.borderRadius ?? DEFAULT_STYLE_CONFIG.borderRadius;
  const inputBorderWidth = styleConfig.inputBorderWidth ?? DEFAULT_STYLE_CONFIG.inputBorderWidth;

  const backgroundColor =
    styleConfig.backgroundColor ??
    palette?.neutral?.[50] ??
    palette?.light?.[100] ??
    DEFAULT_STYLE_CONFIG.backgroundColor;
  const borderColor =
    styleConfig.borderColor ??
    palette?.neutral?.[300] ??
    palette?.light?.[300] ??
    DEFAULT_STYLE_CONFIG.borderColor;
  const primaryColor =
    styleConfig.primaryColor ?? palette?.primary?.[600] ?? DEFAULT_STYLE_CONFIG.primaryColor;
  const errorColor =
    styleConfig.errorColor ?? palette?.danger?.[600] ?? DEFAULT_STYLE_CONFIG.errorColor;
  const warningColor =
    styleConfig.warningColor ?? palette?.warning?.[600] ?? DEFAULT_STYLE_CONFIG.warningColor;
  const infoColor = styleConfig.infoColor ?? palette?.info?.[600] ?? DEFAULT_STYLE_CONFIG.infoColor;
  const successColor =
    styleConfig.successColor ?? palette?.success?.[600] ?? DEFAULT_STYLE_CONFIG.successColor;

  const themedStyle = React.useMemo(
    () =>
      css`
        padding: ${padding}px;
        background: ${backgroundColor};
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        overflow-y: auto;

        .widget-content {
          margin-top: 10px;
        }

        .notes-section {
          background: ${palette?.neutral?.[100] ?? backgroundColor};
          border: 1px solid ${borderColor};
          border-radius: ${borderRadius}px;
          color: ${palette?.neutral?.[800] ?? palette?.dark?.[700] ?? 'inherit'};
          box-sizing: border-box;
        }

        .notes-section h4 {
          color: ${palette?.neutral?.[900] ?? palette?.dark?.[800] ?? 'inherit'};
        }

        .notes-section p,
        .notes-section strong {
          color: ${palette?.neutral?.[800] ?? palette?.dark?.[700] ?? 'inherit'};
        }

        .form-group {
          margin-bottom: ${formGroupSpacing}px;
        }

        .form-group label {
          font-size: ${labelFontSize}rem;
          color: ${palette?.neutral?.[800] ?? palette?.dark?.[700] ?? 'inherit'};
        }

        input[type='text'],
        input[type='time'],
        select {
          font-size: ${inputFontSize}rem;
          border-color: ${borderColor};
          border-width: ${inputBorderWidth}px;
          border-radius: ${borderRadius}px;
        }

        .form-group.has-error input,
        .form-group.has-error select {
          border-color: ${errorColor};
        }

        .form-group.has-error .validation-error {
          color: ${errorColor};
        }

        .file-info {
          background: ${palette?.neutral?.[100] ?? backgroundColor};
          color: ${palette?.neutral?.[800] ?? palette?.dark?.[700] ?? 'inherit'};
        }

        .file-error {
          background: ${palette?.warning?.[50] ?? backgroundColor};
          border: 1px solid ${warningColor};
          color: ${palette?.warning?.[800] ?? warningColor};
        }

        .required-indicator {
          color: ${errorColor};
        }

        button[type='primary'] {
          background-color: ${primaryColor};
          border-color: ${primaryColor};
          border-radius: ${borderRadius}px;
        }

        button[type='secondary'] {
          background-color: ${backgroundColor};
          border: 1px solid ${borderColor};
          color: ${palette?.neutral?.[800] ?? palette?.dark?.[700] ?? 'inherit'};
          border-radius: ${borderRadius}px;
        }

        .file-uploader,
        .notes-section,
        .form-group,
        .file-info,
        .file-error {
          width: 100%;
        }

        .success-text {
          color: ${successColor};
        }

        .info-text {
          color: ${infoColor};
        }

        .warning-text {
          color: ${warningColor};
        }

        .error-text {
          color: ${errorColor};
        }
      `,
    [
      backgroundColor,
      borderColor,
      borderRadius,
      errorColor,
      formGroupSpacing,
      infoColor,
      inputBorderWidth,
      inputFontSize,
      labelFontSize,
      palette,
      padding,
      primaryColor,
      successColor,
      warningColor
    ]
  );

  return (
    <div className="widget-rpas-data-loader jimu-widget" css={[themedStyle, style]}>
      <div className="widget-content">
        <div className="form-group">
          <Label>
            <strong>Survey Type</strong>
          </Label>
          <Select
            className="w-100"
            value={selectedType}
            onChange={(evt: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedType(evt.currentTarget.value)
            }
          >
            <Option value="rpas">RPAS Elevation</Option>
            <Option value="tls">TLS Elevation</Option>
            <Option value="smallproject">Small Project Imagery</Option>
          </Select>
        </div>

        {selectedType === 'rpas' && <RPASElevation config={config} />}
        {selectedType === 'tls' && <TLSElevation config={config} />}
        {selectedType === 'smallproject' && <SmallProjectImagery config={config} />}
      </div>
    </div>
  );
};

export default Widget;
