/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

async function initialize () {
  document.querySelector('#tab-limit-label').textContent = browser.i18n.getMessage('tab_limit_label')
  document.querySelector('#notify-blocked-label').textContent = browser.i18n.getMessage('notify_blocked_label')
  document.querySelector('#save-button').textContent = browser.i18n.getMessage('save_button_label')
  document.querySelector('#default-button').textContent = browser.i18n.getMessage('default_button_label')

  const res = await browser.storage.local.get({})
  document.querySelector('#tab-limit').value = typeof res['tab-limit'] == 'number' ?
    res['tab-limit'] : browser.runtime.getManifest().DEFAULT_TAB_LIMIT
  document.querySelector('#notify-blocked').checked = typeof res['notify-blocked'] == 'boolean' ?
    res['notify-blocked'] : browser.runtime.getManifest().DEFAULT_NOTIFY_BLOCKED
}

async function saveOptions () {
  const limit = document.querySelector("#tab-limit").value
  const notifyBlocked = document.querySelector("#tab-limit").value
  await browser.storage.local.set({
    'tab-limit':      (!isNaN(limit) && limit > 1) ? limit : browser.runtime.getManifest().DEFAULT_TAB_LIMIT,
    'notify-blocked': notifyBlocked
  })
}

async function backToDefault () {
  await browser.storage.local.remove(['tab-limit', 'notify-blocked'])
}

document.addEventListener('DOMContentLoaded', initialize)
document.getElementById("save-button").addEventListener("click", saveOptions)
document.getElementById("default-button").addEventListener("click", backToDefault)
