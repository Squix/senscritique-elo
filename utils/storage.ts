import { stringify, parse as csvParse } from "@std/csv";
import { dirname, join } from "@std/path";
import { Work } from "./types.ts";
import { SAVE_DIR } from "../main.ts";



export async function saveRankings(rankings : Work[]) : Promise<void> {
    const csv = stringify(rankings, {
        columns: ["name", "elo_score", "initial_rating", "matches_played"]
    })

    const file_path = join(SAVE_DIR, "rankings.csv");

    // Ensure the directory exists
    await Deno.mkdir(dirname(file_path), { recursive: true });

    await Deno.writeTextFile(file_path, csv);

    console.log(`✅  Rankings saved to: ${file_path}`);
}