import { RolldownOptions } from "rolldown";
import {dts} from "rolldown-plugin-dts";
export default [
    {
        input: "./core/main.ts",
        plugins: [dts({isolatedDeclarations: true})],
        output: {
            dir: "./core/dist"
        }
    }
] as RolldownOptions[]