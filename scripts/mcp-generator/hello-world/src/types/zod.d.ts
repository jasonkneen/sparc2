declare module 'zod' {
  export function string(): any;
  export function object(schema: any): any;
  export function number(): any;
  export function optional(): any;
  
  export const z: {
    string: () => any;
    object: (schema: any) => any;
    number: () => any;
    enum: (values: string[]) => any;
    optional: () => any;
  };
}