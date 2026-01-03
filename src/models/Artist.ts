import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Artist extends Model {
  declare id: number;
  declare name: string;
  declare nameNorm: string;
}

Artist.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.TEXT, allowNull: false },
    nameNorm: { type: DataTypes.TEXT, allowNull: false, unique: true },
  },
  { sequelize, tableName: "artists" }
);
