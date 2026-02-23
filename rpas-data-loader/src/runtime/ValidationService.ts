import { Config, ValidationResult } from '../config';

export class ValidationService {
  static validateRPASInputs(
    projectName: string,
    projection: string,
    acquisitionDate: Date | null,
    surveyTime: string,
    selectedFile: File | null,
    config: Config
  ): ValidationResult {
    // Validate Survey File (required)
    if (!selectedFile) {
      return { isValid: false, error: 'Survey File is required. Please select a file.', field: 'selectedFile' };
    }

    // Validate Project Name (required)
    if (!projectName || projectName.trim().length === 0) {
      return { isValid: false, error: 'Project Name is required. Please enter a project name.', field: 'projectName' };
    }

    // Validate Projection (required)
    if (!projection || projection.trim().length === 0) {
      return { isValid: false, error: 'Projection is required. Please select a projection.', field: 'projection' };
    }

    // Validate Acquisition Date (required)
    if (!acquisitionDate) {
      return { isValid: false, error: 'Acquisition Date is required. Please select a date.', field: 'acquisitionDate' };
    }

    // Validate Survey Time (required)
    if (!surveyTime || surveyTime.trim().length === 0) {
      return { isValid: false, error: 'Survey Time is required. Please enter a time.', field: 'surveyTime' };
    }

    // Validate file extension
    const fileName = selectedFile.name.toLowerCase();
    const allowedExtensions = config?.allowedExtensions || ['.las', '.laz', '.xyz', '.txt'];
    const hasValidExtension = allowedExtensions.some(ext =>
      fileName.endsWith(ext.toLowerCase())
    );

    if (!hasValidExtension) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed extensions: ${allowedExtensions.join(', ')}`
      };
    }

    // Validate file size
    const maxFileSizeMB = config?.maxFileSizeMB || 500;
    const fileSizeMB = selectedFile.size / 1024 / 1024;

    if (fileSizeMB > maxFileSizeMB) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${maxFileSizeMB} MB`
      };
    }

    return { isValid: true, error: '' };
  }

  static validateTLSInputs(
    projectName: string,
    projection: string,
    acquisitionDate: Date | null,
    surveyTime: string,
    selectedFile: File | null,
    config: Config
  ): ValidationResult {
    // TLS validation is identical to RPAS validation
    return this.validateRPASInputs(
      projectName,
      projection,
      acquisitionDate,
      surveyTime,
      selectedFile,
      config
    );
  }

  static validateSmallProjectImageryInputs(
    selectedFile: File | null,
    projectName: string,
    projection: string,
    acquisitionDate: Date | null,
    surveyTime: string,
    config: Config
  ): ValidationResult {
    // Validate Survey File (required)
    if (!selectedFile) {
      return { isValid: false, error: 'Survey File is required. Please select a file.', field: 'selectedFile' };
    }

    // Validate file extension
    // For Small Project Imagery, include both point cloud and imagery formats
    const baseExtensions = config?.allowedExtensions || ['.las', '.laz', '.xyz', '.txt'];
    const imageryExtensions = ['.tif', '.tiff', '.jpg', '.jpeg', '.png'];
    const allowedExtensions = [...new Set([...baseExtensions, ...imageryExtensions])]; // Merge and deduplicate

    const fileName = selectedFile.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext =>
      fileName.endsWith(ext.toLowerCase())
    );

    if (!hasValidExtension) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed extensions: ${allowedExtensions.join(', ')}`,
        field: 'selectedFile'
      };
    }

    // Validate file size
    const maxFileSizeMB = config?.maxFileSizeMB || 500;
    const fileSizeMB = selectedFile.size / 1024 / 1024;

    if (fileSizeMB > maxFileSizeMB) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${maxFileSizeMB} MB`,
        field: 'selectedFile'
      };
    }

    // Validate Project Name (required)
    if (!projectName || projectName.trim().length === 0) {
      return { isValid: false, error: 'Project Name is required. Please enter a project name.', field: 'projectName' };
    }

    // Validate Projection (required)
    if (!projection || projection.trim().length === 0) {
      return { isValid: false, error: 'Projection is required. Please select a projection.', field: 'projection' };
    }

    // Validate Acquisition Date (required)
    if (!acquisitionDate) {
      return { isValid: false, error: 'Acquisition Date is required. Please select a date.', field: 'acquisitionDate' };
    }

    // Validate Survey Time (required)
    if (!surveyTime || surveyTime.trim().length === 0) {
      return { isValid: false, error: 'Survey Time is required. Please enter a time.', field: 'surveyTime' };
    }

    return { isValid: true, error: '' };
  }

  static validateProjectName(projectName: string): boolean {
    // Project name should be alphanumeric with hyphens/underscores
    const regex = /^[a-zA-Z0-9_-]+$/;
    return regex.test(projectName);
  }

  static validateTime(time: string): boolean {
    // HH:MM format validation
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  }
}
