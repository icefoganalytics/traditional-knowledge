import { BlobServiceClient, BlockBlobClient, ContainerClient } from "@azure/storage-blob"
import { v4 as uuidV4 } from "uuid"
import { isNil } from "lodash"

import { BLOB_CONNECTION_STRING, BLOB_CONTAINER } from "@/config"

export class BlobStorageIntegration {
  private static _instance: BlobStorageIntegration
  private _serviceClient?: BlobServiceClient
  private _containerClient?: ContainerClient

  static get instance() {
    if (this._instance) return this._instance

    this._instance = new BlobStorageIntegration()
    return this._instance
  }

  static async uploadFile(localFilePath: string): Promise<string> {
    return this.instance.uploadFile(localFilePath)
  }

  static async downloadFile(remoteFileIdentifier: string): Promise<Buffer> {
    return this.instance.downloadFile(remoteFileIdentifier)
  }

  static async deleteFile(remoteFileIdentifier: string): Promise<void> {
    return this.instance.deleteFile(remoteFileIdentifier)
  }

  /**
   * Uploads a file to Azure Blob Storage and returns the remote file name (blob name).
   *
   * The remote file name acts as a "file handle" or identifier for the uploaded blob.
   * While Azure Blob Storage supports full path structures (e.g., "documents/reports/file.pdf"),
   * we treat this identifier as an opaque handle - we don't care about its structure
   * or whether it represents a path. We generate it once and use it consistently
   * for all operations (download, delete) on that blob.
   *
   * This approach simplifies our application by:
   * - Abstracting away Azure's path-based storage structure
   * - Treating the remote file name as a unique identifier, not a path
   * - Allowing Azure to handle the actual storage organization
   * - Maintaining a simple file-handle-like interface for blob operations
   *
   * @param localFilePath The path to the local file to upload.
   * @returns The remote file identifier (blob name) that acts as a file handle for future operations.
   */
  async uploadFile(localFilePath: string): Promise<string> {
    const remoteFileIdentifier = uuidV4() // a.k.a. blob name or remote file handle
    const client = this.getBlockBlobClient(remoteFileIdentifier)
    await client.uploadFile(localFilePath)
    return remoteFileIdentifier
  }

  async downloadFile(remoteFileIdentifier: string): Promise<Buffer> {
    const client = this.getBlockBlobClient(remoteFileIdentifier)
    return client.downloadToBuffer()
  }

  async deleteFile(remoteFileIdentifier: string): Promise<void> {
    const client = this.getBlockBlobClient(remoteFileIdentifier)
    await client.delete()
  }


  private get serviceClient(): BlobServiceClient {
    if (!isNil(this._serviceClient)) return this._serviceClient

    this._serviceClient = BlobServiceClient.fromConnectionString(BLOB_CONNECTION_STRING)
    return this._serviceClient
  }

  private get containerClient(): ContainerClient {
    if (!isNil(this._containerClient)) return this._containerClient

    this._containerClient = this.serviceClient.getContainerClient(BLOB_CONTAINER)
    return this._containerClient
  }

  private getBlockBlobClient(remoteFileIdentifier: string): BlockBlobClient {
    return this.containerClient.getBlockBlobClient(remoteFileIdentifier)
  }
}

export default BlobStorageIntegration
