<script context="module">
	export async function load({ page, fetch }) {
		const { userName, title } = page.params;

		return {
			props: {
				userName: userName,
				title: title,
				path: page.path
			}
		};
	}
</script>

<script>
	export let userName;
	export let title;
	export let path;
	const siteURL = `https://yondayo.vercel.app/${path}`;
	const siteTitle = title;
	const imageURL = `https://yondayo.s3.ap-northeast-1.amazonaws.com/ogp/${userName}/${title}.png`;
</script>

<svelte:head>
	<title>yondayo | {title} | @{userName}</title>
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="og:url" content={siteURL} />
	<meta property="og:title" content={siteTitle} />
	<meta property="og:description" content={siteTitle} />
	<meta property="og:image" content={imageURL} />
</svelte:head>

<h1>{title}</h1>
<div>作成者: {userName}</div>
<div>説明文</div>
<hr />
<div>共有するもの</div>
