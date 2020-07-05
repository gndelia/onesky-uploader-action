import crypto from 'crypto'

export const getHash = (timestamp: number, privateKey: string): string => {
  return crypto.createHash('md5').update(`${timestamp}${privateKey}`).digest('hex')
}
