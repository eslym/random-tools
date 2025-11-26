import faviconSvg from '$lib/assets/favicon.svg?url';

export const prerender = true;

export function GET() {
	return Response.json(
		{
			name: 'Random Tools',
			short_name: 'RandomTools',
			start_url: '/',
			display: 'standalone',
			background_color: '#fcfcff',
			theme_color: '#fcfcff',
			icons: [
				{
					src: faviconSvg,
					sizes: 'any',
					type: 'image/svg+xml'
				}
			]
		},
		{
			headers: {
				'Content-Type': 'application/manifest+json;charset=UTF-8'
			}
		}
	);
}
