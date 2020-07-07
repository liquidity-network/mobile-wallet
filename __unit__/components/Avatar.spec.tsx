import React from 'react'
import { create } from 'react-test-renderer'

import Avatar from 'ui/Avatar'

describe('<Avatar> component', () => {
  it('renders w/url correctly', () => {
    const tree = create(<Avatar url={'https://google.com'} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders w/name correctly', () => {
    const tree = create(<Avatar name="Michael Jackson" />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
