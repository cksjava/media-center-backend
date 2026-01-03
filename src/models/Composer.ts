import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Composer extends Model {
  declare id: number;
  declare name: string;
  declare nameNorm: string;
}

Composer.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.TEXT, allowNull: false },
    nameNorm: { type: DataTypes.TEXT, allowNull: false, unique: true },
  },
  { sequelize, tableName: "composers" }
);
