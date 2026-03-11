import { React } from 'jimu-core'
import _Widget from '../src/runtime/widget'
import { widgetRender, wrapWidget } from 'jimu-for-test'

const render = widgetRender()

const defaultConfig = {
  mineSites: ['Eastern Ridge', 'Jimblebar'],
  jenkinsBaseUrl: 'https://jenkins.example.com',
  jenkinsJobName: 'volume-calculator',
  jenkinsApiToken: ''
}

describe('VolumeCalculator widget', () => {
  it('renders the widget header', () => {
    const Widget = wrapWidget(_Widget, { config: defaultConfig })
    const { queryByText } = render(<Widget widgetId='Widget_1' />)
    expect(queryByText('Volume Calculator')).toBeTruthy()
  })

  it('shows the confirmation popup on first render', () => {
    const Widget = wrapWidget(_Widget, { config: defaultConfig })
    const { queryByText } = render(<Widget widgetId='Widget_1' />)
    expect(queryByText('Please confirm following are up to date?')).toBeTruthy()
  })

  it('shows all three confirmation checkboxes', () => {
    const Widget = wrapWidget(_Widget, { config: defaultConfig })
    const { queryByText } = render(<Widget widgetId='Widget_1' />)
    expect(queryByText('Is Surface DEM uptodate?')).toBeTruthy()
    expect(queryByText('Is Base Surface uptodate?')).toBeTruthy()
    expect(queryByText('Are stockpile footprints uptodate?')).toBeTruthy()
  })
})
