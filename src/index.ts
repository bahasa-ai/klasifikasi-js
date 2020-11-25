import 'source-map-support/register'
import { KlasifikasiConfig, OtorisasiCredentialsMaping, KlasifikasiModelMapping } from './Types'
import { Otorisasi } from './Service/Otorisasi'
import { BASE_URL } from './Constant'
import { createRequest } from './Util/Request'
export default class Klasifikasi {

  private static klasifikasiClient: Klasifikasi

  private constructor(private opts: KlasifikasiConfig, private otorisasiClient: Otorisasi, private modelsMapping: KlasifikasiModelMapping) { }

  public static async build(opts: KlasifikasiConfig): Promise<Klasifikasi> {
    if (!Klasifikasi.klasifikasiClient) {

      opts.url = {
        ...BASE_URL,
        ...opts.url
      }

      const otorisasiClient = await Otorisasi.build(opts.url.otorisasi_url, opts.creds)
      const models: KlasifikasiModelMapping = {}
      for (const clientId of Object.keys(otorisasiClient.creds)) {
        const { token } = otorisasiClient.creds[clientId]
        const { model } = await this.getModelInfo(opts.url.klasifikasi_url, token)
        if (model) {
          const { publicId, name } = model
          models[publicId] = {
            clientId: clientId,
            name: name
          }
        } 
      }

      Klasifikasi.klasifikasiClient = new Klasifikasi(opts, otorisasiClient, models)
    }
    return Klasifikasi.klasifikasiClient
  }

  private static async getModelInfo(baseUrl: string, clientToken: string): Promise<any> {
    try {
      const request = createRequest(baseUrl, { authorization: `Bearer ${clientToken}`}, {})
      const response = await request.get('/api/v1/auth/activeClient')
      return response.data
    } catch (error) {
      const status = error?.response?.status ? error.response.status : 422
      throw { status: status, body: { error: error?.response?.data?.error || 'Failed to get model & client data from klasifikasi !' } }
    }
  }

  
  public static getOtorisasiMapping(): OtorisasiCredentialsMaping {
    return this.klasifikasiClient.otorisasiClient.creds
  }

  public static getModels(): KlasifikasiModelMapping {
    return this.klasifikasiClient.modelsMapping
  }

}