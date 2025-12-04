const isDev = import.meta.env.MOD !== "production";

const prefix = "[DEV]";

const log = (...args: any[]) => {
  if (isDev) {
    // use console.info to make it stand out and preserve stack trace behavior
    console.info(prefix, ...args);
  }
};

const warn = (...args: any[]) => {
  if (isDev) {
    console.warn(prefix, ...args);
  }
};

const error = (...args: any[]) => {
  if (isDev) {
    console.error(prefix, ...args);
  }
};

export default {
  log,
  warn,
  error,
};
