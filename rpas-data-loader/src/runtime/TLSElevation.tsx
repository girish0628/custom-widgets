/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Button, Label, TextInput, Select, Option, Alert } from 'jimu-ui';
import { DatePicker } from 'jimu-ui/basic/date-picker';
import { Config, resolveGPTaskUrl, getProjectionOptions } from '../config';
import FileUploader from './FileUploader';
import { ValidationService } from './ValidationService';
import { ArcGISFileUploadService } from './ArcGISFileUploadService';
import * as geoprocessor from 'esri/rest/geoprocessor';
import { getAppStore } from 'jimu-core';

interface Props {
  config: Config;
}

interface State {
  projectName: string;
  projection: string;
  acquisitionDate: Date | null;
  surveyTime: string;
  selectedFile: File | null;
  isProcessing: boolean;
  alertMessage: string;
  alertType: 'success' | 'error' | 'info' | 'warning';
  showAlert: boolean;
  userEmail: string;
}

export default class TLSElevation extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.state = {
      projectName: '',
      projection: 'GDA94 Lat Long',
      acquisitionDate: now,
      surveyTime: currentTime,
      selectedFile: null,
      isProcessing: false,
      alertMessage: '',
      alertType: 'info',
      showAlert: false,
      userEmail: ''
    };
  }

  componentDidMount() {
    const userState = getAppStore().getState();
    const email =
      userState?.user?.username ||
      userState?.portalSelf?.user?.username ||
      'guest';
    this.setState({ userEmail: email });
  }

  showAlert = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    this.setState({ alertMessage: message, alertType: type, showAlert: true });
  };

  hideAlert = () => this.setState({ showAlert: false });

  handleUpload = async () => {
    const { config } = this.props;
    const { projectName, projection, acquisitionDate, surveyTime, selectedFile, userEmail } = this.state;

    const validation = ValidationService.validateTLSInputs(
      projectName, projection, acquisitionDate, surveyTime, selectedFile, config
    );
    if (!validation.isValid) { this.showAlert(validation.error, 'error'); return; }

    // TLS shares the same GP service as RPAS Data Loader
    const rpasUtilities = config?.rpasGPUtility as any;
    const taskUrl = resolveGPTaskUrl(rpasUtilities?.[0]);
    if (!taskUrl) {
      this.showAlert('RPAS Data Loader GP service not configured. Please select a GP service in widget settings.', 'error');
      return;
    }

    this.setState({ isProcessing: true });
    this.showAlert('Uploading file to GP Service...', 'info');

    try {
      const itemID = await ArcGISFileUploadService.uploadFileToGPService(taskUrl, selectedFile);
      this.showAlert(`File uploaded (ID: ${itemID}). Submitting job...`, 'info');

      const params = {
        Survey_File: itemID,
        Project_Name: projectName,
        Projection: projection,
        Survey_Type: 'TLS',
        Acquisition_Date: acquisitionDate?.toISOString().split('T')[0],
        Survey_Time: surveyTime,
        Logged_User_Email: userEmail || ''
      };

      const jobInfo = await geoprocessor.submitJob(taskUrl, params);
      this.showAlert(`Job submitted: ${jobInfo.jobId}. Waiting for completion...`, 'info');

      const result = await jobInfo.waitForJobCompletion();
      if (result.jobStatus === 'job-succeeded') {
        this.showAlert('TLS data uploaded and processed successfully!', 'success');
        this.setState({ projectName: '', acquisitionDate: null, surveyTime: '', selectedFile: null });
      } else {
        this.showAlert(`GP Job failed: ${result.jobStatus}`, 'error');
      }
    } catch (error) {
      this.showAlert(`Error: ${error.message || 'Unknown error occurred'}`, 'error');
    } finally {
      this.setState({ isProcessing: false });
    }
  };

  render() {
    const { config } = this.props;
    const { projectName, projection, acquisitionDate, surveyTime, selectedFile, isProcessing, alertMessage, alertType, showAlert } = this.state;
    const allowedExtensions = config?.allowedExtensions || ['.las', '.laz', '.xyz', '.txt'];
    const maxFileSizeMB = config?.maxFileSizeMB || 500;
    const projectionOptions = getProjectionOptions(config);

    return (
      <div className="tab-content">
        {showAlert && (
          <Alert type={alertType} withIcon text={alertMessage} onClose={this.hideAlert} className="mb-3" />
        )}

        <div className="form-group">
          <Label><strong>Survey File<span className="required-indicator">*</span></strong></Label>
          <FileUploader allowedExtensions={allowedExtensions} maxFileSizeMB={maxFileSizeMB} onFileSelect={file => this.setState({ selectedFile: file })} disabled={isProcessing} />
          {selectedFile && <div className="file-info">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</div>}
        </div>

        <div className="form-group">
          <Label><strong>Project Name<span className="required-indicator">*</span></strong></Label>
          <TextInput className="w-100" placeholder="Enter project name" value={projectName} onChange={evt => this.setState({ projectName: evt.currentTarget.value })} disabled={isProcessing} required />
        </div>

        <div className="form-group">
          <Label><strong>Projection<span className="required-indicator">*</span></strong></Label>
          <Select className="w-100" value={projection} onChange={evt => this.setState({ projection: evt.currentTarget.value })} disabled={isProcessing} required>
            {projectionOptions.map(proj => <Option key={proj.value} value={proj.value}>{proj.label}</Option>)}
          </Select>
        </div>

        <div className="form-group">
          <Label><strong>Acquisition Date<span className="required-indicator">*</span></strong></Label>
          <DatePicker style={{ width: '100%' }} selectedDate={acquisitionDate} onChange={date => this.setState({ acquisitionDate: date })} disabled={isProcessing} format="shortDate" runtime={false} />
        </div>

        <div className="form-group">
          <Label><strong>Survey Time<span className="required-indicator">*</span></strong></Label>
          <TextInput type="time" className="w-100" value={surveyTime} onChange={evt => this.setState({ surveyTime: evt.currentTarget.value })} disabled={isProcessing} required />
        </div>

        <div className="form-group">
          <Button type="primary" size="lg" className="w-100" onClick={this.handleUpload} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Upload'}
          </Button>
        </div>
      </div>
    );
  }
}
