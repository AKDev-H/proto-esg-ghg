module.exports = {
    apps: [
        {
            name: "esg-ghg",
            cwd: __dirname,
            script: "node_modules/next/dist/bin/next",
            args: "start",
            exec_mode: "fork",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "300M",
            time: true,
            merge_logs: true,
            out_file: "./logs/pm2-out.log",
            error_file: "./logs/pm2-error.log",
            env: {
                NODE_ENV: "development",
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
    ],
};
