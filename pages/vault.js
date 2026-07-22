import SEOHead from '../components/SEOHead'
import VaultBuilder from '../components/VaultBuilder'
import { catalog } from '../data/catalog'

export async function getStaticProps() {
  return { props: { catalog } }
}

export default function VaultPage({ catalog }) {
  return (
    <>
      <SEOHead
        title="Premium Obsidian Vault — CodeSheets"
        description="Complete developer reference vault for Obsidian. 1,100+ entries across 11 domains with cross-domain links, learning paths, AI prompt templates, and a spaced repetition study system."
        canonical="https://codesheets.dev/vault"
      />

      <main className="vault-page">
        <VaultBuilder catalog={catalog} />
      </main>
    </>
  )
}
