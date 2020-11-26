export type KlasifikasiConfig = {
  url?: string,
  creds: OtorisasiCredential[]
}

export type OtorisasiCredential = {
  clientId: string,
  clientSecret: string
}

export type KlasifikasiModelMapping = {
  [publicId: string]: {
    name: string,
    credential: OtorisasiCredential & {
      token?: string,
      expiredAt?: Date
    }
  }
}