import fs from 'fs';
import winston from 'winston';

export const DEFAULT_KEY = 'my secret password';
export const DEFAULT_LOG_LEVEL = 'error';

export class Config {

  static host;

  static port;

  static server_host;

  static server_port;

  static key;

  static frame;

  static frame_params;

  static crypto;

  static crypto_params;

  static protocol;

  static protocol_params;

  static obfs;

  static obfs_params;

  static log_level;

  static _is_server;

  /**
   * parse config.json
   * @param json
   */
  static init(json) {
    if (typeof json !== 'object' || Array.isArray(json)) {
      throw Error('Invalid configuration file');
    }

    // host

    if (typeof json.host !== 'string' || json.host === '') {
      throw Error('\'host\' must be provided and is not empty');
    }

    this.host = json.host;

    // port

    if (!Number.isSafeInteger(json.port) || json.port <= 0) {
      throw Error('\'port\' must be a natural number');
    }

    this.port = json.port;

    // server_host & server_port

    if (typeof json.server_host === 'string') {
      if (json.server_host === '') {
        throw Error('\'server_host\' must not be empty');
      }

      if (!Number.isSafeInteger(json.server_port) || json.server_port <= 0) {
        throw Error('\'server_port\' must be a natural number');
      }
      this._is_server = false;
    } else {
      this._is_server = true;
    }

    this.server_host = json.server_host;
    this.server_port = json.server_port;

    // key

    if (typeof json.key !== 'string') {
      throw Error('\'key\' must be a string');
    }

    if (json.key === '') {
      throw Error('\'key\' cannot be empty');
    }

    if (json.key === DEFAULT_KEY) {
      throw Error(`'key' cannot be '${DEFAULT_KEY}'`);
    }

    this.key = json.key;

    // frame & frame_params

    if (typeof json.frame !== 'string') {
      throw Error('\'frame\' must be a string');
    }

    if (typeof json.frame_params !== 'string') {
      throw Error('\'frame_params\' must be a string');
    }

    this.frame = json.frame || 'origin';
    this.frame_params = json.frame_params;

    // crypto & crypto_params

    if (typeof json.crypto !== 'string') {
      throw Error('\'crypto\' must be a string');
    }

    if (typeof json.crypto_params !== 'string') {
      throw Error('\'crypto_params\' must be a string');
    }

    this.crypto = json.crypto || 'none';
    this.crypto_params = json.crypto_params;

    // protocol & protocol_params

    if (typeof json.protocol !== 'string') {
      throw Error('\'protocol\' must be a string');
    }

    if (typeof json.protocol_params !== 'string') {
      throw Error('\'protocol_params\' must be a string');
    }

    this.protocol = json.protocol || 'aead';
    this.protocol_params = json.protocol_params;

    // obfs & obfs_params

    if (typeof json.obfs !== 'string') {
      throw Error('\'obfs\' must be a string');
    }

    if (typeof json.obfs_params !== 'string') {
      throw Error('\'obfs_params\' must be a string');
    }

    this.obfs = json.obfs || 'none';
    this.obfs_params = json.obfs_params;

    // globals
    this.setGlobals();

    // log_level
    this.setUpLogger(json.log_level || DEFAULT_LOG_LEVEL);
  }

  /**
   * make global constants
   */
  static setGlobals() {
    global.__IS_SERVER__ = this._is_server;
    global.__IS_CLIENT__ = !this._is_server;

    global.__LOCAL_HOST__ = this.host;
    global.__LOCAL_PORT__ = this.port;

    global.__SERVER_HOST__ = this.server_host;
    global.__SERVER_PORT__ = this.server_port;

    global.__KEY__ = this.key;

    global.__FRAME__ = this.frame;
    global.__FRAME_PARAMS__ = this.frame_params;

    global.__CRYPTO__ = this.crypto;
    global.__CRYPTO_PARAMS__ = this.crypto_params;

    global.__PROTOCOL__ = this.protocol;
    global.__PROTOCOL_PARAMS__ = this.protocol_params;

    global.__OBFS__ = this.obfs;
    global.__OBFS_PARAMS__ = this.obfs_params;

    global.__LOG_LEVEL__ = this.log_level;
  }

  /**
   * configure logger
   * @param level
   */
  static setUpLogger(level = '') {
    // create logs directory
    try {
      fs.lstatSync('logs');
    } catch (err) {
      if (err.code === 'ENOENT') {
        fs.mkdirSync('logs');
      }
    }

    // determine log level
    let _level = level.toLowerCase();
    switch (_level) {
      case 'silly':
      case 'debug':
      case 'verbose':
      case 'info':
      case 'warn':
      case 'error':
        break;
      default:
        _level = DEFAULT_LOG_LEVEL;
        break;
    }

    // configure transports
    winston.configure({
      level: _level,
      transports: [
        new (winston.transports.Console)({
          colorize: true,
          prettyPrint: true
        }),
        new (winston.transports.File)({
          filename: `logs/blinksocks-${__IS_CLIENT__ ? 'client' : 'server'}.log`,
          maxsize: 2 * 1024 * 1024, // 2MB
          silent: ['test', 'debug'].includes(process.env.NODE_ENV)
        })
      ]
    });

    this.log_level = _level;
  }

  /**
   * return an object which describe the configuration
   * @returns {{}}
   */
  static abstract() {
    const keys = Object.getOwnPropertyNames(this)
      .filter(
        (key) => ![
          'length', 'name', 'prototype',
          'init', 'setGlobals', 'setUpLogger', 'abstract',
          '_is_server'
        ].includes(key) && this[key] !== undefined
      );
    const json = {};
    for (const key of keys) {
      json[key] = this[key];
    }
    return json;
  }

}
