import { SensCritiqueRating, SensCritiqueUniverse } from "./types.ts";

const SENS_CRITIQUE_API_URL = "https://apollo.senscritique.com";

type SensCritiqueCollectionResponse = {
    data:{
        user: {
            collection:{
                products:{
                    title:string,
                    otherUserInfos: {
                        rating:SensCritiqueRating
                    }
                }[]
            }
        }
    }
}

type SensCritiqueProduct = {
    title:string,
    initial_rating:SensCritiqueRating
}

export async function getUserCollection(username:string, universe: SensCritiqueUniverse) : Promise<SensCritiqueProduct[]> {
    const res = await fetch(`${SENS_CRITIQUE_API_URL}/graphql`, {
        headers: {
            "Content-Type": "application/json",
        },
        body:JSON.stringify({
                "query": "query UserCollectionQuery($username: String!, $limit: Int, $offset: Int, $universe: String) { user(username: $username) { collection(limit: $limit, offset: $offset, universe: $universe) { products { id url title originalTitle yearOfProduction rating universe medias { picture } otherUserInfos(username: $username) { rating dateDone isWished review { bodyText } } } } } }",
                "variables": {
                    "username": username,
                    "limit": 10000,
                    "offset": 0,
                    "universe": universe
                }
        }),
        method: "POST"
    })

    if(!res.ok) {
        throw new Error(`Failed to fetch user collection: ${res.statusText}`)
    }

    const collection = await res.json() as SensCritiqueCollectionResponse

    return collection.data.user.collection.products.map(product=>({
        title: product.title,
        initial_rating:product.otherUserInfos.rating
    }))

}