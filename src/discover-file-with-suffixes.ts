import * as fs from 'fs'
import * as path from 'path'
import { exists } from './exists.ts'

export async function discoverFileWithSuffixes(pathname: string, suffixes: string[]) {
  let file: string | void = pathname
  const basename = path.dirname(file) + '/' + path.basename(file, path.extname(file))
  const candidates = [
    ...suffixes.map(x => pathname + x),
    ...suffixes.map(x => basename + x)
  ]
  while (!(await exists(file)) || !(await fs.promises.stat(file)).isFile()) {
    file = candidates.shift()
    if (!file) return
  }
  return file
}
