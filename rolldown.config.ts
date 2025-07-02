import { RolldownOptions } from "rolldown";
import {dts} from "rolldown-plugin-dts";
export default [
    {
        input: "./core/main.ts",
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
] as RolldownOptions[]