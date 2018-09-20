/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const reactToNewTab = async tab => {
  const tabs = await browser.tabs.query({})
  const res = await browser.storage.local.get('tab-limit')
  const limit = res['tab-limit'] || browser.runtime.getManifest().DEFAULT_TAB_LIMIT
  if (tabs.length > limit) await browser.tabs.remove(tab.id)
}

browser.tabs.onCreated.addListener(reactToNewTab)
