type PluginConfig = {
    name: string;
    options: any;
};
type LoggerConfig = {
    loggerName: string | null;
    plugins?: PluginConfig[];
};
/**
 * exports
 */
declare class Logger {
    /**
     * private: attributes
     */
    private appName;
    private config;
    private loggersInstances;
    /**
     * private: methods
     */
    private getLoggerByLevel;
    private runPlugins;
    /**
     * constructor
     */
    constructor(loggerConfig?: LoggerConfig | string);
    /**
     * public: methods
     */
    debug(value: string): void;
    info(value: string): void;
    warn(value: string): void;
    error(value: string): void;
}

export { Logger as default };
