# countersink-depth-calc

Build a small TypeScript Node CLI (Node 18+, no runtime deps; devDeps typescript + @types/node only; tests with node:test) for countersinks / chamfered holes in machining.

Inputs: --angle <deg> included countersink angle (required, 0 < angle < 180; common 60, 82, 90, 100, 120). --hole <d> through-hole / pilot diameter in mm (optional, default 0 = sharp tip, must be >= 0). Exactly one of: --diameter <D> top countersink diameter (D > d) to compute depth = (D - d) / (2·tan(angle/2)); or --depth <h> (> 0) to compute D = d + 2·h·tan(angle/2). Also print chamfer leg length on the cone face = (D - d) / (2·sin(angle/2)). --decimals <n> 0..6 (default 4); --json; --help.
- Validate finite numbers; angle out of range, hole < 0, D <= d, depth <= 0, both or neither of diameter/depth, decimals out of range → error to stderr, exit 1.
- Readable text output by default, README with examples, MIT LICENSE (author shanguoao2026-web), .gitignore with node_modules/ dist/ *.log .npm-cache/.
- package.json "bin" must point to the built CLI. npm test must build and pass. No secrets, no personal info.

Check values (must be in tests):
- angle90 hole10 diameter20 → depth 5.0000, leg 7.0711
- angle82 hole0 diameter18 → depth 10.3533
- angle120 hole6.6 diameter12 → depth 1.5588
- angle90 hole10 depth3 → D 16.0000
- angle0, angle180, hole -1, diameter 10 with hole 10, depth 0, both diameter+depth, neither, decimals 9 → exit 1
