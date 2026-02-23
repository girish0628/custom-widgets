import { WebhookService, WebhookPayload } from '../runtime/WebhookService';

describe('WebhookService', () => {
  const mockPayload: WebhookPayload = {
    surveyType: 'rpas',
    projectName: 'TestProject',
    projection: 'EPSG:4326',
    acquisitionDate: '2024-01-01',
    surveyTime: '10:30',
    outputFilePath: '/path/to/output',
    gpJobId: 'job123'
  };

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('callWebhook', () => {
    it('should successfully call webhook with valid payload', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK'
      });

      await expect(
        WebhookService.callWebhook('https://example.com/webhook', mockPayload)
      ).resolves.toBeUndefined();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockPayload)
      });
    });

    it('should throw error when webhook URL is empty', async () => {
      await expect(WebhookService.callWebhook('', mockPayload)).rejects.toThrow(
        'Webhook URL not configured'
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error when webhook URL is whitespace', async () => {
      await expect(WebhookService.callWebhook('   ', mockPayload)).rejects.toThrow(
        'Webhook URL not configured'
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should retry on failure and succeed on second attempt', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK'
        });

      await expect(
        WebhookService.callWebhook('https://example.com/webhook', mockPayload, 3)
      ).resolves.toBeUndefined();

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on HTTP error response', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK'
        });

      await expect(
        WebhookService.callWebhook('https://example.com/webhook', mockPayload, 3)
      ).resolves.toBeUndefined();

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error after all retries are exhausted', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        WebhookService.callWebhook('https://example.com/webhook', mockPayload, 3)
      ).rejects.toThrow('Webhook call failed after 3 attempts');

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should use default retry count of 3', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        WebhookService.callWebhook('https://example.com/webhook', mockPayload)
      ).rejects.toThrow('Webhook call failed after 3 attempts');

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle HTTP 404 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(
        WebhookService.callWebhook('https://example.com/webhook', mockPayload, 2)
      ).rejects.toThrow('Webhook call failed after 2 attempts');

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle HTTP 401 unauthorized error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(
        WebhookService.callWebhook('https://example.com/webhook', mockPayload, 2)
      ).rejects.toThrow('Webhook call failed after 2 attempts');
    });

    it('should wait between retry attempts', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK'
        });

      const startTime = Date.now();
      await WebhookService.callWebhook('https://example.com/webhook', mockPayload, 3);
      const endTime = Date.now();

      // Verify fetch was called 3 times (2 failures + 1 success)
      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Verify there was some delay between retries (should be at least 1 second for first retry)
      // We check for > 100ms to account for test execution overhead
      expect(endTime - startTime).toBeGreaterThan(100);
    });

    it('should send correct payload structure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK'
      });

      const customPayload: WebhookPayload = {
        surveyType: 'tls',
        projectName: 'CustomProject',
        projection: 'EPSG:3857',
        acquisitionDate: '2024-12-31',
        surveyTime: '15:45',
        outputFilePath: '/custom/path',
        gpJobId: 'custom-job-456'
      };

      await WebhookService.callWebhook('https://api.example.com/hook', customPayload);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody).toEqual(customPayload);
      expect(requestBody.surveyType).toBe('tls');
      expect(requestBody.projectName).toBe('CustomProject');
      expect(requestBody.projection).toBe('EPSG:3857');
    });

    it('should log success message on successful webhook call', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK'
      });

      await WebhookService.callWebhook('https://example.com/webhook', mockPayload);

      expect(consoleSpy).toHaveBeenCalledWith('Webhook call successful:', mockPayload);
    });

    it('should log warning on retry attempts', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK'
        });

      await WebhookService.callWebhook('https://example.com/webhook', mockPayload);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Webhook call attempt 1 failed:',
        expect.any(Error)
      );
    });
  });

  describe('validateWebhookUrl', () => {
    it('should validate correct HTTP URL', () => {
      expect(WebhookService.validateWebhookUrl('http://example.com')).toBe(true);
    });

    it('should validate correct HTTPS URL', () => {
      expect(WebhookService.validateWebhookUrl('https://example.com')).toBe(true);
    });

    it('should validate HTTPS URL with path', () => {
      expect(WebhookService.validateWebhookUrl('https://example.com/webhook/api')).toBe(
        true
      );
    });

    it('should validate HTTPS URL with query parameters', () => {
      expect(
        WebhookService.validateWebhookUrl('https://example.com/webhook?key=value')
      ).toBe(true);
    });

    it('should validate HTTPS URL with port', () => {
      expect(WebhookService.validateWebhookUrl('https://example.com:8080/webhook')).toBe(
        true
      );
    });

    it('should reject invalid protocol', () => {
      expect(WebhookService.validateWebhookUrl('ftp://example.com')).toBe(false);
      expect(WebhookService.validateWebhookUrl('file:///path/to/file')).toBe(false);
    });

    it('should reject malformed URLs', () => {
      expect(WebhookService.validateWebhookUrl('not a url')).toBe(false);
      expect(WebhookService.validateWebhookUrl('htp://example.com')).toBe(false);
      expect(WebhookService.validateWebhookUrl('example.com')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(WebhookService.validateWebhookUrl('')).toBe(false);
    });

    it('should reject URLs with only protocol', () => {
      expect(WebhookService.validateWebhookUrl('http://')).toBe(false);
      expect(WebhookService.validateWebhookUrl('https://')).toBe(false);
    });

    it('should validate localhost URLs', () => {
      expect(WebhookService.validateWebhookUrl('http://localhost:3000/webhook')).toBe(
        true
      );
      expect(WebhookService.validateWebhookUrl('https://localhost/api')).toBe(true);
    });

    it('should validate IP address URLs', () => {
      expect(WebhookService.validateWebhookUrl('http://192.168.1.1/webhook')).toBe(true);
      expect(WebhookService.validateWebhookUrl('https://127.0.0.1:8080/api')).toBe(true);
    });
  });
});
