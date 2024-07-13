
# Logger

A TypeScript-based Logger class utilizing the `debug` library for flexible and configurable logging.

## Features

- Supports multiple log levels: `debug`, `info`, `warn`, `error`.
- Configurable logger name and plugins.
- Easily extensible for additional functionality.

## Installation

```bash
npm install @sha3/logger
```

## Usage

### Importing the Logger

```typescript
import Logger, { LoggerType, LoggerConfig, LoggerPluginConfig } from '@sha3/logger';
```

### Creating a Logger Instance

You can create a logger instance with or without configuration:

#### Without Configuration

```typescript
const logger = new Logger();
```

#### With Configuration

```typescript
const config: LoggerConfig = {
  loggerName: 'myLogger',
  plugins: [{ name: 'plugin1', options: {} }]
};

const logger = new Logger(config);
```

### Logging Messages

```typescript
logger.debug('This is a debug message');
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');
```

## Configuration

### LoggerConfig

- `loggerName`: A string representing the base name for the logger.
- `plugins`: An optional array of plugins with their configurations.

### LoggerPluginConfig

- `name`: The name of the plugin.
- `options`: Configuration options for the plugin.

### LoggerType

Defines the types of log levels available:
- `debug`
- `info`
- `warn`
- `error`

## Code Overview

### Imports

External dependencies:
```typescript
import createDebug, { Debugger } from 'debug';
```

Internal dependencies:
```typescript
import CONFIG from '../config';
```

### Types

Defines types for the logger:
```typescript
export type LoggerType = 'debug' | 'info' | 'warn' | 'error';
export type LoggerPluginConfig = { name: string; options: any };
export type LoggerConfig = { loggerName: string | null; plugins?: LoggerPluginConfig[] };
```

### Logger Class

#### Private Attributes

- `baseLoggerName`: The base name for the logger from the configuration.
- `config`: Configuration for the logger.
- `loggersInstances`: Instances of the logger for different log levels.

#### Private Methods

- `getLoggerByLevel(loggerName: string | null, level: LoggerType): Debugger`: Creates a logger instance for a specific level.
- `runPlugins(loggerType: LoggerType)`: Executes configured plugins (currently a placeholder).

#### Constructor

Initializes the logger with optional configuration.

#### Public Methods

- `debug(value: string)`: Logs a debug message.
- `info(value: string)`: Logs an info message.
- `warn(value: string)`: Logs a warning message.
- `error(value: string)`: Logs an error message.

### Environment Configuration

The `BASE_LOGGER_NAME` variable is a crucial part of the logger configuration. It is read from the environment variables to provide a base name for all loggers. This allows for consistent and configurable naming across different environments and deployments.

To set this variable, you can include it in your environment configuration file (e.g., `.env`):

```env
BASE_LOGGER_NAME=my_app_name
```

## TODO

- Implement the `runPlugins` method to handle logger plugins.

## License

[MIT](LICENSE)
