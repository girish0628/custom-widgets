/** @jsx jsx */
import { jsx } from 'jimu-core';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploader from '../runtime/FileUploader';

describe('FileUploader', () => {
  const defaultProps = {
    allowedExtensions: ['.las', '.laz', '.xyz', '.txt'],
    maxFileSizeMB: 500,
    onFileSelect: jest.fn(),
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render file upload button', () => {
    render(<FileUploader {...defaultProps} />);
    const button = screen.getByRole('button', { name: /choose file/i });
    expect(button).toBeInTheDocument();
  });

  it('should have hidden file input', () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveStyle({ display: 'none' });
  });

  it('should trigger file input click when button is clicked', () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const button = screen.getByRole('button', { name: /choose file/i });

    const clickSpy = jest.spyOn(fileInput, 'click');
    fireEvent.click(button);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should call onFileSelect with valid file', async () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test content'], 'test.las', { type: 'text/plain' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(defaultProps.onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it('should accept .las files', async () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'survey.las', { type: 'application/octet-stream' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(defaultProps.onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it('should accept .laz files', async () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'survey.laz', { type: 'application/octet-stream' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(defaultProps.onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it('should accept .xyz files', async () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'survey.xyz', { type: 'text/plain' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(defaultProps.onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it('should accept .txt files', async () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'survey.txt', { type: 'text/plain' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(defaultProps.onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it('should show error for invalid file extension', async () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
      expect(screen.getByText(/\.las, \.laz, \.xyz, \.txt/i)).toBeInTheDocument();
    });

    expect(defaultProps.onFileSelect).not.toHaveBeenCalled();
  });

  it('should handle case-insensitive file extensions', async () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'SURVEY.LAS', { type: 'application/octet-stream' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(defaultProps.onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it('should show error for file exceeding max size', async () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    // Create a file and mock its size
    const largeFile = new File(['test'], 'large.las', {
      type: 'application/octet-stream'
    });

    Object.defineProperty(largeFile, 'size', {
      value: 600 * 1024 * 1024,
      writable: false
    });

    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/File too large/i)).toBeInTheDocument();
      expect(screen.getByText(/500 MB/i)).toBeInTheDocument();
    });

    expect(defaultProps.onFileSelect).not.toHaveBeenCalled();
  });

  it('should not call onFileSelect when no file is selected', () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [],
      writable: false
    });

    fireEvent.change(fileInput);

    expect(defaultProps.onFileSelect).not.toHaveBeenCalled();
  });

  it('should clear previous error when valid file is selected', async () => {
    const { container, unmount } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    // First, select invalid file
    const invalidFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });

    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    });

    // Unmount and remount to get a fresh component
    unmount();

    const { container: newContainer } = render(<FileUploader {...defaultProps} />);
    const newFileInput = newContainer.querySelector('input[type="file"]') as HTMLInputElement;

    // Now select valid file
    const validFile = new File(['test'], 'survey.las', { type: 'application/octet-stream' });

    Object.defineProperty(newFileInput, 'files', {
      value: [validFile],
      writable: false
    });

    fireEvent.change(newFileInput);

    await waitFor(() => {
      expect(screen.queryByText(/Invalid file type/i)).not.toBeInTheDocument();
    });
  });

  it('should disable button when disabled prop is true', () => {
    render(<FileUploader {...defaultProps} disabled={true} />);
    const button = screen.getByRole('button', { name: /choose file/i });
    expect(button).toBeDisabled();
  });

  it('should disable file input when disabled prop is true', () => {
    const { container } = render(<FileUploader {...defaultProps} disabled={true} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDisabled();
  });

  it('should not trigger file input click when button is clicked while disabled', () => {
    const { container } = render(<FileUploader {...defaultProps} disabled={true} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const button = screen.getByRole('button', { name: /choose file/i });

    const clickSpy = jest.spyOn(fileInput, 'click');
    fireEvent.click(button);

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should set accept attribute on file input', () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('accept', '.las,.laz,.xyz,.txt');
  });

  it('should use custom allowed extensions', async () => {
    const customProps = {
      ...defaultProps,
      allowedExtensions: ['.csv', '.json']
    };

    const { container } = render(<FileUploader {...customProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    expect(fileInput).toHaveAttribute('accept', '.csv,.json');

    const csvFile = new File(['test'], 'data.csv', { type: 'text/csv' });

    Object.defineProperty(fileInput, 'files', {
      value: [csvFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(customProps.onFileSelect).toHaveBeenCalledWith(csvFile);
    });
  });

  it('should use custom max file size', async () => {
    const customProps = {
      ...defaultProps,
      maxFileSizeMB: 100
    };

    const { container } = render(<FileUploader {...customProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const largeFile = new File(['test'], 'large.las', {
      type: 'application/octet-stream'
    });

    Object.defineProperty(largeFile, 'size', {
      value: 150 * 1024 * 1024,
      writable: false
    });

    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/File too large/i)).toBeInTheDocument();
      expect(screen.getByText(/100 MB/i)).toBeInTheDocument();
    });

    expect(customProps.onFileSelect).not.toHaveBeenCalled();
  });

  it('should have file-uploader class', () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const wrapper = container.querySelector('.file-uploader');
    expect(wrapper).toBeInTheDocument();
  });

  it('should display error with file-error class', async () => {
    const { container } = render(<FileUploader {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const invalidFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });

    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      const errorDiv = container.querySelector('.file-error');
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv).toHaveTextContent(/Invalid file type/i);
    });
  });
});
