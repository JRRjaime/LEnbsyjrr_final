import { Container } from "./container"
import { siteConfig } from "@/lib/data"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#141414] py-8 mt-16">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-[#B4B4B4] text-sm">
            © {currentYear} {siteConfig.name}
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a
              href={`mailto:${siteConfig.social.email}`}
              className="text-[#B4B4B4] hover:text-[#10B981] transition-colors focus-visible"
            >
              Email
            </a>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B4B4B4] hover:text-[#10B981] transition-colors focus-visible"
            >
              Instagram
            </a>
            <a
              href={siteConfig.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B4B4B4] hover:text-[#10B981] transition-colors focus-visible"
            >
              TikTok
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
