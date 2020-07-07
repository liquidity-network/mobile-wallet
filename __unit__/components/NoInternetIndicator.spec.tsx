import React from 'react'
import { create } from 'react-test-renderer'

import NoInternetIndicator from 'ui/NoInternetIndicator'

describe('<NoInternetIndicator> component', () => {
  it('renders correctly', () => {
    const tree = create(<NoInternetIndicator />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
