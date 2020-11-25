import { OtorisasiCredentialsMaping, OtorisasiCredentials } from '../Types'
import { createRequest } from '../Util/Request'

export class Otorisasi {

  public static client: Otorisasi

  private constructor(public creds: OtorisasiCredentialsMaping, private baseUrl: string) {}

  public static async build(baseUrl: string, clientCredential: OtorisasiCredentials[]): Promise<Otorisasi> {
    if (!Otorisasi.client) {
      const creds: OtorisasiCredentialsMaping = {}
      for (const credData of clientCredential) {
        const { clientId, clientSecret } = credData
        const authResponse = await Otorisasi.requestClientToken(clientId, clientSecret, baseUrl)
        creds[clientId] = {
          clientSecret: clientSecret,
          token: authResponse?.auth?.token,
          expiredAt: new Date(authResponse?.auth?.expiredAfter)
        }
      }
      Otorisasi.client = new Otorisasi(creds, baseUrl)
    }
    return Otorisasi.client
  }


  private static async requestClientToken(clientId: string, clientSecret: string, baseUrl: string): Promise<any> {
    try {
      const request = createRequest(baseUrl, {}, {})
      const response = await request.post<any>('/api/v1/auth/token', {
        grantType: 'clientCredential',
        clientId: clientId,
        clientSecret: clientSecret
      })
      return response.data
    } catch (error) {
      const status = error?.response?.status ? error.response.status : 422
      throw { status: status, body: { error: error?.response?.data?.error || 'Failed to get client token into otorisasi !' } }
    }
  }

}