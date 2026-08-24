export type RequestGardenPhotoUploadUrlBody = {
  fileName: string;
  contentType: string;
  fileSize?: number;
};

export type GardenPhotoUploadUrlResponse = {
  photoKey: string;
  uploadUrl: string;
  expiresAt: string;
  maxFileSizeBytes: number;
};