import { Column, DataType, Index, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table
export default class User extends Model {
    @PrimaryKey
    @Index
    @Column(DataType.TEXT)
    mxid!: string;

    @Column(DataType.TEXT)
    public_user_room!: string;
}