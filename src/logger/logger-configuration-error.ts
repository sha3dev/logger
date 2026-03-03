/**
 * @section imports:externals
 */
// empty

/**
 * @section imports:internals
 */
// empty

/**
 * @section consts
 */
// empty

/**
 * @section types
 */
// empty

export class LoggerConfigurationError extends Error {
  /**
   * @section private:attributes
   */
  // empty

  /**
   * @section protected:attributes
   */
  // empty

  /**
   * @section private:properties
   */
  // empty

  /**
   * @section public:properties
   */
  public readonly code = "LOGGER_CONFIGURATION_ERROR";

  /**
   * @section constructor
   */
  public constructor(message: string) {
    super(message);
    this.name = "LoggerConfigurationError";
  }

  /**
   * @section static:properties
   */
  // empty

  /**
   * @section factory
   */
  // empty

  /**
   * @section private:methods
   */
  // empty

  /**
   * @section protected:methods
   */
  // empty

  /**
   * @section public:methods
   */
  // empty

  /**
   * @section static:methods
   */
  // empty
}
