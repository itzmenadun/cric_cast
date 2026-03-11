-- CreateEnum
CREATE TYPE "MatchFormat" AS ENUM ('T10', 'T20', 'ODI', 'TEST', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('UPCOMING', 'TOSS', 'LIVE', 'INNINGS_BREAK', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "PlayerRole" AS ENUM ('BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER');

-- CreateEnum
CREATE TYPE "InningsStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DECLARED');

-- CreateEnum
CREATE TYPE "ExtrasType" AS ENUM ('NONE', 'WIDE', 'NO_BALL', 'BYE', 'LEG_BYE', 'PENALTY');

-- CreateEnum
CREATE TYPE "WicketType" AS ENUM ('BOWLED', 'CAUGHT', 'LBW', 'RUN_OUT', 'STUMPED', 'HIT_WICKET', 'CAUGHT_AND_BOWLED', 'RETIRED_HURT', 'OBSTRUCTING_FIELD', 'TIMED_OUT', 'HIT_BALL_TWICE');

-- CreateEnum
CREATE TYPE "BatsmanStatus" AS ENUM ('DID_NOT_BAT', 'BATTING', 'OUT', 'RETIRED_HURT', 'NOT_OUT');

-- CreateEnum
CREATE TYPE "TossDecision" AS ENUM ('BAT', 'BOWL');

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" "MatchFormat" NOT NULL,
    "overs_per_innings" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#000000',
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "PlayerRole" NOT NULL,
    "headshot_url" TEXT,
    "jersey_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_players" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,

    CONSTRAINT "team_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "home_team_id" TEXT NOT NULL,
    "away_team_id" TEXT NOT NULL,
    "format" "MatchFormat" NOT NULL,
    "overs_per_innings" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'UPCOMING',
    "venue" TEXT,
    "match_date" TIMESTAMP(3),
    "toss_winner_id" TEXT,
    "toss_decision" "TossDecision",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_players" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "is_playing" BOOLEAN NOT NULL DEFAULT true,
    "batting_order" INTEGER,

    CONSTRAINT "match_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innings" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "batting_team_id" TEXT NOT NULL,
    "bowling_team_id" TEXT NOT NULL,
    "innings_number" INTEGER NOT NULL,
    "total_runs" INTEGER NOT NULL DEFAULT 0,
    "total_wickets" INTEGER NOT NULL DEFAULT 0,
    "total_overs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_extras" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER,
    "status" "InningsStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overs" (
    "id" TEXT NOT NULL,
    "innings_id" TEXT NOT NULL,
    "over_number" INTEGER NOT NULL,
    "bowler_id" TEXT NOT NULL,
    "runs_conceded" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "is_maiden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "overs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balls" (
    "id" TEXT NOT NULL,
    "over_id" TEXT NOT NULL,
    "ball_number" INTEGER NOT NULL,
    "batsman_id" TEXT NOT NULL,
    "bowler_id" TEXT NOT NULL,
    "runs_scored" INTEGER NOT NULL DEFAULT 0,
    "extras_type" "ExtrasType" NOT NULL DEFAULT 'NONE',
    "extras_runs" INTEGER NOT NULL DEFAULT 0,
    "is_wicket" BOOLEAN NOT NULL DEFAULT false,
    "wicket_type" "WicketType",
    "dismissed_player_id" TEXT,
    "fielder_id" TEXT,
    "wagon_x" DOUBLE PRECISION,
    "wagon_y" DOUBLE PRECISION,
    "pitch_zone" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batsman_innings" (
    "id" TEXT NOT NULL,
    "innings_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "balls_faced" INTEGER NOT NULL DEFAULT 0,
    "fours" INTEGER NOT NULL DEFAULT 0,
    "sixes" INTEGER NOT NULL DEFAULT 0,
    "strike_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "BatsmanStatus" NOT NULL DEFAULT 'DID_NOT_BAT',
    "dismissal_type" "WicketType",
    "dismissed_by_id" TEXT,
    "fielder_id" TEXT,
    "batting_position" INTEGER,

    CONSTRAINT "batsman_innings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bowler_innings" (
    "id" TEXT NOT NULL,
    "innings_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "overs_bowled" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maidens" INTEGER NOT NULL DEFAULT 0,
    "runs_conceded" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "extras" INTEGER NOT NULL DEFAULT 0,
    "economy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dot_balls" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "bowler_innings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_players_team_id_player_id_key" ON "team_players"("team_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_players_match_id_player_id_key" ON "match_players"("match_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "innings_match_id_innings_number_key" ON "innings"("match_id", "innings_number");

-- CreateIndex
CREATE UNIQUE INDEX "overs_innings_id_over_number_key" ON "overs"("innings_id", "over_number");

-- CreateIndex
CREATE UNIQUE INDEX "balls_idempotency_key_key" ON "balls"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "batsman_innings_innings_id_player_id_key" ON "batsman_innings"("innings_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "bowler_innings_innings_id_player_id_key" ON "bowler_innings"("innings_id", "player_id");

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_toss_winner_id_fkey" FOREIGN KEY ("toss_winner_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_batting_team_id_fkey" FOREIGN KEY ("batting_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_bowling_team_id_fkey" FOREIGN KEY ("bowling_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overs" ADD CONSTRAINT "overs_innings_id_fkey" FOREIGN KEY ("innings_id") REFERENCES "innings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overs" ADD CONSTRAINT "overs_bowler_id_fkey" FOREIGN KEY ("bowler_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balls" ADD CONSTRAINT "balls_over_id_fkey" FOREIGN KEY ("over_id") REFERENCES "overs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balls" ADD CONSTRAINT "balls_batsman_id_fkey" FOREIGN KEY ("batsman_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balls" ADD CONSTRAINT "balls_bowler_id_fkey" FOREIGN KEY ("bowler_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balls" ADD CONSTRAINT "balls_dismissed_player_id_fkey" FOREIGN KEY ("dismissed_player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balls" ADD CONSTRAINT "balls_fielder_id_fkey" FOREIGN KEY ("fielder_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batsman_innings" ADD CONSTRAINT "batsman_innings_innings_id_fkey" FOREIGN KEY ("innings_id") REFERENCES "innings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batsman_innings" ADD CONSTRAINT "batsman_innings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batsman_innings" ADD CONSTRAINT "batsman_innings_dismissed_by_id_fkey" FOREIGN KEY ("dismissed_by_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batsman_innings" ADD CONSTRAINT "batsman_innings_fielder_id_fkey" FOREIGN KEY ("fielder_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bowler_innings" ADD CONSTRAINT "bowler_innings_innings_id_fkey" FOREIGN KEY ("innings_id") REFERENCES "innings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bowler_innings" ADD CONSTRAINT "bowler_innings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
