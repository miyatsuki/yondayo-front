<script>
	import { GraphQLClient, gql } from 'graphql-request';
	import { HASURA_URL } from '$lib/env.js';

	var books = [];
	var newBook;
	var editingBook;
	var id = 1;

	var userName = '';
	var title = '';
	var description = '';

	function handleEditConfirmButton() {
		const newBooks = [];
		for (var book of books) {
			if (editingBook.id !== book.id) {
				newBooks.push(book);
			} else {
				newBooks.push(editingBook);
			}
		}

		books = [...newBooks];
		editingBook = null;
	}

	function handleDeleteButtonClick(deleteBook) {
		const newBooks = [];
		for (var book of books) {
			if (deleteBook.id !== book.id) {
				newBooks.push(book);
			}
		}

		books = [...newBooks];
		editingBook = null;
	}

	async function handlePublicButtonClick() {
		const response = await fetch('https://za4d2r8b95.execute-api.ap-northeast-1.amazonaws.com', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user_name: userName,
				title: title,
				image_url: books.map((book) => {
					return book.imageURL;
				})
			})
		});
	}

	function handleEditButtonClick(book) {
		editingBook = { ...book };
	}

	function hancleAddButtonClick() {
		newBook = {
			id: id,
			title: '',
			URL: '',
			imageURL: '',
			description: ''
		};
	}

	function handleAddConfirmButton() {
		books = [...books, newBook];
		id += 1;
		newBook = null;
	}

	function handleCancelButton() {
		editingBook = null;
		newBook = null;
	}
</script>

<div>紹介したいものを記入してください</div>
<div>
	<input bind:value={userName} placeholder="ユーザ名" /><br />
	<input bind:value={title} placeholder="タイトル" /><br />
	<textarea bind:value={description} placeholder="説明文" />
</div>
<div>
	{#if books}
		{#each books as book, id (book.id)}
			{#if !editingBook || book.id !== editingBook.id}
				<div>
					<span>#{id}</span>
					<span>{book.title}</span>
					<span>{book.URL}</span>
					<span>{book.imageURL}</span>
					<span>{book.description}</span>
					<button on:click={() => handleEditButtonClick(book)}>編集</button>
					<button on:click={() => handleDeleteButtonClick(book)}>削除</button>
				</div>
			{:else}
				<div>
					<input bind:value={editingBook.title} placeholder="タイトル" />
					<input bind:value={editingBook.URL} placeholder="URL" />
					<input bind:value={editingBook.imageURL} placeholder="画像URL" />
					<input bind:value={editingBook.description} placeholder="紹介文" />
					<button on:click={() => handleEditConfirmButton(book)}>更新</button>
					<button on:click={handleCancelButton}>キャンセル</button>
				</div>
			{/if}
		{/each}
	{/if}
	{#if newBook}
		<div>
			<input bind:value={newBook.title} placeholder="タイトル" />
			<input bind:value={newBook.URL} placeholder="URL" />
			<input bind:value={newBook.imageURL} placeholder="画像URL" />
			<input bind:value={newBook.description} placeholder="紹介文" />
			<button on:click={handleAddConfirmButton}>確定</button>
			<button on:click={handleCancelButton}>キャンセル</button>
		</div>
	{/if}
</div>
{#if books.length < 10 && !newBook}
	<button on:click={hancleAddButtonClick}>追加</button>
{/if}
{#if books.length > 0 && !newBook && !editingBook && userName && title}
	<button on:click={handlePublicButtonClick}>公開</button>
{/if}
