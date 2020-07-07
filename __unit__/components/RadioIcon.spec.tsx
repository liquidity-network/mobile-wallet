import React from 'react'
import { create } from 'react-test-renderer'

import RadioIcon from 'ui/RadioIcon'

describe('<RadioIcon> component', () => {
  it('renders correctly', () => {
    const tree = create(<RadioIcon enabled={false} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders enabled correctly', () => {
    const tree = create(<RadioIcon enabled />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
