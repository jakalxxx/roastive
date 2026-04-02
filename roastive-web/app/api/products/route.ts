import { NextResponse } from 'next/server'
import { API_BASE } from '../_utils/env'
import { fetchJson, readJson, toNextJson, wrapAuth } from '../_utils/auth'

type RawProduct = Record<string, any>
type RawVariant = Record<string, any>
type RawBasePrice = Record<string, any>
type RawRecipeSet = Record<string, any>

function normalizeProduct(item: RawProduct) {
  return {
    productId: String(item.productId ?? item.product_id ?? ''),
    roasteryId: String(item.roasteryId ?? item.roastery_id ?? ''),
    productName: String(item.productName ?? item.product_name ?? ''),
    productType: String(item.productType ?? item.product_type ?? ''),
    unit: String(item.unit ?? ''),
    avgLossRate: item.avgLossRate ?? item.avg_loss_rate ?? null,
    description: item.description ?? '',
    status: String(item.status ?? 'ACTIVE'),
    basePrice: item.basePrice ?? item.base_price ?? null,
    createdAt: item.createdAt ?? item.created_at ?? null,
    updatedAt: item.updatedAt ?? item.updated_at ?? null,
  }
}

function normalizeVariant(item: RawVariant) {
  return {
    variantId: String(item.variantId ?? item.variant_id ?? ''),
    productId: String(item.productId ?? item.product_id ?? ''),
    unitSize: Number(item.unitSize ?? item.unit_size ?? 0),
    unit: String(item.unit ?? ''),
    sku: item.sku ?? '',
    status: String(item.status ?? 'ACTIVE'),
    createdAt: item.createdAt ?? item.created_at ?? null,
    updatedAt: item.updatedAt ?? item.updated_at ?? null,
  }
}

function normalizeBasePrice(item: RawBasePrice) {
  return {
    priceId: String(item.priceId ?? item.price_id ?? ''),
    productId: String(item.productId ?? item.product_id ?? ''),
    currency: String(item.currency ?? 'USD'),
    amount: Number(item.amount ?? 0),
    priceLabel: item.priceLabel ?? item.price_label ?? '',
    effectiveFrom: item.effectiveFrom ?? item.effective_from ?? null,
    effectiveTo: item.effectiveTo ?? item.effective_to ?? null,
    createdAt: item.createdAt ?? item.created_at ?? null,
    updatedAt: item.updatedAt ?? item.updated_at ?? null,
  }
}

function normalizeRecipeSet(item: RawRecipeSet) {
  return {
    setId: String(item.setId ?? item.set_id ?? ''),
    productId: String(item.productId ?? item.product_id ?? ''),
    setName: String(item.setName ?? item.set_name ?? ''),
    description: item.description ?? '',
    status: String(item.status ?? 'ACTIVE'),
    ingredients: item.ingredients,
    createdAt: item.createdAt ?? item.created_at ?? null,
    updatedAt: item.updatedAt ?? item.updated_at ?? null,
  }
}

export const GET = wrapAuth(async ({ headers, rid }) => {
  const roasteryId = (rid ?? '').trim()
  if (!roasteryId) {
    return NextResponse.json({ items: [], total: 0, message: '로스터리 정보를 확인할 수 없습니다.' })
  }

  const productQuery = new URLSearchParams({ roasteryId })
  const [productsRes, variantsRes, basePriceRes, recipeSetRes] = await Promise.all([
    fetchJson(`${API_BASE}/v2/products?${productQuery.toString()}`, { headers, cache: 'no-store' }),
    fetchJson(`${API_BASE}/v2/products/variants`, { headers, cache: 'no-store' }),
    fetchJson(`${API_BASE}/v2/products/base-prices`, { headers, cache: 'no-store' }),
    fetchJson(`${API_BASE}/v2/products/recipe-sets`, { headers, cache: 'no-store' }),
  ])

  if (!productsRes.res.ok) return toNextJson(productsRes.res, productsRes.data)
  if (!variantsRes.res.ok) return toNextJson(variantsRes.res, variantsRes.data)
  if (!basePriceRes.res.ok) return toNextJson(basePriceRes.res, basePriceRes.data)
  if (!recipeSetRes.res.ok) return toNextJson(recipeSetRes.res, recipeSetRes.data)

  const variants = Array.isArray(variantsRes.data) ? variantsRes.data.map(normalizeVariant) : []
  const basePrices = Array.isArray(basePriceRes.data) ? basePriceRes.data.map(normalizeBasePrice) : []
  const recipeSets = Array.isArray(recipeSetRes.data) ? recipeSetRes.data.map(normalizeRecipeSet) : []

  const variantMap = new Map<string, ReturnType<typeof normalizeVariant>[]>()
  for (const variant of variants) {
    if (!variant.productId) continue
    if (!variantMap.has(variant.productId)) variantMap.set(variant.productId, [])
    variantMap.get(variant.productId)!.push(variant)
  }

  const basePriceMap = new Map<string, ReturnType<typeof normalizeBasePrice>[]>()
  for (const price of basePrices) {
    if (!price.productId) continue
    if (!basePriceMap.has(price.productId)) basePriceMap.set(price.productId, [])
    basePriceMap.get(price.productId)!.push(price)
  }

  const recipeSetMap = new Map<string, ReturnType<typeof normalizeRecipeSet>[]>()
  for (const set of recipeSets) {
    if (!set.productId) continue
    if (!recipeSetMap.has(set.productId)) recipeSetMap.set(set.productId, [])
    recipeSetMap.get(set.productId)!.push(set)
  }

  const mastersRaw = Array.isArray(productsRes.data) ? productsRes.data : []
  const masters = mastersRaw
    .map(normalizeProduct)
    .filter((item) => (item.roasteryId ?? '').trim() === roasteryId)
    .map((item) => ({
      ...item,
      variants: variantMap.get(item.productId) ?? [],
      basePrices: basePriceMap.get(item.productId) ?? [],
      recipeSets: recipeSetMap.get(item.productId) ?? [],
    }))

  return NextResponse.json({ items: masters, total: masters.length })
})

