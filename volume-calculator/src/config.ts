import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
  mineSites: string[]
  jenkinsBaseUrl: string
  jenkinsJobName: string
  jenkinsApiToken: string
}

export type IMConfig = ImmutableObject<Config>
