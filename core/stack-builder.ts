export abstract class StackBuilder {
    public constructor(protected readonly stack: any[] = []){}
    public abstract readonly 1: (value: number)=>void;
    public abstract readonly 2: (value: number)=>void;
    public abstract readonly 3: (value: number)=>void;
    public abstract readonly 4: (value: bigint)=>void;
    public abstract readonly 5: (value: number)=>void;
    public abstract readonly 6: (value: number)=>void;
    public abstract readonly 7: (...params: any[])=>void;
    public abstract readonly 8: (...params: any[])=>void;
    public abstract readonly 9: (length: number, kind: number)=>void;
    public abstract readonly 10: (length: number)=>void;
    public abstract readonly 11: (...params: any[])=>void;
    public abstract readonly 12: (...params: any[])=>void;
    public abstract readonly pop: ()=>unknown;
}
 