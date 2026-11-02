# countersink-depth-calc

A TypeScript CLI for countersinks and chamfered holes. Requires Node.js 18 or later; there are no runtime dependencies.

## Setup

```sh
npm install
npm run build
node dist/cli.js --help
```

Optionally run `npm link` after building to use `countersink-depth-calc` directly.

## Examples

```sh
node dist/cli.js --angle 90 --hole 10 --diameter 20
# Included angle: 90.0000 deg
# Pilot diameter: 10.0000 mm
# Countersink diameter: 20.0000 mm
# Depth: 5.0000 mm
# Chamfer leg length: 7.0711 mm

node dist/cli.js --angle 90 --hole 10 --depth 3 --json
# {"angle":90,"hole":10,"diameter":16,"depth":3,"leg":4.2426}

node dist/cli.js --angle 82 --diameter 18 --decimals 4
# Depth: 10.3533 mm (among the other geometry results)
```

`--angle` is the included countersink angle in degrees, strictly between 0 and 180. Common angles include 60, 82, 90, 100, and 120. `--hole` is the pilot diameter in mm, defaults to 0 (a sharp tip), and cannot be negative. Supply exactly one of `--diameter` (top diameter greater than the pilot diameter) or `--depth` (positive axial depth).

`--decimals` accepts integers from 0 through 6, defaulting to 4. Text displays fixed decimal places. JSON contains numeric fields `angle`, `hole`, `diameter`, `depth`, and `leg`, rounded to the requested precision; trailing zeroes are omitted. All lengths are in mm. `--help` prints usage. Invalid arguments produce an error on stderr and exit status 1. Unknown or repeated options are rejected. Calculations outside finite numeric range or representable geometry are also rejected.

For included angle θ, pilot diameter d, top diameter D, and axial depth h:

- h = (D − d) / (2 tan(θ/2))
- D = d + 2 h tan(θ/2)
- Cone-face chamfer leg length = (D − d) / (2 sin(θ/2))

The leg is the sloping distance from the pilot edge to the top edge along the cone face. Calculations use full floating-point precision before output rounding.

## Tests

```sh
npm test
```

This builds the CLI and runs the integration tests with Node's built-in test runner.

## License

MIT © shanguoao2026-web
