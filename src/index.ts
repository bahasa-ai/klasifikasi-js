import 'source-map-support/register'
import { KlasifikasiConfig, KlasifikasiModelMapping, OtorisasiCredential } from './Types'
import { BASE_URL } from './Constant'
import { createRequest } from './Util/Request'
export default class Klasifikasi {

  private static klasifikasiClient: Klasifikasi

  private constructor(private opts: KlasifikasiConfig, private modelMapping: KlasifikasiModelMapping) { }

  public static async build(opts: KlasifikasiConfig): Promise<Klasifikasi> {
    if (!Klasifikasi.klasifikasiClient) {

      opts.url = opts?.url ? opts.url : BASE_URL

      const modelMapping: KlasifikasiModelMapping = {}
      for (const credentialData of opts.creds) {
        const { auth } = await Klasifikasi.getClientToken(opts.url, credentialData)
        const { model } = await Klasifikasi.getModelInfo(opts.url, auth?.token)
        if (model) {
          const { publicId, name } = model
          modelMapping[publicId] = {
            name: name,
            credential: {
              clientId: credentialData.clientId,
              clientSecret: credentialData.clientSecret,
              token: auth?.token,
              expiredAt: auth?.expiredAfter
            }
          }
        }
      }

      Klasifikasi.klasifikasiClient = new Klasifikasi(opts, modelMapping)
    }
    return Klasifikasi.klasifikasiClient
  }

  private static async getModelInfo(baseUrl: string, clientToken: string): Promise<any> {
    try {
      const request = createRequest(baseUrl, { authorization: `Bearer ${clientToken}` }, {})
      const response = await request.get('/api/v1/auth/activeClient')
      return response.data
    } catch (error) {
      const status = error?.response?.status ? error.response.status : 422
      throw { status: status, body: { error: error?.response?.data?.error || 'Failed to get model & client data from klasifikasi !' } }
    }
  }

  private static async getClientToken(baseUrl: string, cred: OtorisasiCredential): Promise<any> {
    try {
      const request = createRequest(baseUrl, {}, {})
      const response = await request.post('/api/v1/auth/token', {
        ...cred
      })
      return response?.data
    } catch (error) {
      const status = error?.response?.status ? error.response.status : 422
      throw { status: status, body: { error: error?.response?.data?.error || 'Failed to client token from klasifikasi !' } }
    }
  }

  public static getModels(): KlasifikasiModelMapping {
    return this.klasifikasiClient.modelMapping
  }

}
