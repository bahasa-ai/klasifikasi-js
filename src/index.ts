import 'source-map-support/register'
import { KlasifikasiConfig, OtorisasiCredentialsMaping } from './Types'
import { Otorisasi } from './Service/Otorisasi'
import { BASE_URL } from './Constant'
export default class Klasifikasi {

  private static klasifikasiClient: Klasifikasi

  private constructor(private opts: KlasifikasiConfig, private otorisasiClient: Otorisasi) { }

  public static async build(opts: KlasifikasiConfig): Promise<Klasifikasi> {
    if (!Klasifikasi.klasifikasiClient) {

      opts.url = {
        ...BASE_URL,
        ...opts.url
      }

      const otorisasiClient = await Otorisasi.build(opts.url.otorisasi_url, opts.creds)

      Klasifikasi.klasifikasiClient = new Klasifikasi(opts, otorisasiClient)
    }
    return Klasifikasi.klasifikasiClient
  }

  public static getOtorisasiMapping(): OtorisasiCredentialsMaping {
    return this.klasifikasiClient.otorisasiClient.creds
  }


}