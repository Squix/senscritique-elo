import { loadRankings, saveRankings } from "./utils/storage.ts";
import { Match, Work } from "./utils/types.ts";

export const SAVE_DIR = "./data";

const test_works: Work[] = [
  {
    initial_rating: 6,
    name: "Dragons 2",
  },
  {
    initial_rating: 8,
    name: "Au revoir là-haut",
  },
  {
    initial_rating: 8,
    name: "Dragons",
  },
  {
    initial_rating: 6,
    name: "The Artist",
  },
  {
    name: "Le Robot sauvage",
    initial_rating: 9,
  },
  {
    name: "Y a t-il un flic pour sauver le monde ?",
    initial_rating: 8,
  },
  {
    name: "BigBug",
    initial_rating: 5,
  },
  {
    name: "L'Accident de piano",
    initial_rating: 7,
  },
  {
    name: "Premier Contact",
    initial_rating: 7,
  },
  {
    name: "Rencontres du troisième type",
    initial_rating: 9,
  },
  {
    name: "The Pod Generation",
    initial_rating: 7,
  },
  {
    name: "Astérix & Obélix - Mission Cléopâtre",
    initial_rating: 5,
  },
  {
    name: "Coco",
    initial_rating: 7,
  },
  {
    name: "Baby Driver",
    initial_rating: 6,
  },
  {
    name: "Un p'tit truc en plus",
    initial_rating: 7,
  },
  {
    name: "Avengers",
    initial_rating: 4,
  },
  {
    name: "Jeux d'enfants",
    initial_rating: 3,
  },
  {
    name: "Bullet Train",
    initial_rating: 7,
  },
];

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("\n== ⚖️  SensCritique ELO ⚖️  ==\n");

  const command = Deno.args[0];

  if (command === "full_tournament") {
    await fullTournament();
  } else if (command === "import_works") {
    await importWorks(); //create rankings CSV
  } else {
    console.log("⚠️  Unknown command.");
  }

  /* const elo_rankings: Work[] = existing_rankings.map((movie) => ({
    ...movie,
    elo_score: movie.initial_rating * 100,
    matches_played: 0,
  }));
  console.log("Base rankings computed.");*/
  /*  */
}

async function importWorks() {
  const existing_rankings = await loadRankings();

  if (existing_rankings.length) {
    console.log(
      `⚠️  This will overwrite your existing rankings. Please backup first.`
    );
    Deno.exit();
  }

  const new_rankings: Work[] = test_works.map((work) => ({
    ...work,
    elo_score: work.initial_rating * 100,
    matches_played: 0,
  }));

  console.log(`ℹ️  ${new_rankings.length} works imported.\n`);
  await saveRankings(new_rankings);
}

async function fullTournament() {
  const existing_rankings = await loadRankings();

  console.log(`${existing_rankings.length} works loaded.`);

  if (!existing_rankings.length) {
    console.log(
      `⚠️  No rankings file found. Please provide one in ${SAVE_DIR}.`
    );
    Deno.exit();
  } else {
    const new_rankings = tournament(existing_rankings);
    console.table(new_rankings);
    console.log("\n");
    await saveRankings(new_rankings);
  }
}

function tournament(elo_rankings: Work[]): Work[] {
  console.log("\nℹ️  Tournament started.\n");
  const phase1_rankings = tournament_phase1(elo_rankings);
  console.clear();
  const phase2_rankings = tournament_phase2(phase1_rankings);
  console.clear();
  console.log("ℹ️  Tournament finished.\n");
  return phase2_rankings;
}

function tournament_phase1(elo_rankings: Work[]): Work[] {
  console.log("ℹ️  Phase 1 'Random n matches' started.");
  const matches = generateMatches(elo_rankings, elo_rankings.length);

  const updated_rankings = matches.reduce((rankings, match, matchIndex) => {
    // Refresh the match with the latest works from rankings to have current matches_played
    const freshWorkA = rankings.find((w) => w.name === match.work_A.name)!;
    const freshWorkB = rankings.find((w) => w.name === match.work_B.name)!;
    const freshMatch: Match = { work_A: freshWorkA, work_B: freshWorkB };

    const updated_match = playMatch(freshMatch, matchIndex);

    return updateRankings(rankings, updated_match);
  }, elo_rankings);

  console.log("ℹ️  Phase 1 'Random n matches' finished.");
  return updated_rankings.toSorted((a, b) => b.elo_score! - a.elo_score!);
}

