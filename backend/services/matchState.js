const Redis = require('ioredis')
const config = require('../config')

class InMemoryStore {
  constructor() {
    this.store = new Map()
  }

  async set(key, value) {
    this.store.set(key, value)
  }

  async get(key) {
    return this.store.has(key) ? this.store.get(key) : null
  }

  async del(key) {
    this.store.delete(key)
  }

  on() {
    // no-op for compatibility
  }

  quit() {
    // no-op
  }
}

const redis = config.isTest ? new InMemoryStore() : new Redis(config.redisUrl)

if (!config.isTest) {
  redis.on('connect', () => console.log('[Redis] Connected'))
  redis.on('error', (err) => console.error('[Redis] Error:', err.message))
}

/**
 * Build and cache the live match state in Redis for sub-500ms delivery.
 */
async function setMatchState(matchId, state) {
  await redis.set(`match:${matchId}:state`, JSON.stringify(state), 'EX', 86400) // 24h TTL
}

async function getMatchState(matchId) {
  const raw = await redis.get(`match:${matchId}:state`)
  return raw ? JSON.parse(raw) : null
}

async function deleteMatchState(matchId) {
  await redis.del(`match:${matchId}:state`)
}

/**
 * Build the full live state object from DB data for caching and WebSocket broadcast.
 */
function buildMatchState(match, innings, batsmen, bowler, recentBalls) {
  const currentInnings = innings
  if (!currentInnings) return null

  const onStrike = batsmen.find(b => b.status === 'BATTING' && b.battingPosition % 2 !== 0) || batsmen[0]
  const offStrike = batsmen.find(b => b !== onStrike && b.status === 'BATTING') || batsmen[1]

  const totalBalls = Math.floor(currentInnings.totalOvers) * 6 + Math.round((currentInnings.totalOvers % 1) * 10)
  const crr = totalBalls > 0 ? (currentInnings.totalRuns / (totalBalls / 6)).toFixed(2) : '0.00'

  let rrr = null
  if (currentInnings.target && currentInnings.inningsNumber >= 2) {
    const runsNeeded = currentInnings.target - currentInnings.totalRuns
    const ballsRemaining = (match.oversPerInnings * 6) - totalBalls
    rrr = ballsRemaining > 0 ? (runsNeeded / (ballsRemaining / 6)).toFixed(2) : '0.00'
  }

  return {
    match_id: match.id,
    match_state: match.status,
    batting_team: {
      id: currentInnings.battingTeamId,
      abbr: currentInnings.battingTeam?.shortName,
      name: currentInnings.battingTeam?.name,
      score: currentInnings.totalRuns,
      wickets: currentInnings.totalWickets,
      overs: currentInnings.totalOvers,
      extras: currentInnings.totalExtras,
      color: currentInnings.battingTeam?.color
    },
    bowling_team: {
      id: currentInnings.bowlingTeamId,
      abbr: currentInnings.bowlingTeam?.shortName,
      name: currentInnings.bowlingTeam?.name,
      color: currentInnings.bowlingTeam?.color
    },
    crr: parseFloat(crr),
    rrr: rrr ? parseFloat(rrr) : null,
    target: currentInnings.target,
    current_strikers: batsmen.filter(b => b.status === 'BATTING').map(b => ({
      id: b.playerId,
      name: `${b.player?.firstName} ${b.player?.lastName}`,
      runs: b.runs,
      balls: b.ballsFaced,
      fours: b.fours,
      sixes: b.sixes,
      strike_rate: b.strikeRate,
      on_strike: b === onStrike
    })),
    current_bowler: bowler ? {
      id: bowler.playerId,
      name: `${bowler.player?.firstName} ${bowler.player?.lastName}`,
      overs: bowler.oversBowled,
      runs_conceded: bowler.runsConceded,
      wickets: bowler.wickets,
      maidens: bowler.maidens,
      economy: bowler.economy
    } : null,
    recent_balls: (recentBalls || []).map(b => ({
      runs: b.runsScored,
      extras_type: b.extrasType,
      extras_runs: b.extrasRuns,
      is_wicket: b.isWicket
    })),
    innings_number: currentInnings.inningsNumber,
    active_graphic: 'SCOREBUG'
  }
}

module.exports = { redis, setMatchState, getMatchState, deleteMatchState, buildMatchState }
