import { sequelize } from "../config/db.js";
import { Setting } from "./Setting.js";
import { ScanState } from "./ScanState.js";
import { Artist } from "./Artist.js";
import { Composer } from "./Composer.js";
import { Album } from "./Album.js";
import { Track } from "./Track.js";
import { Playlist } from "./Playlist.js";
import { PlaylistItem } from "./PlaylistItem.js";
import { Favorite } from "./Favorite.js";

Album.belongsTo(Artist, { as: "albumArtist", foreignKey: "albumArtistId" });

Track.belongsTo(Artist, { as: "artist", foreignKey: "artistId" });
Track.belongsTo(Album, { as: "album", foreignKey: "albumId" });
Track.belongsTo(Composer, { as: "composer", foreignKey: "composerId" });

PlaylistItem.belongsTo(Playlist, { as: "playlist", foreignKey: "playlistId" });
PlaylistItem.belongsTo(Track, { as: "track", foreignKey: "trackId" });
Playlist.hasMany(PlaylistItem, { as: "items", foreignKey: "playlistId" });

Favorite.belongsTo(Track, { as: "track", foreignKey: "trackId" });

export {
  sequelize,
  Setting,
  ScanState,
  Artist,
  Composer,
  Album,
  Track,
  Playlist,
  PlaylistItem,
  Favorite,
};

export async function syncDb() {
  await sequelize.sync();
}
