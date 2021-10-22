import vercel from '@sveltejs/adapter-vercel';

export default {
	kit: {
		adapter: vercel(),
		vite: {
			define: {
				"process.env": process.env
			}
		}
	}
};