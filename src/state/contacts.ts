import produce from 'immer'

import { AppState, GetState } from '.'
import { getPublicKey } from './auth'

export interface Contact {
  name: string
  address: string
}

// SHAPE
export interface ContactsState {
  savedContacts: Contact[]
}

const initialState: ContactsState = { savedContacts: [] }

// SELECTORS
export const getContacts = (state: AppState): Contact[] => state.contacts.savedContacts

// ACTION TYPES
const ADD_CONTACT = 'ADD_CONTACT'
const DELETE_CONTACT = 'DELETE_CONTACT'

// ACTION CREATORS
export const addContact = (contact: Contact) => ({ type: ADD_CONTACT, contact })
export const deleteContact = (address: string) => ({ type: DELETE_CONTACT, address })

// REDUCER
export default (state: ContactsState = initialState, action): ContactsState =>
  produce(state, draft => {
    switch (action.type) {
      case ADD_CONTACT:
        draft.savedContacts.push(action.contact)
        break
      case DELETE_CONTACT: {
        const index = draft.savedContacts.findIndex(c => c.address !== action.address)
        draft.savedContacts.splice(index, 1)
      }
    }
  })

// THUNKS
export const addMeToContacts = () => (dispatch, getState: GetState) => {
  console.log('add me to contact')
  const state = getState()
  const publicKey = getPublicKey(state)
  const contacts = getContacts(state)

  if (contacts.length === 0) {
    dispatch(addContact({ name: 'Me', address: publicKey }))
  }
}
