type LoggerConfig = {
    loggerName: string;
};
declare class Logger {
    private appName;
    private config;
    private loggersInstances;
    private getLoggerByLevel;
    constructor(loggerConfig: LoggerConfig | string);
    debug(value: string): void;
    info(value: string): void;
    warn(value: string): void;
    error(value: string): void;
}

export { Logger as default };
