import fs from 'node:fs'
import path from 'node:path'
import { google } from 'googleapis'
import pLimit from 'p-limit'
import sharp from 'sharp'
import xlsx from 'xlsx'

const KEY_PATH = 'service-account-key.json'
const OUTPUT_DIR = './images'
const EXCEL_FILE = 'correspondences.xlsx'
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

const langDrives = {
  A1: {
    //de_DE: '1WuZlnKBhrkegr62WtLJjuKr5h7L0HdP9',
    //en_US: '1GrxHFzSYNY6EIJq4tbFjCc9rVFz2Mz8J',
    // es_ES: '1pxLGCplPACsZ5xHqHARi-9GWUfToBCKT',
    // fr_FR: '1UeXp69LArJzjI37-MCfjcf61RuvbSzUb',
    // it_IT: '1h1tr_97f2RexKmaUxpjKo4Jkv3CSzrMK',
    // ja_JP: '1aUmc1vkDgTGC-s8jQo-p0MYVLt2KuHL_',
    // ko_KR: '1ToLVOEpA_ZJhuKXTxHVYREpEsuQ_-gPH',
    // pt_BR: '1CrSAj0pvn5EPUp96KYjgUqbFIetjhnYj',
    // zh_TW: '1uLvOJ_RseWsN_GxCAR1YaHs5xAo29uvy',
  },

  A1a: {
    // de_DE: '1Pk3RUh72hFmcvB08vZtJSRZoqu3yWY5K',
    // en_US: '1IxAtxFzN5LTnSW-R2aS_qRa62T5wa3q_',
    // es_ES: '1UasYM8vwH8lLAENbBuPm6ZE4CNd2aSmN',
    // fr_FR: '1DU2Y_YcHOVfzXT8JNJo560guLf1udvOA',
    // it_IT: '1GahYuhsd-lF9SBLmIOz4ZfCRlbHFRj9u',
    // ja_JP: '1VFhmwemAXkglvCWQ16zqKPJg2cDetmib',
    // ko_KR: '1aRB5ZlTF8teHWoTuEc3EIPo6EceWT1HW',
    // pt_BR: '1C3sLlT-gbTeLWa_69n41TjVXFT3hOjDO',
    // zh_TW: '1b00AKLj_VXaTHWlH2uQHIZQ4MzUDKL1P',
  },

  A2: {
    // de_DE: '1Zj6oN3q__zomWiFQwBAn7ETKA6fSGp6k',
    // en_US: '1RQdRNJGedIr9eMOxJyLCdvOJZdR8fQzo',
    // es_ES: '11PqnGzeSEBhg4dCgEdBTIb8XIIYdbVMw',
    // fr_FR: '1HxsFr2Mi0gjG0j7C3lead7TFMkH-CdUi',
    // it_IT: '1jR7DLArIrVOSiMSZDQZ8hTWgZ-uunA0W',
    // ja_JP: '1ZvKND1xcJJwRQDqlJj_x6x4bP3nP0sNg',
    // ko_KR: '1WKDM2_MyjxcofvsjOdjF_tM--hvvhM9u',
    // pt_BR: '1Ix5iWT4eypTCV6iLgKTkBlesv5FzxbTt',
    // zh_TW: '1_UhthGS1vH0tmj9HRsLYO2GrYj4gq5HF',
  },

  A2a: {
    // de_DE: '12juQyZNCXvuZ3Qtno1RG61kXLPNlczbM',
    // en_US: '1duLLWE4lpI-VRQD3CGnjneS_dmYRjT9Q',
    // es_ES: '1tNTwXoaizQkp-Zsg2uOZwP57mn_ivs_6',
    // fr_FR: '1tRlofAUup-bqImfd98NPdAkxdHcj18fU',
    // it_IT: '1VnkQ2ONs6sGOBf_Ya9-7zSorOOmviTRP',
    // ja_JP: '1RKltVEovsFlBK7QgNDC8YckJuipVpLHn',
    // ko_KR: '1yVa9LfW9quNeCrfe0ACfdNSEsYwM_cSN',
    // pt_BR: '1PHKoPIem2SQmo2lD0Uuln6M0Sb4FZSGa',
    // zh_TW: '1OSv-l9TELgqlhm0Rdj8MPsRDeq9SsHXE',
  },

  A2b: {
    // de_DE: '1fIbN52PBZKVATaB4fpTAgCmmOujSY6aZ',
    // en_US: '1D-46uLIhkpi5i42ZgkMztw83pY2vHYZc',
    // es_ES: '1knTGP9CbjFPD_xC96fiGN68oojilZI9n',
    // fr_FR: '1Y2x4STgzGXP_sIfYHoDK-EgJKglJ0W8R',
    // it_IT: '1mqxd5JXeaVFjQ8uSTvO_8-IUyJm-dQfm',
    // ja_JP: '15cyWmc0xITiunVXbORNVlxzeq_DMIBVs',
    // ko_KR: '1S_m2TOPSlCfxBJ61G9AxpnsfYZ1BAIg8',
    // pt_BR: '1iXKUtn8KBwVKjXAIrllnVvvw_kfHJh16',
    // zh_TW: '1a1A478qt5LlGbkLnlc7MwPxglQBgOzXi',
  },

  A3: {
    // de_DE: '1T3OYI34CfsCEtNkVGBXzsT41cKHNKloT',
    // en_US: '199JiOY5TnzHvUyEaW2Y5pUaeR_tQxFNV',
    es_ES: '1keNnjFk7DJrVEWmM5J0TcjXuijgIPNzP',
    // fr_FR: '1dLEr9KAe2_AqVw2gCIxGme79dDVv4hH-',
    it_IT: '1BNzn4d6IfNYx7hSJNsCsm-lOrjqh_qN_',
    // ja_JP: '1vXBlkpbdYAL58i92ndKiScQBk3spr-5I',
    // ko_KR: '1nyRJbG7KAFnNy_1mUICUqeCrXv01IHsf',
    pt_BR: '1Yt5Psj3xmE17YBNSheQ9t-qznclnnGrB',
    // zh_TW: '1bD10mOSrQMTyQ7AFrFIOsXP7O-zKAq9a',
  }
}

