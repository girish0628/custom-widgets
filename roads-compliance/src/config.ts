import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
  mineSites: string[]
  complianceTypes: string[]
  jenkinsBaseUrl: string
  jobName: string
  apiToken: string
}

export type IMConfig = ImmutableObject<Config>
