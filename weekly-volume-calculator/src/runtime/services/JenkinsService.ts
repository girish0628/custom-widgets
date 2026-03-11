/**
 * Typed error thrown when Jenkins returns a non-success HTTP status.
 */
export class JenkinsError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = 'JenkinsError'
  }
}

/**
 * Parameters forwarded to Jenkins buildWithParameters for the weekly volume job.
 */
export interface VolumeCalcParams {
  mineSite: string
  /** Comma-separated location names. */
  locations: string
  /** YYYY-MM-DD */
  acquisitionDate: string
  /** HH:mm */
  captureFrom: string
  /** HH:mm */
  captureTo: string
  username: string
  timestamp: string
}

/**
 * Calls a Jenkins buildWithParameters endpoint via HTTP POST (form-encoded).
 * Jenkins returns 201 Created on success; response.ok covers 200–299.
 *
 * SECURITY: For production, point jenkinsBaseUrl at a server-side proxy
 * that injects credentials rather than storing the API token in the widget config.
 *
 * @param baseUrl  Jenkins base URL, e.g. https://jenkins.company.com
 * @param jobName  Jenkins job name, e.g. weekly-volume
 * @param params   Parameters forwarded as form fields
 * @param apiToken Optional Bearer token (prefer a server-side proxy instead)
 */
export async function triggerJenkins(
  baseUrl: string,
  jobName: string,
  params: VolumeCalcParams,
  apiToken?: string
): Promise<void> {
  if (!baseUrl?.trim()) {
    throw new JenkinsError('Jenkins Base URL is not configured.', 0)
  }
  if (!jobName?.trim()) {
    throw new JenkinsError('Jenkins Job Name is not configured.', 0)
  }

  const url = `${baseUrl.trim().replace(/\/$/, '')}/job/${jobName.trim()}/buildWithParameters`

  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    body.append(key, value)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  if (apiToken?.trim()) {
    headers['Authorization'] = `Bearer ${apiToken.trim()}`
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: body.toString()
  })

  if (!response.ok) {
    throw new JenkinsError(
      `Jenkins responded with ${response.status}: ${response.statusText}`,
      response.status
    )
  }
}
