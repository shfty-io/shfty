'use client';

import { Github } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function HomeHero() {
  return (
    <div className="relative overflow-hidden rounded-lg pt-12 mb-8">
      {/* Background elements removed */}
      
      <div className="relative px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Buy, Sell, and Share GitHub Repositories
        </h1>
        
        <p className="mt-4 text-lg leading-7 text-gray-600">
          Monetize your projects, buy ready-to-use software solutions, or find templates to accelerate your development.
          The ultimate developer marketplace for GitHub repositories.
        </p>
        
        <div className="mt-8 flex justify-center space-x-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="https://x.com/shfty_io" target="_blank" rel="noopener noreferrer" className="transition-all hover:opacity-80">
                  <svg className="h-6 w-6" viewBox="0 0 16 16" fill="#000000" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                  </svg>
                  <span className="sr-only">X</span>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Follow us on X</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="https://discord.gg/shfty" target="_blank" rel="noopener noreferrer" className="transition-all hover:opacity-80">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#5865F2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <span className="sr-only">Discord</span>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Join our Discord community</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="https://www.producthunt.com/products/shfty" target="_blank" rel="noopener noreferrer" className="transition-all hover:opacity-80">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#DA552F" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12.6883 6.25511H8.5V17.7551H10.9048V14.3775H12.6883C14.9541 14.3775 16.8354 12.7055 16.8354 10.3163C16.8354 7.9271 14.9541 6.25511 12.6883 6.25511ZM12.5909 11.9183H10.9048V8.71428H12.5909C13.6161 8.71428 14.4504 9.42653 14.4504 10.3163C14.4504 11.2061 13.6161 11.9183 12.5909 11.9183Z" />
                  </svg>
                  <span className="sr-only">Product Hunt</span>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Support us on Product Hunt</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="https://github.com/shfty-io/shfty" target="_blank" rel="noopener noreferrer" className="transition-all hover:opacity-80">
                  <Github className="h-6 w-6 text-[#181717]" />
                  <span className="sr-only">GitHub Repository</span>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>View our GitHub repository</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
} 