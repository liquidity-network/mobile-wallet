import firebase from 'react-native-firebase'

export const fetchRemoteConfig = async () => {
  try {
    await firebase.config().fetch()
    await firebase.config().activateFetched()
  } catch (error) {
    console.log('fetchRemoteConfig error', error)
  }
}

export const getRemoteConfigValue = async (key: string) => {
  const snapshot = await firebase.config().getValue(key)
  return snapshot.val()
}
