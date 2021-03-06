"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const got_1 = __importDefault(require("got"));
/*
 * IMPORTANT NOTICE
 *
 * One thing you need to take care of is, that you never ever ever import anything directly from the
 *  "homebridge" module (or the "hap-nodejs" module).
 * The above import block may seem like, that we do exactly that, but actually those imports are only used for types and interfaces
 * and will disappear once the code is compiled to Javascript.
 * In fact you can check that by running `npm run build` and opening the compiled Javascript file in the `dist` folder.
 * You will notice that the file does not contain a `... = require("homebridge");` statement anywhere in the code.
 *
 * The contents of the above import statement MUST ONLY be used for type annotation or accessing things like CONST ENUMS,
 * which is a special case as they get replaced by the actual value and do not remain as a reference in the compiled code.
 * Meaning normal enums are bad, const enums can be used.
 *
 * You MUST NOT import anything else which remains as a reference in the code, as this will result in
 * a `... = require("homebridge");` to be compiled into the final Javascript code.
 * This typically leads to unexpected behavior at runtime, as in many cases it won't be able to find the module
 * or will import another instance of homebridge causing collisions.
 *
 * To mitigate this the {@link API | Homebridge API} exposes the whole suite of HAP-NodeJS inside the `hap` property
 * of the api object, which can be acquired for example in the initializer function. This reference can be stored
 * like this for example and used to access all exported variables and classes from HAP-NodeJS.
 */
let hap;
/*
 * Initializer function called when the plugin is loaded.
 */
const settings_1 = require("./settings");
class AnasoNatureRemoCloudIR {
    constructor(log, config, api) {
        this.switchState = false;
        this.log = log;
        this.name = config.name;
        this.accessToken = typeof config.accessToken === 'string' ? config.accessToken : '';
        this.onSignalId = typeof config.onSignalId === 'string' ? config.onSignalId : '';
        this.offSignalId = typeof config.offSignalId === 'string' ? config.offSignalId : '';
        this.switchService = new hap.Service.Switch(this.name);
        this.switchService.getCharacteristic(hap.Characteristic.On)
            .on("get" /* GET */, (callback) => {
            log.info('Current state of the switch was returned: ' + (this.switchState ? 'ON' : 'OFF'));
            callback(undefined, this.switchState);
        })
            .on("set" /* SET */, (value, callback) => {
            if (this.switchState === value) {
                log.info('Keep state: ' + (this.switchState ? 'ON' : 'OFF') + ' No send signal');
                callback();
            }
            else {
                this.switchState = value;
                // log.info('Switch state was set to: ' + (this.switchState ? 'ON' : 'OFF'));
                const ENDPOINTT_TO_POST = this.switchState
                    ? 'https://api.nature.global/1/signals/' + this.onSignalId + '/send'
                    : 'https://api.nature.global/1/signals/' + this.offSignalId + '/send';
                (async () => {
                    try {
                        const body = await got_1.default.post(ENDPOINTT_TO_POST, {
                            headers: {
                                'Authorization': `Bearer ${this.accessToken}`,
                            },
                        });
                        callback();
                    }
                    catch (e) {
                        log.info(`StateTo: ${!this.switchState}   ERROR: \n${JSON.stringify(e)}`);
                        this.switchService.updateCharacteristic(hap.Characteristic.On, !this.switchState);
                        callback(e);
                    }
                })();
            }
        });
        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, 'Custom Manufacturer')
            .setCharacteristic(hap.Characteristic.Model, 'Custom Model');
        log.info('Switch finished initializing!');
    }
    /*
  * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
  * Typical this only ever happens at the pairing process.
  */
    identify() {
        this.log('Identify!');
    }
    /*
  * This method is called directly after creation of this instance.
  * It should return all services which should be added to the accessory.
  */
    getServices() {
        return [
            this.informationService,
            this.switchService,
        ];
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerAccessory(settings_1.PLATFORM_NAME, AnasoNatureRemoCloudIR);
};
//# sourceMappingURL=index.js.map