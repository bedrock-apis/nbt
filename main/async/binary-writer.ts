import { Byte, Double, Float, Int, Long, Short } from "@bedrock-apis/nbt-core";

type NBTToken = Byte | Short | Int | Long | bigint | Float | Double | string | object | Uint8Array | Int32Array | BigInt64Array;
export class TokenReader extends ReadableStream<Uint8Array> {
    public constructor(iterator: Iterator<NBTToken>){
        super({
            pull(controller) {
                
            },
        })
    }
}
/*
Iterate over tokens and just write them, type is directly use with Byte
*/