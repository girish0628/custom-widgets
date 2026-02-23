/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Button } from 'jimu-ui';

interface Props {
  allowedExtensions: string[];
  maxFileSizeMB: number;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

interface State {
  error: string;
}

export default class FileUploader extends React.PureComponent<Props, State> {
  private fileInputRef: React.RefObject<HTMLInputElement>;

  constructor(props) {
    super(props);
    this.state = {
      error: ''
    };
    this.fileInputRef = React.createRef();
  }

  handleButtonClick = () => {
    if (this.fileInputRef.current && !this.props.disabled) {
      this.fileInputRef.current.click();
    }
  };

  handleFileChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];

    if (!file) {
      return;
    }

    this.setState({ error: '' });

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = this.props.allowedExtensions.some(ext =>
      fileName.endsWith(ext.toLowerCase())
    );

    if (!hasValidExtension) {
      this.setState({
        error: `Invalid file type. Allowed: ${this.props.allowedExtensions.join(', ')}`
      });
      return;
    }

    // Check file size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > this.props.maxFileSizeMB) {
      this.setState({
        error: `File too large. Maximum size: ${this.props.maxFileSizeMB} MB`
      });
      return;
    }

    this.props.onFileSelect(file);
  };

  render() {
    const { disabled } = this.props;
    const { error } = this.state;

    return (
      <div className="file-uploader">
        <input
          ref={this.fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={this.handleFileChange}
          disabled={disabled}
          accept={this.props.allowedExtensions.join(',')}
        />
        <Button
          type="secondary"
          onClick={this.handleButtonClick}
          disabled={disabled}
          className="w-100"
        >
          Choose File
        </Button>
        {error && <div className="file-error">{error}</div>}
      </div>
    );
  }
}
