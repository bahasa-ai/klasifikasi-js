export type KlasifikasiConfig = {
  url?: string,
  creds: OtorisasiCredential[]
}

export type OtorisasiCredential = {
  clientId: string,
  clientSecret: string
}

export type KlasifikasiModelMapping = {
  [publicId: string]: KlasifikasiModel
}

export type KlasifikasiModel = {
  name: string,
  tags: {
    name: string,
    description: string | null,
    descriptionWeight: number | null
  }[],
  credential: OtorisasiCredential & {
    token?: string,
    expiredAt?: Date
  }
}

export type LogQuery = {
  startedAt: Date,
  endedAt: Date,
  take?: number,
  skip?: number
}

export type Label = {
  topic: string,
  desc: string,
  desc_weight: number
}