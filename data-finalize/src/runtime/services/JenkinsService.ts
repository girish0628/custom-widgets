/**
 * Parameters sent to Jenkins buildWithParameters.
 */
export interface JenkinsTriggerParams {
  loader: string
  mineSite: string
  timestamp: string
}

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
 * Calls a Jenkins buildWithParameters endpoint via HTTP POST.
 *
 * Jenkins expects application/x-www-form-urlencoded form body and
 * responds with 201 Created on success (not 200).
 *
 * SECURITY: Point jenkinsBaseUrl at a server-side proxy that injects
 * authentication credentials rather than embedding tokens in the widget config.
 *
 * @param baseUrl   Jenkins base URL, e.g. https://jenkins.company.com
 * @param jobName   Jenkins job name, e.g. data-finalise
 * @param params    Parameters forwarded as form fields
 * @throws JenkinsError on HTTP error responses
 */
export async function triggerJenkins(
  baseUrl: string,
  jobName: string,
  params: JenkinsTriggerParams
): Promise<void> {
  if (!baseUrl?.trim()) {
    throw new JenkinsError('Jenkins base URL is not configured.', 0)
  }

  if (!jobName?.trim()) {
    throw new JenkinsError('Jenkins job name is not configured.', 0)
  }

  const url = `${baseUrl.replace(/\/$/, '')}/job/${encodeURIComponent(jobName.trim())}/buildWithParameters`

  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    body.append(key, String(value))
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })

  // response.ok covers 200–299 (including 201 Created which Jenkins uses).
  if (!response.ok) {
    throw new JenkinsError(
      `Jenkins responded with ${response.status}: ${response.statusText}`,
      response.status
    )
  }
}
