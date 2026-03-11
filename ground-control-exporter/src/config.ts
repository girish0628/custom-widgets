import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
  jenkinsBaseUrl: string
  jobName: string
  apiToken: string
}

export type IMConfig = ImmutableObject<Config>
