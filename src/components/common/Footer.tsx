import { Button } from '~/components/ui/button'
import { useLanguage } from '~/context/LanguageContext'

import { name, repository } from '../../../package.json'

export const Footer = () => {
  const { strings } = useLanguage()

  return (
    <footer className="border-t border-border bg-background-secondary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3 text-sm text-text-secondary">
            <span>{strings.madeBy}</span>
              <i className="i-mingcute-github-line text-base" />
              <span>{strings.developedBy}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-px h-4 bg-separator" />

            <span className="text-xs text-text-secondary">{strings.repoName}</span>
          </div>
          <div className="text-xs text-text-tertiary text-center">
            © {new Date().getFullYear()} {strings.copyright}
          </div>
        </div>
      </div>
    </footer>
  )
}
