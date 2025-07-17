# nbt
NBT General Packages

### Network Format
- Int32 and Int64 are encoded with VarInt byte encoding, ZigZag encoding is not applied
### ArrayLists
- NBT ArrayList might be typeof `EndOfCompound` `0-type` when empty