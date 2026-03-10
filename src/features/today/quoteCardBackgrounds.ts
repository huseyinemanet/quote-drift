/**
 * Calm, cozy, peaceful background images for the quote card.
 * All images: calm nature/landscape, no people — positive, relaxing vibe.
 * Complies with Unsplash guidelines: hotlink (use Unsplash URLs), attribution.
 * Each entry has a link to the photo page; in-app attribution shows "Photo by [Name] on Unsplash".
 * Offline/load failure: QuoteCard shows a solid dark fallback and hides attribution.
 * @see https://unsplash.com/documentation#guidelines
 * @see https://help.unsplash.com/en/articles/2511258-guideline-triggering-a-download
 * @see https://help.unsplash.com/en/articles/2534409-crediting-photographers
 */

const U = "https://images.unsplash.com/photo-";
const Q = "?q=80&fm=jpg&w=800&fit=max";

export type QuoteCardBackground = {
  uri: string;
  /** "Photo by [Photographer Name] on Unsplash" per Unsplash guidelines. */
  attribution: string;
  /** Link to the photo page on Unsplash (required for proper credit). */
  attributionUrl: string;
  /** Optional: bundled image used when uri fails to load (offline/error). */
  fallbackLocal?: number;
};

/** Calm, relaxing nature & landscape only — no people, positive vibe. */
export const QUOTE_CARD_BACKGROUNDS: QuoteCardBackground[] = [
  { uri: `${U}1603276730862-cbf79a742aae${Q}`, attribution: "Photo by Benjamin Voros on Unsplash", attributionUrl: "https://unsplash.com/photos/cbf79a742aae" },
  { uri: `${U}1636893580433-5ac59809bb13${Q}`, attribution: "Photo by Nathan Anderson on Unsplash", attributionUrl: "https://unsplash.com/photos/5ac59809bb13" },
  { uri: `${U}1717964134799-a98f497172a5${Q}`, attribution: "Photo by Pascal Debrunner on Unsplash", attributionUrl: "https://unsplash.com/photos/a98f497172a5" },
  { uri: `${U}1615134732800-ca7ef7a3388c${Q}`, attribution: "Photo by Willian Justen on Unsplash", attributionUrl: "https://unsplash.com/photos/ca7ef7a3388c" },
  { uri: `${U}1683041132892-0fe990b3afc3${Q}`, attribution: "Photo by Eberhard Grossgasteiger on Unsplash", attributionUrl: "https://unsplash.com/photos/0fe990b3afc3" },
  { uri: `${U}1662189793032-ccb6135a9159${Q}`, attribution: "Photo by David Marcu on Unsplash", attributionUrl: "https://unsplash.com/photos/ccb6135a9159" },
  { uri: `${U}1595885914073-3af381bbee7e${Q}`, attribution: "Photo by Ian Schneider on Unsplash", attributionUrl: "https://unsplash.com/photos/3af381bbee7e" },
  { uri: `${U}1596905738125-a6b51b1bdbb6${Q}`, attribution: "Photo by Willian Justen on Unsplash", attributionUrl: "https://unsplash.com/photos/a6b51b1bdbb6" },
  { uri: `${U}1683669446872-f956fe268beb${Q}`, attribution: "Photo by Zetong Li on Unsplash", attributionUrl: "https://unsplash.com/photos/f956fe268beb" },
  { uri: `${U}1683041133891-613b76cbebc7${Q}`, attribution: "Photo by Eberhard Grossgasteiger on Unsplash", attributionUrl: "https://unsplash.com/photos/613b76cbebc7" },
];

const N = QUOTE_CARD_BACKGROUNDS.length;

/** Returns an index 0..N-1 from a day key so the same day gets the same image. */
export function getQuoteCardBackgroundIndex(dayKey: string): number {
  let h = 0;
  for (let i = 0; i < dayKey.length; i++) {
    h = (h * 31 + dayKey.charCodeAt(i)) >>> 0;
  }
  return h % N;
}
