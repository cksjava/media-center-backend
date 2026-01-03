import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Track extends Model {
  declare id: number;

  declare filePath: string;
  declare fileMtimeMs: number;
  declare fileSize: number;

  // dedupe key for redundant tracks
  declare dedupeKey: string;

  declare title: string;
  declare titleNorm: string;

  declare trackNo: number | null;
  declare discNo: number | null;
  declare year: number | null;
  declare durationSec: number | null;

  declare artistId: number | null;
  declare albumId: number | null;
  declare composerId: number | null;
}

Track.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    filePath: { type: DataTypes.TEXT, allowNull: false, unique: true },
    fileMtimeMs: { type: DataTypes.BIGINT, allowNull: false },
    fileSize: { type: DataTypes.BIGINT, allowNull: false },

    dedupeKey: { type: DataTypes.STRING(64), allowNull: false },

    title: { type: DataTypes.TEXT, allowNull: false },
    titleNorm: { type: DataTypes.TEXT, allowNull: false },

    trackNo: { type: DataTypes.INTEGER, allowNull: true },
    discNo: { type: DataTypes.INTEGER, allowNull: true },
    year: { type: DataTypes.INTEGER, allowNull: true },
    durationSec: { type: DataTypes.INTEGER, allowNull: true },

    artistId: { type: DataTypes.INTEGER, allowNull: true },
    albumId: { type: DataTypes.INTEGER, allowNull: true },
    composerId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: "tracks",
    indexes: [
      { fields: ["titleNorm"] },
      { fields: ["dedupeKey"] },
      { fields: ["artistId"] },
      { fields: ["albumId"] },
      { fields: ["composerId"] },
    ],
  }
);
