/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const DEFAULT_TAB_LIMIT = browser.runtime.getManifest().DEFAULT_TAB_LIMIT
let limit = DEFAULT_TAB_LIMIT

const updateLimit = async () => {
  const [localLimit, managedLimit] = await Promise.all([
    (async () => {
      const res = await browser.storage.local.get('tab-limit')
      return parseInt(res['tab-limit'])
    })(),
    (async () => {
      try {
        if (browser.storage.managed) {
          const res = await browser.storage.managed.get('tab-limit')
          return parseInt(res['tab-limit'])
        }
      }
      catch(error) {
        // there is no managed storage manifest!
      }
      return undefined
    })()
  ])
  if (typeof managedLimit == 'number')
    limit = managedLimit || DEFAULT_TAB_LIMIT
  else
    limit = localLimit || DEFAULT_TAB_LIMIT
}

browser.storage.onChanged.addListener(updateLimit)
updateLimit()

const reactToNewTab = async tab => {
  const tabs = await browser.tabs.query({})
  if (tabs.length > limit) await browser.tabs.remove(tab.id)
}

browser.tabs.onCreated.addListener(reactToNewTab)
