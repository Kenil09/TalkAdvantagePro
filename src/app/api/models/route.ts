import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://openrouter.ai/api/frontend/models', {
      method: 'GET',
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        priority: 'u=1, i',
        referer: 'https://openrouter.ai/models',
        'sec-ch-ua':
          '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 },
    )
  }
}
