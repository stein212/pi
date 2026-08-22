#!/usr/bin/env bash
#
# Build, pack, and install the local pi build from the current branch.
#
# Usage:
#   ./scripts/install-local.sh                 # full default flow
#   ./scripts/install-local.sh --skip-check    # skip npm run check (needed if check fails pre-existing)
#   ./scripts/install-local.sh --skip-test     # skip ./test.sh
#   ./scripts/install-local.sh --dry-run       # print commands without running
#
# Behavior:
#   1. Runs scripts/local-release.mjs --skip-install to build+pack all publishable packages.
#   2. Copies the tarballs that differ from the released version into ~/pi-tarballs/.
#   3. Rewrites the pnpm global package.json file: paths to the new tarballs.
#   4. Runs pnpm -g install and verifies `pi --version`.
#
# The global install is driven by pnpm's global package.json. Only
# @earendil-works/pi-coding-agent and @earendil-works/pi-tui are installed locally;
# the remaining pi packages are unchanged from the release and resolve from npm.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARBALL_DIR="$HOME/pi-tarballs"
PNPM_GLOBAL_JSON="${PNPM_GLOBAL_JSON:-}"

# Packages that carry local changes and therefore need the local tarball.
# Compare with: git diff --stat v0.84.2 HEAD -- packages/<name>/
LOCAL_PACKAGES=(
	"earendil-works-pi-coding-agent"
	"earendil-works-pi-tui"
)

SKIP_CHECK=0
SKIP_TEST=0
DRY_RUN=0

for arg in "$@"; do
	case "$arg" in
		--skip-check) SKIP_CHECK=1 ;;
		--skip-test) SKIP_TEST=1 ;;
		--dry-run) DRY_RUN=1 ;;
		*) echo "Unknown option: $arg" >&2; exit 1 ;;
	esac
done

run() {
	if [[ "$DRY_RUN" -eq 1 ]]; then
		printf '+ %s\n' "$*"
		return 0
	fi
	"$@"
}

if [[ ! -f "$REPO_ROOT/package.json" ]] || ! grep -q '"name": "pi-monorepo"' "$REPO_ROOT/package.json"; then
	echo "Run this script from the repository root: $REPO_ROOT" >&2
	exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
	echo "pnpm is required to install the local pi build." >&2
	exit 1
fi

if [[ -z "$PNPM_GLOBAL_JSON" ]]; then
	PNPM_GLOBAL_ROOT="$(pnpm root -g)"
	PNPM_GLOBAL_JSON="$(dirname "$PNPM_GLOBAL_ROOT")/package.json"
fi

VERSION="$(node -p "require('$REPO_ROOT/packages/coding-agent/package.json').version")"
echo "Local pi version: $VERSION"

# 1. Build and pack everything.
echo "Building and packing packages..."
RELEASE_ARGS=(--out "/tmp/pi-local-release-$$" --force --skip-install)
[[ "$SKIP_CHECK" -eq 1 ]] && RELEASE_ARGS+=(--skip-check)
[[ "$SKIP_TEST" -eq 1 ]] && RELEASE_ARGS+=(--skip-test)
run node "$REPO_ROOT/scripts/local-release.mjs" "${RELEASE_ARGS[@]}"

OUT_DIR="/tmp/pi-local-release-$$/tarballs"

# 2. Copy changed tarballs into the stable location.
run mkdir -p "$TARBALL_DIR"
for name in "${LOCAL_PACKAGES[@]}"; do
	src="$OUT_DIR/$name-$VERSION.tgz"
	if [[ "$DRY_RUN" -eq 0 && ! -f "$src" ]]; then
		echo "Missing tarball: $src" >&2
		exit 1
	fi
	run cp "$src" "$TARBALL_DIR/"
done

echo "Tarballs in $TARBALL_DIR:"
run ls -la "$TARBALL_DIR"

# 3. Rewrite the pnpm global package.json file: paths.
if [[ ! -f "$PNPM_GLOBAL_JSON" ]]; then
	echo "Global pnpm package.json not found: $PNPM_GLOBAL_JSON" >&2
	echo "Set PNPM_GLOBAL_JSON to the correct path." >&2
	exit 1
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
	echo "Would rewrite $PNPM_GLOBAL_JSON for version $VERSION"
else
	node - "$PNPM_GLOBAL_JSON" "$TARBALL_DIR" "$VERSION" <<'EOF'
const [globalJson, tarballDir, version] = process.argv.slice(2);
const fs = require("node:fs");
const pkg = JSON.parse(fs.readFileSync(globalJson, "utf8"));
const localPackages = new Map([
	["@earendil-works/pi-coding-agent", "earendil-works-pi-coding-agent"],
	["@earendil-works/pi-tui", "earendil-works-pi-tui"],
]);
let modified = false;
for (const [dep, name] of localPackages) {
	if (!(dep in (pkg.dependencies || {}))) continue;
	const path = `${tarballDir}/${name}-${version}.tgz`;
	pkg.dependencies[dep] = `file:${path}`;
	modified = true;
}
if (!modified) {
	console.error("No local pi dependencies found in global package.json; nothing to rewrite.");
	process.exit(1);
}
fs.writeFileSync(globalJson, `${JSON.stringify(pkg, null, "\t")}\n`);
console.log(`Rewrote ${globalJson} -> version ${version}`);
EOF
fi

# 4. Reinstall globally and verify.
echo "Running pnpm -g install..."
run pnpm -g install
run pi --version

echo
echo "Done. pi is now $VERSION."
