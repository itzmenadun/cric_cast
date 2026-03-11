const { getMatchState } = require('../services/matchState')

async function vmixRoutes(fastify, options) {
  
  /**
   * GET /api/vmix/:matchId
   * Returns a deeply-flattened JSON object optimized for vMix Data Sources Manager.
   * vMix struggles with nested arrays (like 'current_strikers' or 'bowlers'), so this
   * endpoint pre-flattens everything into top-level keys.
   */
  fastify.get('/:matchId', async (request, reply) => {
    const { matchId } = request.params
    const matchState = await getMatchState(matchId)

    if (!matchState) {
      return reply.code(404).send({ error: "Match state not found" })
    }

    try {
      const vmixData = {
        // Match Info
        status: matchState.status,
        crr: matchState.crr,
        req_rr: matchState.req_rr || "",
        target: matchState.target || "",
        
        // Batting Team
        batting_team_name: matchState.batting_team.name,
        batting_team_abbr: matchState.batting_team.abbr,
        batting_team_score: matchState.batting_team.score,
        batting_team_wickets: matchState.batting_team.wickets,
        batting_team_overs: matchState.batting_team.overs,
        batting_team_extras: matchState.batting_team.extras,

        // Bowling Team 
        bowling_team_name: matchState.bowling_team?.name || "",
        bowling_team_abbr: matchState.bowling_team?.abbr || "",

        // Striker 1 (On Strike)
        striker1_name: "",
        striker1_runs: "",
        striker1_balls: "",
        striker1_4s: "",
        striker1_6s: "",
        striker1_sr: "",
        
        // Striker 2 (Off Strike)
        striker2_name: "",
        striker2_runs: "",
        striker2_balls: "",
        striker2_4s: "",
        striker2_6s: "",
        striker2_sr: "",

        // Current Bowler
        bowler_name: "",
        bowler_overs: "",
        bowler_maidens: "",
        bowler_runs: "",
        bowler_wickets: "",
        bowler_econ: ""
      }

      // Map dynamic array data to the static flat keys
      if (matchState.current_strikers && matchState.current_strikers.length > 0) {
        const onStrike = matchState.current_strikers.find(s => s.on_strike) || matchState.current_strikers[0]
        const offStrike = matchState.current_strikers.find(s => !s.on_strike) || matchState.current_strikers[1]

        if (onStrike) {
          vmixData.striker1_name = onStrike.name
          vmixData.striker1_runs = onStrike.runs
          vmixData.striker1_balls = onStrike.balls
          vmixData.striker1_4s = onStrike.fours
          vmixData.striker1_6s = onStrike.sixes
          vmixData.striker1_sr = onStrike.strike_rate
        }

        if (offStrike) {
          vmixData.striker2_name = offStrike.name
          vmixData.striker2_runs = offStrike.runs
          vmixData.striker2_balls = offStrike.balls
          vmixData.striker2_4s = offStrike.fours
          vmixData.striker2_6s = offStrike.sixes
          vmixData.striker2_sr = offStrike.strike_rate
        }
      }

      if (matchState.current_bowler) {
        vmixData.bowler_name = matchState.current_bowler.name
        vmixData.bowler_overs = matchState.current_bowler.overs
        vmixData.bowler_maidens = matchState.current_bowler.maidens
        vmixData.bowler_runs = matchState.current_bowler.runs_conceded
        vmixData.bowler_wickets = matchState.current_bowler.wickets
        vmixData.bowler_econ = matchState.current_bowler.economy
      }

      // Return the flattened JSON
      return reply.send(vmixData)

    } catch (error) {
      request.log.error(error)
      return reply.code(500).send({ error: 'Failed to format vMix data' })
    }
  })
}

module.exports = vmixRoutes
