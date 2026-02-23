import { ValidationService } from '../runtime/ValidationService';
import { Config } from '../config';

describe('ValidationService', () => {
  const mockConfig: Config = {
    allowedExtensions: ['.las', '.laz', '.xyz', '.txt'],
    maxFileSizeMB: 500,
    webhookUrl: 'https://example.com/webhook'
  };

  describe('validateRPASInputs', () => {
    const createMockFile = (name: string, size: number = 1024): File => {
      return new File([''], name, { type: 'text/plain' });
    };

    it('should return valid result when all inputs are correct', () => {
      const file = createMockFile('test.las');
      const result = ValidationService.validateRPASInputs(
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('should fail when file is missing', () => {
      const result = ValidationService.validateRPASInputs(
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        null,
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Survey File is required');
      expect(result.field).toBe('selectedFile');
    });

    it('should fail when project name is empty', () => {
      const file = createMockFile('test.las');
      const result = ValidationService.validateRPASInputs(
        '',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Project Name is required');
      expect(result.field).toBe('projectName');
    });

    it('should fail when project name is only whitespace', () => {
      const file = createMockFile('test.las');
      const result = ValidationService.validateRPASInputs(
        '   ',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Project Name is required');
      expect(result.field).toBe('projectName');
    });

    it('should fail when projection is empty', () => {
      const file = createMockFile('test.las');
      const result = ValidationService.validateRPASInputs(
        'Project1',
        '',
        new Date('2024-01-01'),
        '10:30',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Projection is required');
      expect(result.field).toBe('projection');
    });

    it('should fail when acquisition date is null', () => {
      const file = createMockFile('test.las');
      const result = ValidationService.validateRPASInputs(
        'Project1',
        'EPSG:4326',
        null,
        '10:30',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Acquisition Date is required');
      expect(result.field).toBe('acquisitionDate');
    });

    it('should fail when survey time is empty', () => {
      const file = createMockFile('test.las');
      const result = ValidationService.validateRPASInputs(
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Survey Time is required');
      expect(result.field).toBe('surveyTime');
    });

    it('should validate allowed file extensions - .las', () => {
      const file = createMockFile('test.las');
      const result = ValidationService.validateRPASInputs(
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(true);
    });

    it('should validate allowed file extensions - .laz', () => {
      const file = createMockFile('test.laz');
      const result = ValidationService.validateRPASInputs(
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(true);
    });

    it('should validate allowed file extensions - .xyz', () => {
      const file = createMockFile('test.xyz');
      const result = ValidationService.validateRPASInputs(
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(true);
    });

    it('should validate allowed file extensions - .txt', () => {
      const file = createMockFile('test.txt');
      const result = ValidationService.validateRPASInputs(
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(true);
    });

    it('should fail for invalid file extension', () => {
      const file = createMockFile('test.pdf');
      const result = ValidationService.validateRPASInputs(
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file type');
      expect(result.error).toContain('.las, .laz, .xyz, .txt');
    });

    it('should handle case-insensitive file extensions', () => {
      const file = createMockFile('test.LAS');
      const result = ValidationService.validateRPASInputs(
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(true);
    });

    it('should fail when file size exceeds maximum', () => {
      const largeFile = new File(['test'], 'large.las', {
        type: 'text/plain'
      });

      // Mock the file size to be larger than max
      Object.defineProperty(largeFile, 'size', {
        value: 600 * 1024 * 1024,
        writable: false
      });

      const result = ValidationService.validateRPASInputs(
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        largeFile,
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size exceeds maximum');
      expect(result.error).toContain('500 MB');
    });

    it('should use default config values when not provided', () => {
      const file = createMockFile('test.las');
      const minimalConfig: Config = {
        webhookUrl: 'https://example.com/webhook'
      };

      const result = ValidationService.validateRPASInputs(
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        file,
        minimalConfig
      );

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateTLSInputs', () => {
    it('should use same validation as RPAS', () => {
      const file = new File([''], 'test.las', { type: 'text/plain' });
      const result = ValidationService.validateTLSInputs(
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        file,
        mockConfig
      );

      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('should fail with same validation rules as RPAS', () => {
      const result = ValidationService.validateTLSInputs(
        '',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        null,
        mockConfig
      );

      expect(result.isValid).toBe(false);
    });
  });

  describe('validateSmallProjectImageryInputs', () => {
    it('should validate with valid filename and parameters', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'test.tif',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('should fail when filename is empty', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        '',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File Name is required');
    });

    it('should fail when filename is whitespace only', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        '   ',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File Name is required');
    });

    it('should accept valid .tif extension', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'imagery.tif',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(true);
    });

    it('should accept valid .tiff extension', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'imagery.tiff',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(true);
    });

    it('should accept valid .las extension', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'survey.las',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(true);
    });

    it('should accept valid .laz extension', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'survey.laz',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(true);
    });

    it('should handle case-insensitive extensions', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'imagery.TIF',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(true);
    });

    it('should fail for invalid file extension', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'document.pdf',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should fail when filename contains backslash (Windows path)', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'C:\\Users\\test\\imagery.tif',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('only the filename');
      expect(result.field).toBe('fileName');
    });

    it('should fail when filename contains forward slash (Unix path)', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        '/home/user/imagery.tif',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('only the filename');
      expect(result.field).toBe('fileName');
    });

    it('should fail when filename contains UNC path', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        '\\\\server\\share\\imagery.tif',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('only the filename');
    });

    it('should fail when project name is empty', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'imagery.tif',
        '',
        'EPSG:4326',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Project Name is required');
    });

    it('should fail when projection is empty', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'imagery.tif',
        'Project1',
        '',
        new Date('2024-01-01'),
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Projection is required');
    });

    it('should fail when acquisition date is null', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'imagery.tif',
        'Project1',
        'EPSG:4326',
        null,
        '10:30',
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Acquisition Date is required');
    });

    it('should fail when survey time is empty', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'imagery.tif',
        'Project1',
        'EPSG:4326',
        new Date('2024-01-01'),
        '',
        mockConfig
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Survey Time is required');
    });

    it('should validate complete valid input', () => {
      const result = ValidationService.validateSmallProjectImageryInputs(
        'WestMine_Imagery_2024.tif',
        'West Mine Survey',
        'EPSG:7850',
        new Date('2024-01-15'),
        '14:30',
        mockConfig
      );

      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });

  describe('validateProjectName', () => {
    it('should accept valid alphanumeric project names', () => {
      expect(ValidationService.validateProjectName('Project123')).toBe(true);
      expect(ValidationService.validateProjectName('MyProject')).toBe(true);
      expect(ValidationService.validateProjectName('project_test')).toBe(true);
      expect(ValidationService.validateProjectName('project-test')).toBe(true);
      expect(ValidationService.validateProjectName('PROJECT_2024')).toBe(true);
    });

    it('should reject project names with spaces', () => {
      expect(ValidationService.validateProjectName('Project 1')).toBe(false);
      expect(ValidationService.validateProjectName('My Project')).toBe(false);
    });

    it('should reject project names with special characters', () => {
      expect(ValidationService.validateProjectName('Project@123')).toBe(false);
      expect(ValidationService.validateProjectName('Project#1')).toBe(false);
      expect(ValidationService.validateProjectName('Project.1')).toBe(false);
      expect(ValidationService.validateProjectName('Project!1')).toBe(false);
    });

    it('should reject empty project names', () => {
      expect(ValidationService.validateProjectName('')).toBe(false);
    });
  });

  describe('validateTime', () => {
    it('should accept valid time formats', () => {
      expect(ValidationService.validateTime('00:00')).toBe(true);
      expect(ValidationService.validateTime('12:30')).toBe(true);
      expect(ValidationService.validateTime('23:59')).toBe(true);
      expect(ValidationService.validateTime('08:15')).toBe(true);
    });

    it('should reject invalid hour values', () => {
      expect(ValidationService.validateTime('24:00')).toBe(false);
      expect(ValidationService.validateTime('25:30')).toBe(false);
    });

    it('should reject invalid minute values', () => {
      expect(ValidationService.validateTime('12:60')).toBe(false);
      expect(ValidationService.validateTime('12:99')).toBe(false);
    });

    it('should reject invalid time formats', () => {
      expect(ValidationService.validateTime('12:3')).toBe(false);
      expect(ValidationService.validateTime('1:30')).toBe(false);
      expect(ValidationService.validateTime('12-30')).toBe(false);
      expect(ValidationService.validateTime('1230')).toBe(false);
      expect(ValidationService.validateTime('12:30:00')).toBe(false);
    });

    it('should reject empty time strings', () => {
      expect(ValidationService.validateTime('')).toBe(false);
    });
  });
});
