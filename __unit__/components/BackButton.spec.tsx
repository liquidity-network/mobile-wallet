import React from 'react'
import { create } from 'react-test-renderer'
import 'react-native-vector-icons/Feather'

import BackButton from 'ui/BackButton'

describe('<BackButton> component', () => {
  it('renders correctly', () => {
    const tree = create(<BackButton onPress={() => null} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
