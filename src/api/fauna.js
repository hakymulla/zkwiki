require("dotenv").config(); // Load .env file
export async function addDocument(msgHash, msgBody) {
    const faunadb = require("faunadb");
    const q = faunadb.query;
    const client = new faunadb.Client({
        secret: process.env.REACT_APP_FAUNADB_SECRET,
        domain: "db.fauna.com",
        scheme: "https",
    });
    var response = client.query(
        q.Create(q.Collection("zkleak"), {
            data: {
                msgHash: msgHash,
                msgBody: msgBody,
            },
        })
    );

    return response;
}


export async function findDocument(msgHash) {
    const faunadb = require("faunadb");
    const q = faunadb.query;
    const client = new faunadb.Client({
        secret: process.env.REACT_APP_FAUNADB_SECRET,
        domain: "db.fauna.com",
        scheme: "https",
    });

    let query = await client.query(
        q.Map(
            q.Paginate(q.Match(q.Index("msgHash"), msgHash)),

            q.Lambda((show) => q.Get(show))
        )
    )
    return query.data[0].data["msgBody"]

}

