export class JenkinsError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = 'JenkinsError'
  }
}

export interface ComplianceTriggerParams {
  mineSites: string
  complianceTypes: string
  username: string
  timestamp: string
}

/**
 * Calls Jenkins buildWithParameters via HTTP POST (form-encoded).
 * Jenkins returns 201 Created on success.
 *
 * SECURITY: For production, point jenkinsBaseUrl at a server-side proxy
 * that injects credentials rather than storing the API token in the widget.
 */
export async function triggerJenkins(
  baseUrl: string,
  jobName: string,
  params: ComplianceTriggerParams,
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

  // Jenkins uses 201 Created on success; response.ok covers 200–299.
  if (!response.ok) {
    throw new JenkinsError(
      `Jenkins responded with ${response.status}: ${response.statusText}`,
      response.status
    )
  }
}
