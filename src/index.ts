import 'source-map-support/register'
import { KlasifikasiConfig, KlasifikasiModelMapping, OtorisasiCredential, LogQuery, KlasifikasiModel, Label } from './Types'
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
          const { publicId, name, tags } = model
          const _tags = tags && tags.length != 0 ? tags.map(val => {
            return { name: val.name, description: val.description, descriptionWeight: val.descriptionWeight }
          }) : []
          modelMapping[publicId] = {
            name: name,
            credential: {
              clientId: credentialData.clientId,
              clientSecret: credentialData.clientSecret,
              token: auth?.token,
              expiredAt: auth?.expiredAfter
            },
            tags: _tags
          }
        }
      }
      Klasifikasi.klasifikasiClient = new Klasifikasi(opts, modelMapping)
    } else {

      const credsData = opts.creds
      const client = Klasifikasi.klasifikasiClient

      for (const credentialData of credsData) {
        const { auth } = await Klasifikasi.getClientToken(client.opts.url, credentialData)
        const { model } = await Klasifikasi.getModelInfo(client.opts.url, auth?.token)

        if (model && !client.modelMapping[model.publicId]) { // add the token
          client.modelMapping[model.publicId] = {
            name: model.name,
            credential: {
              ...credentialData,
              token: auth?.token,
              expiredAt: auth?.expiredAfter
            },
            tags: model.tags.map(val => {
              return { name: val.name, description: val.description, descriptionWeight: val.descriptionWeight }
            })
          }
        }

      }
    }
    return Klasifikasi.klasifikasiClient
  }

  public static async classify(publicId: string, query: string): Promise<any> {
    const client = Klasifikasi.client
    const model = client.getModel(publicId)

    const { expiredAt } = model.credential
    if (new Date() >= new Date(expiredAt)) {
      await client.reloadToken(publicId)
    }
    const { token } = model.credential

    const classifyResult = client._classify(publicId, query, token)
    return classifyResult
  }

  public static async logs(publicId: string, query: LogQuery): Promise<any> {
    const client = Klasifikasi.client
    const model = client.getModel(publicId)

    const { expiredAt } = model.credential
    if (new Date() >= new Date(expiredAt)) {
      await client.reloadToken(publicId)
    }
    const { token } = model.credential

    const logs = client._histories(publicId, query, token)
    return logs
  }

  public static async brandonzClassify(publicId: string, query: string, tags: Label[], multiClass: boolean): Promise<any> {
    const models = Object.keys(Klasifikasi.getModels())
    if (!models || models.length == 0) throw { body: { error: 'Please build first !' } }

    const client = Klasifikasi.client
    const model = client.getModel(publicId)

    const { expiredAt } = model.credential
    if (new Date() >= new Date(expiredAt)) {
      await client.reloadToken(publicId)
    }
    const { token } = model.credential

    const result = client._brandonzClassify(query, tags, multiClass, token)
    return result
  }


  public static async zslClassify(publicId: string, query: string, label: string[], multiClass: boolean): Promise<any> {
    const models = Object.keys(Klasifikasi.getModels())
    if (!models || models.length == 0) throw { body: { error: 'Please build first !' } }

    const client = Klasifikasi.client
    const model = client.getModel(publicId)

    const { expiredAt } = model.credential
    if (new Date() >= new Date(expiredAt)) {
      await client.reloadToken(publicId)
    }
    const { token } = model.credential

    const result = client._zslClassify(query, label, multiClass, token)
    return result
  }

  private async _zslClassify(query: string, label: string[], multiClass: boolean, token: string): Promise<any> {
    try {
      const request = createRequest(this.opts.url, { authorization: `Bearer ${token}` }, {})
      const response = await request.post('/api/v1/ai/classify', {
        sequence: query,
        candidates: label,
        multiClass: multiClass
      })
      return response?.data
    } catch (error) {
      const status = error?.response?.status ? error.response.status : 422
      throw { status: status, body: { error: error?.response?.data?.error || 'Failed to classify query into klasifikasi !' } }
    }
  }

  private async _brandonzClassify(query: string, tags: Label[], multiClass: boolean, token: string): Promise<any> {
    try {
      const request = createRequest(this.opts.url, { authorization: `Bearer ${token}` }, {})
      const response = await request.post('/api/v1/ai/brandonz/classify', {
        sequence: query,
        label:tags,
        multiClass: multiClass
      })
      return response?.data
    } catch (error) {
      const status = error?.response?.status ? error.response.status : 422
      throw { status: status, body: { error: error?.response?.data?.error || 'Failed to classify query into klasifikasi !' } }
    }
  }

  private async _classify(publicId: string, query: string, token: string): Promise<any> {
    try {
      const request = createRequest(this.opts.url, { authorization: `Bearer ${token}` }, {})
      const response = await request.post(`/api/v1/classify/${publicId}`, {
        query: query
      })
      return response?.data
    } catch (error) {
      const status = error?.response?.status ? error.response.status : 422
      throw { status: status, body: { error: error?.response?.data?.error || 'Failed to classify query into klasifikasi !' } }
    }
  }

  private async _histories(publicId: string, query: LogQuery, token: string): Promise<any> {
    try {
      const historyUrl = `/api/v1/history/${publicId}`
      const _query = [
        `startedAt=${query.startedAt.toISOString()}`,
        `endedAt=${query.endedAt.toISOString()}`,
      ]
      if (query.skip) {
        _query.push(`skip=${query.skip}`)
      }
      if (query.take) {
        _query.push(`take=${query.take}`)
      }

      const request = createRequest(this.opts.url, { authorization: `Bearer ${token}` }, {})
      const response = await request.get(`${historyUrl}?${_query.join('&')}`)
      return response?.data
    } catch (error) {
      const status = error?.response?.status ? error.response.status : 422
      throw { status: status, body: { error: error?.response?.data?.error || 'Failed to classify query into klasifikasi !' } }
    }
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
      throw { status: status, body: { error: error?.response?.data?.error || 'Failed to get client token from klasifikasi !', credential: cred } }
    }
  }

  private static get client(): Klasifikasi {
    if (!Klasifikasi.klasifikasiClient) throw { body: { error: 'Please build first !' } }
    return Klasifikasi.klasifikasiClient
  }

  private getModel(publicId: string): KlasifikasiModel {
    if (!Klasifikasi.klasifikasiClient) throw { body: { error: 'Please build first !' } }
    if (!Klasifikasi.klasifikasiClient.modelMapping[publicId]) throw { body: { error: `Model with publicId ${publicId} not found !` } }
    return Klasifikasi.klasifikasiClient.modelMapping[publicId]
  }

  private async reloadToken(publicId: string): Promise<KlasifikasiModelMapping> {
    if (!Klasifikasi.klasifikasiClient) throw { body: { error: 'Please build first !' } }
    if (!Klasifikasi.klasifikasiClient.modelMapping[publicId]) throw { body: { error: `Model with publicId ${publicId} not found !` } }

    const { credential } = Klasifikasi.klasifikasiClient.modelMapping[publicId]
    const { auth } = await Klasifikasi.getClientToken(this.opts.url, { clientId: credential.clientId, clientSecret: credential.clientSecret })
    Klasifikasi.klasifikasiClient.modelMapping[publicId].credential = {
      ...credential,
      token: auth?.token,
      expiredAt: auth?.expiredAfter
    }

    return Klasifikasi.klasifikasiClient.modelMapping
  }

  public static getModels(): KlasifikasiModelMapping {
    return this.klasifikasiClient.modelMapping
  }

}
