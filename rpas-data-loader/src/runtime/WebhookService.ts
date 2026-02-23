import { WebhookPayload } from '../config';

export class WebhookService {
  static async callWebhook(
    webhookUrl: string,
    payload: WebhookPayload,
    retryCount: number = 3
  ): Promise<void> {
    if (!webhookUrl || webhookUrl.trim().length === 0) {
      throw new Error('Webhook URL not configured');
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Webhook call failed with status ${response.status}: ${response.statusText}`);
        }

        // Success - exit retry loop
        console.log('Webhook call successful:', payload);
        return;
      } catch (error) {
        lastError = error;
        console.warn(`Webhook call attempt ${attempt + 1} failed:`, error);

        // Wait before retrying (exponential backoff)
        if (attempt < retryCount - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries exhausted
    throw new Error(`Webhook call failed after ${retryCount} attempts: ${lastError?.message}`);
  }

  /**
   * Upload file to webhook using multipart/form-data
   * @param webhookUrl - The webhook URL to upload to
   * @param file - The file to upload
   * @param metadata - Additional metadata to include in the form data
   * @param retryCount - Number of retry attempts
   */
  static async uploadFileToWebhook(
    webhookUrl: string,
    file: File,
    metadata: Record<string, any>,
    retryCount: number = 3
  ): Promise<void> {
    if (!webhookUrl || webhookUrl.trim().length === 0) {
      throw new Error('Webhook URL not configured');
    }

    if (!file) {
      throw new Error('File is required for upload');
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('file', file);

        // Add metadata fields to form data
        Object.keys(metadata).forEach(key => {
          if (metadata[key] !== null && metadata[key] !== undefined) {
            formData.append(key, String(metadata[key]));
          }
        });

        const response = await fetch(webhookUrl, {
          method: 'POST',
          body: formData
          // Note: Do NOT set Content-Type header - browser will set it automatically with boundary
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `File upload failed with status ${response.status}: ${response.statusText}. ${errorText}`
          );
        }

        // Success - exit retry loop
        console.log('File upload to webhook successful:', {
          fileName: file.name,
          fileSize: file.size,
          metadata
        });
        return;
      } catch (error) {
        lastError = error;
        console.warn(`File upload attempt ${attempt + 1} failed:`, error);

        // Wait before retrying (exponential backoff)
        if (attempt < retryCount - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries exhausted
    throw new Error(`File upload failed after ${retryCount} attempts: ${lastError?.message}`);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static validateWebhookUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
