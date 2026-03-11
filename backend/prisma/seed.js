const prisma = require('../db')

async function main() {
  console.log('🏏 Seeding CricCast database with T20 World Cup 2026 Final data...\n')

  // ══════════════════════════════════════════════════════════════
  //  TEAMS
  // ══════════════════════════════════════════════════════════════
  const teamIND = await prisma.team.create({
    data: { name: 'India', shortName: 'IND', color: '#0066B3' }
  })
  const teamNZ = await prisma.team.create({
    data: { name: 'New Zealand', shortName: 'NZ', color: '#000000' }
  })
  console.log(`✅ Created teams: ${teamIND.name}, ${teamNZ.name}`)

  // ══════════════════════════════════════════════════════════════
  //  PLAYERS — India Playing XI
  // ══════════════════════════════════════════════════════════════
  const indPlayers = await Promise.all([
    prisma.player.create({ data: { firstName: 'Sanju',       lastName: 'Samson',         role: 'WICKET_KEEPER', jerseyNumber: 9 } }),   // 0
    prisma.player.create({ data: { firstName: 'Abhishek',    lastName: 'Sharma',         role: 'ALL_ROUNDER',   jerseyNumber: 27 } }),  // 1
    prisma.player.create({ data: { firstName: 'Ishan',       lastName: 'Kishan',         role: 'BATSMAN',       jerseyNumber: 32 } }),  // 2
    prisma.player.create({ data: { firstName: 'Suryakumar',  lastName: 'Yadav',          role: 'BATSMAN',       jerseyNumber: 63 } }),  // 3
    prisma.player.create({ data: { firstName: 'Hardik',      lastName: 'Pandya',         role: 'ALL_ROUNDER',   jerseyNumber: 33 } }),  // 4
    prisma.player.create({ data: { firstName: 'Shivam',      lastName: 'Dube',           role: 'ALL_ROUNDER',   jerseyNumber: 25 } }),  // 5
    prisma.player.create({ data: { firstName: 'Tilak',       lastName: 'Varma',          role: 'BATSMAN',       jerseyNumber: 7 } }),   // 6
    prisma.player.create({ data: { firstName: 'Axar',        lastName: 'Patel',          role: 'ALL_ROUNDER',   jerseyNumber: 20 } }),  // 7
    prisma.player.create({ data: { firstName: 'Jasprit',     lastName: 'Bumrah',         role: 'BOWLER',        jerseyNumber: 93 } }),  // 8
    prisma.player.create({ data: { firstName: 'Arshdeep',    lastName: 'Singh',          role: 'BOWLER',        jerseyNumber: 2 } }),   // 9
    prisma.player.create({ data: { firstName: 'Varun',       lastName: 'Chakaravarthy',  role: 'BOWLER',        jerseyNumber: 30 } }),  // 10
  ])

  // ══════════════════════════════════════════════════════════════
  //  PLAYERS — New Zealand Playing XI
  // ══════════════════════════════════════════════════════════════
  const nzPlayers = await Promise.all([
    prisma.player.create({ data: { firstName: 'Finn',        lastName: 'Allen',      role: 'BATSMAN',       jerseyNumber: 13 } }),  // 0
    prisma.player.create({ data: { firstName: 'Tim',         lastName: 'Seifert',    role: 'WICKET_KEEPER', jerseyNumber: 16 } }),  // 1
    prisma.player.create({ data: { firstName: 'Rachin',      lastName: 'Ravindra',   role: 'ALL_ROUNDER',   jerseyNumber: 18 } }),  // 2
    prisma.player.create({ data: { firstName: 'Glenn',       lastName: 'Phillips',   role: 'ALL_ROUNDER',   jerseyNumber: 21 } }),  // 3
    prisma.player.create({ data: { firstName: 'Mark',        lastName: 'Chapman',    role: 'BATSMAN',       jerseyNumber: 5 } }),   // 4
    prisma.player.create({ data: { firstName: 'Daryl',       lastName: 'Mitchell',   role: 'ALL_ROUNDER',   jerseyNumber: 20 } }),  // 5
    prisma.player.create({ data: { firstName: 'Mitchell',    lastName: 'Santner',    role: 'ALL_ROUNDER',   jerseyNumber: 80 } }),  // 6
    prisma.player.create({ data: { firstName: 'James',       lastName: 'Neesham',    role: 'ALL_ROUNDER',   jerseyNumber: 16 } }),  // 7
    prisma.player.create({ data: { firstName: 'Matt',        lastName: 'Henry',      role: 'BOWLER',        jerseyNumber: 7 } }),   // 8
    prisma.player.create({ data: { firstName: 'Lockie',      lastName: 'Ferguson',   role: 'BOWLER',        jerseyNumber: 12 } }),  // 9
    prisma.player.create({ data: { firstName: 'Jacob',       lastName: 'Duffy',      role: 'BOWLER',        jerseyNumber: 3 } }),   // 10
  ])

  console.log(`✅ Created ${indPlayers.length + nzPlayers.length} players`)

  // ── Assign players to teams ──
  await prisma.$transaction([
    ...indPlayers.map(p => prisma.teamPlayer.create({ data: { teamId: teamIND.id, playerId: p.id } })),
    ...nzPlayers.map(p => prisma.teamPlayer.create({ data: { teamId: teamNZ.id, playerId: p.id } })),
  ])
  console.log('✅ Assigned players to teams')

  // ══════════════════════════════════════════════════════════════
  //  TOURNAMENT
  // ══════════════════════════════════════════════════════════════
  const tournament = await prisma.tournament.create({
    data: {
      name: 'ICC T20 World Cup 2026',
      format: 'T20',
      oversPerInnings: 20,
      startDate: new Date('2026-02-07'),
      endDate: new Date('2026-03-08')
    }
  })
  console.log(`✅ Created tournament: ${tournament.name}`)

  // ══════════════════════════════════════════════════════════════
  //  MATCH — The Final
  // ══════════════════════════════════════════════════════════════
  const match = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      homeTeamId: teamIND.id,
      awayTeamId: teamNZ.id,
      format: 'T20',
      oversPerInnings: 20,
      status: 'COMPLETED',
      venue: 'Narendra Modi Stadium, Ahmedabad',
      matchDate: new Date('2026-03-08T14:00:00Z'),
      tossWinnerId: teamNZ.id,
      tossDecision: 'BOWL'
    }
  })
  console.log(`✅ Created match: India vs New Zealand — T20 WC 2026 Final`)

  // ── Set playing XI ──
  await prisma.$transaction([
    ...indPlayers.map((p, i) => prisma.matchPlayer.create({
      data: { matchId: match.id, playerId: p.id, teamId: teamIND.id, battingOrder: i + 1 }
    })),
    ...nzPlayers.map((p, i) => prisma.matchPlayer.create({
      data: { matchId: match.id, playerId: p.id, teamId: teamNZ.id, battingOrder: i + 1 }
    }))
  ])
  console.log('✅ Set playing XI for both teams')

  // ══════════════════════════════════════════════════════════════
  //  INNINGS 1 — India Batting (255/5 in 20 overs)
  // ══════════════════════════════════════════════════════════════
  const innings1 = await prisma.innings.create({
    data: {
      matchId: match.id,
      battingTeamId: teamIND.id,
      bowlingTeamId: teamNZ.id,
      inningsNumber: 1,
      totalRuns: 255,
      totalWickets: 5,
      totalOvers: 20.0,
      totalExtras: 8,
      status: 'COMPLETED'
    }
  })
  console.log('✅ Created Innings 1 (India 255/5)')

  // ── India Batsman Innings ──
  // Indices: Samson=0, Abhishek=1, Kishan=2, SKY=3, Pandya=4, Dube=5, Tilak=6
  await prisma.$transaction([
    prisma.batsmanInnings.create({ data: {
      inningsId: innings1.id, playerId: indPlayers[0].id, // Sanju Samson
      runs: 89, ballsFaced: 46, fours: 5, sixes: 8, strikeRate: 193.48,
      status: 'OUT', dismissalType: 'CAUGHT', dismissedById: nzPlayers[7].id, // Neesham
      battingPosition: 1
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings1.id, playerId: indPlayers[1].id, // Abhishek Sharma
      runs: 52, ballsFaced: 21, fours: 6, sixes: 3, strikeRate: 247.62,
      status: 'OUT', dismissalType: 'CAUGHT', dismissedById: nzPlayers[2].id, // Ravindra
      fielderId: nzPlayers[1].id, // Seifert
      battingPosition: 2
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings1.id, playerId: indPlayers[2].id, // Ishan Kishan
      runs: 54, ballsFaced: 25, fours: 4, sixes: 4, strikeRate: 216.00,
      status: 'OUT', dismissalType: 'CAUGHT', dismissedById: nzPlayers[7].id, // Neesham
      fielderId: nzPlayers[4].id, // Chapman
      battingPosition: 3
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings1.id, playerId: indPlayers[3].id, // Suryakumar Yadav
      runs: 0, ballsFaced: 1, fours: 0, sixes: 0, strikeRate: 0.00,
      status: 'OUT', dismissalType: 'CAUGHT', dismissedById: nzPlayers[7].id, // Neesham
      fielderId: nzPlayers[2].id, // Ravindra
      battingPosition: 4
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings1.id, playerId: indPlayers[4].id, // Hardik Pandya
      runs: 18, ballsFaced: 13, fours: 1, sixes: 1, strikeRate: 138.46,
      status: 'OUT', dismissalType: 'CAUGHT', dismissedById: nzPlayers[8].id, // Henry
      fielderId: nzPlayers[6].id, // Santner
      battingPosition: 5
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings1.id, playerId: indPlayers[5].id, // Shivam Dube
      runs: 26, ballsFaced: 8, fours: 3, sixes: 2, strikeRate: 325.00,
      status: 'NOT_OUT',
      battingPosition: 6
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings1.id, playerId: indPlayers[6].id, // Tilak Varma
      runs: 8, ballsFaced: 6, fours: 0, sixes: 0, strikeRate: 133.33,
      status: 'NOT_OUT',
      battingPosition: 7
    }}),
    // Did Not Bat
    prisma.batsmanInnings.create({ data: { inningsId: innings1.id, playerId: indPlayers[7].id, status: 'DID_NOT_BAT', battingPosition: 8 }}),
    prisma.batsmanInnings.create({ data: { inningsId: innings1.id, playerId: indPlayers[8].id, status: 'DID_NOT_BAT', battingPosition: 9 }}),
    prisma.batsmanInnings.create({ data: { inningsId: innings1.id, playerId: indPlayers[9].id, status: 'DID_NOT_BAT', battingPosition: 10 }}),
    prisma.batsmanInnings.create({ data: { inningsId: innings1.id, playerId: indPlayers[10].id, status: 'DID_NOT_BAT', battingPosition: 11 }}),
  ])
  console.log('✅ Seeded India batting scorecard')

  // ── NZ Bowler Innings (Innings 1) ──
  await prisma.$transaction([
    prisma.bowlerInnings.create({ data: {
      inningsId: innings1.id, playerId: nzPlayers[8].id, // Matt Henry
      oversBowled: 4.0, maidens: 0, runsConceded: 49, wickets: 1, economy: 12.25, dotBalls: 3
    }}),
    prisma.bowlerInnings.create({ data: {
      inningsId: innings1.id, playerId: nzPlayers[3].id, // Glenn Phillips
      oversBowled: 1.0, maidens: 0, runsConceded: 5, wickets: 0, economy: 5.00, dotBalls: 2
    }}),
    prisma.bowlerInnings.create({ data: {
      inningsId: innings1.id, playerId: nzPlayers[10].id, // Jacob Duffy
      oversBowled: 3.0, maidens: 0, runsConceded: 42, wickets: 0, economy: 14.00, dotBalls: 2
    }}),
    prisma.bowlerInnings.create({ data: {
      inningsId: innings1.id, playerId: nzPlayers[9].id, // Lockie Ferguson
      oversBowled: 2.0, maidens: 0, runsConceded: 48, wickets: 0, economy: 24.00, dotBalls: 1
    }}),
    prisma.bowlerInnings.create({ data: {
      inningsId: innings1.id, playerId: nzPlayers[6].id, // Mitchell Santner
      oversBowled: 4.0, maidens: 0, runsConceded: 33, wickets: 0, economy: 8.25, dotBalls: 5
    }}),
    prisma.bowlerInnings.create({ data: {
      inningsId: innings1.id, playerId: nzPlayers[2].id, // Rachin Ravindra
      oversBowled: 2.0, maidens: 0, runsConceded: 32, wickets: 1, economy: 16.00, dotBalls: 1
    }}),
    prisma.bowlerInnings.create({ data: {
      inningsId: innings1.id, playerId: nzPlayers[7].id, // James Neesham
      oversBowled: 4.0, maidens: 0, runsConceded: 46, wickets: 3, economy: 11.50, dotBalls: 3
    }}),
  ])
  console.log('✅ Seeded NZ bowling figures (Innings 1)')

  // ══════════════════════════════════════════════════════════════
  //  INNINGS 2 — New Zealand Batting (159 all out in 19 overs)
  // ══════════════════════════════════════════════════════════════
  const innings2 = await prisma.innings.create({
    data: {
      matchId: match.id,
      battingTeamId: teamNZ.id,
      bowlingTeamId: teamIND.id,
      inningsNumber: 2,
      totalRuns: 159,
      totalWickets: 10,
      totalOvers: 19.0,
      totalExtras: 12,
      target: 256,
      status: 'COMPLETED'
    }
  })
  console.log('✅ Created Innings 2 (NZ 159 all out)')

  // ── NZ Batsman Innings ──
  await prisma.$transaction([
    prisma.batsmanInnings.create({ data: {
      inningsId: innings2.id, playerId: nzPlayers[0].id, // Finn Allen
      runs: 9, ballsFaced: 7, fours: 1, sixes: 0, strikeRate: 128.57,
      status: 'OUT', dismissalType: 'CAUGHT', dismissedById: indPlayers[7].id, // Axar Patel
      fielderId: indPlayers[6].id, // Tilak Varma
      battingPosition: 1
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings2.id, playerId: nzPlayers[1].id, // Tim Seifert
      runs: 52, ballsFaced: 26, fours: 2, sixes: 5, strikeRate: 200.00,
      status: 'OUT', dismissalType: 'CAUGHT', dismissedById: indPlayers[10].id, // Varun Chakaravarthy
      fielderId: indPlayers[2].id, // Ishan Kishan
      battingPosition: 2
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings2.id, playerId: nzPlayers[2].id, // Rachin Ravindra
      runs: 1, ballsFaced: 2, fours: 0, sixes: 0, strikeRate: 50.00,
      status: 'OUT', dismissalType: 'CAUGHT', dismissedById: indPlayers[8].id, // Bumrah
      fielderId: indPlayers[2].id, // Kishan
      battingPosition: 3
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings2.id, playerId: nzPlayers[3].id, // Glenn Phillips
      runs: 5, ballsFaced: 5, fours: 1, sixes: 0, strikeRate: 100.00,
      status: 'OUT', dismissalType: 'BOWLED', dismissedById: indPlayers[7].id, // Axar Patel
      battingPosition: 4
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings2.id, playerId: nzPlayers[4].id, // Mark Chapman
      runs: 3, ballsFaced: 8, fours: 0, sixes: 0, strikeRate: 37.50,
      status: 'OUT', dismissalType: 'BOWLED', dismissedById: indPlayers[4].id, // Hardik Pandya
      battingPosition: 5
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings2.id, playerId: nzPlayers[5].id, // Daryl Mitchell
      runs: 17, ballsFaced: 11, fours: 0, sixes: 2, strikeRate: 154.55,
      status: 'OUT', dismissalType: 'CAUGHT', dismissedById: indPlayers[7].id, // Axar Patel
      fielderId: indPlayers[2].id, // Kishan
      battingPosition: 6
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings2.id, playerId: nzPlayers[6].id, // Mitchell Santner
      runs: 43, ballsFaced: 35, fours: 3, sixes: 2, strikeRate: 122.86,
      status: 'OUT', dismissalType: 'BOWLED', dismissedById: indPlayers[8].id, // Bumrah
      battingPosition: 7
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings2.id, playerId: nzPlayers[7].id, // James Neesham
      runs: 8, ballsFaced: 7, fours: 1, sixes: 0, strikeRate: 114.29,
      status: 'OUT', dismissalType: 'BOWLED', dismissedById: indPlayers[8].id, // Bumrah
      battingPosition: 8
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings2.id, playerId: nzPlayers[8].id, // Matt Henry
      runs: 0, ballsFaced: 1, fours: 0, sixes: 0, strikeRate: 0.00,
      status: 'OUT', dismissalType: 'BOWLED', dismissedById: indPlayers[8].id, // Bumrah
      battingPosition: 9
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings2.id, playerId: nzPlayers[9].id, // Lockie Ferguson
      runs: 6, ballsFaced: 7, fours: 0, sixes: 0, strikeRate: 85.71,
      status: 'NOT_OUT',
      battingPosition: 10
    }}),
    prisma.batsmanInnings.create({ data: {
      inningsId: innings2.id, playerId: nzPlayers[10].id, // Jacob Duffy
      runs: 3, ballsFaced: 5, fours: 0, sixes: 0, strikeRate: 60.00,
      status: 'OUT', dismissalType: 'CAUGHT', dismissedById: indPlayers[1].id, // Abhishek Sharma
      fielderId: indPlayers[6].id, // Tilak Varma
      battingPosition: 11
    }}),
  ])
  console.log('✅ Seeded NZ batting scorecard')

  // ── India Bowler Innings (Innings 2) ──
  await prisma.$transaction([
    prisma.bowlerInnings.create({ data: {
      inningsId: innings2.id, playerId: indPlayers[9].id, // Arshdeep Singh
      oversBowled: 4.0, maidens: 0, runsConceded: 32, wickets: 0, economy: 8.00, dotBalls: 7
    }}),
    prisma.bowlerInnings.create({ data: {
      inningsId: innings2.id, playerId: indPlayers[4].id, // Hardik Pandya
      oversBowled: 4.0, maidens: 0, runsConceded: 36, wickets: 1, economy: 9.00, dotBalls: 6
    }}),
    prisma.bowlerInnings.create({ data: {
      inningsId: innings2.id, playerId: indPlayers[7].id, // Axar Patel
      oversBowled: 3.0, maidens: 0, runsConceded: 27, wickets: 3, economy: 9.00, dotBalls: 4
    }}),
    prisma.bowlerInnings.create({ data: {
      inningsId: innings2.id, playerId: indPlayers[8].id, // Jasprit Bumrah — POTM
      oversBowled: 4.0, maidens: 0, runsConceded: 15, wickets: 4, economy: 3.75, dotBalls: 14
    }}),
    prisma.bowlerInnings.create({ data: {
      inningsId: innings2.id, playerId: indPlayers[10].id, // Varun Chakaravarthy
      oversBowled: 3.0, maidens: 0, runsConceded: 39, wickets: 1, economy: 13.00, dotBalls: 3
    }}),
    prisma.bowlerInnings.create({ data: {
      inningsId: innings2.id, playerId: indPlayers[1].id, // Abhishek Sharma
      oversBowled: 1.0, maidens: 0, runsConceded: 5, wickets: 1, economy: 5.00, dotBalls: 3
    }}),
  ])
  console.log('✅ Seeded India bowling figures (Innings 2)')

  console.log('\n🎉 Seed complete! T20 World Cup 2026 Final — India beat New Zealand by 96 runs.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
