import { NextResponse } from 'next/server'
import { API_BASE } from '../../_utils/env'
import { fetchJson, toNextJson, wrapAuth } from '../../_utils/auth'

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

export const GET = wrapAuth(async ({ headers }, _req: Request, { params }: { params: { productId: string } }) => {
  const productId = (params?.productId ?? '').trim()
  if (!productId) return NextResponse.json({ message: 'productId is required' }, { status: 400 })

  const [productRes, variantsRes, basePriceRes, recipeSetRes] = await Promise.all([
    fetchJson(`${API_BASE}/v2/products/${productId}`, { headers, cache: 'no-store' }),
    fetchJson(`${API_BASE}/v2/products/variants`, { headers, cache: 'no-store' }),
    fetchJson(`${API_BASE}/v2/products/base-prices`, { headers, cache: 'no-store' }),
    fetchJson(`${API_BASE}/v2/products/recipe-sets`, { headers, cache: 'no-store' }),
  ])

  if (!productRes.res.ok) return toNextJson(productRes.res, productRes.data)
  if (!variantsRes.res.ok) return toNextJson(variantsRes.res, variantsRes.data)
  if (!basePriceRes.res.ok) return toNextJson(basePriceRes.res, basePriceRes.data)
  if (!recipeSetRes.res.ok) return toNextJson(recipeSetRes.res, recipeSetRes.data)

  const product = normalizeProduct(productRes.data)
  const variants = Array.isArray(variantsRes.data)
    ? variantsRes.data.map(normalizeVariant).filter((v) => v.productId === productId)
    : []
  const basePrices = Array.isArray(basePriceRes.data)
    ? basePriceRes.data.map(normalizeBasePrice).filter((p) => p.productId === productId)
    : []
  const recipeSets = Array.isArray(recipeSetRes.data)
    ? recipeSetRes.data.map(normalizeRecipeSet).filter((r) => r.productId === productId)
    : []

  return NextResponse.json({ product, variants, basePrices, recipeSets })
})












