<script>
	import { createClient } from '@supabase/supabase-js';
	import { API_URL, SUPABASE_URL, SUPABASE_KEY } from '$lib/Env';

	const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

	var books = [];
	var userName;
	var userId;
	var id = 0;

	async function initialize() {
		const user = supabase.auth.user();
		if (user) {
			userId = user.id;
			userName = user.user_metadata.user_name;
			const { data, error } = await supabase
				.from('users')
				.upsert({ user_id: user.id, user_name: user.user_metadata.user_name });
			console.log(data);
			console.log(error);

			let { data: proceeds, error_select } = await supabase
				.from('proceed')
				.select('*')
				.eq('user_id', userId);
			console.log(proceeds);

			const initialBooks = [];
			for (var d of proceeds) {
				console.log(d);
				initialBooks.push({
					id: d.book_id,
					bookTitle: d.title,
					bookURL: d.url,
					bookImageURL: d.image_url,
					proceed: d.proceed,
					total: d.total
				});

				if (id < d.book_id) {
					id = d.book_id;
				}
				id += 1;
			}

			books = initialBooks.filter((book) => book.proceed < book.total);
			console.log(books);
		}
	}

	initialize();

	var newBook;
	var editingBook;

	function handleEditConfirmButton() {
		const newBooks = [];
		var before_proceed = 0;
		for (var book of books) {
			if (editingBook.id !== book.id) {
				newBooks.push(book);
			} else {
				newBooks.push(editingBook);
				before_proceed = book.proceed;
			}
		}

		books = [...newBooks];
		updateProceed(before_proceed, editingBook);
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

	function handleEditButtonClick(book) {
		editingBook = { ...book };
	}

	function hancleAddButtonClick() {
		newBook = {
			id: id,
			bookTitle: '',
			bookURL: '',
			bookImageURL: '',
			proceed: 0,
			total: 0
		};
	}

	async function handleInputURL() {
		if (editingBook) {
			try {
				const r = await fetch(API_URL + `/autofill?url=${editingBook.bookURL}`);
				const data = await r.json();

				if ('url' in data) {
					editingBook.bookURL = data['url'];
				}

				if ('title' in data) {
					editingBook.bookTitle = data['title'];
				}

				if ('imageURL' in data) {
					editingBook.bookImageURL = data['imageURL'];
				}

				if ('total' in data) {
					editingBook.total = data['total'];
				}
			} catch (e) {
				console.log(e);
			}
		}

		if (newBook) {
			try {
				const r = await fetch(API_URL + `/autofill?url=${newBook.bookURL}`);
				const data = await r.json();

				if ('url' in data) {
					newBook.bookURL = data['url'];
				}

				if ('title' in data) {
					newBook.bookTitle = data['title'];
				}

				if ('imageURL' in data) {
					newBook.bookImageURL = data['imageURL'];
				}

				if ('total' in data) {
					newBook.total = data['total'];
				}
			} catch (e) {
				console.log(e);
			}
		}
	}

	async function updateProceed(before_proceed, book) {
		var { data, error } = await supabase.from('proceed_log').insert([
			{
				user_id: userId,
				book_id: book.id,
				title: book.bookTitle,
				url: book.bookURL,
				image_url: book.bookImageURL,
				before_proceed: before_proceed,
				after_proceed: book.proceed,
				total: book.total
			}
		]);
		console.log(data);
		console.log(error);

		var { data, error } = await supabase.from('proceed').upsert({
			user_id: userId,
			book_id: book.id,
			title: book.bookTitle,
			url: book.bookURL,
			image_url: book.bookImageURL,
			proceed: book.proceed,
			total: book.total,
			updated_at: 'now()'
		});
		console.log(data);
		console.log(error);
	}

	function handleAddConfirmButton() {
		books = [...books, newBook];
		id += 1;
		updateProceed(0, newBook);
		newBook = null;
	}

	function handleCancelButton() {
		editingBook = null;
		newBook = null;
	}

	async function handleLoginButton() {
		const { user, session, error } = await supabase.auth.signIn({
			provider: 'twitter'
		});
	}
</script>

{#if !userId}
	<button on:click={handleLoginButton}>Login</button>
{:else}
	<div>{userName}</div>
{/if}
<div>
	{#if books}
		{#each books as book, id (book.id)}
			{#if !editingBook || book.id !== editingBook.id}
				<div>
					<span>#{book.id}</span>
					<span>{book.bookTitle}</span>
					<span>{book.bookURL}</span>
					<span>{book.bookImageURL}</span>
					<span>{book.proceed}/{book.total}</span>
					<button on:click={() => handleEditButtonClick(book)}>編集</button>
					<button on:click={() => handleDeleteButtonClick(book)}>削除</button>
				</div>
			{:else}
				<div>
					<input bind:value={editingBook.bookURL} placeholder="URL" />
					<input bind:value={editingBook.bookTitle} placeholder="タイトル" />
					<input bind:value={editingBook.bookImageURL} placeholder="画像URL" />
					<input bind:value={editingBook.proceed} placeholder="進捗" />
					<input bind:value={editingBook.total} placeholder="作業量" />
					<button on:click={handleInputURL}>AutoFill</button>
					<button on:click={() => handleEditConfirmButton(book)}>更新</button>
					<button on:click={handleCancelButton}>キャンセル</button>
				</div>
			{/if}
		{/each}
	{/if}
	{#if newBook}
		<div>
			<input bind:value={newBook.bookURL} placeholder="URL" />
			<input bind:value={newBook.bookTitle} placeholder="タイトル" />
			<input bind:value={newBook.bookImageURL} placeholder="画像URL" />
			<input bind:value={newBook.proceed} placeholder="進捗" />
			<input bind:value={newBook.total} placeholder="作業量" />
			<button on:click={handleInputURL}>AutoFill</button>
			<button on:click={handleAddConfirmButton}>確定</button>
			<button on:click={handleCancelButton}>キャンセル</button>
		</div>
	{/if}
</div>
{#if !newBook}
	<button on:click={hancleAddButtonClick}>追加</button>
{/if}
