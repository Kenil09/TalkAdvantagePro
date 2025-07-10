import { initSchema as initContextPackSchema } from "./collections/contextpack";

export const initSchema = async () => {
    await initContextPackSchema();
};

