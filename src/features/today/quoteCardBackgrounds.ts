/**
 * Calm, cozy, peaceful background images for the quote card.
 * All images: calm nature/landscape, no people — positive, relaxing vibe.
 * Complies with Unsplash guidelines: hotlink (use Unsplash URLs), attribution.
 * For production: add exact "Photo by [Full Name] on Unsplash" per image;
 * trigger download via your backend (key must stay server-side).
 * Offline/load failure: QuoteCard shows a solid dark fallback and hides attribution.
 * Optional: set fallbackLocal (e.g. require("@/assets/quote-fallback.png")) to show
 * a bundled image when the network image fails.
 * @see https://unsplash.com/documentation#guidelines
 * @see https://help.unsplash.com/en/articles/2511258-guideline-triggering-a-download
 */

const U = "https://images.unsplash.com/photo-";
const Q = "?q=80&fm=jpg&w=800&fit=max";

export type QuoteCardBackground = {
  uri: string;
  /** e.g. "Photo by Jane Doe on Unsplash" — required for production. */
  attribution: string;
  /** Link to photo page or https://unsplash.com */
  attributionUrl: string;
  /** Optional: bundled image used when uri fails to load (offline/error). e.g. require("@/assets/quote-fallback.png") */
  fallbackLocal?: number;
};

/** Calm, relaxing nature & landscape only — no people, positive vibe. */
export const QUOTE_CARD_BACKGROUNDS: QuoteCardBackground[] = [
  { uri: `${U}1603276730862-cbf79a742aae${Q}`, attribution: "Photo on Unsplash", attributionUrl: "https://unsplash.com" },
  { uri: `${U}1636893580433-5ac59809bb13${Q}`, attribution: "Photo on Unsplash", attributionUrl: "https://unsplash.com" },
  { uri: `${U}1717964134799-a98f497172a5${Q}`, attribution: "Photo on Unsplash", attributionUrl: "https://unsplash.com" },
  { uri: `${U}1615134732800-ca7ef7a3388c${Q}`, attribution: "Photo on Unsplash", attributionUrl: "https://unsplash.com" },
  { uri: `${U}1683041132892-0fe990b3afc3${Q}`, attribution: "Photo on Unsplash", attributionUrl: "https://unsplash.com" },
  { uri: `${U}1662189793032-ccb6135a9159${Q}`, attribution: "Photo on Unsplash", attributionUrl: "https://unsplash.com" },
  { uri: `${U}1595885914073-3af381bbee7e${Q}`, attribution: "Photo on Unsplash", attributionUrl: "https://unsplash.com" },
  { uri: `${U}1596905738125-a6b51b1bdbb6${Q}`, attribution: "Photo on Unsplash", attributionUrl: "https://unsplash.com" },
  { uri: `${U}1683669446872-f956fe268beb${Q}`, attribution: "Photo on Unsplash", attributionUrl: "https://unsplash.com" },
  { uri: `${U}1683041133891-613b76cbebc7${Q}`, attribution: "Photo on Unsplash", attributionUrl: "https://unsplash.com" },
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
