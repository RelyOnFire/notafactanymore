# Magnetic striping visual replacement

Replaces the site-authored geomagnetic-reversal explainer with the public-domain
USGS-derived Wikimedia Commons vector diagram:

https://commons.wikimedia.org/wiki/File:Oceanic.Stripe.Magnetic.Anomalies.Scheme.svg

The source SVG is nominally 1052 × 744 and remains vector-sharp at any rendered size.

After unzipping into the repository root, run:

    bash scripts/fetch-magnetic-striping-commons-svg.sh
    npm run build

The fetch script downloads the exact Commons SVG into the path referenced by the
English and German cards, then removes the two superseded local magnetic explainer SVGs.
