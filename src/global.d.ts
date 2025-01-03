export {};

declare global {
  interface FilePickerOptions {
    types?: {
      description: string;
      accept: Record<string, string[]>;
    }[];
    excludeAcceptAllOption?: boolean;
    multiple?: boolean;
  }

  interface Window {
    showOpenFilePicker?: (options?: FilePickerOptions) => Promise<FileSystemFileHandle[]>;
  }
}