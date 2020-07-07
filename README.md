
## Running
- run debug build on Android emulator/device via `yarn android`
- run release build on Android emulator/device via `yarn android:release`
- run debug build on iOS simulator via `yarn ios`

## Testing
- run unit tests via `yarn unit`, make sure all are green 
- run e2e tests on iOS via `yarn e2e:ios`
- run e2e tests on Android via `yarn e2e:android`, Android tests are more flaky than iOS and also couple of tests are skipped on Android 

## Release flow

#### Internal
- all commits should document their changes inside `CHANGELOG.md`  
- make sure all changes are committed as release script does hard reset to HEAD **[!!!]**
- run `yarn release`, script will:  
  - make sure that version number across `Info.plist`, `build.gradle` and `package.json` is consistent
  - bump version number
  - create release section inside `CHANGELOG.md`
  - commit and push changes
- run `yarn publish:android:beta` to deploy Android internal build
- run `yarn publish:ios` to deploy iOS build to TestFlight

#### Production
- run `yarn publish:android:production` to deploy Android production build and then manually bump `beta` version to `production` in Play Console
- create new release manually in AppStore Connect and pick previously built TestFlight build

## Test wallet

Test wallet seed phrase:  
`oblige useless pair size viable hunt catalog spice strike audit route broccoli`
Test wallet address: `0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5`
There are test assets on both rinkeby and mainnet(real money), don't expose seed phrase to public

## Disclaimer

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.