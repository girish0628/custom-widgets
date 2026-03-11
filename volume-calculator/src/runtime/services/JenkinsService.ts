export interface JenkinsJobParams {
  mineSite: string
  acquisitionDate: string
  captureFrom: string
  captureTo: string
  username: string
}

export interface JenkinsConfig {
  baseUrl: string
  jobName: string
  apiToken: string
}

export class JenkinsError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message)
    this.name = 'JenkinsError'
  }
}

export class JenkinsService {
  static async triggerJob(config: JenkinsConfig, params: JenkinsJobParams): Promise<void> {
    if (!config.baseUrl) throw new Error('Jenkins Base URL is not configured')
    if (!config.jobName) throw new Error('Jenkins Job Name is not configured')

    const url = `${config.baseUrl.replace(/\/$/, '')}/job/${encodeURIComponent(config.jobName)}/buildWithParameters`

    const body = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => body.append(key, value))

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    // Token-based auth: Jenkins uses the API token as the password with any username.
    // For production, point baseUrl at a server-side proxy that injects credentials.
    if (config.apiToken) {
      headers['Authorization'] = `Basic ${btoa(`:${config.apiToken}`)}`
    }

    const response = await fetch(url, { method: 'POST', headers, body: body.toString() })

    // Jenkins returns 201 Created on success
    if (!response.ok) {
      throw new JenkinsError(response.status, `Jenkins responded with ${response.status}: ${response.statusText}`)
    }
  }
}
