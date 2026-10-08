// Build-time OSS PR snapshot fetcher.
//
// Usage:
//   npm run oss:fetch          # refresh public/oss-prs.json from GitHub
//   GITHUB_TOKEN=... npm run oss:fetch   # higher rate limit (build machine only)
//
// Reads the four canonical PRs from the GitHub REST API and writes them to
// public/oss-prs.json. The token (if any) lives only in the build
// environment — it is never embedded in client code or public assets.
//
// Failure policy: never fail the build. A per-PR failure reuses the previous
// snapshot entry; a total failure keeps the previous file untouched.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = join(root, 'public', 'oss-prs.json')

const PRS = [
  { id: 'agentj-locale-keyword', owner: 'anirudhnshandilya', repo: 'agentj', number: 24 },
  { id: 'quarkus-artifact-metadata', owner: 'quarkusio', repo: 'quarkus', number: 57221 },
  { id: 'kestra-plugin-serdes', owner: 'kestra-io', repo: 'plugin-serdes', number: 423 },
  { id: 'mcp-java-testkit', owner: 'senor14', repo: 'mcp-java-testkit', number: 25 },
]

function loadPrevious() {
  if (!existsSync(outFile)) return null
  try {
    return JSON.parse(readFileSync(outFile, 'utf8'))
  } catch {
    return null
  }
}

async function fetchPr(entry, headers) {
  const url = `https://api.github.com/repos/${entry.owner}/${entry.repo}/pulls/${entry.number}`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${url}`)
  const pr = await res.json()
  return {
    contributionId: entry.id,
    repository: `${entry.owner}/${entry.repo}`,
    number: entry.number,
    title: pr.title,
    state: pr.state,
    merged: pr.merged === true,
    created_at: pr.created_at,
    merged_at: pr.merged_at ?? null,
    // Canonical PR URL straight from GitHub — never constructed via /issues/.
    html_url: pr.html_url,
  }
}

const headers = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'soubhagya-dev-oss-snapshot',
}
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
}

const previous = loadPrevious()
const previousById = new Map((previous?.prs ?? []).map(pr => [pr.contributionId, pr]))

const prs = []
let failures = 0
for (const entry of PRS) {
  try {
    prs.push(await fetchPr(entry, headers))
  } catch (error) {
    failures += 1
    const reuse = previousById.get(entry.id)
    if (reuse) {
      console.warn(`[oss:fetch] ${entry.id}: ${error.message} — reusing previous entry`)
      prs.push(reuse)
    } else {
      console.warn(`[oss:fetch] ${entry.id}: ${error.message} — no previous entry, skipping`)
    }
  }
}

if (prs.length === 0) {
  console.warn('[oss:fetch] all PR fetches failed; leaving previous snapshot untouched')
  process.exit(0)
}

writeFileSync(outFile, `${JSON.stringify({ fetchedAt: new Date().toISOString(), prs }, null, 2)}\n`)
console.log(`[oss:fetch] wrote ${prs.length} PRs to public/oss-prs.json${failures ? ` (${failures} reused from previous snapshot)` : ''}`)
