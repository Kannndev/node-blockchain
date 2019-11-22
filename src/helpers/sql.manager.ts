import { sequelize } from './sequelize.config';
import * as SqlConnection from 'sequelize';

export class SqlManager {

    private sequelizeConnection: SqlConnection.Sequelize;
    private params;

    constructor() {
        this.sequelizeConnection = sequelize.getSequelize();
    }

    public InitiateTransaction() {
        return this.sequelizeConnection.transaction();
    }

    public getSequelize() {
        return this.sequelizeConnection;
    }

    public ExecuteQuery(qry: string) {
        return this.sequelizeConnection.query(qry, { type: SqlConnection.QueryTypes.SELECT });
    }

    public UpdateTransaction(qry: string, vals: any, transaction): any {
        return this.sequelizeConnection.query({
            query: qry,
            values: vals
        }, { type: SqlConnection.QueryTypes.UPDATE, transaction });
    }

    public ExecuteQueryWithTransaction(qry: string, vals: any, transaction): any {
        return this.sequelizeConnection.query({
            query: qry,
            values: vals
        }, { type: SqlConnection.QueryTypes.SELECT, transaction });
    }

    public InsertTransaction(qry: string, vals: any, transaction): any {
        return this.sequelizeConnection.query({
            query: qry,
            values: vals
        }, { type: SqlConnection.QueryTypes.INSERT, transaction });
    }

    public DeleteTransaction(qry: string, vals: any, transaction): any {
        return this.sequelizeConnection.query({
            query: qry,
            values: vals
        }, { type: SqlConnection.QueryTypes.DELETE, transaction });
    }

    public BulkInsertTransaction(tableName: string, vals: any, transaction): any {
        return this.sequelizeConnection.getQueryInterface().bulkInsert(tableName, vals,
            { type: SqlConnection.QueryTypes.INSERT, transaction });
    }

    public Get(qry: string, vals: any = {}): any {
        return this.sequelizeConnection.query({
            query: qry,
            values: vals
        }, { type: SqlConnection.QueryTypes.SELECT });
    }

    public Insert(qry: string, vals: any): any {
        return this.sequelizeConnection.query({
            query: qry,
            values: vals
        }, { type: SqlConnection.QueryTypes.INSERT });
    }

    public Update(qry: string, vals: any): any {
        return this.sequelizeConnection.query({
            query: qry,
            values: vals
        }, { type: SqlConnection.QueryTypes.UPDATE });
    }

    public BulkInsert(tableName: string, vals: any): any {
        return this.sequelizeConnection.getQueryInterface().bulkInsert(tableName, vals);
    }

    public BulkUpdate(qry: string, vals: any): any {
        return this.sequelizeConnection.query({
            query: qry,
            values: vals
        }, { type: SqlConnection.QueryTypes.BULKUPDATE });
    }

    public Delete(qry: string, vals: any): any {
        return this.sequelizeConnection.query({
            query: qry,
            values: vals
        }, { type: SqlConnection.QueryTypes.DELETE });
    }

    public BulkDelete(qry: string, vals: any): any {
        return this.sequelizeConnection.query({
            query: qry,
            values: vals
        }, { type: SqlConnection.QueryTypes.BULKDELETE });
    }
}
