import { OutputOptions, RolldownOptions } from "rolldown";
import {dts} from "rolldown-plugin-dts";
import {rm} from "node:fs/promises";

const config = [
    {
        input: {
            main:"./core/main.ts",
            types: "./core/types.ts"
        },
        plugins: [dts({isolatedDeclarations: true})],
        output: {
            dir: "./core/dist"
        }
    },
    {
        external: /^@/,
        input: {
            main: "./main/main.ts",
            async: "./main/async/main.ts"
        },
        plugins: [dts({isolatedDeclarations: true})],
        output: {
            dir: "./main/dist"
        }
    }
] as RolldownOptions[];

for(const entry of config){
    const dir = (entry.output as OutputOptions)?.dir;
    if(dir) await rm(dir, {force: true, recursive: true});
}



export default config;