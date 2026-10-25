import { nextTestSetup } from 'e2e-utils'
import { retry } from 'next-test-utils'

describe('dev Cache-Control header', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  it('should use no-store for pages router', async () => {
    const res = await next.fetch('/pages-route')
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('should use no-store for app router', async () => {
    const res = await next.fetch('/app-route')
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('should still revalidate unchanged static assets', async () => {
    const $ = await next.render$('/app-route')
    const asset = $('script[src]')
      .map((_, element) => $(element).attr('src'))
      .get()
      .find((src) => src.startsWith('/_next/static/'))
    expect(asset).toBeDefined()

    const response = await next.fetch(asset)
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe(
      'no-cache, must-revalidate'
    )
    const etag = response.headers.get('ETag')
    expect(etag).toBeTruthy()

    const cached = await next.fetch(asset, {
      headers: { 'If-None-Match': etag },
    })
    expect(cached.status).toBe(304)
  })

  it('should finish a streamed document without reloading it', async () => {
    let navigations = 0
    const browser = await next.browser('/streaming', {
      beforePageLoad(page) {
        page.on('request', (request) => {
          if (
            request.isNavigationRequest() &&
            request.url().endsWith('/streaming')
          ) {
            navigations++
          }
        })
      },
    })
    await retry(async () => {
      expect(await browser.elementById('streamed').text()).toBe(
        'Stream complete'
      )
    })
    await browser.elementById('increment').click()
    await retry(async () => {
      expect(await browser.elementById('count').text()).toBe('Count: 1')
    })
    expect(navigations).toBe(1)
  })
})
