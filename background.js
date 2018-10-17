/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const DEFAULT_OPTIONS = {
  limit:                 browser.runtime.getManifest().DEFAULT_TAB_LIMIT,
  notifyBlocked:         browser.runtime.getManifest().DEFAULT_NOTIFY_BLOCKED,
  notifyBlockedDuration: browser.runtime.getManifest().DEFAULT_NOTIFY_BLCOKED_DURATION,
  notifyBlockedTitle:    '',
  notifyBlockedMessage:  ''
}
const options = {
  limit:                 DEFAULT_OPTIONS.limit,
  notifyBlocked:         DEFAULT_OPTIONS.notifyBlocked,
  notifyBlockedDuration: DEFAULT_OPTIONS.notifyBlockedDuration,
  notifyBlockedTitle:    '',
  notifyBlockedMessage:  ''
}

const parseOptions = (values) => {
  return {
    limit:                 parseInt(values['tab-limit']),
    notifyBlocked:         typeof values['notify-blocked'] == 'boolean' ?
                             values['notify-blocked'] : undefined,
    notifyBlockedDuration: parseInt(values['notify-blocked-duration']),
    notifyBlockedTitle:    values['notify-blocked-title'],
    notifyBlockedMessage:  values['notify-blocked-message']
  }
}

const updateOptions = async () => {
  const [localValues, managedValues] = await Promise.all([
    (async () => {
      const res = await browser.storage.local.get()
      return parseOptions(res)
    })(),
    (async () => {
      try {
        if (browser.storage.managed) {
          const res = await browser.storage.managed.get()
          return parseOptions(res)
        }
      }
      catch(error) {
        // there is no managed storage manifest!
      }
      return undefined
    })()
  ])
  for (const key of Object.keys(DEFAULT_OPTIONS)) {
    if (typeof managedValues[key] == typeof DEFAULT_OPTIONS[key])
      options[key] = managedValues[key]
    else if (typeof localValues[key] == typeof DEFAULT_OPTIONS[key])
      options[key] = localValues[key]
    else
      options[key] = DEFAULT_OPTIONS[key]
  }
  console.log('options: ', {options,localValues, managedValues})
}

browser.storage.onChanged.addListener(updateOptions)
updateOptions()

let clearNotification = null

const reactToNewTab = async tab => {
  const tabs = await browser.tabs.query({})
  if (tabs.length <= options.limit) return
  browser.tabs.remove(tab.id)

  if (!options.notifyBlocked) return
  if (clearNotification) clearTimeout(clearNotification)
  const title = options.notifyBlockedTitle || browser.runtime.getManifest().name
  let message = options.notifyBlockedMessage
  if (message) message = message.replace(/%s/gi, options.limit)
  else message = browser.i18n.getMessage('notify_blocked', [options.limit])
  browser.notifications.create('notify-blocked', {
    type:    'basic',
    title,
    message
  })
  clearNotification = setTimeout(() => {
    browser.notifications.clear('notify-blocked')
  }, options.notifyBlockedDuration)
}

browser.tabs.onCreated.addListener(reactToNewTab)