function tournament_phase2(elo_rankings: Work[]): Work[] {
  console.log("ℹ️  Phase 2 'Underplayed matches' started.");

  const underplayed = elo_rankings.filter((work) => work.matches_played! <= 2);
  const matches = generateMatches(underplayed, underplayed.length);

  const updated_rankings = matches.reduce((rankings, match, matchIndex) => {
    // Refresh the match with the latest works from rankings to have current matches_played
    const freshWorkA = rankings.find((w) => w.name === match.work_A.name)!;
    const freshWorkB = rankings.find((w) => w.name === match.work_B.name)!;
    const freshMatch: Match = { work_A: freshWorkA, work_B: freshWorkB };

    const updated_match = playMatch(freshMatch, matchIndex);
    return updateRankings(rankings, updated_match);
  }, elo_rankings);

  console.log("ℹ️  Phase 2 'Underplayed matches' finished.");
  return updated_rankings.toSorted((a, b) => b.elo_score! - a.elo_score!);
}

function generateMatches(elo_rankings: Work[], matches_count: number): Match[] {
  const matches: Match[] = [];

  for (let i = 0; i < matches_count; i++) {
    const random_pair = pickRandomPair(elo_rankings);

    const workA = random_pair[0];
    const workB = random_pair[1];

    matches.push({ work_A: workA, work_B: workB });
  }

  return matches;
}

function pickRandomPair(array: any[]): [any, any] {
  const randomIndexA = Math.floor(Math.random() * array.length);
  let randomIndexB = Math.floor(Math.random() * array.length);

  while (randomIndexA === randomIndexB) {
    randomIndexB = Math.floor(Math.random() * array.length);
  }

  return [array[randomIndexA], array[randomIndexB]];
}

function playMatch(match: Match, matchNumber: number): Match {
  console.log(`===== Match ${matchNumber} =====`);
  console.log(match.work_A.name + " vs " + match.work_B.name);
  console.log("\nWhich is better?");
  console.log("1. " + match.work_A.name);
  console.log("2. " + match.work_B.name);
  console.log("0. Can't say");

  let winner: string | null;
  do {
    winner = prompt("\nBest: ");
    if (winner === "1") {
      match.winner = "A";
    } else if (winner === "2") {
      match.winner = "B";
    } else if (winner === "0") {
      //no winners
    } else {
      console.log("❌ Invalid input. Please enter 1 or 2.");
    }
  } while (winner !== "1" && winner !== "2" && winner !== "0");

  const new_elo_scores = compute_elo_after_match(match);

  const old_elo_workA = match.work_A.elo_score;
  const old_elo_workB = match.work_B.elo_score;

  /* console.log("\n🏆 Elo changes:");
  console.log(
    match.work_A.name + ": " + old_elo_workA + " → " + new_elo_scores.workA
  );
  console.log(
    match.work_B.name + ": " + old_elo_workB + " → " + new_elo_scores.workB
  ); */

  console.clear()

  return {
    ...match,
    work_A: { ...match.work_A, elo_score: new_elo_scores.workA },
    work_B: { ...match.work_B, elo_score: new_elo_scores.workB },
  };
}

function updateRankings(rankings: Work[], match: Match): Work[] {
  return rankings.map((work) => {
    if (work.name === match.work_A.name) {
      return {
        ...match.work_A,
        matches_played: (work.matches_played ?? 0) + 1,
      };
    }
    if (work.name === match.work_B.name) {
      return {
        ...match.work_B,
        matches_played: (work.matches_played ?? 0) + 1,
      };
    }
    return work;
  });
}

function compute_elo_after_match(match: Match): {
  workA: number;
  workB: number;
} {
  const learning_constant = 32;
  const a_beats_b_probability =
    1 /
    (1 +
      Math.pow(10, (match.work_B.elo_score! - match.work_A.elo_score!) / 400));
  const b_beats_a_probability = 1 - a_beats_b_probability;

  let result_A;
  let result_B;

  if (!match.winner) {
    result_A = 0.5;
    result_B = 0.5;
  } else {
    result_A = match.winner === "A" ? 1 : 0;
    result_B = match.winner === "B" ? 1 : 0;
  }

  const new_elo_workA =
    match.work_A.elo_score! +
    learning_constant * (result_A - a_beats_b_probability);
  const new_elo_workB =
    match.work_B.elo_score! +
    learning_constant * (result_B - b_beats_a_probability);
  /* console.log({
    a_beats_b_probability,
    b_beats_a_probability,
    new_elo_workA,
    new_elo_workB,
  }); */
  return { workA: new_elo_workA, workB: new_elo_workB };
}
