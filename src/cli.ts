#!/usr/bin/env node

const help = `Usage: countersink-depth-calc --angle <deg> [--hole <mm>] (--diameter <mm> | --depth <mm>) [options]

Calculate countersink geometry. All lengths are in millimeters.

  --angle <deg>     Included angle, greater than 0 and less than 180 (required)
  --hole <mm>       Pilot diameter, at least 0 (default: 0, sharp tip)
  --diameter <mm>   Top diameter, greater than the pilot diameter
  --depth <mm>      Axial depth, greater than 0
  --decimals <n>    Display precision, integer 0 through 6 (default: 4)
  --json            Print numeric results as JSON
  --help            Show this help
`;

function main(args: string[]): void {
  const values = new Map<string, number>();
  const flags = new Set<string>();
  const numericOptions = new Set(['--angle', '--hole', '--diameter', '--depth', '--decimals']);
  for (let i = 0; i < args.length; i++) {
    const option = args[i];
    if (values.has(option) || flags.has(option)) throw new Error(`Duplicate option: ${option}`);
    if (option === '--help' || option === '--json') {
      flags.add(option);
    } else if (numericOptions.has(option)) {
      const raw = args[++i];
      if (raw === undefined || raw.trim() === '' || raw.startsWith('--')) {
        throw new Error(`Missing numeric value for ${option}`);
      }
      const value = Number(raw);
      if (!Number.isFinite(value)) throw new Error(`${option} must be a finite number`);
      values.set(option, value);
    } else {
      throw new Error(`Unknown argument: ${option}`);
    }
  }
  if (flags.has('--help')) {
    process.stdout.write(help);
    return;
  }
  const angle = values.get('--angle');
  const hole = values.get('--hole') ?? 0;
  const decimals = values.get('--decimals') ?? 4;
  if (angle === undefined || angle <= 0 || angle >= 180) throw new Error('--angle is required and must be greater than 0 and less than 180');
  if (hole < 0) throw new Error('--hole must be at least 0');
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 6) throw new Error('--decimals must be an integer from 0 to 6');
  if (values.has('--diameter') === values.has('--depth')) throw new Error('Provide exactly one of --diameter or --depth');

  const halfAngle = angle * Math.PI / 360;
  let diameter = values.get('--diameter');
  let depth = values.get('--depth');
  if (diameter !== undefined) {
    if (diameter <= hole) throw new Error('--diameter must be greater than --hole');
    depth = (diameter - hole) / (2 * Math.tan(halfAngle));
  } else {
    if (depth === undefined || depth <= 0) throw new Error('--depth must be greater than 0');
    diameter = hole + 2 * depth * Math.tan(halfAngle);
  }
  const leg = (diameter - hole) / (2 * Math.sin(halfAngle));
  if (![diameter, depth, leg].every(value => value !== undefined && Number.isFinite(value) && value > 0) || diameter <= hole) {
    throw new Error('Geometry exceeds numeric precision or range');
  }
  const rounded = (value: number): number => Number(value.toFixed(decimals));
  if (flags.has('--json')) {
    console.log(JSON.stringify({ angle: rounded(angle), hole: rounded(hole), diameter: rounded(diameter), depth: rounded(depth!), leg: rounded(leg) }));
  } else {
    console.log(`Included angle: ${angle.toFixed(decimals)} deg\nPilot diameter: ${hole.toFixed(decimals)} mm\nCountersink diameter: ${diameter.toFixed(decimals)} mm\nDepth: ${depth!.toFixed(decimals)} mm\nChamfer leg length: ${leg.toFixed(decimals)} mm`);
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
