import iconSvg from '$lib/assets/icon-maskable.svg?url';

export const prerender = true;

export function GET() {
	return Response.json(
		{
			name: 'Random Tools',
			short_name: 'RandomTools',
			start_url: '/',
			display: 'standalone',
			background_color: '#f8f8ff',
			theme_color: '#fbfbff',
			icons: [
				{
					src: iconSvg,
					sizes: 'any',
					type: 'image/svg+xml',
					purpose: 'maskable'
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
