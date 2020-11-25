export type KlasifikasiConfig = {
  url?: {
    otorisasi_url: string,
    klasifikasi_url: string
  },
  creds: OtorisasiCredentials[]
}

export type OtorisasiCredentials = {
  clientId: string,
  clientSecret: string
}

export type OtorisasiCredentialsMaping = {
  [clientId: string]: {
    clientSecret: string,
    token?: string,
    expiredAt?: Date
  }
}

export type KlasifikasiModelMapping = {
  [publicId: string]: {
    name: string,
    clientId: string
  }
}
