var config = {
    runMode: 'development',
    defaultPort: '3000',
    defaultProtocol: 'http',
    superUser: {
        username: 'user',
        password: '123'
    },
    logs: {
        level: 'debug',
        logsPerPage: 20,
        delimiter: "\t",
        path: ''
    }
};

module.exports = config;