export const POST = wrapAuth(async ({ headers, rid }, req: Request) => {
  const body = await readJson(req)
  const roasteryIdFromBody = String(body?.roasteryId ?? body?.roastery_id ?? '').trim()
  const roasteryId = roasteryIdFromBody || (rid ? String(rid).trim() : '')
  if (!roasteryId) {
    return NextResponse.json({ message: '로스터리 정보를 확인할 수 없습니다.' }, { status: 400 })
  }
  const productName = String(body?.productName ?? '').trim()
  if (!productName) {
    return NextResponse.json({ message: '제품명을 입력해주세요.' }, { status: 400 })
  }
  const productType = String(body?.productType ?? '').trim() || 'BLEND'
  const unit = String(body?.unit ?? '').trim() || 'KG'
  const status = String(body?.status ?? 'ACTIVE').trim() || 'ACTIVE'
  const avgLossRate = body?.avgLossRate ? Number(body.avgLossRate) : undefined
  const basePrice = body?.basePrice ? Number(body.basePrice) : undefined
  const description = body?.description ? String(body.description).trim() : undefined
  const variants: Array<any> = Array.isArray(body?.variants) ? body.variants : []
  const basePrices: Array<any> = Array.isArray(body?.basePrices) ? body.basePrices : []
  const recipeSets: Array<any> = Array.isArray(body?.recipeSets) ? body.recipeSets : []

  const payload = {
    roasteryId,
    productName,
    productType,
    unit,
    avgLossRate,
    description,
    status,
    basePrice,
  }

  const createRes = await fetchJson(`${API_BASE}/v2/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!createRes.res.ok) return toNextJson(createRes.res, createRes.data)
  const createdMaster = normalizeProduct(createRes.data?.product ?? createRes.data)
  const productId = createdMaster.productId

  const createdVariants: ReturnType<typeof normalizeVariant>[] = []
  for (const variant of variants) {
    const unitSize = Number(variant?.unitSize ?? 0)
    const variantUnit = String(variant?.unit ?? '').trim() || unit
    const variantStatus = String(variant?.status ?? 'ACTIVE').trim() || 'ACTIVE'
    if (!unitSize) continue
    const variantPayload = {
      productId,
      unitSize,
      unit: variantUnit,
      sku: variant?.sku ? String(variant.sku).trim() : undefined,
      status: variantStatus,
    }
    const result = await fetchJson(`${API_BASE}/v2/products/variants`, {
      method: 'POST',
      headers,
      body: JSON.stringify(variantPayload),
    })
    if (!result.res.ok) {
      console.error('[products] variant create failed', await result.res.text())
      continue
    }
    createdVariants.push(normalizeVariant(result.data?.variant ?? result.data))
  }

  const createdBasePrices: ReturnType<typeof normalizeBasePrice>[] = []
  for (const price of basePrices) {
    const amount = Number(price?.amount ?? 0)
    const currency = String(price?.currency ?? '').trim() || 'KRW'
    if (!amount) continue
    const pricePayload = {
      productId,
      currency,
      amount,
      priceLabel: price?.priceLabel ? String(price.priceLabel).trim() : undefined,
      effectiveFrom: price?.effectiveFrom || undefined,
      effectiveTo: price?.effectiveTo || undefined,
    }
    const result = await fetchJson(`${API_BASE}/v2/products/base-prices`, {
      method: 'POST',
      headers,
      body: JSON.stringify(pricePayload),
    })
    if (!result.res.ok) {
      console.error('[products] base price create failed', await result.res.text())
      continue
    }
    createdBasePrices.push(normalizeBasePrice(result.data?.price ?? result.data))
  }

  const createdRecipeSets: ReturnType<typeof normalizeRecipeSet>[] = []
  for (const set of recipeSets) {
    const setName = String(set?.setName ?? '').trim()
    if (!setName) continue
    const recipeSetPayload = {
      productId,
      setName,
      description: set?.description ? String(set.description).trim() : undefined,
      status: String(set?.status ?? 'ACTIVE').trim() || 'ACTIVE',
      ingredients: set?.ingredients ? JSON.stringify(set.ingredients) : undefined,
    }
    const result = await fetchJson(`${API_BASE}/v2/products/recipe-sets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(recipeSetPayload),
    })
    if (!result.res.ok) {
      console.error('[products] recipe set create failed', await result.res.text())
      continue
    }
    createdRecipeSets.push(normalizeRecipeSet(result.data?.recipeSet ?? result.data))
  }

  return NextResponse.json({
    product: createdMaster,
    variants: createdVariants,
    basePrices: createdBasePrices,
    recipeSets: createdRecipeSets,
  })
})

