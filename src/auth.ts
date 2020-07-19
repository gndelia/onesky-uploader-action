import crypto from 'crypto'

const getHash = (timestamp: number, privateKey: string): string => {
  return crypto.createHash('md5').update(`${timestamp}${privateKey}`).digest('hex')
}

export const addAuthInfo = ({
  url,
  privateKey,
  publicKey,
}: {
  url: string
  privateKey: string
  publicKey: string
}): string => {
  const timestamp = Math.floor(Date.now() / 1000)
  const hash = getHash(timestamp, privateKey)
  const queryString = `api_key=${encodeURIComponent(publicKey)}&timestamp=${timestamp}&dev_hash=${encodeURIComponent(
    hash
  )}`
  return `${url}${queryString}`
}
