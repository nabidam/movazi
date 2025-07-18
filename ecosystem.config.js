module.exports = {
    apps: [
        {
            name: 'movazi',
            script: 'yarn',
            args: 'run start',
            cwd: 'path/to/project',
            interpreter: 'path/to/node',
            instances: 2,
            exec_mode: 'cluster',
            autorestart: true,
            restart_delay: 3000,
            exp_backoff_restart_delay: 100
        }
    ],
}