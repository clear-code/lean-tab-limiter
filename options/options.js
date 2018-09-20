/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

async function restoreOptions () {
  const res = await browser.storage.local.get('tab-limit')
  document.querySelector("#tab-limit").value = res['tab-limit'] || browser.runtime.getManifest().DEFAULT_TAB_LIMIT
}

async function saveOptions () {
  const newValue = document.querySelector("#tab-limit").value
  await browser.storage.local.set({
    'tab-limit': (!isNaN(newValue) && newValue > 1) ? newValue : browser.runtime.getManifest().DEFAULT_TAB_LIMIT
  })
}

async function backToDefault () {
  await browser.storage.local.remove('tab-limit')
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.getElementById("save-button").addEventListener("click", saveOptions)
document.getElementById("default-button").addEventListener("click", backToDefault)
