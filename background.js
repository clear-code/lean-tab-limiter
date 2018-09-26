/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const DEFAULT_TAB_LIMIT = browser.runtime.getManifest().DEFAULT_TAB_LIMIT
let limit = DEFAULT_TAB_LIMIT

const DEFAULT_NOTIFY_BLOCKED = browser.runtime.getManifest().DEFAULT_NOTIFY_BLOCKED
let notifyBlocked = DEFAULT_NOTIFY_BLOCKED

const DEFAULT_NOTIFY_BLCOKED_DURATION = browser.runtime.getManifest().DEFAULT_NOTIFY_BLCOKED_DURATION
let notifyBlockedDuration = DEFAULT_NOTIFY_BLCOKED_DURATION

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

let clearNotification = null

const reactToNewTab = async tab => {
  const tabs = await browser.tabs.query({})
  if (tabs.length <= limit) return
  browser.tabs.remove(tab.id)

  if (!notifyBlocked) return
  if (clearNotification) clearTimeout(clearNotification)
  browser.notifications.create('notify-blocked', {
    type:    'basic',
    title:   browser.runtime.getManifest().name,
    message: browser.i18n.getMessage('notify_blocked', [limit])
  })
  clearNotification = setTimeout(() => {
    browser.notifications.clear('notify-blocked')
  }, notifyBlockedDuration)
}

browser.tabs.onCreated.addListener(reactToNewTab)
