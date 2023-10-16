import child_process from 'child_process'

export function exec(cmd: string, args: string[] = [], options: child_process.SpawnOptions = {}) {
  return new Promise((resolve, reject) => {
    const child = child_process.spawn(
      cmd,
      args,
      {
        stdio: 'inherit',
        killSignal: 'SIGINT',
        ...options,
      }
    )
    const kill = (signal: NodeJS.Signals) => {
      child.kill(signal)
      process.exit(1)
    }
    process.on('SIGINT', () => kill('SIGINT'))
    child.once('error', reject)
    child.once('exit', resolve)
  })
}
