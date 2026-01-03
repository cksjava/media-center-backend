import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Playlist extends Model {
  declare id: number;
  declare name: string;
}

Playlist.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.TEXT, allowNull: false, unique: true },
  },
  { sequelize, tableName: "playlists" }
);
