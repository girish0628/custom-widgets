// npm install proj4 install inside /server before running this code

import proj4 from "proj4";
import projectionsData from "../json/projections_list.json";

/**
 * Register custom coordinate systems.
 * Entries from projections_list.json (Esri WKT) are loaded first.
 * Hardcoded proj4-string entries follow and will overwrite any duplicate keys.
 */
export function registerCustomProjections() {

  // ── Load from JSON (Esri WKT strings) ─────────────────────────────────────
  // Esri WKT uses single quotes; proj4js WKT parser requires double quotes
  Object.entries(projectionsData.projects).forEach(([name, wkt]) => {
    proj4.defs(name, wkt.replace(/'/g, '"'));
  });

  // ── Hardcoded proj4-string definitions ────────────────────────────────────

  // YAM94 — Transverse Mercator, lon_0=120, GRS80
  proj4.defs("YAM94",
    "+proj=tmerc +lat_0=0 +lon_0=120 +k=0.9996 " +
    "+x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs"
  );

  // HBI94 — Transverse Mercator, lon_0=121, GRS80
  proj4.defs("HBI94",
    "+proj=tmerc +lat_0=0 +lon_0=121 +k=1 " +
    "+x_0=400000 +y_0=0 +ellps=GRS80 +units=m +no_defs"
  );

  // GDA94 (EPSG:4283) — geographic, GRS80 ellipsoid
  proj4.defs("GCS_GDA_1994",
    "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs"
  );

  // WGS84 (EPSG:4326) — geographic, WGS84 ellipsoid
  proj4.defs("GCS_WGS_1984",
    "+proj=longlat +datum=WGS84 +no_defs"
  );

}
