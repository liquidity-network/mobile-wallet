import React, { createRef, PureComponent } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { Transitioning, Transition, TransitioningView } from 'react-native-reanimated'
import I18n from 'i18n-js'

import { deviceHeight, deviceWidth, globalStyles, WHITE } from 'globalStyles'
import {
  onboarding1Bg, onboarding2Bg, onboarding3Bg, onboarding4Bg,
} from '../../assets/images' // prettier-ignore
import Background from 'ui/Background'
import Button from 'ui/Button'
import { openRootResolver } from 'routes/navigationActions'
import { fetchCriticalData } from 'state/etc'
import { logEvent, AnalyticEvents } from 'services/analytics'

interface CarouselItem {
  text: string
  bg
}

interface State {
  activeItem: number
}

const carouselData: CarouselItem[] = [
  { text: 'on-boarding-one', bg: onboarding1Bg },
  { text: 'on-boarding-two', bg: onboarding2Bg },
  { text: 'on-boarding-three', bg: onboarding3Bg },
  { text: 'on-boarding-four', bg: onboarding4Bg },
]

class OnBoardingScreen extends PureComponent<{ dispatch }, State> {
  transition = createRef<TransitioningView>()

  state: State = { activeItem: 0 }

  updateActiveItem = (index: number): void => {
    this.setState({ activeItem: index })
    this.transition.current.animateNextTransition()
  }

  proceed = async () => {
    try {
      await this.props.dispatch(fetchCriticalData())
    } finally {
      logEvent(AnalyticEvents.COMPLETE_INTRO_ONBOARDING)

      openRootResolver()
    }
  }

  renderCarouselItem = ({ item, index }: { item: CarouselItem; index: number }) => (
    <Background testID={'CarouselSlide' + index} source={item.bg} />
  )

  render() {
    return (
      <View style={globalStyles.flexOne}>
        <Transitioning.View
          ref={this.transition}
          style={globalStyles.flexOne}
          transition={
            <Transition.Together>
              <Transition.In type="fade" durationMs={250} interpolation="easeOut" />
              <Transition.Out type="fade" durationMs={200} interpolation="easeIn" />
            </Transition.Together>
          }
        >
          <Carousel
            data={carouselData}
            onSnapToItem={this.updateActiveItem}
            renderItem={this.renderCarouselItem}
            sliderWidth={deviceWidth}
            itemWidth={deviceWidth}
            inactiveSlideOpacity={1}
            inactiveSlideScale={1}
            removeClippedSubviews={false}
          />

          <Pagination
            dotsLength={4}
            activeDotIndex={this.state.activeItem}
            containerStyle={styles.paginationContainer}
            dotStyle={styles.paginationDot}
            dotContainerStyle={styles.paginationDotContainer}
            inactiveDotOpacity={0.2}
            inactiveDotScale={0.75}
          />

          <Text style={styles.text} testID="OnBoardingScreen">
            {I18n.t(carouselData[this.state.activeItem].text)}
          </Text>

          {this.state.activeItem === 3 ? (
            <View style={styles.startButtonContainer}>
              <Button
                text="Get Started"
                style={styles.startButton}
                onPress={this.proceed}
                testID="OnBoardingScreenGetStartedButton"
              />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.skipButton}
              activeOpacity={0.7}
              onPress={this.proceed}
              testID="OnBoardingScreenSkipButton"
            >
              <Text style={styles.skipText}>{I18n.t('skip')}</Text>
            </TouchableOpacity>
          )}
        </Transitioning.View>
      </View>
    )
  }
}

export default connect()(OnBoardingScreen)

const styles: any = {
  text: {
    position: 'absolute',
    bottom: deviceHeight * 0.25,
    left: deviceWidth * 0.1,
    right: deviceWidth * 0.1,
    alignSelf: 'center',
    textAlign: 'center',
    ...globalStyles.P,
    color: WHITE,
  },
  skipButton: { position: 'absolute', top: deviceHeight * 0.075 - 30, right: -10 },
  skipText: { padding: 30, ...globalStyles.P, color: WHITE },
  paginationContainer: { position: 'absolute', bottom: deviceHeight * 0.12, alignSelf: 'center' },
  paginationDotContainer: { marginHorizontal: 2 },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 0,
    backgroundColor: WHITE,
  },
  startButtonContainer: { position: 'absolute', width: deviceWidth, bottom: deviceHeight * 0.05 },
  startButton: { left: deviceWidth * 0.06, width: deviceWidth * 0.88 },
}
