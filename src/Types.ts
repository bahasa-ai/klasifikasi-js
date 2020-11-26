export type KlasifikasiConfig = {
  url?: string,
  creds: OtorisasiCredentials[]
}

export type OtorisasiCredentials = {
  clientId: string,
  clientSecret: string
}

export type KlasifikasiModelMapping = {
  [publicId: string]: {
    name: string,
    creds: OtorisasiCredentials & {
      token?: string,
      expiredAt?: Date
    }
  }
}