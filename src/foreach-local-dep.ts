#!/usr/bin/env bun

import fs from 'fs'
import path from 'path'
import { exec } from './exec.ts'
import { assign, values } from 'utils'

let visited = new Set()

function gatherLocalDeps(pkgPath: string, deps: Record<string, string> = {}) {
  if (visited.has(pkgPath)) return deps
  visited.add(pkgPath)

  const pkg: any = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf-8'))

  values(
    assign<Record<string, string>>(
      pkg.dependencies ?? {},
      pkg.devDependencies,
      pkg.peerDependencies,
    )
  ).forEach(value => {
    if (!value.startsWith('file:')) return
    const relPath = value.split('file:').pop()!
    const absPath = path.resolve(pkgPath, relPath)
    gatherLocalDeps(absPath, deps)
  })

  deps[pkg.name] = pkgPath
  return deps
}

export const run = async () => {
  const deps = gatherLocalDeps(process.cwd())

  for (const name in deps) {
    const resolved = deps[name]

    const vars = {
      pwd: resolved,
      base: path.basename(resolved),
    }

    const argv = process.argv.slice(2)
    if (!argv.length) argv.push('echo', '%base')
    const [cmd, ...args] = argv.map(x =>
      Object.entries(vars).reduce(
        (p, [key, val]) => {
          return p.replace(`%${key}`, val)
        },
        x
      )
    )

    console.log(`\x1b[1m\x1b[32m${resolved}:\x1b[0m \x1b[1m\x1b[36m${cmd} ${args.map(x => `"${x}"`).join(' ')}\x1b[0m`)
    try {
      await exec(cmd, args, {
        cwd: resolved
      })
    }
    catch (e) {
      console.error(e)
    }
    console.log()
  }
}

run()
