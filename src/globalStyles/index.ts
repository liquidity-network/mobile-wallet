/**
 * Global style settings and utilities
 */
import { Dimensions, LayoutAnimation, NativeModules, Platform } from 'react-native'
import { isIphoneX as isIPhoneX } from 'react-native-iphone-x-helper'
import { createIconSetFromIcoMoon } from 'react-native-vector-icons'

const { StatusBarManager } = NativeModules

export const isIos = Platform.OS === 'ios'
export const isAndroid = Platform.OS === 'android'
export const isIphoneX = isIPhoneX()

export const statusBarHeight = isAndroid ? StatusBarManager.HEIGHT : isIphoneX ? 44 : 20
export const deviceHeight = Dimensions.get('window').height
export const deviceWidth = Dimensions.get('window').width
export const SMALL_DEVICE = deviceHeight < 600

// Fonts
export const IcoMoon = createIconSetFromIcoMoon(require('../../assets/icons/selection.json'))

export const Grotesk = 'AktivGroteskCorp-Regular'
export const GroteskBold = 'AktivGroteskCorp-Bold'

// Color palette
export const ACTIVE_COLOR = '#5436cd'
export const PRIMARY_COLOR = '#382194'
export const PRIMARY_COLOR_LIGHT = '#613be0'
export const SECONDARY_COLOR = '#221557'
export const BG_COLOR = '#0f022b'
export const KIMBERLY_SEMITRANSPARENT = '#725f86aa'
export const GREEN = '#00b285'
export const LIGHT_ORANGE = '#f5ab00'
export const ORANGE = '#f58300'
export const RED = '#d11b1b'
export const MUTED_COLOR = '#dbd5f2'

export const WHITE = '#fff'
export const BLACK = '#0a0021'
export const ALMOST_BLACK = '#0e1a2c'
export const DARKER_GRAY = '#4e525a'
export const DARK_GRAY = '#797881'
export const GREY = '#9fa6b3'
export const LIGHT_GRAY = '#a1a1a1'
export const LIGHTER_GRAY = '#d7dae0'
export const LIGHTEST_GRAY = '#ebeef4'

// Hit areas
export const smallHitSlop = { left: 7, right: 7, top: 7, bottom: 7 }
export const mediumHitSlop = { left: 15, right: 15, top: 15, bottom: 15 }
export const bigHitSlop = { left: 25, right: 25, top: 25, bottom: 25 }

export const globalStyles: any = {
  // TYPOGRAPHY
  H1: { fontFamily: GroteskBold, fontSize: 64, letterSpacing: 1, color: BLACK },
  H2: { fontFamily: GroteskBold, fontSize: 50, letterSpacing: 1, color: BLACK },
  H3: { fontFamily: GroteskBold, fontSize: 40, letterSpacing: 1, color: BLACK },
  H4: { fontFamily: GroteskBold, fontSize: 32, letterSpacing: 1, color: BLACK },
  H5: { fontFamily: GroteskBold, fontSize: 28, color: BLACK },
  H6: { fontFamily: Grotesk, fontSize: 12, letterSpacing: 3, color: BLACK, opacity: 0.5 },
  P_BIG: { fontFamily: Grotesk, fontSize: 18, color: BLACK },
  P: { fontFamily: Grotesk, fontSize: 16, color: BLACK },
  P_SMALL: { fontFamily: Grotesk, fontSize: 14, color: BLACK },
  P_XS: { fontFamily: Grotesk, fontSize: 14, color: BLACK },
  // LAYOUT HELPERS
  flexOne: { flex: 1 },
  flexOneCentered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inline: { flexDirection: 'row' },
  inlineCentered: { flexDirection: 'row', alignItems: 'center' },
  inlineBottomAligned: { flexDirection: 'row', alignItems: 'flex-end' },
  inlineToSides: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  right: { textAlign: 'right' },
  // SHARED ELEMENTS
  backButton: {
    position: 'absolute',
    top: statusBarHeight,
    left: 0,
    padding: 18,
  },
}

// LayoutAnimation configs
export const LayoutAnimationOpacityConfig = {
  duration: 250,
  create: {
    type: LayoutAnimation.Types.easeIn,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.easeOut,
    property: LayoutAnimation.Properties.opacity,
  },
}

export const LayoutAnimationScaleConfig = {
  duration: 250,
  create: {
    type: LayoutAnimation.Types.easeIn,
    property: LayoutAnimation.Properties.scaleXY,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.easeOut,
    property: LayoutAnimation.Properties.scaleXY,
  },
}
