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

export type UpdateGardenPayload = {
  id: string;
  formData: FormData;
};

export type DeleteGardenResponse = {
  message: string;
};
