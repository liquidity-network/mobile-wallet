import React from 'react'
import { TouchableOpacity } from 'react-native'
import { fireEvent, render } from 'react-native-testing-library'

import Button from '../../src/ui/Button'

describe('<Button> component', () => {
  // it('renders with icon correctly', () => {
  //   const tree = create(<Button text="tap me" icon={<Text>:)</Text>} />).toJSON()
  //   expect(tree).toMatchSnapshot()
  // })
  //
  // it('renders disabled correctly', () => {
  //   const tree = create(<Button text="tap me" disabled />).toJSON()
  //   expect(tree).toMatchSnapshot()
  // })
  //
  // it('renders transparent correctly', () => {
  //   const tree = create(<Button text="tap me" transparent />).toJSON()
  //   expect(tree).toMatchSnapshot()
  // })
  //
  // it('renders outline correctly', () => {
  //   const tree = create(<Button text="tap me" outline />).toJSON()
  //   expect(tree).toMatchSnapshot()
  // })

  it('calls onPress when pressed', () => {
    const props = { text: 'tap me', onPress: jest.fn() }

    const { getByType } = render(<Button {...props} />)
    const button = getByType(TouchableOpacity)

    fireEvent.press(button)

    expect(props.onPress).toBeCalled()
  })
})
