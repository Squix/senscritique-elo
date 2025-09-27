import { stringify, parse as csvParse } from "@std/csv";
import { dirname, join } from "@std/path";
import { Work } from "./types.ts";
import { SAVE_DIR } from "../main.ts";

const CSV_COLUMNS = ["title", "elo_score", "initial_rating", "matches_played"]

const CSV_FILE_NAME = "rankings.csv"

export async function saveRankings(rankings : Work[]) : Promise<void> {
    const csv = stringify(rankings, {
        columns: CSV_COLUMNS
    })

    const file_path = join(SAVE_DIR, CSV_FILE_NAME);

    // Ensure the directory exists
    await Deno.mkdir(dirname(file_path), { recursive: true });

    await Deno.writeTextFile(file_path, csv);

    console.log(`✅  Rankings saved to: ${file_path}`);
}

export async function loadRankings() : Promise<Work[]> {
    const rankings_file_path = join(SAVE_DIR, CSV_FILE_NAME);
    try {
        const rankings = csvParse(await Deno.readTextFile(rankings_file_path), {
            columns: CSV_COLUMNS,
            skipFirstRow:true
        });

        return rankings.map(parsedWork=>({
            title:parsedWork.name,
            elo_score: parseFloat(parsedWork.elo_score),
            initial_rating: parseInt(parsedWork.initial_rating),
            matches_played: parseInt(parsedWork.matches_played)
        })) as Work[]

    } catch (error) {
        // If the file doesn't exist, return an empty array
        if (error instanceof Deno.errors.NotFound) {

            return []
        }
        throw error;
    }
}