import { AppSetting } from '../config/app.setting';
import * as SqlConnection from 'sequelize';
export class SequelizeConfig {
    private sequelize: SqlConnection.Sequelize;

    public setConnection() {
        const config = AppSetting.getConfig();
        const dbInfo = config.DBConnections['default'];
        this.sequelize = new SqlConnection.Sequelize(dbInfo.database, dbInfo.user, dbInfo.password, {
            host: dbInfo.host,
            dialect: dbInfo.dbType,
            logging: false,
            pool: {
                max:  10,
                min:  0
            }
        });
        this.ping(dbInfo);
    }

    private ping(dbInfo) {
        this.sequelize
            .authenticate()
            .then(() => {
                console.log(`Connection has been established to the database: ${dbInfo.host} - ${dbInfo.database} successfully.`);
            })
            .catch((err) => {
                console.log(`Unable to connect to the database: : ${dbInfo.host} - ${dbInfo.database}`, err);
            });
    }

    public getSequelize() {
        return this.sequelize;
    }

}

export const sequelize = new SequelizeConfig();
