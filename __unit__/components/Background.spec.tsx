import React from 'react'
import { create } from 'react-test-renderer'

import Background from 'ui/Background'

describe('<Background> component', () => {
  it('renders correctly', () => {
    const tree = create(<Background source={{ uri: 'https://google.com' }} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
