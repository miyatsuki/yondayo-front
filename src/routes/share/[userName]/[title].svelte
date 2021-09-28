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
	import { GraphQLClient, gql } from 'graphql-request';
	import { HASURA_URL } from '$lib/env.js';
	import { is_client } from 'svelte/internal';

	export let userName;
	export let title;
	export let path;
	const siteURL = `https://yondayo.vercel.app/${path}`;
	const siteTitle = title;
	const imageURL = `https://yondayo.s3.ap-northeast-1.amazonaws.com/ogp/${userName}/${title}.png`;

	const graphQLClient = new GraphQLClient(HASURA_URL);
	const query = gql`
		query MyQuery($pageTitle: String, $userName: String) {
			book(
				where: { pageTitle: { _eq: $pageTitle }, userName: { _eq: $userName } }
				order_by: { order: asc }
			) {
				bookTitle
				bookURL
				description
				bookImageURL
			}
			page(where: { title: { _eq: $pageTitle }, userName: { _eq: $userName } }) {
				description
			}
		}
	`;
	const variables = { userName: userName, pageTitle: title };

	var books = [];
	graphQLClient.request(query, variables).then((result) => {
		console.log(result);
		books = result['book'];
	});
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

{#if books.length > 0}
	{#each books as book, i (`book-${i}`)}
		<div>
			<span>{book.bookTitle}</span>
			<img src={book.bookImageURL} alt={book.bookTitle} />
		</div>
	{/each}
{/if}
