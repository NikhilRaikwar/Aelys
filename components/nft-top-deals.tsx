import React from "react"

interface NftTopDealsProps {
  deals: Array<{
    chain_id: string
    closing_timestamp: string
    collection_name: string
    contract_address: string
    deal_score: number
    estimated_eth_price: number
    listed_eth_price: number
    listing_timestamp: string
    marketplace: string
    thumbnail_palette: string
    thumbnail_url: string
    token_id: string
  }>
}

export function NftTopDeals({ deals }: NftTopDealsProps) {
  if (!deals || deals.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">No NFT top deals found.</div>
    )
  }

  return (
    <div className="py-6">
      <h3 className="text-lg font-semibold mb-4 text-center">NFT Top Deals</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {deals.map((deal) => (
          <div
            key={`${deal.contract_address}-${deal.token_id}`}
            className="rounded-xl bg-white dark:bg-muted p-3 shadow border border-border flex flex-col transition hover:shadow-lg"
          >
            <div className="aspect-square w-full relative overflow-hidden rounded-lg mb-3 bg-slate-100 dark:bg-muted">
              <img
                src={deal.thumbnail_url}
                alt={deal.collection_name}
                className="object-cover w-full h-full transition-all hover:scale-105"
                style={{ minHeight: 0, minWidth: 0, maxWidth: "100%", maxHeight: "300px", aspectRatio: "1/1" }}
                loading="lazy"
              />
            </div>
            <div className="mb-1">
              <div className="font-medium truncate text-base">
                {deal.collection_name}
              </div>
              <div className="text-xs text-muted-foreground">
                Token #{deal.token_id} &bull; {deal.marketplace}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs mt-2 space-x-2">
              <span className="font-mono text-primary font-semibold">
                <span className="opacity-70 text-xs">Deal Score</span> <span>{deal.deal_score.toFixed(2)}</span>
              </span>
              <span className="text-xs text-gray-500">Chain: {deal.chain_id === "1" ? "Ethereum" : deal.chain_id}</span>
            </div>
            <div className="flex flex-col mt-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Est. Price</span>
                <span className="font-mono">{deal.estimated_eth_price} ETH</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">List Price</span>
                <span className="font-mono font-bold text-success">{deal.listed_eth_price} ETH</span>
              </div>
            </div>
            <div className="mt-2">
              <a
                href={`https://opensea.io/assets/ethereum/${deal.contract_address}/${deal.token_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-xs font-semibold text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition"
              >
                View on OpenSea
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

