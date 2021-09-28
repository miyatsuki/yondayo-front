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
					return book.bookImageURL;
				})
			})
		});

		const graphQLClient = new GraphQLClient(HASURA_URL);
		const query = gql`
			mutation MyMutation(
				$userName: String
				$pageTitle: String
				$description: String
				$books: [book_insert_input]!
			) {
				insert_page(
					objects: { userName: $userName, title: $pageTitle, description: $description }
				) {
					returning {
						id
					}
				}
				insert_book(objects: $books) {
					returning {
						id
					}
				}
			}
		`;
		const variables = {
			userName: userName,
			pageTitle: title,
			books: books.map((bookFragment, index) => {
				let book = { ...bookFragment };
				delete book.id;
				book['order'] = index;
				book['pageTitle'] = title;
				book['userName'] = userName;
				return book;
			})
		};
		graphQLClient.request(query, variables);
	}

	function handleEditButtonClick(book) {
		editingBook = { ...book };
	}

	function hancleAddButtonClick() {
		newBook = {
			id: id,
			bookTitle: '',
			bookURL: '',
			bookImageURL: '',
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
					<span>{book.bookTitle}</span>
					<span>{book.URL}</span>
					<span>{book.bookImageURL}</span>
					<span>{book.description}</span>
					<button on:click={() => handleEditButtonClick(book)}>編集</button>
					<button on:click={() => handleDeleteButtonClick(book)}>削除</button>
				</div>
			{:else}
				<div>
					<input bind:value={editingBook.bookTitle} placeholder="タイトル" />
					<input bind:value={editingBook.bookURL} placeholder="URL" />
					<input bind:value={editingBook.bookImageURL} placeholder="画像URL" />
					<input bind:value={editingBook.description} placeholder="紹介文" />
					<button on:click={() => handleEditConfirmButton(book)}>更新</button>
					<button on:click={handleCancelButton}>キャンセル</button>
				</div>
			{/if}
		{/each}
	{/if}
	{#if newBook}
		<div>
			<input bind:value={newBook.bookTitle} placeholder="タイトル" />
			<input bind:value={newBook.bookURL} placeholder="URL" />
			<input bind:value={newBook.bookImageURL} placeholder="画像URL" />
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
