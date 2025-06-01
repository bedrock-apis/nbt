import { StaticDataProvider } from "./base/data-provider";
import { NBTFormatReader, NBTFormatWriter } from "./base/format";
import { NBTTag } from "./tag";

export class StaticNBT {
    public constructor(
        public readonly reader: NBTFormatReader,
        public readonly writer: NBTFormatWriter
    ){}
    public readProperty<T>(dataProvider: StaticDataProvider): {type: NBTTag, key: string, value: T} {
        const type = this.reader.readType(dataProvider);
        const key = this.reader[NBTTag.String](dataProvider);
        const value = this.reader[type](dataProvider);
        return {type, key, value};
    }
    public readValueExplicit<T>(dataProvider: StaticDataProvider, tag: NBTTag): T{ return this.reader[tag](dataProvider); }
    public readValue<T>(dataProvider: StaticDataProvider): T {
        const type = this.reader.readType(dataProvider);
        return this.reader[type](dataProvider);
    }
}