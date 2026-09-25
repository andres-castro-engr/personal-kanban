declare module 'gray-matter' {
  type Data = Record<string, any>;

  export interface GrayMatterFile<T = Data> {
    content: string;
    data: T;
    excerpt?: string;
    isEmpty?: boolean;
    orig?: string;
  }

  function matter<T = Data>(input: string | Buffer): GrayMatterFile<T>;

  namespace matter {
    function read<T = Data>(file: string | Buffer): GrayMatterFile<T>;
  }

  export default matter;
}