let drive

async function authenticate() {
  const auth = new google.auth.GoogleAuth({ keyFile: KEY_PATH, scopes: SCOPES })
  const authClient = await auth.getClient()
  drive = google.drive({ version: 'v3', auth: authClient })
}

function getCorrespondances(sheetName) {
  const workbook = xlsx.readFile(EXCEL_FILE)
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return []

  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 })
  const [headers, ...data] = rows

  const oldIndex = headers.indexOf('old_code')
  const newIndex = headers.indexOf('new_code')

  return data
    .filter((row) => row[oldIndex] && row[newIndex])
    .map((row) => ({
      old: String(row[oldIndex]),
      new: String(row[newIndex]),
    }))
}

function applyCorrespondance(name, correspondances) {
  for (const { old, new: renamed } of correspondances) {
    if (name.startsWith(old)) return name.replace(old, renamed)
  }
  return name
}

async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath).toFormat('webp').toFile(outputPath)
    fs.unlinkSync(inputPath)
  } catch (error) {
    console.error('❌ Error converting to WebP:', error)
  }
}

async function downloadImage(fileId, tempName, finalName, lang) {
  const langDir = path.join(OUTPUT_DIR, lang).replace('_', '-')
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true })

  const filePath = path.join(langDir, tempName)
  const webpFilePath = path.join(langDir, finalName)

  if (fs.existsSync(webpFilePath)) {
    throw new Error(`File ${finalName} already exists.`)
  }

  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' })

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath)
    res.data.pipe(writer)
    res.data.on('error', reject)
    writer.on('finish', async () => {
      await convertToWebP(filePath, webpFilePath)
      resolve(webpFilePath)
    })
    writer.on('error', reject)
  })
}

async function scrapeImages(tableId, folderId, lang) {
  const correspondances = getCorrespondances(tableId)

  const res = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: 'files(id, name)',
    pageSize: 1000,
  })

  const files = res.data.files
    .map((file) => {
      if (
        file.name.startsWith('cTR_10_000290_00_OOKINAMANTO_U_M_M') ||
        file.name.startsWith('cTR_10_000300_00_GOTSUGOTSUMETTO_U_M_M') ||
        file.name.startsWith('cTR_10_000310_00_RAMUNOMI_U_M_M')
      ) {
        return null
      }
      const corrected = applyCorrespondance(file.name, correspondances)
      return {
        id: file.id,
        originalName: file.name,
        correctedName: corrected,
      }
    })
    .filter((file) => file !== null)

  // Patch : Old Amber is missing in A1a drive
  if (tableId === 'A1a') {
    const parentDriveId = langDrives.A1[lang]
    if (parentDriveId) {
      const resA1 = await drive.files.list({
        q: `'${parentDriveId}' in parents and name contains 'cTR_10_000100'`,
        fields: 'files(id, name)',
        pageSize: 1,
      })

      const missing = resA1.data.files?.[0]
      if (missing) {
        files.push({
          id: missing.id,
          originalName: missing.name,
          correctedName: 'cPK_10_002760_00',
        })
      }
    }
  }

  files.sort((a, b) => a.correctedName.localeCompare(b.correctedName))

  let index = 0
  const tasks = files.map(async (file) => {
    let finalName
    const langPrefix = lang.split('_')[0].toUpperCase()
    if (file.correctedName.startsWith('P-A')) {
      const correctedNameWithoutPng = file.correctedName.replace('.png', '')
      finalName = `P-A_${correctedNameWithoutPng.split('_')[1]}_${langPrefix}.webp`
    } else {
      index++
      const prefix = tableId
      const indexStr = String(index).padStart(3, '0')
      finalName = `${prefix}_${indexStr}_${langPrefix}.webp`
    }

    try {
      await downloadImage(file.id, file.originalName, finalName, lang)
      console.log(`✅ ${finalName} downloaded.`)
    } catch (err) {
      console.warn(err.message)
    }
  })

  await Promise.all(tasks)
}

async function scrapeAll() {
  await authenticate()
  const limit = pLimit(3)

  const tasks = Object.entries(langDrives).flatMap(([tableId, langs]) =>
    Object.entries(langs).map(([lang, folderId]) => limit(() => scrapeImages(tableId, folderId, lang))),
  )

  await Promise.all(tasks)
  console.log('🎉 All images downloaded.')
  process.exit(0)
}

scrapeAll()
