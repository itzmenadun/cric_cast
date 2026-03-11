const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🏏 Seeding CricCast database...\n')

  // ── Teams ──
  const teamSL = await prisma.team.create({
    data: { name: 'Sri Lanka', shortName: 'SL', color: '#005EB8' }
  })
  const teamIND = await prisma.team.create({
    data: { name: 'India', shortName: 'IND', color: '#0066B3' }
  })

  console.log(`✅ Created teams: ${teamSL.name}, ${teamIND.name}`)

  // ── Players ──
  const slPlayers = await Promise.all([
    prisma.player.create({ data: { firstName: 'Charith', lastName: 'Asalanka', role: 'BATSMAN', jerseyNumber: 1 } }),
    prisma.player.create({ data: { firstName: 'Kusal', lastName: 'Mendis', role: 'WICKET_KEEPER', jerseyNumber: 2 } }),
    prisma.player.create({ data: { firstName: 'Pathum', lastName: 'Nissanka', role: 'BATSMAN', jerseyNumber: 3 } }),
    prisma.player.create({ data: { firstName: 'Kamindu', lastName: 'Mendis', role: 'ALL_ROUNDER', jerseyNumber: 4 } }),
    prisma.player.create({ data: { firstName: 'Wanindu', lastName: 'Hasaranga', role: 'BOWLER', jerseyNumber: 5 } }),
    prisma.player.create({ data: { firstName: 'Maheesh', lastName: 'Theekshana', role: 'BOWLER', jerseyNumber: 6 } }),
    prisma.player.create({ data: { firstName: 'Dasun', lastName: 'Shanaka', role: 'ALL_ROUNDER', jerseyNumber: 7 } }),
    prisma.player.create({ data: { firstName: 'Dhananjaya', lastName: 'de Silva', role: 'ALL_ROUNDER', jerseyNumber: 8 } }),
    prisma.player.create({ data: { firstName: 'Dunith', lastName: 'Wellalage', role: 'ALL_ROUNDER', jerseyNumber: 9 } }),
    prisma.player.create({ data: { firstName: 'Matheesha', lastName: 'Pathirana', role: 'BOWLER', jerseyNumber: 10 } }),
    prisma.player.create({ data: { firstName: 'Nuwan', lastName: 'Thushara', role: 'BOWLER', jerseyNumber: 11 } }),
  ])

  const indPlayers = await Promise.all([
    prisma.player.create({ data: { firstName: 'Rohit', lastName: 'Sharma', role: 'BATSMAN', jerseyNumber: 45 } }),
    prisma.player.create({ data: { firstName: 'Virat', lastName: 'Kohli', role: 'BATSMAN', jerseyNumber: 18 } }),
    prisma.player.create({ data: { firstName: 'Shubman', lastName: 'Gill', role: 'BATSMAN', jerseyNumber: 77 } }),
    prisma.player.create({ data: { firstName: 'KL', lastName: 'Rahul', role: 'WICKET_KEEPER', jerseyNumber: 1 } }),
    prisma.player.create({ data: { firstName: 'Jasprit', lastName: 'Bumrah', role: 'BOWLER', jerseyNumber: 93 } }),
    prisma.player.create({ data: { firstName: 'Ravindra', lastName: 'Jadeja', role: 'ALL_ROUNDER', jerseyNumber: 8 } }),
    prisma.player.create({ data: { firstName: 'Hardik', lastName: 'Pandya', role: 'ALL_ROUNDER', jerseyNumber: 33 } }),
    prisma.player.create({ data: { firstName: 'Kuldeep', lastName: 'Yadav', role: 'BOWLER', jerseyNumber: 23 } }),
    prisma.player.create({ data: { firstName: 'Mohammed', lastName: 'Siraj', role: 'BOWLER', jerseyNumber: 13 } }),
    prisma.player.create({ data: { firstName: 'Suryakumar', lastName: 'Yadav', role: 'BATSMAN', jerseyNumber: 63 } }),
    prisma.player.create({ data: { firstName: 'Axar', lastName: 'Patel', role: 'ALL_ROUNDER', jerseyNumber: 20 } }),
  ])

  console.log(`✅ Created ${slPlayers.length + indPlayers.length} players`)

  // ── Assign players to teams ──
  await prisma.$transaction([
    ...slPlayers.map(p => prisma.teamPlayer.create({ data: { teamId: teamSL.id, playerId: p.id } })),
    ...indPlayers.map(p => prisma.teamPlayer.create({ data: { teamId: teamIND.id, playerId: p.id } })),
  ])
  console.log('✅ Assigned players to teams')

  // ── Tournament ──
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Asia Cup 2026',
      format: 'ODI',
      oversPerInnings: 50,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-21')
    }
  })
  console.log(`✅ Created tournament: ${tournament.name}`)

  // ── Match ──
  const match = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      homeTeamId: teamSL.id,
      awayTeamId: teamIND.id,
      format: 'ODI',
      oversPerInnings: 50,
      venue: 'R. Premadasa Stadium, Colombo',
      matchDate: new Date('2026-06-15T10:00:00Z')
    }
  })
  console.log(`✅ Created match: ${teamSL.name} vs ${teamIND.name}`)

  // ── Set playing XI ──
  await prisma.$transaction([
    ...slPlayers.map((p, i) => prisma.matchPlayer.create({
      data: { matchId: match.id, playerId: p.id, teamId: teamSL.id, battingOrder: i + 1 }
    })),
    ...indPlayers.map((p, i) => prisma.matchPlayer.create({
      data: { matchId: match.id, playerId: p.id, teamId: teamIND.id, battingOrder: i + 1 }
    }))
  ])
  console.log('✅ Set playing XI for both teams')

  console.log('\n🎉 Seed complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
