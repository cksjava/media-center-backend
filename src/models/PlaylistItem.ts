import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class PlaylistItem extends Model {
  declare id: number;
  declare playlistId: number;
  declare trackId: number;
  declare position: number;
}

PlaylistItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    playlistId: { type: DataTypes.INTEGER, allowNull: false },
    trackId: { type: DataTypes.INTEGER, allowNull: false },
    position: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: "playlist_items",
    indexes: [{ unique: true, fields: ["playlistId", "position"] }],
  }
);
