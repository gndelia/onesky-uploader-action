import * as core from '@actions/core'
import fetch from 'node-fetch'
import { promisify } from 'util'
import { join } from 'path'
import { readFile } from 'fs'
import FormData from 'form-data'
import { OneSkyApiUrl } from './constants'
import { addAuthInfo } from './auth'

type FileUploadResponse = {
  name: string
  import: { id: number }
}

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

type FileProcessStatus = 'completed' | 'in-progress' | 'failed'
async function waitForImportFileProcess({
  projectId,
  fileUploadResponse,
  privateKey,
  publicKey,
}: {
  projectId: string
  fileUploadResponse: FileUploadResponse
  privateKey: string
  publicKey: string
}) {
  const POLLING_INTERVAL_MS = 8000
  const { name } = fileUploadResponse
  const { id } = fileUploadResponse.import
  const importUrl = `${OneSkyApiUrl}/projects/${projectId}/import-tasks/${id}`

  return new Promise((resolve, reject) => {
    const verify = async () => {
      try {
        const url = addAuthInfo({
          url: importUrl,
          privateKey,
          publicKey,
        })
        console.log(`Checking import status of ${name} file, importId: ${id}`)
        const response = await fetch(url)
        const json: { status: FileProcessStatus } = await response.json()
        if (json.status === 'in-progress') {
          console.log('Status: in-progress, rechecking in approximately 8 seconds...')
          // return, next interval will check again
          setTimeout(verify, POLLING_INTERVAL_MS)
          return
        }
        if (json.status === 'completed') {
          console.log(`${name} file processed successfully!`)
          resolve()
          return
        }
        if (json.status === 'failed') {
          console.log(`Failed to process ${name}, importId: ${id}`)
          // failed to process
          throw Error(`ImportId ${id} failed to be processed`)
        }
        throw new Error('Unsupported status from OneSky Import API')
      } catch (e) {
        reject(e)
      }
    }
    setTimeout(verify, POLLING_INTERVAL_MS)
  })
}

;(async () => {
  try {
    console.log('Starting OneSky upload file action.')

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

    const requestUrl = addAuthInfo({
      url: `${OneSkyApiUrl}/projects/${projectId}/files?`,
      privateKey,
      publicKey,
    })

    const path = join(process.env.GITHUB_WORKSPACE!, filepath, filename)
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

    console.log(`posting file to OneSkyApp`)
    const response = await fetch(requestUrl, { method: 'POST', body: form })

    const fileUploadResponse: FileUploadResponse = await response.json()
    console.log(fileUploadResponse)
    console.log(`Successfully started upload of ${filename}`)
    await waitForImportFileProcess({ projectId, fileUploadResponse, privateKey, publicKey })
    console.log(`${fileUploadResponse.name} uploaded and imported successfully.`)
  } catch (e) {
    console.error(e)
    core.setFailed(`Action failed with the error ${e.message}`)
  }
})()
