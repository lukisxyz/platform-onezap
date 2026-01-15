import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'OneZap',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Toaster />
        <Providers>
          <RootOutlet />
        </Providers>
        <Scripts />
      </body>
    </html>
  )
}

function RootOutlet() {
  const Outlet = createRootRoute.useOutlet()
  return Outlet
}

