export type ApiGarden = {
  _id: string;
  name: string;
  address: string;
  addressNumber?: string;
  latitude?: number;
  longitude?: number;
  photo?: string;
  createdAt: string;
  updatedAt: string;
};

export type GardenMutationBody = {
  name: string;
  address: string;
  addressNumber?: string;
  latitude?: number;
  longitude?: number;
  photoKey?: string;
};

export type UpdateGardenPayload = {
  id: string;
  body: GardenMutationBody;
};

export type RequestGardenPhotoUploadUrlPayload = {
  fileName: string;
  contentType: string;
  fileSize: number;
};

export type GardenPhotoUploadUrlResponse = {
  photoKey: string;
  uploadUrl: string;
  expiresAt: string;
  maxFileSizeBytes: number;
};

export type DeleteGardenResponse = {
  message: string;
};
