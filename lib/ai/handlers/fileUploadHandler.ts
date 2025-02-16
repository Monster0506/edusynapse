// File storage types
export interface FileData {
  id: string;
  name: string;
  content: string;
  type: string;
}

class FileUploadHandler {
  private static instance: FileUploadHandler | null = null;
  private files: Map<string, FileData>;

  private constructor() {
    this.files = new Map();
  }

  public static getInstance(): FileUploadHandler {
    if (!FileUploadHandler.instance) {
      FileUploadHandler.instance = new FileUploadHandler();
    } else {
      console.log("Reusing existing FileUploadHandler instance");
    }
    return FileUploadHandler.instance;
  }

  async uploadFile(
    file: File | { name: string; type: string; content: string },
  ): Promise<string> {
    console.log("uploadFile called with:", {
      name: file.name,
      type: file.type,
    });

    try {
      let content: string;

      if (file instanceof File) {
        // Browser environment
        content = await file.text();
      } else {
        // Server environment
        content = file.content;
      }

      const id = Math.random().toString(36).substring(2, 15);

      const fileData: FileData = {
        id,
        name: file.name,
        content: content,
        type: file.type,
      };

      this.files.set(id, fileData);
      this.debug();
      return id;
    } catch (error) {
      console.error("Error in file upload:", error);
      throw error;
    }
  }

  getFile(id: string): FileData | undefined {
    const file = this.files.get(id);
    return file;
  }

  deleteFile(id: string): boolean {
    console.log("deleteFile called with ID:", id);
    const result = this.files.delete(id);
    return result;
  }

  clearFiles(): void {
    this.files.clear();
  }

  debug(): void {
    console.log(
      "Current files in storage:",
      Array.from(this.files.entries()).map(([id, file]) => ({
        id,
        name: file.name,
        type: file.type,
        contentLength: file.content.length,
      })),
    );
  }
}

// Export a singleton instance
export const fileStorage = FileUploadHandler.getInstance();
