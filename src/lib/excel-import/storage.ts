import fs from "fs/promises";
import os from "os";
import path from "path";
import zlib from "zlib";
import { promisify } from "util";

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export const STORAGE_ROOT =
    process.env.EXCEL_IMPORT_STORAGE_ROOT ||
    (process.env.VERCEL
        ? path.join(os.tmpdir(), "esg-ghg-storage")
        : path.join(process.cwd(), "storage"));
const UPLOAD_TMP = path.join(STORAGE_ROOT, "uploads", "tmp");

export async function ensureStorageDirs() {
    await fs.mkdir(path.join(STORAGE_ROOT, "excel-imports"), { recursive: true });
    await fs.mkdir(UPLOAD_TMP, { recursive: true });
}

export async function saveUploadChunk(
    uploadId: string,
    chunkIndex: number,
    data: Buffer,
) {
    const dir = path.join(UPLOAD_TMP, uploadId);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${chunkIndex}.part`), data);
}

export async function assembleAndCompressExcel(
    uploadId: string,
    organizationId: string,
): Promise<{ filePath: string; originalSize: number; compressedSize: number }> {
    const dir = path.join(UPLOAD_TMP, uploadId);
    const parts = (await fs.readdir(dir))
        .filter((file) => file.endsWith(".part"))
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    const buffers = await Promise.all(
        parts.map((part) => fs.readFile(path.join(dir, part))),
    );
    const combined = Buffer.concat(buffers);
    const compressed = await gzip(combined);

    const relativePath = path.join("excel-imports", organizationId, `${uploadId}.xlsx.gz`);
    const absolutePath = path.join(STORAGE_ROOT, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, compressed);
    await fs.rm(dir, { recursive: true, force: true });

    return {
        filePath: relativePath,
        originalSize: combined.length,
        compressedSize: compressed.length,
    };
}

export async function readStoredExcel(filePath: string): Promise<Buffer> {
    const absolutePath = path.join(STORAGE_ROOT, filePath);
    const compressed = await fs.readFile(absolutePath);
    return gunzip(compressed);
}
