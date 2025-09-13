import dotenv from "dotenv";
dotenv.config();

const ConnectionString = process.env.MONGODB_CONNECTION_STRING;

export default { ConnectionString };
