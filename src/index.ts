import * as core from '@actions/core'
import fetch from 'node-fetch'
import { promisify } from 'util'
import { resolve } from 'path'
import { readFile } from 'fs'
import FormData from 'form-data'
import { OneSkyApiUrl } from './constants'
import { getHash } from './auth'

function validateInputs() {
  const publicKey = core.getInput('publicKey', { required: true })
  const privateKey = core.getInput('privateKey', { required: true })
  const projectId = core.getInput('projectId', { required: true })
  const filename = core.getInput('filename', { required: true })
  const locale = core.getInput('locale', { required: true })
  const filepath = core.getInput('filepath', { required: true })
  const fileFormat = core.getInput('fileFormat')
  const isKeepingAllStrings = core.getInput('isKeepingAllStrings')

  return {
    publicKey,
    privateKey,
    projectId,
    filename,
    fileFormat,
    isKeepingAllStrings,
    filepath,
    locale,
  }
}

;(async () => {
  try {
    const {
      publicKey,
      filename,
      privateKey,
      projectId,
      fileFormat,
      isKeepingAllStrings,
      locale,
      filepath,
    } = validateInputs()

    const timestamp = Math.floor(Date.now() / 1000)
    const hash = getHash(timestamp, privateKey)
    const queryString = `api_key=${encodeURIComponent(publicKey)}&timestamp=${timestamp}&dev_hash=${encodeURIComponent(
      hash
    )}`
    const url = `${OneSkyApiUrl}/projects/${projectId}/files?${queryString}`

    const path = resolve(__dirname, `${filepath}/${filename}`)
    console.log(`reading the resource file from ${path}`)
    const fileString = await promisify(readFile)(path, 'utf8')

    const form = new FormData()
    // content of the file
    form.append('file', fileString, {
      filename,
    })

    // refer to docs https://github.com/onesky/api-documentation-platform/blob/master/resources/file.md#upload---upload-a-file
    // for the following options
    form.append('file_format', fileFormat)
    form.append('locale', locale)
    form.append('is_keeping_all_strings', isKeepingAllStrings)

    console.log(`posting file to ${url}`)
    const response = await fetch(url, { method: 'POST', body: form })
    // using text because the json they send on error is not valid :(
    const json = await response.text()
    console.log(json)
  } catch (e) {
    core.setFailed(`Action failed with the error ${e.message}`)
  }
})()
