import React from 'react'
import { create } from 'react-test-renderer'

import CheckBox from 'ui/CheckBox'

describe('<CheckBox> component', () => {
  it('renders enabled correctly', () => {
    const tree = create(<CheckBox value onChange={() => null} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders disabled correctly', () => {
    const tree = create(<CheckBox value={false} onChange={() => null} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
