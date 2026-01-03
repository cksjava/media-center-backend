import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Album extends Model {
  declare id: number;
  declare title: string;
  declare titleNorm: string;
  declare coverPath: string | null; // relative path under /covers
  declare albumArtistId: number | null;
}

Album.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.TEXT, allowNull: false },
    titleNorm: { type: DataTypes.TEXT, allowNull: false },
    coverPath: { type: DataTypes.TEXT, allowNull: true },
    albumArtistId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: "albums",
    indexes: [{ unique: true, fields: ["titleNorm", "albumArtistId"] }],
  }
);
