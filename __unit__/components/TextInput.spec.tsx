import React from 'react'
import { Text } from 'react-native'
import { create } from 'react-test-renderer'

import TextInput from 'ui/TextInput'

describe('<TextInput> component', () => {
  it('renders correctly', () => {
    const tree = create(<TextInput qr right={<Text>:)</Text>} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
