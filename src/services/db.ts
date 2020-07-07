import firebase from 'react-native-firebase'

const firebaseDb = firebase.database()

const fetchHubsList = async () => {
  try {
    const snapshot = await firebaseDb.ref('hubs').once('value')
    return snapshot.val()
  } catch (error) {
    return Promise.reject(error)
  }
}

const fetchTokensMetadata = async () => {
  try {
    const snapshot = await firebaseDb.ref('tokens').once('value')
    return snapshot.val()
  } catch (error) {
    return Promise.reject(error)
  }
}

export const DB_FAIL_TIMEOUT = 5000 // 5 seconds

export const db = { fetchHubsList, fetchTokensMetadata }
