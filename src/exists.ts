import * as fsp from 'fs/promises'

export async function exists(pathname: string) {
  try {
    await fsp.lstat(pathname)
    return true
  } catch (error) {
    return false
  }
}
