<script context="module">
	export async function load({ page, fetch }) {
		console.log(page);
		return {
			props: {
				userName: page.params.userName,
				startDate: page.params.start,
				endDate: page.params.end
			}
		};
	}
</script>

<script>
	import { LAMBDA_URL } from '$lib/Env';
	import Chart from 'svelte-frappe-charts';

	function dateToString(d) {
		const year = d.getFullYear().toString();
		const month = (d.getMonth() + 1).toString().padStart(2, '0');
		const date = d.getDate().toString().padStart(2, '0');
		return year + '-' + month + '-' + date;
	}

	function yyyymmddToDate(s) {
		return new Date(parseInt(s.slice(0, 4)), parseInt(s.slice(4, 6)) - 1, parseInt(s.slice(6, 8)));
	}

	function calcDateRange(start_date, end_date) {
		const days = [];
		let d = new Date(start_date.getFullYear(), start_date.getMonth(), start_date.getDate());
		while (d <= end_date) {
			days.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
			d.setDate(d.getDate() + 1);
		}
		return days;
	}

	// ZをつけるとUTC扱いにできる

	async function getProceedLog(userName, startDate, endDate) {
		const URL = LAMBDA_URL + `/proceed?user_name=${userName}&date_range=${startDate}-${endDate}`;
		const r = await fetch(URL, { method: 'GET' });
		const data = await r.json();
		console.log(data);

		const startDate_d = new Date(yyyymmddToDate(startDate));
		const endDate_d = new Date(yyyymmddToDate(endDate));
		const dateRange = calcDateRange(startDate_d, endDate_d);

		const xAxis = dateRange.map((d) => dateToString(d));

		const proceeds = {};
		for (var bookId of Object.keys(data['summary'])) {
			proceeds[bookId] = Array.from(Array(xAxis.length).keys()).map((x) => 0);
		}
		const totals = Array.from(Array(xAxis.length).keys()).map((x) => 0);

		for (var proceed of data['proceeds']) {
			const yyyy_mm_dd = dateToString(new Date(proceed[7] + 'Z'));
			const bookId = proceed[0];
			const total = data['summary'][bookId]['total'];
			proceeds[bookId][xAxis.indexOf(yyyy_mm_dd)] += (proceed[5] / total) * 100;
			totals[xAxis.indexOf(yyyy_mm_dd)] += ((proceed[5] - proceed[4]) / total) * 100;
		}

		for (var bookId of Object.keys(proceeds)) {
			if (proceeds[bookId][0] === 0) {
				proceeds[bookId][0] =
					(data['summary'][bookId]['inital'] / data['summary'][bookId]['total']) * 100;
			}

			for (var i = 1; i < xAxis.length; i++) {
				if (proceeds[bookId][i] === 0) {
					proceeds[bookId][i] = proceeds[bookId][i - 1];
				}
			}
		}

		proceedData = {
			labels: xAxis,
			datasets: Object.keys(proceeds).map((key) =>
				Object.fromEntries(
					new Map([
						['name', data['summary'][key]['title']],
						['values', proceeds[key]]
					])
				)
			)
		};

		total = {
			labels: xAxis,
			datasets: [
				{
					name: 'total',
					values: totals
				}
			]
		};
	}

	export let userName;
	export let startDate;
	export let endDate;
	let total;
	let proceedData;
	getProceedLog(userName, startDate, endDate);
</script>

{#if total}
	<Chart data={total} type="bar" />
	<Chart data={proceedData} type="line" />
{/if}
