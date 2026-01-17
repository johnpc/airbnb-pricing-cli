const timestamp = () => `[${new Date().toISOString()}]`;

export const log = (...args: unknown[]) => console.log(timestamp(), ...args);
export const error = (...args: unknown[]) =>
  console.error(timestamp(), ...args);
export const warn = (...args: unknown[]) => console.warn(timestamp(), ...args);
