import reducer, { updateHubsInfo } from 'state/hubs'

describe('hubs reducer', () => {
  it('should not delete previous hub info when overwriting', () => {
    let state = reducer(
      undefined,
      updateHubsInfo({
        hub: { id: 'hub', name: 'hubName', providers: { default: 'provider' } },
      } as any),
    )
    expect(state.list.hub).toBeTruthy()

    state = reducer(
      state,
      updateHubsInfo({
        hub: { id: 'hub', name: 'newHubName' },
      } as any),
    )
    expect(state.list.hub.providers).toBeTruthy()
    expect(state.list.hub.name).toEqual('newHubName')
  })
})
