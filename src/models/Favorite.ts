import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Favorite extends Model {
  declare id: number;
  declare trackId: number;
  declare createdAt: Date;
}

Favorite.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    trackId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  },
  { sequelize, tableName: "favorites", timestamps: true, updatedAt: false }
);
