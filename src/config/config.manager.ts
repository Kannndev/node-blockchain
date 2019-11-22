import { AppSetting } from './app.setting';
import { Environment } from './environment';
import { DevConfig } from './config.dev';

export class ConfigManager {
    public Config;
    constructor() {
        switch (AppSetting.Env) {
            case Environment.Dev:
                this.Config = DevConfig;
                break;
            default:
                this.Config = DevConfig;
        }
    }
}
