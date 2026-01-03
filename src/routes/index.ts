import { Router } from "express";
import { settingsRouter } from "./settings.routes.js";
import { libraryRouter } from "./library.routes.js";
import { searchRouter } from "./search.routes.js";
import { playbackRouter } from "./playback.routes.js";
import { playlistsRouter } from "./playlists.routes.js";
import { favouritesRouter } from "./favourites.routes.js";

export const apiRouter = Router();

apiRouter.use("/settings", settingsRouter);
apiRouter.use("/library", libraryRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/playback", playbackRouter);
apiRouter.use("/playlists", playlistsRouter);
apiRouter.use("/favourites", favouritesRouter);
