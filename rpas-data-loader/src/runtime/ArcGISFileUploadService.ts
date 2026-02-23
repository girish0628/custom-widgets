import esriRequest from 'esri/request';

/**
 * Service for uploading files to ArcGIS Geoprocessing services
 *
 * According to ArcGIS documentation, file upload to GP services requires:
 * 1. Upload file to GP service's upload endpoint
 * 2. Receive itemID from upload response
 * 3. Pass itemID to submitJob
 */
export class ArcGISFileUploadService {
  /**
   * Upload a file to ArcGIS GP service upload endpoint
   * @param gpServiceUrl - The GP service URL (e.g., https://server/arcgis/rest/services/MyService/GPServer/MyTask)
   * @param file - The file to upload
   * @returns Promise resolving to the uploaded file's itemID
   */
  static async uploadFileToGPService(gpServiceUrl: string, file: File): Promise<string> {
    if (!gpServiceUrl || gpServiceUrl.trim().length === 0) {
      throw new Error('GP Service URL is required');
    }

    if (!file) {
      throw new Error('File is required for upload');
    }

    try {
      // Extract base URL and construct upload endpoint
      // GP service URL format: https://server/arcgis/rest/services/folder/ServiceName/GPServer/TaskName
      // Upload endpoint: https://server/arcgis/rest/services/folder/ServiceName/GPServer/uploads/upload
      const uploadUrl = this.constructUploadUrl(gpServiceUrl);

      console.log('Uploading file to ArcGIS GP service:', {
        fileName: file.name,
        fileSize: file.size,
        uploadUrl: uploadUrl
      });

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('f', 'json');

      // Use esri/request to upload the file
      const response = await esriRequest(uploadUrl, {
        method: 'post',
        body: formData,
        responseType: 'json'
      });

      // Parse response to get itemID
      if (response.data && response.data.item) {
        const itemID = response.data.item.itemID;
        console.log('File uploaded successfully. ItemID:', itemID);
        return itemID;
      } else {
        throw new Error('Upload response does not contain itemID');
      }
    } catch (error) {
      console.error('Error uploading file to GP service:', error);
      throw new Error(`File upload failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Construct the upload URL from GP service URL
   * @param gpServiceUrl - The GP service URL
   * @returns Upload endpoint URL
   */
  private static constructUploadUrl(gpServiceUrl: string): string {
    // Remove task name from URL and add /uploads/upload
    // Example: https://server/arcgis/rest/services/MyFolder/MyService/GPServer/MyTask
    // becomes: https://server/arcgis/rest/services/MyFolder/MyService/GPServer/uploads/upload

    const url = gpServiceUrl.trim();

    // Find the GPServer part
    const gpServerIndex = url.indexOf('/GPServer');
    if (gpServerIndex === -1) {
      throw new Error('Invalid GP Service URL format. Must contain /GPServer');
    }

    // Get base URL up to and including GPServer
    const baseUrl = url.substring(0, gpServerIndex + '/GPServer'.length);

    // Construct upload endpoint
    return `${baseUrl}/uploads/upload`;
  }

  /**
   * Create a DataFile parameter for GP service
   * @param itemID - The uploaded file's itemID
   * @returns DataFile parameter - just the itemID string
   */
  static createDataFileParameter(itemID: string): string {
    // Return just the itemID string - this is what most GP services expect
    return itemID;
  }
}
