import React from 'react'
import { TouchableOpacity } from 'react-native'
import { create } from 'react-test-renderer'
import { fireEvent, render } from 'react-native-testing-library'

import CopyButton from 'ui/CopyButton'

describe('<CopyButton> component', () => {
  it('renders with icon correctly', () => {
    const tree = create(<CopyButton onPress={() => null} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('calls onPress when pressed', () => {
    const props = { onPress: jest.fn() }

    const { getByType } = render(<CopyButton {...props} />)
    const button = getByType(TouchableOpacity)

    fireEvent.press(button)

    expect(props.onPress).toBeCalled()
  })
})
