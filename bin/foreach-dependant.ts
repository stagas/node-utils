#!/usr/bin/env bun

import fs from 'fs'
import path from 'path'
import { exec } from '../src/exec.js'

export const run = async () => {
  const pwd = process.cwd()
  const base = path.basename(pwd)
  const parent = path.resolve(pwd, '..')
  const dirs = fs.readdirSync(parent, { withFileTypes: true }).filter(x => x.isDirectory())

  const argv = process.argv.slice(2)
  if (!argv.length) argv.push('echo', '%base')

  for (const dir of dirs) {
    try {
      const pkgPath = path.join(parent, dir.name)
      const pkg: any = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf-8'))
      if (Object.values(pkg.dependencies ?? {})
        .concat(Object.values(pkg.devDependencies ?? {}))
        .includes('file:../' + base) || dir.name === base) {

        const vars = {
          pwd: pkgPath,
          base: path.basename(pkgPath),
        }
        const [cmd, ...args] = argv.map(x =>
          Object.entries(vars).reduce(
            (p, [key, val]) => {
              return p.replace(`%${key}`, val)
            },
            x
          )
        )

        console.log(`\x1b[1m\x1b[32m${pkgPath}:\x1b[0m \x1b[1m\x1b[36m${cmd} ${args.map(x => `"${x}"`).join(' ')}\x1b[0m`)
        await exec(cmd, args, {
          cwd: pkgPath
        })
        console.log()
      }
    }
    catch (e) {
      const err = e as Error
      if (!err.message.includes('No such file')) {
        console.error(e)
      }
    }
  }
}

run()
