import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class ScanState extends Model {
  declare id: number;
  declare root: string;
  declare lastScanAt: Date | null;
}

ScanState.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    root: { type: DataTypes.TEXT, allowNull: false, unique: true },
    lastScanAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: "scan_states" }
);
